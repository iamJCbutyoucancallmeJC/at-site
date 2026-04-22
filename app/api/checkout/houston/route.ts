// POST /api/checkout/houston
// Creates a Shopify cart with the 6-month Happy Mail variant
// and returns the checkoutUrl for immediate redirect.
// Called client-side from the Houston page button.

import { NextResponse } from "next/server"
import { createCart, addToCart } from "@/lib/shopify"

export async function POST(request: Request) {
  try {
    const { variantId } = await request.json()

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 })
    }

    // Create a fresh cart and add the 6-month variant
    const cart = await createCart()
    const updatedCart = await addToCart(cart.id, variantId, 1)

    // Append return_to so Shopify redirects back to our site after purchase
    // source=houston tags these buyers for analytics
    const returnTo = "https://at-site-kappa.vercel.app/thank-you?source=houston&channel=in-person"
    const checkoutUrl = updatedCart.checkoutUrl.includes("?")
      ? `${updatedCart.checkoutUrl}&return_to=${encodeURIComponent(returnTo)}`
      : `${updatedCart.checkoutUrl}?return_to=${encodeURIComponent(returnTo)}`

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error("[houston checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
