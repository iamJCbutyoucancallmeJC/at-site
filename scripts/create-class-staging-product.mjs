// One-off (t1102 auth spike, 2026-09-23): create the DRAFT staging product the
// classes registry (lib/classes.ts) points at, so a draft order can exercise the
// orders-create -> class access path without touching Amy's live catalog.
// Reads ~/at-site/.env.local for the Admin client credentials. Prints the numeric id.
import fs from "node:fs"
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
const d = env.SHOPIFY_STORE_DOMAIN
const tok = await fetch(`https://${d}/admin/oauth/access_token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: env.SHOPIFY_ADMIN_CLIENT_ID, client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET }) }).then((r) => r.json())
async function gql(query, variables) { const r = await fetch(`https://${d}/admin/api/2026-04/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": tok.access_token }, body: JSON.stringify({ query, variables }) }); const j = await r.json(); if (j.errors) throw new Error(JSON.stringify(j.errors)); return j.data }
const existing = await gql(`{ products(first: 5, query: "sku:CLASS-GLIMMERS-STAGING") { nodes { id title status } } }`)
if (existing.products.nodes.length) { console.log("exists", JSON.stringify(existing.products.nodes)); process.exit(0) }
const created = await gql(`mutation($input: ProductInput!) { productCreate(input: $input) { product { id title status variants(first:1){ nodes { id sku price } } } userErrors { field message } } }`, { input: { title: "Glimmers and Gratitude (class, staging)", status: "DRAFT", productType: "Class", tags: ["class", "staging"], descriptionHtml: "<p>Staging product for the on-site class engine (t1102). Not for sale.</p>" } })
console.log(JSON.stringify(created, null, 1))
const p = created.productCreate.product
const v = p.variants.nodes[0]
const upd = await gql(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id sku price } userErrors { field message } } }`, { productId: p.id, variants: [{ id: v.id, price: "45.00", inventoryItem: { sku: "CLASS-GLIMMERS-STAGING", tracked: false, requiresShipping: false } }] })
console.log(JSON.stringify(upd, null, 1))
console.log("NUMERIC_ID", p.id.split("/").pop())
