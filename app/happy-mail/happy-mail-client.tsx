"use client"

// /happy-mail — Happy Mail landing page
// Direction: "Product-grid hero." The hero IS the box. Four tiles above the
// fold show what you get (die cuts, sticker sheet, envelope, Amy's note).
// Plan-comparison cards immediately below in the same viewport. Decision
// happens without scrolling. Chosen 2026-05-27 from Option A/B/C preview;
// previous design archived in git history (commit prior to FNF branch merge).

import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import FaqAccordion from "@/components/faq-accordion"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"

const HM_VARIANT_MONTHLY_GID = process.env.NEXT_PUBLIC_HM_VARIANT_MONTHLY_GID ?? "gid://shopify/ProductVariant/51926357311808"
const HM_VARIANT_6MONTH_GID = process.env.NEXT_PUBLIC_HM_VARIANT_6MONTH_GID ?? "gid://shopify/ProductVariant/51998971068736"
const SELLING_PLAN_1MO = process.env.NEXT_PUBLIC_HM_SELLING_PLAN_1MO ?? "gid://shopify/SellingPlan/693610938688"
const SELLING_PLAN_6MO = process.env.NEXT_PUBLIC_HM_SELLING_PLAN_6MO ?? "gid://shopify/SellingPlan/693625356608"
const PRICE_MONTHLY = 13
const PRICE_6MONTH = 72

const BOX_CONTENTS = [
  { label: "Sticker sheet", body: "Exclusive, before anyone else", img: "/images/happy-mail/sticker-sheet.jpg" },
  { label: "Die cuts", body: "New designs every month", img: "/images/happy-mail/die-cuts.jpg" },
  { label: "A note from Amy", body: "What she's making, what she loves", img: "/images/happy-mail/note-from-amy.jpg" },
  { label: "What's inside", body: "Everything that comes each month", img: "/images/happy-mail/whats-inside.jpg" },
]

