// Adds the `preview-ready` tag to the 8 evergreen printables so they surface on
// /preview/shop. Additive (tagsAdd) and reversible (tagsRemove). DRY-RUN by default.
//   node scripts/tag-preview-ready-2026-06-16.mjs            # dry run
//   node scripts/tag-preview-ready-2026-06-16.mjs --commit   # apply
//   node scripts/tag-preview-ready-2026-06-16.mjs --remove --commit  # undo
import fs from "node:fs"

const TOKEN = fs.readFileSync("/tmp/at-admin-token.txt", "utf8").trim()
const SHOP = "https://q9x1sj-hc.myshopify.com/admin/api/2026-04/graphql.json"
const COMMIT = process.argv.includes("--commit")
const REMOVE = process.argv.includes("--remove")
const TAG = "preview-ready"

// The 8 evergreen, recovered + staged, that form the v1 printables shop.
const GIDS = {
  "Self Love": "10141873799488",
  "Permission Slip": "10141873766720",
  "Colors Shine": "10141873865024",
  "Discover a World": "10141873570112",
  "Grounded & Guided": "10141873602880",
  "Things to Remember": "10141873832256",
  "Trust Yourself": "10141876191552",
  "Good Thoughts": "10141878059328",
}

async function gql(query, variables) {
  const res = await fetch(SHOP, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

const MUT = REMOVE
  ? `mutation($id: ID!, $tags: [String!]!) { tagsRemove(id: $id, tags: $tags) { userErrors { message } } }`
  : `mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }`

const action = REMOVE ? "REMOVE" : "ADD"
console.log(`${COMMIT ? "" : "DRY RUN: would "}${action} tag '${TAG}' on ${Object.keys(GIDS).length} products\n`)

for (const [name, id] of Object.entries(GIDS)) {
  const gid = `gid://shopify/Product/${id}`
  if (!COMMIT) {
    console.log(`  would ${action.toLowerCase()}  ${name}`)
    continue
  }
  const field = REMOVE ? "tagsRemove" : "tagsAdd"
  const data = await gql(MUT, { id: gid, tags: [TAG] })
  const errs = data[field].userErrors
  console.log(`  ${errs.length ? "ERROR " + JSON.stringify(errs) : "ok   "} ${name}`)
}
console.log(COMMIT ? "\nDone." : "\nDry run only. Re-run with --commit to apply.")
