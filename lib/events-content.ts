// Events content model (events redesign, 2026-07-07).
//
// Single source of truth for every event the site knows about. The /events
// index and the /events/[slug] detail pages both render from this list, so
// adding an event = adding an entry here (plus a photo/video if there is one).
//
// Business rule (evolved from scope-tokyo-takeover-page-2026-06-01.md):
//   - Amy's own events keep their bespoke pages (internalHref, e.g. /japan).
//   - Events where Amy shows up with a booth/appearance get a detail page
//     under /events/<slug> when there's something to say (upcoming details,
//     or a recap she documented on her channels).
//   - Guest appearances with nothing beyond a description still link out to
//     the host's site only (detailPage: false).
//
// Facts verified 2026-07-07 (event sites + web). Open slots JC fills during
// review: Stationery Fest booth/days, Anaheim recap video, Village Well date.

export type SiteEvent = {
  slug: string
  status: "upcoming" | "coming-soon" | "past"
  title: string
  label: string // "Stationery Expo", "Craft Tour", ... shown as the card chip
  city: string // the recognition hook: shown big so locals spot their town
  venue?: string
  dates: string // display string
  sortDate: string // ISO date used only for ordering
  blurb: string
  detailPage: boolean // true = /events/<slug> exists for this entry
  internalHref?: string // bespoke page override (Tokyo -> /japan)
  eventUrl?: string // the event's own site
  ticketUrl?: string
  details?: string[] // fact bullets (booth number, hours) -- JC fills in
  recap?: {
    youtubeId?: string // Amy's recap video (click-to-play embed)
    videoTitle?: string
    links?: { label: string; href: string }[] // other places Amy documented it
  }
  photos?: string[] // local /public images shown on the index card
}

export const EVENTS: SiteEvent[] = [
  // ── Upcoming ──
  {
    slug: "stationery-fest",
    status: "upcoming",
    title: "Stationery Fest 2026",
    label: "Stationery Festival",
    city: "Brooklyn, NY",
    venue: "Industry City",
    dates: "July 30 – August 1, 2026",
    sortDate: "2026-07-30",
    blurb:
      "Three days, 200+ stationery brands, and thousands of paper people in one place. Amy will be there. Come say hi, see what she's been making, and craft a little something together.",
    detailPage: true,
    eventUrl: "https://stationeryfestival.com/",
    ticketUrl: "https://stationeryfestival.com/ticket",
    // Booth number + which days Amy is there: JC drops in during review.
    details: [],
  },
  {
    slug: "village-well",
    status: "coming-soon",
    title: "Artist Showing at Village Well",
    label: "Artist Showing",
    city: "Culver City, CA",
    venue: "Village Well Books & Coffee",
    dates: "Details coming soon",
    sortDate: "2026-12-31",
    blurb:
      "Amy's work is coming to the coziest bookstore-café on the west side. Dates and details soon. Get on the list and you'll hear first.",
    detailPage: true,
    eventUrl: "https://villagewell.com/",
  },

  // ── Past ──
  {
    slug: "paper-world-seattle",
    status: "past",
    title: "Paper World Stationery Expo",
    label: "Stationery Expo",
    city: "Seattle, WA",
    venue: "DoubleTree by Hilton Seattle Airport",
    dates: "June 27, 2026",
    sortDate: "2026-06-27",
    blurb:
      "Amy set up shop alongside 50+ stationery vendors at Paper World's Seattle edition: planners, stickers, journals, and a whole lot of happy mail.",
    detailPage: true,
    eventUrl: "https://www.paperworldstationeryexpo.com/",
    recap: {
      youtubeId: "v4HbwY-OAuc",
      videoTitle: "Paper World Stationery Expo Seattle Vlog",
    },
  },
  {
    slug: "paper-world-anaheim",
    status: "past",
    title: "Paper World Stationery Expo",
    label: "Stationery Expo",
    city: "Anaheim, CA",
    venue: "Hilton Anaheim",
    dates: "April 4, 2026",
    sortDate: "2026-04-04",
    blurb:
      "Paper World's very first expo, and Amy was there for it: a sold-out Saturday of stationery vendors, crafty friends, and good finds.",
    detailPage: true,
    eventUrl: "https://www.paperworldstationeryexpo.com/",
    // Amy's Anaheim recap video/post: slot for JC. Until then the page points
    // to her channels.
    recap: {
      links: [
        { label: "Amy on YouTube", href: "https://youtube.com/@amytangerine" },
        { label: "Amy on Instagram", href: "https://instagram.com/amytangerine" },
      ],
    },
  },
  {
    slug: "tokyo-takeover",
    status: "past",
    title: "Tangerine Tokyo Takeover",
    label: "Craft Tour",
    city: "Tokyo, Japan",
    dates: "Spring 2026 (sold out)",
    sortDate: "2026-03-30",
    blurb:
      "A girlfriends' shopping adventure through Tokyo's best stationery shops and paper stores: six nights in Ginza, washi treasure hunts, and a Mt. Fuji bullet-train day trip. The first one sold out fast.",
    detailPage: false,
    internalHref: "/japan",
    photos: ["/images/japan/tokyo-01.webp", "/images/japan/tokyo-03.webp", "/images/japan/tokyo-04.webp"],
  },
  {
    slug: "craftcation-2026",
    status: "past",
    title: "Craftcation Conference",
    label: "Conference",
    city: "Ventura, CA",
    dates: "April 8–12, 2026",
    sortDate: "2026-04-08",
    blurb:
      "Amy taught and spoke at this annual business and makers conference in the artsy seaside town of Ventura: part creative retreat, part business bootcamp, all community.",
    detailPage: false,
    eventUrl: "https://www.craftcationconference.com/",
  },
  {
    slug: "little-craft-fest-2026",
    status: "past",
    title: "Little Craft Fest",
    label: "Vendor + Speaker",
    city: "Conroe, TX",
    dates: "April 24–26, 2026",
    sortDate: "2026-04-24",
    blurb:
      "Amy taught and met crafters at this stationery and paper celebration near Houston, alongside 100+ makers and brands. Her workshops: Lovely Layers, and the YES, I'm a Little Obsessed Traveler's Notebook.",
    detailPage: false,
    eventUrl: "https://www.littlecraftfest.com/",
  },
]

// Upcoming soonest-first; "coming soon" entries (no date yet) sort to the end.
export function upcomingEvents(): SiteEvent[] {
  return EVENTS.filter((e) => e.status !== "past").sort((a, b) => a.sortDate.localeCompare(b.sortDate))
}

// Past most-recent-first.
export function pastEvents(): SiteEvent[] {
  return EVENTS.filter((e) => e.status === "past").sort((a, b) => b.sortDate.localeCompare(a.sortDate))
}

export function getEvent(slug: string): SiteEvent | undefined {
  return EVENTS.find((e) => e.slug === slug && e.detailPage)
}

export function detailPageEvents(): SiteEvent[] {
  return EVENTS.filter((e) => e.detailPage)
}

// Where a card on the index should send the visitor.
export function eventHref(e: SiteEvent): string {
  return e.internalHref ?? (e.detailPage ? `/events/${e.slug}` : e.eventUrl ?? "/events")
}

// True when the card link leaves the site (guest link-outs).
export function isExternalHref(e: SiteEvent): boolean {
  return !e.detailPage && !e.internalHref
}
