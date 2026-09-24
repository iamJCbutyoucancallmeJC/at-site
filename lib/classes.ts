// Class registry (t1102, Classes v1). One row per class sold on the site.
//
// A class is a Shopify product (classes-on-site-scope-2026-08-11.md, v1 shape
// item 1). This file is the join between the product and the delivery surface
// at /classes/[slug]: the orders-create webhook matches a paid line item to a
// row here, mints an access token for that (class, order) pair, and the gated
// pages read the same row to know when each day unlocks.
//
// Matching is by Shopify product id OR by SKU prefix, so Amy can create the
// real product in Admin and we only have to record its id here; until then a
// SKU that starts with `CLASS-<SLUG>` is enough.
//
// No secrets here; safe to import from either side. Day CONTENT lives in
// content/classes/<slug>.ts (server-only), not in this registry.

export type ClassDef = {
  slug: string
  title: string
  // Numeric Shopify product ids (not GIDs) that grant access. Several ids so a
  // staging product and the real product can both point at one class.
  productIds: number[]
  // Any line item whose SKU starts with this also grants access.
  skuPrefix: string
  // First day unlocks on this calendar date in Amy's time zone (Los Angeles).
  // Day n unlocks at 00:00 local on startDate + (n - 1) days.
  startDate: string // YYYY-MM-DD
  days: number
  // A one-line promise shown above the day list.
  tagline: string
}

export const CLASSES: ClassDef[] = [
  {
    slug: "glimmers",
    title: "Glimmers and Gratitude",
    // 2026-09-23: staging product "Glimmers and Gratitude (class, staging)",
    // DRAFT, created for the auth spike. Amy's real November product gets
    // added here when she lists it (t1102 v1.0 punch list).
    productIds: [10283136188736],
    skuPrefix: "CLASS-GLIMMERS",
    startDate: "2026-09-01", // staging: every day already open so JC can walk it
    days: 30,
    tagline: "Thirty days of noticing the small good things, one prompt a day.",
  },
]

export function getClass(slug: string): ClassDef | null {
  return CLASSES.find((c) => c.slug === slug) ?? null
}

// Which class (if any) a Shopify order line item unlocks.
export function classForLineItem(item: { product_id?: number | null; sku?: string | null }): ClassDef | null {
  const pid = item.product_id ?? null
  const sku = (item.sku ?? "").toUpperCase()
  for (const c of CLASSES) {
    if (pid !== null && c.productIds.includes(pid)) return c
    if (sku && sku.startsWith(c.skuPrefix.toUpperCase())) return c
  }
  return null
}

// Calendar date (YYYY-MM-DD) in Los Angeles for a given instant.
export function laDate(at: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at)
}

function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  const t = Date.UTC(y, m - 1, d + n)
  return new Date(t).toISOString().slice(0, 10)
}

// The date day n unlocks (YYYY-MM-DD, Los Angeles calendar).
export function unlockDate(c: ClassDef, day: number): string {
  return addDays(c.startDate, day - 1)
}

// Days are compared as calendar strings, so "today in LA" >= unlock date.
export function isDayOpen(c: ClassDef, day: number, at: Date = new Date()): boolean {
  if (day < 1 || day > c.days) return false
  return laDate(at) >= unlockDate(c, day)
}

export function formatUnlockDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)))
}
