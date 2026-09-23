// Server-side Klaviyo subscribe (t1092). One implementation for every capture
// surface: /api/klaviyo/subscribe (inline blocks, /join, the YouTube landing)
// and /api/newsletter (the homepage form, which posted to Kajabi until 9/6).
//
// Uses Klaviyo's CLIENT subscription endpoint: public company id only, never
// the private key. The endpoint REQUIRES a list relationship, so both env
// vars are part of the wiring:
//   NEXT_PUBLIC_KLAVIYO_COMPANY_ID  = public API key / site id
//   KLAVIYO_NEWSLETTER_LIST_ID      = the newsletter list new signups join
// `source` becomes the profile's signup_source property (the semantic source
// of truth, per utm-convention.md) and the consent record's custom_source.

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID
const DEFAULT_LIST_ID = process.env.KLAVIYO_NEWSLETTER_LIST_ID
const KLAVIYO_REVISION = "2025-07-15"

export function klaviyoConfigured(): boolean {
  return Boolean(COMPANY_ID && DEFAULT_LIST_ID)
}

export type KlaviyoSubscribeResult =
  | { ok: true }
  | { ok: false; status: number; detail: string }

export async function klaviyoSubscribe(
  email: string,
  source: string,
  listId?: string,
): Promise<KlaviyoSubscribeResult> {
  const list = listId || DEFAULT_LIST_ID
  if (!COMPANY_ID || !list) return { ok: false, status: 0, detail: "not configured" }
  const signupSource = (source || "at-site").slice(0, 64)
  const body = {
    data: {
      type: "subscription",
      attributes: {
        custom_source: `amytangerine.com ${signupSource}`,
        profile: {
          data: {
            type: "profile",
            attributes: {
              email,
              properties: { signup_source: signupSource },
              subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
            },
          },
        },
      },
      relationships: { list: { data: { type: "list", id: list } } },
    },
  }
  const res = await fetch(
    `https://a.klaviyo.com/client/subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", revision: KLAVIYO_REVISION },
      body: JSON.stringify(body),
    },
  )
  // 202 with an empty body on success.
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    return { ok: false, status: res.status, detail: detail.slice(0, 300) }
  }
  return { ok: true }
}

// Back-in-stock signup (t1093, 2026-09-22). Klaviyo's CLIENT back-in-stock
// endpoint, public company id only. The variant must exist in Klaviyo's
// Shopify-synced catalog, addressed as $shopify:::$default:::<numeric id>
// (proven 202 on 9/22 with the Junk Journal sticker book). Klaviyo holds the
// subscription and fires "Subscribed to Back in Stock", which starts flow
// RMPUzd ("Back in stock: It is back"), whose first step is a Back in stock
// delay that holds each subscriber until the variant restocks (the delay was
// added on the canvas 9/22; without it the flow emails at signup). No marketing consent is given here:
// the shopper asked for one email about one item, not the newsletter.
export async function klaviyoBackInStock(
  email: string,
  variantGid: string,
): Promise<KlaviyoSubscribeResult> {
  if (!COMPANY_ID) return { ok: false, status: 0, detail: "not configured" }
  const numericId = variantGid.split("/").pop() || ""
  if (!/^\d+$/.test(numericId)) return { ok: false, status: 400, detail: "bad variant id" }
  const body = {
    data: {
      type: "back-in-stock-subscription",
      attributes: {
        channels: ["EMAIL"],
        profile: { data: { type: "profile", attributes: { email } } },
      },
      relationships: {
        variant: { data: { type: "catalog-variant", id: `$shopify:::$default:::${numericId}` } },
      },
    },
  }
  const res = await fetch(
    `https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${encodeURIComponent(COMPANY_ID)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", revision: KLAVIYO_REVISION },
      body: JSON.stringify(body),
    },
  )
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    return { ok: false, status: res.status, detail: detail.slice(0, 300) }
  }
  return { ok: true }
}
