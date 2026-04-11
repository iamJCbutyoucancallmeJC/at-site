// Homepage v2 — full build per wireframes/homepage-mobile.html + homepage-desktop.html
// Sections: Hero, HM Banner, Categories, Editorial Break, New Arrivals,
//           Feature Spotlight, About + Newsletter, Instagram, Footer (in layout)

import Image from "next/image"
import Link from "next/link"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import NewsletterForm from "@/components/newsletter-form"

/* -------------------------------------------------------------------------- */
/*  Static data (Phase 2: pull from Shopify)                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  {
    label: "New Arrivals",
    href: "/shop?category=new",
    image: "/images/products/juicybitsstickers-happyedition/1.jpg",
    gradient: "linear-gradient(135deg, #FFECD2, #FCB69F)",
    featured: true,
  },
  {
    label: "Stickers & Dies",
    href: "/shop?category=stickers",
    image: "/images/products/hearthealinghappiness-sticker-book/1.jpg",
    gradient: "linear-gradient(135deg, #D4EDDA, #A8E6CF)",
  },
  {
    label: "Stamps",
    href: "/shop?category=stamps",
    image: "/images/products/moody2stamp4x6/1.jpg",
    gradient: "linear-gradient(135deg, #E8D5F5, #D1B3F0)",
  },
  {
    label: "Digital",
    href: "/shop?category=digital",
    image: "/images/products/mini-kit-embellishments/1.jpg",
    gradient: "linear-gradient(135deg, #D5E8F5, #A8D0E6)",
  },
  {
    label: "Bundles — Save",
    href: "/shop?category=bundles",
    image: "/images/products/tn-bundle-a/1.jpg",
    gradient: "linear-gradient(135deg, #3BBFA0, #2DA88A)",
  },
]

const FEATURED_PRODUCTS = [
  {
    name: "Heart Healing Happiness Sticker Book",
    price: "$16.00",
    image: "/images/products/hearthealinghappiness-sticker-book/1.jpg",
    href: "/shop/hearthealinghappiness-sticker-book",
    featured: true,
  },
  {
    name: "Squeeze the Day Stamp Set 4x6",
    price: "$14.00",
    image: "/images/products/squeezethedaystamp4x6/1.jpg",
    href: "/shop/squeezethedaystamp4x6",
  },
  {
    name: "Juicy Bits Stickers — Happy Edition",
    price: "$8.50",
    image: "/images/products/juicybitsstickers-happyedition/1.jpg",
    href: "/shop/juicybitsstickers-happyedition",
  },
]

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="homepage-b" />

      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
      <section className="relative w-full h-[460px] md:h-[600px] overflow-hidden">
        {/* Hero image */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, #FFECD2 0%, #FD891C 100%)" }}
        />
        <Image
          src="/images/hero/homepage-hero.webp"
          alt="Amy Tangerine — craft supplies and creative community"
          fill
          className="object-cover"
          style={{ objectPosition: "50% 20%" }}
          priority
        />
        {/* Text overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-32 md:px-[72px] md:pb-14 md:pt-40"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h1 className="text-[28px] md:text-5xl font-extrabold text-white leading-tight mb-2 md:mb-2.5 max-w-[600px]">
            Craft a life you love
          </h1>
          <p className="text-sm md:text-lg text-white/90 mb-4 md:mb-6 max-w-[500px]">
            <span className="md:hidden">Stickers, stamps, workshops, and monthly Happy Mail.</span>
            <span className="hidden md:inline">
              Stickers, stamps, workshops, books, and monthly Happy Mail — everything I make to help you create.
            </span>
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/shop"
              className="inline-block px-8 py-3.5 md:px-10 md:py-4 rounded-full text-base md:text-lg font-bold text-white"
              style={{
                background: "var(--color-orange)",
                boxShadow: "0 4px 16px rgba(253,137,28,0.35)",
              }}
            >
              Shop Now
            </Link>
            <Link
              href="/about"
              className="inline-block px-8 py-3.5 md:px-10 md:py-4 rounded-full text-base md:text-lg font-bold border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              Meet Amy
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  HAPPY MAIL BANNER                                                 */}
      {/* ================================================================== */}
      <Link
        href="/happy-mail"
        className="block"
        style={{ background: "var(--color-orange)" }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center px-[72px] py-5">
        <div className="flex items-center gap-5 max-w-[1200px] mx-auto w-full">
          <div
            className="w-12 h-12 min-w-[48px] rounded-xl flex items-center justify-center text-[22px] text-white"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ♥
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Happy Mail — $13/mo</h3>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
              Exclusive stickers, die cuts, and surprises delivered every month. 287 subscribers and counting.
            </span>
          </div>
          <span
            className="ml-auto px-7 py-2.5 rounded-lg text-[15px] font-bold"
            style={{
              background: "var(--color-white)",
              color: "var(--color-orange)",
            }}
          >
            Learn More
          </span>
        </div>
        </div>
        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3.5 px-5 py-4">
          <div
            className="w-[52px] h-[52px] min-w-[52px] rounded-xl flex items-center justify-center text-[22px] text-white"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ♥
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white mb-0.5">Happy Mail — $13/mo</h3>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              Exclusive stickers + surprises, every month
            </p>
          </div>
          <span className="ml-auto text-white text-lg font-bold">&gt;</span>
        </div>
      </Link>

      {/* ================================================================== */}
      {/*  SHOP BY CATEGORY                                                  */}
      {/* ================================================================== */}
      <section className="px-5 py-7 md:py-16 md:max-w-[1200px] md:mx-auto md:px-12">
        <p
          className="text-xs md:text-[13px] font-bold uppercase tracking-[1.5px] mb-1.5 md:mb-2"
          style={{ color: "var(--color-orange)" }}
        >
          Shop
        </p>
        <h2
          className="text-xl md:text-[28px] font-extrabold leading-tight mb-3.5 md:mb-7"
          style={{ color: "var(--color-text-primary)" }}
        >
          Browse by category
        </h2>

        {/* Desktop: asymmetric — 1 tall left + 2x2 right */}
        <div className="hidden md:grid grid-cols-2 gap-5">
          {/* Tall featured card */}
          <Link
            href={CATEGORIES[0].href}
            className="rounded-2xl overflow-hidden bg-white shadow-sm hover:-translate-y-[3px] transition-transform"
            style={{ gridRow: "1 / 3" }}
          >
            <div className="relative h-[340px]" style={{ background: CATEGORIES[0].gradient }}>
              <Image
                src={CATEGORIES[0].image}
                alt={CATEGORIES[0].label}
                fill
                className="object-cover"
              />
            </div>
            <div className="px-4 py-3.5 text-[15px] font-bold" style={{ color: "var(--color-text-primary)" }}>
              {CATEGORIES[0].label}
            </div>
          </Link>
          {/* 2x2 sub-grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-5" style={{ gridRow: "1 / 3" }}>
            {CATEGORIES.slice(1).map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="rounded-2xl overflow-hidden bg-white shadow-sm hover:-translate-y-[3px] transition-transform"
              >
                <div className="relative h-[140px]" style={{ background: cat.gradient }}>
                  <Image src={cat.image} alt={cat.label} fill className="object-cover" />
                </div>
                <div className="px-4 py-3.5 text-[15px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {cat.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile: stacked editorial — 1 big + 2x1 rows */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Featured */}
          <Link
            href={CATEGORIES[0].href}
            className="rounded-[14px] overflow-hidden bg-white shadow-sm"
          >
            <div className="relative h-[180px]" style={{ background: CATEGORIES[0].gradient }}>
              <Image src={CATEGORIES[0].image} alt={CATEGORIES[0].label} fill className="object-cover" />
            </div>
            <div className="px-3.5 py-2.5 text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              {CATEGORIES[0].label}
            </div>
          </Link>
          {/* Rows of 2 */}
          {[CATEGORIES.slice(1, 3), CATEGORIES.slice(3, 5)].map((row, ri) => (
            <div key={ri} className="grid grid-cols-2 gap-3">
              {row.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="rounded-[14px] overflow-hidden bg-white shadow-sm"
                >
                  <div className="relative h-[110px]" style={{ background: cat.gradient }}>
                    <Image src={cat.image} alt={cat.label} fill className="object-cover" />
                  </div>
                  <div className="px-3.5 py-2.5 text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {cat.label}
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/*  EDITORIAL IMAGE BREAK                                             */}
      {/* ================================================================== */}
      <section className="relative w-full h-[280px] md:h-[360px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #FCB69F 0%, #FFECD2 50%, #F5A623 100%)",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-center px-4"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <p className="text-xs md:text-sm font-semibold">
            [Lifestyle photo: Amy at desk surrounded by product, mid-create]
          </p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-24 md:px-[72px] md:pb-9 md:pt-28"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h3 className="text-xl md:text-[32px] font-extrabold text-white mb-1 md:mb-1.5">
            Made with love in LA
          </h3>
          <p className="text-[13px] md:text-base" style={{ color: "rgba(255,255,255,0.85)" }}>
            Every piece, designed to make your day a little brighter.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  NEW ARRIVALS                                                      */}
      {/* ================================================================== */}
      <section className="py-7 md:py-16" style={{ background: "var(--color-white)" }}>
        <div className="px-5 md:max-w-[1200px] md:mx-auto md:px-12">
          <p
            className="text-xs md:text-[13px] font-bold uppercase tracking-[1.5px] mb-1.5 md:mb-2"
            style={{ color: "var(--color-orange)" }}
          >
            Just in
          </p>
          <h2
            className="text-xl md:text-[28px] font-extrabold leading-tight mb-3.5 md:mb-7"
            style={{ color: "var(--color-text-primary)" }}
          >
            New arrivals
          </h2>

          {/* Desktop: 4-col grid, featured spans 2 */}
          <div className="hidden md:grid grid-cols-4 gap-5">
            {FEATURED_PRODUCTS.map((product) => (
              <Link
                key={product.name}
                href={product.href}
                className={`rounded-2xl overflow-hidden bg-white shadow-sm hover:-translate-y-[3px] transition-transform ${
                  product.featured ? "col-span-2" : ""
                }`}
              >
                <div
                  className={`relative ${product.featured ? "h-[280px]" : "h-[200px]"}`}
                  style={{ background: "linear-gradient(135deg, #FFECD2, #FCB69F)" }}
                >
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                </div>
                <div
                  className={`px-3.5 pt-3.5 pb-1 font-bold leading-snug ${
                    product.featured ? "text-lg" : "text-[15px]"
                  }`}
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {product.name}
                </div>
                <div
                  className={`px-3.5 pb-3.5 font-extrabold ${
                    product.featured ? "text-xl" : "text-base"
                  }`}
                  style={{ color: "var(--color-orange)" }}
                >
                  {product.price}
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile: stacked — 1 featured + 2-up row */}
          <div className="flex flex-col gap-3 md:hidden">
            <Link
              href={FEATURED_PRODUCTS[0].href}
              className="rounded-[14px] overflow-hidden bg-white shadow-sm"
            >
              <div
                className="relative h-[200px]"
                style={{ background: "linear-gradient(135deg, #FFECD2, #FCB69F)" }}
              >
                <Image
                  src={FEATURED_PRODUCTS[0].image}
                  alt={FEATURED_PRODUCTS[0].name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="px-3 pt-2.5 pb-0.5 text-[13px] font-bold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                {FEATURED_PRODUCTS[0].name}
              </div>
              <div className="px-3 pb-2.5 text-sm font-extrabold" style={{ color: "var(--color-orange)" }}>
                {FEATURED_PRODUCTS[0].price}
              </div>
            </Link>
            <div className="grid grid-cols-2 gap-3">
              {FEATURED_PRODUCTS.slice(1).map((product) => (
                <Link
                  key={product.name}
                  href={product.href}
                  className="rounded-[14px] overflow-hidden bg-white shadow-sm"
                >
                  <div
                    className="relative h-[140px]"
                    style={{ background: "linear-gradient(135deg, #FFECD2, #FCB69F)" }}
                  >
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="px-3 pt-2.5 pb-0.5 text-[13px] font-bold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                    {product.name}
                  </div>
                  <div className="px-3 pb-2.5 text-sm font-extrabold" style={{ color: "var(--color-orange)" }}>
                    {product.price}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/shop"
            className="block text-center mt-5 md:mt-7 text-sm md:text-base font-bold hover:underline"
            style={{ color: "var(--color-orange)" }}
          >
            View all products →
          </Link>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  AMY'S WORLD                                                       */}
      {/* ================================================================== */}

      {/* --- Books Block --- */}
      <section className="py-10 md:py-20">
        <div className="px-5 md:max-w-[1200px] md:mx-auto md:px-12">
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
            {/* Book cover */}
            <div className="flex justify-center mb-6 md:mb-0">
              <div
                className="w-[200px] h-[280px] md:w-[260px] md:h-[360px] rounded-lg flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #FFECD2, #FD891C)",
                  color: "rgba(255,255,255,0.7)",
                  boxShadow: "8px 12px 32px rgba(0,0,0,0.15)",
                }}
              >
                [Making Memories book cover]
              </div>
            </div>
            {/* Text */}
            <div>
              <p
                className="text-xs md:text-sm font-bold uppercase tracking-[1.5px] mb-2"
                style={{ color: "var(--color-orange)" }}
              >
                Amy&apos;s Book
              </p>
              <h3
                className="text-2xl md:text-[32px] font-extrabold leading-tight mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Making Memories
              </h3>
              <p
                className="text-sm md:text-base leading-relaxed mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Practical and fun ideas to start making memories today. Amy&apos;s guide to unlocking creativity and connection through hands-on projects the whole family can enjoy.
              </p>
              <a
                href="https://www.amazon.com/dp/0744026555"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-7 py-3 rounded-full text-base font-bold text-white"
                style={{
                  background: "var(--color-orange)",
                  boxShadow: "0 4px 12px rgba(253,137,28,0.3)",
                }}
              >
                Order on Amazon →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- Workshops Block --- */}
      <section className="py-10 md:py-20" style={{ background: "var(--color-gray-light)" }}>
        <div className="px-5 md:max-w-[1200px] md:mx-auto md:px-12">
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-center">
            {/* Text (left on desktop) */}
            <div className="mb-6 md:mb-0 md:order-1">
              <p
                className="text-xs md:text-sm font-bold uppercase tracking-[1.5px] mb-2"
                style={{ color: "var(--color-teal)" }}
              >
                Online Workshops
              </p>
              <h3
                className="text-2xl md:text-[32px] font-extrabold leading-tight mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Learn something new
              </h3>
              <p
                className="text-sm md:text-base leading-relaxed mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Discover new techniques and find the joy in this beautiful community. Give yourself permission to learn, to play, and to create without judgment.
              </p>
              <Link
                href="/workshops"
                className="inline-block px-7 py-3 rounded-full text-base font-bold border-2 transition-colors"
                style={{
                  borderColor: "var(--color-teal)",
                  color: "var(--color-teal)",
                }}
              >
                Browse Workshops
              </Link>
            </div>
            {/* Image (right on desktop) */}
            <div className="md:order-2">
              <div
                className="w-full h-[220px] md:h-[320px] rounded-2xl flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "linear-gradient(135deg, #D5F0F0, #00ADB3)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                [Workshop photo: Amy teaching, students crafting]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Podcast Banner --- */}
      <section
        className="py-5 md:py-6"
        style={{ background: "var(--color-teal)" }}
      >
        <div className="px-5 md:max-w-[1200px] md:mx-auto md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-extrabold text-white">
              Listen to WorkParty — Amy&apos;s top-rated podcast
            </h3>
            <p className="text-sm text-white/80">
              Real talk on creativity, business, and building a life you love.
            </p>
          </div>
          <a
            href="https://podcasts.apple.com/us/podcast/workparty/id1404548949"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap"
            style={{
              background: "var(--color-white)",
              color: "var(--color-teal)",
            }}
          >
            Listen Now
          </a>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FEATURE SPOTLIGHT (modular zone — currently: Photobooth)          */}
      {/* ================================================================== */}
      <section>
        {/* Desktop: 50/50 split */}
        <div className="hidden md:grid grid-cols-2 min-h-[420px]">
          <div
            className="flex items-center justify-center text-sm font-semibold text-center p-6"
            style={{
              background: "linear-gradient(135deg, #FFE0D3 0%, #F5A623 50%, #F27B50 100%)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            [Photo: Photobooth setup at event, guests with props]
          </div>
          <div className="flex flex-col justify-center px-12 py-14" style={{ background: "var(--color-white)" }}>
            <span
              className="self-start inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide mb-3.5"
              style={{ background: "var(--color-orange-light)", color: "var(--color-orange)" }}
            >
              New
            </span>
            <h3 className="text-[32px] font-extrabold leading-[1.1] mb-3" style={{ color: "var(--color-text-primary)" }}>
              Amy Tangerine Photobooth
            </h3>
            <p className="text-base leading-relaxed mb-6 max-w-[420px]" style={{ color: "var(--color-text-secondary)" }}>
              Bring the Amy Tangerine experience to your next event. Custom props, backdrops, and instant prints designed to make memories.
            </p>
            <Link
              href="/photobooth"
              className="self-start inline-block px-9 py-3.5 rounded-full text-base font-bold border-2 transition-colors"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Learn more
            </Link>
          </div>
        </div>

        {/* Mobile: stacked */}
        <div className="md:hidden">
          <div
            className="w-full h-[320px] flex items-center justify-center text-xs font-semibold text-center p-4"
            style={{
              background: "linear-gradient(135deg, #FFE0D3 0%, #F5A623 50%, #F27B50 100%)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            [Photo: Photobooth in action at event]
          </div>
          <div className="px-5 py-6" style={{ background: "var(--color-white)" }}>
            <span
              className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide mb-2.5"
              style={{ background: "var(--color-orange-light)", color: "var(--color-orange)" }}
            >
              New
            </span>
            <h3 className="text-[22px] font-extrabold leading-[1.15] mb-2" style={{ color: "var(--color-text-primary)" }}>
              Amy Tangerine Photobooth
            </h3>
            <p className="text-sm leading-normal mb-4" style={{ color: "var(--color-text-secondary)" }}>
              Bring the Amy Tangerine experience to your next event. Custom props, backdrops, and instant prints designed to make memories.
            </p>
            <Link
              href="/photobooth"
              className="inline-block px-7 py-3 rounded-full text-[15px] font-bold border-2 transition-colors"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  ABOUT + NEWSLETTER                                                */}
      {/* ================================================================== */}
      <section>
        <div className="px-5 py-7 md:py-16 md:max-w-[1200px] md:mx-auto md:px-12">
        <div className="md:grid md:grid-cols-2 md:gap-10 space-y-6 md:space-y-0">
          {/* About teaser */}
          <div>
            <p
              className="text-xs md:text-[13px] font-bold uppercase tracking-[1.5px] mb-2"
              style={{ color: "var(--color-orange)" }}
            >
              Meet Amy
            </p>
            <div className="flex gap-4 md:gap-6 items-center">
              <div
                className="w-20 h-20 md:w-[100px] md:h-[100px] min-w-[80px] md:min-w-[100px] rounded-full flex items-center justify-center text-xs font-semibold"
                style={{
                  background: "linear-gradient(135deg, #FFECD2, #F5A623)",
                  color: "var(--color-orange)",
                }}
              >
                [Amy]
              </div>
              <div className="text-sm md:text-[15px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                <strong style={{ color: "var(--color-text-primary)" }}>Hi, I&apos;m Amy!</strong> I&apos;m a maker, author, mom, and your creative guide. I believe everyone is creative and has a story to tell. Everything I make — from stickers to workshops — is designed to help you craft a life you love.
                <br />
                <Link href="/about" className="inline-block mt-2 text-sm md:text-[15px] font-bold hover:underline" style={{ color: "var(--color-orange)" }}>
                  More about Amy →
                </Link>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div
            className="rounded-2xl md:rounded-2xl p-6 md:p-8"
            style={{ background: "var(--color-orange-light)" }}
          >
            <h4 className="text-lg md:text-xl font-extrabold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Stay in the loop
            </h4>
            <p className="text-[13px] md:text-sm mb-4 md:mb-5 leading-normal" style={{ color: "var(--color-text-secondary)" }}>
              New products, creative ideas, and the occasional discount. No spam, ever.
            </p>
            <NewsletterForm />
          </div>
        </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  INSTAGRAM                                                         */}
      {/* ================================================================== */}
      <section style={{ background: "var(--color-white)" }}>
      <div className="px-5 py-7 md:py-16 md:max-w-[1200px] md:mx-auto md:px-12">
        <p
          className="text-xs md:text-[13px] font-bold uppercase tracking-[1.5px] mb-1.5 md:mb-2"
          style={{ color: "var(--color-orange)" }}
        >
          @amytangerine
        </p>
        <h2
          className="text-xl md:text-[28px] font-extrabold leading-tight mb-3.5 md:mb-5"
          style={{ color: "var(--color-text-primary)" }}
        >
          On Instagram
        </h2>

        {/* Desktop: 6 columns */}
        <div className="hidden md:grid grid-cols-6 gap-2">
          {IG_GRADIENTS.map((grad, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-xs text-white font-semibold"
              style={{ background: grad }}
            >
              IG {i + 1}
            </div>
          ))}
        </div>

        {/* Mobile: 3x2 */}
        <div className="grid grid-cols-3 gap-1 md:hidden">
          {IG_GRADIENTS.map((grad, i) => (
            <div
              key={i}
              className="aspect-square rounded flex items-center justify-center text-[10px] text-white font-semibold"
              style={{ background: grad }}
            >
              IG {i + 1}
            </div>
          ))}
        </div>

        {/* Mobile-only follow link */}
        <Link
          href="https://instagram.com/amytangerine"
          className="block md:hidden text-center mt-3 text-sm font-bold"
          style={{ color: "var(--color-orange)" }}
        >
          Follow @amytangerine &gt;
        </Link>
      </div>
      </section>
    </main>
  )
}

/* -------------------------------------------------------------------------- */
/*  IG gradient placeholders                                                  */
/* -------------------------------------------------------------------------- */

const IG_GRADIENTS = [
  "linear-gradient(135deg, #FFECD2, #FCB69F)",
  "linear-gradient(135deg, #FCB69F, #F27B50)",
  "linear-gradient(135deg, #FFECD2, #F5A623)",
  "linear-gradient(135deg, #F27B50, #E06A42)",
  "linear-gradient(135deg, #D4EDDA, #A8E6CF)",
  "linear-gradient(135deg, #F5A623, #FCB69F)",
]
