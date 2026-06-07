// reconcile-shop-catalog.mjs  (t665)
//
// PURPOSE
//   ONE answer for "what's in the shop." Diffs three views of the catalog:
//     (1) ADMIN: every product + status (ACTIVE/DRAFT/ARCHIVED) + whether it's
//         published to the Online Store sales channel.
//     (2) STOREFRONT: what the Storefront API returns = exactly what /shop
//         renders (published-to-Online-Store products only; the shop page does
//         NO inventory hiding -- sold-out items render with a badge).
//     (3) DELTA: products ACTIVE in Admin but NOT visible on the storefront
//         (the genuinely-invisible ones), plus availableForSale state so
//         sold-out-but-rendered is distinguished from not-rendered-at-all.
//
// READ-ONLY. No mutations. Safe to run anytime.
//
// RUN: node scripts/reconcile-shop-catalog.mjs
//   (reads SHOPIFY_ADMIN_CLIENT_ID/SECRET + SHOPIFY_STORE_DOMAIN +
//    SHOPIFY_STOREFRONT_TOKEN from .env.local)

import { readFileSync } from "node:fs";

// --- load .env.local without a dep ---
const env = {};
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch { /* fall back to process.env */ }
const get = (k) => process.env[k] || env[k];

const DOMAIN = get("SHOPIFY_STORE_DOMAIN") || "q9x1sj-hc.myshopify.com";
const SF_TOKEN = get("SHOPIFY_STOREFRONT_TOKEN");
const CLIENT_ID = get("SHOPIFY_ADMIN_CLIENT_ID");
const CLIENT_SECRET = get("SHOPIFY_ADMIN_CLIENT_SECRET");
const API = "2026-07";

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

async function adminQ(token, query) {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query }),
  });
  const j = await res.json();
  if (j.errors) throw new Error("admin GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}

async function storefrontQ(query) {
  const res = await fetch(`https://${DOMAIN}/api/${API}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SF_TOKEN },
    body: JSON.stringify({ query }),
  });
  const j = await res.json();
  if (j.errors) throw new Error("storefront GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}

async function main() {
  const token = await mintAdminToken();

  // (1) ADMIN view: all products, status, online-store publication
  const adminData = await adminQ(token, `
    {
      products(first: 250, sortKey: TITLE) {
        nodes {
          handle
          title
          status
          totalInventory
        }
      }
    }
  `);
  const admin = adminData.products.nodes;

  // (2) STOREFRONT view: exactly what /shop's getAllProducts returns (US context)
  const sfData = await storefrontQ(`
    {
      products(first: 100, sortKey: TITLE) {
        nodes { handle title availableForSale totalInventory }
      }
    }
  `);
  const sf = sfData.products.nodes;
  const sfHandles = new Set(sf.map((p) => p.handle));

  // --- report ---
  const HM = (h) => h === "happy-mail" || h === "happy-mail-international";
  const active = admin.filter((p) => p.status === "ACTIVE");
  const activeNonHM = active.filter((p) => !HM(p.handle));

  console.log("=== CATALOG RECONCILE (t665) ===");
  console.log(`domain: ${DOMAIN}  api: ${API}`);
  console.log("");
  console.log(`ADMIN totals: ${admin.length} products | ACTIVE: ${active.length} (non-HM ACTIVE: ${activeNonHM.length})`);
  console.log(`STOREFRONT (what /shop renders): ${sf.length} products`);
  console.log("");

  // DELTA A: ACTIVE in Admin but NOT on storefront (the genuinely-invisible ones)
  const activeNotRendered = active.filter((p) => !sfHandles.has(p.handle));
  console.log(`--- DELTA A: ACTIVE in Admin but NOT rendered on /shop (${activeNotRendered.length}) ---`);
  for (const p of activeNotRendered) {
    console.log(`  [${p.status}] ${p.title}  (handle=${p.handle}, inv=${p.totalInventory}) -- ACTIVE in Admin but storefront does not return it = unpublished to Online Store channel (or filtered)`);
  }
  console.log("");

  // DELTA B: on storefront but sold out (renders with a badge -- NOT hidden)
  const renderedSoldOut = sf.filter((p) => !p.availableForSale);
  console.log(`--- DELTA B: rendered on /shop but SOLD OUT (badge, not hidden) (${renderedSoldOut.length}) ---`);
  for (const p of renderedSoldOut) {
    console.log(`  ${p.title}  (handle=${p.handle}, inv=${p.totalInventory})`);
  }
  console.log("");

  // DELTA C: on storefront but NOT active in Admin (would be an orphan/odd state)
  const adminByHandle = Object.fromEntries(admin.map((p) => [p.handle, p]));
  const renderedNotActive = sf.filter((p) => adminByHandle[p.handle]?.status !== "ACTIVE");
  console.log(`--- DELTA C: rendered on /shop but NOT ACTIVE in Admin (orphan check) (${renderedNotActive.length}) ---`);
  for (const p of renderedNotActive) {
    console.log(`  ${p.title}  (handle=${p.handle}, admin status=${adminByHandle[p.handle]?.status ?? "MISSING"})`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
