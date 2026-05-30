// Shared Happy Mail content — single source of truth for the /happy-mail landing
// AND the /shop/happy-mail PDP (rebuilt 2026-05-30). Extracted from
// app/happy-mail/happy-mail-client.tsx so the two surfaces never drift.
//
// ⚠️ The FAQ_ITEMS copy is t658-locked subscription policy wording (JC+Amy).
// Edit it here only; both surfaces import from this file. When a centralized FAQ
// page is built, pull FAQ_ITEMS out of the PDP/landing and point everything here.

export const HM_VARIANT_MONTHLY_GID =
  process.env.NEXT_PUBLIC_HM_VARIANT_MONTHLY_GID ?? "gid://shopify/ProductVariant/51926357311808"
export const HM_VARIANT_6MONTH_GID =
  process.env.NEXT_PUBLIC_HM_VARIANT_6MONTH_GID ?? "gid://shopify/ProductVariant/51998971068736"
export const HM_SELLING_PLAN_1MO =
  process.env.NEXT_PUBLIC_HM_SELLING_PLAN_1MO ?? "gid://shopify/SellingPlan/693610938688"
export const HM_SELLING_PLAN_6MO =
  process.env.NEXT_PUBLIC_HM_SELLING_PLAN_6MO ?? "gid://shopify/SellingPlan/693625356608"

export const HM_PRICE_MONTHLY = 13
export const HM_PRICE_6MONTH = 72

export type HmPlan = "monthly" | "6-month"

export const HM_BOX_CONTENTS = [
  { label: "Sticker sheet", body: "Exclusive, before anyone else", img: "/images/happy-mail/sticker-sheet.jpg" },
  { label: "Die cuts", body: "New designs every month", img: "/images/happy-mail/die-cuts.jpg" },
  { label: "A note from Amy", body: "What she's making, what she loves", img: "/images/happy-mail/note-from-amy.jpg" },
  { label: "What's inside", body: "Everything that comes each month", img: "/images/happy-mail/whats-inside.jpg" },
]

// Testimonials — placeholders until Amy pulls from Instagram DMs/comments
export const HM_TESTIMONIALS = [
  {
    quote: "I literally squealed when it arrived. Amy puts so much care into every envelope.",
    name: "Sarah K.",
    location: "Portland, OR",
  },
  {
    quote: "The pieces take my art journal and memory keeper spreads to the next level.",
    name: "Jo Ann T.",
    location: "Torrance, CA",
  },
  {
    quote: "A total no-brainer and a true highlight of my month when it arrives. It gives me the inspiration boost I need to get creative. Thank you!",
    name: "Nicole M.",
    location: "Austin, TX",
  },
  {
    quote: "I gave this as a gift and my mom calls me every month when it arrives. She loves it.",
    name: "Jess M.",
    location: "Nashville, TN",
  },
]

export const HM_FAQ_ITEMS = [
  {
    // [t658] 6-month copy correction (2026-05-29). Was WRONG: said "one-time payment / no recurring charges / non-refundable."
    // Truth (credentials.md "6-month product POLICY" + cutover-week-ops R9): 6-month RECURS ($72 every 6 mo, auto-renews
    // indefinitely, Recharge 22062815 expire_after=null); it's a commitment — cancel stops the NEXT renewal, does not exit/
    // refund the current term; service failures honored normally.
    // ⚠️ Cancel-scope sentence is the one for Amy's eye. Final wording = JC+Amy. Do not mark t658 done.
    // `lead` = big/bold discount emphasis (JC+Amy 2026-05-29).
    q: "What's the difference between Monthly and 6-Month?",
    lead: "Save $6 with 6 Months",
    a: `Monthly ($${HM_PRICE_MONTHLY}/mo) renews automatically each month — cancel anytime and billing stops. 6-Month ($${HM_PRICE_6MONTH}) is a six-month commitment billed once up front, then auto-renews every 6 months. You can cancel before a renewal to stop the next term; the current six-month term isn't cancelled or refunded partway through. Both get the same monthly package, and if something's ever wrong with an order, we'll always make it right.`,
  },
  {
    q: "When does it ship?",
    a: "Around the 15th of each month. You'll get it like a letter from a friend — USPS first-class, no tracking number, usually arrives within a week.",
  },
  {
    q: "Are the contents available in your shop?",
    a: "Nope. Happy Mail goodies are subscriber-exclusive. That's part of the deal.",
  },
  {
    q: "Can I send it as a gift?",
    a: "Yes. At checkout, enter your recipient's shipping address. The 6-Month option is the most popular gift choice — they'll get mail from Amy for half a year.",
  },
  {
    // [t658 addendum] Cancel copy aligned to policy (2026-05-29).
    q: "How do I cancel?",
    a: "Manage your subscription any time in your subscriber account, or email help@amytangerine.com and we'll take care of it. Monthly subscribers can cancel whenever — billing just stops going forward. For 6-Month, cancelling stops your next 6-month renewal; the current six-month term runs to the end. (See “Can I skip or cancel a month?” below for the timing on your final envelope.)",
  },
  {
    // [t658 addendum] NO SKIP (R11) + cancel timing (R15). ⚠️ For Amy's eye: the "5th" cutoff wording.
    q: "Can I skip or cancel a month?",
    a: "We don't offer skipping individual months — every subscriber gets each month's envelope while they're subscribed. You can cancel any time, though. Here's the timing: if you cancel before your monthly billing date (which recurs on your original order date) and before the 5th, when we get each month's envelopes ready, your cancellation applies to the current month and you're out cleanly with no final charge. Otherwise, this month's envelope still ships — it's your last — and your cancellation takes effect the following month.",
  },
  {
    q: "What if my mail doesn't arrive?",
    a: "If you haven't received your envelope by the 25th, email help@amytangerine.com and we'll sort it out.",
  },
  {
    q: "Do you ship internationally?",
    a: `Yes — Happy Mail is available to subscribers in Canada, Australia, and the UK at $16/mo USD (shown in your local currency at checkout). Sign up the same way US subscribers do; the price reflects international postage. This is our "first in your market" pricing — subscribe now and lock in $16/mo for as long as you stay subscribed.`,
    link: { href: "/shop/happy-mail-international", label: "Subscribe internationally →" },
  },
]
