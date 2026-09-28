// /creativity -- the printable-for-your-email page (2026-09-21, from Amy's
// "Free printable to offer" note). The link that lives in the description and
// pinned comment of the Sept 5 video "The Secret to Feeling Creative Again |
// 10 Ways to Reconnect" (XcSINuJKdPg): the sheet from the video is free when
// you join the newsletter. The PDF is NOT linked from this page or anywhere
// public; the Klaviyo welcome flow's first letter delivers it, once. The file
// itself is served from /downloads/ so the email link never goes stale.
//
// The page has to read the same for someone who just watched the video and
// for someone who never has (JC 9/21: "this video" meant nothing to a cold
// signup). So the video is embedded and named, and the copy explains the list
// before it offers the sheet.
//
// signup_source = youtube-creativity, so these signups read apart in GA4
// (newsletter_signup, source_page) and in Klaviyo (the welcome flow's split).
// Same chrome as /join; the footer skips its own capture block here.
//
// Subscribers (2026-09-28): the 9/25 newsletter linked here, and a subscriber who
// filled the form got "check your inbox" and then nothing, because the welcome
// flow only fires for people new to the list. Every link in a Klaviyo email
// carries utm_source=klaviyo, so an arrival from email is already on the list:
// they get the sheet to print or download instead of the form. YouTube and cold
// visitors still see the form, so the page stays the one door for non-subscribers.

import type { Metadata } from "next"
import Image from "next/image"
import EmailCaptureInline from "@/components/email-capture-inline"

const VIDEO_ID = "XcSINuJKdPg"
const VIDEO_TITLE = "The Secret to Feeling Creative Again | 10 Ways to Reconnect"
const PDF_URL = "/downloads/amy-tangerine-10-ways-to-reconnect-with-your-creativity.pdf"

export const metadata: Metadata = {
  title: "10 Ways to Reconnect With Your Creativity, the printable | Amy Tangerine",
  description:
    "Ten ways Amy gets back to making when she has drifted from it, hand-lettered as a printable for your desk. Free when you join her newsletter.",
}

export default async function CreativityPrintablePage({
  searchParams,
}: {
  searchParams: Promise<{ utm_source?: string }>
}) {
  const sp = await searchParams
  const fromNewsletter = sp.utm_source === "klaviyo"

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-10 pt-12 md:pt-16 pb-24">
      <section className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
          style={{ color: "var(--color-orange)" }}
        >
          A free printable
        </p>
        <h1
          className="text-[30px] md:text-[40px] font-bold leading-[1.1] tracking-tight mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          10 ways to reconnect with your creativity
        </h1>
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          When I drift away from making stuff, these are the ten things that bring me
          back. I talk through all of them in the video below, and I hand-lettered the
          list so it can live on your desk.{" "}
          {fromNewsletter
            ? "Thanks for being on my list: the sheet is yours, just below."
            : "The sheet is free when you join my newsletter."}
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
        <div className="w-full md:flex-1">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
              title={VIDEO_TITLE}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <p className="mt-3 text-[13px]" style={{ color: "var(--color-text-secondary, #555)" }}>
            {VIDEO_TITLE}, on{" "}
            <a
              href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "var(--color-text-primary)" }}
            >
              my YouTube channel
            </a>
            .
          </p>
        </div>

        <div className="w-full max-w-[300px] mx-auto md:mx-0 md:w-[300px] flex-shrink-0">
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
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
          <p className="mt-3 text-[13px] text-center" style={{ color: "var(--color-text-secondary, #555)" }}>
            The printable, letter size.
          </p>
        </div>
      </div>

      {fromNewsletter ? (
        <section
          className="mt-12 md:mt-16 rounded-2xl px-6 py-10 text-center"
          style={{ background: "var(--color-cream, #faf6f0)" }}
        >
          <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Here&apos;s your printable
          </h2>
          <p className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary, #555)" }}>
            Open the sheet and print it from your browser, or save the PDF for later.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener"
              className="px-7 py-3 rounded-full text-[12px] font-bold uppercase tracking-[0.1em] text-white"
              style={{ background: "var(--color-orange)" }}
            >
              Open and print
            </a>
            <a
              href={PDF_URL}
              download
              className="px-7 py-3 rounded-full border text-[12px] font-bold uppercase tracking-[0.1em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Download the PDF
            </a>
          </div>
        </section>
      ) : (
        <section
          className="mt-12 md:mt-16 rounded-2xl px-6 py-10 text-center"
          style={{ background: "var(--color-cream, #faf6f0)" }}
        >
          <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Get the printable
          </h2>
          <p className="text-[14px] mb-6" style={{ color: "var(--color-text-secondary, #555)" }}>
            Join my newsletter and the sheet lands in your inbox a few minutes later. After
            that, a note from me when I have something to share: no schedule, and you can
            leave any time.
          </p>
          <EmailCaptureInline
            source="youtube-creativity"
            force
            compact
            buttonLabel="Send me the printable"
            doneMessage="You're in. Check your inbox in a few minutes for the printable."
          />
        </section>
      )}
    </main>
  )
}
