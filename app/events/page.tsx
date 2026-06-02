// /events — "Where Amy's Been (and Where She's Headed)" landing page (feature f001).
//
// Reframed 2026-06-01 PM (per JC) from a multi-event card list into a single,
// simple landing page: a short recap of past events Amy's appeared at, a
// "stay tuned" line, and one email-capture form for people who want to know
// where Amy will be next or join a future event (e.g. the next Tokyo Takeover).
//
// Capture: WaitlistForm -> POST /api/waitlist -> Kajabi opt-in form, tagged
// events-waitlist / signup-from-at-site-events / interest-future-events /
// interest-future-craft-tours (pre-Klaviyo bridge; see
// scope-tokyo-takeover-page-2026-06-01.md).
//
// Photos: public/images/japan/tokyo-0X.webp (placeholders from the legacy SQS
// Tokyo Workshops post until Amy supplies real photos). See that folder's README.
// All copy below is a JC starting point for Amy's voice pass.

import Image from "next/image"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"

export const metadata = {
  title: "Events | Amy Tangerine",
  description:
    "Where Amy Tangerine has been and where she's headed next: craft tours, conferences, retreats, and pop-ups. Get on the list to hear about future events.",
}

// Past events Amy's appeared at. Light recap list, not a registration system.
const PAST_EVENTS = [
  {
    label: "Craft Tour",
    title: "Tangerine Tokyo Takeover",
    meta: "Tokyo, Japan · March 2026",
    blurb:
      "Twenty crafters, six nights in Ginza, paper shops and a Mt. Fuji bullet-train day trip. The first one sold out fast.",
  },
  {
    label: "Conference",
    title: "Craftation: Business & Makers Conference",
    meta: "Ventura, CA",
    blurb: "Amy teaches and speaks at this annual four-day conference for makers and creative entrepreneurs.",
  },
  {
    label: "Vendor + Speaker",
    title: "Paper Fest",
    meta: "Orange County, CA",
    blurb: "A dedicated paper craft and stationery event. Shop Amy's products and catch her on stage.",
  },
  {
    label: "Retreat",
    title: "Squeeze the Day Retreat",
    meta: "Location TBA",
    blurb: "An immersive, small-group crafting retreat designed by Amy and focused on creative joy.",
  },
]

// A couple of photos for warmth (placeholders until Amy supplies real ones,
// committed under public/images/japan/ — see that folder's README to swap).
const PHOTOS = ["/images/japan/tokyo-02.webp", "/images/japan/tokyo-04.webp", "/images/japan/tokyo-03.webp"]

export default function EventsPage() {
  const photos = PHOTOS

  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="events" />

      {/* ── Header ── */}
      <section className="px-6 py-16 md:py-24 text-center" style={{ background: "var(--color-teal)" }}>
        <h1
          className="text-[38px] md:text-[60px] font-bold tracking-tight text-white leading-[1.05]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Where Amy&rsquo;s Been
        </h1>
        <p className="mt-4 text-[15px] md:text-[18px] text-white/85 max-w-xl mx-auto leading-relaxed">
          From a takeover of Tokyo&rsquo;s best paper shops to conferences, retreats, and pop-ups,
          here are a few of the places Amy has shown up to craft, teach, and connect.
        </p>
      </section>

      {/* ── Photos ── */}
      {photos.length > 0 && (
        <section className="px-3 md:px-6 pt-8 md:pt-12">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 md:gap-3">
            {photos.slice(0, 3).map((src, i) => (
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
      )}

      {/* ── Past events recap list ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <h2
          className="text-[13px] md:text-[15px] uppercase tracking-[0.18em] font-semibold mb-6 text-center"
          style={{ color: "var(--color-orange)" }}
        >
          A Few Past Events
        </h2>
        <div className="space-y-7">
          {PAST_EVENTS.map((event) => (
            <div key={event.title} className="border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
              <p
                className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                style={{ color: "var(--color-orange)" }}
              >
                {event.label}
              </p>
              <h3
                className="text-[19px] md:text-[24px] font-bold leading-tight"
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
              <p className="text-[14px] md:text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {event.blurb}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-[14px] md:text-[15px] mt-10 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          More to come. Stay tuned to this page for where Amy&rsquo;s headed next.
        </p>
      </section>

      {/* ── Capture form ── */}
      <section className="px-6 py-12 md:py-16" style={{ background: "var(--color-orange)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[24px] md:text-[34px] font-bold leading-tight text-white mb-3">
            Want to know where Amy will be?
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/90 mb-6 leading-relaxed">
            Drop your email and we&rsquo;ll let you know about future events, pop-ups, and trips,
            including the next Tokyo Tangerine Takeover. No spam, just the good stuff.
          </p>
          <WaitlistForm sourcePage="at-site:/events" />
        </div>
      </section>
    </main>
  )
}
