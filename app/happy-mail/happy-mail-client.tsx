"use client"

// /happy-mail — Happy Mail landing page
// Direction: "Product-grid hero." The hero IS the box. Four tiles above the
// fold show what you get (die cuts, sticker sheet, envelope, Amy's note).
// Plan-comparison cards immediately below in the same viewport. Decision
// happens without scrolling. Chosen 2026-05-27 from Option A/B/C preview;
// previous design archived in git history (commit prior to FNF branch merge).

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import SectionHeader from "@/components/section-header"
import FaqAccordion from "@/components/faq-accordion"
import FirstEnvelopePromise from "@/components/first-envelope-promise"
import HmWaitlistForm from "@/components/hm-waitlist-form"
import { useHmClosed, HmButtonPlaceholder } from "@/components/hm-closed"
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
  HM_RECENT_ENVELOPES as RECENT_ENVELOPES,
  HM_FAQ_ITEMS as FAQ_ITEMS,
  hmFaqForState,
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
  return (
    <button onClick={handle} className={`cta-primary w-full ${dark ? "" : "cta-primary--outline"}`} style={{ paddingInline: "1rem" }}>
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
  // October 2026 cap (t1702): null until mounted, then closed/open in Pacific time.
  const closed = useHmClosed()
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
          <p className="text-[12px] uppercase tracking-[0.12em] font-bold mb-3" style={{ color: "var(--color-orange-ink)" }}>Monthly subscription</p>
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.02] tracking-[-0.02em] mb-4" style={{ color: "var(--color-ink)" }}>Every month, a letter from Amy.</h1>
          <p className="text-[18px] leading-relaxed max-w-xl mb-8" style={{ color: "var(--color-ink-soft)" }}>The good kind of mail.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
            {BOX_CONTENTS.map((item) => (
              <div key={item.label}>
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2" style={{ background: "var(--color-paper)" }}>
                  <Image src={item.img} alt={item.label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <p className="text-[14px] font-semibold leading-snug" style={{ color: "var(--color-ink)" }}>{item.label}</p>
                <p className="text-[13px] leading-snug" style={{ color: "var(--color-ink-soft)" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscribe" className="px-4 md:px-10 pb-12 md:pb-16">
        <p className="max-w-2xl mx-auto mb-7 p-4 rounded-lg text-center bg-[var(--color-orange-light)]">
          Giving Happy Mail to someone? <Link className="font-semibold underline underline-offset-4" href="/gift">Give six months for $72</Link>. They redeem with their own address.
        </p>
        {closed ? (
          <div className="max-w-2xl mx-auto">
            <HmWaitlistForm page="happy-mail" />
          </div>
        ) : (
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-5 border" style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}>
            <h2 className="text-[18px] font-semibold leading-[1.3] mb-2" style={{ color: "var(--color-ink)" }}>Monthly</h2>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-ink)" }}>${PRICE_MONTHLY}</span>
              <span className="text-[14px] mb-1" style={{ color: "var(--color-ink-soft)" }}>/month</span>
            </div>
            <p className="text-[14px] mb-4" style={{ color: "var(--color-ink-soft)" }}>Renews monthly · cancel anytime</p>
            {closed === null ? <HmButtonPlaceholder /> : <SubscribeButton plan="monthly" dark={false} />}
          </div>
          <div
            ref={sixMonthRef}
            className="rounded-xl p-5 border-2 relative transition-all duration-500"
            style={{
              background: "var(--color-white)",
              borderColor: "var(--color-orange)",
              boxShadow: highlight6mo ? "0 0 0 4px var(--color-teal)" : "none",
              transform: highlight6mo ? "scale(1.02)" : "scale(1)",
            }}
          >
            {/* Badge (Phase 4): ink-family text on the teal tint, teal-ink 4.7:1. It was white on teal, 2.75:1. */}
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] uppercase tracking-[0.1em] font-bold leading-none rounded-lg" style={{ background: "var(--color-teal-tint)", color: "var(--color-teal-ink)" }}>Best value</span>
            <h2 className="text-[18px] font-semibold leading-[1.3] mb-2" style={{ color: "var(--color-ink)" }}>6 months</h2>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-ink)" }}>${PRICE_6MONTH}</span>
              <span className="text-[14px] mb-1" style={{ color: "var(--color-ink-soft)" }}>one payment</span>
            </div>
            {/* [t658] 6-month copy correction (2026-05-29). Plan was WRONG: it recurs (Recharge 22062815, expire_after=null).
                Selling surface — discount now emphasized big/bold per JC+Amy 2026-05-29; honest cadence kept as subline.
                Wording options (cancel-terms live in the FAQ, not here):
                  A (live): "Save $6" big/bold + "billed every 6 months" subline
                  B:        "Save $6" big/bold + "renews until you cancel" subline
                  C:        "Save $6" big/bold + "auto-renews every 6 months" subline
                Final wording is JC+Amy's call — do not mark t658 done. */}
            <p className="text-[20px] md:text-[22px] font-extrabold leading-none mb-0.5" style={{ color: "var(--color-teal-ink)" }}>Save $6</p>
            <p className="text-[14px] mb-4" style={{ color: "var(--color-ink-soft)" }}>billed every 6 months</p>
            {closed === null ? <HmButtonPlaceholder /> : <SubscribeButton plan="6-month" dark={true} />}
          </div>
        </div>
        )}
        {/* d062 (t1079): date-aware first-envelope promise (replaces the static
            "Ships around the 15th." line). Wording is Amy-veto-gated via the
            fall-plan doc; merge to main only after the veto window clears. */}
        {closed ? (
          <p className="text-center text-[14px] mt-4" style={{ color: "var(--color-ink-soft)" }}>
            Happy Mail reopens October 16. Envelopes ship around the 15th.
          </p>
        ) : (
          <FirstEnvelopePromise />
        )}
      </section>

      {/* ── Editorial: a note about Happy Mail (reused from prior site, Amy's voice) ── */}
      <section className="py-12 md:py-16 px-4 md:px-10" style={{ background: "var(--color-white)" }}>
        <div className="max-w-2xl mx-auto">
          <SectionHeader eyebrow="Let me send you mail" title="Happy mail!" />
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-5" style={{ color: "var(--color-ink-soft)" }}>
            Once a month, you&rsquo;ll get an envelope from me filled with fresh &amp; juicy bits I designed
            and actually use for paper crafting and journaling: a 4&times;6 sticker sheet, die cuts, and some
            surprises. Plus a little note.
          </p>
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-8" style={{ color: "var(--color-ink-soft)" }}>
            It&rsquo;s the good kind of mail. The kind that makes you smile when you see it in the stack.
          </p>

          <h3 className="text-[18px] font-semibold leading-[1.3] mb-4" style={{ color: "var(--color-ink)" }}>
            What&rsquo;s inside
          </h3>
          <ul className="space-y-3 mb-8">
            {[
              "Ephemera (die cuts), made in the USA",
              "Exclusive first look at our newest 4×6 sticker sheet (not available anywhere else online)",
              "A note from me about what I'm making, loving, or thinking about",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-[16px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
                <span aria-hidden className="select-none" style={{ color: "var(--color-orange-ink)" }}>&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="text-[14px] font-semibold" style={{ color: "var(--color-orange-ink)" }}>
            Limited spots available.
          </p>
        </div>
      </section>

      {/* Recent envelopes (Phase 4): a series grid that grows by script. Every month
          scripts/add-hm-envelope.mjs adds goes in here, newest first: 2-up on phones,
          3-up from sm, and 4-up from lg once there are four months to show. */}
      {RECENT_ENVELOPES.length > 0 && (
        <section id="inside" className="py-12 md:py-16 px-4 md:px-10 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-5xl mx-auto">
            <SectionHeader title="Recent envelopes" />
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${RECENT_ENVELOPES.length >= 4 ? "lg:grid-cols-4" : ""} gap-4`}>
              {RECENT_ENVELOPES.map((e) => (
                <figure key={e.month} className="min-w-0">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2" style={{ background: "var(--color-paper)" }}>
                    <Image src={e.img} alt={`${e.month} Happy Mail envelope`} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                  </div>
                  <figcaption className="text-[14px] font-semibold" style={{ color: "var(--color-ink)" }}>{e.month}</figcaption>
                  {e.caption && <p className="text-[13px] leading-snug" style={{ color: "var(--color-ink-soft)" }}>{e.caption}</p>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Fan mail: paper cards on the white page (the gray band is gone, Phase 4) ── */}
      <section id="fan-mail" className="py-12 md:py-16 px-4 md:px-10 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader title="Fan mail" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} className="rounded-xl p-5 flex flex-col" style={{ background: "var(--color-paper)" }}>
                <blockquote className="text-[14px] leading-relaxed flex-1 mb-4" style={{ color: "var(--color-ink)" }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--color-ink)" }}>{t.name}</p>
                  <p className="text-[13px]" style={{ color: "var(--color-ink-soft)" }}>{t.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-12 md:py-16 px-4 md:px-10 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-[42rem] mx-auto">
          <SectionHeader title="Questions?" />
          <FaqAccordion items={hmFaqForState(FAQ_ITEMS, closed === true)} />
        </div>
      </section>
    </main>
  )
}
