// POST /api/checkout/class  { slug }  -> { checkoutUrl }
//
// Opens a Shopify checkout holding exactly one class product (t1102). Direct,
// like /api/checkout/gift: the site's cart drawer is never involved, so the
// order carries one class line item for the orders-create webhook to match.
// Availability comes from the Storefront API at the moment of the click, so
// the DRAFT product before class-go-live.mjs --open simply says "not yet".

import { NextResponse } from "next/server"
import { getClass, salesPageVisible, formatUnlockDate } from "@/lib/classes"
import { addToCart, createCart, getProductByHandle } from "@/lib/shopify"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let slug = ""
  try {
    const body = (await request.json()) as { slug?: unknown }
    slug = typeof body.slug === "string" ? body.slug : ""
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 })
  }
  const c = getClass(slug)
  if (!c) return NextResponse.json({ error: "No such class." }, { status: 404 })
  if (!salesPageVisible(c)) return NextResponse.json({ error: "This class is not open for sale yet." }, { status: 409 })
  const notYet = `Checkout opens ${formatUnlockDate(c.sales.onSaleDate)}.`
  try {
    const product = await getProductByHandle(c.sales.productHandle, "US")
    const variant = product?.variants.nodes[0]
    if (!variant?.availableForSale || variant.price.currencyCode !== "USD") {
      return NextResponse.json({ error: notYet }, { status: 409 })
    }
    const cart = await createCart([{ key: "Class", value: c.title }])
    const filled = await addToCart(cart.id, variant.id, 1)
    if (!filled.checkoutUrl) throw new Error("no checkoutUrl")
    return NextResponse.json({ checkoutUrl: filled.checkoutUrl })
  } catch (e) {
    console.error("[class checkout] could not open", slug, (e as Error).message)
    return NextResponse.json({ error: "Checkout could not open. Please try again." }, { status: 502 })
  }
}
