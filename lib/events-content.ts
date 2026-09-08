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
// Facts verified 2026-07-07 (event sites + web); fall 2026 stops added 2026-09-08
// (Paper World Anaheim from paperworldstationeryexpo.com, Little Craft Fest
// workshops from Amy's two Little Craft Place listings, sent 2026-09-04).
// Open slots JC fills during review: Orlando recap video, Village Well date.

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
  meetAmy?: string // upcoming events: what meeting Amy there looks like (booth vs walking)
  detailPage: boolean // true = /events/<slug> exists for this entry
  internalHref?: string // bespoke page override (Tokyo -> /japan)
  eventUrl?: string // the event's own site
  ticketUrl?: string
  details?: string[] // fact bullets (booth number, hours) -- JC fills in
  links?: { label: string; href: string }[] // more than one thing to book (workshops sold by the host)
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
    slug: "paper-world-anaheim-september",
    status: "upcoming",
    title: "Paper World Stationery Expo",
    label: "Stationery Expo",
    city: "Anaheim, CA",
    venue: "Anaheim Marriott",
    dates: "September 19, 2026",
    sortDate: "2026-09-19",
    blurb:
      "Paper World comes back to Anaheim: 50+ curated stationery vendors, workshops, the Paper Lounge, and a full Saturday of paper people. Amy's fourth Paper World this year, and the closest one to home.",
    meetAmy:
      "Stop by Amy's table to shop her supplies in person, see new goodies first, and say hi. She loves meeting people who make things.",
    detailPage: true,
    eventUrl: "https://www.paperworldstationeryexpo.com/",
    ticketUrl: "https://www.paperworldstationeryexpo.com/tickets-anaheim",
    details: [
      "Anaheim Marriott, 700 W Convention Way, Anaheim, CA 92802",
      "Saturday, September 19 · VIP 11am–6pm · General admission 1pm–6pm",
    ],
  },
  {
    slug: "little-craft-fest-fall-2026",
    status: "upcoming",
    title: "Fall Market + Spooky Little Craft Fest",
    label: "Workshops",
    city: "Conroe, TX",
    venue: "Hyatt Regency Conroe",
    dates: "October 23–25, 2026",
    sortDate: "2026-10-23",
    blurb:
      "Amy is back near Houston for Little Craft Fest's spooky fall edition, teaching two Traveler's Notebook workshops. Each comes with a kit made just for that class, exclusive sticker sheets, and a few never-before-released goodies.",
    meetAmy:
      "Take a class with Amy. Seats are sold through Little Craft Place; bring scissors, glue, and a favorite pen or two, and the kit covers the rest.",
    detailPage: true,
    eventUrl: "https://www.littlecraftfest.com/",
    details: ["Hyatt Regency Conroe, 1001 Grand Central Parkway, Conroe, TX 77304 · Mesquite Room, 2nd floor"],
    links: [
      {
        label: "BIG LOVE Traveler's Notebook Workshop · Fri Oct 23, 3:30–5pm or Sun Oct 25, 11am–12:30pm",
        href: "https://www.littlecraftplace.com/products/big-love-travelers-notebook-workshop-by-amy-tangerine",
      },
      {
        label: "COLLECT AND CREATE Traveler's Notebook + Trinket Tin Workshop · Sat Oct 24, 5:30–7pm",
        href: "https://www.littlecraftplace.com/products/collect-and-create-travelers-notebook-trinket-tin-workshop-by-amy-tangerine",
      },
    ],
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
    slug: "paper-world-orlando",
    status: "past",
    title: "Paper World Stationery Expo",
    label: "Stationery Expo",
    city: "Orlando, FL",
    venue: "Hilton Orlando",
    dates: "August 29, 2026",
    sortDate: "2026-08-29",
    blurb:
      "Paper World's Florida stop: 50+ curated stationery vendors, workshops, and a whole day of paper people. Amy taught a Traveler's Notebook class and shopped her supplies from her table.",
    detailPage: true,
    eventUrl: "https://www.paperworldstationeryexpo.com/",
    // Orlando recap video: slot for JC once Amy posts one. Until then the page
    // points to her channels.
    recap: {
      links: [
        { label: "Amy on YouTube", href: "https://youtube.com/@amytangerine" },
        { label: "Amy on Instagram", href: "https://instagram.com/amytangerine" },
      ],
    },
  },
  {
    slug: "stationery-fest",
    status: "past",
    title: "Stationery Fest 2026",
    label: "Stationery Festival",
    city: "Brooklyn, NY",
    venue: "Industry City",
    dates: "July 30 – August 1, 2026",
    sortDate: "2026-07-30",
    blurb:
      "Three days, 200+ stationery brands, and thousands of paper people in one place. Amy walked all three days and came home with a Traveler's Notebook full of it.",
    detailPage: true,
    eventUrl: "https://stationeryfestival.com/",
    recap: {
      youtubeId: "2iEXFg7RhcM",
      videoTitle: "My First NY Stationery Fest! Vlog + Traveler's Notebook",
    },
    photos: [
      "https://i.ytimg.com/vi/2iEXFg7RhcM/hq1.jpg",
      "https://i.ytimg.com/vi/2iEXFg7RhcM/hq2.jpg",
      "https://i.ytimg.com/vi/2iEXFg7RhcM/hq3.jpg",
    ],
  },
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
    // Frames from Amy's own vlog (YouTube auto-thumbnails 1/2/3) -- the same
    // 3-up treatment as the Tokyo card, without hosting anything ourselves.
    photos: [
      "https://i.ytimg.com/vi/v4HbwY-OAuc/hq1.jpg",
      "https://i.ytimg.com/vi/v4HbwY-OAuc/hq2.jpg",
      "https://i.ytimg.com/vi/v4HbwY-OAuc/hq3.jpg",
    ],
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
