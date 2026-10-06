// POST /api/klaviyo/hm-waitlist
//
// October 2026 cap waitlist (t1702). Payload in: { email, page? }. Subscribes the
// email to the Klaviyo list HM_WAITLIST_LIST_ID with signup_source
// HM_WAITLIST_SOURCE. Like /api/klaviyo/back-in-stock, this does NOT fail open:
// if the list id is missing or Klaviyo rejects the call, the visitor sees an
// error and can retry, instead of a "saved" that nobody recorded.

import { NextResponse } from "next/server"
import { klaviyoSubscribe } from "@/lib/klaviyo-subscribe"
import { HM_WAITLIST_LIST_ID, HM_WAITLIST_SOURCE } from "@/lib/happy-mail-content"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email, page } = (await request.json().catch(() => ({}))) as { email?: string; page?: string }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (!HM_WAITLIST_LIST_ID) {
      console.error("[hm-waitlist] HM_WAITLIST_LIST_ID is empty; refusing to drop a signup")
      return NextResponse.json({ error: "The waitlist isn't ready yet. Please try again shortly." }, { status: 503 })
    }
    const source = page ? `${HM_WAITLIST_SOURCE} ${page}`.slice(0, 64) : HM_WAITLIST_SOURCE
    const result = await klaviyoSubscribe(email.trim(), source, HM_WAITLIST_LIST_ID)
    if (!result.ok) {
      console.error("[hm-waitlist] upstream error", result.status, result.detail)
      return NextResponse.json({ error: "That didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ subscribed: true })
  } catch (err) {
    console.error("[hm-waitlist] error", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
