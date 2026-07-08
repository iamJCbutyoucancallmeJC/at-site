"use client"

// /keep — renewal landing for the original Happy Mail six-monthers (cliff
// campaign, t759/t821). Reached from the QR on the in-envelope card that rides
// their sixth-and-final envelope (July 2026), and from the renewal emails.
//
// - Isolated layout (no nav/footer/cart) — registered in lib/chromeless-routes.
// - One job: "keep them coming" at their original price ($72 → $66 with the
//   auto-applied ORIGINAL66 code, first term only; renews at $72 after).
// - Direct-to-checkout: POSTs to /api/checkout/keep, which attaches the
//   6-month SELLING PLAN (t764 correctness) and auto-applies the code, then
//   redirects to Shopify checkout. Nobody types a code.
//
// Public at /keep (QR destination), noindex. After Aug 3 the checkout 409s
// with a friendly pointer to /happy-mail — the page can stay up harmlessly.

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import { HM_PRICE_6MONTH } from "@/lib/happy-mail-content"

const OFFER_DISCOUNT = 6
const OFFER_PRICE = HM_PRICE_6MONTH - OFFER_DISCOUNT // 66 — their original Feb price
const OFFER_DEADLINE = "August 3"

function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

const WHAT_CONTINUES = [
  {
    title: "An envelope from Amy",
    body: "Straight to your door, once a month — same as the six you've had.",
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
    body: "What she's making, what she's loving, what's on her mind.",
    img: "/images/products/happy-mail/3.jpg",
  },
]

export default function KeepPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckout() {
    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "6-month",
      price: OFFER_PRICE.toString(),
      source: "keep",
      page: "keep",
    })

    try {
      const res = await fetch("/api/checkout/keep", {
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
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.")
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

      {/* ── Originals badge ── */}
      <div
        className="py-3 px-4 text-center text-[12px] uppercase tracking-[0.16em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        For the Happy Mail originals · Envelope 6 of 6
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
            Happy Mail · You were one of the first
          </p>
          <h1
            className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Keep them
            <br />
            coming.
          </h1>
          <p
            className="text-[16px] leading-relaxed mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Your sixth and final envelope is on its way — or already in your
            hands. Thank you: sending these has been one of my favorite things
            this year.
          </p>
          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            If they've earned a spot in your mailbox, six more months is one click
            away — at the price you joined at, as a thank-you for being an
            original.
          </p>

          {/* Price — loyalty offer */}
          <div className="flex items-end gap-3 mb-1">
            <span
              className="text-[52px] font-bold leading-none"
              style={{ color: "var(--color-text-primary)" }}
            >
              ${OFFER_PRICE}
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
            Your original price, through {OFFER_DEADLINE} — applied automatically
          </p>

          {/* CTA button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "One moment..." : `Keep my Happy Mail coming — $${OFFER_PRICE}`}
          </button>

          {error && (
            <p className="mt-3 text-[12px]" style={{ color: "#c0392b" }}>
              {error}
            </p>
          )}

          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            After these six months it renews at the regular ${HM_PRICE_6MONTH} every
            six months — cancel anytime. And if this is where your Happy Mail story
            pauses: thank you, truly. xo, Amy
          </p>
        </div>
      </section>

      {/* ── What keeps coming ── */}
      <section
        className="border-t"
        style={{ borderColor: "var(--color-border)", background: "var(--color-orange-light)" }}
      >
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-14">
          <h2
            className="text-[22px] md:text-[26px] font-bold tracking-tight mb-8 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            What keeps coming, every month
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHAT_CONTINUES.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden">
                  <Image src={item.img} alt={item.title} fill className="object-cover" sizes="72px" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer note ── */}
      <footer className="py-8 text-center">
        <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          Questions? Just reply to any Happy Mail email — or write help@amytangerine.com
        </p>
      </footer>
    </main>
  )
}
