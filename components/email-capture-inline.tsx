"use client"

// Inline email-capture block (t1092, capture rule D3: inline blog + footer
// blocks). Posts to /api/klaviyo/subscribe; the `source` prop becomes the
// Klaviyo profile's signup_source property (per utm-convention.md in the
// vault). GATED: renders nothing unless NEXT_PUBLIC_CAPTURE_BLOCKS === "1" --
// the advance-then-regate hold for Amy's aesthetic pass. Flip the env var in
// Vercel to go live; no code change. The timed/exit-intent POPUP half of D3 is
// a Klaviyo-native form built in Klaviyo's builder and served by the klaviyo.js
// snippet in app/layout.tsx (gated on NEXT_PUBLIC_KLAVIYO_COMPANY_ID).

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

const ENABLED = process.env.NEXT_PUBLIC_CAPTURE_BLOCKS === "1"

export default function EmailCaptureInline({
  source,
  dark = false,
}: {
  source: string
  dark?: boolean
}) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")

  if (!ENABLED) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === "sending") return
    setState("sending")
    trackEvent("newsletter_signup", { source_page: source })
    try {
      const res = await fetch("/api/klaviyo/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      })
      if (!res.ok) throw new Error()
      setState("done")
    } catch {
      setState("error")
    }
  }

  const text = dark ? "rgba(255,255,255,0.85)" : "var(--color-text-primary)"
  const sub = dark ? "rgba(255,255,255,0.6)" : "var(--color-text-secondary, #555)"

  return (
    <div className="max-w-xl mx-auto px-6 py-10 text-center">
      <h3 className="text-[18px] font-bold mb-1" style={{ color: text }}>
        Letters from Amy
      </h3>
      <p className="text-[13px] mb-5" style={{ color: sub }}>
        What she&apos;s making, right to your inbox.
      </p>
      {state === "done" ? (
        <p className="text-[14px] font-semibold" style={{ color: "var(--color-teal)" }}>
          You&apos;re on the list. Talk soon!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="px-5 py-3 rounded-full border text-[14px] w-full sm:w-[280px]"
            style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="px-7 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {state === "sending" ? "Sending..." : "Sign me up"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="mt-3 text-[13px]" style={{ color: "#c0392b" }}>
          That didn&apos;t go through — mind trying again?
        </p>
      )}
    </div>
  )
}
