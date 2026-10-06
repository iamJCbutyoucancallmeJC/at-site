"use client"

// October 2026 cap (t1702): the waitlist that replaces the Happy Mail buy buttons
// while hmIsClosed(). Posts to /api/klaviyo/hm-waitlist, which does NOT fail open
// (a waitlist signup nobody recorded is a promise nobody keeps). Runbook:
// Happy Mail/october-cap-runbook-2026-10-05.md.

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"
import { HM_CLOSED_HEADLINE, HM_CLOSED_BODY } from "@/lib/happy-mail-content"

export default function HmWaitlistForm({ page, compact = false }: { page: string; compact?: boolean }) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === "sending") return
    setState("sending")
    try {
      const res = await fetch("/api/klaviyo/hm-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, page }),
      })
      if (!res.ok) throw new Error()
      trackEvent("waitlist_signup", { source: "hm-waitlist-oct-2026", page })
      setState("done")
    } catch {
      setState("error")
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 ${compact ? "p-5" : "p-6 md:p-8"} text-center`}
      style={{ background: "var(--color-white)", borderColor: "var(--color-orange)" }}
    >
      <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-orange)" }}>
        Waitlist
      </p>
      <h3 className={`${compact ? "text-[20px]" : "text-[22px] md:text-[26px]"} font-bold leading-tight mb-2`} style={{ color: "var(--color-text-primary)" }}>
        {HM_CLOSED_HEADLINE}
      </h3>
      <p className="text-[14px] leading-relaxed mb-5 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
        {HM_CLOSED_BODY}
      </p>
      {state === "done" ? (
        <p className="text-[15px] font-semibold" style={{ color: "var(--color-teal)" }}>
          Your spot is saved. We&apos;ll email you on October 16.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="px-5 py-3 rounded-full border text-[14px] w-full sm:w-[280px]"
            style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60 cursor-pointer"
            style={{ background: "var(--color-orange)" }}
          >
            {state === "sending" ? "Saving..." : "Save my spot"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="mt-3 text-[13px]" style={{ color: "#c0392b" }}>
          That didn&apos;t go through. Please try again.
        </p>
      )}
      <p className="mt-4 text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
        We&apos;ll email you when Happy Mail reopens. Unsubscribe anytime.
      </p>
    </div>
  )
}
