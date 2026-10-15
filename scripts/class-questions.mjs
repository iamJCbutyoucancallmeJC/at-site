// The question box, from the terminal (t1651).
//
//   node scripts/class-questions.mjs --migrate          create the table (idempotent)
//   node scripts/class-questions.mjs [slug]             print every question, newest first
//
// Reads DATABASE_URL from .env.local (same Neon database Vercel uses). The
// browser view with names and emails is /preview/classes/<slug>/questions.

import { readFileSync } from "node:fs"
import { neon } from "@neondatabase/serverless"

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")] }),
)
if (!env.DATABASE_URL) { console.error("DATABASE_URL missing from .env.local"); process.exit(1) }
const sql = neon(env.DATABASE_URL)

const args = process.argv.slice(2)
if (args.includes("--migrate")) {
  await sql`create table if not exists class_questions (
    id bigserial primary key,
    class_slug text not null,
    order_ref text not null,
    body text not null,
    created_at timestamptz not null default now()
  )`
  await sql`create index if not exists class_questions_slug_created on class_questions (class_slug, created_at desc)`
  console.log("class_questions ready")
  process.exit(0)
}

const slug = args.find((a) => !a.startsWith("--")) ?? "glimmers"
const rows = await sql`select order_ref, body, created_at from class_questions where class_slug = ${slug} order by created_at desc`
console.log(`${rows.length} question(s) for ${slug}\n`)
for (const r of rows) {
  const when = new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  console.log(`[${when}] order #${r.order_ref}\n${r.body}\n`)
}
