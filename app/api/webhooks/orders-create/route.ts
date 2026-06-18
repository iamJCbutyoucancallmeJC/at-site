// POST /api/webhooks/orders-create
//
// Shopify orders/create webhook -> GA4 server-side `purchase` event via the
// Measurement Protocol. This catches EVERY order regardless of checkout path
// (Shop Pay, plain card, draft, POS), which the browser /thank-you approach
// could not: Shop Pay keeps the buyer on Shopify's own thank-you page and never
// redirects back to our site. See t687.
//
// Session stitching: the GA client_id is captured browser-side at checkout
// (cart-drawer readGaClientId) and stored as the `_ga_client_id` cart attribute,
// which rides through to the order's note_attributes. We read it back here so
// the purchase joins the buyer's existing GA4 session instead of looking like a
// brand-new anonymous user. If it's missing (consent-blocked, etc.) we fall back
// to a deterministic synthetic id so revenue is still counted, just unattributed.

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // need the raw body for HMAC; keep it simple

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? ""
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""
const GA_MP_API_SECRET = process.env.GA_MP_API_SECRET ?? ""

// Verify the Shopify webhook HMAC (base64 of HMAC-SHA256 over the raw body).
async function verifyShopifyHmac(rawBody: string, headerHmac: string): Promise<boolean> {
  if (!SHOPIFY_WEBHOOK_SECRET || !headerHmac) return false
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SHOPIFY_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody))
  const computed = Buffer.from(new Uint8Array(sig)).toString("base64")
  // Constant-time compare.
  if (computed.length !== headerHmac.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ headerHmac.charCodeAt(i)
  return diff === 0
}

type ShopifyLineItem = { sku: string | null; title: string | null; price: string; quantity: number }
type ShopifyOrder = {
  id: number
  name: string
  total_price: string
  currency: string
  note_attributes?: { name: string; value: string }[]
  line_items?: ShopifyLineItem[]
}

export async function POST(request: Request) {
  // Read the raw body BEFORE parsing — HMAC is over the exact bytes Shopify sent.
  const rawBody = await request.text()
  const headerHmac = request.headers.get("x-shopify-hmac-sha256") ?? ""

  const ok = await verifyShopifyHmac(rawBody, headerHmac)
  if (!ok) {
    // 401 tells Shopify the delivery failed auth; it will retry, which is fine —
    // a real misconfiguration surfaces as repeated 401s in the webhook log.
    return NextResponse.json({ error: "invalid hmac" }, { status: 401 })
  }

  if (!GA_MEASUREMENT_ID || !GA_MP_API_SECRET) {
    console.error("[orders-create] GA env missing; acking webhook without sending")
    return NextResponse.json({ ok: true, sent: false, reason: "ga-env-missing" })
  }

  let order: ShopifyOrder
  try {
    order = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 })
  }

  // Pull the GA client_id we stashed at checkout. note_attributes mirror the
  // cart attributes set in /api/checkout/cart.
  const attrs = order.note_attributes ?? []
  const gaClientId = attrs.find((a) => a.name === "_ga_client_id")?.value || ""
  // Fallback: deterministic per-order synthetic id so the event still lands
  // (revenue counted) even when no cid was captured. Not session-attributable.
  const clientId = gaClientId || `${order.id}.0`

  const items = (order.line_items ?? []).map((li) => ({
    item_id: li.sku || li.title || "",
    item_name: li.title || "",
    price: Number(li.price),
    quantity: li.quantity,
  }))

  const payload = {
    client_id: clientId,
    // Dedup hint: GA4 ignores a repeat purchase with the same transaction_id,
    // so Shopify webhook retries won't double-count.
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: order.name.replace(/^#/, ""),
          value: Number(order.total_price),
          currency: order.currency,
          items,
        },
      },
    ],
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(GA_MEASUREMENT_ID)}&api_secret=${encodeURIComponent(GA_MP_API_SECRET)}`,
      { method: "POST", body: JSON.stringify(payload) }
    )
    // MP returns 204 on success and does NOT validate payloads on this endpoint;
    // use /debug/mp/collect during setup to validate. We log non-2xx but still ack.
    if (!res.ok) console.error("[orders-create] MP non-2xx:", res.status)
  } catch (err) {
    console.error("[orders-create] MP send failed:", err)
    // Still ack: a failed analytics send should not make Shopify retry forever.
  }

  return NextResponse.json({ ok: true, sent: true, attributed: Boolean(gaClientId) })
}
