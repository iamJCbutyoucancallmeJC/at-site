import Link from "next/link"
import Image from "next/image"
import SectionHeader from "@/components/section-header"
import { formatDate, isNewPost, type FeaturedPost } from "@/lib/blog"

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
      className="py-12 md:py-16 px-4 md:px-10 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* A real h2 (Phase 4): the caps label left the tiles' h3s with no h2 above
            them, which is what held /blog at Lighthouse 98. */}
        <SectionHeader eyebrow="Featured" title="Amy’s picks" />

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
      className="group block relative overflow-hidden rounded-xl h-full"
      style={{ background: "var(--color-paper)" }}
    >
      <div
        // The hero fills its grid row on desktop (the 2x2 beside it sets the height),
        // so no ground shows under the photograph.
        className={`relative w-full ${hero ? "aspect-square md:aspect-auto md:h-full md:min-h-[360px]" : "aspect-[4/3]"}`}
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
        {/* Readability scrim — matches the homepage Feature Spotlight (stronger gradient + text drop-shadow) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        {/* "New" badge: shows for NEW_POST_DAYS after the post date, then drops off on its own. */}
        {isNewPost(post.date) && (
          // The system's NEW badge (Phase 4): 11px ink on orange-tint, 8px radius.
          <span
            className="absolute top-4 left-4 md:top-5 md:left-5 z-10 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] leading-none"
            style={{ background: "var(--color-orange-tint)", color: "var(--color-ink)" }}
          >
            New
          </span>
        )}
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          {post.label && (
            <span className="text-[12px] uppercase tracking-[0.12em] font-bold text-white mb-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {post.label}
            </span>
          )}
          <h3
            className={`font-bold text-white leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
              hero ? "text-[22px] md:text-[28px]" : "text-[18px]"
            }`}
          >
            {post.title}
          </h3>
          {hero && post.blurb && (
            <p className="text-[14px] text-white/90 mt-2 leading-relaxed line-clamp-2 max-w-md drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {post.blurb}
            </p>
          )}
          <span className="text-[13px] text-white/90 mt-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {formatDate(post.date)}
          </span>
        </div>
      </div>
    </Link>
  )
}
