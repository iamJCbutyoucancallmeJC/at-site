"use client"
// The Join button on a class sales page. One click opens a Shopify checkout
// holding the class product (POST /api/checkout/class), the same direct path
// /gift uses: no cart drawer, nothing else in the order, so the orders-create
// webhook finds exactly one class line item and mints the link.

import { useId, useState } from "react"
import { trackEvent } from "@/lib/analytics"

export default function JoinClassButton({ slug, available, label, notYet, code = "" }: { slug: string; available: boolean; label: string; notYet: string; code?: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const statusId = useId()

  async function join() {
    if (busy || !available) return
    setBusy(true)
    setError("")
    trackEvent("class_join_click", { class: slug })
    try {
      const response = await fetch("/api/checkout/class", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(code ? { slug, code } : { slug }) })
      const result = await response.json()
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Checkout could not open. Please try again.")
      window.location.assign(result.checkoutUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout could not open. Please try again.")
      setBusy(false)
    }
  }

  return (
    <div>
      {!available ? (
        <p id={statusId} className="mb-4 p-4 rounded-lg leading-relaxed" style={{ background: "var(--color-orange-light)" }}>
          {notYet}
        </p>
      ) : null}
      <button
        type="button"
        onClick={join}
        disabled={busy || !available}
        aria-describedby={available ? undefined : statusId}
        className="cta-primary cta-primary--ink w-full md:w-auto md:min-w-[280px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        {busy ? "Opening checkout" : label}
      </button>
      {error ? <p role="alert" className="mt-3 text-red-800">{error}</p> : null}
    </div>
  )
}
