// POST /api/checkout/cart
// Creates a Shopify cart from the client-side cart items and returns checkoutUrl.
// Embeds the Shopify cart ID in the return_to URL so /thank-you can
// discriminate "real completion" from "direct nav" and only clear the local
// cart on the former. See t621 (FNF Heidi 2026-05-24 cart-doesn't-clear bug).

import { NextResponse } from "next/server"
import { createCart, addToCart, extractCartToken } from "@/lib/shopify"

const RETURN_BASE = "https://amytangerine.com/thank-you"

export async function POST(request: Request) {
  try {
    const { items, gaClientId } = await request.json() as {
      items: { variantId: string; quantity: number; sellingPlanId?: string }[]
      gaClientId?: string
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    // Attach the GA client_id as a cart attribute so it rides through every
    // checkout path onto the order, where the orders/create webhook reads it to
    // fire the server-side GA4 purchase event in the right session (t687).
    const attributes = gaClientId && /^\d+\.\d+$/.test(gaClientId)
      ? [{ key: "_ga_client_id", value: gaClientId }]
      : undefined

    const cart = await createCart(attributes)
    let updated = cart
    for (const item of items) {
      updated = await addToCart(updated.id, item.variantId, item.quantity, item.sellingPlanId)
    }

    const cartToken = extractCartToken(updated.id)
    const returnUrl = cartToken ? `${RETURN_BASE}?cart_id=${cartToken}` : RETURN_BASE

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

    return NextResponse.json({ checkoutUrl, cartToken })
  } catch (err) {
    console.error("[cart checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
