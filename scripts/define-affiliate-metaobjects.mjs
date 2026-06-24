// define-affiliate-metaobjects.mjs  (t815 -- AT affiliate shop data model)
//
// PURPOSE
//   Create the two Shopify metaobject definitions that back the /shop-my-faves
//   affiliate page (spec: affiliate-shop-prd-2026-06-20.md, Decision A):
//
//     1. "Affiliate Pick"      -- one Amazon product card
//          fields: title, note, amazon_url, image, image_url, featured, active
//     2. "Affiliate Pick List" -- a curated collection (mirrors Amy's idea lists)
//          fields: title, description, slug, picks (-> ordered refs to Picks),
//                  featured, active
//
//   These are CONTENT, not products: they never enter the catalog / cart /
//   MarketCatalog (the t625 gotcha cannot apply). Amy edits entries in Shopify
//   Admin (Content > Metaobjects); the public site reads them via the Storefront
//   API. Money flows Amazon -> Associates -> AT, entirely off-platform.
//
// KEY MECHANIC (verified live 2026-06-24)
//   The headless app can ONLY create metaobject definitions under its reserved
//   namespace, so each `type` is passed as `$app:<name>` (resolves to
//   `app--345947701249--<name>`). Access is set so:
//     - admin: MERCHANT_READ_WRITE  -> Amy self-serves in Admin (PRD requirement)
//     - storefront: PUBLIC_READ     -> the Storefront token reads them on-site
//   No scope bump / app re-install is needed. See lib/affiliate.ts for the read.
//
// SAFETY
//   - DRY-RUN by default. Pass --execute to create the definitions live.
//   - Idempotent: skips a definition whose type already exists (looked up first),
//     so re-running never duplicates or clobbers an existing definition.
//   - Creates definitions only. Does NOT create entries (that's t816 populate).
//
// RUN: node scripts/define-affiliate-metaobjects.mjs [--execute]
//   (reads SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_CLIENT_ID / SHOPIFY_ADMIN_CLIENT_SECRET
//    from .env.local, same as set-products-draft.mjs / reconcile-shop-catalog.mjs)

import { readFileSync } from "node:fs";

// --- load .env.local without a dep (mirrors the other AT scripts) ---
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

// The app-namespaced types. `$app:` is required (plain types are NOT_AUTHORIZED).
const PICK_TYPE = "$app:affiliate_pick";
const LIST_TYPE = "$app:affiliate_pick_list";

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

// Look up an existing definition by type. The API stores the RESOLVED type
// (app--<appid>--<name>), but accepts the `$app:<name>` shorthand on lookup too.
async function findDefinition(token, type) {
  const d = await adminQ(token, `query($type: String!) {
    metaobjectDefinitionByType(type: $type) { id type name }
  }`, { type });
  return d.metaobjectDefinitionByType;
}

async function createDefinition(token, definition) {
  const d = await adminQ(token, `mutation($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type name }
      userErrors { field message code }
    }
  }`, { definition });
  return d.metaobjectDefinitionCreate;
}

// --- Definition inputs -------------------------------------------------------

// Both definitions read on the storefront and are merchant-editable in Admin.
const ACCESS = { admin: "MERCHANT_READ_WRITE", storefront: "PUBLIC_READ" };

const PICK_DEFINITION = {
  name: "Affiliate Pick",
  type: PICK_TYPE,
  description: "One Amazon affiliate product card for Amy's Shop My Faves page. Image + title + a short note in Amy's voice + the raw Amazon product URL (the Associates tag is appended at render, not stored here).",
  displayNameKey: "title",
  access: ACCESS,
  fieldDefinitions: [
    { key: "title", name: "Product name", type: "single_line_text_field",
      description: "The product name as it should appear on the card.",
      validations: [{ name: "max", value: "120" }], required: true },
    { key: "note", name: "Amy's note", type: "multi_line_text_field",
      description: "A short note in Amy's voice about why she loves it. Optional but recommended." },
    { key: "amazon_url", name: "Amazon URL", type: "url",
      description: "The RAW Amazon product URL (e.g. https://www.amazon.com/dp/XXXX). Do NOT hand-append a tag -- the site appends Amy's Associates tag automatically.",
      required: true },
    { key: "image", name: "Image (upload)", type: "file_reference",
      description: "Amazon SiteStripe / sanctioned product image, OR a real in-context photo Amy took. NEVER scrape an Amazon listing image.",
      validations: [{ name: "file_type_options", value: "[\"Image\"]" }] },
    { key: "image_url", name: "Image (hosted URL)", type: "url",
      description: "Alternative to uploading: a hosted image URL (e.g. a SiteStripe image link). Used only if no uploaded image is set." },
    { key: "featured", name: "Featured?", type: "boolean",
      description: "Highlight this pick (reserved for future emphasis treatment)." },
    { key: "active", name: "Active?", type: "boolean",
      description: "Uncheck to hide this pick from the site without deleting it (e.g. out of stock / dead link)." },
  ],
};

