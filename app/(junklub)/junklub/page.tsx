"use client"

// Junklub event landing page — Happy Mail 6-Month, event price.
// - No nav, no footer, no cart drawer (isolated layout)
// - "Met me at Junklub?" framing for junk-journal attendees
// - Shows $72 struck through -> $66 event price
// - Direct-to-checkout: creates a Shopify cart, auto-applies JUNKLUB, redirects
// - Reached only via Amy's QR code (the QR is the gate on the discount)

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"

// Live US 6-Month Happy Mail variant ($72 base). Confirmed available for sale on
// the live store (q9x1sj-hc). The JUNKLUB discount takes $6 off at checkout.
const HM6_VARIANT_GID =
  process.env.NEXT_PUBLIC_HM_VARIANT_6MONTH_GID ??
  "gid://shopify/ProductVariant/51998971068736"

const EVENT_PRICE = 66
const REGULAR_PRICE = 72

const WHAT_INSIDE = [
  {
    title: "Die cuts for your pages",
    body: "New designs every month, made in the USA. Perfect for layering into your junk journal.",
    img: "/images/junklub/die-cuts.jpg",
  },
  {
    title: "First look at the newest sticker sheet",
    body: "Subscribers get it before anyone else — often before it's even listed.",
    img: "/images/junklub/sticker-sheet.jpg",
  },
  {
    title: "An envelope from Amy",
    body: "Hand-addressed and sent straight to your door, once a month.",
    img: "/images/products/happy-mail/2.jpg",
  },
  {
    title: "A note from Amy",
    body: "What she's making, what she's loving, what's on her mind. Personal. Not a newsletter.",
    img: "/images/products/happy-mail/3.jpg",
  },
]

const TESTIMONIALS = [
  {
    quote: "I literally squealed when it arrived. So much care in every envelope.",
    name: "Sarah K.", location: "Portland, OR",
  },
  {
    quote: "The die cuts have become the best part of my journaling spreads.",
    name: "Melissa T.", location: "Austin, TX",
  },
  {
    quote: "I gave this as a gift and my mom calls me every month when it arrives.",
    name: "Jess M.", location: "Nashville, TN",
  },
]

export default function JunklubPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const shopifyReady = !!HM6_VARIANT_GID

  async function handleCheckout() {
    if (!shopifyReady) return

    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "6-month",
      price: String(EVENT_PRICE.toFixed(2)),
      source: "junklub-event",
      page: "junklub",
    })

    try {
      const res = await fetch("/api/checkout/junklub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: HM6_VARIANT_GID }),
      })

      if (!res.ok) throw new Error("Checkout unavailable")

      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch {
      setError("Something went wrong. Please try again or visit amytangerine.com.")
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
        className="py-3 text-center text-[12px] uppercase tracking-[0.18em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        Junklub Exclusive · Your event price is already applied
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
            Met me at
            <br />
            Junklub?
          </h1>
          <p
            className="text-[16px] leading-relaxed mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Keep the supplies coming. Once a month, a package from Amy — die cuts,
            stickers, and a personal note. The good kind of mail.
          </p>
          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            This is your event price — $6 off the 6-month plan, just for joining us
            today.
          </p>

          {/* Price */}
          <div className="flex items-end gap-3 mb-2">
            <span
              className="text-[52px] font-bold leading-none"
              style={{ color: "var(--color-text-primary)" }}
            >
              ${EVENT_PRICE}
            </span>
            <span
              className="text-[22px] font-semibold leading-none mb-1 line-through"
              style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
            >
              ${REGULAR_PRICE}
            </span>
            <span
              className="text-[15px] mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              one payment · 6 months
            </span>
          </div>
          <p className="text-[13px] mb-6" style={{ color: "var(--color-teal)" }}>
            Event price applied · no recurring charge
          </p>

          {/* CTA button */}
          <button
            onClick={handleCheckout}
            disabled={loading || !shopifyReady}
            className="w-full md:w-auto px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading
              ? "One moment..."
              : !shopifyReady
              ? "Available at the booth"
              : `Subscribe — $${EVENT_PRICE}`}
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
            Ships around the 15th each month · US only · No recurring charges
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
          Junklub Exclusive
        </p>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white leading-tight mb-3">
          Ready to get happy mail?
        </h2>
        <p className="text-[14px] text-white/75 mb-8 max-w-sm mx-auto leading-relaxed">
          Six months. One payment. Your event price is already applied — ${EVENT_PRICE}{" "}
          instead of ${REGULAR_PRICE}.
        </p>

        <button
          onClick={handleCheckout}
          disabled={loading || !shopifyReady}
          className="px-12 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full bg-white transition-all duration-300 disabled:opacity-60 hover:bg-white/90"
          style={{ color: "var(--color-teal)" }}
        >
          {loading
            ? "One moment..."
            : !shopifyReady
            ? "Available at the booth"
            : `Subscribe — $${EVENT_PRICE}`}
        </button>

        <p className="mt-5 text-[12px] text-white/50">
          Ships ~15th each month · US only · No recurring charges
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
            href="mailto:hello@amytangerine.com"
            className="underline hover:opacity-70"
            style={{ color: "var(--color-orange)" }}
          >
            hello@amytangerine.com
          </a>
          {" "}· amytangerine.com
        </p>
      </footer>
    </main>
  )
}
