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
