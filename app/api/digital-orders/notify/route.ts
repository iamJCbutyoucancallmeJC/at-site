// POST /api/digital-orders/notify
//
// Shopify `orders/create` webhook. For each DIGITAL (printable) line item on the
// order, computes an HMAC-signed download URL and writes the set back to the order
// as a metafield `digital.download_links` (JSON). The Order Confirmation email
// Liquid template reads that metafield and renders a "Your Downloads" block, so the
// customer gets working download links in their receipt + on the order status page.
//
// Security: verifies the Shopify webhook HMAC (X-Shopify-Hmac-Sha256) against the
// raw body using SHOPIFY_WEBHOOK_SECRET before doing anything. Rejects otherwise.
//
// Idempotent: re-running on the same order just rewrites the same metafield value.

import { createHmac, timingSafeEqual } from "node:crypto"
import { signDownloadToken } from "@/lib/download-token"
import { getDigitalLineItems } from "@/lib/shopify-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://amytangerine.com"
const STORE = process.env.SHOPIFY_STORE_DOMAIN
const ADMIN_CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const ADMIN_CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const ADMIN_API_VERSION = "2026-04"

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): boolean {
  if (!WEBHOOK_SECRET || !hmacHeader) return false
  const digest = createHmac("sha256", WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64")
  const a = Buffer.from(digest)
  const b = Buffer.from(hmacHeader)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Minimal admin token + write (kept local; the read-side helpers live in shopify-admin.ts).
let tok: { value: string; expiresAt: number } | null = null
async function adminToken(): Promise<string> {
  if (tok && tok.expiresAt > Date.now() + 60_000) return tok.value
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: ADMIN_CLIENT_ID ?? "",
      client_secret: ADMIN_CLIENT_SECRET ?? "",
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`admin token failed: ${res.status}`)
  const j = (await res.json()) as { access_token: string; expires_in: number }
  tok = { value: j.access_token, expiresAt: Date.now() + j.expires_in * 1000 }
  return tok.value
}

const METAFIELD_SET = `
  mutation($mf: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $mf) {
      metafields { id key }
      userErrors { field message }
    }
  }
`

async function writeDownloadLinksMetafield(orderGid: string, value: string) {
  const token = await adminToken()
  const res = await fetch(`https://${STORE}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    cache: "no-store",
    body: JSON.stringify({
      query: METAFIELD_SET,
      variables: {
        mf: [{
          ownerId: orderGid,
          namespace: "digital",
          key: "download_links",
          type: "json",
          value,
        }],
      },
    }),
  })
  const json = (await res.json()) as { data?: { metafieldsSet?: { userErrors?: unknown[] } }; errors?: unknown }
  const errs = json.data?.metafieldsSet?.userErrors
  if (json.errors || (errs && errs.length)) {
    throw new Error(`metafieldsSet failed: ${JSON.stringify(json.errors ?? errs)}`)
  }
}

export async function POST(request: Request) {
  const raw = await request.text()
  const hmac = request.headers.get("x-shopify-hmac-sha256")
  if (!verifyShopifyHmac(raw, hmac)) {
    return new Response("invalid hmac", { status: 401 })
  }

  let order: { id?: number; admin_graphql_api_id?: string; email?: string }
  try {
    order = JSON.parse(raw)
  } catch {
    return new Response("bad json", { status: 400 })
  }

  const orderIdNumeric = String(order.id ?? "")
  const orderGid = order.admin_graphql_api_id ?? `gid://shopify/Order/${orderIdNumeric}`
  if (!orderIdNumeric) return new Response("no order id", { status: 400 })

  try {
    const items = await getDigitalLineItems(orderIdNumeric)
    if (items.length === 0) {
      // Not a digital order; nothing to do. 200 so Shopify doesn't retry.
      return new Response("no digital items", { status: 200 })
    }

    const links = items
      .filter((it) => it.pdfFileGid) // only items with an attached PDF
      .map((it) => {
        const token = signDownloadToken({
          orderId: orderIdNumeric,
          lineItemId: it.id,
          email: it.email,
          pdfFileId: it.pdfFileGid!,
        })
        const url = `${SITE_ORIGIN}/api/download/${orderIdNumeric}/${it.id}` +
          `?token=${token}&email=${encodeURIComponent(it.email.toLowerCase().trim())}`
        return { title: it.productTitle, url }
      })

    if (links.length === 0) {
      return new Response("digital items present but no PDFs attached", { status: 200 })
    }

    await writeDownloadLinksMetafield(orderGid, JSON.stringify(links))
    return new Response(JSON.stringify({ ok: true, count: links.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("[digital-orders/notify] failed", e)
    // 500 -> Shopify will retry the webhook (it retries on non-2xx).
    return new Response("processing failed", { status: 500 })
  }
}
