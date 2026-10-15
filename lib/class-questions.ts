// The question box (t1651): questions a student leaves for Amy on the class
// home. Append-only, one row per send, server-only. Separate from the saved
// answers (lib/class-answers.ts) because those are the student's own notes,
// keyed by a hash so no row names anyone; a question is addressed TO Amy, so
// the row keeps the order number in plain. That is the handle JC and help@
// already use to find the buyer in Shopify, and the read view
// (/preview/classes/<slug>/questions) turns it into a name and email.
//
// Table (created by scripts/class-questions.mjs --migrate):
//   class_questions(id bigserial, class_slug text, order_ref text,
//                   body text, created_at timestamptz default now())

import "server-only"
import { db, dbConfigured } from "@/lib/db"
import type { ClassClaim } from "@/lib/class-access"

export const QUESTION_MAX_CHARS = 2000
// A student can ask more than once, but not without end.
export const QUESTIONS_PER_ORDER = 20

export type Question = { id: number; body: string; created_at: string }
export type QuestionRow = Question & { order_ref: string }

export async function addQuestion(claim: ClassClaim, body: string): Promise<"ok" | "limit"> {
  const sql = db()
  const [{ n }] = (await sql`select count(*)::int as n from class_questions where class_slug = ${claim.slug} and order_ref = ${claim.orderRef}`) as { n: number }[]
  if (n >= QUESTIONS_PER_ORDER) return "limit"
  await sql`insert into class_questions (class_slug, order_ref, body) values (${claim.slug}, ${claim.orderRef}, ${body})`
  return "ok"
}

// The student's own sent questions, oldest first (shown back under the box).
export async function myQuestions(claim: ClassClaim): Promise<Question[]> {
  if (!dbConfigured()) return []
  return (await db()`select id, body, created_at::text from class_questions where class_slug = ${claim.slug} and order_ref = ${claim.orderRef} order by created_at asc`) as Question[]
}

// For JC: every question for a class, newest first.
export async function allQuestions(slug: string): Promise<QuestionRow[]> {
  if (!dbConfigured()) return []
  return (await db()`select id, order_ref, body, created_at::text from class_questions where class_slug = ${slug} order by created_at desc`) as QuestionRow[]
}
