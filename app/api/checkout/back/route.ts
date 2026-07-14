// POST /api/checkout/back
//
// Mint-on-click checkout for the /back re-collection landing (t766 ghost arc).
// Born from the 2026-07-14 "ghost link own-goals" incident: stored cart links died
// at their deadline, and the replacement cart PERMALINK silently dropped the
// selling plan (one-time purchase, no card vaulted, shipping charged). This route
// is the durable shape: the cart is built server-side ON CLICK with the monthly
// SELLING PLAN attached, so it cannot go stale and cannot lose the subscription.
//
// Discount behavior differs from /keep on purpose: WELCOMEBACK5 ($5 first month,
// once per customer, expires Jul 31) is applied best-effort. If it does not apply
// (expired / already used by this customer), we PROCEED at the regular $13/mo
// instead of blocking — the subscription is the goal, the discount is a bonus.
// The page copy matches this ("applies automatically through July 31").

import { NextResponse } from "next/server"
import { createCart, addToCart, applyDiscountCode, extractCartToken } from "@/lib/shopify"
import { HM_VARIANT_MONTHLY_GID, HM_SELLING_PLAN_1MO } from "@/lib/happy-mail-content"

const RETURN_BASE = "https://amytangerine.com/thank-you"
const BACK_DISCOUNT_CODE = process.env.NEXT_PUBLIC_BACK_DISCOUNT_CODE ?? "WELCOMEBACK5"

export async function POST(request: Request) {
  try {
    const { gaClientId } = (await request.json().catch(() => ({}))) as { gaClientId?: string }

    const attributes = [
      gaClientId && /^\d+\.\d+$/.test(gaClientId) ? { key: "_ga_client_id", value: gaClientId } : null,
      { key: "_event_source", value: "ghost-back-2026" },
    ].filter((a): a is { key: string; value: string } => a !== null)

    const cart = await createCart(attributes)

    // THE property this route exists to guarantee: the monthly SELLING PLAN.
    let updated = await addToCart(cart.id, HM_VARIANT_MONTHLY_GID, 1, HM_SELLING_PLAN_1MO)

    // Best-effort discount: apply, but never block on it.
    let discountApplied = false
    try {
      const withCode = await applyDiscountCode(updated.id, [BACK_DISCOUNT_CODE])
      const applied = withCode.discountCodes.find(
        (d) => d.code.toUpperCase() === BACK_DISCOUNT_CODE.toUpperCase() && d.applicable,
      )
      if (applied) {
        updated = withCode
        discountApplied = true
      }
    } catch (e) {
      console.warn("[back checkout] discount apply failed; proceeding without", e)
    }

    const cartToken = extractCartToken(updated.id)
    const params = new URLSearchParams({ source: "back", channel: "re-collection" })
    if (cartToken) params.set("cart_id", cartToken)
    const returnUrl = `${RETURN_BASE}?${params.toString()}`

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

    return NextResponse.json({ checkoutUrl, discountApplied })
  } catch (err) {
    console.error("[back checkout] error", err)
    return NextResponse.json(
      { error: "Something went wrong starting checkout. Please try again." },
      { status: 500 },
    )
  }
}
