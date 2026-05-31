#!/usr/bin/env node
/**
 * publish-intl-catalog.js
 *
 * Publish the non-Happy-Mail one-time products (currently US-market-only) to
 * the International market publication so CA/AU/GB visitors can see and buy
 * them.
 *
 * Background (launch day 2026-05-29):
 *   Shopify products carry TWO independent visibility flags:
 *     - status (DRAFT / ACTIVE / ARCHIVED) -- admin visibility
 *     - publication assignments            -- which sales channels / markets
 *       can read it (see shopify-admin-api.md Gotcha 3)
 *   The International market reads from its own publication. Products published
 *   only to US are invisible to international visitors until explicitly
 *   published to the International publication via `publishablePublish`.
 *
 * What this does:
 *   1. Authenticate (client_credentials -> 24-hr admin token).
 *   2. Pull the full catalog (all statuses) via REST.
 *   3. Determine, per product, whether it is published to the US publication
 *      and whether it is published to the International publication TODAY.
 *   4. Compute the DELTA: products published to US but NOT to International,
 *      EXCLUDING the two Happy Mail handles:
 *        - `happy-mail`               (canonical US-only $13 HM; MUST stay US-only)
 *        - `happy-mail-international`  (already on the International publication)
 *   5. DEFAULT (no flag): print the dry-run delta table, mutate NOTHING.
 *      WITH --execute: run publishablePublish for each delta product against the
 *      International publication, printing success / failure / ALREADY per product
 *      and reporting any userErrors. Idempotent: re-running --execute is harmless.
 *
 * Usage:
 *   node scripts/publish-intl-catalog.js              # DRY RUN (default, no writes)
 *   node scripts/publish-intl-catalog.js --execute    # perform the publishes
 *   node scripts/publish-intl-catalog.js --json        # also dump a machine log file
 *
 * Safety:
 *   - Dry run is the default. --execute is OFF unless explicitly passed.
 *   - happy-mail is hard-excluded by handle (must stay US-only). Even if it
 *     somehow appeared in the delta, EXCLUDE_HANDLES blocks it.
 *   - Draft/archived products in the delta are flagged and NOT published
 *     (we don't want to leak a draft product to the international market).
 *   - publishablePublish is naturally idempotent; we also pre-check
 *     publishedOnPublication so already-published products report ALREADY.
 *
 * Credentials: read from /Users/JCCangilla/at-site/.env.local
 *   SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET, SHOPIFY_STORE_DOMAIN
 *   (full secrets/tokens are never printed).
 *
 * References:
 *   - shopify-admin-api.md (Gotcha 3: publish vs status; UserError schema varies)
 *   - cleanup-shopify-publication-state-2026-05-28.py (verified publishableUnpublish
 *     pattern; this is the inverse mutation)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --------------------------------------------------------------------------- //
// Configuration                                                               //
// --------------------------------------------------------------------------- //

const ENV_PATH = path.join(__dirname, '..', '.env.local');

// Admin GraphQL API version. The task brief specifies 2025-04. The store's
// vault doc (shopify-admin-api.md) notes the live version is 2026-04; if 2025-04
// is rejected, this falls back automatically (see resolveApiVersion()).
const PRIMARY_API_VERSION = '2025-04';
const FALLBACK_API_VERSION = '2026-04';

// International market publication (confirmed in prior audit, per task brief).
const INTL_PUBLICATION_GID = 'gid://shopify/Publication/296162001216';

// Handles that must NEVER be published to the International publication by this
// script. happy-mail = canonical US-only $13 HM (stays US-only). The intl HM
// product is already on the International publication.
const EXCLUDE_HANDLES = new Set(['happy-mail', 'happy-mail-international']);

const SLEEP_MS = 250; // gentle pacing between API calls

// --------------------------------------------------------------------------- //
// .env.local loader (no dependency)                                           //
// --------------------------------------------------------------------------- //

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    fail(`.env.local not found at ${envPath}`);
  }
  const out = {};
  const text = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    // strip surrounding quotes if present
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function redact(secret) {
  if (!secret) return '(missing)';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-2)} (len ${secret.length})`;
}

function fail(msg) {
  console.error(`\nERROR: ${msg}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --------------------------------------------------------------------------- //
// Shopify API helpers                                                         //
// --------------------------------------------------------------------------- //

async function getToken(storeDomain, clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(`https://${storeDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    fail(
      `auth failed (HTTP ${res.status}). ` +
        `Check SHOPIFY_ADMIN_CLIENT_ID / SHOPIFY_ADMIN_CLIENT_SECRET. ` +
        `Response: ${JSON.stringify(json).slice(0, 300)}`
    );
  }
  return json; // { access_token, scope, ... }
}

function makeGraphQL(storeDomain, apiVersion, token) {
  const url = `https://${storeDomain}/admin/api/${apiVersion}/graphql.json`;
  return async function graphql(query, variables = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      json = { _raw: await res.text().catch(() => '') };
    }
    return { status: res.status, body: json };
  };
}

function makeRest(storeDomain, apiVersion, token) {
  return async function rest(method, pathAndQuery, body = null) {
    const url = `https://${storeDomain}/admin/api/${apiVersion}/${pathAndQuery}`;
    const res = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      json = { _raw: await res.text().catch(() => '') };
    }
    return { status: res.status, body: json };
  };
}

/**
 * Resolve which API version actually works for GraphQL. Tries PRIMARY first
 * (2025-04 per brief); if a trivial query 4xxs in a way that indicates an
 * unknown version, falls back to 2026-04 (the store's documented live version).
 */
