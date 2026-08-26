"use client"

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import { HM_PRICE_MONTHLY } from "@/lib/happy-mail-content"

const YT_OFF = 4
const FIRST_MONTH = HM_PRICE_MONTHLY - YT_OFF // 9

function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

export default function YtLandingClient({ videoId }: { videoId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [emailState, setEmailState] = useState<"idle" | "sending" | "done" | "error">("idle")

  async function handleCheckout() {
    setLoading(true)
    setError("")

    trackEvent("hm_subscribe_click", {
      plan: "monthly",
      price: FIRST_MONTH.toString(),
      source: "youtube",
      page: "happy-mail-yt",
    })

    try {
      const res = await fetch("/api/checkout/yt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gaClientId: readGaClientId() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Checkout unavailable")
      }
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || emailState === "sending") return
    setEmailState("sending")
    try {
      const res = await fetch("/api/klaviyo/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "youtube-landing" }),
      })
      if (!res.ok) throw new Error()
      setEmailState("done")
    } catch {
      setEmailState("error")
    }
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* ── Badge ── */}
      <div
        className="py-3 px-4 text-center text-[12px] uppercase tracking-[0.16em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        Seen it on YouTube? Here&apos;s how to get your own.
      </div>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        <div className="w-full md:w-[420px] flex-shrink-0">
          {videoId ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title="Happy Mail on Amy's channel"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/images/products/happy-mail/1.jpg"
                alt="Happy Mail from Amy Tangerine"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
          )}
        </div>

        <div className="flex-1">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Happy Mail · Monthly
          </p>
          <h1
            className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            The envelope you just watched, in your own mailbox.
          </h1>
          <p className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--color-text-primary)" }}>
            Die cuts, the newest sticker sheet, and a note from Amy — made in the
            studio you&apos;ve been watching, mailed to you once a month.
          </p>

          {/* Price block */}
          <div className="mb-1 mt-5">
            <span className="text-[34px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              ${FIRST_MONTH}
            </span>
            <span className="text-[15px] ml-2 line-through" style={{ color: "var(--color-text-secondary, #555)" }}>
              ${HM_PRICE_MONTHLY}
            </span>
            <span className="text-[13px] ml-2" style={{ color: "var(--color-text-secondary, #555)" }}>
              your first month · then ${HM_PRICE_MONTHLY}/mo
            </span>
          </div>
          <p className="text-[13px] font-semibold mb-5" style={{ color: "var(--color-teal)" }}>
            YouTube thank-you applied automatically at checkout
          </p>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 rounded-full text-[14px] font-bold uppercase tracking-[0.1em] text-white transition-opacity disabled:opacity-60"
            style={{ background: "var(--color-orange)" }}
          >
            {loading ? "One moment..." : "Get Happy Mail"}
          </button>
          {error && (
            <p className="mt-3 text-[13px]" style={{ color: "#c0392b" }}>
              {error}
            </p>
          )}

          <p className="mt-4 text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary, #555)" }}>
            Renews monthly at ${HM_PRICE_MONTHLY}; cancel anytime and billing stops.
            Free US shipping. (Already used your YouTube thank-you? The button
            simply works at the regular price.)
          </p>
        </div>
      </section>

      {/* ── Email capture ── */}
      <section
        className="border-t"
        style={{ borderColor: "var(--color-border)", background: "var(--color-cream, #faf6f0)" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-12 text-center">
          <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Not ready for the mailbox yet?
          </h2>
          <p className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary, #555)" }}>
            Leave your email and Amy will send you what she&apos;s making — no
            envelope required.
          </p>
          {emailState === "done" ? (
            <p className="text-[15px] font-semibold" style={{ color: "var(--color-teal)" }}>
              You&apos;re on the list. Talk soon!
            </p>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="px-5 py-3 rounded-full border text-[14px] w-full sm:w-[320px]"
                style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
              />
              <button
                type="submit"
                disabled={emailState === "sending"}
                className="px-8 py-3 rounded-full text-[13px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
                style={{ background: "var(--color-teal)" }}
              >
                {emailState === "sending" ? "Sending..." : "Keep me posted"}
              </button>
            </form>
          )}
          {emailState === "error" && (
            <p className="mt-3 text-[13px]" style={{ color: "#c0392b" }}>
              That didn&apos;t go through — mind trying again?
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
