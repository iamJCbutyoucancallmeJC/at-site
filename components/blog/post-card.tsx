import Link from "next/link"
import { formatDate, type PostMeta } from "@/lib/blog"

// One post in a feed/archive grid. Image-free by design for the shell: legacy
// post images live on the Squarespace CDN and re-hosting is t811's job, so the
// card leans on title + date + excerpt (fast, no broken-image risk on the index).
export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <time
          className="text-[11px] uppercase tracking-[0.18em] font-semibold"
          style={{ color: "var(--color-orange)" }}
          dateTime={post.date ?? undefined}
        >
          {formatDate(post.date)}
        </time>
        <h3
          className="text-[20px] md:text-[22px] font-bold leading-snug mt-2 mb-2 group-hover:underline decoration-2 underline-offset-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          {post.title}
        </h3>
        <p
          className="text-[15px] leading-relaxed line-clamp-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {post.excerpt}
        </p>
      </Link>
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{
                background: "var(--color-gray-light)",
                color: "var(--color-text-secondary)",
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
