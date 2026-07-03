import Link from "next/link"
import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PostCard from "@/components/blog/post-card"
import FeaturedTiles from "@/components/blog/featured-tiles"
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
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            The Journal
          </p>
          <h1
            className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Crafting a life,
            <br />
            one story at a time.
          </h1>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed max-w-2xl"
            style={{ color: "var(--color-text-secondary)" }}
          >
            A decade of creative journaling, scrapbooking, travel, and behind-the-scenes
            from the studio. {" "}
            <Link
              href="/blog/search"
              className="font-semibold underline underline-offset-4"
              style={{ color: "var(--color-orange)" }}
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
          className="py-12 md:py-16 px-6 md:px-16 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="max-w-5xl mx-auto">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-8"
              style={{ color: "var(--color-teal)" }}
            >
              Start here · Reader favorites
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
              {startHere.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Recent feed ── */}
      <section className="py-12 md:py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-8"
            style={{ color: "var(--color-orange)" }}
          >
            Latest posts
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12">
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
                  style={{ color: "var(--color-orange)" }}
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <span
                className="text-[13px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--color-orange)" }}
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
      <section
        className="py-12 md:py-16 px-6 md:px-16 border-t"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-gray-light)",
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Browse by year
            </p>
            <div className="flex flex-wrap gap-2.5">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/blog/archive/${y}`}
                  className="text-[14px] px-3.5 py-1.5 rounded-full transition hover:opacity-80"
                  style={{
                    background: "var(--color-white)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Popular topics
            </p>
            <div className="flex flex-wrap gap-2.5">
              {tags.map((t) => (
                <Link
                  key={t.slug}
                  href={`/blog/tag/${t.slug}`}
                  className="text-[14px] px-3.5 py-1.5 rounded-full transition hover:opacity-80"
                  style={{
                    background: "var(--color-white)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t.tag}{" "}
                  <span style={{ color: "var(--color-text-secondary)" }}>
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
