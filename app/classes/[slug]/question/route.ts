// POST /classes/[slug]/question  { body }  -> one new row in the question box.
// Under the class path so the class cookie (scoped to /classes/<slug>) is sent.

import { NextResponse } from "next/server"
import { getClass } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { addQuestion, QUESTION_MAX_CHARS } from "@/lib/class-questions"
import { dbConfigured } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!getClass(slug)) return NextResponse.json({ error: "no such class" }, { status: 404 })
  const claim = await getClassClaim(slug)
  if (!claim) return NextResponse.json({ error: "not in class" }, { status: 401 })
  if (!dbConfigured()) return NextResponse.json({ error: "unavailable" }, { status: 503 })
  let data: { body?: unknown }
  try { data = await req.json() } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }) }
  const body = typeof data.body === "string" ? data.body.trim() : ""
  if (!body) return NextResponse.json({ error: "empty" }, { status: 400 })
  if (body.length > QUESTION_MAX_CHARS) return NextResponse.json({ error: "too long" }, { status: 413 })
  try {
    const r = await addQuestion(claim, body)
    if (r === "limit") return NextResponse.json({ error: "limit" }, { status: 429 })
  } catch (e) {
    console.error("[class question] insert failed", slug, (e as Error).message)
    return NextResponse.json({ error: "save failed" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
