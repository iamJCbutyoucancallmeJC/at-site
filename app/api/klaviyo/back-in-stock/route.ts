// POST /api/klaviyo/back-in-stock
//
// "Email me when it's back" on sold-out product pages (t1093). Payload in:
// { email, variantId } where variantId is the Shopify variant GID the PDP
// already has. The Klaviyo call lives in lib/klaviyo-subscribe.ts.
// Unlike /api/klaviyo/subscribe this does NOT fail open: a signup that isn't
// recorded would mean a promise to email someone that nobody keeps.

import { NextResponse } from "next/server"
import { klaviyoBackInStock } from "@/lib/klaviyo-subscribe"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const { email, variantId } = (await request.json().catch(() => ({}))) as {
      email?: string
      variantId?: string
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
    }
    if (!variantId || !variantId.startsWith("gid://shopify/ProductVariant/")) {
      return NextResponse.json({ error: "Missing product." }, { status: 400 })
    }
    const result = await klaviyoBackInStock(email, variantId)
    if (!result.ok) {
      console.error("[klaviyo back-in-stock] upstream error", result.status, result.detail)
      return NextResponse.json({ error: "That didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ subscribed: true })
  } catch (err) {
    console.error("[klaviyo back-in-stock] error", err)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
