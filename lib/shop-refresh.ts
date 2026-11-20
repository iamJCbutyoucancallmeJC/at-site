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

export function msUntilOpen(now: number = Date.now()): number {
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
