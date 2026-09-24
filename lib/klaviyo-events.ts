// Server-side Klaviyo EVENT push (t1102, 2026-09-23). Sibling of
// lib/klaviyo-subscribe.ts: same CLIENT endpoint family, public company id
// only, so no private key ever lives in Vercel. An event creates the profile
// if needed and can trigger a flow whose trigger is the metric name.
//
// First use: "Class access granted", fired by the orders-create webhook with
// the buyer's permanent class link, so a Klaviyo flow can send the access
// email. No consent is set here: the buyer bought something and gets the thing
// they bought; that is transactional, not marketing.

const COMPANY_ID = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID
const KLAVIYO_REVISION = "2025-07-15"

export type KlaviyoEventResult = { ok: true } | { ok: false; status: number; detail: string }

export async function klaviyoTrackEvent(
  metricName: string,
  email: string,
  properties: Record<string, string | number | boolean>,
  uniqueId?: string,
): Promise<KlaviyoEventResult> {
  if (!COMPANY_ID) return { ok: false, status: 0, detail: "not configured" }
  const body = {
    data: {
      type: "event",
      attributes: {
        properties,
        // unique_id makes a webhook retry a no-op in Klaviyo (same event, once).
        ...(uniqueId ? { unique_id: uniqueId } : {}),
        metric: { data: { type: "metric", attributes: { name: metricName } } },
        profile: { data: { type: "profile", attributes: { email } } },
      },
    },
  }
  const res = await fetch(`https://a.klaviyo.com/client/events/?company_id=${encodeURIComponent(COMPANY_ID)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", revision: KLAVIYO_REVISION },
    body: JSON.stringify(body),
  })
  // 202 with an empty body on success.
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    return { ok: false, status: res.status, detail: detail.slice(0, 300) }
  }
  return { ok: true }
}

export const CLASS_ACCESS_METRIC = "Class access granted"
