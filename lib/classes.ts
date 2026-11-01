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
  // Container videos (Bunny Stream GUIDs; scripts/bunny-upload.mjs prints them).
  // welcome plays on the class home; walkthrough is linked from "How the class works".
  welcomeVideo?: string
  walkthroughVideo?: string
  // The mid-month Q&A: Amy answers the questions from the box on camera and the
  // video plays on the class home under the box once this is set (t1651).
  qaVideo?: string
  // The public "the class is open" video (script 1), on the sales page. Same Bunny
  // library, signed server-side like the class clips; nothing goes to YouTube.
  openVideo?: string
  // The public sales page for the class (app/<path>/page.tsx reads this row).
  sales: {
    path: string // e.g. "/glimmers"
    // false = the page 404s on production until the on-sale commit flips it.
    // Preview deploys and the dev server always render it, for Amy's read.
    live: boolean
    onSaleDate: string // YYYY-MM-DD; shown while the product is not yet purchasable
    // Storefront handle of the product the Join button buys. The page shows the
    // live Storefront price when the product is published; `price` is the
    // ruled price it shows until then.
    productHandle: string
    price: number // USD
  }
}

export const CLASSES: ClassDef[] = [
  {
    slug: "glimmers",
    title: "Glimmers and Gratitude",
    // 10283136188736: staging product "Glimmers and Gratitude (class, staging)",
    // DRAFT, created 2026-09-23 for the auth spike; the TEST1 order is on it.
    // 15428447371584: the real product "Glimmers and Gratitude", $45, SKU
    // CLASS-GLIMMERS-2026, created DRAFT 2026-10-15 (scripts/create-class-product.mjs);
    // scripts/class-go-live.mjs glimmers --open puts it on sale.
    productIds: [10283136188736, 15428447371584],
    skuPrefix: "CLASS-GLIMMERS",
    // Day 1 is Sunday November 1 (class-one scope 9/16, blessed by Amy 9/23).
    // Before that, every day shows its unlock date on production. To walk the
    // whole class early, set CLASS_ALL_DAYS_OPEN=1 off production (see allDaysOpen).
    startDate: "2026-11-01",
    days: 30,
    tagline: "Thirty days of noticing the small good things, one prompt a day.",
    // Bunny GUIDs from scripts/bunny-upload.mjs, kept in env so a re-upload is an
    // env change, not a deploy.
    welcomeVideo: process.env.GLIMMERS_WELCOME_VIDEO_ID || undefined,
    walkthroughVideo: process.env.GLIMMERS_WALKTHROUGH_VIDEO_ID || undefined,
    qaVideo: process.env.GLIMMERS_QA_VIDEO_ID || undefined,
    openVideo: process.env.GLIMMERS_OPEN_VIDEO_ID || undefined,
    sales: {
      path: "/glimmers",
      live: true, // on sale 10/29 at Amy's yes (thread "Glimmers this week"), with class-go-live --open
      onSaleDate: "2026-10-30", // the target once Amy says yes (10/29); was 10/26 before the hold
      productHandle: "glimmers-and-gratitude",
      price: 45,
    },
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

// True on the live site (Vercel production). Preview deploys and the dev
// server are "not production": the places the class is walked before it opens.
export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production"
}

// Off production, CLASS_ALL_DAYS_OPEN=1 opens every day of every class so the
// whole thing can be walked before its start date (the preview deploy and the
// dev server carry the variable; production never honors it, whatever is set).
export function allDaysOpen(): boolean {
  return process.env.CLASS_ALL_DAYS_OPEN === "1" && !isProductionDeploy()
}

// Whether the class's public sales page renders here: always off production,
// and on production only once the row says live.
export function salesPageVisible(c: ClassDef): boolean {
  return c.sales.live || !isProductionDeploy()
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
  if (allDaysOpen()) return true
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
