"use client"

import { useState } from "react"
import { trackEvent } from '@/lib/analytics'

type Status = "idle" | "submitting" | "success" | "error"

// The site's one email form (design finish, Phase 1, 2026-10-28): KeepUpCard
// wraps it, and the pages that ARE the form (/join, /creativity) use it bare.
// `sourcePage` becomes the Klaviyo profile's signup_source.
export default function NewsletterForm({
  sourcePage = 'homepage',
  buttonLabel = "Join",
  doneMessage = "You're on the list. Talk soon!",
}: {
  sourcePage?: string
  buttonLabel?: string
  /** Replaces the confirmation line (a lead-magnet page says what arrives). */
  doneMessage?: string
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "submitting") return

    const trimmed = email.trim()
    if (!trimmed) {
      setStatus("error")
      setErrorMsg("Please enter your email")
      return
    }

    setStatus("submitting")
    setErrorMsg("")
    trackEvent('newsletter_signup', { source_page: sourcePage })

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: sourcePage }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMsg(data?.error ?? "Signup failed, please try again")
        return
      }
      setStatus("success")
      setEmail("")
    } catch {
      setStatus("error")
      setErrorMsg("Network error, please try again")
    }
  }

  if (status === "success") {
    return (
      <div
        className="px-4 py-3.5 rounded-lg md:rounded-[10px] text-sm md:text-[15px] font-medium text-center"
        style={{
          background: "var(--color-white)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
        }}
        role="status"
      >
        {doneMessage}
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          className="flex-1 px-3.5 md:px-4 py-3 md:py-3.5 rounded-lg md:rounded-[10px] text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
          }}
          placeholder="Your email"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="cta-primary cta--compact"
        >
          {status === "submitting" ? "Joining..." : buttonLabel}
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-[12px] md:text-[13px]" style={{ color: "var(--color-text-primary)" }} role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
