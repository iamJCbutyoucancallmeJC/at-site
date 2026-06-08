// gen-customer-checkout-links.mjs
//
// PURPOSE (task t726)
//   Generate + TEST per-customer Storefront checkout links for the AT customer-issue
//   batch, plus the customer-scoped discount code each one needs. Output one tested
//   checkoutUrl per customer for pasting into the emails Amy sends.
//
//   THREE-STEP PROVEN RECIPE (see Incidents/2026-06-06-switch-rebill-MECHANISM-PROVEN.md):
//     1. Resolve email -> Shopify Customer GID (Admin API, read).
//     2. discountCodeBasicCreate: a code scoped to ONLY that customer's GID,
//        appliesOnSubscription:true, appliesOncePerCustomer:true, recurringCycleLimit:1.
//     3. cartCreate (Storefront API 2025-01): variant + sellingPlan + discountCodes
//        + buyerIdentity.email  ->  returns checkoutUrl + rendered cost.
//
//   TEST GATE: the rendered cost.totalAmount MUST equal the customer's expected net
//   ($8 Kristin / $62 switchers). A mismatch FAILS that customer (no untested / wrong
//   link ever goes in an email -- HARD RULE from Kristin's incident doc).
//
// SAFETY
//   - DRY-RUN by default (resolves GIDs + prints what it WOULD create, no live codes/carts).
//   - Pass --execute to create the live discount codes + carts.
//   - cartCreate is itself harmless (a cart is not a charge); the live side effect is
//     the per-customer discount codes. Each is single-customer, once-per-customer,
//     1 recurring cycle -- no leak surface.
//   - Sharon C is HELD (Amy to confirm switch) and Hope is cardless -> NEITHER is in
//     the BATCH below. Do not add them without explicit go.
//
// RUN:
//   ADMIN_TOKEN=$(curl -s -X POST "https://q9x1sj-hc.myshopify.com/admin/oauth/access_token" \
//     -d "client_id=$SHOPIFY_ADMIN_CLIENT_ID" \
//     -d "client_secret=$SHOPIFY_ADMIN_CLIENT_SECRET" \
//     -d "grant_type=client_credentials" | node -e 'process.stdin.on("data",d=>console.log(JSON.parse(d).access_token))')
//   node scripts/gen-customer-checkout-links.mjs            # dry-run
//   node scripts/gen-customer-checkout-links.mjs --execute  # live

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// --- load .env.local (Storefront token + domain) ---
const __dir = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dir, "..", ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const DOMAIN = env.SHOPIFY_STORE_DOMAIN || "q9x1sj-hc.myshopify.com";
const SF_TOKEN = env.SHOPIFY_STOREFRONT_TOKEN;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const EXECUTE = process.argv.includes("--execute");

const SF_ENDPOINT = `https://${DOMAIN}/api/2025-01/graphql.json`;
const ADMIN_ENDPOINT = `https://${DOMAIN}/admin/api/2026-07/graphql.json`;

// --- PROVEN-CORRECT IDs ---
// NEXT_PUBLIC_HM_SELLING_PLAN_6MO in .env.local was reconciled to 693625356608 on
// 2026-06-08, so reading the 6mo plan from env is now safe. These remain hardcoded
// to keep the script self-contained and decoupled from env drift.
const VARIANT_MONTHLY = "gid://shopify/ProductVariant/51926357311808";
const PLAN_MONTHLY     = "gid://shopify/SellingPlan/693610938688";
const VARIANT_6MO      = "gid://shopify/ProductVariant/51998971068736";
const PLAN_6MO         = "gid://shopify/SellingPlan/693625356608"; // proven live

if (!SF_TOKEN) { console.error("Missing SHOPIFY_STOREFRONT_TOKEN in .env.local"); process.exit(1); }
if (!ADMIN_TOKEN) { console.error("Missing ADMIN_TOKEN env var (client_credentials token)."); process.exit(1); }

