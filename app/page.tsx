// Homepage — Production (Option D3: Editorial + Color)
// Hero image path: /images/hero/homepage-hero.webp — swap when Amy provides final shot
// Design: teal category bg, orange newsletter panel, teal Instagram bar, orange accent strip

import Image from "next/image"
import NewsletterForm from "@/components/newsletter-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import { getAllProducts, formatPrice } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"

// Dynamic rendering: new-arrivals section varies by visitor country (Markets-scoped products).
export const dynamic = "force-dynamic"

const CATEGORIES = [
  // Stickers tile: swapped 2026-05-28 (prior was hearthealinghappiness-sticker-book which is sold out qty -2).
  // Washi sticker book has qty 90 + is in-genre.
  { name: "Stickers", href: "/shop?category=stickers", img: "/images/products/washistickerbook-preorder/1.jpg" },
  // Stamps tile: swapped 2026-05-28 from moody2stamp4x6 (qty 0) to Squeeze the Day (qty 26).
  // Tile links to /shop?category=stamps; image is purely category visual.
  { name: "Stamps", href: "/shop?category=stamps", img: "/images/products/squeezethedaystamp4x6/1.jpg" },
  { name: "Happy Mail", href: "/happy-mail", img: "/images/homepage/happy-mail-category.jpg" },
]

// New Arrivals list: refreshed 2026-05-28 to match live inventory after SS->Shopify sync.
// All 6 verified in-stock at refresh time. Editorial list (not algorithmic) -- edit to swap.
// Prior list had 4 of 6 broken (3 sold-out, 1 dead handle).
const NEW_ARRIVAL_HANDLES = [
  "washistickerbook-preorder",              // qty 90 -- In My Colorful Era Washi Sticker Book
  "junkjournalstickerbook",                 // qty 68 -- A Little Obsessed Junk Journal Sticker Book
  "sticker-bundle-little-craft-fest",       // qty 33 -- Sticker Sheet Bundle from Little Craft Fest
  "icons-stamp-set-4x6-pre-order-ships-mid-november",  // qty 32 -- ICONS1 Stamp Set 4x6
  "squeezethedaystamp4x6",                  // qty 26 -- Squeeze the Day Stamp Set 4x6
  "ugh1stamp4x6",                           // qty 5 -- UGH Stamp Set (low stock, intentional for urgency)
]

// Instagram grid: 5 hand-picked posts from @amytangerine (Amy-curated 2026-05-28).
// Static download pattern -- tiles link out to instagram.com/amytangerine but images are
// local files. Real-feed integration (Meta Graph API or third-party widget) is a separate
// post-launch project. To refresh: pull new images, replace files in /images/homepage/ig/,
// update this array. Order is Amy's order.
const IG_IMAGES = [
  "/images/homepage/ig/ig1-C5otcs.jpg",  // Apr 11 2024 "Hello sunshine" carousel
  "/images/homepage/ig/ig2-CukrsP.jpg",  // Jul 11 2023 Katherine Center "Hello Stranger" launch
  "/images/homepage/ig/ig3-Ckl4VJ.jpg",  // Nov 05 2022 Dwell Magazine home feature
  "/images/homepage/ig/ig4-DY0emU.jpg",  // May 26 2026 "permission to play" supplies
  "/images/homepage/ig/ig5-DYYTU4.jpg",  // May 16 2026 Bluey & Mickey pop-up
]

export default async function HomePage() {
  const country = await getVisitorCountry()
  const allProducts = await getAllProducts(country)
  const productMap = new Map(allProducts.map((p) => [p.handle, p]))
  const newArrivals = NEW_ARRIVAL_HANDLES.flatMap((handle) => {
    const p = productMap.get(handle)
    if (!p) return []
    return [{
      name: p.title,
      price: formatPrice(p.priceRange.minVariantPrice),
      img: p.images.nodes[0]?.url ?? `/images/products/${handle}/1.jpg`,
      href: `/shop/${handle}`,
    }]
  })

  return (
    <main>
      <PageEngagementTracker page="homepage" />

      {/* ── Hero ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <Image
          src="/images/hero/homepage-hero.jpg"
          alt="Amy Tangerine in front of the Shine Bright mural"
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
          <p className="mt-3 md:mt-4 text-[18px] md:text-[24px] uppercase tracking-[0.2em] font-medium text-white">
            Craft supplies for a colorful life
          </p>
          <TrackableLink
            href="/shop"
            event="hero_cta_click"
            eventData={{ cta_text: "Shop Now", destination: "/shop", page: "homepage" }}
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
            eventData={{ cta_text: "Happy Mail Banner Subscribe", destination: "/happy-mail", page: "homepage" }}
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
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {CATEGORIES.map((cat) => (
            <TrackableLink
              key={cat.name}
              href={cat.href}
              event="category_click"
              eventData={{ category_name: cat.name, page: "homepage" }}
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

      {/* ── Editorial Break ── */}
      {/* Default image: /images/homepage/editorial-break-default.jpg (Paper Play journals + watercolor flat-lay).
          Use this whenever there is no temporary feature image to display. Convention set 2026-05-28 with Amy.
          Section links to nothing on purpose -- purely visual rhythm between Shop by Category and New Arrivals.
          Typography matches Feature Spotlight headline treatment (bottom-left gradient + drop-shadow). */}
      <div className="relative w-full h-[280px] md:h-[400px] mt-8 md:mt-10">
        <Image
          src="/images/homepage/editorial-break-default.jpg"
          alt="Amy Tangerine craft styling"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
        <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 max-w-lg text-right">
          <h3 className="text-[28px] md:text-[44px] font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Craft A Life
            <br />
            You Love
          </h3>
        </div>
      </div>

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
          {newArrivals.map((product) => (
            <TrackableLink
              key={product.name}
              href={product.href}
              event="product_click"
              eventData={{ product_name: product.name, source_section: "new-arrivals", page: "homepage" }}
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
            src="/images/homepage/paper-play-3-spotlight.jpg"
            alt="Paper Play 3 by Amy Tangerine"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 max-w-lg">
            <h3 className="text-[36px] md:text-[56px] font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Paper Play 3
            </h3>
            <p className="text-[15px] md:text-[17px] text-white/95 mt-2 md:mt-3 leading-snug">
              Amy&apos;s latest book — now available on Amazon.
            </p>
            <TrackableLink
              href="https://amzn.to/4sNtWk1"
              event="product_click"
              eventData={{ product_name: "Paper Play 3", source_section: "spotlight", page: "homepage" }}
              className="inline-block mt-4 md:mt-5 px-8 py-3 text-[13px] md:text-[14px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get It on Amazon
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
              eventData={{ link_text: "About Amy Read More", page: "homepage" }}
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
            <NewsletterForm sourcePage="homepage" />
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
          {IG_IMAGES.map((src, i) => (
            <TrackableLink
              key={i}
              href="https://instagram.com/amytangerine"
              event="external_link"
              eventData={{ destination: "instagram", source_page: "homepage", position: i }}
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
