// Homepage Variant — Events-Forward (v/events)
// Replaces the static editorial break with a two-tile "In Person" section
// linking to /events. All other sections identical to production homepage.
// Images: real Crafty Destinations / Squarespace URLs used as placeholders
// until Amy provides final photography.

import Image from "next/image"
import NewsletterForm from "@/components/newsletter-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

const CATEGORIES = [
  { name: "Stickers",   href: "/shop?category=stickers",  img: "/images/products/hearthealinghappiness-sticker-book/1.jpg" },
  { name: "Die Cuts",   href: "/shop?category=die-cuts",  img: "/images/products/juicybitsstickers-happyedition/1.jpg" },
  { name: "Stamps",     href: "/shop?category=stamps",    img: "/images/products/moody2stamp4x6/1.jpg" },
  { name: "Happy Mail", href: "/happy-mail",              img: "/images/products/mini-kit-embellishments/1.jpg" },
]

const NEW_ARRIVALS = [
  { name: "Heart Healing Happiness Sticker Book", price: "$16.00", img: "/images/products/hearthealinghappiness-sticker-book/1.jpg", href: "/shop/hearthealinghappiness-sticker-book" },
  { name: "Juicy Bits — Happy Edition",           price: "$8.50",  img: "/images/products/juicybitsstickers-happyedition/1.jpg",    href: "/shop/juicybitsstickers-happyedition" },
  { name: "Squeeze the Day Stamp 4x6",            price: "$14.00", img: "/images/products/squeezethedaystamp4x6/1.jpg",             href: "/shop/squeezethedaystamp4x6" },
  { name: "Juicy Bits — Cozy Edition",            price: "$8.50",  img: "/images/products/juicybitsstickers-cozyedition/1.jpg",     href: "/shop/juicybitsstickers-cozyedition" },
  { name: "Icons Stamp Set 4x6",                  price: "$14.00", img: "/images/products/icons-stamp-set-4x6-pre-order-ships-mid-november/1.jpg", href: "/shop/icons-stamp-set-4x6" },
  { name: "Make Your Mark",                       price: "$12.00", img: "/images/products/preorder-make-your-mark/1.jpg",           href: "/shop/make-your-mark" },
]

const IG_IMAGES = [
  "/images/products/hearthealinghappiness-sticker-book/2.jpg",
  "/images/products/juicybitsstickers-happyedition/2.jpg",
  "/images/products/squeezethedaystamp4x6/1.jpg",
  "/images/products/mini-kit-embellishments/1.jpg",
  "/images/products/mini-kit-washi/1.jpg",
  "/images/products/juicybitsstickers-cozyedition/2.jpg",
]

// In-person event tiles — swap img src when Amy provides photography
const EVENTS = [
  {
    id: "tokyo",
    label: "Craft Tour",
    title: "Tangerine Tokyo Takeover",
    description: "A girlfriend's shopping adventure through Tokyo's best stationery shops, paper stores, and craft destinations. Guided tours, Disneyland Tokyo, Mt. Fuji, and 20,000 daily steps.",
    cta: "Learn More",
    href: "/events",
    // Crafty Destinations placeholder — replace with Amy's own trip photography
    img: "https://media.rainpos.com/14090/TangerineTakeOver.jpeg",
    external: false,
  },
  {
    id: "workshops",
    label: "Workshops & Events",
    title: "Craftation, Paper Fest & More",
    description: "Amy teaches, speaks, and sells at craft conferences across the country — Craftation in Ventura, Paper Fest in Orange County, and the Squeeze the Day Retreat.",
    cta: "See All Events",
    href: "/events",
    // Squarespace placeholder — replace with current event photography
    img: "https://images.squarespace-cdn.com/content/v1/5dd0ae59b4b4b35c07faf907/1574158789074-A96SFN8OYHVTUZTMS7J4/20-Craftcation-Business-and-Makers-Conference-lifeguard.jpg",
    external: false,
  },
]

