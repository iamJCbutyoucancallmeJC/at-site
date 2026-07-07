// /events/[slug] — event detail pages (events redesign, 2026-07-07).
//
// One template, three shapes, all driven by lib/events-content.ts:
//   - upcoming:    facts + "come say hi" copy + tickets/site CTAs + waitlist
//   - coming-soon: short teaser, venue link, waitlist ("Get Notified")
//   - past:        recap page; Amy's video via the click-to-play facade
//                  (components/events/recap-video.tsx), or her channel links
//                  until the recap video is identified
//
// Amy's bespoke event pages (/japan) stay bespoke; only entries with
// detailPage: true materialize here (see the business rule in events-content).
//
// Copy is a JC starting point for Amy's voice pass.

import { notFound } from "next/navigation"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import RecapVideo from "@/components/events/recap-video"
import { detailPageEvents, getEvent } from "@/lib/events-content"

export function generateStaticParams() {
  return detailPageEvents().map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = getEvent(slug)
  if (!event) return {}
  const when = event.status === "past" ? "Recap: " : ""
  return {
    title: `${when}${event.title} · ${event.city} | Amy Tangerine`,
    description: event.blurb,
    openGraph: {
      title: `${event.title} · ${event.city}`,
      description: event.blurb,
    },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = getEvent(slug)
  if (!event) notFound()

  const isPast = event.status === "past"
  const comingSoon = event.status === "coming-soon"
  const sourcePage = `at-site:/events/${event.slug}`

  return (
    <main className="min-h-screen">
      <PageEngagementTracker page={`events/${event.slug}`} />

      {/* ── Hero band ── */}
      <section className="px-6 py-14 md:py-20 text-center" style={{ background: "var(--color-teal)" }}>
        <p className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-semibold text-white/80">
          {event.label}
          {comingSoon && " · Coming Soon"}
          {isPast && " · Recap"}
        </p>
        <h1 className="mt-3 text-[34px] md:text-[56px] font-bold tracking-tight text-white leading-[1.05]">
          {event.title}
        </h1>
        <p className="mt-4 text-[14px] md:text-[16px] uppercase tracking-[0.12em] text-white/90 font-semibold">
          {[event.city, event.venue].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 text-[14px] md:text-[16px] text-white/80">{event.dates}</p>
      </section>

      {/* ── Story ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16 text-center">
        <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {event.blurb}
        </p>

        {/* Upcoming boilerplate: what a visit to Amy's booth is like */}
        {event.status === "upcoming" && (
          <p className="mt-4 text-[15px] md:text-[17px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Stop by to shop Amy&rsquo;s supplies in person, see new goodies before anyone else, and say
            hi. She loves meeting people who make things.
          </p>
        )}

        {/* Fact bullets (booth number, hours) once JC fills them in */}
        {event.details && event.details.length > 0 && (
          <ul className="mt-6 space-y-2 text-[14px] md:text-[15px]" style={{ color: "var(--color-text-primary)" }}>
            {event.details.map((d) => (
              <li key={d} className="font-semibold">
                {d}
              </li>
            ))}
          </ul>
        )}

        {/* CTAs: tickets (primary) + event site (secondary) */}
        {(event.ticketUrl || event.eventUrl) && !isPast && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {event.ticketUrl && (
              <TrackableLink
                href={event.ticketUrl}
                event="event_cta_click"
                eventData={{ event_slug: event.slug, cta: "tickets", source_page: sourcePage }}
                className="inline-block px-7 py-3 text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full text-white transition-all duration-300 hover:opacity-90"
                style={{ background: "var(--color-orange)" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Tickets
              </TrackableLink>
            )}
            {event.eventUrl && (
              <TrackableLink
                href={event.eventUrl}
                event="event_cta_click"
                eventData={{ event_slug: event.slug, cta: "event-site", source_page: sourcePage }}
                className="inline-block px-7 py-3 text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
                style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {comingSoon ? `Visit ${event.venue ?? "the venue"}` : "Event Site"}
              </TrackableLink>
            )}
          </div>
        )}
      </section>

      {/* ── Recap (past events) ── */}
      {isPast && event.recap && (
        <section className="px-6 pb-12 md:pb-16">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-[20px] md:text-[26px] font-bold leading-tight text-center mb-5"
              style={{ color: "var(--color-text-primary)" }}
            >
              How it went
            </h2>
            {event.recap.youtubeId ? (
              <RecapVideo
                youtubeId={event.recap.youtubeId}
                title={event.recap.videoTitle ?? `${event.title} recap`}
                eventSlug={event.slug}
              />
            ) : (
              <p className="text-center text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Amy shared this one on her channels.
              </p>
            )}
            {event.recap.links && event.recap.links.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {event.recap.links.map((link) => (
                  <TrackableLink
                    key={link.href}
                    href={link.href}
                    event="external_link"
                    eventData={{ destination: link.label.toLowerCase(), source_page: sourcePage }}
                    className="inline-block px-6 py-2.5 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
                    style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </TrackableLink>
                ))}
              </div>
            )}
            {event.eventUrl && (
              <p className="text-center text-[13px] md:text-[14px] mt-6" style={{ color: "var(--color-text-secondary)" }}>
                Curious about the event itself?{" "}
                <TrackableLink
                  href={event.eventUrl}
                  event="event_cta_click"
                  eventData={{ event_slug: event.slug, cta: "event-site", source_page: sourcePage }}
                  className="underline underline-offset-2 font-semibold hover:opacity-80"
                  style={{ color: "var(--color-teal)" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit the event site
                </TrackableLink>
                .
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Waitlist ── */}
      <section className="px-6 py-12 md:py-16" style={{ background: "var(--color-orange)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[24px] md:text-[32px] font-bold leading-tight text-white mb-3">
            {comingSoon
              ? "Want the details the moment they land?"
              : isPast
                ? "Wish you'd been there?"
                : "Can't make it this time?"}
          </h2>
          <p className="text-[14px] md:text-[15px] text-white/90 mb-5 leading-relaxed">
            Get on the list and you&rsquo;ll be the first to hear when Amy&rsquo;s headed somewhere
            near you.
          </p>
          <WaitlistForm sourcePage={sourcePage} />
        </div>
      </section>

      {/* ── Back to all events ── */}
      <section className="px-6 py-8 text-center">
        <TrackableLink
          href="/events"
          event="footer_click"
          eventData={{ link_text: "Back to all events", page: `events/${event.slug}` }}
          className="text-[13px] uppercase tracking-[0.1em] font-semibold hover:opacity-70"
          style={{ color: "var(--color-orange)" }}
        >
          ← See all events
        </TrackableLink>
      </section>
    </main>
  )
}
