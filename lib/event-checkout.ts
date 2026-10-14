// Event booth checkout (t1101). One implementation behind /api/checkout/event
// (every booth page) and /api/checkout/paperworld (the fixed-alias route kept
// for the documented verification POST). Lifted from the Paper World one-off.
//
// CORRECTNESS (the trap the retired Junklub route fell into, t764): the line
// MUST carry the 6-month SELLING PLAN, not just the variant. After the t764
// per-delivery migration the 6mo variant has a $12 BASE price; with no selling
// plan the cart resolves to $12 (then minus the event discount = a giveaway).
// With HM_SELLING_PLAN_6MO attached the plan's fixed pricing governs, the line
// resolves to $72, and the event code takes its dollars off.
//
// The discount is verified server-side: applyDiscountCode returns the cart with
// discountCodes[].applicable, and we refuse to hand back a checkout where the
// code did not apply (inactive, expired, out of window, not created yet) rather
// than silently selling at full price. A 409 here is the intended safe state
// until the code is ACTIVE in Shopify for the show window.

import { createCart, addToCart, applyDiscountCode, extractCartToken } from "@/lib/shopify"
import { HM_VARIANT_6MONTH_GID, HM_SELLING_PLAN_6MO, hmIsClosed } from "@/lib/happy-mail-content"
import type { SiteEvent } from "@/lib/events-content"

const RETURN_BASE = "https://www.amytangerine.com/thank-you"

export type EventCheckoutResult =
  | { ok: true; checkoutUrl: string; cartToken: string | null; subtotal: unknown; total: unknown }
  | { ok: false; status: number; error: string; closed?: boolean }

export async function createEventCheckout(event: SiteEvent, gaClientId?: string): Promise<EventCheckoutResult> {
  const booth = event.booth
  if (!booth?.offer || booth.offer.kind !== "hm-6month") {
    return { ok: false, status: 404, error: "This event has no checkout offer." }
  }
  // Happy Mail monthly cap (t1702): no new subscription while closed.
  if (hmIsClosed()) {
    return { ok: false, status: 409, closed: true, error: "Happy Mail is full this month. Join the waitlist on the Happy Mail page." }
  }
  const code = booth.offer.code

  // Stamp the GA client_id (so the orders/create webhook attributes the
  // server-side purchase event) and the event source (rides onto the order).
  const attributes = [
    gaClientId && /^\d+\.\d+$/.test(gaClientId) ? { key: "_ga_client_id", value: gaClientId } : null,
    { key: "_event_source", value: booth.eventSource },
  ].filter((a): a is { key: string; value: string } => a !== null)

  const cart = await createCart(attributes)
  let updated = await addToCart(cart.id, HM_VARIANT_6MONTH_GID, 1, HM_SELLING_PLAN_6MO)
  updated = await applyDiscountCode(updated.id, [code])

  const applied = updated.discountCodes.find((d) => d.code.toUpperCase() === code.toUpperCase() && d.applicable)
  if (!applied) {
    console.error("[event checkout] discount not applicable", {
      event: event.slug,
      code,
      discountCodes: updated.discountCodes,
      subtotal: updated.cost.subtotalAmount,
      total: updated.cost.totalAmount,
    })
    return { ok: false, status: 409, error: "The event discount isn't active yet. Please visit the booth or try again." }
  }

  const cartToken = extractCartToken(updated.id)
  const params = new URLSearchParams({ source: booth.eventSource, channel: "in-person" })
  if (cartToken) params.set("cart_id", cartToken)
  const returnUrl = `${RETURN_BASE}?${params.toString()}`
  const checkoutUrl = updated.checkoutUrl.includes("?")
    ? `${updated.checkoutUrl}&return_to=${encodeURIComponent(returnUrl)}`
    : `${updated.checkoutUrl}?return_to=${encodeURIComponent(returnUrl)}`

  return {
    ok: true,
    checkoutUrl,
    cartToken,
    // Echoed so the page (and the runbook's verification POST) can confirm the
    // math: subtotal $72.00, total $66.00 with a $6 code applied.
    subtotal: updated.cost.subtotalAmount,
    total: updated.cost.totalAmount,
  }
}
