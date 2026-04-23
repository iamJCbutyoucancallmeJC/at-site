"use client"

// Houston conference landing page — Happy Mail 6-Month subscription only.
// - No nav, no footer, no cart drawer (isolated layout)
// - "Only available for attendees" framing
// - Direct-to-checkout: creates a Shopify cart + redirects immediately
// - Falls back gracefully if Shopify isn't live yet

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"

// Swap this for the real Shopify GID once the 6-month product is imported.
// Format: "gid://shopify/ProductVariant/XXXXXXXXXXX"
// Until then, the button shows a "not quite ready" state.
const HM6_VARIANT_GID = process.env.NEXT_PUBLIC_HM6_VARIANT_GID ?? ""

const WHAT_INSIDE = [
  {
    title: "Your name, hand-lettered by Amy",
    body: "The envelope arrives addressed in Amy's handwriting. Not printed. Actually hand-lettered.",
    img: "/images/products/happy-mail/2.jpg",
  },
  {
    title: "Die cuts Amy designed, made in the USA",
    body: "New designs every month. Exclusively for subscribers — not available in the shop.",
    img: "/images/houston/die-cuts.jpg",
  },
  {
    title: "First look at the newest sticker sheet",
    body: "Subscribers get it before anyone else.",
    img: "/images/houston/sticker-sheet.jpg",
  },
  {
    title: "A note from Amy",
    body: "What she's making, what she's loving, what's on her mind. Personal. Not a newsletter.",
    img: "/images/products/happy-mail/3.jpg",
  },
]

const TESTIMONIALS = [
  {
    quote: "I literally squealed when it arrived. The hand-lettering detail is unreal.",
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

export default function HoustonPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const shopifyReady = !!HM6_VARIANT_GID

  async function handleCheckout() {
    if (!shopifyReady) return

    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "6-month",
      price: "72.00",
      source: "houston-conference",
      page: "houston",
    })

    try {
      // Create a cart with the 6-month variant, then redirect to Shopify checkout
      const res = await fetch("/api/checkout/houston", {
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

      {/* ── Conference badge ── */}
      <div
        className="py-3 text-center text-[12px] uppercase tracking-[0.18em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        Conference Exclusive — Not available on amytangerine.com
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
            note. Your name, hand-lettered on the envelope. The good kind of mail.
          </p>
          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            This 6-month option isn't available on the website. It's only here,
            for you, today.
          </p>

          {/* Price */}
          <div className="flex items-end gap-2 mb-2">
            <span
              className="text-[52px] font-bold leading-none"
              style={{ color: "var(--color-text-primary)" }}
            >
              $72
            </span>
            <span
              className="text-[15px] mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              one payment · 6 months
            </span>
          </div>
          <p className="text-[13px] mb-6" style={{ color: "var(--color-teal)" }}>
            Saves $6 vs. monthly · no recurring charge
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
              : "Subscribe — $72"}
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
          Conference Exclusive
        </p>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white leading-tight mb-3">
          Ready to get happy mail?
        </h2>
        <p className="text-[14px] text-white/75 mb-8 max-w-sm mx-auto leading-relaxed">
          Six months. One payment. The 6-month plan isn't available
          online — just here, for you, today.
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
            : "Subscribe — $72"}
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
