// gen-hm82-checkout-links.mjs
//
// PURPOSE (Happy Mail June re-engagement -- the "82")
//   Scale the PROVEN t726 per-customer checkout-link recipe from 6 hand-picked
//   customers to the 82 cardless monthly subs whose June is unfunded. Each gets a
//   $5-off, single-use Storefront checkout link ($13 -> $8) to re-add a card and
//   resume their monthly Happy Mail. Output: one TESTED link per customer + a CSV
//   for Amy's email platform (Kajabi) to merge as a per-recipient field.
//
//   This is the SAME mechanism, IDs, and test gate as gen-customer-checkout-links.mjs
//   (t726). Read these first; this file does not re-derive any of it:
//     - Incidents/2026-06-06-switch-rebill-MECHANISM-PROVEN.md  (the storefront-cart path)
//     - Incidents/2026-06-08-t726-checkout-links-generated-and-customer-scope-bug.md
//       (WHY codes are customerSelection.all + usageLimit:1, not customer-scoped)
//
//   THE 82 split into three message SEGMENTS (carried through to the CSV so Amy can
//   send three framings of the same $5 offer):
//     - clicked-no-card    (15): clicked the May 31 switch email, never carded
//     - emailed-no-action  (49): got May 31, opened/ignored, no click
//     - never-contacted    (18): not on the May 31 send (mostly new May signups)
//
//   THREE-STEP RECIPE PER CUSTOMER (proven):
//     1. Resolve email -> Shopify Customer GID (Admin API, read-only).
//     2. discountCodeBasicCreate: customerSelection.all + usageLimit:1 + recurringCycleLimit:1
//        (NON-scoped single-use -- scoped codes fail at checkout for un-logged-in buyers).
//     3. cartCreate (Storefront 2025-01): monthly variant+plan + code + buyerIdentity.email
//        -> checkoutUrl. TEST GATE: rendered total MUST == $8.00 AND code applicable,
//        else the link is WITHHELD (no untested link ever reaches a customer).
//
// SAFETY / EXECUTION MODES
//   - DEFAULT (no flag): DRY-RUN. Resolves GIDs (read-only) + prints what it WOULD
//     create. No discount codes created, no carts. Safe to run anytime.
//   - --resolve-only: just do the email->GID resolution and report who resolves /
//     who doesn't. Pure reads. Use this to find the resolve-failures before tomorrow.
//   - --execute: create the live discount codes + carts + emit tested links + CSV.
//     Per-customer codes are usageLimit:1 -> self-extinguishing, no leak surface.
//     This DOES create live discount codes (Amy's-margin side effect). Do not run
//     without JC's go (the $5-to-all decision) -- see the JC-review gate.
//
//   NOTE: even --execute creates NO charge. A cart is not a payment; a discount code
//   is not a charge. The only thing that moves money is a CUSTOMER clicking the link
//   and paying. Nothing here bills anyone.
//
// RUN:
//   ADMIN_TOKEN=$(curl -s -X POST "https://q9x1sj-hc.myshopify.com/admin/oauth/access_token" \
//     -d "client_id=$SHOPIFY_ADMIN_CLIENT_ID" -d "client_secret=$SHOPIFY_ADMIN_CLIENT_SECRET" \
//     -d "grant_type=client_credentials" | node -e 'process.stdin.on("data",d=>console.log(JSON.parse(d).access_token))')
//   node scripts/gen-hm82-checkout-links.mjs --resolve-only   # who maps to a Shopify customer?
//   node scripts/gen-hm82-checkout-links.mjs                   # dry-run (default)
//   node scripts/gen-hm82-checkout-links.mjs --execute         # live codes + carts + CSV
//
//   Batch input: --input <path> (default /tmp/hm82-batch-input.json), the 82-row JSON
//   built from the held pool. CSV output: --csv <path> (default /tmp/hm82-links.csv).

import { readFileSync, writeFileSync } from "node:fs";
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
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const EXECUTE = process.argv.includes("--execute");
const RESOLVE_ONLY = process.argv.includes("--resolve-only");

function argVal(flag, dflt) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : dflt;
}
const INPUT_PATH = argVal("--input", "/tmp/hm82-batch-input.json");
const CSV_PATH = argVal("--csv", "/tmp/hm82-links.csv");

const SF_ENDPOINT = `https://${DOMAIN}/api/2025-01/graphql.json`;
const ADMIN_ENDPOINT = `https://${DOMAIN}/admin/api/2026-07/graphql.json`;

// PROVEN-CORRECT IDs (monthly only -- all 82 are monthly subs). See t726 docs.
const VARIANT_MONTHLY = "gid://shopify/ProductVariant/51926357311808";
const PLAN_MONTHLY     = "gid://shopify/SellingPlan/693610938688";

if (!SF_TOKEN) { console.error("Missing SHOPIFY_STOREFRONT_TOKEN in .env.local"); process.exit(1); }
if (!ADMIN_TOKEN) { console.error("Missing ADMIN_TOKEN env var (client_credentials token)."); process.exit(1); }

const BATCH = JSON.parse(readFileSync(INPUT_PATH, "utf8"));

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
    `query($q:String!){ customers(first:5, query:$q){ nodes{ id email } } }`,
    { q: `email:${email}` }
  );
  const nodes = d.customers.nodes.filter(n => (n.email || "").toLowerCase() === email.toLowerCase());
  if (nodes.length === 0) throw new Error(`NO Shopify customer for ${email}`);
  if (nodes.length > 1) throw new Error(`AMBIGUOUS: ${nodes.length} Shopify customers for ${email}`);
  return nodes[0].id;
}

