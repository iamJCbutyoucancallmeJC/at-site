// POST /api/checkout/yt
//
// Mint-on-click checkout for the /happy-mail/yt YouTube landing (t1096, V6 of
// the happy-mail landing family; growth strategy "V6: YouTube"). Same durable
// shape as /back: the cart is built server-side ON CLICK with the monthly
// SELLING PLAN attached, so the link in a video description can never go stale
// and the purchase is always a real subscription.
//
// Discount: YTHM9 ($4 off the first month -> $9, once per customer, evergreen,
// recurringCycleLimit 1) is applied best-effort. If it does not apply (already
// used by this customer), we PROCEED at the regular $13/mo instead of blocking.
// The page copy matches this.
//
// Cohort wiring: the `_event_source: youtube` cart attribute rides to the
// order's note_attributes (the established junklub/paperworld/back pattern) and
// is the acquisition_source cohort marker, alongside YTHM9 redemptions. GA4
// purchase attribution flows through the orders-create webhook via
// `_ga_client_id` (t687).

import { NextResponse } from "next/server"
import { createCart, addToCart, applyDiscountCode, extractCartToken } from "@/lib/shopify"
import { HM_VARIANT_MONTHLY_GID, HM_SELLING_PLAN_1MO } from "@/lib/happy-mail-content"

const RETURN_BASE = "https://amytangerine.com/thank-you"
const YT_DISCOUNT_CODE = process.env.NEXT_PUBLIC_YT_DISCOUNT_CODE ?? "YTHM9"

export async function POST(request: Request) {
  try {
    const { gaClientId } = (await request.json().catch(() => ({}))) as { gaClientId?: string }

    const attributes = [
      gaClientId && /^\d+\.\d+$/.test(gaClientId) ? { key: "_ga_client_id", value: gaClientId } : null,
      { key: "_event_source", value: "youtube" },
    ].filter((a): a is { key: string; value: string } => a !== null)

    const cart = await createCart(attributes)

    // THE property this route exists to guarantee: the monthly SELLING PLAN.
    let updated = await addToCart(cart.id, HM_VARIANT_MONTHLY_GID, 1, HM_SELLING_PLAN_1MO)

    // Best-effort discount: apply, but never block on it.
    let discountApplied = false
    try {
      const withCode = await applyDiscountCode(updated.id, [YT_DISCOUNT_CODE])
      const applied = withCode.discountCodes.find(
        (d) => d.code.toUpperCase() === YT_DISCOUNT_CODE.toUpperCase() && d.applicable,
      )
      if (applied) {
        updated = withCode
        discountApplied = true
      }
    } catch (e) {
      console.warn("[yt checkout] discount apply failed; proceeding without", e)
    }

    const cartToken = extractCartToken(updated.id)
    const params = new URLSearchParams({ source: "yt", channel: "youtube" })
    if (cartToken) params.set("cart_id", cartToken)
    const returnUrl = `${RETURN_BASE}?${params.toString()}`

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

    return NextResponse.json({ checkoutUrl, discountApplied })
  } catch (err) {
    console.error("[yt checkout] error", err)
    return NextResponse.json(
      { error: "Something went wrong starting checkout. Please try again." },
      { status: 500 },
    )
  }
}