async function resolveApiVersion(storeDomain, token) {
  const probe = '{ shop { name } }';
  for (const version of [PRIMARY_API_VERSION, FALLBACK_API_VERSION]) {
    const gql = makeGraphQL(storeDomain, version, token);
    const { status, body } = await gql(probe);
    const shopName = body && body.data && body.data.shop && body.data.shop.name;
    if (status < 400 && shopName) {
      return { version, shopName };
    }
    console.log(
      `  [api] version ${version} probe -> HTTP ${status}` +
        (body && body.errors ? ` (${JSON.stringify(body.errors).slice(0, 160)})` : '') +
        '; trying next.'
    );
  }
  fail(
    `Neither ${PRIMARY_API_VERSION} nor ${FALLBACK_API_VERSION} responded to a ` +
      `basic { shop { name } } probe. Check token / scopes.`
  );
}

// --------------------------------------------------------------------------- //
// Catalog + publication state                                                 //
// --------------------------------------------------------------------------- //

/**
 * Fetch every product (all statuses) via REST. The AT catalog is small
 * (~99 products across statuses) so a full pull + client-side filtering is
 * robust and cheap. We capture id, handle, title, status, and a sellable
 * signal (variant inventory / availability) per product.
 */
async function fetchAllProducts(rest) {
  const products = [];
  for (const status of ['active', 'draft', 'archived']) {
    const resp = await rest('GET', `products.json?limit=250&status=${status}`);
    if (resp.status >= 400) {
      console.log(
        `  [warn] products.json status=${status} -> HTTP ${resp.status}`
      );
      continue;
    }
    products.push(...(resp.body.products || []));
    await sleep(SLEEP_MS);
  }
  return products;
}

/**
 * For a product GID, report whether it is published to US publication and to
 * the International publication. Uses two publishedOnPublication checks.
 *
 * Also fetches availableForSale + totalInventory + tracksInventory so the
 * dry-run table can flag products that aren't sellable.
 */
