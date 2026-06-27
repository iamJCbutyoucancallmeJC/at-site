"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

// Lightweight client-side search over a build-time index (per PRD: static index,
// $0, no service). The index is title+excerpt+tags per post, shipped as a prop.
// Token-AND scoring with title/tag weighting -- enough for a ~1,300-post archive
// without pulling in a search library. Swappable for Pagefind/Orama later if the
// archive grows or we want stemming.

export type SearchEntry = {
  slug: string
  title: string
  date: string | null
  excerpt: string
  tags: string[]
  haystack: string // precomputed lowercased title + excerpt + tags
}

function score(entry: SearchEntry, terms: string[]): number {
  const title = entry.title.toLowerCase()
  const tags = entry.tags.join(" ").toLowerCase()
  let s = 0
  for (const t of terms) {
    if (!entry.haystack.includes(t)) return 0 // AND across terms
    if (title.includes(t)) s += 3
    if (tags.includes(t)) s += 2
    s += 1
  }
  return s
}

export default function BlogSearch({ index }: { index: SearchEntry[] }) {
  const [q, setQ] = useState("")

  const results = useMemo(() => {
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return []
    return index
      .map((e) => ({ e, s: score(e, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || (b.e.date ?? "").localeCompare(a.e.date ?? ""))
      .slice(0, 40)
      .map((r) => r.e)
  }, [q, index])

  return (
    <div>
      <div className="relative max-w-xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--color-text-secondary)" }}
          aria-hidden
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${index.length.toLocaleString()} posts…`}
          aria-label="Search the blog"
          className="w-full pl-11 pr-4 py-3 rounded-full text-[15px] outline-none focus:ring-2 transition"
          style={{
            background: "var(--color-white)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      {q.trim().length > 0 && (
        <div className="mt-6">
          <p
            className="text-[13px] mb-4"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {results.length === 0
              ? "No posts found."
              : `${results.length}${results.length === 40 ? "+" : ""} result${results.length === 1 ? "" : "s"}`}
          </p>
          <ul className="space-y-5">
            {results.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="block group">
                  <span
                    className="text-[11px] uppercase tracking-[0.15em] font-semibold"
                    style={{ color: "var(--color-orange)" }}
                  >
                    {r.date ?? ""}
                  </span>
                  <h3
                    className="text-[17px] font-semibold leading-snug group-hover:underline underline-offset-4"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {r.title}
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed line-clamp-2 mt-1"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {r.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
