// POST /api/events/capture  { slug, email, firstName?, website? }
//
// Booth capture for the event kit (t1101): a walk-up at the table leaves an
// email on /events/<slug>/booth and lands on the Klaviyo list "Event booth
// signups" (KLAVIYO_EVENT_LIST_ID; falls back to the newsletter list) with
// marketing consent SUBSCRIBED and the event stamped on the profile:
//   signup_source = "event-<slug>" (utm-convention.md: the property is the
//   semantic source), event_name, event_slug, event_city, event_date.
// Same client subscription endpoint as every other capture surface
// (lib/klaviyo-subscribe.ts); the private key is never used here.
//
// Deliberately NOT fail-open like /api/klaviyo/subscribe: this route never
// writes an address to the function log. Unconfigured = 503 and the form says
// so, which at a booth is better than a silent queue nobody drains.
// `website` is a honeypot; bots that fill it get a 200 and nothing happens.

import { NextResponse } from "next/server"
import { getBoothEvent } from "@/lib/events-content"
import { klaviyoConfigured, klaviyoSubscribe } from "@/lib/klaviyo-subscribe"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EVENT_LIST_ID = process.env.KLAVIYO_EVENT_LIST_ID

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      slug?: string
      email?: string
      firstName?: string
      website?: string
    }
    if (body.website) return NextResponse.json({ subscribed: true })

    const event = body.slug ? getBoothEvent(body.slug) : undefined
    if (!event || !event.booth) return NextResponse.json({ error: "Unknown event." }, { status: 404 })

    const email = (body.email ?? "").trim().toLowerCase()
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }

    if (!klaviyoConfigured() && !EVENT_LIST_ID) {
      console.error("[event capture] not configured", { event: event.slug })
      return NextResponse.json({ error: "Signup isn't set up yet. Tell Amy at the table and she'll add you." }, { status: 503 })
    }

    const result = await klaviyoSubscribe(email, `event-${event.slug}`.slice(0, 64), EVENT_LIST_ID, {
      firstName: body.firstName,
      properties: {
        event_name: `${event.title} ${event.city}`,
        event_slug: event.slug,
        event_city: event.city,
        event_date: event.sortDate,
        event_source: event.booth.eventSource,
      },
    })
    if (!result.ok) {
      console.error("[event capture] upstream error", { event: event.slug, status: result.status, detail: result.detail })
      return NextResponse.json({ error: "Signup didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ subscribed: true })
  } catch (err) {
    console.error("[event capture] error", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