const PRODUCT_PUB_QUERY = `
  query($id: ID!, $usPub: ID!, $intlPub: ID!) {
    product(id: $id) {
      id
      handle
      title
      status
      totalInventory
      tracksInventory
      publishedOnUS: publishedOnPublication(publicationId: $usPub)
      publishedOnIntl: publishedOnPublication(publicationId: $intlPub)
      variants(first: 50) {
        edges { node { id availableForSale inventoryQuantity } }
      }
    }
  }
`;

async function getProductPubState(graphql, productGid, usPubGid) {
  const { status, body } = await graphql(PRODUCT_PUB_QUERY, {
    id: productGid,
    usPub: usPubGid,
    intlPub: INTL_PUBLICATION_GID,
  });
  if (status >= 400 || (body && body.errors)) {
    return { ok: false, status, errors: (body && body.errors) || body, product: null };
  }
  const product = body && body.data && body.data.product;
  return { ok: true, status, errors: null, product };
}

/**
 * Find the US market's publication GID. The US market is the home market.
 * We enumerate publications and pick the one whose catalog/market looks like
 * US, falling back to the "Online Store" channel publication if market-typed
 * publications aren't exposed.
 *
 * Returns { gid, label, all: [...] }.
 */
const PUBLICATIONS_QUERY = `
  query {
    publications(first: 50) {
      edges {
        node {
          id
          name
          catalog {
            id
            title
            ... on MarketCatalog {
              markets(first: 10) { edges { node { id name handle } } }
            }
          }
        }
      }
    }
  }
`;

async function listPublications(graphql) {
  const { status, body } = await graphql(PUBLICATIONS_QUERY);
  if (status >= 400 || (body && body.errors)) {
    return { ok: false, status, errors: (body && body.errors) || body, pubs: [] };
  }
  const edges =
    (body && body.data && body.data.publications && body.data.publications.edges) || [];
  const pubs = edges.map((e) => e.node);
  return { ok: true, status, errors: null, pubs };
}

function describePublication(node) {
  const markets =
    (node.catalog &&
      node.catalog.markets &&
      node.catalog.markets.edges.map((m) => m.node.name).join(', ')) ||
    '';
  return `${node.name}${markets ? ` [markets: ${markets}]` : ''} (${node.id})`;
}

// --------------------------------------------------------------------------- //
// Mutation                                                                    //
// --------------------------------------------------------------------------- //

const PUBLISH_MUTATION = `
  mutation publishToIntl($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        ... on Product { id status }
      }
      userErrors { field message }
    }
  }
`;

async function publishToIntl(graphql, productGid) {
  return graphql(PUBLISH_MUTATION, {
    id: productGid,
    input: [{ publicationId: INTL_PUBLICATION_GID }],
  });
}

// --------------------------------------------------------------------------- //
// Main                                                                        //
// --------------------------------------------------------------------------- //

function sellableSummary(product) {
  // product from GraphQL: variants.edges[].node.{availableForSale, inventoryQuantity}
  const edges = (product.variants && product.variants.edges) || [];
  const anyAvailable = edges.some((e) => e.node.availableForSale);
  const totalQty = edges.reduce(
    (sum, e) =>
      sum + (typeof e.node.inventoryQuantity === 'number' ? e.node.inventoryQuantity : 0),
    0
  );
  return { anyAvailable, totalQty, variantCount: edges.length };
}

