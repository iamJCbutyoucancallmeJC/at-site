// populate-affiliate-images.mjs  (t828 -- AT affiliate shop: durable image pass)
//
// Fills the `image_url` field on every Affiliate Pick metaobject with Amazon's
// OWN sanctioned product image, sourced via the **Amazon Creators API** getItems
// operation. This is the compliant image path per the affiliate-shop PRD
// (2026-06-20): Amazon-provided assets ONLY, never a scraped listing image.
//
// NOTE (2026-07-03): Amazon retired PA-API 5.0 on 2026-05-15 and moved affiliates
// to the Creators API. This replaces the earlier PA-API/SigV4 version. Auth is now
// OAuth2 client-credentials (an "app" in Associates Central issues a Credential ID
// + Secret; we mint a short-lived Bearer token from them).
//
// It reads the ASINs back out of the existing `amazon_url` fields, so it also
// covers any NEW pick Amy adds later. Idempotent: updates image_url in place and
// skips picks that already have one (unless --force).
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to write to Shopify.
//   - --limit N processes only the first N picks. Use --limit 1 --execute on the
//     FIRST real run: it prints the raw Creators API response so we can confirm
//     the image field path + that auth/eligibility work before the full batch.
//   - --force re-fetches + overwrites picks that already have an image_url.
//
// CREDENTIALS (in .env.local next to the Shopify admin creds this repo already uses)
//   CREATORS_CREDENTIAL_ID     = app's Credential ID   (amzn1.application-oa2-client...)
//   CREATORS_CREDENTIAL_SECRET = app's Credential Secret (amzn1.oa2-cs.v1...)
//   CREATORS_PARTNER_TAG       = associate/store tag    (default: wwwamytangeri-20)
//   SHOPIFY_ADMIN_CLIENT_ID / SHOPIFY_ADMIN_CLIENT_SECRET / SHOPIFY_STORE_DOMAIN
//
// Where the credentials come from: Associates Central -> the Creators API app
// (ApplicationId wwwamytangeri-20.atsiteaffiliate) -> Credential ID + Secret.
//
// RUN
//   node scripts/populate-affiliate-images.mjs                       # dry run, all
//   node scripts/populate-affiliate-images.mjs --limit 1 --execute   # validate 1 + dump raw
//   node scripts/populate-affiliate-images.mjs --execute             # write all
//   node scripts/populate-affiliate-images.mjs --force --execute     # re-fetch all

import { readFileSync } from "node:fs";

// ---- env ----------------------------------------------------------------
const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* fall back to process.env */ }
const get = (k) => process.env[k] || env[k];

const DOMAIN = get("SHOPIFY_STORE_DOMAIN") || "q9x1sj-hc.myshopify.com";
const CLIENT_ID = get("SHOPIFY_ADMIN_CLIENT_ID");
const CLIENT_SECRET = get("SHOPIFY_ADMIN_CLIENT_SECRET");
const API = "2026-07";
const PICK_TYPE = "app--345947701249--affiliate_pick";

const CRED_ID = get("CREATORS_CREDENTIAL_ID");
const CRED_SECRET = get("CREATORS_CREDENTIAL_SECRET");
const PARTNER_TAG = get("CREATORS_PARTNER_TAG") || "wwwamytangeri-20";
const TOKEN_ENDPOINT = get("CREATORS_TOKEN_ENDPOINT") || "https://api.amazon.com/auth/o2/token";
const SCOPE = get("CREATORS_SCOPE") || "creatorsapi::default";
const CREATORS_HOST = get("CREATORS_HOST") || "creatorsapi.amazon";
const MARKETPLACE = get("CREATORS_MARKETPLACE") || "www.amazon.com";

const EXECUTE = process.argv.includes("--execute");
const FORCE = process.argv.includes("--force");
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

// ---- Shopify admin ------------------------------------------------------
async function mintAdminToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("admin token mint failed: " + JSON.stringify(j));
  return j.access_token;
}

async function adminQ(token, query, variables) {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error("admin GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}

async function allPicks(token) {
  const picks = [];
  let after = null;
  do {
    const d = await adminQ(token, `query($type: String!, $after: String) {
      metaobjects(type: $type, first: 50, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { id handle fields { key value } }
      }
    }`, { type: PICK_TYPE, after });
    for (const n of d.metaobjects.nodes) {
      const f = Object.fromEntries(n.fields.map((x) => [x.key, x.value]));
      picks.push({ id: n.id, handle: n.handle, amazon_url: f.amazon_url || "", image_url: f.image_url || "" });
    }
    after = d.metaobjects.pageInfo.hasNextPage ? d.metaobjects.pageInfo.endCursor : null;
  } while (after);
  return picks;
}

async function setImageUrl(token, id, url) {
  const d = await adminQ(token, `mutation($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }`, { id, metaobject: { fields: [{ key: "image_url", value: url }] } });
  const errs = d.metaobjectUpdate.userErrors;
  if (errs && errs.length) throw new Error("metaobjectUpdate: " + JSON.stringify(errs));
}

// ---- Amazon Creators API ------------------------------------------------
let _tokenCache = null; // { token, exp }
async function creatorsToken() {
  if (_tokenCache && Date.now() < _tokenCache.exp) return _tokenCache.token;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CRED_ID,
    client_secret: CRED_SECRET,
    scope: SCOPE,
  });
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const j = await res.json();
  if (!res.ok || !j.access_token) throw new Error(`Creators token mint failed (${res.status}): ` + JSON.stringify(j).slice(0, 400));
  _tokenCache = { token: j.access_token, exp: Date.now() + ((j.expires_in || 3600) - 60) * 1000 };
  return _tokenCache.token;
}

