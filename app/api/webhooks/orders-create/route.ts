// POST /api/webhooks/orders-create
//
// Shopify orders/create webhook -> GA4 server-side `purchase` event via the
// Measurement Protocol for orders that have no browser completion event (POS,
// Recharge renewals/prepaid cycles, drafts). Shopify's Google & YouTube pixel is
// authoritative for browser checkouts because it carries the real session.
// Sending both sources double-counted every web purchase after 2026-08-20; using
// one transaction_id for both would not be safe because GA4 keeps the first event,
// which can be this sessionless webhook. See t687 and t1485.
//
// Identity stitching: the GA client_id is captured browser-side at checkout
// (cart-drawer readGaClientId) and stored as the `_ga_client_id` cart attribute,
// which rides through to the order's note_attributes. We read it back here so a
// non-browser purchase can retain the buyer's GA identity/first-touch context.
// Without a session_id it remains session-unattributed. If client_id is missing
// (consent-blocked, etc.) we fall back to a deterministic synthetic id.

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // need the raw body for HMAC; keep it simple

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? ""
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""
const GA_MP_API_SECRET = process.env.GA_MP_API_SECRET ?? ""
const SHOPIFY_HEADLESS_APP_SOURCE = process.env.SHOPIFY_HEADLESS_APP_ID || "345947701249"

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
  source_name?: string | null
  tags?: string | null
  note_attributes?: { name: string; value: string }[]
  line_items?: ShopifyLineItem[]
}

// t1046: every order fires `purchase` here (web, POS booth, Recharge renewals,
// drafts), which made the GA4 funnel read more purchases than checkout-begins.
// Classify the order's channel so reports can slice web-only; total revenue
// reporting stays on Shopify pulls (t906), this is funnel/attribution only.
// Registered in GA4 as event-scoped custom dimension `order_channel`.
// (Not exported: Next route files may only export handlers/config.)
function classifyOrderChannel(order: Pick<ShopifyOrder, "source_name" | "tags">): string {
  const src = (order.source_name ?? "").toLowerCase()
  const tags = (order.tags ?? "").toLowerCase()
  if (src === "subscription_contract" || tags.includes("subscription")) return "subscription"
  if (src === "pos") return "pos"
  if (src === "web") return "web"
  if (src === "shopify_draft_order") return "draft"
  return src || "other"
}

// Shopify identifies ordinary Online Store checkouts as `web` and checkouts
// created by at-site's Storefront API as the headless app id. Both complete in a
// browser and are already covered by Shopify's Google & YouTube customer-event
// pixel. Recharge-owned sources (294517 and subscription_contract_checkout_one),
// POS and drafts do not fire that pixel and must continue through this webhook.
function hasShopifyBrowserPurchase(order: Pick<ShopifyOrder, "source_name">): boolean {
  const src = String(order.source_name ?? "").toLowerCase()
  return src === "web" || src === SHOPIFY_HEADLESS_APP_SOURCE
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

  let order: ShopifyOrder
  try {
    order = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 })
  }

  const orderChannel = classifyOrderChannel(order)

  if (hasShopifyBrowserPurchase(order)) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: "shopify-browser-pixel-authoritative",
      order_channel: orderChannel,
    })
  }

  if (!GA_MEASUREMENT_ID || !GA_MP_API_SECRET) {
    console.error("[orders-create] GA env missing; acking webhook without sending")
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: "ga-env-missing",
      order_channel: orderChannel,
    })
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
          order_channel: orderChannel,
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

  return NextResponse.json({ ok: true, sent: true, attributed: Boolean(gaClientId), order_channel: orderChannel })
}
