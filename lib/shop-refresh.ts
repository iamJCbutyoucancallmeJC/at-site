// The Small Business Saturday shop refresh (t2113, 2026-11-28).
//
// ONE time, said in three places that must agree:
//   1. the announcement email (copy + the countdown image at /api/countdown),
//   2. the banner on /shop (components/shop-refresh-banner.tsx),
//   3. Shopify, which publishes the new products to the Online Store at this
//      minute (shop-refresh-2026-11-28.py golive schedules publishDate from the
//      counts file's open_at, which must equal OPEN_AT here).
// Change it here and in the counts file together, never one alone.

export const OPEN_AT = "2026-11-28T17:00:00Z" // Saturday, November 28, 9am Pacific / noon Eastern
export const OPEN_LABEL = "Saturday, November 28 at 9am Pacific"
export const OPEN_LABEL_SHORT = "9am Pacific (noon Eastern)"

// PREVIEW BRANCH ONLY (preview/saturday-open): the clock is pinned to one minute
// after the open so the site reads as it will on Saturday morning. Never merge.
export const PREVIEW_AS_OF = "2026-11-28T17:01:00Z"
const previewNow = () => Date.parse(PREVIEW_AS_OF)

export function msUntilOpen(now: number = previewNow()): number {
  return Date.parse(OPEN_AT) - now
}

export function countdownParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

// Amy's weekend bonus (email 2026-11-25): every order over $50 placed this weekend
// gets a UV DTF "I'm a little obsessed" sticker, no code. The cart drawer says so
// during the window. The same window and threshold flag the orders for packing:
// vault Website Redesign/Tools/bonus-sticker-2026-11-28.py (WINDOW_START/END,
// THRESHOLD). Change them together. $50.00 exactly counts, on purpose.
// Amy 11/26 (m209): "1 per customer, while they last." The cart and /shop say it,
// and the flag script marks only a customer's first qualifying order.
export const BONUS_START = "2026-11-28T08:00:00Z" // Sat 11/28 00:00 Pacific
export const BONUS_END = "2026-11-30T08:00:00Z" // Mon 11/30 00:00 Pacific (exclusive)
export const BONUS_MIN = 50

export function bonusActive(now: number = previewNow()): boolean {
  return now >= Date.parse(BONUS_START) && now < Date.parse(BONUS_END)
}
