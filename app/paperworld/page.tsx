"use client"

// Seattle Paper World Stationery Expo event landing page (t824).
// - Isolated layout (no nav/footer/cart) — reached via the QR code on Amy's booth.
// - Happy Mail 6-Month subscription, event-only price ($72 → $66 with the
//   auto-applied PAPERWORLD code).
// - Direct-to-checkout: POSTs to /api/checkout/paperworld, which attaches the
//   6-month SELLING PLAN (so it resolves to $72, NOT the bare $12 variant — the
//   correctness fix the retired Junklub page lacked) and auto-applies the event
//   discount, then redirects to Shopify checkout.
//
// Public at /paperworld (QR destination), noindex. Until the PAPERWORLD discount
// is created + ACTIVE in Shopify, the checkout button surfaces "event discount
// isn't active yet" (the route 409s rather than sell at full price).

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import { HM_PRICE_6MONTH } from "@/lib/happy-mail-content"

// Event facts (Paper World Stationery Expo — Seattle stop).
const EVENT = {
  name: "Paper World Stationery Expo",
  city: "Seattle",
  dateLabel: "Saturday, June 27",
  venue: "DoubleTree Seattle Airport",
}

// $72 base, $6 off at the show.
const EVENT_DISCOUNT = 6
const EVENT_PRICE = HM_PRICE_6MONTH - EVENT_DISCOUNT // 66
const DISCOUNT_CODE = "PAPERWORLD"

function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

const WHAT_INSIDE = [
  {
    title: "An envelope from Amy",
    body: "Sent straight to your door, once a month.",
    img: "/images/products/happy-mail/2.jpg",
  },
  {
    title: "Die cuts Amy designed, made in the USA",
    body: "New designs every month. Subscriber-exclusive — not in the shop.",
    img: "/images/happy-mail/die-cuts.jpg",
  },
  {
    title: "First look at the newest sticker sheet",
    body: "Subscribers get it before anyone else.",
    img: "/images/happy-mail/sticker-sheet.jpg",
  },
  {
    title: "A note from Amy",
    body: "What she's making, what she's loving, what's on her mind. Personal, not a newsletter.",
    img: "/images/products/happy-mail/3.jpg",
  },
]

const TESTIMONIALS = [
  {
    quote: "I literally squealed when it arrived. So much care in every envelope.",
    name: "Sarah K.", location: "Portland, OR",
  },
  {
    quote: "I've tried other subscription boxes. Nothing comes close to getting actual mail from Amy.",
    name: "Melissa T.", location: "Austin, TX",
  },
  {
    quote: "I gave this as a gift and my mom calls me every month when it arrives.",
    name: "Jess M.", location: "Nashville, TN",
  },
]

export default function PaperworldPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckout() {
    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "6-month",
      price: EVENT_PRICE.toString(),
      source: "paperworld",
      page: "paperworld",
    })

    try {
      const res = await fetch("/api/checkout/paperworld", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gaClientId: readGaClientId() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Checkout unavailable")
      }
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again or visit the booth.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* ── Header — logo only, no nav ── */}
      <header
        className="flex items-center justify-center py-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Image
          src="/images/amy-tangerine-logo.png"
          alt="Amy Tangerine"
          width={140}
          height={40}
          className="object-contain"
          priority
        />
      </header>

      {/* ── Event badge ── */}
      <div
        className="py-3 px-4 text-center text-[12px] uppercase tracking-[0.16em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        {EVENT.name} · {EVENT.city} · {EVENT.dateLabel} — Show Exclusive
      </div>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-10 md:pb-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        {/* Image */}
        <div className="relative w-full md:w-[380px] flex-shrink-0 aspect-square rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/images/products/happy-mail/1.jpg"
            alt="Happy Mail from Amy Tangerine"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 380px"
          />
        </div>

        {/* Copy + CTA */}
        <div className="flex-1">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Happy Mail · 6-Month Subscription
          </p>
          <h1
            className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Six months of
            <br />
            mail from me.
          </h1>
          <p
            className="text-[16px] leading-relaxed mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Once a month, a package from Amy — die cuts, stickers, and a personal
            note. The good kind of mail.
          </p>
          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Scanned the code at the booth? This {EVENT.city} show price is just for
            you, today.
          </p>

          {/* Price — event discount */}
          <div className="flex items-end gap-3 mb-1">
            <span
              className="text-[52px] font-bold leading-none"
              style={{ color: "var(--color-text-primary)" }}
            >
              ${EVENT_PRICE}
            </span>
            <span className="flex flex-col leading-tight mb-1">
              <span
                className="text-[18px] line-through"
                style={{ color: "var(--color-text-secondary)" }}
              >
                ${HM_PRICE_6MONTH}
              </span>
              <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                one payment · 6 months
              </span>
            </span>
          </div>
          <p className="text-[13px] font-semibold mb-6" style={{ color: "var(--color-teal)" }}>
            ${EVENT_DISCOUNT} off at the show · code {DISCOUNT_CODE} applied automatically
          </p>

          {/* CTA button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "One moment..." : `Subscribe — $${EVENT_PRICE}`}
          </button>

          {error && (
            <p className="mt-3 text-[12px]" style={{ color: "#c0392b" }}>
              {error}
            </p>
          )}

          <p
            className="mt-4 text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Ships around the 15th each month · US only · Auto-renews every 6 months, cancel anytime
          </p>
        </div>
      </section>

      {/* ── What's inside ── */}
      <section
        className="py-12 md:py-14 px-6 md:px-10"
        style={{ background: "var(--color-gray-light)" }}
      >
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Every month, you get:
        </h2>
        <p
          className="text-center text-[14px] mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Four things, assembled and sent with care.
        </p>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {WHAT_INSIDE.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border"
              style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}
            >
              <div className="relative aspect-square">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-3 md:p-4">
                <h3
                  className="text-[12px] md:text-[13px] font-semibold mb-1 leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </h3>
                <p className="text-[11px] md:text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-12 md:py-14 px-6 md:px-10">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-5"
              style={{ background: "var(--color-gray-light)", border: "1px solid var(--color-border)" }}
            >
              <p
                className="text-[13px] leading-relaxed mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {t.name}
              </p>
              <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                {t.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="py-14 md:py-18 px-6 text-center"
        style={{ background: "var(--color-teal)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3">
          {EVENT.city} Show Exclusive
        </p>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white leading-tight mb-3">
          Ready to get happy mail?
        </h2>
        <p className="text-[14px] text-white/75 mb-8 max-w-sm mx-auto leading-relaxed">
          Six months from Amy at the {EVENT.city} show price — ${EVENT_PRICE} instead of
          ${HM_PRICE_6MONTH}. Just for friends who stopped by the booth.
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="px-12 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full bg-white transition-all duration-300 disabled:opacity-60 hover:bg-white/90"
          style={{ color: "var(--color-teal)" }}
        >
          {loading ? "One moment..." : `Subscribe — $${EVENT_PRICE}`}
        </button>

        {error && (
          <p className="mt-4 text-[12px] text-white/90">{error}</p>
        )}

        <p className="mt-5 text-[12px] text-white/50">
          Ships ~15th each month · US only · Auto-renews every 6 months
        </p>
      </section>

      {/* ── Footer — minimal ── */}
      <footer
        className="py-6 text-center text-[12px]"
        style={{ color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)" }}
      >
        <p>
          Questions?{" "}
          <a
            href="mailto:help@amytangerine.com"
            className="underline hover:opacity-70"
            style={{ color: "var(--color-orange)" }}
          >
            help@amytangerine.com
          </a>
          {" "}· amytangerine.com
        </p>
      </footer>
    </main>
  )
}
