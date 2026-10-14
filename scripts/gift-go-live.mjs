// gift-go-live.mjs  (t1739)
//
// WHY THIS EXISTS
//   The first two /gift checkouts (2026-10-09, 2026-10-10) failed in Shopify with
//   "Your order total has changed." Cause, proven 2026-10-10: the Recharge gift
//   product (15417705496896, "Give Happy Mail (Gift)") was never added to the
//   HM US Catalog (MarketCatalog 148247937344, publication 296161968448). The United
//   States market has exactly one catalog, so any product outside it is excluded from
//   the US market at checkout even when it is ACTIVE and on the Online Store channel.
//   (Same trap as FNF-H-03 on 2026-05-27; see feedback_shopify_marketcatalog_implicit_exclusion.)
//   Proof: Storefront @inContext(country: US) returned no product with Online Store
//   alone; returned availableForSale true, $72 USD once the catalog publish landed.
//
//   Setting the product to DRAFT drops its publications (Admin reads them back
//   empty), so every open MUST re-publish to BOTH Online Store and the US catalog.
//
// RUN
//   node scripts/gift-go-live.mjs --open     ACTIVE + Online Store + HM US Catalog, then verify
//   node scripts/gift-go-live.mjs --close    back to DRAFT (what the site's gate expects)
//   node scripts/gift-go-live.mjs            read-only: Admin status/publications + US/CA Storefront view
//
//   The site stays closed until GIFT_CHECKOUT_ENABLED in lib/gift.ts is true AND this
//   script reports US availableForSale: true at $72. Both are needed; neither alone opens /gift.

import { readFileSync } from "node:fs";

const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* process.env */ }
const get = (k) => process.env[k] || env[k];
const DOMAIN = get("SHOPIFY_STORE_DOMAIN") || "q9x1sj-hc.myshopify.com";
const API = "2026-07";
const PRODUCT = "gid://shopify/Product/15417705496896";
const HANDLE = "give-happy-mail-gift";
const ONLINE_STORE = "gid://shopify/Publication/290470854976";
const HM_US_CATALOG = "gid://shopify/Publication/296161968448";

async function mintAdminToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: get("SHOPIFY_ADMIN_CLIENT_ID"), client_secret: get("SHOPIFY_ADMIN_CLIENT_SECRET") }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("admin token mint failed");
  return j.access_token;
}
async function admin(token, query, variables) {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error("admin GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}
async function storefront(country) {
  const res = await fetch(`https://${DOMAIN}/api/${API}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": get("SHOPIFY_STOREFRONT_TOKEN") },
    body: JSON.stringify({
      query: `query($c: CountryCode!) @inContext(country: $c) { product(handle: "${HANDLE}") { availableForSale variants(first: 1) { nodes { id availableForSale price { amount currencyCode } } } } }`,
      variables: { c: country },
    }),
  });
  const j = await res.json();
  return j.data?.product ?? null;
}

const token = await mintAdminToken();
const mode = process.argv[2];

if (mode === "--open") {
  const u = await admin(token, `mutation { productUpdate(product: {id: "${PRODUCT}", status: ACTIVE}) { product { status } userErrors { message } } }`);
  if (u.productUpdate.userErrors.length) throw new Error(JSON.stringify(u.productUpdate.userErrors));
  for (const pub of [ONLINE_STORE, HM_US_CATALOG]) {
    const p = await admin(token, `mutation { publishablePublish(id: "${PRODUCT}", input: [{publicationId: "${pub}"}]) { userErrors { message } } }`);
    if (p.publishablePublish.userErrors.length) throw new Error(JSON.stringify(p.publishablePublish.userErrors));
  }
  console.log("opened: ACTIVE, published to Online Store + HM US Catalog; waiting for Storefront propagation");
  await new Promise((r) => setTimeout(r, 6000));
} else if (mode === "--close") {
  const u = await admin(token, `mutation { productUpdate(product: {id: "${PRODUCT}", status: DRAFT}) { product { status } userErrors { message } } }`);
  if (u.productUpdate.userErrors.length) throw new Error(JSON.stringify(u.productUpdate.userErrors));
  console.log("closed: DRAFT");
  await new Promise((r) => setTimeout(r, 6000));
}

const a = await admin(token, `{ product(id: "${PRODUCT}") { status resourcePublicationsV2(first: 10) { nodes { publication { name } isPublished } } } }`);
console.log("admin:", a.product.status, "publications:", a.product.resourcePublicationsV2.nodes.map((n) => n.publication.name).join(", ") || "(none)");
const us = await storefront("US");
const ca = await storefront("CA");
const v = us?.variants.nodes[0];
console.log("storefront US:", us ? `availableForSale ${v.availableForSale} ${v.price.amount} ${v.price.currencyCode}` : "not visible");
console.log("storefront CA:", ca ? "visible (unexpected: gift is US-only)" : "not visible (expected)");
if (mode === "--open" && !(v?.availableForSale && Number(v.price.amount) === 72 && v.price.currencyCode === "USD")) {
  console.error("OPEN FAILED VERIFICATION: do not flip GIFT_CHECKOUT_ENABLED");
  process.exit(1);
}
