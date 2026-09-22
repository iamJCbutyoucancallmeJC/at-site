// /creativity -- the printable-for-your-email page (2026-09-21, from Amy's
// "Free printable to offer" note). The link that lives in the description and
// pinned comment of the Sept 5 video "The Secret to Feeling Creative Again /
// 10 Ways to Reconnect" (XcSINuJKdPg): the sheet from the video is free when
// you join the newsletter. The PDF is NOT linked from this page or anywhere
// public; the Klaviyo welcome flow's first letter delivers it, once. The file
// itself is served from /downloads/ so the email link never goes stale.
//
// signup_source = youtube-creativity, so these signups read apart in GA4
// (newsletter_signup, source_page) and in Klaviyo (the welcome flow's split).
// Same chrome as /join; the footer skips its own capture block here.

import type { Metadata } from "next"
import Image from "next/image"
import EmailCaptureInline from "@/components/email-capture-inline"

export const metadata: Metadata = {
  title: "10 Ways to Reconnect With Your Creativity, the printable | Amy Tangerine",
  description:
    "The hand-lettered list from Amy's video, as a printable for your desk. Free when you join her newsletter.",
}

export default function CreativityPrintablePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-24">
      <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-center">
        <div className="w-full max-w-[340px] md:w-[360px] flex-shrink-0">
          <div
            className="relative w-full overflow-hidden rounded-lg shadow-xl"
            style={{ aspectRatio: "1105 / 1430", background: "var(--color-white)" }}
          >
            <Image
              src="/images/printables/10-ways-to-reconnect-preview.jpg"
              alt="How to reconnect with your creativity: Amy's hand-lettered list of ten ways, as a printable sheet"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            From the video
          </p>
          <h1
            className="text-[30px] md:text-[40px] font-bold leading-[1.1] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            The 10 ways, as a printable for your desk.
          </h1>
          <p className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--color-text-primary)" }}>
            The list from the video, hand-lettered, ready to print. It&apos;s free
            when you join my newsletter: a note from me when I have something to
            share, no schedule, and you can leave any time.
          </p>
          <p className="text-[14px] leading-relaxed mb-7" style={{ color: "var(--color-text-secondary, #555)" }}>
            The printable lands in your inbox a few minutes after you sign up.
          </p>
          <EmailCaptureInline
            source="youtube-creativity"
            force
            compact
            buttonLabel="Send me the printable"
            doneMessage="You're in. Check your inbox in a few minutes for the printable."
          />
        </div>
      </div>
    </main>
  )
}
