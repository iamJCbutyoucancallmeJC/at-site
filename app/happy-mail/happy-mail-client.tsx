"use client"

// /happy-mail — Happy Mail landing page
// Direction: "Product-grid hero." The hero IS the box. Four tiles above the
// fold show what you get (die cuts, sticker sheet, envelope, Amy's note).
// Plan-comparison cards immediately below in the same viewport. Decision
// happens without scrolling. Chosen 2026-05-27 from Option A/B/C preview;
// previous design archived in git history (commit prior to FNF branch merge).

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import FaqAccordion from "@/components/faq-accordion"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"
import {
  HM_VARIANT_MONTHLY_GID,
  HM_VARIANT_6MONTH_GID,
  HM_SELLING_PLAN_1MO,
  HM_SELLING_PLAN_6MO,
  HM_PRICE_MONTHLY as PRICE_MONTHLY,
  HM_PRICE_6MONTH as PRICE_6MONTH,
  HM_BOX_CONTENTS as BOX_CONTENTS,
  HM_TESTIMONIALS as TESTIMONIALS,
  HM_FAQ_ITEMS as FAQ_ITEMS,
} from "@/lib/happy-mail-content"

function SubscribeButton({ plan, dark = true }: { plan: "monthly" | "6-month"; dark?: boolean }) {
  const { addItem } = useCart()
  const isMonthly = plan === "monthly"
  const variantId = isMonthly ? HM_VARIANT_MONTHLY_GID : HM_VARIANT_6MONTH_GID
  const sellingPlanId = isMonthly ? HM_SELLING_PLAN_1MO : HM_SELLING_PLAN_6MO
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
  const searchParams = useSearchParams()
  const sixMonthRef = useRef<HTMLDivElement>(null)
  // When arriving with ?plan=6-month (e.g. a 6-Month cart item redirected here from
  // /shop/happy-mail), pre-emphasize the 6-Month card and scroll the plan picker into
  // view so the customer lands on the plan they clicked. 2026-05-30.
  const [highlight6mo, setHighlight6mo] = useState(false)
  useEffect(() => {
    if (searchParams.get("plan") !== "6-month") return
    setHighlight6mo(true)
    // Defer scroll until after paint so the section is laid out.
    const id = window.setTimeout(() => {
      sixMonthRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
    // Fade the highlight after a few seconds so it reads as a cue, not a permanent state.
    const fade = window.setTimeout(() => setHighlight6mo(false), 3500)
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(fade)
    }
  }, [searchParams])

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
          <div
            ref={sixMonthRef}
            className="rounded-2xl p-5 border-2 relative transition-all duration-500"
            style={{
              background: "var(--color-white)",
              borderColor: "var(--color-orange)",
              boxShadow: highlight6mo ? "0 0 0 4px var(--color-teal)" : "none",
              transform: highlight6mo ? "scale(1.02)" : "scale(1)",
            }}
          >
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
