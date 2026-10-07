// POST /classes/[slug]/answer (under the class path so the class cookie, scoped to /classes/<slug>, is sent)  { key, body }  -> upsert the student's answer.
// Requires the class cookie. Keys are short slugs; bodies are capped.

import { NextResponse } from "next/server"
import { getClass } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { saveAnswer } from "@/lib/class-answers"
import { dbConfigured } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!getClass(slug)) return NextResponse.json({ error: "no such class" }, { status: 404 })
  const claim = await getClassClaim(slug)
  if (!claim) return NextResponse.json({ error: "not in class" }, { status: 401 })
  if (!dbConfigured()) return NextResponse.json({ error: "saving unavailable" }, { status: 503 })
  let data: { key?: unknown; body?: unknown }
  try { data = await req.json() } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }) }
  const key = typeof data.key === "string" ? data.key : ""
  const body = typeof data.body === "string" ? data.body : ""
  if (!/^[a-z0-9-]{1,40}$/.test(key)) return NextResponse.json({ error: "bad key" }, { status: 400 })
  if (body.length > 8000) return NextResponse.json({ error: "too long" }, { status: 413 })
  try {
    await saveAnswer(claim, key, body)
  } catch (e) {
    console.error("[class answer] save failed", slug, key, (e as Error).message)
    return NextResponse.json({ error: "save failed" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
