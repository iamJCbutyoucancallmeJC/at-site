import Link from "next/link"
import Image from "next/image"
import { formatDate, type FeaturedPost } from "@/lib/blog"

// Amy-curated merchandising module for the top of the Journal. A small set of
// posts she's proud of, given a richer image-forward tile treatment than the feed
// cards. Data is content/blog/_featured.json (slug + optional custom label/blurb +
// optional cover image override). Hidden entirely when the file is absent.
//
// Layout: first tile is a large hero (spans 2 cols on desktop); the rest are a row
// of standard tiles beneath it. A 5-post set reads as 1 hero + 4 supporting.
export default function FeaturedTiles({ posts }: { posts: FeaturedPost[] }) {
  if (posts.length === 0) return null
  const [hero, ...rest] = posts

  return (
    <section
      className="py-12 md:py-16 px-6 md:px-16 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto">
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-8"
          style={{ color: "var(--color-teal)" }}
        >
          Featured · Amy&rsquo;s picks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
          {/* Hero tile */}
          <Tile post={hero} hero />
          {/* Supporting tiles: a 2x2 grid filling the second column block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-7">
            {rest.slice(0, 4).map((p) => (
              <Tile key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Tile({ post, hero = false }: { post: FeaturedPost; hero?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block relative overflow-hidden rounded-2xl"
      style={{ background: "var(--color-gray-light)" }}
    >
      <div
        className={`relative w-full ${hero ? "aspect-[16/10] md:aspect-[16/11]" : "aspect-[4/3]"}`}
      >
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes={hero ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--color-orange-light), var(--color-teal))",
            }}
          />
        )}
        {/* Readability scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          {post.label && (
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-white/85 mb-1.5">
              {post.label}
            </span>
          )}
          <h3
            className={`font-bold text-white leading-snug ${
              hero ? "text-[22px] md:text-[28px]" : "text-[16px] md:text-[18px]"
            }`}
          >
            {post.title}
          </h3>
          {hero && post.blurb && (
            <p className="text-[14px] text-white/85 mt-2 leading-relaxed line-clamp-2 max-w-md">
              {post.blurb}
            </p>
          )}
          <span className="text-[11px] text-white/70 mt-2">
            {formatDate(post.date)}
          </span>
        </div>
      </div>
    </Link>
  )
}
