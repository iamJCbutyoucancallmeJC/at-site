// POST /api/checkout/cart
// Creates a Shopify cart from the client-side cart items and returns checkoutUrl.
// Embeds the Shopify cart ID in the return_to URL so /thank-you can
// discriminate "real completion" from "direct nav" and only clear the local
// cart on the former. See t621 (FNF Heidi 2026-05-24 cart-doesn't-clear bug).

import { NextResponse } from "next/server"
import { createCart, addToCart } from "@/lib/shopify"

const RETURN_BASE = "https://at-site-kappa.vercel.app/thank-you"

// Shopify returns cart IDs like "gid://shopify/Cart/<token>?key=<key>".
// Strip down to just the opaque token for use as the discriminator.
function extractCartToken(gid: string): string {
  const m = gid.match(/\/Cart\/([^?]+)/)
  return m ? m[1] : ""
}

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as {
      items: { variantId: string; quantity: number; sellingPlanId?: string }[]
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const cart = await createCart()
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
