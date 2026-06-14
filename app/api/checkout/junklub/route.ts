// POST /api/checkout/junklub
// Creates a Shopify cart with the 6-month Happy Mail variant, auto-applies the
// JUNKLUB event discount ($6 off -> $66), and returns the checkoutUrl for
// immediate redirect. Called client-side from the Junklub event page button.
//
// The discount is gated by the QR code, not by a typed code: only attendees who
// scan Amy's QR reach this page, and the button applies JUNKLUB for them so the
// checkout shows $66 with nothing to type.

import { NextResponse } from "next/server"
import { createCart, addToCart } from "@/lib/shopify"

// Event discount code created in the live store (Jun 13 -> Jun 22, 2026).
// $6 off, scoped to the 6-month Happy Mail variant only.
const EVENT_DISCOUNT_CODE = "JUNKLUB"

export async function POST(request: Request) {
  try {
    const { variantId } = await request.json()

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 })
    }

    // Create a fresh cart and add the 6-month variant
    const cart = await createCart()
    const updatedCart = await addToCart(cart.id, variantId, 1)

    // Auto-apply the event discount + tag the source for analytics, both via the
    // checkout URL. Shopify reads ?discount=CODE and applies it on the cart.
    const base = new URL(updatedCart.checkoutUrl)
    base.searchParams.set("discount", EVENT_DISCOUNT_CODE)

    const returnTo =
      "https://amytangerine.com/thank-you?source=junklub&channel=in-person"
    base.searchParams.set("return_to", returnTo)

    return NextResponse.json({ checkoutUrl: base.toString() })
  } catch (err) {
    console.error("[junklub checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
