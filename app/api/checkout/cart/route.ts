// POST /api/checkout/cart
// Creates a Shopify cart from the client-side cart items and returns checkoutUrl.

import { NextResponse } from "next/server"
import { createCart, addToCart } from "@/lib/shopify"

const RETURN_URL = "https://at-site-kappa.vercel.app/thank-you"

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as {
      items: { variantId: string; quantity: number }[]
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 })
    }

    const cart = await createCart()
    let updated = cart
    for (const item of items) {
      updated = await addToCart(updated.id, item.variantId, item.quantity)
    }

    const checkoutUrl = updated.checkoutUrl.includes("?")
      ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(RETURN_URL)}`
      : `${updated.checkoutUrl}?return_to=${encodeURIComponent(RETURN_URL)}`

    return NextResponse.json({ checkoutUrl })
  } catch (err) {
    console.error("[cart checkout]", err)
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 })
  }
}
