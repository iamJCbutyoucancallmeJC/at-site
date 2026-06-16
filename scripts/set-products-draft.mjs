// set-products-draft.mjs  (t724)
//
// PURPOSE
//   Set the 10 sold-out, unpublished-from-Online-Store products to DRAFT so that
//   "ACTIVE in Admin" once again means "rendered on /shop." Second-order follow-up
//   to t665 (catalog-shop-reconcile-2026-06-07.md): these 10 are status=ACTIVE in
//   Admin but unpublished from the Online Store channel (all inv=0), so they are
//   correctly absent from amytangerine.com/shop yet still counted ACTIVE -- which
//   misleads sessions/Cowork. DRAFT keeps each product + URL recoverable (easy to
//   relist if restocked); the 4 apparel items overlap t382 (print-on-demand) and
//   stay DRAFT (not ARCHIVED) to keep that decision fully open. JC chose all-10-DRAFT
//   on 2026-06-16.
//
//   READ -> MUTATE by HANDLE (never a guessed ID). Confirms each handle resolves to
//   a single ACTIVE product before touching it; skips anything already DRAFT/ARCHIVED
//   or not found, and logs the skip.
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to mutate the live store.
//   - Only flips status ACTIVE -> DRAFT. Does not touch inventory, publications,
//     variants, or pricing. Fully reversible: productUpdate status: ACTIVE per handle.
//   - Verify after with: node scripts/reconcile-shop-catalog.mjs  (DELTA A -> 0).
//
// RUN: node scripts/set-products-draft.mjs [--execute]
//   (reads SHOPIFY_ADMIN_CLIENT_ID/SECRET + SHOPIFY_STORE_DOMAIN from .env.local,
//    same as reconcile-shop-catalog.mjs)

import { readFileSync } from "node:fs";

// --- load .env.local without a dep (mirrors reconcile-shop-catalog.mjs) ---
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
const EXECUTE = process.argv.includes("--execute");

// The 10 handles from t724 (verified live 2026-06-16 via reconcile DELTA A).
const HANDLES = [
  "brush-1-stamp-set-4x6-sakuralala",
  "tn-bundle-a",
  "tn-bundle-b",
  "crafty-premium-unisex-pullover-hoodie",   // apparel (t382)
  "crafty-premium-unisex-sweatshirt",        // apparel (t382)
  "crafty-womens-v-neck-t-shirt",            // apparel (t382)
  "imagine-the-possibilities-unisex-sweatshirt", // apparel (t382)
  "preorder-make-your-mark",
  "clean-out-boxes",
  "travel-watercolor-set",
];

async function mintAdminToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
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

async function lookup(token, handle) {
  const d = await adminQ(token, `
    query($q: String!) {
      products(first: 2, query: $q) {
        nodes { id handle title status totalInventory }
      }
    }`, { q: `handle:${handle}` });
  // handle is unique in Shopify, but query is a contains-ish match -- pin to exact handle.
  return d.products.nodes.filter((p) => p.handle === handle);
}

async function setDraft(token, id) {
  const d = await adminQ(token, `
    mutation($input: ProductInput!) {
      productUpdate(input: $input) {
        product { id handle status }
        userErrors { field message }
      }
    }`, { input: { id, status: "DRAFT" } });
  return d.productUpdate;
}

async function main() {
  console.log(`\n=== set-products-draft (t724) (${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===`);
  console.log(`domain: ${DOMAIN}  api: ${API}  handles: ${HANDLES.length}\n`);

  const token = await mintAdminToken();
  let wouldChange = 0, changed = 0, skipped = 0;

  for (const handle of HANDLES) {
    const matches = await lookup(token, handle);
    if (matches.length === 0) { console.log(`  SKIP  ${handle} -- not found`); skipped++; continue; }
    if (matches.length > 1)   { console.log(`  SKIP  ${handle} -- ${matches.length} matches (ambiguous), not touching`); skipped++; continue; }
    const p = matches[0];
    if (p.status !== "ACTIVE") { console.log(`  SKIP  ${handle} -- already ${p.status}`); skipped++; continue; }

    if (!EXECUTE) {
      console.log(`  WOULD ${handle} -- "${p.title}" (inv=${p.totalInventory})  ACTIVE -> DRAFT`);
      wouldChange++;
    } else {
      const r = await setDraft(token, p.id);
      if (r.userErrors.length) { console.error(`  ERROR ${handle}:`, JSON.stringify(r.userErrors)); skipped++; continue; }
      console.log(`  SET   ${handle} -- "${p.title}"  -> ${r.product.status}`);
      changed++;
    }
  }

  console.log("");
  if (!EXECUTE) {
    console.log(`DRY-RUN complete. ${wouldChange} would change, ${skipped} skipped.`);
    console.log("Re-run with --execute to apply. Then: node scripts/reconcile-shop-catalog.mjs (DELTA A -> 0).");
  } else {
    console.log(`DONE. ${changed} set to DRAFT, ${skipped} skipped.`);
    console.log("Verify: node scripts/reconcile-shop-catalog.mjs (DELTA A should be 0).");
    console.log("Rollback per handle if needed: productUpdate(input:{id, status: ACTIVE}).");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
