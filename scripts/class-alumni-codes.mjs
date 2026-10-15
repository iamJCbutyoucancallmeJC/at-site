// class-alumni-codes.mjs  (t1102, JC 10/15: "create any code you need in Shopify and Klaviyo")
//
// The 9/28 ruling: Glimmers 2023 alumni pay $10 = unique one-use codes, $35 off the $45 class,
// handed out in the alumni email (Klaviyo list TJcG22, 85 profiles). Klaviyo's Coupons API
// cannot create Shopify coupons, so the codes are OURS: one Shopify discount node per code
// (usageLimit 1, the same shape as the t726 / HM82 single-use codes already in the store),
// then the same codes uploaded to the Klaviyo coupon GLIMMERS2023, which hands one code per
// profile at send time via {% coupon_code 'GLIMMERS2023' %}.
//
//   node scripts/class-alumni-codes.mjs --shopify [N]   create N (default 85) discounts, idempotent by title
//   node scripts/class-alumni-codes.mjs --klaviyo       upload every Shopify alumni code to the Klaviyo coupon
//   node scripts/class-alumni-codes.mjs                 read-only: list the Shopify nodes + the Klaviyo coupon code counts
import { readFileSync } from "node:fs"
import { randomBytes } from "node:crypto"

const env = Object.fromEntries(readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => /^[A-Z_]+=/.test(l)).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")] }))
const DOMAIN = env.SHOPIFY_STORE_DOMAIN
const API = "2026-07"
const TITLE_PREFIX = "Glimmers alumni $10 #"
const CLASS_PRODUCT = "gid://shopify/Product/15428447371584"   // the real class product
const STAGING_PRODUCT = "gid://shopify/Product/10283136188736" // staging, so a $0 test order can exercise a code
const AMOUNT = "35.00"
const ENDS_AT = "2027-01-01T07:59:59Z" // Dec 31 2026, 23:59 Los Angeles
const COUPON = "GLIMMERS2023"
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I

const tok = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: env.SHOPIFY_ADMIN_CLIENT_ID, client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET }) }).then((r) => r.json())
async function admin(query, variables) {
  const r = await fetch(`https://${DOMAIN}/admin/api/${API}/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": tok.access_token }, body: JSON.stringify({ query, variables }) })
  const j = await r.json(); if (j.errors) throw new Error("admin GraphQL: " + JSON.stringify(j.errors)); return j.data
}
async function existingNodes() {
  const out = []; let after = null
  for (;;) {
    // No search query: Shopify's discount search does not match a quoted title phrase reliably,
    // so every node is paged and filtered here by title prefix.
    const d = await admin(`query($after: String) { codeDiscountNodes(first: 100, after: $after, sortKey: TITLE) { pageInfo { hasNextPage endCursor } nodes { id codeDiscount { ... on DiscountCodeBasic { title status usageLimit asyncUsageCount codes(first: 1) { nodes { code } } } } } } }`, { after })
    out.push(...d.codeDiscountNodes.nodes.filter((n) => n.codeDiscount?.title?.startsWith(TITLE_PREFIX)))
    if (!d.codeDiscountNodes.pageInfo.hasNextPage) break
    after = d.codeDiscountNodes.pageInfo.endCursor
  }
  return out.sort((a, b) => Number(a.codeDiscount.title.slice(TITLE_PREFIX.length)) - Number(b.codeDiscount.title.slice(TITLE_PREFIX.length)))
}
function newCode() {
  const b = randomBytes(6); let s = ""
  for (const x of b) s += ALPHABET[x % ALPHABET.length]
  return `GLIMMERS-${s}`
}

const mode = process.argv[2]
const have = await existingNodes()

if (mode === "--shopify") {
  const want = Number(process.argv[3] || 85)
  const haveN = new Set(have.map((n) => Number(n.codeDiscount.title.slice(TITLE_PREFIX.length))))
  const input = (n, code) => ({
    title: `${TITLE_PREFIX}${String(n).padStart(2, "0")}`,
    code,
    startsAt: new Date().toISOString(),
    endsAt: ENDS_AT,
    usageLimit: 1,
    appliesOncePerCustomer: true,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false },
    customerGets: { value: { discountAmount: { amount: AMOUNT, appliesOnEachItem: false } }, items: { products: { productsToAdd: [CLASS_PRODUCT, STAGING_PRODUCT] } } },
  })
  const M = `mutation($d: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $d) { codeDiscountNode { id codeDiscount { ... on DiscountCodeBasic { title status usageLimit appliesOncePerCustomer endsAt codes(first:1){ nodes { code } } } } } userErrors { field message code } } }`
  let selection = "context"
  for (let n = 1; n <= want; n++) {
    if (haveN.has(n)) continue
    const d = input(n, newCode())
    const withSel = selection === "context" ? { ...d, context: { all: true } } : { ...d, customerSelection: { all: true } }
    let res
    try { res = await admin(M, { d: withSel }) } catch (e) {
      if (selection === "context") { selection = "customerSelection"; n--; console.error("context input rejected; retrying with customerSelection:", e.message.slice(0, 200)); continue }
      throw e
    }
    const ue = res.discountCodeBasicCreate.userErrors
    if (ue.length) {
      if (selection === "context" && n === 1) { selection = "customerSelection"; n--; console.error("context input userErrors; retrying with customerSelection:", JSON.stringify(ue)); continue }
      throw new Error("userErrors " + JSON.stringify(ue))
    }
    const node = res.discountCodeBasicCreate.codeDiscountNode
    console.log(`${node.codeDiscount.title}  ${node.codeDiscount.codes.nodes[0].code}  ${node.codeDiscount.status}  limit ${node.codeDiscount.usageLimit}  once/customer ${node.codeDiscount.appliesOncePerCustomer}  ends ${node.codeDiscount.endsAt}`)
    await new Promise((r) => setTimeout(r, 350))
  }
  process.exit(0)
}

const key = JSON.parse(readFileSync(`${process.env.HOME}/.klaviyo-at.json`, "utf8")).full_key
const KH = { Authorization: `Klaviyo-API-Key ${key}`, revision: "2025-10-15", accept: "application/json", "content-type": "application/vnd.api+json" }
async function klaviyoCodes() {
  const out = []; let url = `https://a.klaviyo.com/api/coupon-codes/?filter=equals(coupon.id,"${COUPON}")&page[size]=100`
  while (url) { const j = await (await fetch(url, { headers: KH })).json(); if (j.errors) throw new Error(JSON.stringify(j.errors)); out.push(...(j.data || [])); url = j.links?.next || null }
  return out
}

