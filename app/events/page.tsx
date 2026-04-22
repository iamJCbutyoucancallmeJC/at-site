// Events page — stub
// Linked from homepage v/events tiles. Full page to be built once Amy
// confirms upcoming schedule, photography, and registration links.

import TrackableLink from "@/components/trackable-link"
import PageEngagementTracker from "@/components/page-engagement-tracker"

const EVENTS = [
  {
    id: "tokyo-takeover",
    label: "Craft Tour",
    title: "Tangerine Tokyo Takeover",
    dates: "Dates TBA",
    location: "Tokyo, Japan",
    description:
      "A once-in-a-lifetime girlfriend's shopping adventure through Tokyo's best stationery shops, paper stores, and craft destinations. Six nights at Solaria Ginza Hotel, private guided bus tours, Tokyo SkyTree, Asakusa, Disneyland Tokyo pass, and a Mt. Fuji day trip by bullet train.",
    cta: "Get on the List",
    href: "https://www.craftydestinations.com/module/class/609003/tangerine-tokyo-takeover",
    external: true,
  },
  {
    id: "craftation",
    label: "Conference",
    title: "Craftation: Business & Makers Conference",
    dates: "Date TBD",
    location: "Ventura, CA",
    description:
      "Amy teaches and speaks at this annual four-day conference in the artsy seaside town of Ventura, Southern California. One of the craft world's premier business and creative events.",
    cta: "Learn More",
    href: "https://craftcation.com",
    external: true,
  },
  {
    id: "paper-fest",
    label: "Vendor + Speaker",
    title: "Paper Fest",
    dates: "Date TBD",
    location: "Orange County, CA",
    description:
      "Amy's first year at Paper Fest — a dedicated paper craft and stationery event in Orange County. Shop her products and catch her on stage.",
    cta: "Learn More",
    href: "#",
    external: false,
  },
  {
    id: "squeeze-the-day",
    label: "Retreat",
    title: "Squeeze the Day Retreat",
    dates: "Date TBD",
    location: "TBA",
    description:
      "An immersive crafting retreat experience designed by Amy. Small group, hands-on, and focused on creative joy.",
    cta: "Stay Tuned",
    href: "#",
    external: false,
  },
]

export default function EventsPage() {
  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="events" />

      {/* ── Header ── */}
      <section
        className="py-16 md:py-24 px-4 text-center"
        style={{ background: "var(--color-teal)" }}
      >
        <h1
          className="text-[36px] md:text-[56px] font-bold tracking-tight text-white leading-tight"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          In Person
        </h1>
        <p className="mt-3 text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-white/70">
          Tours · Workshops · Conferences · Retreats
        </p>
      </section>

      {/* ── Event list ── */}
      <section className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-14 space-y-8">
        {EVENTS.map((event) => (
          <div
            key={event.id}
            className="border-t pt-8"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
              style={{ color: "var(--color-orange)" }}
            >
              {event.label}
            </p>
            <h2
              className="text-[22px] md:text-[30px] font-bold leading-tight mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {event.title}
            </h2>
            <p
              className="text-[12px] md:text-[13px] uppercase tracking-[0.08em] mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {event.dates} &nbsp;·&nbsp; {event.location}
            </p>
            <p
              className="text-[14px] md:text-[15px] leading-relaxed mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {event.description}
            </p>
            {event.href !== "#" && (
              <TrackableLink
                href={event.href}
                event="event_cta_click"
                eventData={{ event_id: event.id, event_title: event.title, page: "events" }}
                className="inline-block px-5 py-2 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
                style={{ borderColor: "var(--color-teal)", color: "var(--color-teal)" }}
                {...(event.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {event.cta}
              </TrackableLink>
            )}
          </div>
        ))}
      </section>

      {/* ── Newsletter nudge ── */}
      <section
        className="py-10 md:py-12 px-4 text-center"
        style={{ background: "var(--color-orange)" }}
      >
        <h2 className="text-[18px] md:text-[22px] font-bold text-white mb-2">
          Want to know when new events are announced?
        </h2>
        <p className="text-[13px] md:text-[14px] text-white/80 mb-5">
          Subscribers hear first.
        </p>
        <TrackableLink
          href="/happy-mail"
          event="hero_cta_click"
          eventData={{ cta_text: "Events page newsletter CTA", destination: "/happy-mail", page: "events" }}
          className="inline-block px-8 py-3 text-[13px] uppercase tracking-[0.15em] font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
        >
          Subscribe to Happy Mail
        </TrackableLink>
      </section>
    </main>
  )
}