// Testimonials — placeholders until Amy pulls from Instagram DMs/comments
const TESTIMONIALS = [
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

const FAQ_ITEMS = [
  {
    // [t658] 6-month copy correction (2026-05-29). Was WRONG: said "one-time payment / no recurring charges / non-refundable."
    // Truth (credentials.md "6-month product POLICY" + cutover-week-ops R9): 6-month RECURS ($72 every 6 mo, auto-renews
    // indefinitely, Recharge 22062815 expire_after=null); it's a commitment — cancel stops the NEXT renewal, does not exit/
    // refund the current term; service failures honored normally.
    // FAQ wording options (explaining surface — the cancel-scope reconciliation lives here):
    //   A (live): see below — complete + true on both axes; appends C's "make it right" reassurance.
    //   B: "Monthly ($13/mo) bills each month and you can cancel anytime. 6-Month ($72) covers six months of mail in one
    //       payment and keeps renewing every 6 months until you cancel. Cancelling turns off your next renewal — it doesn't
    //       end or refund the term you're currently in. Same monthly package either way."
    //   C: "Monthly ($13/mo): no commitment, cancel anytime. 6-Month ($72): one payment for a six-month term that auto-renews
    //       every 6 months. Because it's a commitment, it can't be cancelled or refunded mid-term — but you can cancel anytime
    //       before your next renewal so you're not charged again. (If something's ever wrong with an order, we'll always make it right.)"
    // ⚠️ Cancel-scope sentence is the one for Amy's eye. Final wording = JC+Amy. Do not mark t658 done.
    // `lead` = big/bold discount emphasis (JC+Amy 2026-05-29). Lead options: "Save $6 on 6 months" / "Save $6 vs. monthly" / "6 months, save $6".
    q: "What's the difference between Monthly and 6-Month?",
    lead: "Save $6 with 6 Months",
    a: `Monthly ($${PRICE_MONTHLY}/mo) renews automatically each month — cancel anytime and billing stops. 6-Month ($${PRICE_6MONTH}) is a six-month commitment billed once up front, then auto-renews every 6 months. You can cancel before a renewal to stop the next term; the current six-month term isn't cancelled or refunded partway through. Both get the same monthly package, and if something's ever wrong with an order, we'll always make it right.`,
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
    // [t658 addendum] Cancel copy aligned to policy (2026-05-29). REMOVED the old "skip the current month's envelope, cancel
    // before the 10th" line — NO SKIP (R11) and the date mechanic was wrong (R15: the 5th is the fulfillment-batch LOCK, not a
    // billing date; once billed you keep that envelope). Timing detail now lives in the dedicated "Can I skip or cancel a
    // month?" Q below; this answer stays high-level on HOW to cancel + the Monthly-vs-6mo scope.
    // Final wording = JC+Amy. Do not mark t658 done.
    q: "How do I cancel?",
    a: "Manage your subscription any time in your subscriber account, or email help@amytangerine.com and we'll take care of it. Monthly subscribers can cancel whenever — billing just stops going forward. For 6-Month, cancelling stops your next 6-month renewal; the current six-month term runs to the end. (See “Can I skip or cancel a month?” below for the timing on your final envelope.)",
  },
  {
    // [t658 addendum] NEW Q (2026-05-29, Amy). Two rules: (1) NO SKIP (R11) — not offered to anyone. (2) Cancel timing (R15):
    // once billed you keep that envelope (no pull-back/refund); the 5th = fulfillment-batch LOCK, not a billing date.
    // Precedence: already billed → keep current, cancel takes next month · not billed but cancel AFTER the 5th → batch locked,
    // still get this month, cancel next month · not billed AND on/before the 5th → clean exit, no charge, no final envelope.
    // Wording options for this answer:
    //   A (live): "no skip" + clean-exit = cancel BEFORE billing date AND BEFORE the 5th (R15 case 3, the explicit AND per JC
    //             2026-05-29); otherwise this month's envelope is the last and cancel takes the following month (R15 cases 1+2).
    //   B (fuller): adds the explicit "if you've already been charged this month, that envelope is on its way" sentence.
    //   C (tersest): "We don't offer skipping. To stop, cancel — if you've already been billed for the month, that envelope
    //                 ships and your cancellation starts the next month."
    // ⚠️ For Amy's eye: the "5th" cutoff + whether to name a specific date publicly at all (vs. "once we've billed you").
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

function SubscribeButton({ plan, dark = true }: { plan: "monthly" | "6-month"; dark?: boolean }) {
  const { addItem } = useCart()
  const isMonthly = plan === "monthly"
  const variantId = isMonthly ? HM_VARIANT_MONTHLY_GID : HM_VARIANT_6MONTH_GID
  const sellingPlanId = isMonthly ? SELLING_PLAN_1MO : SELLING_PLAN_6MO
  const priceAmount = isMonthly ? PRICE_MONTHLY : PRICE_6MONTH
  function handle() {
    addItem({
      variantId,
      productHandle: "happy-mail",
      title: isMonthly ? "Happy Mail — Monthly Subscription" : "Happy Mail — 6-Month Subscription",
      price: `$${priceAmount.toFixed(2)}`,
      priceAmount,
      imageUrl: "/images/products/happy-mail/1.jpg",
      sellingPlanId,
    })
    trackEvent("hm_subscribe_click", { plan, price: priceAmount.toString(), source: "happy-mail", page: "happy-mail" })
  }
  const styles = dark
    ? { background: "var(--color-orange)", color: "#fff", border: "2px solid var(--color-orange)" }
    : { background: "transparent", color: "var(--color-orange)", border: "2px solid var(--color-orange)" }
  return (
    <button onClick={handle} className="w-full py-3 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full transition-all duration-300 hover:opacity-90 cursor-pointer" style={styles}>
      {isMonthly ? `Subscribe Monthly · $${PRICE_MONTHLY}/mo` : `Get 6 Months · $${PRICE_6MONTH}`}
    </button>
  )
}

export default function HappyMailClient() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="happy-mail" />

      <section className="px-4 md:px-10 pt-10 md:pt-16 pb-8 md:pb-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>Monthly Subscription</p>
          <h1 className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-4" style={{ color: "var(--color-text-primary)" }}>Every month, a letter from Amy.</h1>
          <p className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mb-8" style={{ color: "var(--color-text-secondary)" }}>The good kind of mail.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
            {BOX_CONTENTS.map((item) => (
              <div key={item.label}>
                <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
                  <Image src={item.img} alt={item.label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>{item.label}</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscribe" className="px-4 md:px-10 pb-12 md:pb-16">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Monthly</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>${PRICE_MONTHLY}</span>
              <span className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>/month</span>
            </div>
            <p className="text-[11px] mb-4" style={{ color: "var(--color-text-secondary)" }}>Renews monthly · cancel anytime</p>
            <SubscribeButton plan="monthly" dark={false} />
          </div>
          <div className="rounded-2xl p-5 border-2 relative" style={{ background: "var(--color-white)", borderColor: "var(--color-orange)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] uppercase tracking-[0.12em] font-bold rounded-full text-white" style={{ background: "var(--color-teal)" }}>Best value</span>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-orange)" }}>6 Months</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>${PRICE_6MONTH}</span>
              <span className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>one payment</span>
            </div>
            {/* [t658] 6-month copy correction (2026-05-29). Plan was WRONG: it recurs (Recharge 22062815, expire_after=null).
                Selling surface — discount now emphasized big/bold per JC+Amy 2026-05-29; honest cadence kept as subline.
                Wording options (cancel-terms live in the FAQ, not here):
                  A (live): "Save $6" big/bold + "billed every 6 months" subline
                  B:        "Save $6" big/bold + "renews until you cancel" subline
                  C:        "Save $6" big/bold + "auto-renews every 6 months" subline
                Final wording is JC+Amy's call — do not mark t658 done. */}
            <p className="text-[20px] md:text-[22px] font-extrabold leading-none mb-0.5" style={{ color: "var(--color-teal)" }}>Save $6</p>
            <p className="text-[11px] mb-4" style={{ color: "var(--color-text-secondary)" }}>billed every 6 months</p>
            <SubscribeButton plan="6-month" dark={true} />
          </div>
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "var(--color-text-secondary)" }}>Ships around the 15th.</p>
      </section>

      {/* ── Editorial: a note about Happy Mail (reused from prior site, Amy's voice) ── */}
      <section className="py-12 md:py-16 px-4 md:px-10" style={{ background: "var(--color-white)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>
            Let me send you mail
          </p>
          <h2 className="text-[26px] md:text-[34px] font-bold leading-tight tracking-tight mb-5" style={{ color: "var(--color-text-primary)" }}>
            Happy mail!
          </h2>
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
            Once a month, you&rsquo;ll get an envelope from me filled with fresh &amp; juicy bits I designed
            and actually use for paper crafting and journaling: a 4&times;6 sticker sheet, die cuts, and some
            surprises. Plus a little note.
          </p>
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
            It&rsquo;s the good kind of mail. The kind that makes you smile when you see it in the stack.
          </p>

          <p className="text-[12px] uppercase tracking-[0.15em] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            What&rsquo;s inside
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Ephemera (die cuts), made in the USA",
              "Exclusive first look at our newest 4×6 sticker sheet (not available anywhere else online)",
              "A note from me about what I'm making, loving, or thinking about",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[15px] md:text-[16px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                <span aria-hidden className="select-none" style={{ color: "var(--color-orange)" }}>&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-[14px] font-semibold" style={{ color: "var(--color-orange)" }}>
            Limited spots available.
          </p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="py-12 md:py-16 px-4 md:px-10"
        style={{ background: "var(--color-gray-light)" }}
      >
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-8 md:mb-10"
          style={{ color: "var(--color-text-primary)" }}
        >
          Fan mail
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex flex-col"
              style={{ background: "var(--color-white)", border: "1px solid var(--color-border)" }}
            >
              <p
                className="text-[13px] leading-relaxed flex-1 mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {t.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 md:py-16 px-4 md:px-10">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            Questions?
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </main>
  )
}
