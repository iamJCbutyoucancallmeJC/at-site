// /events — "In Person" events landing page (feature f001).
//
// Reframed 2026-06-01 PM (second pass, per JC) to: (1) use Amy's real voice
// (her live events page leads with "Meet Amy in person and learn her Craft a
// Life You Love techniques at one of the events below!"), (2) move the email
// capture UP the page (above the events list), (3) apply the event-page
// business rule, and (4) ship verified events only.
//
// Event-page business rule (see scope-tokyo-takeover-page-2026-06-01.md):
//   - Amy's OWN events get a dedicated at-site page; the card links inward
//     ("Learn more" -> /japan for the Tokyo Takeover).
//   - Events where Amy APPEARS at someone else's event get a description + an
//     external link to the host's site; no dedicated page.
//
// Events are web-verified (2026-06-01). Paper Fest (OC) and "Squeeze the Day
// Retreat" from the old stub did NOT verify (no real OC Paper Fest; "Squeeze
// the Day" is a stamp set, not a retreat) and are intentionally omitted pending
// Amy's confirmation. Craftcation spelling corrected (was "Craftation").
//
// Capture: WaitlistForm -> POST /api/waitlist -> Kajabi opt-in form.
// Copy is a JC starting point for Amy's voice pass.

import Image from "next/image"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "In Person | Amy Tangerine",
  description:
    "Meet Amy in person: craft tours, conferences, and pop-ups. See where Amy will be next and get on the list for future events.",
}

// kind: "amy" = Amy's own event (links inward to a dedicated page)
//       "guest" = Amy appears at someone else's event (links out to the host)
type EventKind = "amy" | "guest"
type EventEntry = {
  label: string
  title: string
  meta: string
  blurb: string
  href: string
  cta: string
  kind: EventKind
}

const EVENTS: EventEntry[] = [
  {
    label: "Craft Tour",
    title: "Tangerine Tokyo Takeover",
    meta: "Tokyo, Japan · Spring 2026 (sold out)",
    blurb:
      "A girlfriends' shopping adventure through Tokyo's best stationery shops and paper stores: six nights in Ginza, washi treasure hunts, and a Mt. Fuji bullet-train day trip. The first one sold out fast.",
    href: "/japan",
    cta: "Learn More",
    kind: "amy",
  },
  {
    label: "Conference",
    title: "Craftcation Conference",
    meta: "Ventura, CA · April 8–12, 2026",
    blurb:
      "Amy teaches and speaks at this annual business and makers conference in the artsy seaside town of Ventura: part creative retreat, part business bootcamp, all community.",
    href: "https://www.craftcationconference.com/",
    cta: "Visit Craftcation",
    kind: "guest",
  },
  {
    label: "Vendor + Speaker",
    title: "Little Craft Fest",
    meta: "Conroe, TX · April 24–26, 2026",
    blurb:
      "Amy teaches and meets crafters at this stationery and paper celebration near Houston, alongside 100+ makers and brands. Her workshops: Lovely Layers, and the YES, I'm a Little Obsessed Traveler's Notebook.",
    href: "https://www.littlecraftfest.com/",
    cta: "Visit Little Craft Fest",
    kind: "guest",
  },
]

const PHOTOS = ["/images/japan/tokyo-02.webp", "/images/japan/tokyo-04.webp", "/images/japan/tokyo-03.webp"]

export default function EventsPage() {
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
          Tours · Conferences · Pop-Ups
        </p>
        <p className="mt-5 text-[15px] md:text-[18px] text-white/90 max-w-xl mx-auto leading-relaxed">
          Come hang out in real life. Meet Amy and learn her <em>Craft a Life You Love</em> techniques
          at one of the events below.
        </p>
      </section>

      {/* ── Capture (moved UP) ── */}
      <section className="px-6 py-10 md:py-14" style={{ background: "var(--color-orange)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[22px] md:text-[30px] font-bold leading-tight text-white mb-2">
            Want to know where Amy will be?
          </h2>
          <p className="text-[14px] md:text-[15px] text-white/90 mb-5 leading-relaxed">
            Drop your email and you&rsquo;ll be the first to hear about new events, pop-ups, and trips,
            including the next Tangerine Tokyo Takeover.
          </p>
          <WaitlistForm sourcePage="at-site:/events" />
        </div>
      </section>

      {/* ── Photos ── */}
      <section className="px-3 md:px-6 pt-8 md:pt-12">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 md:gap-3">
          {PHOTOS.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`Amy Tangerine event ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Events list (below the form) ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-[13px] md:text-[15px] uppercase tracking-[0.18em] font-semibold mb-7 text-center"
          style={{ color: "var(--color-orange)" }}
        >
          Where to Find Amy
        </h2>
        <div className="space-y-8">
          {EVENTS.map((event) => (
            <div key={event.title} className="border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
              <p
                className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: "var(--color-orange)" }}
              >
                {event.label}
              </p>
              <h3
                className="text-[20px] md:text-[26px] font-bold leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                {event.title}
              </h3>
              <p
                className="text-[12px] md:text-[13px] uppercase tracking-[0.08em] mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {event.meta}
              </p>
              <p className="text-[14px] md:text-[15px] leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                {event.blurb}
              </p>
              <TrackableLink
                href={event.href}
                event="event_cta_click"
                eventData={{ event_title: event.title, kind: event.kind, page: "events" }}
                className="inline-block px-5 py-2 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
                style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
                {...(event.kind === "guest" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {event.cta}
              </TrackableLink>
            </div>
          ))}
        </div>
        <p className="text-center text-[14px] md:text-[15px] mt-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          More to come. Get on the list above and you&rsquo;ll know where Amy&rsquo;s headed next.
        </p>
      </section>
    </main>
  )
}
