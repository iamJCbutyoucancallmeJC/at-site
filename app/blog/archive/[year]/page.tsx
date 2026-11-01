import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PostList from "@/components/blog/post-list"
import { getYears, getPostsByYear } from "@/lib/blog"

export function generateStaticParams() {
  return getYears().map((year) => ({ year }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params
  return {
    title: `${year} archive | Amy Tangerine Journal`,
    description: `All Amy Tangerine posts from ${year}.`,
  }
}

export default async function YearArchive({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const { year } = await params
  const posts = getPostsByYear(year)
  if (posts.length === 0) notFound()
  const years = getYears()

  return (
    <>
      <PageEngagementTracker page="blog-archive-year" />
      <section className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-[14px] font-semibold inline-block mb-6 hover:text-[color:var(--color-ink)] transition-colors"
            style={{ color: "var(--color-orange-ink)" }}
          >
            ← The Journal
          </Link>
          <h1
            className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em] mb-2"
            style={{ color: "var(--color-ink)" }}
          >
            {year}
          </h1>
          <p
            className="text-[15px] mb-8"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>

          <PostList posts={posts} />

          <nav className="mt-12 flex flex-wrap gap-2.5">
            {years.map((y) => (
              <Link
                key={y}
                href={`/blog/archive/${y}`}
                aria-current={y === year ? "page" : undefined}
                className="text-[14px] px-3.5 py-1.5 rounded-lg border hover:border-[color:var(--color-ink)] transition-colors"
                style={{
                  // Selected chip = orange-tint with ink (the system's chip state); the rest on paper.
                  background: y === year ? "var(--color-orange-tint)" : "var(--color-paper)",
                  borderColor: y === year ? "var(--color-orange-tint)" : "var(--color-paper)",
                  color: "var(--color-ink)",
                  fontWeight: y === year ? 700 : 400,
                }}
              >
                {y}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </>
  )
}