if (mode === "--klaviyo") {
  const existing = new Set((await klaviyoCodes()).map((c) => c.attributes.unique_code))
  const codes = have.map((n) => n.codeDiscount.codes.nodes[0].code).filter((c) => !existing.has(c))
  if (!have.length) { console.error("no Shopify alumni nodes found; run --shopify first"); process.exit(1) }
  if (!codes.length) { console.log(`Klaviyo already holds every Shopify alumni code (${have.length})`); process.exit(0) }
  const body = { data: { type: "coupon-code-bulk-create-job", attributes: { "coupon-codes": { data: codes.map((c) => ({ type: "coupon-code", attributes: { unique_code: c, expires_at: ENDS_AT }, relationships: { coupon: { data: { type: "coupon", id: COUPON } } } })) } } } }
  const r = await fetch("https://a.klaviyo.com/api/coupon-code-bulk-create-jobs/", { method: "POST", headers: KH, body: JSON.stringify(body) })
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j).slice(0, 800))
  console.log(`bulk job ${j.data.id}: ${j.data.attributes.status}, total ${j.data.attributes.total_count}`)
  for (let i = 0; i < 20; i++) {
    await new Promise((res) => setTimeout(res, 2000))
    const s = await (await fetch(`https://a.klaviyo.com/api/coupon-code-bulk-create-jobs/${j.data.id}/`, { headers: KH })).json()
    const a = s.data.attributes
    if (a.status === "complete" || a.status === "cancelled") { console.log(`job ${a.status}: completed ${a.completed_count}, failed ${a.failed_count}`, a.errors?.length ? JSON.stringify(a.errors).slice(0, 500) : ""); break }
  }
}

const kc = await klaviyoCodes()
const byStatus = {}; for (const c of kc) byStatus[c.attributes.status] = (byStatus[c.attributes.status] || 0) + 1
console.log(`Shopify: ${have.length} "${TITLE_PREFIX}NN" nodes (${have.filter((n) => n.codeDiscount.status === "ACTIVE").length} active, ${have.reduce((s, n) => s + (n.codeDiscount.asyncUsageCount || 0), 0)} uses). Klaviyo coupon ${COUPON}: ${kc.length} codes ${JSON.stringify(byStatus)}`)
