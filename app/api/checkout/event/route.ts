// POST /api/checkout/event  { slug, gaClientId? }
//
// Direct-to-checkout for any booth page (/events/<slug>/booth, t1101). Looks
// the event up in lib/events-content.ts and hands off to lib/event-checkout.
// Verification without a browser or an order: POST { slug } and expect HTTP
// 200 with total 66.00; a 409 means the event's code is not active in Shopify.

import { NextResponse } from "next/server"
import { getBoothEvent } from "@/lib/events-content"
import { createEventCheckout } from "@/lib/event-checkout"

export async function POST(request: Request) {
  try {
    const { slug, gaClientId } = (await request.json().catch(() => ({}))) as { slug?: string; gaClientId?: string }
    const event = slug ? getBoothEvent(slug) : undefined
    if (!event) return NextResponse.json({ error: "Unknown event" }, { status: 404 })
    const result = await createEventCheckout(event, gaClientId)
    if (!result.ok) {
      const { ok: _ok, status, ...rest } = result
      return NextResponse.json(rest, { status })
    }
    const { ok: _ok, ...body } = result
    return NextResponse.json(body)
  } catch (err) {
    console.error("[event checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