async function main() {
  const args = process.argv.slice(2);
  const EXECUTE = args.includes('--execute');
  const WRITE_JSON = args.includes('--json');

  console.log('publish-intl-catalog.js');
  console.log(`Mode: ${EXECUTE ? 'EXECUTE (will publish)' : 'DRY RUN (default, no writes)'}`);
  console.log(`International publication: ${INTL_PUBLICATION_GID}`);
  console.log(`Excluded handles (never publish intl): ${[...EXCLUDE_HANDLES].join(', ')}`);

  // --- credentials ---
  const env = loadEnv(ENV_PATH);
  const clientId = env.SHOPIFY_ADMIN_CLIENT_ID;
  const clientSecret = env.SHOPIFY_ADMIN_CLIENT_SECRET;
  const storeDomain = env.SHOPIFY_STORE_DOMAIN || 'q9x1sj-hc.myshopify.com';
  if (!clientId || !clientSecret) {
    fail(
      'Missing SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET in .env.local'
    );
  }
  console.log(`Store: ${storeDomain}`);
  console.log(`Client ID: ${redact(clientId)}  Secret: ${redact(clientSecret)}`);

  // --- auth ---
  console.log('\n[auth] fetching admin token...');
  const tokenInfo = await getToken(storeDomain, clientId, clientSecret);
  const token = tokenInfo.access_token;
  const scopes = (tokenInfo.scope || '').split(',').filter(Boolean);
  const hasPublishScope = scopes.includes('write_publications');
  console.log(`  token acquired (${redact(token)})`);
  console.log(
    `  write_publications scope: ${
      hasPublishScope ? 'present' : 'NOT in scope list (trust functional test)'
    }`
  );

  // --- resolve working API version ---
  console.log('\n[api] resolving GraphQL API version...');
  const { version: apiVersion, shopName } = await resolveApiVersion(storeDomain, token);
  console.log(`  using ${apiVersion} (shop: ${shopName})`);

  const graphql = makeGraphQL(storeDomain, apiVersion, token);
  const rest = makeRest(storeDomain, apiVersion, token);

  // --- identify the US publication ---
  console.log('\n[publications] enumerating publications to identify US market...');
  const pubResult = await listPublications(graphql);
  if (!pubResult.ok) {
    fail(
      `could not list publications (HTTP ${pubResult.status}): ` +
        JSON.stringify(pubResult.errors).slice(0, 300)
    );
  }
  for (const p of pubResult.pubs) {
    const isIntl = p.id === INTL_PUBLICATION_GID;
    console.log(`  - ${describePublication(p)}${isIntl ? '   <- INTERNATIONAL (target)' : ''}`);
  }

  // Pick the US publication: a market-catalog publication whose market name/handle
  // looks like US/United States and is NOT the international one.
  function looksUS(node) {
    if (node.id === INTL_PUBLICATION_GID) return false;
    const blob = JSON.stringify(node).toLowerCase();
    return (
      blob.includes('united states') ||
      blob.includes('"us"') ||
      blob.includes('handle":"us') ||
      /\bus\b/.test((node.name || '').toLowerCase())
    );
  }
  let usPub = pubResult.pubs.find(looksUS);
  // Fallback: the Online Store publication (the at-site headless app reads from
  // it; documented gid 290470854976). Used as the "US catalog" proxy if no
  // market-typed US publication is exposed in the list.
  const ONLINE_STORE_GID = 'gid://shopify/Publication/290470854976';
  if (!usPub) {
    usPub =
      pubResult.pubs.find((p) => p.id === ONLINE_STORE_GID) ||
      pubResult.pubs.find((p) => (p.name || '').toLowerCase().includes('online store'));
  }
  if (!usPub) {
    fail(
      'Could not identify the US / home publication from the publications list. ' +
        'Inspect the list above and set the US publication GID explicitly.'
    );
  }
  const usPubGid = usPub.id;
  console.log(`\n  US/home publication chosen: ${describePublication(usPub)}`);

  // --- pull catalog ---
  console.log('\n[catalog] fetching all products (active/draft/archived)...');
  const allProducts = await fetchAllProducts(rest);
  console.log(`  ${allProducts.length} products total across statuses`);

  // --- compute per-product publication state + delta ---
  console.log('\n[delta] computing publication state per product...');
  const rows = []; // every product we examined
  for (const p of allProducts) {
    const gid = `gid://shopify/Product/${p.id}`;
    const pubState = await getProductPubState(graphql, gid, usPubGid);
    await sleep(SLEEP_MS);
    if (!pubState.ok || !pubState.product) {
      rows.push({
        handle: p.handle,
        title: p.title,
        status: p.status,
        productGid: gid,
        error: `pub-state query failed (HTTP ${pubState.status}): ${JSON.stringify(
          pubState.errors
        ).slice(0, 160)}`,
      });
      continue;
    }
    const prod = pubState.product;
    const sell = sellableSummary(prod);
    rows.push({
      handle: prod.handle,
      title: prod.title,
      status: prod.status, // ACTIVE / DRAFT / ARCHIVED
      productGid: prod.id,
      publishedOnUS: prod.publishedOnUS,
      publishedOnIntl: prod.publishedOnIntl,
      tracksInventory: prod.tracksInventory,
      totalInventory: prod.totalInventory,
      anyAvailableForSale: sell.anyAvailable,
      variantCount: sell.variantCount,
    });
  }

  // Delta = published on US, NOT on intl, NOT in EXCLUDE_HANDLES.
  const delta = rows.filter(
    (r) =>
      !r.error &&
      r.publishedOnUS === true &&
      r.publishedOnIntl === false &&
      !EXCLUDE_HANDLES.has(r.handle)
  );

  // willPublish: in delta AND status ACTIVE (don't publish drafts/archived intl).
  for (const r of delta) {
    const isActive = (r.status || '').toUpperCase() === 'ACTIVE';
    if (!isActive) {
      r.willPublish = false;
      r.reason = `status is ${r.status} -- not ACTIVE, skip (don't publish a non-active product intl)`;
    } else {
      r.willPublish = true;
      r.reason = r.anyAvailableForSale
        ? 'active + on US, not yet on intl'
        : 'active + on US, not yet on intl (note: no variant availableForSale right now)';
    }
  }

  // --- print dry-run table ---
  console.log('\n' + '='.repeat(112));
  console.log('DRY-RUN TABLE -- delta products (published US, NOT intl, excluding Happy Mail)');
  console.log('='.repeat(112));
  const H = (s, w) => String(s === undefined || s === null ? '' : s).padEnd(w).slice(0, w);
  console.log(
    H('handle', 42) +
      ' ' +
      H('title', 34) +
      ' ' +
      H('status', 9) +
      ' ' +
      H('intl?', 6) +
      ' ' +
      H('publish?', 9)
  );
  console.log('-'.repeat(112));
  for (const r of delta) {
    console.log(
      H(r.handle, 42) +
        ' ' +
        H(r.title, 34) +
        ' ' +
        H(r.status, 9) +
        ' ' +
        H(r.willPublish === false && (r.status || '').toUpperCase() !== 'ACTIVE' ? '-' : 'yes', 6) +
        ' ' +
        H(r.willPublish ? 'YES' : 'NO', 9)
    );
    if (!r.willPublish) {
      console.log(`${' '.repeat(2)}^ reason: ${r.reason}`);
    }
  }
  console.log('-'.repeat(112));

  const willPublishList = delta.filter((r) => r.willPublish);
  const skipList = delta.filter((r) => !r.willPublish);

  console.log(`\nDelta size (US-but-not-intl, ex Happy Mail): ${delta.length}`);
  console.log(`WOULD publish to International: ${willPublishList.length}`);
  if (skipList.length) {
    console.log(`Flagged / skipped (draft/archived in delta): ${skipList.length}`);
    for (const r of skipList) {
      console.log(`  - ${r.handle} (${r.title}) :: ${r.reason}`);
    }
  }

  // Sanity / safety reporting on the excluded HM handles.
  console.log('\nExcluded-handle safety check:');
  for (const h of EXCLUDE_HANDLES) {
    const found = rows.find((r) => r.handle === h);
    if (!found) {
      console.log(`  - ${h}: not found in catalog (ok)`);
    } else if (found.error) {
      console.log(`  - ${h}: present, pub-state query errored (${found.error})`);
    } else {
      console.log(
        `  - ${h}: present, status=${found.status}, on US=${found.publishedOnUS}, ` +
          `on intl=${found.publishedOnIntl} (will NOT be touched)`
      );
    }
  }

  // Report any products whose pub-state query errored.
  const errored = rows.filter((r) => r.error);
  if (errored.length) {
    console.log(`\n[warn] ${errored.length} products had pub-state query errors:`);
    for (const r of errored) console.log(`  - ${r.handle}: ${r.error}`);
  }

  // --- machine log (optional) ---
  if (WRITE_JSON) {
    const logPath = path.join(__dirname, 'publish-intl-catalog-log.json');
    fs.writeFileSync(
      logPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          mode: EXECUTE ? 'execute' : 'dry_run',
          apiVersion,
          intlPublication: INTL_PUBLICATION_GID,
          usPublication: usPubGid,
          excludedHandles: [...EXCLUDE_HANDLES],
          delta,
          willPublish: willPublishList.map((r) => r.handle),
          allRows: rows,
        },
        null,
        2
      )
    );
    console.log(`\n[json] wrote ${logPath}`);
  }

  // --- execute (gated) ---
  if (!EXECUTE) {
    console.log(
      '\nDRY RUN complete. NOTHING was mutated. ' +
        'Re-run with --execute to publish the listed products to International.'
    );
    return;
  }

  if (!willPublishList.length) {
    console.log('\n[execute] nothing to publish (delta is empty). No mutations performed.');
    return;
  }

  console.log('\n' + '='.repeat(72));
  console.log(`EXECUTE: publishing ${willPublishList.length} products to International`);
  console.log('='.repeat(72));

  const results = [];
  for (const r of willPublishList) {
    // Re-check current intl publication state right before mutating (idempotency).
    const fresh = await getProductPubState(graphql, r.productGid, usPubGid);
    await sleep(SLEEP_MS);
    if (fresh.ok && fresh.product && fresh.product.publishedOnIntl === true) {
      console.log(`  ALREADY  ${r.handle} (${r.title}) -- already on International, skipped`);
      results.push({ handle: r.handle, result: 'already' });
      continue;
    }

    const resp = await publishToIntl(graphql, r.productGid);
    await sleep(SLEEP_MS);
    const data =
      resp.body && resp.body.data && resp.body.data.publishablePublish
        ? resp.body.data.publishablePublish
        : null;
    const userErrors = (data && data.userErrors) || [];
    const transportErrors = resp.body && resp.body.errors;

    if (resp.status >= 400 || transportErrors) {
      console.log(`  FAIL     ${r.handle} (${r.title}) -- HTTP ${resp.status}`);
      console.log(`           ${JSON.stringify(transportErrors || resp.body).slice(0, 240)}`);
      results.push({ handle: r.handle, result: 'fail', detail: transportErrors || resp.body });
    } else if (userErrors.length) {
      console.log(`  FAIL     ${r.handle} (${r.title}) -- userErrors:`);
      for (const e of userErrors) console.log(`           [${(e.field || []).join('.')}] ${e.message}`);
      results.push({ handle: r.handle, result: 'fail', detail: userErrors });
    } else {
      console.log(`  OK       ${r.handle} (${r.title}) -- published to International`);
      results.push({ handle: r.handle, result: 'ok' });
    }
  }

  const ok = results.filter((r) => r.result === 'ok').length;
  const already = results.filter((r) => r.result === 'already').length;
  const failed = results.filter((r) => r.result === 'fail').length;
  console.log('\nEXECUTE SUMMARY:');
  console.log(`  published: ${ok}`);
  console.log(`  already:   ${already}`);
  console.log(`  failed:    ${failed}`);
  if (failed) {
    console.log('  -> Some publishes FAILED. Re-run (idempotent) after resolving the errors above.');
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error('\nUNCAUGHT ERROR:', err && err.stack ? err.stack : err);
  process.exit(1);
});