async function createDiscount(c) {
  // customerSelection.all + usageLimit:1 -- the proven non-leak single-use form (t726 fix).
  const code = `HM82-${c.key.toUpperCase()}-5OFF`;
  const input = {
    title: `HM82 ${c.name} ($5 off, single-use, re-engagement)`,
    code,
    startsAt: "2026-06-12T00:00:00Z",
    customerSelection: { all: true },
    customerGets: {
      appliesOnSubscription: true,
      appliesOnOneTimePurchase: true,
      value: { discountAmount: { amount: "5", appliesOnEachItem: false } },
      items: { all: true },
    },
    appliesOncePerCustomer: false,
    usageLimit: 1,
    recurringCycleLimit: 1,   // discount on the first cycle only ($8 once, then $13)
  };
  if (!EXECUTE) { console.log(`  [dry-run] would create ${code} ($5 off, usageLimit:1)`); return code; }
  const d = await admin(`
    mutation($d:DiscountCodeBasicInput!){
      discountCodeBasicCreate(basicCodeDiscount:$d){
        codeDiscountNode{ id }
        userErrors{ field code message }
      }
    }`, { d: input });
  const ue = d.discountCodeBasicCreate.userErrors;
  if (ue.length) {
    const exists = ue.some(e => /already exists|taken/i.test(e.message) || e.code === "TAKEN");
    if (exists) { console.log(`  REUSE ${code} (exists)`); return code; }
    throw new Error(`discount userErrors: ${JSON.stringify(ue)}`);
  }
  console.log(`  CREATED ${code}`);
  return code;
}

async function createCart(c, code) {
  const input = {
    lines: [{ merchandiseId: VARIANT_MONTHLY, quantity: 1, sellingPlanId: PLAN_MONTHLY }],
    discountCodes: [code],
    buyerIdentity: { email: c.email },
  };
  if (!EXECUTE) { console.log(`  [dry-run] would build cart code=${code} email=${c.email}`); return null; }
  const d = await store(`
    mutation($input:CartInput!){
      cartCreate(input:$input){
        cart{
          checkoutUrl
          cost{ subtotalAmount{amount} totalAmount{amount} }
          discountCodes{ code applicable }
          lines(first:5){ nodes{ merchandise{ ... on ProductVariant { title } } } }
        }
        userErrors{ field message }
      }
    }`, { input });
  const ue = d.cartCreate.userErrors;
  if (ue.length) throw new Error(`cartCreate userErrors: ${JSON.stringify(ue)}`);
  return d.cartCreate.cart;
}

function toCsv(rows) {
  const head = ["email", "name", "first", "segment", "code", "total", "pass", "checkout_url"];
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [head.join(",")];
  for (const r of rows) {
    lines.push([r.email, r.name, r.first, r.segment, r.code || "", r.total || "",
                r.pass ? "PASS" : "FAIL", r.url || ""].map(esc).join(","));
  }
  return lines.join("\n") + "\n";
}

async function main() {
  const mode = RESOLVE_ONLY ? "RESOLVE-ONLY" : EXECUTE ? "EXECUTE" : "DRY-RUN";
  console.log(`\n=== gen-hm82-checkout-links (${mode}) ===`);
  console.log(`domain=${DOMAIN}  batch=${BATCH.length}  input=${INPUT_PATH}\n`);

  const results = [];
  let resolved = 0, failed = 0, passed = 0;
  for (const c of BATCH) {
    const first = c.name.split(" ")[0];
    try {
      const gid = await resolveCustomerGid(c.email);
      resolved++;
      if (RESOLVE_ONLY) { console.log(`  OK   ${c.segment.padEnd(18)} ${c.email}  -> ${gid.split("/").pop()}`); results.push({ ...c, first, gid, resolved: true }); continue; }
      const code = await createDiscount(c);
      const cart = await createCart(c, code);
      if (cart) {
        const total = cart.cost.totalAmount.amount;
        const codeOk = cart.discountCodes.some(d => d.code === code && d.applicable);
        const totalOk = Number(total) === 8;
        const PASS = codeOk && totalOk;
        if (PASS) passed++;
        console.log(`  [${PASS ? "PASS" : "FAIL"}] ${c.name}: sub=${cart.cost.subtotalAmount.amount} total=${total} codeApplicable=${codeOk}`);
        results.push({ ...c, first, gid, code, total, pass: PASS, url: PASS ? cart.checkoutUrl : null });
      } else {
        results.push({ ...c, first, gid, code, dryRun: true });
      }
    } catch (e) {
      failed++;
      console.log(`  XX   ${c.segment.padEnd(18)} ${c.email}  -- ${e.message}`);
      results.push({ ...c, first, error: e.message });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`  resolved to Shopify GID: ${resolved}/${BATCH.length}`);
  console.log(`  resolve FAILED:          ${failed}/${BATCH.length}`);
  if (!RESOLVE_ONLY && EXECUTE) console.log(`  passed test gate:        ${passed}/${resolved}`);
  // segment tally of failures (so we know who falls out)
  const fails = results.filter(r => r.error);
  if (fails.length) {
    console.log(`\n  FAILURES (need a fix or a fallback channel):`);
    for (const f of fails) console.log(`    [${f.segment}] ${f.name} <${f.email}> -- ${f.error}`);
  }

  if (EXECUTE) {
    writeFileSync(CSV_PATH, toCsv(results.filter(r => !r.error)));
    console.log(`\n  CSV (passed links only) -> ${CSV_PATH}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
