import Link from "next/link"
import { formatDate, type PostMeta } from "@/lib/blog"

// Compact reverse-chron list for archive/tag/year views (denser than the card grid,
// built for browsing the long tail).
export default function PostList({ posts }: { posts: PostMeta[] }) {
  return (
    <ul
      className="divide-y"
      style={{ borderColor: "var(--color-border)" }}
    >
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="block py-5 group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-5"
          >
            <time
              className="text-[12px] uppercase tracking-[0.12em] font-semibold shrink-0 sm:w-36"
              style={{ color: "var(--color-text-secondary)" }}
              dateTime={post.date ?? undefined}
            >
              {formatDate(post.date)}
            </time>
            <span
              className="text-[17px] font-semibold leading-snug group-hover:underline underline-offset-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              {post.title}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
