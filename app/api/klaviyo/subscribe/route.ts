// POST /api/klaviyo/subscribe
//
// Klaviyo email capture for the AT site (t1092 inline/footer blocks, /join,
// and the /happy-mail/yt landing, t1096). The Klaviyo call itself lives in
// lib/klaviyo-subscribe.ts, shared with /api/newsletter (homepage form).
//
// Payload in: { email, source, listId? }. `source` becomes the profile's
// `signup_source` custom property and the consent record's custom_source.
//
// Behavior while Klaviyo is unconfigured (deliberate fail-open, same pattern
// as /api/newsletter and /api/waitlist): returns 200 with {queued: true} and
// logs the signup to the Vercel function log, so the page works before the
// env vars land and emails are recoverable from logs.

import { NextResponse } from "next/server"
import { klaviyoConfigured, klaviyoSubscribe } from "@/lib/klaviyo-subscribe"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email, source, listId } = (await request.json().catch(() => ({}))) as {
      email?: string
      source?: string
      listId?: string
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    const signupSource = (source || "at-site").slice(0, 64)

    if (!klaviyoConfigured() && !listId) {
      console.log("[klaviyo subscribe] fail-open (missing company id or list): ", JSON.stringify({ email, signupSource }))
      return NextResponse.json({ queued: true })
    }

    const result = await klaviyoSubscribe(email, signupSource, listId)
    if (!result.ok) {
      console.error("[klaviyo subscribe] upstream error", result.status, result.detail)
      return NextResponse.json({ error: "Signup didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ subscribed: true })
  } catch (err) {
    console.error("[klaviyo subscribe] error", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
