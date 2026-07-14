"use client"

// /back — re-collection landing for lapsed/cardless Happy Mail monthlies (the
// t766 ghost arc). Reached from 1:1 CS replies and the end-July goodbye send.
//
// Born from the 2026-07-14 "ghost link own-goals" incident: this replaces both
// stored cart links (die ~30 days) and cart permalinks (silently drop the
// selling plan). One evergreen URL; the cart is minted server-side on click
// with the monthly SELLING PLAN attached (/api/checkout/back), so the link can
// never go stale and the purchase is always a real subscription.
//
// Chromeless (lib/chromeless-routes), noindex. The WELCOMEBACK5 $5 first-month
// thank-you applies automatically through July 31 (once per subscriber); after
// that the same page keeps working at the regular price.

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import { HM_PRICE_MONTHLY } from "@/lib/happy-mail-content"

const THANKYOU_OFF = 5
const FIRST_MONTH = HM_PRICE_MONTHLY - THANKYOU_OFF // 8
const THANKYOU_DEADLINE = "July 31"

function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

export default function BackPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckout() {
    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "monthly",
      price: FIRST_MONTH.toString(),
      source: "back",
      page: "back",
    })

    try {
      const res = await fetch("/api/checkout/back", {
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

      {/* ── Badge ── */}
      <div
        className="py-3 px-4 text-center text-[12px] uppercase tracking-[0.16em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        Pick up right where you left off
      </div>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
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

        <div className="flex-1">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Happy Mail · Monthly
          </p>
          <h1
            className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            The mail's about to get happier again.
          </h1>
          <p className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--color-text-primary)" }}>
            Your envelope is ready to start up right where it paused — die cuts,
            the newest sticker sheet, and a note from Amy, once a month.
          </p>
          <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--color-text-primary)" }}>
            One minute, one button, and you're back on the list.
          </p>

          {/* Price block */}
          <div className="mb-1">
            <span className="text-[34px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              ${FIRST_MONTH}
            </span>
            <span className="text-[15px] ml-2 line-through" style={{ color: "var(--color-text-secondary, #555)" }}>
              ${HM_PRICE_MONTHLY}
            </span>
            <span className="text-[13px] ml-2" style={{ color: "var(--color-text-secondary, #555)" }}>
              your first month back · then ${HM_PRICE_MONTHLY}/mo
            </span>
          </div>
          <p className="text-[13px] font-semibold mb-5" style={{ color: "var(--color-teal)" }}>
            $5 thank-you applied automatically through {THANKYOU_DEADLINE}
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 rounded-full text-[14px] font-bold uppercase tracking-[0.1em] text-white transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "One moment..." : "Set up my card"}
          </button>
          {error && (
            <p className="mt-3 text-[13px]" style={{ color: "#c0392b" }}>
              {error}
            </p>
          )}

          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary, #555)" }}>
            Renews monthly; cancel anytime and billing stops. Free US shipping.
            (After {THANKYOU_DEADLINE}, or if you've already used your thank-you,
            this button simply works at the regular ${HM_PRICE_MONTHLY}/mo.)
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center border-t" style={{ borderColor: "var(--color-border)" }}>
        <p className="text-[13px]" style={{ color: "var(--color-text-secondary, #555)" }}>
          Questions? Just reply to any Happy Mail email — or write help@amytangerine.com
        </p>
      </footer>
    </main>
  )
}
