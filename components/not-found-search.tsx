'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

// Lightweight search affordance for the 404. The only live full-text search on the
// site is the Journal's (build-time index over post titles/excerpts/tags); it does not
// read a URL query param, so we route the user there rather than deep-linking a query.
// Product hunters are served by the hero strip + "All Products" on the 404 itself.
export default function NotFoundSearch() {
  const router = useRouter()
  const [q, setQ] = useState("")

  function go(e: React.FormEvent) {
    e.preventDefault()
    trackEvent("nav_click", {
      link_text: "404 search",
      source_page: "not-found",
      query: q.slice(0, 80),
    })
    router.push("/blog/search")
  }

  return (
    <form onSubmit={go} className="flex gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the Journal…"
        aria-label="Search the Journal"
        className="flex-1 px-4 py-3 rounded-full text-[14px] border outline-none focus:ring-2"
        style={{
          borderColor: "var(--color-gray-light)",
          background: "white",
          color: "var(--color-text-primary)",
        }}
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:opacity-80"
        style={{ background: "var(--color-orange)" }}
      >
        Search
      </button>
    </form>
  )
}
