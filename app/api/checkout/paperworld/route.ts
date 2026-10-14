// POST /api/checkout/paperworld
//
// Kept as the fixed-alias twin of /api/checkout/event so the documented check
// still works: one POST with {} returns HTTP 200 and total 66.00 when the
// current Paper World stop's code is ACTIVE, 409 when it is not (memory
// at_paperworld_qr_page_reuse, trade-show-pos-checklist.md). Which stop is
// "current" comes from qrAlias "paperworld" in lib/events-content.ts; the
// cart logic lives in lib/event-checkout.ts (t1101).

import { NextResponse } from "next/server"
import { resolveQrAlias } from "@/lib/events-content"
import { createEventCheckout } from "@/lib/event-checkout"

export async function POST(request: Request) {
  try {
    const { gaClientId } = (await request.json().catch(() => ({}))) as { gaClientId?: string }
    const event = resolveQrAlias("paperworld")
    if (!event) return NextResponse.json({ error: "No Paper World stop configured" }, { status: 404 })
    const result = await createEventCheckout(event, gaClientId)
    if (!result.ok) {
      const { ok: _ok, status, ...rest } = result
      return NextResponse.json({ ...rest, event: event.slug }, { status })
    }
    const { ok: _ok, ...body } = result
    return NextResponse.json({ ...body, event: event.slug })
  } catch (err) {
    console.error("[paperworld checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
