"use client"

import { useState } from "react"
import { EnvelopeDoodle } from "@/components/doodles"
import { trackEvent } from '@/lib/analytics'

type Status = "idle" | "submitting" | "success" | "error"

export default function NewsletterFormWarm({ sourcePage = 'homepage' }: { sourcePage?: string }) {
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

  return (
    <div>
      <EnvelopeDoodle className="mb-3" />
      <h4
        className="text-lg md:text-xl font-extrabold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Bring some zest to your inbox
      </h4>
      <p
        className="text-[13px] md:text-sm mb-4 md:mb-5 leading-normal"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Creativity tips, new product drops, and the occasional discount. From Amy, not a robot.
      </p>

      {status === "success" ? (
        <div
          className="px-4 py-3.5 rounded-xl text-sm md:text-[15px] font-medium text-center"
          style={{
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
          }}
          role="status"
        >
          Thanks! Check your inbox.
        </div>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "submitting"}
              className="flex-1 px-3.5 md:px-4 py-3 md:py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none disabled:opacity-60"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-white)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-sans)",
              }}
              placeholder="amy@example.com"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="px-5 md:px-7 py-3 md:py-3.5 rounded-xl text-sm md:text-[15px] font-bold text-white disabled:opacity-60"
              style={{
                background: "var(--color-orange)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {status === "submitting" ? "Joining..." : "Join"}
            </button>
          </div>
          {status === "error" && errorMsg && (
            <p className="text-[12px] md:text-[13px]" style={{ color: "var(--color-text-primary)" }} role="alert">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