const LIST_DEFINITION = {
  name: "Affiliate Pick List",
  type: LIST_TYPE,
  description: "A curated collection of Affiliate Picks -- mirrors one of Amy's Amazon idea lists (e.g. 'Photo printer favorites'). The /shop-my-faves page renders one anchor-linkable section per active list.",
  displayNameKey: "title",
  access: ACCESS,
  fieldDefinitions: [
    { key: "title", name: "List title", type: "single_line_text_field",
      description: "Section heading, e.g. 'Photo printer favorites'.",
      validations: [{ name: "max", value: "120" }], required: true },
    { key: "description", name: "List description", type: "multi_line_text_field",
      description: "Optional short intro for this list, in Amy's voice." },
    { key: "slug", name: "Slug (anchor)", type: "single_line_text_field",
      description: "URL-safe anchor for deep-linking, e.g. 'photo-printer-favorites'. Lowercase, hyphens, no spaces.",
      validations: [{ name: "max", value: "80" }] },
    { key: "picks", name: "Picks (ordered)", type: "list.metaobject_reference",
      description: "The Affiliate Picks in this list, in display order.",
      // validations.metaobject_definition_id is patched to the Pick definition's
      // GID at runtime in main() (the Pick is created first).
      validations: [] },
    { key: "sort_order", name: "Sort order", type: "number_integer",
      description: "Lower numbers sort first among lists on the page. Leave blank to sort alphabetically." },
    { key: "featured", name: "Featured?", type: "boolean",
      description: "Highlight this list (reserved for future emphasis treatment)." },
    { key: "active", name: "Active?", type: "boolean",
      description: "Uncheck to hide this entire list from the site without deleting it." },
  ],
};

// --- Main --------------------------------------------------------------------

async function ensureDefinition(token, def, label) {
  const existing = await findDefinition(token, def.type);
  if (existing) {
    console.log(`  SKIP  ${label} -- already exists (${existing.type})`);
    return existing;
  }
  if (!EXECUTE) {
    console.log(`  WOULD create ${label} (${def.type}) with ${def.fieldDefinitions.length} fields`);
    return null;
  }
  const r = await createDefinition(token, def);
  if (r.userErrors.length) {
    console.error(`  ERROR ${label}:`, JSON.stringify(r.userErrors, null, 2));
    throw new Error(`failed to create ${label}`);
  }
  console.log(`  CREATED ${label} -> ${r.metaobjectDefinition.type}  (${r.metaobjectDefinition.id})`);
  return r.metaobjectDefinition;
}

async function main() {
  console.log(`\n=== define-affiliate-metaobjects (t815) (${EXECUTE ? "EXECUTE" : "DRY-RUN"}) ===`);
  console.log(`domain: ${DOMAIN}  api: ${API}\n`);

  const token = await mintAdminToken();

  // 1) Pick first (the list references it).
  const pick = await ensureDefinition(token, PICK_DEFINITION, "Affiliate Pick");

  // 2) Patch the list's picks-reference validation to the Pick definition's GID,
  //    then create the list. The Pick must exist first; on a dry run where no
  //    Pick was created, leave the validation empty (the preview still prints,
  //    and a real --execute run will have the GID).
  const picksField = LIST_DEFINITION.fieldDefinitions.find((f) => f.key === "picks");
  picksField.validations = pick?.id
    ? [{ name: "metaobject_definition_id", value: pick.id }]
    : [];

  await ensureDefinition(token, LIST_DEFINITION, "Affiliate Pick List");

  console.log("");
  if (!EXECUTE) {
    console.log("DRY-RUN complete. Re-run with --execute to create the definitions.");
    console.log("After creating: seed sample entries with scripts/seed-affiliate-samples.mjs --execute,");
    console.log("then the page reads them live via lib/affiliate.ts (Storefront API).");
  } else {
    console.log("DONE. Definitions live. Amy can now author entries in Shopify Admin > Content > Metaobjects.");
    console.log("Next: node scripts/seed-affiliate-samples.mjs --execute   (1 sample list + 2 picks, so the page renders).");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
