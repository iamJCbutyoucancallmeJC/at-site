// Grant class access for a Shopify order (t1102). Called by the orders-create
// webhook for every order; a no-op unless a line item is a class product.
//
// For each class in the order: mint the permanent link, fire the Klaviyo
// "Class access granted" event (the flow sends the email), and stamp the link
// on the order as an app metafield so help@ can re-send it from Admin without
// re-minting. Every step is best-effort and logged; the webhook acks either
// way (a retry re-mints the SAME token, and the Klaviyo unique_id makes the
// event idempotent).

import "server-only"
import { classForLineItem, type ClassDef } from "@/lib/classes"
import { mintClassToken, classAccessUrl, classAccessConfigured } from "@/lib/class-access"
import { klaviyoTrackEvent, CLASS_ACCESS_METRIC } from "@/lib/klaviyo-events"
import { adminFetch } from "@/lib/shopify-admin"

export type ClassOrder = {
  id: number
  name: string
  email?: string | null
  contact_email?: string | null
  customer?: { email?: string | null; first_name?: string | null } | null
  line_items?: { product_id?: number | null; sku?: string | null; title?: string | null }[]
}

export type GrantResult = {
  slug: string
  accessUrl: string
  email: string | null
  klaviyo: "sent" | "skipped" | "failed"
  metafield: "set" | "failed"
}

function orderEmail(order: ClassOrder): string | null {
  return order.email || order.contact_email || order.customer?.email || null
}

async function stampOrder(orderId: number, c: ClassDef, url: string): Promise<boolean> {
  try {
    const data = await adminFetch<{ metafieldsSet: { userErrors: { message: string }[] } }>(
      `mutation($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { field message } }
      }`,
      {
        metafields: [
          {
            ownerId: `gid://shopify/Order/${orderId}`,
            namespace: "$app:class",
            key: `access_url_${c.slug}`,
            type: "url",
            value: url,
          },
        ],
      },
    )
    const errs = data.metafieldsSet.userErrors
    if (errs.length) {
      console.error("[class-grant] metafield userErrors:", JSON.stringify(errs))
      return false
    }
    return true
  } catch (err) {
    console.error("[class-grant] metafield failed:", err)
    return false
  }
}

export async function grantClassAccess(order: ClassOrder): Promise<GrantResult[]> {
  const classes = new Map<string, ClassDef>()
  for (const li of order.line_items ?? []) {
    const c = classForLineItem(li)
    if (c) classes.set(c.slug, c)
  }
  if (classes.size === 0) return []
  if (!classAccessConfigured()) {
    console.error("[class-grant] CLASS_ACCESS_SECRET missing; class order not granted:", order.name)
    return []
  }

  const email = orderEmail(order)
  const orderRef = order.name.replace(/^#/, "")
  const results: GrantResult[] = []

  for (const c of classes.values()) {
    const token = await mintClassToken(c.slug, orderRef)
    const accessUrl = classAccessUrl(c.slug, token)

    let klaviyo: GrantResult["klaviyo"] = "skipped"
    if (email) {
      const r = await klaviyoTrackEvent(
        CLASS_ACCESS_METRIC,
        email,
        {
          class_slug: c.slug,
          class_title: c.title,
          access_url: accessUrl,
          order_number: orderRef,
          first_name: order.customer?.first_name ?? "",
        },
        `class-access:${c.slug}:${orderRef}`,
      )
      klaviyo = r.ok ? "sent" : "failed"
      if (!r.ok) console.error("[class-grant] klaviyo event failed:", r.status, r.detail)
    } else {
      console.error("[class-grant] order has no email; link only on the order metafield:", order.name)
    }

    const stamped = await stampOrder(order.id, c, accessUrl)
    results.push({ slug: c.slug, accessUrl, email, klaviyo, metafield: stamped ? "set" : "failed" })
  }
  return results
}
