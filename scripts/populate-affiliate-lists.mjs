// populate-affiliate-lists.mjs  (t816 -- AT affiliate shop real content)
//
// Creates the real v1 content for /shop-my-faves from scripts/affiliate-picks-data.mjs:
// 5 of Amy's evergreen Amazon idea lists, ~8-10 featured picks each, plus each
// list's "See all N on Amazon" deep-link + total count.
//
// Each pick -> an Affiliate Pick metaobject (title, note, amazon_url = /dp/<ASIN>).
// Each list -> an Affiliate Pick List metaobject (title, description, slug,
//   sort_order, list_url, item_count, picks -> ordered pick refs).
// The Associates tag is appended by the SITE at render (lib/affiliate.ts), so the
// stored amazon_url + list_url are the RAW Amazon URLs. No images (text-forward v1).
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to write live.
//   - Idempotent by handle: picks use handle `pick-<ASIN>`, lists use
//     `list-<slug>`. A re-run UPDATES an existing entry's fields in place rather
//     than duplicating (so editing the data file + re-running is safe).
//   - --delete --execute removes exactly these entries (lists + their picks).
//
// RUN:
//   node scripts/populate-affiliate-lists.mjs            # dry run
//   node scripts/populate-affiliate-lists.mjs --execute  # create/update
//   node scripts/populate-affiliate-lists.mjs --delete --execute   # remove

import { readFileSync } from "node:fs";
import { AFFILIATE_LISTS } from "./affiliate-picks-data.mjs";

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

const dpUrl = (asin) => `https://www.amazon.com/dp/${asin}`;
const listUrl = (id) => `https://www.amazon.com/shop/amytangerine/list/${id}`;
const pickHandle = (asin) => `pick-${asin.toLowerCase()}`;
const listHandle = (slug) => `list-${slug}`;

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

// Create OR update an entry by handle (upsert). Fields is {key: value} (strings).
async function upsert(token, type, handle, fields, label) {
  const existing = await findByHandle(token, type, handle);
  const fieldArr = Object.entries(fields)
    .filter(([, v]) => v != null && v !== "")
    .map(([key, value]) => ({ key, value: String(value) }));

  if (!EXECUTE) {
    console.log(`  WOULD ${existing ? "update" : "create"} ${label} (${handle})`);
    return existing?.id ?? `dry:${handle}`;
  }

  if (existing) {
    const d = await adminQ(token, `mutation($id: ID!, $metaobject: MetaobjectUpdateInput!) {
      metaobjectUpdate(id: $id, metaobject: $metaobject) {
        metaobject { id } userErrors { field message code }
      }
    }`, { id: existing.id, metaobject: { fields: fieldArr } });
    const ue = d.metaobjectUpdate.userErrors;
    if (ue.length) { console.error(`  ERROR update ${label}:`, JSON.stringify(ue)); throw new Error(`update ${label}`); }
    console.log(`  UPDATED ${label}`);
    return existing.id;
  }

  const d = await adminQ(token, `mutation($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id } userErrors { field message code }
    }
  }`, { metaobject: { type, handle, fields: fieldArr } });
  const ue = d.metaobjectCreate.userErrors;
  if (ue.length) { console.error(`  ERROR create ${label}:`, JSON.stringify(ue)); throw new Error(`create ${label}`); }
  console.log(`  CREATED ${label}`);
  return d.metaobjectCreate.metaobject.id;
}

async function deleteByHandle(token, type, handle, label) {
  const existing = await findByHandle(token, type, handle);
  if (!existing) { return; }
  if (!EXECUTE) { console.log(`  WOULD delete ${label} (${handle})`); return; }
  const d = await adminQ(token, `mutation($id: ID!) {
    metaobjectDelete(id: $id) { deletedId userErrors { message } }
  }`, { id: existing.id });
  const ue = d.metaobjectDelete.userErrors;
  console.log(ue.length ? `  ERROR ${label}: ${JSON.stringify(ue)}` : `  DELETED ${label}`);
}

async function main() {
  const nPicks = AFFILIATE_LISTS.reduce((n, l) => n + l.picks.length, 0);
  console.log(`\n=== populate-affiliate-lists (t816) (${DELETE ? "DELETE " : ""}${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===`);
  console.log(`domain: ${DOMAIN}  lists: ${AFFILIATE_LISTS.length}  picks: ${nPicks}\n`);
  const token = await mintAdminToken();

  if (DELETE) {
    for (const list of AFFILIATE_LISTS) {
      await deleteByHandle(token, LIST_TYPE, listHandle(list.slug), `List "${list.title}"`);
      for (const p of list.picks) await deleteByHandle(token, PICK_TYPE, pickHandle(p.asin), `Pick ${p.asin}`);
    }
    console.log(EXECUTE ? "\nDONE. Real content removed." : "\nDRY-RUN. Re-run with --delete --execute.");
    return;
  }

  for (const list of AFFILIATE_LISTS) {
    console.log(`\n[${list.title}]  (${list.picks.length} featured / ${list.count} total)`);
    // 1) Upsert each pick, collecting its GID for the list reference.
    const pickIds = [];
    for (const p of list.picks) {
      const id = await upsert(token, PICK_TYPE, pickHandle(p.asin), {
        title: p.title,
        note: p.note,
        amazon_url: dpUrl(p.asin),
        active: "true",
      }, `Pick "${p.title}"`);
      if (EXECUTE) pickIds.push(id);
    }

    // 2) Upsert the list with picks -> ordered GIDs + deep-link + count.
    const listFields = {
      title: list.title,
      description: list.description,
      slug: list.slug,
      sort_order: String(list.sortOrder),
      list_url: list.listId ? listUrl(list.listId) : "",
      item_count: String(list.count),
      active: "true",
      featured: "false",
    };
    if (EXECUTE && pickIds.length) listFields.picks = JSON.stringify(pickIds);
    await upsert(token, LIST_TYPE, listHandle(list.slug), listFields, `List "${list.title}"`);
  }

  console.log("");
  console.log(EXECUTE
    ? "DONE. Real lists live. Load /shop-my-faves. (Remove the t815 sample: node scripts/seed-affiliate-samples.mjs --delete --execute)"
    : "DRY-RUN. Re-run with --execute to create/update the real lists + picks.");
}

main().catch((e) => { console.error(e); process.exit(1); });
