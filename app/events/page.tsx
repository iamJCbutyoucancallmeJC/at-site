// /events — "In Person" events landing page (feature f001).
//
// Redesigned 2026-07-07 (events redesign + nav restructure) around one job:
// let a visitor recognize when Amy or her products are coming somewhere near
// them. So the page leads with UPCOMING events, cards lead with the CITY, and
// past events point to where Amy documented them (her recaps).
//
// Event data lives in lib/events-content.ts (single source of truth shared
// with the /events/[slug] detail pages). The event-page business rule and its
// evolution are documented there.
//
// Capture: WaitlistForm -> POST /api/waitlist -> Kajabi opt-in form.
// Copy is a JC starting point for Amy's voice pass.

import Image from "next/image"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import { upcomingEvents, pastEvents, eventHref, isExternalHref, type SiteEvent } from "@/lib/events-content"

export const metadata = {
  title: "In Person | Amy Tangerine",
  description:
    "See when Amy and her craft supplies are coming to a city near you: stationery shows, artist showings, and craft tours. Plus recaps from past events.",
}

function EventCard({ event, section }: { event: SiteEvent; section: "upcoming" | "past" }) {
  const external = isExternalHref(event)
  const comingSoon = event.status === "coming-soon"
  const cta = external
    ? `Visit ${event.title}`
    : event.status === "past"
      ? event.recap?.youtubeId
        ? "Watch the Recap"
        : "Learn More"
      : comingSoon
        ? "Get Notified"
        : "See Details"

  return (
    <div
      className="rounded-2xl border p-6 md:p-8"
      style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p
          className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold"
          style={{ color: "var(--color-orange)" }}
        >
          {event.label}
        </p>
        {comingSoon && (
          <span
            className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-bold px-3 py-1 rounded-full text-white"
            style={{ background: "var(--color-teal)" }}
          >
            Coming Soon
          </span>
        )}
      </div>

      {/* City first: the recognition hook */}
      <h3
        className="mt-2 text-[26px] md:text-[34px] font-bold leading-tight tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {event.city}
      </h3>
      <p className="text-[16px] md:text-[19px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
        {event.title}
      </p>
      <p
        className="mt-1 text-[12px] md:text-[13px] uppercase tracking-[0.08em]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {[event.venue, event.dates].filter(Boolean).join(" · ")}
      </p>

      <p className="mt-3 text-[14px] md:text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {event.blurb}
      </p>

      {/* Tokyo card: fold the trip photos in */}
      {event.photos && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {event.photos.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`${event.title} photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 30vw, 200px"
              />
            </div>
          ))}
        </div>
      )}

      <TrackableLink
        href={eventHref(event)}
        event="event_cta_click"
        eventData={{ event_slug: event.slug, status: section, source_page: "at-site:/events" }}
        className="mt-5 inline-block px-5 py-2 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
        style={
          section === "upcoming"
            ? { background: "var(--color-orange)", borderColor: "var(--color-orange)", color: "#fff" }
            : { borderColor: "var(--color-teal)", color: "var(--color-teal)" }
        }
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {cta}
      </TrackableLink>
    </div>
  )
}

export default function EventsPage() {
  const upcoming = upcomingEvents()
  const past = pastEvents()

  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="events" />

      {/* ── Header (Amy's real voice) ── */}
      <section className="px-6 py-14 md:py-20 text-center" style={{ background: "var(--color-teal)" }}>
        <h1
          className="text-[38px] md:text-[60px] font-bold tracking-tight text-white leading-[1.05]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          In Person
        </h1>
        <p className="mt-3 text-[12px] md:text-[14px] uppercase tracking-[0.2em] text-white/70">
          Shows · Showings · Tours
        </p>
        <p className="mt-5 text-[15px] md:text-[18px] text-white/90 max-w-xl mx-auto leading-relaxed">
          Come hang out in real life. See when Amy and her supplies are headed somewhere near you.
        </p>
      </section>

      {/* ── Upcoming ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-[13px] md:text-[15px] uppercase tracking-[0.18em] font-semibold mb-7 text-center"
          style={{ color: "var(--color-orange)" }}
        >
          Coming Up
        </h2>
        <div className="space-y-6">
          {upcoming.map((event) => (
            <EventCard key={event.slug} event={event} section="upcoming" />
          ))}
        </div>
      </section>

      {/* ── Capture ── */}
      <section className="px-6 py-10 md:py-14" style={{ background: "var(--color-orange)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[22px] md:text-[30px] font-bold leading-tight text-white mb-2">
            Want a heads-up when Amy&rsquo;s coming to your city?
          </h2>
          <p className="text-[14px] md:text-[15px] text-white/90 mb-5 leading-relaxed">
            Drop your email and you&rsquo;ll be the first to hear about new shows, pop-ups, and trips,
            including the next Tangerine Tokyo Takeover.
          </p>
          <WaitlistForm sourcePage="at-site:/events" />
        </div>
      </section>

      {/* ── Past ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-[13px] md:text-[15px] uppercase tracking-[0.18em] font-semibold mb-7 text-center"
          style={{ color: "var(--color-teal)" }}
        >
          Where Amy&rsquo;s Been
        </h2>
        <div className="space-y-6">
          {past.map((event) => (
            <EventCard key={event.slug} event={event} section="past" />
          ))}
        </div>
        <p className="text-center text-[14px] md:text-[15px] mt-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          More to come. Get on the list above and you&rsquo;ll know where Amy&rsquo;s headed next.
        </p>
      </section>
    </main>
  )
}
