// Shop copy that is NOT Amy's Shopify copy (design finish, Phase 2, 2026-11-10).
// Drafted for Amy to edit on the preview; one home so a wording change is one edit.
// Everything a customer reads about a product itself (description, policies)
// comes from Shopify and is not here.

// Under the Add to cart button on every product page. The policy in Shopify says
// orders ship from Culver City with a flat $8 US rate (rendered live into the
// Shipping & returns panel); this is the one-line version.
// CONFIRM WITH AMY: the "1 to 2 days" promise is ours, not hers, and the studio
// ships in-house for the two weeks after the 11/13 shop update.
export const SHIPPING_LINE = "Ships in 1 to 2 days from Culver City, California. US shipping is a flat $8."
export const SHIPPING_LINE_FREE_US = "Free US shipping. Ships in 1 to 2 days from Culver City, California."
// A preorder's ship-by date lives in its Shopify description (shop update plan, 11/9).
export const PREORDER_LINE = "Preorder. It ships as soon as it arrives; the date is in the details below."
export const DIGITAL_LINE = "Sent to your email right after checkout. Nothing ships."
export const SUBSCRIPTION_LINE = "Mailed once a month. Shipping included."

// One sentence under the Shop title, per category chip. Drafts for Amy.
export const CATEGORY_LINES: Record<string, string> = {
  all: "Stickers, stamps and paper goods from Amy's studio in Culver City.",
  stickers: "Sticker books and sheets for journals, planners and happy mail.",
  stamps: "Clear stamp sets designed by Amy, made to layer and mix.",
  printables: "Download, print at home and start today.",
  "happy-mail": "The monthly envelope: stickers, die cuts and a note from Amy.",
}

// The cart's one nudge line (runbook: "an AOV nudge line if Amy wants one"; the
// bundling target is $17 to $22). Grounded in the flat-rate policy, so it is true.
// Set to null to remove it.
export const CART_NUDGE: string | null =
  "US shipping is a flat $8 however much you add, so a second sticker sheet or stamp set ships for nothing extra."

// The About Amy panel on the product page: the homepage's own About copy.
export const ABOUT_AMY_SHORT =
  "Amy Tan is an author, designer, and creative entrepreneur on a mission to inspire others to craft a life they love. From stickers to workshops to her monthly Happy Mail, everything she creates is meant to add a little color to your day."

// Used only if the Storefront API returns no policy body (it has both today).
export const SHIPPING_POLICY_FALLBACK =
  "<p>Orders ship from Culver City, California. US shipping is a flat $8; Happy Mail subscriptions always ship free. International shipping is calculated at checkout at live carrier rates. Printables are delivered by email, so nothing ships.</p>"
export const REFUND_POLICY_FALLBACK =
  "<p>All sales are final. If your order arrives damaged or incorrect, email help@amytangerine.com and we'll make it right.</p>"
