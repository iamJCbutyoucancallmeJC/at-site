// Recharge gift 4201, verified in the merchant portal 2026-10-09 (t1739).
// This is a one-time purchase of credit, NEVER a selling plan on the giver.
export const GIFT_HANDLE = "give-happy-mail-gift"
export const GIFT_VARIANT = "gid://shopify/ProductVariant/67730434359616"
export const GIFT_PRICE = 72
// Keep closed until a paid purchase and native redemption pass (t1739).
export const GIFT_CHECKOUT_ENABLED = true

export type GiftDetails = {
  firstName: string
  lastName: string
  email: string
  senderName: string
  message: string
  start: "next" | "january"
  // "" = Recharge emails the recipient right after checkout. Otherwise a
  // YYYY-MM-DD day (Pacific) on which Recharge sends the gift email instead.
  sendOn: string
}

// How far ahead a giver may schedule the gift email.
export const GIFT_SEND_MAX_DAYS = 90

// Today's date in Pacific time as YYYY-MM-DD (the store's day; the server runs in UTC).
export function pacificToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now)
}

export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// A send date must be a real day, after today and within GIFT_SEND_MAX_DAYS.
// Today itself means "send now", which is the default and needs no date.
// A January-start gift must reach the recipient before the January pull, or the
// watcher (hm-gift-watch.py JANUARY_DATE) would be moving a first charge into the past.
export const GIFT_JANUARY_LAST_SEND = "2027-01-04"

export function validSendOn(value: string, today = pacificToday()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(`${value}T12:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return false
  return value > today && value <= addDays(today, GIFT_SEND_MAX_DAYS)
}

export function parseGiftDetails(value: unknown): GiftDetails | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  const limits = { firstName: 80, lastName: 80, email: 254, senderName: 160, message: 500 }
  const clean: Record<string, string> = {}
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof v[key] !== "string") return null
    clean[key] = v[key].trim()
    if (clean[key].length > limit || (key !== "message" && !clean[key])) return null
    if (key !== "message" && /[\r\n]/.test(clean[key])) return null
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return null
  if (v.start !== "next" && v.start !== "january") return null
  let sendOn = ""
  if (v.send === "date") {
    if (typeof v.sendOn !== "string" || !validSendOn(v.sendOn.trim())) return null
    sendOn = v.sendOn.trim()
    if (v.start === "january" && sendOn > GIFT_JANUARY_LAST_SEND) return null
  } else if (v.send !== undefined && v.send !== "now") return null
  return { ...clean, start: v.start, sendOn } as GiftDetails
}

// These exact double-underscore names are Recharge's custom-widget contract:
// https://support.getrecharge.com/hc/en-us/articles/17326018885783
// The send date is the widget's "Send gift on" field, a date input (YYYY-MM-DD):
// https://docs.getrecharge.com/docs/custom-coding-the-gift-subscriptions-widget-for-shopify-20-themes.md
// Recharge stores it on the gift as notification_scheduled_at, and reads the clock
// time in Eastern, ignoring any offset (tested 2026-11-20, gifts 128262 and 128263:
// a bare date became 05:00Z, i.e. 9 pm Pacific the night before; "08:00-08:00" became
// 13:00Z). So we send 11:00 Eastern, written with its offset: 8 am Pacific whether
// Recharge keeps ignoring the offset or starts honoring it.
export const GIFT_SEND_TIME = "T11:00:00-05:00"
// The start choice is a request for the recipient, not a scheduled-email date
// or an automatic subscription start. Affinity owns the actual start date.
export function giftProperties(gift: GiftDetails) {
  const start = gift.start === "january" ? "January 2027" : "the next available envelope"
  // Recharge's redemption picker shows every Happy Mail variant and its own start-date
  // picker allows only today or tomorrow (verified 2026-10-10). So the note names the one
  // right pick, and a January request is OURS to honor: hm-gift-watch.py moves the first
  // charge to January after redemption. Never promise the recipient a date picker.
  const instructions = gift.start === "january"
    ? `When you redeem, choose "6-Month (per-delivery)" and its 6-month plan: your gift covers all six envelopes. Enter your own shipping address. ${gift.senderName} asked for your mail to start in January 2027, so we will set your first envelope to January for you.`
    : `When you redeem, choose "6-Month (per-delivery)" and its 6-month plan: your gift covers all six envelopes. Enter your own shipping address, and your first envelope goes out with the next batch.`
  return [
    { key: "__rc_gift_recipient_email", value: gift.email },
    { key: "__rc_gift_recipient_first_name", value: gift.firstName },
    { key: "__rc_gift_recipient_last_name", value: gift.lastName },
    { key: "__rc_gift_sender_name", value: gift.senderName },
    { key: "__rc_gift_recipient_note", value: [gift.message, instructions].filter(Boolean).join("\n\n") },
    ...(gift.sendOn ? [{ key: "__rc_gift_notification_scheduled_at", value: gift.sendOn + GIFT_SEND_TIME }] : []),
    { key: "Requested first envelope", value: start },
  ]
}
