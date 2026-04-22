// Homepage — Production (Option D3: Editorial + Color)
// Hero image path: /images/hero/homepage-hero.webp — swap when Amy provides final shot
// Design: teal category bg, orange newsletter panel, teal Instagram bar, orange accent strip

import Image from "next/image"
import NewsletterForm from "@/components/newsletter-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import { getAllProducts, formatPrice } from "@/lib/shopify"

export const revalidate = 60

const CATEGORIES = [
  { name: "Stickers", href: "/shop?category=stickers", img: "/images/products/hearthealinghappiness-sticker-book/1.jpg" },
  { name: "Die Cuts", href: "/shop?category=die-cuts", img: "/images/products/juicybitsstickers-happyedition/1.jpg" },
  { name: "Stamps", href: "/shop?category=stamps", img: "/images/products/moody2stamp4x6/1.jpg" },
  { name: "Happy Mail", href: "/happy-mail", img: "/images/products/mini-kit-embellishments/1.jpg" },
]

const NEW_ARRIVAL_HANDLES = [
  "hearthealinghappiness-sticker-book",
  "juicybitsstickers-happyedition",
  "squeezethedaystamp4x6",
  "juicybitsstickers-cozyedition",
  "icons-stamp-set-4x6-pre-order-ships-mid-november",
  "preorder-make-your-mark",
]

const IG_IMAGES = [
  "/images/products/hearthealinghappiness-sticker-book/2.jpg",
  "/images/products/juicybitsstickers-happyedition/2.jpg",
  "/images/products/squeezethedaystamp4x6/1.jpg",
  "/images/products/mini-kit-embellishments/1.jpg",
  "/images/products/mini-kit-washi/1.jpg",
  "/images/products/juicybitsstickers-cozyedition/2.jpg",
]

export default async function HomePage() {
  const allProducts = await getAllProducts()
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
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
      <div className="relative w-full h-[280px] md:h-[400px] mt-8 md:mt-10">
        <Image
          src="/images/products/juicybitsstickers-cozyedition/1.jpg"
          alt="Amy Tangerine craft styling"
          fill
          className="object-cover"
          sizes="100vw"
        />
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
            src="/images/products/hearthealinghappiness-sticker-book/2.jpg"
            alt="Paper Play 3 by Amy Tangerine"
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
              Paper Play 3
            </h3>
            <p className="text-[13px] md:text-[15px] text-white/80 mt-1 md:mt-2 leading-snug">
              Amy&apos;s latest book — now available on Amazon.
            </p>
            <TrackableLink
              href="https://amzn.to/4sNtWk1"
              event="product_click"
              eventData={{ product_name: "Paper Play 3", source_section: "spotlight", page: "homepage" }}
              className="inline-block mt-3 md:mt-4 px-6 py-2.5 text-[12px] md:text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
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
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
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
