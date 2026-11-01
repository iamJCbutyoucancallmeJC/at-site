import Link from "next/link"
import Image from "next/image"
import TrackableLink from "@/components/trackable-link"
import { formatDate, getPostCover, type PostMeta } from "@/lib/blog"
import { shopifyImageUrl, isShopifyCdn } from "@/lib/shopify-image-loader"

// The one Journal card (design finish, Phase 4 · 2026-11-01): Reader favorites,
// Latest posts and the "From the Journal" module on the homepage and under a post
// all render this. Photograph (the post's first image, 4:3, 12px radius, lifts on
// hover), date in caption ink-soft, title in the h4 style, two lines of excerpt,
// tag chips at 13px. The card was image-free while post images sat on the
// Squarespace CDN; t811 re-hosted them on Shopify, so the photograph is back.
// `source` turns the link into a tracked one (section_link_click) for pages
// outside the Journal.
export default function PostCard({ post, source }: { post: PostMeta; source?: { page: string; section: string } }) {
  const cover = getPostCover(post.slug)
  const body = (
    <>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3 transition-[transform,box-shadow] duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lift"
        style={{ background: "var(--color-paper)" }}
      >
        {cover ? (
          <Image
            src={shopifyImageUrl(cover, 640)}
            unoptimized={isShopifyCdn(cover)}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          // The two feed posts with no photograph: the logo on paper, not an empty box.
          <Image
            src="/images/amy-tangerine-logo.png"
            alt=""
            fill
            className="object-contain p-[18%]"
            sizes="(max-width: 768px) 60vw, 20vw"
          />
        )}
      </div>
      <time
        className="text-[13px]"
        style={{ color: "var(--color-ink-soft)" }}
        dateTime={post.date ?? undefined}
      >
        {formatDate(post.date)}
      </time>
      <h3
        className="text-[16px] md:text-[18px] font-semibold leading-[1.3] mt-1 mb-1.5 group-hover:underline decoration-2 underline-offset-4"
        style={{ color: "var(--color-ink)" }}
      >
        {post.title}
      </h3>
      <p
        className="text-[14px] leading-relaxed line-clamp-2"
        style={{ color: "var(--color-ink-soft)" }}
      >
        {post.excerpt}
      </p>
    </>
  )

  return (
    <article className="group min-w-0">
      {source ? (
        <TrackableLink
          href={`/blog/${post.slug}`}
          event="section_link_click"
          eventData={{ section: source.section, post: post.slug, page: source.page }}
          className="block"
        >
          {body}
        </TrackableLink>
      ) : (
        <Link href={`/blog/${post.slug}`} className="block">
          {body}
        </Link>
      )}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[13px] px-2.5 py-1 rounded-lg"
              style={{
                background: "var(--color-paper)",
                color: "var(--color-ink-soft)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
