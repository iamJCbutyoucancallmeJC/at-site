import SectionHeader from "@/components/section-header"
import PostCard from "@/components/blog/post-card"
import { getLatestPosts } from "@/lib/blog"

// "From the Journal" (design finish, Phase 4 · 2026-11-01): the three newest posts
// in the Journal's own card, with See all. Shared by the homepage (after New
// arrivals) and the post template (under the post, minus the one being read).
// The caller owns the section padding and width.
export default function FromTheJournal({ page, exclude }: { page: string; exclude?: string }) {
  const posts = getLatestPosts(3, exclude)
  if (posts.length === 0) return null
  return (
    <>
      <SectionHeader title="From the Journal" link={{ href: "/blog", label: "See all" }} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} source={{ page, section: "from-the-journal" }} />
        ))}
      </div>
    </>
  )
}
