// /events/[slug]/booth: the booth QR landing (event kit, t1101).
//
// One template for every show, rendered from the `booth` block on the event's
// entry in lib/events-content.ts. Chromeless (lib/chromeless-routes) and
// noindex, like the /paperworld one-off it replaces: reached from the QR on
// Amy's table, not from search, and it should not linger in Google after.
//
// Sections, each driven by config and hidden when the slot is empty:
//   facts (venue, booth number, hours) -> offer (checkout or code) ->
//   workshop links -> what Amy brought -> capture form -> footer.
// The public /events/[slug] page keeps the nav and the story; this page is
// the short version for someone standing at the table.

import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import BoothOffer from "@/components/events/booth-offer"
import BoothCaptureForm from "@/components/events/booth-capture-form"
import { boothEvents, getBoothEvent } from "@/lib/events-content"

export function generateStaticParams() {
  return boothEvents().map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = getBoothEvent(slug)
  if (!event) return {}
  return {
    title: `${event.title} · ${event.city} | Amy Tangerine at the booth`,
    description: event.booth?.offer?.headline ?? event.blurb,
    robots: { index: false, follow: false },
  }
}

export default async function BoothPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = getBoothEvent(slug)
  if (!event || !event.booth) notFound()
  const booth = event.booth
  const ended = event.status === "past"
  const sourcePage = `at-site:/events/${event.slug}/booth`
  const facts = [event.venue, booth.boothNumber ? `Find Amy at ${booth.boothNumber}` : null].filter(Boolean) as string[]

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page={`events/${event.slug}/booth`} />

      {/* Header: logo only, no nav */}
      <header className="flex items-center justify-center py-5 border-b" style={{ borderColor: "var(--color-border)" }}>
        <Image src="/images/amy-tangerine-logo.png" alt="Amy Tangerine" width={140} height={40} className="object-contain" priority />
      </header>

      {/* Event badge */}
      <div
        className="py-3 px-4 text-center text-[12px] uppercase tracking-[0.16em] font-semibold text-white"
        style={{ background: "var(--color-teal)" }}
      >
        {event.title} · {event.city} · {event.dates}
        {!ended && booth.offer ? " · Show Exclusive" : ""}
      </div>

      {/* Facts: where and when to find the table */}
      {(facts.length > 0 || (booth.hours && booth.hours.length > 0)) && (
        <section className="max-w-2xl mx-auto px-6 pt-8 text-center">
          {facts.map((f) => (
            <p key={f} className="text-[14px] md:text-[15px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {f}
            </p>
          ))}
          {booth.hours?.map((h) => (
            <p key={h} className="text-[13px] md:text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
              {h}
            </p>
          ))}
        </section>
      )}

      {/* Offer */}
      {booth.offer && (
        <section className="max-w-4xl mx-auto px-6 md:px-10 pt-10 md:pt-12 pb-10 md:pb-12 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="relative w-full md:w-[340px] flex-shrink-0 aspect-square rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/products/happy-mail/1.jpg"
              alt="Happy Mail from Amy Tangerine"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 340px"
            />
          </div>
          <div className="flex-1 w-full">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>
              {booth.offer.kind === "hm-6month" ? "Happy Mail · 6-Month Subscription" : "Show offer"}
            </p>
            <h1
              className="text-[32px] md:text-[44px] font-bold leading-[1.05] tracking-tight mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              {booth.offer.headline}
            </h1>
            <BoothOffer slug={event.slug} city={event.city} offer={booth.offer} ended={ended} />
          </div>
        </section>
      )}

      {/* Workshops sold by the host */}
      {event.links && event.links.length > 0 && !ended && (
        <section className="px-6 py-10 md:py-12" style={{ background: "var(--color-gray-light)" }}>
          <div className="max-w-2xl mx-auto">
            <h2
              className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Take a class with Amy
            </h2>
            {event.meetAmy && (
              <p className="text-center text-[14px] md:text-[15px] leading-relaxed mb-5" style={{ color: "var(--color-text-secondary)" }}>
                {event.meetAmy}
              </p>
            )}
            <div className="flex flex-col items-stretch gap-3">
              {event.links.map((link) => (
                <TrackableLink
                  key={link.href}
                  href={link.href}
                  event="event_cta_click"
                  eventData={{ event_slug: event.slug, cta: "workshop", source_page: sourcePage }}
                  className="block px-6 py-3 text-[13px] md:text-[14px] font-semibold rounded-full text-white text-center transition-all duration-300 hover:opacity-90"
                  style={{ background: "var(--color-orange)" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </TrackableLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What Amy brought */}
      {booth.bring && booth.bring.length > 0 && (
        <section className="max-w-2xl mx-auto px-6 py-10 md:py-12 text-center">
          <h2
            className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            {ended ? "What was on the table" : "On the table"}
          </h2>
          <ul className="space-y-1.5 text-[14px] md:text-[15px]" style={{ color: "var(--color-text-secondary)" }}>
            {booth.bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="mt-5 text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Everything else lives at{" "}
            <TrackableLink
              href="/shop"
              event="event_cta_click"
              eventData={{ event_slug: event.slug, cta: "booth-shop-link", source_page: sourcePage }}
              className="underline underline-offset-2 font-semibold"
              style={{ color: "var(--color-orange)" }}
            >
              amytangerine.com/shop
            </TrackableLink>
            .
          </p>
        </section>
      )}

      {/* Capture */}
      <section className="px-6 py-12 md:py-14" style={{ background: "var(--color-orange)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[22px] md:text-[30px] font-bold leading-tight text-white mb-2">
            {booth.captureHeading ?? "Stay in touch with Amy."}
          </h2>
          <p className="text-[14px] md:text-[15px] text-white/90 mb-5 leading-relaxed">
            {booth.captureBlurb ?? "Leave your email and Amy will send a note after the show with photos and what is new."}
          </p>
          <BoothCaptureForm slug={event.slug} />
        </div>
      </section>

      {/* Footer: minimal */}
      <footer className="py-6 text-center text-[12px]" style={{ color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)" }}>
        <p>
          Questions?{" "}
          <a href="mailto:help@amytangerine.com" className="underline hover:opacity-70" style={{ color: "var(--color-orange)" }}>
            help@amytangerine.com
          </a>{" "}
          · amytangerine.com
        </p>
      </footer>
    </main>
  )
}
