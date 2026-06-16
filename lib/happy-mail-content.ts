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
    // Updated 2026-05-30: points at the new /happy-mail-international landing (not the
    // PDP that 404s for US readers). Intl buyers subscribe there; US gifters email help@.
    a: `Yes. If you live in Canada, the UK, or Australia, you can subscribe to International Happy Mail at $16/mo USD (shown in your local currency at checkout). The price reflects international postage. If you're in the US and want to send Happy Mail to someone abroad, email help@amytangerine.com and we'll arrange an international gift.`,
    link: { href: "/happy-mail-international", label: "International Happy Mail →" },
  },
]

// ── International Happy Mail (IHM) ─────────────────────────────────────────────
// IHM is a SEPARATE Shopify product (handle happy-mail-international), monthly-only
// ($16 USD, shown in local currency via Shopify Markets). No 6-month intl tier exists.
// Scoped to the International market (CA/AU/GB) only; a US visitor can VIEW this page
// but cannot purchase (the cart drops the intl variant), so the page cross-links US
// readers to /happy-mail. See Website Redesign/ihm-gift-intl-options-2026-05-30.md.

export const IHM_VARIANT_GID =
  process.env.NEXT_PUBLIC_HM_INTL_VARIANT_GID ?? "gid://shopify/ProductVariant/52063112659264"
export const IHM_SELLING_PLAN =
  process.env.NEXT_PUBLIC_HM_INTL_SELLING_PLAN_ID ?? "gid://shopify/SellingPlan/693645214016"

// $16 USD base; Shopify Markets presents local currency at checkout (CA$23 / AU$23 / £13).
export const IHM_PRICE_USD = 16

// ── IHM 6-Month tier (BUILT + LIVE 2026-06-01) ────────────────────────────────────
// $90 6-month ("Save $6" vs $16 x 6 = $96), mirroring US "$6 off" shape.
// Future step (window close): $18/mo + $100 (or $99). See
// Website Redesign/ihm-6month-tier-policy-change-2026-05-30.md.
//
// BUILT 2026-06-01, OVERCHARGE-FIXED + RE-ENABLED 2026-06-16: variant 52075528356160 priced at
// $15/delivery (NOT the $90 total -- prepaid Variant-Level multiplies x6), Recharge plan 22473180
// re-enabled -> fresh selling plan 693671100736 with correct $90 policy. SPG on intl delivery
// profile 137513632064. Verified live via Storefront @inContext: CA$132 / AU$132 / GBP72, all
// availableForSale, US correctly null. Real-customer free shipping confirmed. The page renders the
// two-tier (Monthly + 6-Month) layout.
export const IHM_VARIANT_6MONTH_GID =
  process.env.NEXT_PUBLIC_HM_INTL_VARIANT_6MONTH_GID ?? "gid://shopify/ProductVariant/52075528356160"
export const IHM_SELLING_PLAN_6MONTH =
  process.env.NEXT_PUBLIC_HM_INTL_SELLING_PLAN_6MONTH_ID ?? "gid://shopify/SellingPlan/693671100736"
export const IHM_PRICE_6MONTH_USD = 90

// True only when BOTH the 6-month variant and selling plan ids are real (non-empty).
// Gates the live subscribe path AND the card render (the 6-month card + its Subscribe
// button live inside `{IHM_6MONTH_READY && ...}` in happy-mail-international-client.tsx).
//
// RE-ENABLED 2026-06-16 (t702 RESOLVED): the CAD$759 overcharge is fixed. Root cause was the
// prepaid Variant-Level model multiplying the variant price x6; the variant was priced at the
// 6-month TOTAL ($90) instead of per-delivery, so it charged $90 x6 = $540 -> CA$759. Fix:
// repriced variant 52075528356160 to $15/delivery; Recharge re-enable generated a fresh plan
// (693671100736) whose pricing policy now correctly computes $15 x6 = $90 USD. Verified live
// across markets: CA$132 / AU$132 / GBP72 (~6x monthly with the prepaid discount; exact CA$127
// is unreachable -- Shopify market price-rounding quantizes the per-delivery price then x6's it).
// NOTE: selling plan GID updated above (the old 693648687424 died on disable; 693671100736 is live).
export const IHM_6MONTH_READY =
  IHM_VARIANT_6MONTH_GID.length > 0 && IHM_SELLING_PLAN_6MONTH.length > 0

// Box contents + testimonials are identical to US HM (same physical envelope).
export const IHM_BOX_CONTENTS = HM_BOX_CONTENTS
export const IHM_TESTIMONIALS = HM_TESTIMONIALS

export const IHM_FAQ_ITEMS = [
  {
    q: "Where do you ship, and how much is it?",
    a: `International Happy Mail goes to Canada, the UK, and Australia. It's $${IHM_PRICE_USD}/mo USD, shown in your local currency at checkout (about CA$23, AU$23, or £13 with current exchange rates). International postage is already included — there's no separate shipping charge. This is our "first in your market" pricing: subscribe now and lock in $${IHM_PRICE_USD}/mo for as long as you stay subscribed.`,
  },
  {
    q: "How is this different from US Happy Mail?",
    // Honest framing: same envelope, the price difference is postage only.
    a: "Same envelope, same surprises — the only difference is the price covers international postage instead of US postage. You'll get the exact same monthly sticker sheet, die cuts, and note from Amy that US subscribers get.",
  },
  {
    q: "Is there a 6-month option?",
    // 6-month intl tier LIVE 2026-06-01. $90 = "save $6" vs $16 x 6 = $96.
    a: `Yes! The 6-Month plan is $${IHM_PRICE_6MONTH_USD} (shown in your local currency at checkout) — that's $6 off versus paying monthly. You're billed once every six months, postage included, and it auto-renews so you don't have to think about it. Same envelope every month either way.`,
  },
  {
    q: "When does it ship?",
    a: "Around the 15th of each month. It travels as international letter mail, so allow a little extra time — it usually arrives within two to three weeks depending on your country's post.",
  },
  {
    q: "Are the contents available in your shop?",
    a: "Nope. Happy Mail goodies are subscriber-exclusive. That's part of the deal.",
  },
  {
    q: "Can I send it as a gift?",
    // Within-market only. Cross-border gifting (e.g. a US buyer -> intl recipient) is NOT
    // self-serve yet (concierge via help@). Do NOT promise a cross-border gift here.
    a: "Yes. At checkout, enter your recipient's shipping address in Canada, the UK, or Australia, and the mail goes straight to them. (Sending from the US to a friend abroad? Email help@amytangerine.com and we'll set that up for you.)",
  },
  {
    q: "How do I cancel?",
    a: "Manage your subscription any time in your subscriber account, or email help@amytangerine.com and we'll take care of it. Cancel whenever — billing just stops going forward.",
  },
  {
    q: "What if my mail doesn't arrive?",
    // Wider window than US (intl transit is slower).
    a: "International mail can take longer. If you haven't received your envelope within four weeks of the ship date, email help@amytangerine.com and we'll sort it out.",
  },
  {
    q: "Are there any customs fees?",
    // Honest: low-value letter mail is below de-minimis in CA/AU/GB, but say it plainly.
    a: "For Canada, the UK, and Australia, Happy Mail is small, low-value letter mail and almost never triggers customs charges. If your country's post ever asks for a small import fee, reach out to help@amytangerine.com and we'll help.",
  },
  {
    q: "Want US Happy Mail instead?",
    a: "If you're in the United States, head to our US Happy Mail page for $13/mo (or $72 for six months).",
    link: { href: "/happy-mail", label: "US Happy Mail →" },
  },
]
