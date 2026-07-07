import PageEngagementTracker from "@/components/page-engagement-tracker"
import NotFoundTracker from "@/components/not-found-tracker"
import TrackableLink from "@/components/trackable-link"
import NotFoundSearch from "@/components/not-found-search"

export const metadata = {
  title: "Page Not Found | Amy Tangerine",
}

// The genuine not_found tail (t833, verified against the t732 digest 2026-06-29) is
// retired/sold-out /shop/<handle> products: someone followed an old link or bookmark to
// a product that no longer exists. The blog/podcast tail already went to zero once the
// t812 migration shipped, so the job here is to turn a retired-product dead-end into a
// soft landing -- acknowledge it, surface the current lineup and the (now live) Journal,
// offer search -- rather than three bare buttons.

// Hardcoded hero picks: this week's top-3 live products by PDP views (analytics, GA4
// 532481266). Update when the lineup shifts; intentionally not a live fetch so the 404
// route stays static and dependency-free.
const HERO_PRODUCTS = [
  { handle: "junkjournalstickerbook", title: "Junk Journal Sticker Book" },
  { handle: "washistickerbook-preorder", title: "Washi Sticker Book" },
  { handle: "sticker-bundle-little-craft-fest", title: "Little Craft Fest Sticker Bundle" },
]

export default function NotFound() {
  return (
    <>
      <PageEngagementTracker page="not-found" />
      <NotFoundTracker />

      <section
        className="py-16 md:py-24 px-6 md:px-16 text-center"
        style={{ background: "var(--color-gray-light)" }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
          style={{ color: "var(--color-orange)" }}
        >
          404
        </p>
        <h1
          className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-5"
          style={{ color: "var(--color-text-primary)" }}
        >
          We can&rsquo;t find that page.
        </h1>
        <p
          className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The link may have changed, or a product may have sold out or retired since you
          saved it. Here&rsquo;s the current lineup, or search a decade of the Journal.
        </p>

        <div className="max-w-md mx-auto">
          <NotFoundSearch />
        </div>
      </section>

      {/* Current lineup: the soft landing for retired-product visitors. */}
      <section className="py-14 md:py-20 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[13px] uppercase tracking-[0.16em] font-semibold mb-6 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Shop the current collection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
            {HERO_PRODUCTS.map((p) => (
              <TrackableLink
                key={p.handle}
                href={`/shop/${p.handle}`}
                event="nav_click"
                eventData={{ link_text: p.title, source_page: "not-found" }}
                className="block px-6 py-8 rounded-lg border text-center transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: "var(--color-gray-light)",
                  background: "var(--color-orange-light)",
                }}
              >
                <span
                  className="text-[15px] md:text-[16px] font-semibold leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {p.title}
                </span>
                <span
                  className="block mt-3 text-[12px] uppercase tracking-[0.12em] font-semibold"
                  style={{ color: "var(--color-orange)" }}
                >
                  View &rarr;
                </span>
              </TrackableLink>
            ))}
          </div>

          {/* The Journal is back (t812) -- worth surfacing precisely because old blog
              links now resolve to real posts again. */}
          <div
            className="rounded-lg px-6 py-7 md:px-10 md:py-9 text-center mb-10"
            style={{ background: "var(--color-teal)" }}
          >
            <p className="text-[15px] md:text-[18px] font-semibold text-white mb-3">
              Looking for the blog? The Journal is back.
            </p>
            <TrackableLink
              href="/blog"
              event="nav_click"
              eventData={{ link_text: "Read the Journal", source_page: "not-found" }}
              className="inline-block px-7 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] bg-white transition-all duration-200 hover:opacity-80"
              style={{ color: "var(--color-teal)" }}
            >
              Read the Journal
            </TrackableLink>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <TrackableLink
              href="/shop"
              event="nav_click"
              eventData={{ link_text: "All Products", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
            >
              All Products
            </TrackableLink>
            <TrackableLink
              href="/happy-mail"
              event="nav_click"
              eventData={{ link_text: "Happy Mail", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
            >
              Happy Mail
            </TrackableLink>
            <TrackableLink
              href="/"
              event="nav_click"
              eventData={{ link_text: "Home", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
            >
              Home
            </TrackableLink>
          </div>
        </div>
      </section>
    </>
  )
}
