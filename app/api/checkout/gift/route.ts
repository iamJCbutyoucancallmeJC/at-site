import { NextResponse } from "next/server"
import { createGiftCart, getProductByHandle } from "@/lib/shopify"
import { GIFT_CHECKOUT_ENABLED, GIFT_HANDLE, GIFT_PRICE, GIFT_VARIANT, giftProperties, parseGiftDetails } from "@/lib/gift"
import { hmIsClosed } from "@/lib/happy-mail-content"
import { adClickAttributes } from "@/lib/ad-conversions"

export async function POST(request: Request) {
  let gift
  let adClickIds: unknown
  try {
    const body = await request.json()
    adClickIds = body && typeof body === "object" ? (body as { adClickIds?: unknown }).adClickIds : undefined
    gift = parseGiftDetails(body)
  }
  catch { return NextResponse.json({ error: "Check the gift details and try again." }, { status: 400 }) }
  if (!gift) return NextResponse.json({ error: "Enter the recipient's name and email, your name, and a start choice." }, { status: 400 })
  if (!GIFT_CHECKOUT_ENABLED) return NextResponse.json({ error: "Gift checkout is not open yet. Please check back soon." }, { status: 409 })
  // Redemption is immediate and takes place outside this site. Do not let gifting
  // bypass the operational Happy Mail cap, even for a requested January start.
  if (hmIsClosed()) return NextResponse.json({ error: "Happy Mail is full for now. Please join the waitlist at /happy-mail." }, { status: 409 })
  try {
    const product = await getProductByHandle(GIFT_HANDLE)
    const variant = product?.variants.nodes.find((v) => v.id === GIFT_VARIANT)
    if (!variant?.availableForSale || variant.price.currencyCode !== "USD" || Number(variant.price.amount) !== GIFT_PRICE) {
      return NextResponse.json({ error: "Gift checkout is not open yet. Please check back soon." }, { status: 409 })
    }
    const cart = await createGiftCart(GIFT_VARIANT, giftProperties(gift), adClickAttributes(adClickIds))
    // Separate gift checkout: no recipient address or buyer identity is set here.
    return NextResponse.json({ checkoutUrl: cart.checkoutUrl })
  } catch {
    // Gift details are personal: never log the request or Shopify's echoed input.
    console.error("[gift checkout] Shopify checkout could not be created")
    return NextResponse.json({ error: "Gift checkout could not open. Please try again." }, { status: 502 })
  }
}
