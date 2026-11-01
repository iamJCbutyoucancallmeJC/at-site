import Link from "next/link"
import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PostCard from "@/components/blog/post-card"
import FeaturedTiles from "@/components/blog/featured-tiles"
import SectionHeader from "@/components/section-header"
import {
  getDefaultFeed,
  getFeatured,
  getStartHere,
  getYears,
  getTags,
  POSTS_PER_PAGE,
} from "@/lib/blog"

export const metadata = {
  title: "Journal | Amy Tangerine",
  description:
    "Stories on creative journaling, scrapbooking, travel, and crafting a life you love, from Amy Tangerine.",
  openGraph: {
    title: "Journal | Amy Tangerine",
    description:
      "Stories on creative journaling, scrapbooking, travel, and crafting a life you love, from Amy Tangerine.",
    url: "https://amytangerine.com/blog",
    type: "website",
  },
}

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const feed = getDefaultFeed()
  const featured = getFeatured()
  const startHere = getStartHere()
  const years = getYears()
  const tags = getTags().slice(0, 18)

  const page = Math.max(1, Number(pageParam) || 1)
  const totalPages = Math.max(1, Math.ceil(feed.length / POSTS_PER_PAGE))
  const start = (page - 1) * POSTS_PER_PAGE
  const pagePosts = feed.slice(start, start + POSTS_PER_PAGE)

  return (
    <>
      <PageEngagementTracker page="blog-index" />

      {/* ── Header ── */}
      <section className="relative overflow-hidden flex items-center min-h-[340px] md:min-h-[440px] py-14 md:py-20 px-6 md:px-16">
        {/* Hero photo — placeholder pulled from the archive; swap for Amy's chosen shot */}
        <Image
          src="/images/blog/journal-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Left-anchored white scrim keeps the dark headline legible over the photo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.80) 42%, rgba(255,255,255,0.35) 100%)",
          }}
        />
        <div className="max-w-5xl mx-auto w-full relative">
          <p
            className="text-[12px] uppercase tracking-[0.12em] font-bold mb-3"
            style={{ color: "var(--color-orange-ink)" }}
          >
            The Journal
          </p>
          <h1
            className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em] mb-4"
            style={{ color: "var(--color-ink)" }}
          >
            Crafting a life,
            <br />
            one story at a time.
          </h1>
          <p
            className="text-[18px] leading-relaxed max-w-2xl"
            style={{ color: "var(--color-ink-soft)" }}
          >
            A decade of creative journaling, scrapbooking, travel, and behind-the-scenes
            from the studio. {" "}
            <Link
              href="/blog/search"
              className="font-semibold underline underline-offset-4"
              style={{ color: "var(--color-orange-ink)" }}
            >
              Search the full archive
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── Featured tiles (Amy's curated merchandising picks) ── */}
      <FeaturedTiles posts={featured} />

      {/* ── Start here ── */}
      {startHere.length > 0 && (
        <section
          className="py-12 md:py-16 px-4 md:px-10 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="max-w-6xl mx-auto">
            <SectionHeader eyebrow="Start here" title="Reader favorites" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
              {startHere.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent feed ── */}
      <section className="py-12 md:py-16 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <SectionHeader title="Latest posts" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
            {pagePosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-14">
              {page > 1 ? (
                <Link
                  href={page - 1 === 1 ? "/blog" : `/blog?page=${page - 1}`}
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--color-orange-ink)" }}
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span
                className="text-[13px]"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--color-orange-ink)" }}
                >
                  Older →
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Archive: by year + by tag ── */}
      {/* Archive doors on paper (Phase 4: the gray band and its caps labels are gone). */}
      <section
        className="py-12 md:py-16 px-4 md:px-10 border-t"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-paper)",
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <SectionHeader title="Browse by year" />
            <div className="flex flex-wrap gap-2.5">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/blog/archive/${y}`}
                  className="text-[14px] px-3.5 py-1.5 rounded-lg border border-[color:var(--color-border)] hover:border-[color:var(--color-ink)] transition-colors"
                  style={{
                    background: "var(--color-white)",
                    color: "var(--color-ink)",
                  }}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader title="Popular topics" />
            <div className="flex flex-wrap gap-2.5">
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog/tag/${t.slug}`}
                  className="text-[14px] px-3.5 py-1.5 rounded-lg border border-[color:var(--color-border)] hover:border-[color:var(--color-ink)] transition-colors"
                  style={{
                    background: "var(--color-white)",
                    color: "var(--color-ink)",
                  }}
                >
                  {t.tag}{" "}
                  <span style={{ color: "var(--color-ink-soft)" }}>
                    {t.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
