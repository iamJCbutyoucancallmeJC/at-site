"use client"

// Click-to-play YouTube facade for event recap videos.
//
// Two reasons this isn't a bare iframe (compare /japan, which predates it):
//   1. The iframe (plus YouTube's ~800KB of player JS) only loads after a
//      deliberate click, so recap pages stay light.
//   2. The click is trackable: a bare iframe can't fire event_cta_click.
// Uses youtube-nocookie.com so no YouTube cookies land before consent-by-click.

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"

export default function RecapVideo({
  youtubeId,
  title,
  eventSlug,
}: {
  youtubeId: string
  title: string
  eventSlug: string
}) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("event_cta_click", {
          event_slug: eventSlug,
          cta: "recap-video",
          source_page: `at-site:/events/${eventSlug}`,
        })
        setPlaying(true)
      }}
      className="group relative block w-full overflow-hidden rounded-xl"
      style={{ aspectRatio: "16 / 9" }}
      aria-label={`Play video: ${title}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 768px"
      />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105"
        style={{ background: "var(--color-orange)" }}
      >
        {/* Play triangle */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8 5.5v13l11-6.5-11-6.5z" />
        </svg>
      </span>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] md:text-[12px] uppercase tracking-[0.15em] font-semibold text-white drop-shadow">
        Watch Amy&rsquo;s recap
      </span>
    </button>
  )
}
