// seed-affiliate-samples.mjs  (t815 -- AT affiliate shop sample content)
//
// PURPOSE
//   Seed ONE sample Pick List + two sample Picks so /shop-my-faves renders live
//   immediately after the data model lands. This is placeholder content to prove
//   the read path end-to-end and let the page be visually verified; the REAL bulk
//   populate from Amy's storefront is t816 (due 2026-06-26).
//
//   The two sample picks use real, well-known Amazon product URLs (a Fujifilm
//   Instax printer + a Tombow brush-pen set -- both squarely in Amy's craft/photo
//   wheelhouse) with NO image set, so the card renders its no-image fallback. The
//   Associates tag is appended by the SITE at render (lib/affiliate.ts), never
//   stored here. SiteStripe images come in t816.
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to create the entries live.
//   - Idempotent by handle: each entry is created with a stable `handle`; a
//     re-run looks the handle up first and SKIPS if it already exists.
//   - Tear-down: pass --delete --execute to remove exactly these sample entries
//     (matched by handle), e.g. once t816 has loaded the real lists.
//
// RUN:
//   node scripts/seed-affiliate-samples.mjs              # dry run
//   node scripts/seed-affiliate-samples.mjs --execute    # create samples
//   node scripts/seed-affiliate-samples.mjs --delete --execute   # remove samples

import { readFileSync } from "node:fs";

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
const DELETE = process.argv.includes("--delete");

const PICK_TYPE = "app--345947701249--affiliate_pick";
const LIST_TYPE = "app--345947701249--affiliate_pick_list";

// Stable handles so the seed is idempotent + cleanly removable.
const PICKS = [
  {
    handle: "sample-instax-mini-link-2",
    fields: {
      title: "Fujifilm Instax Mini Link 2 Printer",
      note: "My go-to for printing phone snaps small enough to tuck into a journal. Prints in seconds, fits in a bag.",
      amazon_url: "https://www.amazon.com/dp/B09NLP7WMS",
      active: "true",
      featured: "true",
    },
  },
  {
    handle: "sample-tombow-dual-brush-pens",
    fields: {
      title: "Tombow Dual Brush Pen Art Markers (10-pack)",
      note: "The brush tip I reach for first for lettering and quick color. Blendable, forgiving, endlessly reusable.",
      amazon_url: "https://www.amazon.com/dp/B00OPNI8GG",
      active: "true",
      featured: "false",
    },
  },
];

const LIST = {
  handle: "sample-craft-photo-favorites",
  title: "A few crafty + photo favorites",
  description:
    "A small sample of the things I actually reach for. (Placeholder list -- the full favorites are on their way.)",
  slug: "craft-photo-favorites",
  sort_order: "1",
};

async function mintAdminToken() {
  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
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

async function findByHandle(token, type, handle) {
  const d = await adminQ(token, `query($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) { id handle }
  }`, { handle: { type, handle } });
  return d.metaobjectByHandle;
}

async function createMetaobject(token, type, handle, fields) {
  const d = await adminQ(token, `mutation($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message code }
    }
  }`, {
    metaobject: {
      type,
      handle,
      fields: Object.entries(fields).map(([key, value]) => ({ key, value: String(value) })),
    },
  });
  return d.metaobjectCreate;
}

async function deleteByHandle(token, type, handle) {
  const existing = await findByHandle(token, type, handle);
  if (!existing) { console.log(`  SKIP  ${handle} -- not present`); return; }
  if (!EXECUTE) { console.log(`  WOULD delete ${handle} (${existing.id})`); return; }
  const d = await adminQ(token, `mutation($id: ID!) {
    metaobjectDelete(id: $id) { deletedId userErrors { message } }
  }`, { id: existing.id });
  const ue = d.metaobjectDelete.userErrors;
  console.log(ue.length ? `  ERROR ${handle}: ${JSON.stringify(ue)}` : `  DELETED ${handle}`);
}

async function ensureMetaobject(token, type, handle, fields, label) {
  const existing = await findByHandle(token, type, handle);
  if (existing) { console.log(`  SKIP  ${label} -- exists (${existing.id})`); return existing.id; }
  if (!EXECUTE) { console.log(`  WOULD create ${label} (${handle})`); return null; }
  const r = await createMetaobject(token, type, handle, fields);
  if (r.userErrors.length) { console.error(`  ERROR ${label}:`, JSON.stringify(r.userErrors, null, 2)); throw new Error(`create ${label} failed`); }
  console.log(`  CREATED ${label} -> ${r.metaobject.id}`);
  return r.metaobject.id;
}

async function main() {
  console.log(`\n=== seed-affiliate-samples (t815) (${DELETE ? "DELETE " : ""}${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===`);
  console.log(`domain: ${DOMAIN}  api: ${API}\n`);
  const token = await mintAdminToken();

  if (DELETE) {
    await deleteByHandle(token, LIST_TYPE, LIST.handle);
    for (const p of PICKS) await deleteByHandle(token, PICK_TYPE, p.handle);
    console.log(EXECUTE ? "\nDONE. Samples removed." : "\nDRY-RUN. Re-run with --delete --execute to remove.");
    return;
  }

  // 1) Picks first (the list references their GIDs).
  const pickIds = [];
  for (const p of PICKS) {
    const id = await ensureMetaobject(token, PICK_TYPE, p.handle, p.fields, `Pick "${p.fields.title}"`);
    if (id) pickIds.push(id);
  }

  // 2) List, with picks -> ordered reference GIDs. On a dry run (no ids) preview only.
  const listFields = {
    title: LIST.title,
    description: LIST.description,
    slug: LIST.slug,
    sort_order: LIST.sort_order,
    active: "true",
    featured: "true",
  };
  if (pickIds.length) listFields.picks = JSON.stringify(pickIds);

  await ensureMetaobject(token, LIST_TYPE, LIST.handle, listFields, `List "${LIST.title}"`);

  console.log("");
  console.log(EXECUTE
    ? "DONE. Sample list + picks live. Load /shop-my-faves to see them render."
    : "DRY-RUN. Re-run with --execute to create the sample list + picks.");
}

main().catch((e) => { console.error(e); process.exit(1); });