export default function EventsVariantPage() {
  return (
    <main>
      <PageEngagementTracker page="homepage-events-variant" />

      {/* ── Hero ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <Image
          src="/images/hero/homepage-hero.webp"
          alt="Amy Tangerine — craft supplies for a colorful life"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "50% 20%" }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 px-6 text-center">
          <h1
            className="text-[56px] md:text-[120px] lg:text-[160px] font-bold tracking-tight leading-none text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            AMY TANGERINE
          </h1>
          <p className="mt-3 md:mt-4 text-[13px] md:text-[15px] uppercase tracking-[0.2em] text-white/70">
            Craft supplies for a colorful life
          </p>
          <TrackableLink
            href="/shop"
            event="hero_cta_click"
            eventData={{ cta_text: "Shop Now", destination: "/shop", page: "homepage-events-variant" }}
            className="mt-6 md:mt-8 inline-block px-8 py-3 text-[13px] md:text-[14px] uppercase tracking-[0.15em] font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            Shop Now
          </TrackableLink>
        </div>
      </section>

      {/* ── Happy Mail Banner ── */}
      <section
        className="py-4 md:py-5 text-center border-y-2"
        style={{ background: "var(--color-orange)", borderColor: "var(--color-teal)" }}
      >
        <p className="text-[13px] md:text-[15px] uppercase tracking-[0.15em] font-semibold text-white">
          Happy Mail — Monthly craft subscription{" "}
          <TrackableLink
            href="/happy-mail"
            event="hero_cta_click"
            eventData={{ cta_text: "Happy Mail Banner Subscribe", destination: "/happy-mail", page: "homepage-events-variant" }}
            className="ml-3 underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Subscribe
          </TrackableLink>
        </p>
      </section>

      {/* ── Shop by Category ── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-8 md:pb-10" style={{ background: "var(--color-teal)" }}>
        <h2 className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-center mb-5 md:mb-6 text-white">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {CATEGORIES.map((cat) => (
            <TrackableLink
              key={cat.name}
              href={cat.href}
              event="category_click"
              eventData={{ category_name: cat.name, page: "homepage-events-variant" }}
              className="group relative block aspect-square overflow-hidden rounded-md"
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors duration-300" />
              <span className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-[13px] md:text-[15px] uppercase tracking-[0.1em] font-semibold text-white">
                {cat.name}
              </span>
            </TrackableLink>
          ))}
        </div>
      </section>

      {/* ── IN PERSON — two-tile events section (replaces static editorial break) ── */}
      <section className="px-4 md:px-10 pt-8 md:pt-10 pb-0">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2
            className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            In Person
          </h2>
          <TrackableLink
            href="/events"
            event="section_link_click"
            eventData={{ section: "in-person", page: "homepage-events-variant" }}
            className="text-[12px] md:text-[13px] uppercase tracking-[0.1em] font-semibold hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-orange)" }}
          >
            All Events →
          </TrackableLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {EVENTS.map((event) => (
            <TrackableLink
              key={event.id}
              href={event.href}
              event="event_tile_click"
              eventData={{ event_id: event.id, event_title: event.title, page: "homepage-events-variant" }}
              className="group relative block overflow-hidden rounded-lg"
            >
              {/* Image */}
              <div className="relative h-[220px] md:h-[300px] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                <p
                  className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold mb-1"
                  style={{ color: "var(--color-orange)" }}
                >
                  {event.label}
                </p>
                <h3 className="text-[20px] md:text-[26px] font-bold leading-tight text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-[12px] md:text-[13px] text-white/75 leading-snug mb-3 line-clamp-2">
                  {event.description}
                </p>
                <span
                  className="inline-block self-start px-4 py-1.5 text-[11px] md:text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border text-white border-white/60 group-hover:bg-white group-hover:text-black transition-all duration-300"
                >
                  {event.cta}
                </span>
              </div>
            </TrackableLink>
          ))}
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="pt-8 md:pt-10 pb-0">
        <h2
          className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-center mb-5 md:mb-6 px-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          New Arrivals
        </h2>
        <div
          className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-10 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {NEW_ARRIVALS.map((product) => (
            <TrackableLink
              key={product.name}
              href={product.href}
              event="product_click"
              eventData={{ product_name: product.name, source_section: "new-arrivals", page: "homepage-events-variant" }}
              className="flex-shrink-0 w-[160px] md:w-[220px] group"
            >
              <div className="relative aspect-square overflow-hidden rounded-md mb-2">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="220px"
                />
              </div>
              <p
                className="text-[12px] md:text-[13px] font-medium truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {product.name}
              </p>
              <p className="text-[12px] md:text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                {product.price}
              </p>
            </TrackableLink>
          ))}
        </div>
      </section>

      {/* ── Orange accent strip ── */}
      <div className="mx-4 md:mx-10 h-1.5 rounded-full mt-8 md:mt-10" style={{ background: "var(--color-orange)" }} />

      {/* ── Feature Spotlight ── */}
      <section className="relative mt-3 md:mt-4 mx-4 md:mx-10 rounded-lg overflow-hidden">
        <div className="relative h-[320px] md:h-[420px]">
          <Image
            src="/images/products/preorder-make-your-mark/1.jpg"
            alt="Make Your Mark by Amy Tangerine"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 max-w-md">
            <p className="text-[11px] md:text-[12px] uppercase tracking-[0.15em] text-white/60 mb-1">
              Featured
            </p>
            <h3 className="text-[28px] md:text-[40px] font-bold leading-tight text-white">
              Make Your Mark
            </h3>
            <p className="text-[13px] md:text-[15px] text-white/80 mt-1 md:mt-2 leading-snug">
              A guided art journal for your most colorful self.
            </p>
            <TrackableLink
              href="/shop/make-your-mark"
              event="product_click"
              eventData={{ product_name: "Make Your Mark", source_section: "spotlight", page: "homepage-events-variant" }}
              className="inline-block mt-3 md:mt-4 px-6 py-2.5 text-[12px] md:text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Learn More
            </TrackableLink>
          </div>
        </div>
      </section>

      {/* ── About + Newsletter ── */}
      <section className="py-10 md:py-14">
        <div className="max-w-5xl mx-auto md:flex md:items-stretch md:gap-0">
          {/* About */}
          <div className="md:flex-1 px-6 md:px-10 pb-8 md:pb-0 flex flex-col justify-center">
            <h2
              className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              About Amy
            </h2>
            <p className="text-[14px] md:text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Amy Tan is an author, designer, and creative entrepreneur on a mission to
              inspire others to craft a life they love. From stickers to workshops to her
              monthly Happy Mail, everything she creates is meant to add a little color
              to your day.
            </p>
            <TrackableLink
              href="/about"
              event="footer_click"
              eventData={{ link_text: "About Amy Read More", page: "homepage-events-variant" }}
              className="inline-block mt-3 text-[13px] uppercase tracking-[0.1em] font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-orange)" }}
            >
              Read More
            </TrackableLink>
          </div>

          {/* Newsletter */}
          <div
            className="md:flex-1 px-6 md:px-10 py-8 md:py-10 rounded-none md:rounded-r-lg flex flex-col justify-center"
            style={{ background: "var(--color-orange)" }}
          >
            <h2 className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-3 text-white">
              Stay in the Loop
            </h2>
            <p className="text-[13px] md:text-[14px] mb-3 text-white/80">
              New drops, workshops, and behind-the-scenes — straight to your inbox.
            </p>
            <NewsletterForm sourcePage="homepage-events-variant" />
          </div>
        </div>
      </section>

      {/* ── Instagram ── */}
      <section className="pb-0">
        <div className="py-5 md:py-6 text-center" style={{ background: "var(--color-teal)" }}>
          <h2 className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-white">
            @amytangerine
          </h2>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
          {IG_IMAGES.map((src, i) => (
            <TrackableLink
              key={i}
              href="https://instagram.com/amytangerine"
              event="external_link"
              eventData={{ destination: "instagram", source_page: "homepage-events-variant", position: i }}
              className="relative aspect-square overflow-hidden group block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={src}
                alt="Amy Tangerine on Instagram"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 25vw, 16vw"
              />
            </TrackableLink>
          ))}
        </div>
      </section>
    </main>
  )
}