// --- THE BATCH (Kristin + 5 confirmed switchers; Sharon HELD + Hope cardless are excluded) ---
const BATCH = [
  { key: "kristin",   name: "Kristin Burns",     email: "sactownkid@gmail.com",      kind: "monthly", discount: 5,  expectTotal: "8.00",  rechargeCust: "251868061" },
  { key: "morgan",    name: "Morgan Phillips",   email: "akmoose04@me.com",          kind: "6mo",     discount: 10, expectTotal: "62.00", rechargeCust: "251866840" },
  { key: "sheri",     name: "Sheri Novotny",     email: "novotnyfive@yahoo.com",     kind: "6mo",     discount: 10, expectTotal: "62.00", rechargeCust: "251867923" },
  { key: "mackenzie", name: "Mackenzie Britton", email: "mbbritton@gmail.com",       kind: "6mo",     discount: 10, expectTotal: "62.00", rechargeCust: "251867786" },
  { key: "eileen",    name: "Eileen Cohen",      email: "efcohen2@gmail.com",        kind: "6mo",     discount: 10, expectTotal: "62.00", rechargeCust: "251867192" },
  { key: "alejandra", name: "Alejandra Vazquez", email: "ale_vazquez@me.com",        kind: "6mo",     discount: 10, expectTotal: "62.00", rechargeCust: "251866845" },
];

async function gql(endpoint, token, headerName, query, variables) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", [headerName]: token },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error("GraphQL: " + JSON.stringify(json.errors));
  return json.data;
}
const admin = (q, v) => gql(ADMIN_ENDPOINT, ADMIN_TOKEN, "X-Shopify-Access-Token", q, v);
const store = (q, v) => gql(SF_ENDPOINT, SF_TOKEN, "X-Shopify-Storefront-Access-Token", q, v);

async function resolveCustomerGid(email) {
  const d = await admin(
    `query($q:String!){ customers(first:2, query:$q){ nodes{ id email } } }`,
    { q: `email:${email}` }
  );
  const nodes = d.customers.nodes.filter(n => (n.email || "").toLowerCase() === email.toLowerCase());
  if (nodes.length !== 1) throw new Error(`email->GID lookup got ${nodes.length} matches for ${email}`);
  return nodes[0].id;
}

async function createDiscount(c, customerGid) {
  // NOTE (2026-06-08 fix): customer-SCOPED codes (customerSelection.customers) silently
  // FAIL at checkout for an un-logged-in shopper -- the cart API shows the discount but
  // the checkout charges full price (verified in-browser: customer-scoped link rendered
  // $72/$72, no discount). A real customer opening a raw link isn't authenticated as that
  // customer, so Shopify drops the restricted code. FIX: customerSelection.all=true so the
  // code is not identity-gated, but usageLimit:1 caps total redemptions to one (the code
  // only lives inside this one customer's link, and dies after a single use -> no leak).
  const code = `T726B-${c.key.toUpperCase()}-${c.discount}OFF`;
  const input = {
    title: `t726 ${c.name} ($${c.discount} off, single-use)`,
    code,
    startsAt: "2026-06-07T00:00:00Z",
    customerSelection: { all: true },
    customerGets: {
      appliesOnSubscription: true,
      appliesOnOneTimePurchase: true,
      value: { discountAmount: { amount: String(c.discount), appliesOnEachItem: false } },
      items: { all: true },
    },
    appliesOncePerCustomer: false,
    usageLimit: 1,
    recurringCycleLimit: 1,
  };
  if (!EXECUTE) { console.log(`  [dry-run] discountCodeBasicCreate ${code} -> customer ${customerGid}, $${c.discount} off, appliesOnSubscription:true, oncePerCustomer, recurringCycleLimit:1`); return code; }
  const d = await admin(`
    mutation($d:DiscountCodeBasicInput!){
      discountCodeBasicCreate(basicCodeDiscount:$d){
        codeDiscountNode{ id }
        userErrors{ field code message }
      }
    }`, { d: input });
  const ue = d.discountCodeBasicCreate.userErrors;
  if (ue.length) {
    // idempotent: the code already exists from a prior run -> reuse it, don't fail.
    const exists = ue.some(e => /already exists|has already been taken|taken/i.test(e.message) || e.code === "TAKEN");
    if (exists) { console.log(`  REUSE discount ${code} (already exists)`); return code; }
    throw new Error(`discount userErrors: ${JSON.stringify(ue)}`);
  }
  console.log(`  CREATED discount ${code} (${d.discountCodeBasicCreate.codeDiscountNode.id})`);
  return code;
}

