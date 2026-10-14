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

// ── Booth kit (t1101, 2026-10-07) ───────────────────────────────────────────
// One block per event drives everything the booth needs: the QR landing page
// (/events/<slug>/booth, chromeless + noindex), the event checkout route
// (/api/checkout/event), the booth capture route (/api/events/capture), and
// scripts/event-qr.py. Adding a show = filling this block on its entry.
// Replaces the hand-edited /paperworld one-off; /paperworld is now a fixed
// alias (qrAlias) so the printed QR keeps landing.
export type BoothOffer = {
  code: string // Shopify discount code: created in admin, scoped to the show window (runbook)
  kind: "hm-6month" | "shop" // hm-6month: direct checkout, code auto-applied. shop: show the code, link to /shop
  amountOff: number // dollars off, for the price display
  headline: string
  terms: string // the fine print, in Amy's words
}

export type EventBooth = {
  eventSource: string // _event_source cart attribute + Klaviyo signup_source (utm-convention.md)
  qrAlias?: string // fixed short path the printed QR encodes ("paperworld" -> /paperworld)
  boothNumber?: string
  hours?: string[] // one line per day, venue local time
  bring?: string[] // what Amy is bringing to the table
  offer?: BoothOffer
  captureHeading?: string
  captureBlurb?: string
}

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
  booth?: EventBooth // present = this event has a booth QR page (see the kit block above)
}

export const EVENTS: SiteEvent[] = [
  // ── Upcoming ──
  {
    slug: "paper-world-anaheim-september",
    status: "past",
    title: "Paper World Stationery Expo",
    label: "Stationery Expo",
    city: "Anaheim, CA",
    venue: "Anaheim Marriott",
    dates: "September 19, 2026",
    sortDate: "2026-09-19",
    blurb:
      "Paper World's fourth stop of the year and the closest one to home: 50+ stationery vendors, the Paper Lounge, and a sold-out Traveler's Notebook Workshop an hour from the studio.",
    detailPage: true,
    eventUrl: "https://www.paperworldstationeryexpo.com/",
    // Three no-face shots from the class (pages and hands only); the full set
    // lives on the unlisted /class/anaheim page for the people in the room.
    photos: [
      "/images/anaheim-2026/anaheim-01.jpg",
      "/images/anaheim-2026/anaheim-07.jpg",
      "/images/anaheim-2026/anaheim-08.jpg",
    ],
    // The class photo page is unlisted (for the people in the room), so the
    // public recap points at her channels, same as Orlando.
    recap: {
      links: [
        { label: "Amy on YouTube", href: "https://youtube.com/@amytangerine" },
        { label: "Amy on Instagram", href: "https://instagram.com/amytangerine" },
      ],
    },
    // First kit instance: the facts the hand-built /paperworld page carried
    // (commit 826a509). The printed Paper World QR encodes /paperworld, which
    // resolves to whichever stop carries qrAlias "paperworld" (next upcoming,
    // else the latest past one). The PAPERWORLD code expired 2026-09-26.
    booth: {
      eventSource: "paperworld-anaheim",
      qrAlias: "paperworld",
      offer: {
        code: "PAPERWORLD",
        kind: "hm-6month",
        amountOff: 6,
        headline: "Six months of mail from me.",
        terms: "Show price for friends who stopped by the booth: one payment of $66 instead of $72. Good through about a week after the show.",
      },
    },
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
    // Second kit instance; first out-of-state run of the Events (pop-up) POS
    // location. Open slots are marked AMY or JC; the page hides empty ones.
    booth: {
      eventSource: "lcf-conroe-2026",
      // AMY: booth/table number comes with Eunice's floor plan (second table asked 9/23).
      boothNumber: undefined,
      // Marketplace hours from littlecraftfest.com/pages/event-guide, read 2026-10-07.
      hours: ["Friday Oct 23 and Saturday Oct 24: 10am to 6pm", "Sunday Oct 25: 9am to 5pm"],
      // AMY: draft from the 9/23 sitting; confirm against Ahpo's packing list at the 10/16 POS prep.
      bring: [
        "Sticker books and the newest sticker sheets",
        "Stamp sets",
        "Zebra pens and ink",
        "Kits for the two Traveler's Notebook workshops",
      ],
      // JC: PROPOSED code, not created in Shopify yet. The checkout route 409s
      // (button reads "event discount isn't active yet") until the code exists
      // and is ACTIVE for the show window. Runbook step 3.
      offer: {
        code: "LITTLECRAFT",
        kind: "hm-6month",
        amountOff: 6,
        headline: "Six months of mail from me, at the show price.",
        terms: "$6 off the Happy Mail 6-month subscription for friends who found the table: one payment of $66 instead of $72. Good through about a week after the show. US addresses only.",
      },
      captureHeading: "Not ready to subscribe? Stay in touch.",
      captureBlurb: "Leave your email and Amy will send a note after the show with photos and what is new.",
    },
  },
  {
    slug: "village-well",
    status: "upcoming",
    title: "Art Show at Village Well",
    label: "Art Show",
    city: "Culver City, CA",
    venue: "Village Well Books & Coffee",
    dates: "Up now through early October",
    sortDate: "2026-10-06",
    blurb:
      "Amy's paintings are on the walls of the coziest bookstore-café on the west side, and they stay up through about October 6. Drop in any day the shop is open; the work is for sale, and the coffee is good.",
    detailPage: true,
    eventUrl: "https://villagewell.com/community/art-gallery",
    // Amy's three, texted 9/23: the wall, a table of people making at the gallery, Amy with friends in front of the work.
    photos: [
      "/images/village-well-2026/village-well-03.jpg",
      "/images/village-well-2026/village-well-02.jpg",
      "/images/village-well-2026/village-well-01.jpg",
    ],
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

// ── Booth kit helpers (t1101) ──

export function boothEvents(): SiteEvent[] {
  return EVENTS.filter((e) => e.booth)
}

export function getBoothEvent(slug: string): SiteEvent | undefined {
  return EVENTS.find((e) => e.slug === slug && e.booth)
}

export function boothPath(e: SiteEvent): string {
  return `/events/${e.slug}/booth`
}

// The printed QR encodes a fixed short path (/paperworld). It lands on the
// booth page of the soonest upcoming event carrying that alias or, between
// stops, the most recent past one (where the offer reads as ended).
export function resolveQrAlias(alias: string): SiteEvent | undefined {
  const matches = EVENTS.filter((e) => e.booth?.qrAlias === alias)
  const upcoming = matches.filter((e) => e.status !== "past").sort((a, b) => a.sortDate.localeCompare(b.sortDate))
  if (upcoming[0]) return upcoming[0]
  return [...matches].sort((a, b) => b.sortDate.localeCompare(a.sortDate))[0]
}
