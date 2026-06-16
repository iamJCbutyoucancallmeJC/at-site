// hm82-redemptions.mjs
//
// Reports which HM82-{KEY}-5OFF codes have been redeemed (= customer re-carded + paid the $8).
// The authoritative re-engagement signal. Used for:
//   - Send-2 (Mon Jun 15 AM) suppression: drop anyone who already redeemed.
//   - Tue Jun 16 catch-up print pull: whoever redeemed by EOD Mon makes the June envelope.
//
// READ-ONLY. Mints an admin token via client_credentials (same as gen-hm82-checkout-links.mjs).
// RUN:  node scripts/hm82-redemptions.mjs
//   (needs SHOPIFY_ADMIN_CLIENT_ID/SECRET + SHOPIFY_STORE_DOMAIN in .env.local)

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

async function mintToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
      client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("mint failed: " + JSON.stringify(j));
  return j.access_token;
}

async function main() {
  const TOKEN = await mintToken();
  const admin = (q, v) =>
    fetch(`https://${DOMAIN}/admin/api/2026-07/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
      body: JSON.stringify({ query: q, variables: v }),
    }).then((r) => r.json());

  let cursor = null;
  const codes = [];
  for (let page = 0; page < 20; page++) {
    const d = await admin(
      `query($cursor:String){ codeDiscountNodes(first:100, after:$cursor, query:"HM82"){ pageInfo{ hasNextPage endCursor } nodes{ codeDiscount{ ... on DiscountCodeBasic { codes(first:1){nodes{code}} asyncUsageCount } } } } }`,
      { cursor }
    );
    if (d.errors) throw new Error("GraphQL: " + JSON.stringify(d.errors));
    const conn = d.data.codeDiscountNodes;
    for (const n of conn.nodes) {
      const cb = n.codeDiscount;
      const code = cb?.codes?.nodes?.[0]?.code || "";
      if (!code.startsWith("HM82-")) continue;
      codes.push({ code, used: cb.asyncUsageCount || 0, test: /TEST|SYNTH/.test(code) });
    }
    if (!conn.pageInfo.hasNextPage) break;
    cursor = conn.pageInfo.endCursor;
  }

  const real = codes.filter((c) => !c.test);
  const redeemed = real.filter((c) => c.used > 0);
  console.log(`\n=== HM82 REDEMPTIONS (${new Date().toISOString()}) ===`);
  console.log(`real codes: ${real.length}   redeemed: ${redeemed.length}   conversion: ${((redeemed.length / real.length) * 100).toFixed(1)}%`);
  console.log(`\nREDEEMED (re-carded + paid $8 -> pull for June envelope):`);
  for (const c of redeemed.sort((a, b) => a.code.localeCompare(b.code))) {
    console.log(`  ${c.code.replace(/^HM82-/, "").replace(/-5OFF$/, "")}`);
  }
  if (!redeemed.length) console.log("  (none yet)");
}

main().catch((e) => { console.error(e); process.exit(1); });
