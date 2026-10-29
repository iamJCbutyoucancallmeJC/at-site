"use client"
// A plain landscape player for a longer "here is mine" demo under a day's
// steps (Amy's 2023 page videos, 10/14). Native controls; hls.js where MSE
// exists so the Bunny directory token rides on every child request, the
// signed MP4 elsewhere. No cues, no field: this one is just watched.

import { useEffect, useRef } from "react"

// captions: a same-origin WebVTT file, shown by default (WCAG 1.2.2; most phone viewers start
// with the sound off). label: the accessible name of the video.
type Props = { hls: string; hlsQuery?: string; mp4?: string; poster?: string; caption?: string; captions?: string; label?: string }

export default function DemoPlayer({ hls, hlsQuery = "", mp4, poster, caption, captions, label }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const hlsPath = hls.split("?")[0]
  const latest = useRef({ hls, hlsQuery, mp4 })
  latest.current = { hls, hlsQuery, mp4 }
  useEffect(() => {
    const el = video.current
    if (!el) return
    const { hls, hlsQuery, mp4 } = latest.current
    let inst: { destroy: () => void } | null = null
    let cancelled = false
    import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return
      if (!Hls.isSupported()) { el.src = mp4 || hls; return }
      const h = new Hls({
        xhrSetup: (xhr, url) => {
          if (hlsQuery && !url.includes("token=")) xhr.open("GET", url + (url.includes("?") ? "&" : "?") + hlsQuery, true)
        },
      })
      h.loadSource(hls)
      h.attachMedia(el)
      inst = h
    })
    return () => { cancelled = true; inst?.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hlsPath])

  return (
    <figure className="w-full">
      <div className="w-full overflow-hidden rounded-sm" style={{ background: "var(--color-gray-light)" }}>
        <video ref={video} poster={poster} controls playsInline preload="metadata" aria-label={label} className="w-full h-auto block">
          {captions ? <track kind="captions" src={captions} srcLang="en" label="English" default /> : null}
        </video>
      </div>
      {caption ? (
        <figcaption className="mt-3 text-[13px] italic" style={{ color: "var(--color-text-secondary)" }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
