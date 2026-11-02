// lib/ad-conversions.ts (server only)
//
// Purchase for the ad platforms, sent from the Shopify orders/create webhook
// (app/api/webhooks/orders-create/route.ts). Checkout runs on Shopify's hosted
// checkout, where the site's Meta Pixel / Pinterest tag (app/layout.tsx,
// lib/analytics.ts trackAdEvent) never run, so Purchase only exists server-side:
//   - Meta Conversions API      gated on META_PIXEL_ID + META_CAPI_TOKEN
//   - Pinterest Conversions API gated on PINTEREST_AD_ACCOUNT_ID + PINTEREST_CAPI_TOKEN
// Both are dark until those env vars exist. event_id is the Shopify order id, so a
// webhook retry (or any other sender using the same id) dedupes on the platform.
//
// Click ids: the checkout handoff routes stamp `_fbp`, `_fbc` and `_epik` cart
// attributes (adClickAttributes below); they ride onto the order's note_attributes
// and are read back here. See docs/ad-tracking.md.

import { createHash } from "node:crypto"
import type { CartAttribute } from "@/lib/shopify"

const META_PIXEL_ID = process.env.META_PIXEL_ID ?? ""
const META_CAPI_TOKEN = process.env.META_CAPI_TOKEN ?? ""
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE ?? ""
const PINTEREST_AD_ACCOUNT_ID = process.env.PINTEREST_AD_ACCOUNT_ID ?? ""
const PINTEREST_CAPI_TOKEN = process.env.PINTEREST_CAPI_TOKEN ?? ""
// "1" sends Pinterest events with ?test=true (validated, not counted).
const PINTEREST_CAPI_TEST = process.env.PINTEREST_CAPI_TEST === "1"

// Graph API versions live about two years; bump when Meta deprecates this one.
const META_GRAPH_VERSION = "v24.0"
const SEND_TIMEOUT_MS = 5000
const EVENT_SOURCE_URL = "https://amytangerine.com/thank-you"

export function metaCapiConfigured(): boolean {
  return Boolean(META_PIXEL_ID && META_CAPI_TOKEN)
}
export function pinterestCapiConfigured(): boolean {
  return Boolean(PINTEREST_AD_ACCOUNT_ID && PINTEREST_CAPI_TOKEN)
}
export function adConversionsConfigured(): boolean {
  return metaCapiConfigured() || pinterestCapiConfigured()
}

// ── Click-id passthrough (checkout handoff) ────────────────────────────────

// Client sends { fbp, fbc, epik } read from the _fbp/_fbc/_epik cookies
// (lib/analytics.ts readAdClickIds). Shape-checked here; anything odd is dropped.
// Underscore keys stay hidden from the buyer at checkout.
const CLICK_ID_ATTRS = [
  ["fbp", "_fbp"],
  ["fbc", "_fbc"],
  ["epik", "_epik"],
] as const

export function adClickAttributes(raw: unknown): CartAttribute[] {
  if (!raw || typeof raw !== "object") return []
  const r = raw as Record<string, unknown>
  const out: CartAttribute[] = []
  for (const [field, key] of CLICK_ID_ATTRS) {
    const v = r[field]
    if (typeof v === "string" && v.length > 0 && v.length <= 500 && /^[\w.\-=&%+/:]+$/.test(v)) {
      out.push({ key, value: v })
    }
  }
  return out
}

// ── Which orders count ─────────────────────────────────────────────────────

export type AdOrder = {
  id: number
  name?: string
  total_price?: string
  currency?: string
  source_name?: string | null
  tags?: string | null
  test?: boolean | null
  created_at?: string | null
  email?: string | null
  contact_email?: string | null
  phone?: string | null
  browser_ip?: string | null
  client_details?: { browser_ip?: string | null; user_agent?: string | null } | null
  customer?: { id?: number | null; email?: string | null; phone?: string | null; first_name?: string | null; last_name?: string | null } | null
  billing_address?: AdAddress | null
  shipping_address?: AdAddress | null
  note_attributes?: { name: string; value: string }[]
  line_items?: { title?: string | null; price?: string; quantity?: number; product_id?: number | null; variant_id?: number | null }[]
}
type AdAddress = {
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  city?: string | null
  province_code?: string | null
  zip?: string | null
  country_code?: string | null
}

