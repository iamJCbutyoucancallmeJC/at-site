"use client"

// /happy-mail-international — International Happy Mail (IHM) landing page.
//
// Mirrors the /happy-mail landing (commit 61f0584 pattern: rich landing, the PDP
// /shop/happy-mail-international redirects here) but for the intl product:
//  - ONE plan only ($16/mo monthly; no 6-month intl tier exists)
//  - IHM pricing + "first in your market" framing (local currency at checkout)
//  - IHM-relevant FAQ (this reader IS international)
//  - a header treatment that will carry the IHM stamp (placeholder until Amy's art)
//  - a US-visitor cross-link to /happy-mail (US can VIEW but not purchase; no auto-
//    redirect — the fragile geo-routing was removed 2026-05-29).
//
// Built as a clone of happy-mail-client.tsx (not a parameterization) so the high-
// traffic US page is untouched. Dedup is a tracked follow-up.

import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import FaqAccordion from "@/components/faq-accordion"
import TrackableLink from "@/components/trackable-link"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"
import {
  IHM_VARIANT_GID,
  IHM_SELLING_PLAN,
  IHM_PRICE_USD as PRICE,
  IHM_BOX_CONTENTS as BOX_CONTENTS,
  IHM_TESTIMONIALS as TESTIMONIALS,
  IHM_FAQ_ITEMS as FAQ_ITEMS,
} from "@/lib/happy-mail-content"

// Launch shape (JC 2026-05-30): MONTHLY ONLY. The 6-month intl tier + the "AIR MAIL/INTL"
// stamp treatment are built but held OFF for launch (6-month needs Recharge variant/plan work;
// stamp pending Amy's pick). The two-card layout, ComingSoonButton, and IhmStamp live in git
// history + ihm-stamp.tsx / happy-mail-content.ts (IHM_*_6MONTH_* constants) for re-add.

function SubscribeButton({ label }: { label: string }) {
  const { addItem } = useCart()
  function handle() {
    addItem({
      variantId: IHM_VARIANT_GID,
      productHandle: "happy-mail-international",
      title: "International Happy Mail — Monthly Subscription",
      price: `$${PRICE.toFixed(2)}`,
      priceAmount: PRICE,
      imageUrl: "/images/products/happy-mail-international/1.jpg",
      sellingPlanId: IHM_SELLING_PLAN,
    })
    trackEvent("hm_subscribe_click", { plan: "monthly-intl", price: PRICE.toString(), source: "happy-mail-international", page: "happy-mail-international" })
  }
  return (
    <button onClick={handle} className="w-full py-3 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full transition-all duration-300 hover:opacity-90 cursor-pointer" style={{ background: "var(--color-orange)", color: "#fff", border: "2px solid var(--color-orange)" }}>
      {label}
    </button>
  )
}

export default function HappyMailInternationalClient({ localizedPrice }: { localizedPrice?: string | null }) {
  // localizedPrice is the MONTHLY @inContext price string from Shopify (e.g. "CA$23.00", "£13.00").
  // Falls back to the flat USD label when absent (US visitor / local dev / no geo header).
  const priceLabel = localizedPrice ?? `$${PRICE}.00`
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="happy-mail-international" />

      {/* ── Hero ── */}
      <section className="px-4 md:px-10 pt-10 md:pt-16 pb-8 md:pb-10">
        <div className="max-w-6xl mx-auto">
          {/* NOTE: an IHM "AIR MAIL / INTL" stamp treatment is built but held OFF for launch
              (JC 2026-05-30). The asset + 3 SVG alternates live in app/happy-mail-international/
              ihm-stamp.tsx; re-add <IhmStamp> here when Amy picks one. Post-launch: t679 (clean
              stamp PNG re-export). */}
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>International · Monthly Subscription</p>
          <h1 className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-4" style={{ color: "var(--color-text-primary)" }}>Every month, a letter from Amy.</h1>
          <p className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mb-3" style={{ color: "var(--color-text-secondary)" }}>The good kind of mail, now shipping to Canada, the UK, and Australia.</p>
          {/* US-visitor cross-link (US can see this page but can't buy the intl product). */}
          <p className="text-[13px] mb-8" style={{ color: "var(--color-text-secondary)" }}>
            In the US?{" "}
            <TrackableLink href="/happy-mail" event="nav_click" eventData={{ link_text: "US Happy Mail", page: "happy-mail-international" }} className="font-semibold underline" style={{ color: "var(--color-orange)" }}>
              Subscribe to US Happy Mail here →
            </TrackableLink>
          </p>
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

      {/* ── Subscribe (monthly only at launch) ── */}
      <section id="subscribe" className="px-4 md:px-10 pb-12 md:pb-16">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl p-6 border-2 relative" style={{ background: "var(--color-white)", borderColor: "var(--color-orange)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] uppercase tracking-[0.12em] font-bold rounded-full text-white" style={{ background: "var(--color-teal)" }}>First in your market</span>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-orange)" }}>Monthly · International</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>{priceLabel}</span>
              <span className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>/month</span>
            </div>
            <p className="text-[11px] mb-4" style={{ color: "var(--color-text-secondary)" }}>Postage included · cancel anytime</p>
            <SubscribeButton label={`Subscribe · ${priceLabel}/mo`} />
          </div>
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "var(--color-text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--color-orange)" }}>First in your market</span> — subscribe now and lock in this rate. Ships around the 15th. International postage included.
        </p>
      </section>

      {/* ── Editorial ── */}
      <section className="py-12 md:py-16 px-4 md:px-10" style={{ background: "var(--color-white)" }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>
            Let me send you mail
          </p>
          <h2 className="text-[26px] md:text-[34px] font-bold leading-tight tracking-tight mb-5" style={{ color: "var(--color-text-primary)" }}>
            Happy mail, worldwide!
          </h2>
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
            Once a month, you&rsquo;ll get an envelope from me filled with fresh &amp; juicy bits I designed
            and actually use for paper crafting and journaling: a 4&times;6 sticker sheet, die cuts, and some
            surprises. Plus a little note.
          </p>
          <p className="text-[16px] md:text-[18px] leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Same envelope our US subscribers love &mdash; now mailed to your door in Canada, the UK, or Australia,
            with international postage already included in the price.
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
      <section className="py-12 md:py-16 px-4 md:px-10" style={{ background: "var(--color-gray-light)" }}>
        <h2 className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-8 md:mb-10" style={{ color: "var(--color-text-primary)" }}>
          Fan mail
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-xl p-5 flex flex-col" style={{ background: "var(--color-white)", border: "1px solid var(--color-border)" }}>
              <p className="text-[13px] leading-relaxed flex-1 mb-4" style={{ color: "var(--color-text-secondary)" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{t.name}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 md:py-16 px-4 md:px-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-8" style={{ color: "var(--color-text-primary)" }}>
            Questions?
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </main>
  )
}
