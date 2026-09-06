// /join -- the on-site subscribe page (t1313 route B, built with t1092).
//
// Destination for the "join my list" link in Amy's emails, replacing Klaviyo's
// bare hosted subscribe page (manage.kmail-lists.com, white card, no logo).
// Keeps the site chrome so joining happens on amytangerine.com, tracked in
// GA4 like every other signup (newsletter_signup, source_page = join).
//
// Unlisted until Amy's aesthetic pass (t1092 regate): noindex here, absent
// from app/sitemap.ts and the nav, and NOT added to robots.ts (a Disallow
// line would publish the path). The form renders regardless of the
// NEXT_PUBLIC_CAPTURE_BLOCKS gate (force) because nothing links here yet, and
// this page is where Amy sees the real thing on the real domain. The footer
// skips its own capture block on this path.

import type { Metadata } from "next"
import EmailCaptureInline from "@/components/email-capture-inline"

export const metadata: Metadata = {
  title: "Join the list | Amy Tangerine",
  description: "A note from Amy when she has something to share.",
  robots: { index: false, follow: false },
}

export default function JoinPage() {
  return (
    <main className="max-w-xl mx-auto px-6 pt-16 pb-24 text-center">
      <h1 className="text-[28px] md:text-[34px] font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
        Join the list
      </h1>
      <p className="text-[15px] leading-relaxed mb-8" style={{ color: "var(--color-text-secondary)" }}>
        A note from Amy when she has something to share: what she&apos;s making, new
        Happy Mail, classes, and where she&apos;ll be in person. No schedule, and you can
        leave any time.
      </p>
      <EmailCaptureInline source="join" force compact />
    </main>
  )
}
