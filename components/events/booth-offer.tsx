"use client"

// Booth offer block for /events/<slug>/booth (event kit, t1101). Ported from
// the Paper World one-off: the Happy Mail 6-month show price with the event
// code auto-applied at checkout (kind "hm-6month"), or, for a shop-wide code
// (kind "shop"), the code itself with a link into the shop.
// The checkout POST goes to /api/checkout/event with the event slug; the
// route 409s until the code is ACTIVE in Shopify, and the button says so.

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"
import { useHmClosed } from "@/components/hm-closed"
import { HM_PRICE_6MONTH } from "@/lib/happy-mail-content"
import type { BoothOffer as BoothOfferConfig } from "@/lib/events-content"

function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

type Props = {
  slug: string
  city: string
  offer: BoothOfferConfig
  ended: boolean // event is past: the code has expired, show the page without a buy button
}

export default function BoothOffer({ slug, city, offer, ended }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const closed = useHmClosed()
  const page = `events/${slug}/booth`
  const eventPrice = HM_PRICE_6MONTH - offer.amountOff

  async function handleCheckout() {
    setLoading(true)
    setError("")
    trackEvent("hm_subscribe_click", { plan: "6-month", price: eventPrice.toString(), source: slug, page })
    try {
      const res = await fetch("/api/checkout/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, gaClientId: readGaClientId() }),
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

  if (ended) {
    return (
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        This show&rsquo;s offer has ended. Happy Mail is always open at{" "}
        <a href="/happy-mail" className="underline" style={{ color: "var(--color-orange)" }}>
          amytangerine.com/happy-mail
        </a>
        .
      </p>
    )
  }

  if (offer.kind === "shop") {
    return (
      <div>
        <p className="text-[14px] leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
          {offer.terms}
        </p>
        <p className="text-[13px] uppercase tracking-[0.16em] font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
          Your code at checkout
        </p>
        <p className="text-[34px] font-bold tracking-wide mb-5" style={{ color: "var(--color-teal)" }}>
          {offer.code}
        </p>
        <a
          href="/shop"
          onClick={() => trackEvent("event_cta_click", { event_slug: slug, cta: "booth-shop", source_page: `at-site:/${page}` })}
          className="inline-block w-full md:w-auto text-center px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white"
          style={{ background: "var(--color-orange)" }}
        >
          Shop with the code
        </a>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Scanned the code at the table? This {city} show price is just for you, today.
      </p>

      <div className="flex items-end gap-3 mb-1">
        <span className="text-[52px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>
          ${eventPrice}
        </span>
        <span className="flex flex-col leading-tight mb-1">
          <span className="text-[18px] line-through" style={{ color: "var(--color-text-secondary)" }}>
            ${HM_PRICE_6MONTH}
          </span>
          <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            one payment · 6 months
          </span>
        </span>
      </div>
      <p className="text-[13px] font-semibold mb-6" style={{ color: "var(--color-teal)" }}>
        ${offer.amountOff} off at the show · code {offer.code} applied automatically
      </p>

      {closed === null ? (
        <div aria-hidden style={{ minHeight: 56 }} />
      ) : closed ? (
        <p className="text-[14px] font-semibold" style={{ color: "var(--color-orange)" }}>
          Happy Mail is full this month.{" "}
          <a href="/happy-mail" className="underline">
            Join the waitlist
          </a>
        </p>
      ) : (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full md:w-auto px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 disabled:opacity-60"
          style={{ background: "var(--color-orange)" }}
        >
          {loading ? "One moment..." : `Subscribe for $${eventPrice}`}
        </button>
      )}

      {error && (
        <p className="mt-3 text-[12px]" style={{ color: "#c0392b" }} role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {offer.terms}
      </p>
      <p className="mt-2 text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
        Ships around the 15th each month · Auto-renews every 6 months, cancel anytime
      </p>
    </div>
  )
}
