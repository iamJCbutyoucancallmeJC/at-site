// One-off (t1102, 2026-10-15): create the REAL class product as a DRAFT shell so the
// sales page (app/glimmers) and scripts/class-go-live.mjs have a product to point
// at before the Oct 26 on-sale. Amy edits title, description and images in Admin
// as she likes; the engine matches the order by SKU prefix CLASS-GLIMMERS (lib/classes.ts)
// and by the numeric id recorded there. DRAFT = invisible to shoppers until
// class-go-live.mjs --open. Idempotent: re-running prints the existing product.
//
//   node scripts/create-class-product.mjs            (reads .env.local)
import { readFileSync } from "node:fs"

const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")] }))
const d = env.SHOPIFY_STORE_DOMAIN
const SKU = "CLASS-GLIMMERS-2026"
const tok = await fetch(`https://${d}/admin/oauth/access_token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: env.SHOPIFY_ADMIN_CLIENT_ID, client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET }) }).then((r) => r.json())
async function gql(query, variables) { const r = await fetch(`https://${d}/admin/api/2026-07/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": tok.access_token }, body: JSON.stringify({ query, variables }) }); const j = await r.json(); if (j.errors) throw new Error(JSON.stringify(j.errors)); return j.data }

const existing = await gql(`{ products(first: 5, query: "sku:${SKU}") { nodes { id title handle status variants(first:1){ nodes { id sku price } } } } }`)
if (existing.products.nodes.length) { console.log("exists", JSON.stringify(existing.products.nodes, null, 1)); console.log("NUMERIC_ID", existing.products.nodes[0].id.split("/").pop()); process.exit(0) }

const descriptionHtml = [
  "<p>Thirty days of noticing the small good things. One prompt a day, in your own journal, from November 1 through November 30.</p>",
  "<ul>",
  "<li>Thirty daily prompts, one opening each morning</li>",
  "<li>Four printables to cut out and add to your pages</li>",
  "<li>A question-and-answer video partway through the month: send your questions in, Amy answers on camera</li>",
  "<li>Lifetime access. Your link never expires.</li>",
  "</ul>",
  "<p>Your class link arrives by email after checkout. Nothing to log in to, no password to remember. Any journal works.</p>",
].join("")

const created = await gql(`mutation($input: ProductInput!) { productCreate(input: $input) { product { id title handle status variants(first:1){ nodes { id sku price } } } userErrors { field message } } }`, {
  input: { title: "Glimmers and Gratitude", handle: "glimmers-and-gratitude", status: "DRAFT", productType: "Class", tags: ["class", "glimmers"], descriptionHtml },
})
if (created.productCreate.userErrors.length) throw new Error(JSON.stringify(created.productCreate.userErrors))
const p = created.productCreate.product
const v = p.variants.nodes[0]
const upd = await gql(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) { productVariantsBulkUpdate(productId: $productId, variants: $variants) { productVariants { id sku price } userErrors { field message } } }`, {
  productId: p.id, variants: [{ id: v.id, price: "45.00", inventoryItem: { sku: SKU, tracked: false, requiresShipping: false } }],
})
if (upd.productVariantsBulkUpdate.userErrors.length) throw new Error(JSON.stringify(upd.productVariantsBulkUpdate.userErrors))
console.log(JSON.stringify({ product: p, variant: upd.productVariantsBulkUpdate.productVariants[0] }, null, 1))
console.log("NUMERIC_ID", p.id.split("/").pop())
