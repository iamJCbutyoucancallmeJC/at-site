import PageEngagementTracker from "@/components/page-engagement-tracker"
import NotFoundTracker from "@/components/not-found-tracker"
import TrackableLink from "@/components/trackable-link"
import { EMPTY_STATES } from "@/lib/shop-copy"

export const metadata = {
  title: "Page Not Found | Amy Tangerine",
}

// The 404 (design finish, Phase 5, 2026-11-20): one sentence in Amy's voice and one
// door. The genuine not_found tail (t833) is retired /shop/<handle> products, so the
// door is the shop. Phase 5 dropped three things the old page carried: a hardcoded
// strip of three products (picked by June page views, two of them since retired),
// a Journal search box that discarded the query and opened a blank search page, and
// a teal band. The blog tail went to zero once the t812 migration shipped.
const copy = EMPTY_STATES.notFound

export default function NotFound() {
  return (
    <>
      <PageEngagementTracker page="not-found" />
      <NotFoundTracker />

      <section className="py-20 md:py-28 px-6 md:px-16 text-center" style={{ background: "var(--color-paper)" }}>
        <p className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-4" style={{ color: "var(--color-orange-ink)" }}>
          {copy.eyebrow}
        </p>
        <h1 className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-5" style={{ color: "var(--color-ink)" }}>
          {copy.title}
        </h1>
        <p className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto mb-8" style={{ color: "var(--color-ink-soft)" }}>
          {copy.line}
        </p>
        <TrackableLink
          href={copy.door.href}
          event="nav_click"
          eventData={{ link_text: copy.door.label, source_page: "not-found" }}
          className="cta-primary"
        >
          {copy.door.label}
        </TrackableLink>
      </section>
    </>
  )
}
