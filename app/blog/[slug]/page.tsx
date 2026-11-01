import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import BlogLinkTracker from "@/components/blog-link-tracker"
import KeepUpCard from "@/components/keep-up-card"
import FromTheJournal from "@/components/blog/from-the-journal"
import {
  getListablePosts,
  getDraftPosts,
  getPostBySlug,
  formatDate,
  tagToSlug,
  isArchivalPost,
} from "@/lib/blog"

// Static at build time. Built from the listable set (redirect-tier ephemera is
// excluded -- those 301 to /blog in next.config, so no page is generated for them)
// PLUS unlisted drafts, so a draft has a real preview URL on the branch deploy.
// New posts (added to content/blog) need a rebuild to appear; dynamicParams stays
// default (true) so a slug not in the build list renders on demand.
export async function generateStaticParams() {
  return [...getListablePosts(), ...getDraftPosts()].map((p) => ({ slug: p.slug }))
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
    // Drafts are reachable by URL for the voice pass but must not be indexed.
    ...(post.draft ? { robots: { index: false, follow: false } } : {}),
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

      {/* Post template (Phase 4): the 42rem measure, h1 40px (32 on phones), body
          16px / 1.6 in ink, images 12px radius; .blog-button stays the one
          shadow-cta button. */}
      <article className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-[42rem] mx-auto">
          <Link
            href="/blog"
            className="text-[14px] font-semibold inline-block mb-8 hover:text-[color:var(--color-ink)] transition-colors"
            style={{ color: "var(--color-orange-ink)" }}
          >
            ← The Journal
          </Link>

          {/* Draft banner: the post-automation pipeline wrote this post but no one
              has approved it yet. Unlisted, noindex; approve.py clears the flag. */}
          {post.draft && (
            <aside
              className="mb-8 rounded-xl px-5 py-3 text-[14px] font-semibold"
              style={{
                background: "var(--color-paper)",
                color: "var(--color-ink)",
                borderLeft: "3px solid var(--color-orange-ink)",
              }}
            >
              Draft preview. Not published, not listed.
            </aside>
          )}

          <header className="mb-10">
            <h1
              className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em]"
              style={{ color: "var(--color-ink)" }}
            >
              {post.title}
            </h1>
            {/* Byline line: the date only. No author name, because some archive posts are
                by Amy's design team and the store records no author. */}
            {post.date && (
              <p className="mt-3 text-[14px]" style={{ color: "var(--color-ink-soft)" }}>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
            )}
          </header>

          {/* Archival notice: older posts (giveaways, dated collabs, link-rot) get a
              warm "this is from the archive" banner that resets expectations and
              routes the reader forward, rather than reading as current. */}
          {isArchivalPost(post.date) && (
            <aside
              className="mb-10 rounded-xl px-5 py-4 text-[14px] leading-relaxed"
              style={{
                background: "var(--color-paper)",
                color: "var(--color-ink-soft)",
                borderLeft: "3px solid var(--color-orange-ink)",
              }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                From the archive.
              </span>{" "}
              This post is from {post.date?.slice(0, 4)}, so some links, products, or
              offers may have moved on.{" "}
              <Link
                href="/blog"
                className="font-semibold underline underline-offset-2"
                style={{ color: "var(--color-orange-ink)" }}
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
            // Legacy images with no alt get alt="" so a screen reader skips them
            // instead of reading the file name (Lighthouse image-alt, Phase 4).
            dangerouslySetInnerHTML={{ __html: post.body.replace(/<img(?![^>]*\salt=)/g, '<img alt=""') }}
          />
          <BlogLinkTracker slug={post.slug} />

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
                    className="text-[13px] px-3 py-1.5 rounded-lg border border-[color:var(--color-paper)] hover:border-[color:var(--color-ink)] transition-colors"
                    style={{
                      background: "var(--color-paper)",
                      color: "var(--color-ink-soft)",
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
      {/* Email capture (t1092, D3 inline block) -- renders null until
          NEXT_PUBLIC_CAPTURE_BLOCKS=1 (Amy aesthetic pass gate) */}
      {/* The module the homepage carries too, minus this post (Phase 4). */}
      {!post.draft && (
        <section className="px-4 md:px-10 py-12 md:py-16 border-t" style={{ borderColor: "var(--color-border)" }}>
          <div className="max-w-6xl mx-auto">
            <FromTheJournal page="blog-post" exclude={post.slug} />
          </div>
        </section>
      )}
      <KeepUpCard sourcePage="blog" gated />
    </>
  )
}