// Returns why an order must NOT be sent as an ad Purchase, or null to send.
// Ads optimize toward whatever is reported, so only a first, paid, buyer-made
// checkout on the site counts. Same reasoning as the GA4 $0-subscription skip
// (commit e7bd222), applied more strictly: ads also skip priced renewals and POS.
// `siteCheckout` is the route's hasShopifyBrowserPurchase(order): source `web` or
// the headless app id (Recharge first orders check out there too and DO count).
export function adPurchaseSkipReason(order: AdOrder, siteCheckout: boolean): string | null {
  const src = String(order.source_name ?? "").toLowerCase()
  const tags = String(order.tags ?? "").toLowerCase()
  if (order.test) return "test-order"
  const total = Number(order.total_price)
  if (!Number.isFinite(total) || total <= 0) return "zero-dollar-order"
  // Recharge renewals: tag "Subscription Recurring Order", or a Recharge-owned
  // source (subscription_contract, subscription_contract_checkout_one, app 294517).
  // A "Subscription First Order" from a site checkout is the one that counts.
  if (tags.includes("subscription recurring order") || src.startsWith("subscription_contract") || src === "294517") {
    return "recharge-renewal"
  }
  if (/(^|[\s,])(faire|wholesale)([\s,]|$)/.test(tags)) return "wholesale-order"
  if (src === "pos") return "pos-order"
  if (src === "shopify_draft_order") return "draft-order"
  if (!siteCheckout) return "not-a-site-checkout"
  return null
}

// ── Hashing (SHA-256 hex of the normalized value, per both APIs) ───────────

function sha256(v: string): string {
  return createHash("sha256").update(v).digest("hex")
}
function hashed(v: string | null | undefined): string[] | undefined {
  return v ? [sha256(v)] : undefined
}
function normEmail(v?: string | null): string | null {
  const s = (v ?? "").trim().toLowerCase()
  return s.includes("@") ? s : null
}
// Digits only, with country code. Shopify stores E.164 (+15551234567); a bare
// 10-digit number is assumed US.
function normPhone(v?: string | null, country?: string | null): string | null {
  let d = (v ?? "").replace(/\D/g, "").replace(/^0+/, "")
  if (!d) return null
  if (d.length === 10 && (!country || country.toUpperCase() === "US")) d = `1${d}`
  return d.length >= 8 ? d : null
}
function normName(v?: string | null): string | null {
  const s = (v ?? "").trim().toLowerCase()
  return s || null
}
function normCity(v?: string | null): string | null {
  const s = (v ?? "").toLowerCase().replace(/[^a-z]/g, "")
  return s || null
}
function normZip(v?: string | null, country?: string | null): string | null {
  let s = (v ?? "").toLowerCase().replace(/\s/g, "")
  if (country?.toUpperCase() === "US") s = s.replace(/\D/g, "").slice(0, 5)
  return s || null
}
function normCode(v?: string | null): string | null {
  const s = (v ?? "").trim().toLowerCase()
  return /^[a-z]{2}$/.test(s) ? s : null
}

function attr(order: AdOrder, name: string): string | undefined {
  return order.note_attributes?.find((a) => a.name === name)?.value || undefined
}

type Prepared = {
  eventId: string
  eventTime: number
  value: number
  currency: string
  orderId: string
  user: Record<string, string[] | undefined>
  ip?: string
  ua?: string
  fbp?: string
  fbc?: string
  epik?: string
  contents: { id: string; quantity: number; item_price: number }[]
}

function prepare(order: AdOrder): Prepared {
  const addr = order.billing_address ?? order.shipping_address ?? null
  const country = addr?.country_code ?? null
  const created = order.created_at ? Date.parse(order.created_at) : NaN
  const contents = (order.line_items ?? []).map((li) => ({
    id: String(li.variant_id ?? li.product_id ?? li.title ?? ""),
    quantity: li.quantity ?? 1,
    item_price: Number(li.price ?? 0),
  }))
  return {
    eventId: String(order.id),
    eventTime: Math.floor((Number.isFinite(created) ? created : Date.now()) / 1000),
    value: Number(order.total_price),
    currency: order.currency || "USD",
    orderId: String(order.id),
    user: {
      em: hashed(normEmail(order.email ?? order.contact_email ?? order.customer?.email)),
      ph: hashed(normPhone(order.phone ?? order.customer?.phone ?? addr?.phone, country)),
      fn: hashed(normName(addr?.first_name ?? order.customer?.first_name)),
      ln: hashed(normName(addr?.last_name ?? order.customer?.last_name)),
      ct: hashed(normCity(addr?.city)),
      st: hashed(normCode(addr?.province_code)),
      zp: hashed(normZip(addr?.zip, country)),
      country: hashed(normCode(country)),
      external_id: hashed(order.customer?.id ? String(order.customer.id) : null),
    },
    ip: order.browser_ip || order.client_details?.browser_ip || undefined,
    ua: order.client_details?.user_agent || undefined,
    fbp: attr(order, "_fbp"),
    fbc: attr(order, "_fbc"),
    epik: attr(order, "_epik"),
    contents,
  }
}

