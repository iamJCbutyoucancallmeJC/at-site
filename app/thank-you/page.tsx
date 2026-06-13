"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import TrackableLink from "@/components/trackable-link"
import { trackEvent } from "@/lib/analytics"
import { useCart } from "@/context/cart"
import PageEngagementTracker from "@/components/page-engagement-tracker"

function ThankYouContent() {
  const params = useSearchParams()
  const source = params.get("source") ?? "unknown"
  const channel = params.get("channel") ?? "online"
  const cartId = params.get("cart_id")
  const { clearCart } = useCart()

  useEffect(() => {
    // Tags every buyer with source + channel.
    // Houston in-person buyers arrive with ?source=houston&channel=in-person
    trackEvent("purchase_complete", { source, channel })

    // Clear the local cart if this looks like a real checkout completion.
    // Two-factor check: (a) cart_id must be present in URL (set by our
    // /api/checkout/cart return_to), AND (b) it must match the token we
    // stashed in localStorage when initiating checkout. This prevents a
    // direct nav to /thank-you?cart_id=foo from accidentally clearing
    // someone else's cart. See t621 (Heidi 2026-05-24).
    if (cartId) {
      try {
        const stashedToken = localStorage.getItem("at-cart-pending-token")
        if (stashedToken && stashedToken === cartId) {
          clearCart()
          localStorage.removeItem("at-cart-pending-token")
        }
      } catch {
        // ignore
      }
    }
  }, [source, channel, cartId, clearCart])

  const isHouston = source === "houston"
  const isEvent = isHouston || source === "girls-trip"

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center py-24">
      <p
        className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
        style={{ color: "var(--color-orange)" }}
      >
        Order Confirmed
      </p>

      <h1
        className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        You&rsquo;re getting
        <br />
        happy mail.
      </h1>

      <p
        className="text-[16px] md:text-[18px] leading-relaxed mb-4 max-w-md"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {isEvent
          ? "So glad you stopped by! Your first envelope is on its way. Check your email for a confirmation."
          : "Thank you for your order! Amy is packing your envelope with love. Check your email for a confirmation."}
      </p>

      <p
        className="text-[14px] mb-10 max-w-sm leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Questions? Reach out at{" "}
        <a
          href="mailto:hello@amytangerine.com"
          className="underline underline-offset-2 hover:opacity-70"
          style={{ color: "var(--color-orange)" }}
        >
          hello@amytangerine.com
        </a>
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <TrackableLink
          href="/shop"
          event="thank_you_cta_click"
          eventData={{ label: "Keep Shopping", source }}
          className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:opacity-80"
          style={{ background: "var(--color-orange)" }}
        >
          Keep Shopping
        </TrackableLink>
        <TrackableLink
          href="/"
          event="thank_you_cta_click"
          eventData={{ label: "Back to Home", source }}
          className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
          style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
        >
          Back to Home
        </TrackableLink>
      </div>
    </main>
  )
}

export default function ThankYouPage() {
  return (
    <>
      <PageEngagementTracker page="thank-you" />
      <Suspense fallback={null}>
        <ThankYouContent />
      </Suspense>
    </>
  )
}
