import PageEngagementTracker from "@/components/page-engagement-tracker"
import NotFoundTracker from "@/components/not-found-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "Page Not Found | Amy Tangerine",
}

export default function NotFound() {
  return (
    <>
      <PageEngagementTracker page="not-found" />
      <NotFoundTracker />

      <section
        className="py-20 md:py-28 px-6 md:px-16 text-center"
        style={{ background: "var(--color-gray-light)" }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
          style={{ color: "var(--color-orange)" }}
        >
          404
        </p>
        <h1
          className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight mb-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          We can&rsquo;t find that page.
        </h1>
        <p
          className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The link may have changed, the page may have moved, or a product may
          have sold out or retired. Try one of these instead.
        </p>
      </section>

      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <TrackableLink
              href="/shop"
              event="nav_click"
              eventData={{ link_text: "Shop", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Shop
            </TrackableLink>
            <TrackableLink
              href="/happy-mail"
              event="nav_click"
              eventData={{ link_text: "Happy Mail", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Happy Mail
            </TrackableLink>
            <TrackableLink
              href="/"
              event="nav_click"
              eventData={{ link_text: "Home", source_page: "not-found" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Home
            </TrackableLink>
          </div>
        </div>
      </section>
    </>
  )
}
