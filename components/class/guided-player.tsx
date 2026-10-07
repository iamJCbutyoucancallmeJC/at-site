"use client"
// The Lightbulb-shaped guided player (observed 2026-10-07, classes-on-site-scope).
// One video in a centered circle on a quiet page; one scrubber with tick marks
// at the cues; click the circle to pause. When playback crosses a cue the
// circle slides left and the prompt column appears beside it. A cue with
// pause:true holds the video until the student types or clicks play.

import { useEffect, useMemo, useRef, useState } from "react"
import PromptBlock from "@/components/class/prompt-block"

export type PlayerCue = {
  at: number
  key: string
  headline: string
  instruction?: string
  quoteBack?: { label: string; text: string } | null
  pause?: boolean
}

type Props = {
  slug: string
  hls: string
  poster?: string
  cues?: PlayerCue[]
  answers?: Record<string, string>
  autoplay?: boolean
}

function fmt(s: number) {
  if (!Number.isFinite(s)) return "0:00"
  const m = Math.floor(s / 60), r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, "0")}`
}

export default function GuidedPlayer({ slug, hls, poster, cues = [], answers = {}, autoplay = false }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [paused, setPaused] = useState(true)
  const [active, setActive] = useState<PlayerCue | null>(null)
  const [local, setLocal] = useState<Record<string, string>>(answers)
  const held = useRef<string | null>(null)
  const sorted = useMemo(() => [...cues].sort((a, b) => a.at - b.at), [cues])

  // Attach the stream: Safari plays HLS natively, everyone else gets hls.js.
  useEffect(() => {
    const el = video.current
    if (!el) return
    let hlsInst: { destroy: () => void } | null = null
    if (el.canPlayType("application/vnd.apple.mpegurl")) {
      el.src = hls
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) { el.src = hls; return }
        const h = new Hls()
        h.loadSource(hls)
        h.attachMedia(el)
        hlsInst = h
      })
    }
    return () => { hlsInst?.destroy() }
  }, [hls])

  // Cue tracking.
  function onTime() {
    const el = video.current
    if (!el) return
    const now = el.currentTime
    setT(now)
    const cue = sorted.filter((c) => now >= c.at).at(-1) ?? null
    if (cue?.key !== active?.key) {
      setActive(cue)
      if (cue?.pause && held.current !== cue.key && !(local[cue.key] ?? "").trim()) {
        held.current = cue.key
        el.pause()
      }
    }
  }

  function toggle() {
    const el = video.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = video.current
    if (!el) return
    el.currentTime = Number(e.target.value)
  }

  const twoCol = active !== null

  return (
    <div className="w-full">
      <div className={`flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12 transition-all duration-700 ${twoCol ? "md:justify-start" : "md:justify-center"}`}>
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play" : "Pause"}
          className={`relative shrink-0 rounded-full overflow-hidden transition-all duration-700 ${twoCol ? "w-[200px] h-[200px] md:w-[260px] md:h-[260px]" : "w-[260px] h-[260px] md:w-[340px] md:h-[340px]"}`}
          style={{ background: "var(--color-gray-light)" }}
        >
          <video
            ref={video}
            poster={poster}
            playsInline
            autoPlay={autoplay}
            preload="metadata"
            onTimeUpdate={onTime}
            onLoadedMetadata={() => setDur(video.current?.duration ?? 0)}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {paused ? (
            <span className="absolute inset-0 grid place-items-center" style={{ background: "rgba(255,255,255,0.35)" }}>
              <span className="w-16 h-16 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.9)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--color-text-primary)" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </span>
          ) : null}
        </button>

        {active ? (
          <div className="w-full md:max-w-[460px]">
            <PromptBlock
              key={active.key}
              slug={slug}
              promptKey={active.key}
              headline={active.headline}
              instruction={active.instruction}
              quoteBack={active.quoteBack ?? (active.quoteBack === undefined ? null : null)}
              initial={local[active.key] ?? ""}
              compact
              onChange={(v) => setLocal((m) => ({ ...m, [active.key]: v }))}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-10 mx-auto max-w-[460px] flex items-center gap-3 text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
        <span className="w-10 text-right tabular-nums">{fmt(t)}</span>
        <div className="relative flex-1 h-6 flex items-center">
          <input
            type="range"
            min={0}
            max={dur || 0}
            step={0.1}
            value={Math.min(t, dur || 0)}
            onChange={seek}
            aria-label="Scrub"
            className="class-scrub w-full"
            style={{ ["--pct" as string]: `${dur ? (t / dur) * 100 : 0}%` }}
          />
          {dur > 0 ? sorted.map((c) => (
            <span key={c.key} className="absolute top-1 bottom-1 w-px pointer-events-none" style={{ left: `${(c.at / dur) * 100}%`, background: "var(--color-text-secondary)" }} />
          )) : null}
        </div>
        <span className="w-10 tabular-nums">{fmt(dur)}</span>
      </div>
    </div>
  )
}
