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
  return { ...clean, start: v.start } as GiftDetails
}

// These exact double-underscore names are Recharge's custom-widget contract:
// https://support.getrecharge.com/hc/en-us/articles/17326018885783
// The start choice is a request for the recipient, not a scheduled-email date
// or an automatic subscription start. Affinity owns the actual start date.
export function giftProperties(gift: GiftDetails) {
  const start = gift.start === "january" ? "January 2027" : "the next available envelope"
  const instructions = `Your gift is for six months of Happy Mail. Please choose the 6-Month option and start with ${start} when you redeem. Enter your own shipping address.`
  return [
    { key: "__rc_gift_recipient_email", value: gift.email },
    { key: "__rc_gift_recipient_first_name", value: gift.firstName },
    { key: "__rc_gift_recipient_last_name", value: gift.lastName },
    { key: "__rc_gift_sender_name", value: gift.senderName },
    { key: "__rc_gift_recipient_note", value: [gift.message, instructions].filter(Boolean).join("\n\n") },
    { key: "Requested first envelope", value: start },
  ]
}
