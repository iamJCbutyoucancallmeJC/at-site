// class-go-live.mjs  (t1102)
//
//   node scripts/class-go-live.mjs glimmers --open    ACTIVE + Online Store + US and International catalogs, then verify
//   node scripts/class-go-live.mjs glimmers --close   back to DRAFT (the sales page then says "Checkout opens ...")
//   node scripts/class-go-live.mjs glimmers           read-only: Admin status/publications + US/CA Storefront view
//
// Same trap gift-go-live.mjs documents: the United States market has exactly one
// catalog (HM US Catalog), so a product that is ACTIVE and on the Online Store
// channel but outside that catalog is still excluded from the US market at
// checkout ("Your order total has changed"). Setting a product to DRAFT drops its
// publications, so every --open re-publishes. A class is digital, so it is also
// published to the International catalog (alumni abroad); the CA view below
// shows what that market sees.
//
// Both halves are needed to sell: this script's --open AND `sales.live: true` in
// lib/classes.ts (the sales page is hidden on production until that commit).

import { readFileSync } from "node:fs";

const CLASSES = {
  glimmers: { product: "gid://shopify/Product/15428447371584", handle: "glimmers-and-gratitude", price: 45 },
};
const ONLINE_STORE = "gid://shopify/Publication/290470854976";
const US_CATALOG = "gid://shopify/Publication/296161968448"; // MarketCatalog 148247937344 "HM US Catalog" (the US market's only catalog)
const INTL_CATALOG = "gid://shopify/Publication/296162001216"; // MarketCatalog 148247970112 "HM International Catalog"

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

const slug = process.argv[2];
const mode = process.argv[3];
const cls = CLASSES[slug];
if (!cls) { console.error(`usage: node scripts/class-go-live.mjs <${Object.keys(CLASSES).join("|")}> [--open|--close]`); process.exit(2); }

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
      query: `query($c: CountryCode!) @inContext(country: $c) { product(handle: "${cls.handle}") { availableForSale variants(first: 1) { nodes { id availableForSale price { amount currencyCode } } } } }`,
      variables: { c: country },
    }),
  });
  const j = await res.json();
  return j.data?.product ?? null;
}

const token = await mintAdminToken();

if (mode === "--open") {
  const u = await admin(token, `mutation { productUpdate(product: {id: "${cls.product}", status: ACTIVE}) { product { status } userErrors { message } } }`);
  if (u.productUpdate.userErrors.length) throw new Error(JSON.stringify(u.productUpdate.userErrors));
  for (const pub of [ONLINE_STORE, US_CATALOG, INTL_CATALOG]) {
    const p = await admin(token, `mutation { publishablePublish(id: "${cls.product}", input: [{publicationId: "${pub}"}]) { userErrors { message } } }`);
    if (p.publishablePublish.userErrors.length) throw new Error(JSON.stringify(p.publishablePublish.userErrors));
  }
  console.log("opened: ACTIVE, published to Online Store + US + International catalogs; waiting for Storefront propagation");
  await new Promise((r) => setTimeout(r, 6000));
} else if (mode === "--close") {
  const u = await admin(token, `mutation { productUpdate(product: {id: "${cls.product}", status: DRAFT}) { product { status } userErrors { message } } }`);
  if (u.productUpdate.userErrors.length) throw new Error(JSON.stringify(u.productUpdate.userErrors));
  console.log("closed: DRAFT");
  await new Promise((r) => setTimeout(r, 6000));
}

const a = await admin(token, `{ product(id: "${cls.product}") { title status variants(first: 1) { nodes { sku price } } resourcePublicationsV2(first: 10) { nodes { publication { name } isPublished } } } }`);
const v0 = a.product.variants.nodes[0];
console.log(`admin: ${a.product.title} | ${a.product.status} | ${v0.sku} $${v0.price} | publications: ${a.product.resourcePublicationsV2.nodes.map((n) => n.publication.name).join(", ") || "(none)"}`);
const us = await storefront("US");
const ca = await storefront("CA");
const show = (p) => (p ? `availableForSale ${p.variants.nodes[0].availableForSale} ${p.variants.nodes[0].price.amount} ${p.variants.nodes[0].price.currencyCode}` : "not visible");
console.log("storefront US:", show(us));
console.log("storefront CA:", show(ca));
if (mode === "--open") {
  const v = us?.variants.nodes[0];
  if (!(v?.availableForSale && Number(v.price.amount) === cls.price && v.price.currencyCode === "USD")) {
    console.error("OPEN FAILED VERIFICATION: do not flip sales.live in lib/classes.ts");
    process.exit(1);
  }
  console.log(`US sees $${cls.price} USD. Now set sales.live: true for "${slug}" in lib/classes.ts and push.`);
}
