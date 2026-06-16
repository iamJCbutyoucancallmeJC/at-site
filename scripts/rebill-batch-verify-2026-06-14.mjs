// rebill-batch-verify-2026-06-14.mjs
//
// READ-ONLY. No writes of any kind. Does two things for the 6/14 re-bill batch:
//
//   STEP 0 (Recharge reads) -- per customer, confirm still re-billable:
//     - is there any SUCCESSFUL/paid charge since the cutover? (if yes -> already paid, divert)
//     - the active subs + their next_charge_scheduled_at (expect the errored one: next None)
//     - the errored charge state ($0 collected)
//
//   6/8 LINK CHECK (Shopify reads + 1 harmless cartCreate) -- for the 5 switchers that
//   already have T726B-* codes from 6/8:
//     - pull the discount code's status + usageCount vs usageLimit (spent or not?)
//     - re-run cartCreate against the existing code to confirm it still renders $62
//       (functionality: does the link still generate the behavior we want?)
//
// cartCreate is NOT a charge (a cart is not an order) -- it's the same read-equivalent
// the gen script's test gate uses. The ONLY thing that would be a write here is creating
// codes/orders, and this script does NEITHER.
//
// RUN:
//   ADMIN_TOKEN=$(curl -s -X POST "https://q9x1sj-hc.myshopify.com/admin/oauth/access_token" \
//     -d "client_id=$SHOPIFY_ADMIN_CLIENT_ID" -d "client_secret=$SHOPIFY_ADMIN_CLIENT_SECRET" \
//     -d "grant_type=client_credentials" | node -e 'process.stdin.on("data",d=>console.log(JSON.parse(d).access_token))')
//   ... (script reads SHOPIFY_ADMIN_CLIENT_ID/SECRET itself and mints the token, see below)
//   node scripts/rebill-batch-verify-2026-06-14.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(join(__dir, "..", ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const DOMAIN = env.SHOPIFY_STORE_DOMAIN || "q9x1sj-hc.myshopify.com";
const SF_TOKEN = env.SHOPIFY_STOREFRONT_TOKEN;
const RECHARGE_TOKEN = env.RECHARGE_API_TOKEN;
const SF_ENDPOINT = `https://${DOMAIN}/api/2025-01/graphql.json`;
const ADMIN_ENDPOINT = `https://${DOMAIN}/admin/api/2026-07/graphql.json`;

const VARIANT_MONTHLY = "gid://shopify/ProductVariant/51926357311808";
const PLAN_MONTHLY     = "gid://shopify/SellingPlan/693610938688";
const VARIANT_6MO      = "gid://shopify/ProductVariant/51998971068736";
const PLAN_6MO         = "gid://shopify/SellingPlan/693625356608";

// The 6/14 batch. existingCode = the 6/8 T726B-* link if one exists; null = needs fresh gen.
const BATCH = [
  { key:"morgan",    name:"Morgan Phillips",   email:"akmoose04@me.com",        kind:"6mo",     discount:10, expect:"62.00", rc:"251866840", existingCode:"T726B-MORGAN-10OFF" },
  { key:"sheri",     name:"Sheri Novotny",     email:"novotnyfive@yahoo.com",   kind:"6mo",     discount:10, expect:"62.00", rc:"251867923", existingCode:"T726B-SHERI-10OFF" },
  { key:"mackenzie", name:"Mackenzie Bright",  email:"mbbritton@gmail.com",     kind:"6mo",     discount:10, expect:"62.00", rc:"251867786", existingCode:"T726B-MACKENZIE-10OFF" },
  { key:"eileen",    name:"Eileen Cohen",      email:"efcohen2@gmail.com",      kind:"6mo",     discount:10, expect:"62.00", rc:"251867192", existingCode:"T726B-EILEEN-10OFF" },
  { key:"alejandra", name:"Alejandra Vazquez", email:"ale_vazquez@me.com",      kind:"6mo",     discount:10, expect:"62.00", rc:"251866845", existingCode:"T726B-ALEJANDRA-10OFF" },
  { key:"sharon",    name:"Sharon Crouchman",  email:"sharon_c_48072@yahoo.com",kind:"6mo",     discount:10, expect:"62.00", rc:"251868104", existingCode:null },  // was HELD, now cleared per prompt
  { key:"mary",      name:"Mary Tomkins",      email:"mtomkins@me.com",         kind:"monthly", discount:5,  expect:"8.00",  rc:"251867873", existingCode:null },  // new 6/14
];

let ADMIN_TOKEN = null;
async function mintAdminToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
      client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("admin token mint failed: " + JSON.stringify(j));
  ADMIN_TOKEN = j.access_token;
}

