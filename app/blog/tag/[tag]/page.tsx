import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PostList from "@/components/blog/post-list"
import { getTags, getPostsByTag } from "@/lib/blog"

export function generateStaticParams() {
  return getTags().map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: tagSlug } = await params
  const { tag } = getPostsByTag(tagSlug)
  return {
    title: `${tag} | Amy Tangerine Journal`,
    description: `Amy Tangerine posts tagged ${tag}.`,
  }
}

export default async function TagArchive({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: tagSlug } = await params
  const { tag, posts } = getPostsByTag(tagSlug)
  if (posts.length === 0) notFound()

  return (
    <>
      <PageEngagementTracker page="blog-archive-tag" />
      <section className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="text-[14px] font-semibold inline-block mb-6 hover:text-[color:var(--color-ink)] transition-colors"
            style={{ color: "var(--color-orange-ink)" }}
          >
            ← The Journal
          </Link>
          <p
            className="text-[12px] uppercase tracking-[0.12em] font-bold mb-2"
            style={{ color: "var(--color-orange-ink)" }}
          >
            Topic
          </p>
          <h1
            className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em] mb-2"
            style={{ color: "var(--color-ink)" }}
          >
            {tag}
          </h1>
          <p
            className="text-[15px] mb-8"
            style={{ color: "var(--color-ink-soft)" }}
          >
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>

          <PostList posts={posts} />
        </div>
      </section>
    </>
  )
}
