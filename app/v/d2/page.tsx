// Homepage v2 — Option D2: Editorial + Promo
// D with promotion-first hero (HAPPY MAIL CTA), no HM banner (redundant),
// and a mid-page teal promo strip after New Arrivals.

import Image from "next/image"
import NewsletterForm from "@/components/newsletter-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import VariantTracker from "@/components/variant-tracker"

export default function HomepageOptionD2() {
  return (
    <main>
      <PageEngagementTracker page="homepage-d2" />
      <VariantTracker variantId="d2" />
      {/* ── Hero — Promotion Focus ── */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/hero/homepage-hero.webp"
          alt="Amy Tangerine"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "50% 20%" }}
          sizes="100vw"
        />
        {/* Stronger overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Content — promotion-first */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-20 px-6 text-center">
          {/* Eyebrow label */}
          <p className="text-[11px] md:text-[12px] uppercase tracking-[0.25em] text-white/50 mb-3 md:mb-4">
            Monthly subscription
          </p>
          {/* Product name */}
          <h1
            className="text-[40px] md:text-[80px] lg:text-[100px] font-bold tracking-tight leading-none text-white"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            HAPPY MAIL
          </h1>
          {/* Value prop */}
          <p className="mt-3 md:mt-4 text-[14px] md:text-[16px] text-white/80 max-w-md leading-relaxed">
            Exclusive stickers, stamps, and surprises delivered to your door every month.
            Join 5,000+ crafters.
          </p>
          {/* Primary CTA — filled orange */}
          <a
            href="/happy-mail"
            className="mt-6 md:mt-8 inline-block px-10 py-3.5 text-[13px] md:text-[14px] uppercase tracking-[0.15em] font-semibold rounded-full text-white transition-all duration-300 hover:opacity-90"
            style={{ background: "var(--color-orange)" }}
          >
            Subscribe — $35/mo
          </a>
          {/* Secondary ghost CTA */}
          <a
            href="/shop"
            className="mt-3 inline-block px-8 py-2.5 text-[12px] md:text-[13px] uppercase tracking-[0.12em] font-medium rounded-full border border-white/40 text-white/60 hover:border-white hover:text-white transition-all duration-300"
          >
            Shop All Products
          </a>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section className="px-4 md:px-10 pt-8 md:pt-12 pb-0">
        <h2
          className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-center mb-5 md:mb-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          Shop by Category
        </h2>

        {/* Grid — 2 cols mobile, 4 cols desktop, tight gaps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { name: "Stickers", img: "/images/products/hearthealinghappiness-sticker-book/1.jpg" },
            { name: "Die Cuts", img: "/images/products/juicybitsstickers-happyedition/1.jpg" },
            { name: "Stamps", img: "/images/products/moody2stamp4x6/1.jpg" },
            { name: "Happy Mail", img: "/images/products/mini-kit-embellishments/1.jpg" },
          ].map((cat) => (
            <a
              key={cat.name}
              href="/shop"
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
            </a>
          ))}
        </div>
      </section>

      {/* ── Editorial Break — full bleed, no padding ── */}
      <div className="relative w-full h-[280px] md:h-[400px] mt-8 md:mt-10">
        <Image
          src="/images/products/juicybitsstickers-cozyedition/1.jpg"
          alt="Amy Tangerine craft styling"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* ── New Arrivals — tight horizontal scroll ── */}
      <section className="pt-8 md:pt-10 pb-0">
        <h2
          className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-center mb-5 md:mb-6 px-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          New Arrivals
        </h2>

        {/* Horizontal scroll row */}
        <div
          className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-10 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {[
            { name: "Heart Healing Happiness Sticker Book", price: "$16.00", img: "/images/products/hearthealinghappiness-sticker-book/1.jpg" },
            { name: "Juicy Bits — Happy Edition", price: "$8.50", img: "/images/products/juicybitsstickers-happyedition/1.jpg" },
            { name: "Squeeze the Day Stamp 4x6", price: "$14.00", img: "/images/products/squeezethedaystamp4x6/1.jpg" },
            { name: "Juicy Bits — Cozy Edition", price: "$8.50", img: "/images/products/juicybitsstickers-cozyedition/1.jpg" },
            { name: "Icons Stamp Set 4x6", price: "$14.00", img: "/images/products/icons-stamp-set-4x6-pre-order-ships-mid-november/1.jpg" },
            { name: "Make Your Mark", price: "$12.00", img: "/images/products/preorder-make-your-mark/1.jpg" },
          ].map((product) => (
            <a key={product.name} href="/shop" className="flex-shrink-0 w-[160px] md:w-[220px] group">
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
            </a>
          ))}
        </div>
      </section>

      {/* ── Mid-Page Promo ── */}
      <section className="py-6 md:py-8 text-center" style={{ background: "var(--color-teal)" }}>
        <p className="text-[13px] md:text-[15px] uppercase tracking-[0.15em] font-semibold text-white">
          Free shipping on orders over $50
          <span className="mx-2 opacity-40">|</span>
          New drops every Friday
        </p>
      </section>

      {/* ── Spotlight ── */}
      <section className="relative mt-8 md:mt-10 mx-4 md:mx-10 rounded-lg overflow-hidden">
        <div className="relative h-[320px] md:h-[420px]">
          <Image
            src="/images/products/travel-watercolor-set/1.jpg"
            alt="Amy Tangerine Travel Watercolor Set"
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
              Travel Watercolor Set
            </h3>
            <p className="text-[13px] md:text-[15px] text-white/80 mt-1 md:mt-2 leading-snug">
              Create on the go. Everything you need in one portable kit.
            </p>
            <a
              href="/shop/travel-watercolor-set"
              className="inline-block mt-3 md:mt-4 px-6 py-2.5 text-[12px] md:text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full border border-white text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── About + Newsletter ── */}
      <section className="px-4 md:px-10 py-10 md:py-14">
        <div className="max-w-5xl mx-auto md:flex md:items-start md:gap-12">
          {/* About — left */}
          <div className="md:flex-1 mb-8 md:mb-0">
            <h2
              className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              About Amy
            </h2>
            <p
              className="text-[14px] md:text-[15px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Amy Tan is an author, designer, and creative entrepreneur on a mission to
              inspire others to craft a life they love. From stickers to workshops to her
              monthly Happy Mail, everything she creates is meant to add a little color
              to your day.
            </p>
            <a
              href="/about"
              className="inline-block mt-3 text-[13px] uppercase tracking-[0.1em] font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--color-orange)" }}
            >
              Read More
            </a>
          </div>

          {/* Newsletter — right */}
          <div className="md:flex-1 md:max-w-sm">
            <h2
              className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              Stay in the Loop
            </h2>
            <p
              className="text-[13px] md:text-[14px] mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              New drops, workshops, and behind-the-scenes — straight to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* ── Instagram ── */}
      <section className="pb-10 md:pb-14">
        <h2
          className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold text-center mb-5 md:mb-6 px-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          @amytangerine
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-1">
          {[
            "/images/products/hearthealinghappiness-sticker-book/2.jpg",
            "/images/products/juicybitsstickers-happyedition/2.jpg",
            "/images/products/squeezethedaystamp4x6/1.jpg",
            "/images/products/mini-kit-embellishments/1.jpg",
            "/images/products/mini-kit-washi/1.jpg",
            "/images/products/juicybitsstickers-cozyedition/2.jpg",
          ].map((src, i) => (
            <a
              key={i}
              href="https://instagram.com/amytangerine"
              className="relative aspect-square overflow-hidden group"
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
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
