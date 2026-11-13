"use client"

import { useEffect, useState } from "react"
import { trackEvent } from '@/lib/analytics'

type Status = "idle" | "submitting" | "success" | "error"

// The site's one email form (design finish, Phase 1, 2026-10-28): KeepUpCard
// wraps it, and the pages that ARE the form (/join, /creativity) use it bare.
// `sourcePage` becomes the Klaviyo profile's signup_source.
export default function NewsletterForm({
  sourcePage = 'homepage',
  buttonLabel = "Join",
  doneMessage = "You're on the list. Talk soon!",
  prefillFromHash = false,
  autoSubmitTags = [],
  onSuccess,
}: {
  sourcePage?: string
  buttonLabel?: string
  /** Replaces the confirmation line (a lead-magnet page says what arrives). */
  doneMessage?: string
  /**
   * /join only (2026-11-11, t2070): an email's "Yes" button links to
   * /join#email=<address>&src=<tag>. The address rides in the FRAGMENT, which
   * browsers never send to the server, and is stripped from the address bar on
   * load, so it stays out of request logs and analytics. The form arrives
   * filled in: one tap on the button subscribes, no typing. Nothing submits on
   * its own, because mail scanners open links and would otherwise sign people up
   * (except the tags in autoSubmitTags, below).
   */
  prefillFromHash?: boolean
  /**
   * 2026-11-13 (JC, t2070): a link whose src tag is listed here signs the reader
   * up on arrival, no second tap: the click on the email's "Yes" button IS the
   * signup. This reverses the 11/11 "nothing submits on its own" rule for these
   * tags only. Guard against mail scanners: a browser that reports itself as
   * automated (navigator.webdriver) gets the filled form instead. Amy's readers
   * are mostly Gmail, Yahoo and iCloud, which do not open links on their own.
   */
  autoSubmitTags?: string[]
  /** Called once a signup succeeds (auto is true when it happened on arrival). */
  onSuccess?: (info: { auto: boolean }) => void
}) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [prefilled, setPrefilled] = useState(false)
  const [source, setSource] = useState(sourcePage)

  useEffect(() => {
    if (!prefillFromHash || typeof window === "undefined" || !window.location.hash) return
    const params = new URLSearchParams(window.location.hash.slice(1))
    const fromLink = (params.get("email") ?? "").trim()
    const tag = (params.get("src") ?? "").replace(/[^a-z0-9-]/gi, "").slice(0, 24)
    window.history.replaceState(null, "", window.location.pathname + window.location.search)
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromLink)) {
      const src = tag ? `${sourcePage}-${tag}` : sourcePage
      setEmail(fromLink)
      setPrefilled(true)
      setSource(src)
      const automated = typeof navigator !== "undefined" && (navigator as Navigator & { webdriver?: boolean }).webdriver
      if (tag && autoSubmitTags.includes(tag) && !automated) void subscribe(fromLink, src, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillFromHash, sourcePage])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "submitting") return

    const trimmed = email.trim()
    if (!trimmed) {
      setStatus("error")
      setErrorMsg("Please enter your email")
      return
    }
    await subscribe(trimmed, source, false)
  }

  async function subscribe(trimmed: string, src: string, auto: boolean) {
    setStatus("submitting")
    setErrorMsg("")
    trackEvent('newsletter_signup', { source_page: src })

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: src }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMsg(data?.error ?? "Signup failed, please try again")
        return
      }
      setStatus("success")
      setEmail("")
      onSuccess?.({ auto })
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
          {status === "submitting" ? "Joining..." : prefilled ? "Yes, sign me up" : buttonLabel}
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
