// Homepage — design finish, Phases 0 + 1 + 3 (2026-10-25; design system "Amy Tangerine",
// section "Upgrade plan"). The mural photograph carries the hero with nothing on it; the
// headline and Shop now sit in a white card under it (JC 10/25: a pill between the SHINE /
// BRIGHT curbs read as part of the photo; B-treatment card, below the picture, curbs whole).
// White wall + paper sections instead of the orange strip / teal band / orange panel;
// section titles are real h2s in sentence case (SectionHeader); Happy Mail is a card with a
// real envelope right after the categories; New arrivals is a grid; one email card.
// Hero image: /images/hero/homepage-hero.jpg, anchored at the bottom so the curbs stay in frame.

import Image from "next/image"
import type { Metadata } from "next"
import KeepUpCard from "@/components/keep-up-card"
import SectionHeader from "@/components/section-header"
import PromoCard from "@/components/promo-card"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import { getAllProducts, formatPrice } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"
import { shopifyImageUrl, isShopifyCdn } from "@/lib/shopify-image-loader"

// Dynamic rendering: new-arrivals section varies by visitor country (Markets-scoped products).
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

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
// Phones show four (2x2; the fifth tile is hidden below sm so no tile sits alone);
// a sixth from Amy makes it 2x3 on phones and six across on desktop.
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

      {/* ── Hero: the photograph, nothing on it ── */}
      {/* Phones show the whole frame (16:9) so SHINE and BRIGHT both stay in the picture;
          a portrait crop of this photo always loses one curb. Desktop keeps the 80vh crop. */}
      <section className="relative w-full aspect-video md:aspect-auto md:h-[80vh] overflow-hidden">
        <Image
          src="/images/hero/homepage-hero.jpg"
          alt="Amy Tangerine in front of the Shine Bright mural"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "50% 88%" }}
          sizes="100vw"
        />
      </section>

      {/* ── Hero card: the line and the one button, on the page, not the picture ── */}
      <section className="px-4 md:px-10 pt-4 md:pt-6">
        <div
          className="rounded-2xl shadow-lift p-6 md:px-10 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8"
          style={{ background: "var(--color-white)" }}
        >
          <h1
            className="text-[28px] md:text-[40px] font-bold leading-[1.05] tracking-[-0.02em] max-w-[560px]"
            style={{ color: "var(--color-ink)" }}
          >
            Craft supplies for a colorful life.
          </h1>
          <TrackableLink
            href="/shop"
            event="hero_cta_click"
            eventData={{ cta_text: "Shop now", destination: "/shop", page: "homepage" }}
            className="cta-primary w-full md:w-auto shrink-0"
          >
            Shop now
          </TrackableLink>
        </div>
      </section>

      {/* ── Shop by category ── */}
      <section className="px-4 md:px-10 pt-12 md:pt-16 pb-6 md:pb-8">
        <SectionHeader title="Shop by category" />
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <TrackableLink
              key={cat.name}
              href={cat.href}
              event="category_click"
              eventData={{ category_name: cat.name, page: "homepage" }}
              className="group block min-w-0"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: "var(--color-paper)" }}>
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 33vw, 30vw"
                />
              </div>
              {/* Label under the tile (design critic F13 moved it onto a bar; Phase 3
                  takes it off the photograph altogether). */}
              <p className="mt-2 md:mt-3 text-[14px] md:text-[18px] font-semibold leading-tight" style={{ color: "var(--color-ink)" }}>
                {cat.name}
              </p>
            </TrackableLink>
          ))}
        </div>
      </section>

      {/* ── Happy Mail: the headline, right after the categories ── */}
      <section className="px-4 md:px-10 pt-6 md:pt-8 pb-12 md:pb-16">
        <PromoCard
          tone="pink"
          eyebrow="Monthly subscription"
          title="Every month, a letter from Amy."
          text="An envelope filled with stickers, die cuts, and a note about what she's making. Starting at $13/month."
          cta={{
            href: "/happy-mail",
            label: "Subscribe",
            event: "hero_cta_click",
            eventData: { cta_text: "Happy Mail card Subscribe", destination: "/happy-mail", page: "homepage" },
          }}
          image={{ src: "/images/happy-mail/envelopes/2026-04.jpg", alt: "The April 2026 Happy Mail envelope and what came in it" }}
        />
      </section>

      {/* ── New arrivals ── */}
      <section className="px-4 md:px-10 py-12 md:py-16 border-t" style={{ borderColor: "var(--color-border)" }}>
        <SectionHeader title="New arrivals" link={{ href: "/shop", label: "See all" }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {newArrivals.slice(0, 4).map((product) => (
            <TrackableLink
              key={product.name}
              href={product.href}
              event="product_click"
              eventData={{ product_name: product.name, source_section: "new-arrivals", page: "homepage" }}
              className="group block min-w-0 rounded-xl transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: "var(--color-paper)" }}>
                <Image
                  src={shopifyImageUrl(product.img, 640)}
                  unoptimized={isShopifyCdn(product.img)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <p className="mt-3 mb-1 px-0.5 text-[16px] font-semibold leading-[1.35]" style={{ color: "var(--color-ink)" }}>
                {product.name}
              </p>
              <p className="px-0.5 pb-1 text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>
                {product.price}
              </p>
            </TrackableLink>
          ))}
        </div>
      </section>

      {/* ── Sunshine & Rainbows (Amazon): the one off-site door, as a paper card ── */}
      <section className="px-4 md:px-10 pb-12 md:pb-16">
        <PromoCard
          eyebrow="On Amazon"
          title="Sunshine & Rainbows"
          text="Amy's new traveler's notebook, now available on Amazon."
          button="secondary"
          cta={{
            href: "/amzn/book",
            label: "Get it on Amazon",
            event: "product_click",
            eventData: { product_name: "Sunshine & Rainbows Traveler's Notebook", source_section: "spotlight", page: "homepage" },
          }}
          image={{ src: "/images/homepage/sunshine-rainbows-spotlight.jpg", alt: "Sunshine & Rainbows Traveler's Notebook by Amy Tangerine", position: "top" }}
        />
      </section>

      {/* ── About + Keep up, on paper ── */}
      <section
        className="px-4 md:px-10 py-12 md:py-16 border-y"
        style={{ background: "var(--color-paper)", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="min-w-0">
            <SectionHeader title="About Amy" className="mb-3" />
            <p className="text-[16px] leading-relaxed max-w-[42rem]" style={{ color: "var(--color-ink)" }}>
              Amy Tan is an author, designer, and creative entrepreneur on a mission to
              inspire others to craft a life they love. From stickers to workshops to her
              monthly Happy Mail, everything she creates is meant to add a little color
              to your day.
            </p>
            <TrackableLink
              href="/about"
              event="footer_click"
              eventData={{ link_text: "About Amy Read more", page: "homepage" }}
              className="inline-block mt-3 text-[16px] font-semibold underline underline-offset-[3px] hover:text-[color:var(--color-ink)] transition-colors"
              style={{ color: "var(--color-orange-ink)" }}
            >
              Read more
            </TrackableLink>
          </div>
          <KeepUpCard sourcePage="homepage" layout="panel" id="newsletter" />
        </div>
      </section>

      {/* ── Instagram ── */}
      <section className="pt-12 md:pt-16">
        <div className="px-4 md:px-10">
          <SectionHeader title="@amytangerine" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
          {IG_IMAGES.map((src, i) => (
            <TrackableLink
              key={i}
              href="https://instagram.com/amytangerine"
              event="external_link"
              eventData={{ destination: "instagram", source_page: "homepage", position: i }}
              className={`relative aspect-square overflow-hidden group block${i === 4 ? " hidden sm:block" : ""}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={src}
                alt="Amy Tangerine on Instagram"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </TrackableLink>
          ))}
        </div>
      </section>
    </main>
  )
}
