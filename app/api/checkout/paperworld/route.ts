// POST /api/checkout/paperworld
//
// Direct-to-checkout for the Seattle Paper World event page (t824). Creates a
// fresh Shopify cart with the Happy Mail 6-MONTH line, AUTO-APPLIES the QR-gated
// event discount, and returns the Shopify checkoutUrl for immediate redirect.
//
// ⚠️ CORRECTNESS (the trap the retired Junklub route fell into, t764): the line
// MUST carry the 6-month SELLING PLAN, not just the variant. After the t764
// per-delivery migration the 6mo variant (52363362861376) has a $12 BASE price;
// with no selling plan the cart resolves to $12 (then minus the event discount =
// a giveaway). With HM_SELLING_PLAN_6MO attached, the plan's fixed pricing
// policy governs and the line resolves to $72 — then the event code takes $6 off
// → $66. The variant + plan GIDs are imported from the single source of truth
// (lib/happy-mail-content) so they can never drift from the live /happy-mail buy.
//
// The discount is verified server-side: applyDiscountCode returns the cart with
// discountCodes[].applicable, and we refuse to hand back a checkout where the
// code did not apply (inactive / expired / out-of-window) rather than silently
// selling at full $72. The PAPERWORLD code stays INACTIVE in Shopify until
// go-live, so this route 409s during preview — that is the intended safe state.

import { NextResponse } from "next/server"
import { createCart, addToCart, applyDiscountCode, extractCartToken } from "@/lib/shopify"
import { HM_VARIANT_6MONTH_GID, HM_SELLING_PLAN_6MO } from "@/lib/happy-mail-content"

const RETURN_BASE = "https://amytangerine.com/thank-you"

// The event discount code. Auto-applied here and surfaced on the page so a
// booth visitor can also type it manually if they reach checkout another way.
// Override per-event via env without a code change.
const EVENT_DISCOUNT_CODE = process.env.NEXT_PUBLIC_PAPERWORLD_DISCOUNT_CODE ?? "PAPERWORLD"

export async function POST(request: Request) {
  try {
    const { gaClientId } = (await request.json().catch(() => ({}))) as { gaClientId?: string }

    // Stamp the GA client_id (so the orders/create webhook attributes the
    // server-side purchase event) and the event source (rides onto the order).
    const attributes = [
      gaClientId && /^\d+\.\d+$/.test(gaClientId) ? { key: "_ga_client_id", value: gaClientId } : null,
      { key: "_event_source", value: "paperworld-seattle" },
    ].filter((a): a is { key: string; value: string } => a !== null)

    const cart = await createCart(attributes)

    // THE FIX: attach the 6-month selling plan, not just the variant.
    let updated = await addToCart(cart.id, HM_VARIANT_6MONTH_GID, 1, HM_SELLING_PLAN_6MO)

    // Auto-apply the event discount.
    updated = await applyDiscountCode(updated.id, [EVENT_DISCOUNT_CODE])

    // Guard: never hand back a checkout where the event code did not actually
    // apply. Shopify returns the code with applicable:false when it is inactive,
    // expired, mistyped, or outside its scheduled window — selling at full $72
    // in that state would be a silent failure, not a discount.
    const applied = updated.discountCodes.find(
      (d) => d.code.toUpperCase() === EVENT_DISCOUNT_CODE.toUpperCase() && d.applicable,
    )
    if (!applied) {
      console.error("[paperworld checkout] discount not applicable", {
        code: EVENT_DISCOUNT_CODE,
        discountCodes: updated.discountCodes,
        subtotal: updated.cost.subtotalAmount,
        total: updated.cost.totalAmount,
      })
      return NextResponse.json(
        { error: "The event discount isn't active yet. Please visit the booth or try again." },
        { status: 409 },
      )
    }

    const cartToken = extractCartToken(updated.id)
    const params = new URLSearchParams({ source: "paperworld", channel: "in-person" })
    if (cartToken) params.set("cart_id", cartToken)
    const returnUrl = `${RETURN_BASE}?${params.toString()}`

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

    return NextResponse.json({
      checkoutUrl,
      cartToken,
      // Echoed back so the page (and manual verification) can confirm the math:
      // subtotal should be $72.00 and total $66.00 with PAPERWORLD applied.
      subtotal: updated.cost.subtotalAmount,
      total: updated.cost.totalAmount,
    })
  } catch (err) {
    console.error("[paperworld checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
