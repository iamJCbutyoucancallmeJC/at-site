"use client"

// /join's body (2026-11-13, t2070). Swaps the page to a "You're in" note once a
// signup succeeds, so the reader who tapped "Yes" in the invite email lands on a
// confirmation, not a form. A failed auto-signup leaves the filled form in place.

import { useState } from "react"
import Link from "next/link"
import NewsletterForm from "@/components/newsletter-form"

export default function JoinClient() {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div role="status">
        <h1 className="text-[28px] md:text-[34px] font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          You&apos;re in!
        </h1>
        <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Thanks for saying yes. My Friday letter will land in your inbox about once a week, and you can
          leave any time. xo, Amy
        </p>
        <Link href="/" className="cta-primary">
          Look around the site
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-[28px] md:text-[34px] font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
        Join the list
      </h1>
      <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
        A note from Amy when she has something to share: what she&apos;s making, new
        Happy Mail, classes, and where she&apos;ll be in person. No schedule, and you can
        leave any time.
      </p>
      <div className="max-w-md mx-auto text-left">
        <NewsletterForm sourcePage="join" prefillFromHash autoSubmitTags={["invite"]} onSuccess={() => setDone(true)} />
      </div>
    </>
  )
}