async function gql(endpoint, token, header, query, variables) {
  const res = await fetch(endpoint, {
    method:"POST",
    headers:{ "Content-Type":"application/json", [header]: token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error("GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}
const admin = (q,v)=>gql(ADMIN_ENDPOINT, ADMIN_TOKEN, "X-Shopify-Access-Token", q, v);
const store = (q,v)=>gql(SF_ENDPOINT, SF_TOKEN, "X-Shopify-Storefront-Access-Token", q, v);

async function recharge(path) {
  const res = await fetch("https://api.rechargeapps.com" + path, {
    headers:{ "X-Recharge-Access-Token": RECHARGE_TOKEN, "X-Recharge-Version":"2021-11" },
  });
  if (!res.ok) throw new Error(`Recharge ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

// --- STEP 0: Recharge state per customer ---
async function step0(c) {
  const out = { subs:[], charges:[], paid:false, errored:[] };
  const subsR = await recharge(`/subscriptions?customer_id=${c.rc}&limit=100`);
  out.subs = (subsR.subscriptions||[]).map(s=>({
    id:s.id, status:s.status, price:s.price, qty:s.quantity,
    sku:s.sku, next:s.next_charge_scheduled_at, created:s.created_at,
  }));
  // charges: any success since cutover?
  const chR = await recharge(`/charges?customer_id=${c.rc}&limit=100`);
  for (const ch of (chR.charges||[])) {
    const rec = { id:ch.id, status:ch.status, total:ch.total_price, scheduled:ch.scheduled_at,
      processed:ch.processed_at, tried:ch.number_times_tried, created:ch.created_at };
    out.charges.push(rec);
    if (ch.status === "success" || (Number(ch.total_price) > 0 && ch.processed_at)) {
      // only count post-cutover (2026-05-29+) successes as "already re-billed"
      if (ch.processed_at && ch.processed_at >= "2026-05-29") out.paid = true;
    }
    if (ch.status === "error") out.errored.push(rec);
  }
  return out;
}

// --- 6/8 link check: discount code state + functional cartCreate ---
async function discountState(code) {
  // codeDiscountNodeByCode gives status + the basic discount's usageLimit + asyncUsageCount
  const d = await admin(`
    query($code:String!){
      codeDiscountNodeByCode(code:$code){
        id
        codeDiscount{
          __typename
          ... on DiscountCodeBasic{
            title status usageLimit asyncUsageCount appliesOncePerCustomer
            startsAt endsAt
            customerSelection{ __typename }
            codes(first:3){ nodes{ code } }
          }
        }
      }
    }`, { code });
  return d.codeDiscountNodeByCode;
}

async function cartCheck(c, code) {
  const variant = c.kind==="6mo" ? VARIANT_6MO : VARIANT_MONTHLY;
  const plan    = c.kind==="6mo" ? PLAN_6MO    : PLAN_MONTHLY;
  const d = await store(`
    mutation($input:CartInput!){
      cartCreate(input:$input){
        cart{
          checkoutUrl
          cost{ subtotalAmount{amount} totalAmount{amount} }
          discountCodes{ code applicable }
        }
        userErrors{ field message }
      }
    }`, { input:{
      lines:[{ merchandiseId:variant, quantity:1, sellingPlanId:plan }],
      discountCodes:[code],
      buyerIdentity:{ email:c.email },
    }});
  return d.cartCreate;
}

async function main() {
  await mintAdminToken();
  console.log(`\n=== REBILL BATCH VERIFY (READ-ONLY) 2026-06-14 ===`);
  console.log(`domain=${DOMAIN}  batch=${BATCH.length}\n`);

  for (const c of BATCH) {
    console.log(`\n${"=".repeat(72)}`);
    console.log(`${c.name} <${c.email}>  rechargeCust=${c.rc}  [${c.kind}, expect $${c.expect}]`);

    // STEP 0
    try {
      const s0 = await step0(c);
      console.log(`  --- STEP 0 (Recharge) ---`);
      console.log(`  ALREADY PAID since cutover? ${s0.paid ? "*** YES -> DIVERT, do NOT send link ***" : "no"}`);
      console.log(`  active subs:`);
      for (const s of s0.subs.filter(x=>x.status==="active"))
        console.log(`    sub ${s.id}: $${s.price} x${s.qty} ${s.sku||""} next=${s.next} created=${(s.created||"").slice(0,10)}`);
      const cancelled = s0.subs.filter(x=>x.status!=="active");
      if (cancelled.length) console.log(`  (non-active subs: ${cancelled.map(s=>`${s.id}/${s.status}`).join(", ")})`);
      console.log(`  charges:`);
      for (const ch of s0.charges)
        console.log(`    chg ${ch.id}: ${ch.status} $${ch.total} sched=${(ch.scheduled||"").slice(0,10)} processed=${ch.processed||"None"} tried=${ch.tried}`);
    } catch(e) { console.log(`  STEP 0 ERROR: ${e.message}`); }

    // 6/8 LINK CHECK (only switchers w/ existingCode)
    if (c.existingCode) {
      console.log(`  --- 6/8 LINK CHECK (code ${c.existingCode}) ---`);
      try {
        const ds = await discountState(c.existingCode);
        if (!ds) { console.log(`  discount ${c.existingCode}: NOT FOUND (deleted?) -> needs regen`); }
        else {
          const cd = ds.codeDiscount;
          const spent = cd.usageLimit!=null && cd.asyncUsageCount>=cd.usageLimit;
          console.log(`  discount: status=${cd.status} usage=${cd.asyncUsageCount}/${cd.usageLimit ?? "∞"} scope=${cd.customerSelection.__typename} ${spent?"*** SPENT ***":"(unspent)"}`);
        }
      } catch(e) { console.log(`  discount lookup ERROR: ${e.message}`); }
      try {
        const cc = await cartCheck(c, c.existingCode);
        if (cc.userErrors?.length) { console.log(`  cartCreate FAILED: ${JSON.stringify(cc.userErrors)}`); }
        else {
          const cart = cc.cart;
          const total = cart.cost.totalAmount.amount;
          const ok = cart.discountCodes.some(d=>d.code===c.existingCode && d.applicable);
          const totalOk = Number(total)===Number(c.expect);
          console.log(`  cartCreate: subtotal=${cart.cost.subtotalAmount.amount} total=${total} codeApplicable=${ok} -> ${(ok&&totalOk)?"FUNCTIONAL ✓":"BROKEN ✗"}`);
          console.log(`  url: ${cart.checkoutUrl}`);
        }
      } catch(e) { console.log(`  cartCreate ERROR: ${e.message}`); }
    } else {
      console.log(`  --- NO 6/8 LINK (needs fresh gen: ${c.name}) ---`);
    }
  }
  console.log(`\n=== done (read-only; nothing written) ===`);
}
main().catch(e=>{ console.error(e); process.exit(1); });
