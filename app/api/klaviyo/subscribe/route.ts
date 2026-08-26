// POST /api/klaviyo/subscribe
//
// Klaviyo email capture for the AT site (t1096 first consumer: the /happy-mail/yt
// landing; t1092 inline/footer blocks reuse this). Uses Klaviyo's CLIENT
// subscription endpoint, which needs only the public company id (site id), not
// the private key -- the standard onsite-capture pattern.
//
// Payload in: { email, source, listId? }. `source` becomes the profile's
// `signup_source` custom property (the semantic source of truth per the
// waitlist route's tagging principle -- list membership is not the source).
//
// Behavior when NEXT_PUBLIC_KLAVIYO_COMPANY_ID is unset (deliberate fail-open,
// same pattern as /api/newsletter and /api/waitlist): returns 200 with
// {queued: true} and logs the signup to the Vercel function log, so the page
// works before the env var lands and emails are recoverable from logs. The AT
// Klaviyo account is live (t1090); set the env vars in Vercel when wiring:
//   NEXT_PUBLIC_KLAVIYO_COMPANY_ID = the account's public API key / site id
//   KLAVIYO_YT_LIST_ID             = default list for youtube-landing signups

import { NextResponse } from "next/server"

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID
const DEFAULT_LIST_ID = process.env.KLAVIYO_YT_LIST_ID

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

    if (!COMPANY_ID) {
      console.log("[klaviyo subscribe] fail-open (no company id): ", JSON.stringify({ email, signupSource }))
      return NextResponse.json({ queued: true })
    }

    const body = {
      data: {
        type: "subscription",
        attributes: {
          profile: {
            data: {
              type: "profile",
              attributes: {
                email,
                properties: { signup_source: signupSource },
              },
            },
          },
        },
        ...(list ? { relationships: { list: { data: { type: "list", id: list } } } } : {}),
      },
    }

    const res = await fetch(
      `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", revision: "2024-10-15" },
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
