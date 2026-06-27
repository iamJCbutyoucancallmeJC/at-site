import Link from "next/link"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import BlogSearch, { type SearchEntry } from "@/components/blog/blog-search"
import { getAllPostsMeta } from "@/lib/blog"

export const metadata = {
  title: "Search the Journal | Amy Tangerine",
  description: "Search a decade of Amy Tangerine blog posts.",
}

export default function BlogSearchPage() {
  // Build-time search index: title + excerpt + tags only (no bodies), so the
  // payload stays small even across the full archive. Static, $0, no service.
  const index: SearchEntry[] = getAllPostsMeta().map((p) => ({
    slug: p.slug,
    title: p.title,
    date: p.date,
    excerpt: p.excerpt,
    tags: p.tags,
    haystack: `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase(),
  }))

  return (
    <>
      <PageEngagementTracker page="blog-search" />
      <section className="px-6 md:px-16 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-[13px] font-semibold inline-block mb-6"
            style={{ color: "var(--color-orange)" }}
          >
            ← The Journal
          </Link>
          <h1
            className="text-[32px] md:text-[44px] font-bold tracking-tight mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Search the Journal
          </h1>
          <BlogSearch index={index} />
        </div>
      </section>
    </>
  )
}
