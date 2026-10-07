// Saved answers for a class student (server-only).
//
// The student has no account; their credential is the order-keyed class token
// in the cookie. We key rows by a keyed hash of (slug, orderRef) so the table
// never holds the token itself and a leaked dump identifies nobody.

import "server-only"
import { db, dbConfigured } from "@/lib/db"
import type { ClassClaim } from "@/lib/class-access"

const SECRET = process.env.CLASS_ACCESS_SECRET ?? ""

export async function answerKey(claim: ClassClaim): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET || "dev"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${claim.slug}:${claim.orderRef}`))
  return Buffer.from(new Uint8Array(sig)).toString("hex")
}

export type Answer = { key: string; body: string; updated_at: string }

export async function getAnswers(claim: ClassClaim): Promise<Record<string, string>> {
  if (!dbConfigured()) return {}
  const th = await answerKey(claim)
  const rows = (await db()`select key, body from class_answers where class_slug = ${claim.slug} and token_hash = ${th}`) as { key: string; body: string }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.body]))
}

export async function saveAnswer(claim: ClassClaim, key: string, body: string): Promise<void> {
  const th = await answerKey(claim)
  await db()`insert into class_answers (class_slug, token_hash, key, body)
    values (${claim.slug}, ${th}, ${key}, ${body})
    on conflict (class_slug, token_hash, key) do update set body = excluded.body, updated_at = now()`
}

// For JC: every question submitted (key = 'question'), newest first.
export async function listQuestions(slug: string): Promise<{ body: string; updated_at: string }[]> {
  if (!dbConfigured()) return []
  return (await db()`select body, updated_at::text from class_answers where class_slug = ${slug} and key = 'question' and length(body) > 0 order by updated_at desc`) as { body: string; updated_at: string }[]
}
