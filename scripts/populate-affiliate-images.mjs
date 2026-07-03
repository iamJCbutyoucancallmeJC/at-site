// populate-affiliate-images.mjs  (t828 -- AT affiliate shop: durable image pass)
//
// Fills the `image_url` field on every Affiliate Pick metaobject with Amazon's
// OWN sanctioned product image, sourced via the Product Advertising API (PA-API v5)
// GetItems operation. This is the compliant image path per the affiliate-shop PRD
// (2026-06-20, Decision on product imagery): use Amazon-provided assets
// (SiteStripe or PA-API) ONLY -- NEVER scrape a listing image.
//
// It does not hardcode the 40 ASINs: it reads them back out of the existing
// `amazon_url` fields, so it also covers any NEW pick Amy adds later. Re-running
// is safe and idempotent (updates image_url in place; skips picks that already
// have one unless --force).
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to write to Shopify.
//   - --force re-fetches + overwrites picks that already have an image_url.
//   - --limit N processes only the first N picks (use --limit 1 on the FIRST
//     real run to validate PA-API signing before spending the whole batch).
//
// CREDENTIALS (in .env.local next to the Shopify admin creds this repo already uses)
//   PAAPI_ACCESS_KEY   = Amazon PA-API access key   (from Amy's Associates account)
//   PAAPI_SECRET_KEY   = Amazon PA-API secret key
//   PAAPI_PARTNER_TAG  = Associates store id         (default: atwbsite-20)
//   SHOPIFY_ADMIN_CLIENT_ID / SHOPIFY_ADMIN_CLIENT_SECRET / SHOPIFY_STORE_DOMAIN
//
// To get the PA-API keys: log into Amy's Amazon Associates account ->
//   Tools -> Product Advertising API -> "Manage credentials" -> add credentials.
//   (PA-API access requires the account to have qualifying sales; Amy's active
//    affiliate practice should satisfy this.)
//
// RUN
//   node scripts/populate-affiliate-images.mjs                 # dry run, all picks
//   node scripts/populate-affiliate-images.mjs --limit 1 --execute   # smoke test 1
//   node scripts/populate-affiliate-images.mjs --execute            # write all
//   node scripts/populate-affiliate-images.mjs --force --execute    # re-fetch all

import { readFileSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";

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

const PAAPI_ACCESS = get("PAAPI_ACCESS_KEY");
const PAAPI_SECRET = get("PAAPI_SECRET_KEY");
const PARTNER_TAG = get("PAAPI_PARTNER_TAG") || "atwbsite-20";
// US marketplace endpoint. (For a non-US store swap host/region/marketplace.)
const PAAPI_HOST = "webservices.amazon.com";
const PAAPI_REGION = "us-east-1";
const MARKETPLACE = "www.amazon.com";

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

// ---- PA-API v5 GetItems (AWS SigV4-signed) ------------------------------
const sha256hex = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const hmac = (key, s) => createHmac("sha256", key).update(s, "utf8").digest();

function signingKey(secret, dateStamp, region, service) {
  const kDate = hmac("AWS4" + secret, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

async function getItems(asins) {
  const service = "ProductAdvertisingAPI";
  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
  const path = "/paapi5/getitems";
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);

  const payload = JSON.stringify({
    PartnerTag: PARTNER_TAG,
    PartnerType: "Associates",
    Marketplace: MARKETPLACE,
    ItemIdType: "ASIN",
    ItemIds: asins,
    Resources: ["Images.Primary.Large", "ItemInfo.Title"],
  });

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${PAAPI_HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";
  const canonicalRequest = [
    "POST", path, "", canonicalHeaders, signedHeaders, sha256hex(payload),
  ].join("\n");

  const scope = `${dateStamp}/${PAAPI_REGION}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(PAAPI_SECRET, dateStamp, PAAPI_REGION, service))
    .update(stringToSign, "utf8").digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${PAAPI_ACCESS}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${PAAPI_HOST}${path}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      "host": PAAPI_HOST,
      "x-amz-date": amzDate,
      "x-amz-target": target,
      "Authorization": authorization,
    },
    body: payload,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`PA-API ${res.status}: ${JSON.stringify(j).slice(0, 400)}`);
  const map = {};
  for (const it of j.ItemsResult?.Items || []) {
    const url = it.Images?.Primary?.Large?.URL;
    if (url) map[it.ASIN] = url;
  }
  // PA-API reports per-item failures (bad/absent ASIN) in a separate Errors array.
  for (const e of j.Errors || []) console.warn("  PA-API item error:", e.Code, e.Message);
  return map;
}

const asinOf = (url) => (url.match(/\/dp\/([A-Z0-9]{10})/) || [])[1];
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- main ---------------------------------------------------------------
(async () => {
  for (const [k, v] of Object.entries({ SHOPIFY_ADMIN_CLIENT_ID: CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET: CLIENT_SECRET, PAAPI_ACCESS_KEY: PAAPI_ACCESS, PAAPI_SECRET_KEY: PAAPI_SECRET })) {
    if (!v) { console.error(`Missing ${k} in .env.local / env.`); process.exit(1); }
  }
  console.log(`Mode: ${EXECUTE ? "EXECUTE (writes live)" : "DRY-RUN"}${FORCE ? " +force" : ""}  partner=${PARTNER_TAG}`);

  const token = await mintAdminToken();
  const picks = await allPicks(token);
  const targets = picks
    .map((p) => ({ ...p, asin: asinOf(p.amazon_url) }))
    .filter((p) => p.asin && (FORCE || !p.image_url))
    .slice(0, LIMIT);

  const skipped = picks.length - targets.length;
  console.log(`${picks.length} picks total; ${targets.length} to fetch, ${skipped} skipped (already have image_url or no ASIN).`);
  if (!targets.length) return;

  // fetch images in batches of 10 (PA-API max ItemIds per GetItems)
  const images = {};
  for (const batch of chunk(targets.map((t) => t.asin), 10)) {
    const map = await getItems(batch);
    Object.assign(images, map);
    console.log(`  fetched ${Object.keys(map).length}/${batch.length} images`);
    await sleep(1100); // stay under the 1 TPS default
  }

  let wrote = 0, missing = 0;
  for (const t of targets) {
    const url = images[t.asin];
    if (!url) { console.warn(`  NO IMAGE  ${t.asin} (${t.handle})`); missing++; continue; }
    if (EXECUTE) { await setImageUrl(token, t.id, url); wrote++; }
    console.log(`  ${EXECUTE ? "wrote" : "would write"}  ${t.asin}  ${url}`);
  }
  console.log(`\nDone. ${EXECUTE ? "Wrote" : "Would write"} ${EXECUTE ? wrote : targets.length - missing} image_url(s); ${missing} with no image returned.`);
  if (!EXECUTE) console.log("Re-run with --execute to write. Use --limit 1 --execute first to validate signing.");
})().catch((e) => { console.error(e); process.exit(1); });
