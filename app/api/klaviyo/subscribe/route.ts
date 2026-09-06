// POST /api/klaviyo/subscribe
//
// Klaviyo email capture for the AT site (t1092 inline/footer blocks, /join,
// and the /happy-mail/yt landing, t1096). Uses Klaviyo's CLIENT subscription
// endpoint, which needs only the public company id (site id), never the
// private key -- the standard onsite-capture pattern.
//
// Payload in: { email, source, listId? }. `source` becomes the profile's
// `signup_source` custom property (the semantic source of truth per the
// waitlist route's tagging principle -- list membership is not the source)
// and also the consent record's custom_source, which is what Klaviyo shows in
// the profile's timeline ("Subscribed via amytangerine.com footer").
//
// Klaviyo's client endpoint REQUIRES a list relationship (docs, revision
// 2025-07-15), so the default list is part of the wiring, not an option:
//   NEXT_PUBLIC_KLAVIYO_COMPANY_ID = the account's public API key / site id
//   KLAVIYO_NEWSLETTER_LIST_ID     = the newsletter list new signups join
// Behavior while either is unset (deliberate fail-open, same pattern as
// /api/newsletter and /api/waitlist): returns 200 with {queued: true} and logs
// the signup to the Vercel function log, so the page works before the env vars
// land and emails are recoverable from logs.

import { NextResponse } from "next/server"

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID
const DEFAULT_LIST_ID = process.env.KLAVIYO_NEWSLETTER_LIST_ID
const KLAVIYO_REVISION = "2025-07-15"

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
    const list = listId || DEFAULT_LIST_ID

    if (!COMPANY_ID || !list) {
      console.log(
        "[klaviyo subscribe] fail-open (missing company id or list): ",
        JSON.stringify({ email, signupSource, hasCompanyId: !!COMPANY_ID, hasList: !!list }),
      )
      return NextResponse.json({ queued: true })
    }

    const body = {
      data: {
        type: "subscription",
        attributes: {
          custom_source: `amytangerine.com ${signupSource}`,
          profile: {
            data: {
              type: "profile",
              attributes: {
                email,
                properties: { signup_source: signupSource },
                subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
              },
            },
          },
        },
        relationships: { list: { data: { type: "list", id: list } } },
      },
    }

    const res = await fetch(
      `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", revision: KLAVIYO_REVISION },
        body: JSON.stringify(body),
      },
    )
    // Klaviyo's client endpoint returns 202 with an empty body on success.
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      console.error("[klaviyo subscribe] upstream error", res.status, detail.slice(0, 300))
      return NextResponse.json({ error: "Signup didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ subscribed: true })
  } catch (err) {
    console.error("[klaviyo subscribe] error", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
