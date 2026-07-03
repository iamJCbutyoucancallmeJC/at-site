import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import {
  getListablePosts,
  getPostBySlug,
  formatDate,
  tagToSlug,
  isArchivalPost,
} from "@/lib/blog"

// Static at build time. Built from the listable set (redirect-tier ephemera is
// excluded -- those 301 to /blog in next.config, so no page is generated for them).
// New posts (added to content/blog) need a rebuild to appear; dynamicParams stays
// default (true) so a slug not in the build list renders on demand.
export async function generateStaticParams() {
  return getListablePosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  const description = post.excerpt.slice(0, 155)
  return {
    title: `${post.title} | Amy Tangerine`,
    description,
    openGraph: {
      title: post.title,
      description,
      url: `https://amytangerine.com/blog/${post.slug}`,
      type: "article",
      ...(post.datePublishedISO
        ? { publishedTime: post.datePublishedISO }
        : {}),
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <PageEngagementTracker page="blog-post" />

      <article className="px-6 md:px-16 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/blog"
            className="text-[13px] font-semibold inline-block mb-8"
            style={{ color: "var(--color-orange)" }}
          >
            ← The Journal
          </Link>

          <header className="mb-10">
            <time
              className="text-[12px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: "var(--color-orange)" }}
              dateTime={post.date ?? undefined}
            >
              {formatDate(post.date)}
            </time>
            <h1
              className="text-[32px] md:text-[44px] font-bold leading-[1.1] tracking-tight mt-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              {post.title}
            </h1>
          </header>

          {/* Archival notice: older posts (giveaways, dated collabs, link-rot) get a
              warm "this is from the archive" banner that resets expectations and
              routes the reader forward, rather than reading as current. */}
          {isArchivalPost(post.date) && (
            <aside
              className="mb-10 rounded-xl px-5 py-4 text-[14px] leading-relaxed"
              style={{
                background: "var(--color-gray-light)",
                color: "var(--color-text-secondary)",
                borderLeft: "3px solid var(--color-orange)",
              }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                From the archive.
              </span>{" "}
              This post is from {post.date?.slice(0, 4)}, so some links, products, or
              offers may have moved on.{" "}
              <Link
                href="/blog"
                className="font-semibold underline underline-offset-2"
                style={{ color: "var(--color-orange)" }}
              >
                See what&rsquo;s new in the Journal →
              </Link>
            </aside>
          )}

          {/* Legacy body HTML, sanitized at extraction time (Squarespace wrappers
              stripped, semantic tags kept). Images still point at the live
              Squarespace CDN; t811 re-hosts them. */}
          <div
            className="blog-body"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {post.tags.length > 0 && (
            <footer
              className="mt-12 pt-8 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex flex-wrap gap-2.5">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tagToSlug(tag)}`}
                    className="text-[13px] px-3 py-1.5 rounded-full transition hover:opacity-80"
                    style={{
                      background: "var(--color-gray-light)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </footer>
          )}
        </div>
      </article>
    </>
  )
}
