"use client"

// Events waitlist form (feature f001).
// Mirrors components/newsletter-form.tsx but:
//   - POSTs to /api/waitlist (separate Kajabi form + tags) instead of /api/newsletter
//   - adds an optional first-name field
//   - fires the `waitlist_signup` analytics event
//   - shows a confirmation tuned for the "tell me where Amy will be" ask
// The on-submit tagging (events-waitlist, etc.) lives server-side in the route
// so the schema has a single source of truth.

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

type Status = "idle" | "submitting" | "success" | "error"

export default function WaitlistForm({ sourcePage = "at-site:/events" }: { sourcePage?: string }) {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
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
    if (!firstName.trim() || !lastName.trim()) {
      setStatus("error")
      setErrorMsg("Please enter your first and last name")
      return
    }

    setStatus("submitting")
    setErrorMsg("")
    trackEvent("waitlist_signup", { source_page: sourcePage, list: "events-waitlist" })

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          source: sourcePage,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorMsg(data?.error ?? "Signup failed, please try again")
        return
      }
      setStatus("success")
      setEmail("")
      setFirstName("")
      setLastName("")
    } catch {
      setStatus("error")
      setErrorMsg("Network error, please try again")
    }
  }

  if (status === "success") {
    return (
      <div
        className="px-5 py-5 rounded-xl text-center"
        style={{
          background: "var(--color-white)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
        }}
        role="status"
      >
        <p className="text-[16px] md:text-[18px] font-bold mb-1">You&rsquo;re on the list.</p>
        <p className="text-[13px] md:text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
          We&rsquo;ll let you know where Amy&rsquo;s headed next.
        </p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="text"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="given-name"
          className="flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
          }}
          placeholder="First name"
          aria-label="First name"
        />
        <input
          type="text"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="family-name"
          className="flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
          }}
          placeholder="Last name"
          aria-label="Last name"
        />
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="email"
          className="flex-1 px-4 py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
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
          className="px-6 md:px-8 py-3.5 rounded-xl text-sm md:text-[15px] font-bold text-white disabled:opacity-60 whitespace-nowrap"
          style={{
            background: "var(--color-orange)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {status === "submitting" ? "Joining..." : "Get on the List"}
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