function compact<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== "")) as Partial<T>
}

// ── Senders ────────────────────────────────────────────────────────────────

function metaPayload(p: Prepared) {
  return compact({
    data: [
      {
        event_name: "Purchase",
        event_time: p.eventTime,
        event_id: p.eventId,
        action_source: "website",
        event_source_url: EVENT_SOURCE_URL,
        user_data: compact({
          ...p.user,
          client_ip_address: p.ip,
          client_user_agent: p.ua,
          fbp: p.fbp,
          fbc: p.fbc,
        }),
        custom_data: {
          value: p.value,
          currency: p.currency,
          order_id: p.orderId,
          content_type: "product",
          content_ids: p.contents.map((c) => c.id),
          contents: p.contents,
          num_items: p.contents.reduce((n, c) => n + c.quantity, 0),
        },
      },
    ],
    test_event_code: META_TEST_EVENT_CODE || undefined,
  })
}

function pinterestPayload(p: Prepared) {
  return {
    data: [
      {
        event_name: "checkout",
        action_source: "web",
        event_time: p.eventTime,
        event_id: p.eventId,
        event_source_url: EVENT_SOURCE_URL,
        user_data: compact({
          ...p.user,
          client_ip_address: p.ip,
          client_user_agent: p.ua,
          click_id: p.epik,
        }),
        custom_data: {
          currency: p.currency,
          value: p.value.toFixed(2),
          order_id: p.orderId,
          content_ids: p.contents.map((c) => c.id),
          contents: p.contents.map((c) => ({ id: c.id, item_price: c.item_price.toFixed(2), quantity: c.quantity })),
          num_items: p.contents.reduce((n, c) => n + c.quantity, 0),
        },
      },
    ],
  }
}

async function post(label: string, url: string, headers: Record<string, string>, body: unknown): Promise<string> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    })
    if (!res.ok) {
      // Error bodies carry the platform's message, never our hashed user data.
      const text = await res.text().catch(() => "")
      console.error(`[ad-conversions] ${label} non-2xx:`, res.status, text.slice(0, 300))
      return `error-${res.status}`
    }
    return "sent"
  } catch (err) {
    console.error(`[ad-conversions] ${label} send failed:`, err instanceof Error ? err.message : err)
    return "error"
  }
}

// Never throws. Each platform is sent only when its env pair exists. Run it
// inside next/server after() so the webhook acks first.
export async function sendAdPurchase(order: AdOrder): Promise<{ meta: string; pinterest: string }> {
  let p: Prepared
  try {
    p = prepare(order)
  } catch (err) {
    console.error("[ad-conversions] could not prepare order", order?.id, err)
    return { meta: "error", pinterest: "error" }
  }
  const [meta, pinterest] = await Promise.all([
    metaCapiConfigured()
      ? post(
          "meta",
          `https://graph.facebook.com/${META_GRAPH_VERSION}/${encodeURIComponent(META_PIXEL_ID)}/events`,
          {},
          { ...metaPayload(p), access_token: META_CAPI_TOKEN },
        )
      : Promise.resolve("env-missing"),
    pinterestCapiConfigured()
      ? post(
          "pinterest",
          `https://api.pinterest.com/v5/ad_accounts/${encodeURIComponent(PINTEREST_AD_ACCOUNT_ID)}/events${PINTEREST_CAPI_TEST ? "?test=true" : ""}`,
          { Authorization: `Bearer ${PINTEREST_CAPI_TOKEN}` },
          pinterestPayload(p),
        )
      : Promise.resolve("env-missing"),
  ])
  return { meta, pinterest }
}