// Pull the Large primary image URL from an item, tolerant of casing variants
// (the Creators API mirrors PA-API's shape but in lowerCamelCase).
function imageOf(item) {
  const img = item.images || item.Images;
  const primary = img?.primary || img?.Primary;
  const large = primary?.large || primary?.Large;
  return large?.url || large?.URL || null;
}
const asinField = (item) => item.asin || item.ASIN;

async function getItems(asins, { debug = false } = {}) {
  const token = await creatorsToken();
  const payload = JSON.stringify({
    partnerTag: PARTNER_TAG,
    partnerType: "Associates",
    marketplace: MARKETPLACE,
    itemIdType: "ASIN",
    itemIds: asins,
    resources: ["images.primary.large", "itemInfo.title"],
  });
  const res = await fetch(`https://${CREATORS_HOST}/catalog/v1/getItems`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-marketplace": MARKETPLACE,
    },
    body: payload,
  });
  const text = await res.text();
  if (debug) console.log("--- raw getItems response ---\n" + text.slice(0, 2000) + "\n-----------------------------");
  let j;
  try { j = JSON.parse(text); } catch { throw new Error(`Creators getItems ${res.status}: non-JSON: ${text.slice(0, 300)}`); }
  if (!res.ok) throw new Error(`Creators getItems ${res.status}: ${JSON.stringify(j).slice(0, 400)}`);
  const items = j.itemsResult?.items || j.ItemsResult?.Items || [];
  const map = {};
  for (const it of items) {
    const asin = asinField(it);
    const url = imageOf(it);
    if (asin && url) map[asin] = url;
  }
  for (const e of j.errors || j.Errors || []) console.warn("  Creators item error:", e.code || e.Code, e.message || e.Message);
  return map;
}

const asinOf = (url) => (url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1];
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- main ---------------------------------------------------------------
(async () => {
  for (const [k, v] of Object.entries({ SHOPIFY_ADMIN_CLIENT_ID: CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET: CLIENT_SECRET, CREATORS_CREDENTIAL_ID: CRED_ID, CREATORS_CREDENTIAL_SECRET: CRED_SECRET })) {
    if (!v) { console.error(`Missing ${k} in .env.local / env.`); process.exit(1); }
  }
  console.log(`Mode: ${EXECUTE ? "EXECUTE (writes live)" : "DRY-RUN"}${FORCE ? " +force" : ""}  partner=${PARTNER_TAG}  api=CreatorsAPI`);

  const token = await mintAdminToken();
  const picks = await allPicks(token);
  const targets = picks
    .map((p) => ({ ...p, asin: asinOf(p.amazon_url) }))
    .filter((p) => p.asin && (FORCE || !p.image_url))
    .slice(0, LIMIT);

  const skipped = picks.length - targets.length;
  console.log(`${picks.length} picks total; ${targets.length} to fetch, ${skipped} skipped (already have image_url or no ASIN).`);
  if (!targets.length) return;

  // fetch images in batches of 10; dump the raw response on a --limit smoke test
  const debugRaw = Number.isFinite(LIMIT);
  const images = {};
  for (const batch of chunk(targets.map((t) => t.asin), 10)) {
    const map = await getItems(batch, { debug: debugRaw });
    Object.assign(images, map);
    console.log(`  fetched ${Object.keys(map).length}/${batch.length} images`);
    await sleep(1100);
  }

  let wrote = 0, missing = 0;
  for (const t of targets) {
    const url = images[t.asin];
    if (!url) { console.warn(`  NO IMAGE  ${t.asin} (${t.handle})`); missing++; continue; }
    if (EXECUTE) { await setImageUrl(token, t.id, url); wrote++; }
    console.log(`  ${EXECUTE ? "wrote" : "would write"}  ${t.asin}  ${url}`);
  }
  console.log(`\nDone. ${EXECUTE ? "Wrote" : "Would write"} ${EXECUTE ? wrote : targets.length - missing} image_url(s); ${missing} with no image returned.`);
  if (!EXECUTE) console.log("Re-run with --execute to write. Use --limit 1 --execute first to validate auth + confirm the image field path.");
})().catch((e) => { console.error(e); process.exit(1); });
