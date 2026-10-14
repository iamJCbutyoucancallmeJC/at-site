"use client"

// Booth capture form for /events/<slug>/booth (event kit, t1101). A walk-up
// who is not buying leaves a first name and an email; the route stamps the
// event on the Klaviyo profile and subscribes it with consent. Mirrors
// components/newsletter-form.tsx in shape; the honeypot field is the only
// bot defense a QR landing needs.

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

type Status = "idle" | "submitting" | "success" | "error"

export default function BoothCaptureForm({ slug }: { slug: string }) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [website, setWebsite] = useState("") // honeypot
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const sourcePage = `at-site:/events/${slug}/booth`

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
    try {
      const res = await fetch("/api/events/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: trimmed, firstName: firstName.trim(), website }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMsg(data?.error ?? "Signup failed, please try again")
        return
      }
      trackEvent("event_booth_signup", { event_slug: slug, source_page: sourcePage })
      setStatus("success")
      setEmail("")
      setFirstName("")
    } catch {
      setStatus("error")
      setErrorMsg("Network error, please try again")
    }
  }

  const inputStyle = {
    borderColor: "var(--color-border)",
    background: "var(--color-white)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-sans)",
  }

  if (status === "success") {
    return (
      <div
        className="px-5 py-5 rounded-xl text-center"
        style={{ background: "var(--color-white)", color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
        role="status"
      >
        <p className="text-[16px] md:text-[18px] font-bold mb-1">Thanks, you&rsquo;re in.</p>
        <p className="text-[13px] md:text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
          Amy will write after the show.
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="given-name"
          className="flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
          style={inputStyle}
          placeholder="First name"
          aria-label="First name"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="email"
          inputMode="email"
          className="flex-[2] min-w-0 px-4 py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
          style={inputStyle}
          placeholder="Your email"
          aria-label="Email address"
        />
      </div>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="px-6 md:px-8 py-3.5 rounded-xl text-sm md:text-[15px] font-bold text-white disabled:opacity-60 whitespace-nowrap"
        style={{ background: "var(--color-teal)", fontFamily: "var(--font-sans)" }}
      >
        {status === "submitting" ? "One moment..." : "Keep in touch"}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-[12px] md:text-[13px]" style={{ color: "#c0392b" }} role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