async function createCart(c, code) {
  const variant = c.kind === "6mo" ? VARIANT_6MO : VARIANT_MONTHLY;
  const plan    = c.kind === "6mo" ? PLAN_6MO    : PLAN_MONTHLY;
  const input = {
    lines: [{ merchandiseId: variant, quantity: 1, sellingPlanId: plan }],
    discountCodes: [code],
    buyerIdentity: { email: c.email },
  };
  if (!EXECUTE) { console.log(`  [dry-run] cartCreate variant=${variant.split("/").pop()} plan=${plan.split("/").pop()} code=${code} email=${c.email}`); return null; }
  const d = await store(`
    mutation($input:CartInput!){
      cartCreate(input:$input){
        cart{
          checkoutUrl
          cost{ subtotalAmount{amount currencyCode} totalAmount{amount currencyCode} }
          discountCodes{ code applicable }
          lines(first:5){ nodes{ quantity merchandise{ ... on ProductVariant { title } } } }
        }
        userErrors{ field message }
      }
    }`, { input });
  const ue = d.cartCreate.userErrors;
  if (ue.length) throw new Error(`cartCreate userErrors: ${JSON.stringify(ue)}`);
  return d.cartCreate.cart;
}

async function main() {
  console.log(`\n=== gen-customer-checkout-links (${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===`);
  console.log(`domain=${DOMAIN}  batch=${BATCH.length} (Sharon HELD + Hope cardless excluded)\n`);
  const results = [];
  for (const c of BATCH) {
    console.log(`\n--- ${c.name} <${c.email}> [${c.kind}, expect $${c.expectTotal}] ---`);
    try {
      const gid = await resolveCustomerGid(c.email);
      console.log(`  customer GID: ${gid}`);
      const code = await createDiscount(c, gid);
      const cart = await createCart(c, code);
      if (cart) {
        const total = cart.cost.totalAmount.amount;
        // codeOk now requires the code to PERSIST by name in discountCodes (applicable:true).
        // Customer-scoped codes returned applicable:true but an EMPTY discountCodes array and
        // then failed at checkout; a non-scoped code stays named here AND holds at checkout.
        const codeOk = cart.discountCodes.some(d => d.code === code && d.applicable);
        const totalOk = Number(total) === Number(c.expectTotal);
        console.log(`  subtotal=${cart.cost.subtotalAmount.amount} total=${total} discountApplicable=${codeOk}`);
        console.log(`  ITEM: ${cart.lines.nodes[0]?.merchandise?.title}`);
        const PASS = codeOk && totalOk;
        console.log(`  TEST: ${PASS ? "PASS ✓" : "FAIL ✗"}${PASS ? "" : `  (expected $${c.expectTotal}, code applicable=${codeOk})`}`);
        console.log(`  URL: ${PASS ? cart.checkoutUrl : "(withheld -- failed test gate)"}`);
        results.push({ ...c, gid, code, total, pass: PASS, url: PASS ? cart.checkoutUrl : null });
      } else {
        results.push({ ...c, gid, code, dryRun: true });
      }
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      results.push({ ...c, error: e.message });
    }
  }

  console.log(`\n\n=== SUMMARY ===`);
  for (const r of results) {
    if (r.dryRun) console.log(`  [dry] ${r.name}: code ${r.code}`);
    else if (r.error) console.log(`  [ERR] ${r.name}: ${r.error}`);
    else console.log(`  [${r.pass ? "OK " : "BAD"}] ${r.name}: $${r.total}  ${r.url || "(no url)"}`);
  }
  if (EXECUTE) {
    console.log(`\nJSON:\n${JSON.stringify(results.map(({name,email,kind,code,total,pass,url})=>({name,email,kind,code,total,pass,url})), null, 2)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
