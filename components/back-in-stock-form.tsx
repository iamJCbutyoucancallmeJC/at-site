"use client"

// "Email me when it's back" under the Sold Out pill on the PDP (t1093).
// Posts to /api/klaviyo/back-in-stock, which registers the shopper with
// Klaviyo's back-in-stock service for this variant; Klaviyo's flow RMPUzd
// sends one email when the item is restocked.

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

export default function BackInStockForm({
  variantId,
  productHandle,
}: {
  variantId: string
  productHandle: string
}) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === "sending") return
    setState("sending")
    trackEvent("back_in_stock_signup", { product_handle: productHandle })
    try {
      const res = await fetch("/api/klaviyo/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, variantId }),
      })
      if (!res.ok) throw new Error()
      setState("done")
    } catch {
      setState("error")
    }
  }

  if (state === "done") {
    return (
      <p className="mt-3 text-[13px] text-center font-semibold" style={{ color: "var(--color-teal)" }}>
        Got it. We&apos;ll email you when it&apos;s back.
      </p>
    )
  }

  return (
    <div className="mt-3">
      <p className="text-[13px] mb-2 text-center" style={{ color: "var(--color-text-secondary)" }}>
        Want to know when it&apos;s back? We&apos;ll send one email.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1 min-w-0 px-5 py-3 rounded-full border text-[14px]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="px-6 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
          style={{ background: "var(--color-orange)" }}
        >
          {state === "sending" ? "Sending..." : "Email me"}
        </button>
      </form>
      {state === "error" && (
        <p className="mt-2 text-[13px] text-center" style={{ color: "#c0392b" }}>
          That didn&apos;t go through. Mind trying again?
        </p>
      )}
    </div>
  )
}
