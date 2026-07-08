// POST /api/checkout/keep
//
// Direct-to-checkout for the /keep renewal landing (cliff campaign, t759/t821).
// Audience: the 116 original SQS 6-month prepaids whose final envelope ships
// July 2026. Creates a fresh Shopify cart with the Happy Mail 6-MONTH line,
// AUTO-APPLIES the ORIGINAL66 loyalty code ($6 off → $66, their original price,
// first term only), and returns the Shopify checkoutUrl for immediate redirect.
//
// ⚠️ CORRECTNESS (same trap as the retired Junklub route, t764): the line MUST
// carry the 6-month SELLING PLAN, not just the variant. The 6mo variant has a
// $12 BASE price; with no selling plan the cart resolves to $12. With
// HM_SELLING_PLAN_6MO attached, the plan's fixed pricing policy governs and the
// line resolves to $72 — then ORIGINAL66 takes $6 off → $66.
//
// The discount is verified server-side: we refuse to hand back a checkout where
// the code did not apply (expired after Aug 3 / deactivated) rather than
// silently selling at full $72. After the offer window closes this route 409s
// with a friendly message pointing at the regular /happy-mail page.

import { NextResponse } from "next/server"
import { createCart, addToCart, applyDiscountCode, extractCartToken } from "@/lib/shopify"
import { HM_VARIANT_6MONTH_GID, HM_SELLING_PLAN_6MO } from "@/lib/happy-mail-content"

const RETURN_BASE = "https://amytangerine.com/thank-you"

// The loyalty code. Auto-applied here; the card/page never ask the customer to
// type it. Override via env without a code change.
const KEEP_DISCOUNT_CODE = process.env.NEXT_PUBLIC_KEEP_DISCOUNT_CODE ?? "ORIGINAL66"

export async function POST(request: Request) {
  try {
    const { gaClientId } = (await request.json().catch(() => ({}))) as { gaClientId?: string }

    // Stamp the GA client_id (so the orders/create webhook attributes the
    // server-side purchase event) and the campaign source (rides on the order).
    const attributes = [
      gaClientId && /^\d+\.\d+$/.test(gaClientId) ? { key: "_ga_client_id", value: gaClientId } : null,
      { key: "_event_source", value: "cliff-2026" },
    ].filter((a): a is { key: string; value: string } => a !== null)

    const cart = await createCart(attributes)

    // THE FIX: attach the 6-month selling plan, not just the variant.
    let updated = await addToCart(cart.id, HM_VARIANT_6MONTH_GID, 1, HM_SELLING_PLAN_6MO)

    // Auto-apply the loyalty discount.
    updated = await applyDiscountCode(updated.id, [KEEP_DISCOUNT_CODE])

    // Guard: never hand back a checkout where the code did not actually apply
    // (expired / deactivated / mistyped) — that would silently sell at full $72.
    const applied = updated.discountCodes.find(
      (d) => d.code.toUpperCase() === KEEP_DISCOUNT_CODE.toUpperCase() && d.applicable,
    )
    if (!applied) {
      console.error("[keep checkout] discount not applicable", {
        code: KEEP_DISCOUNT_CODE,
        discountCodes: updated.discountCodes,
        subtotal: updated.cost.subtotalAmount,
        total: updated.cost.totalAmount,
      })
      return NextResponse.json(
        {
          error:
            "This offer has wrapped up. You can still subscribe anytime at amytangerine.com/happy-mail.",
        },
        { status: 409 },
      )
    }

    const cartToken = extractCartToken(updated.id)
    const params = new URLSearchParams({ source: "keep", channel: "renewal" })
    if (cartToken) params.set("cart_id", cartToken)
    const returnUrl = `${RETURN_BASE}?${params.toString()}`

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error("[keep checkout] error", err)
    return NextResponse.json(
      { error: "Something went wrong starting checkout. Please try again." },
      { status: 500 },
    )
  }
}
