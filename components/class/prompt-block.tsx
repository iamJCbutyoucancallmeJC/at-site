"use client"
// The Lightbulb-shaped prompt column: headline, one italic line, "YOUR SAVED
// ANSWER", one underlined field that autosaves. Used beside the circle video
// (guided-player) and on its own on day pages.

import { useEffect, useRef, useState } from "react"

export type PromptBlockProps = {
  slug: string
  promptKey: string
  headline: string
  instruction?: string
  quoteBack?: { label: string; text: string } | null
  initial?: string
  placeholder?: string
  onChange?: (text: string) => void
  compact?: boolean
}

export default function PromptBlock({ slug, promptKey, headline, instruction, quoteBack, initial = "", placeholder = "Write here", onChange, compact }: PromptBlockProps) {
  const [text, setText] = useState(initial)
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const last = useRef(initial)
  const ref = useRef<HTMLTextAreaElement>(null)

  // Grow with content.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.max(el.scrollHeight, 36)}px`
  }, [text])

  async function save(value: string) {
    if (value === last.current) return
    setState("saving")
    try {
      const r = await fetch(`/classes/${slug}/answer`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: promptKey, body: value }) })
      if (!r.ok) throw new Error(String(r.status))
      last.current = value
      setState("saved")
    } catch {
      setState("error")
    }
  }

  function change(v: string) {
    setText(v)
    onChange?.(v)
    setState("idle")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => save(v), 2000)
  }

  return (
    <div className="w-full">
      <h2 className={`${compact ? "text-[26px] md:text-[32px]" : "text-[30px] md:text-[40px]"} font-bold leading-[1.05] mb-4`} style={{ color: "var(--color-text-primary)" }}>
        {headline}
      </h2>
      {instruction ? (
        <p className="text-[16px] italic leading-relaxed mb-7" style={{ color: "var(--color-text-secondary)" }}>
          {instruction}
        </p>
      ) : null}
      {quoteBack?.text ? (
        <p className="text-[15px] italic leading-relaxed mb-7" style={{ color: "var(--color-text-secondary)" }}>
          {quoteBack.label} <span className="not-italic font-medium" style={{ color: "var(--color-orange)" }}>{quoteBack.text}</span>
        </p>
      ) : null}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Your saved answer
        </span>
        <span className="text-[11px]" style={{ color: state === "error" ? "#b00020" : "var(--color-text-secondary)" }} aria-live="polite">
          {state === "saving" ? "saving" : state === "saved" ? "saved" : state === "error" ? "not saved, try again" : ""}
        </span>
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => change(e.target.value)}
        onBlur={() => { if (timer.current) clearTimeout(timer.current); save(text) }}
        placeholder={placeholder}
        rows={1}
        className="w-full bg-transparent resize-none outline-none text-[16px] leading-relaxed py-2 border-b-2"
        style={{ color: "var(--color-text-primary)", borderColor: "var(--color-orange)" }}
      />
    </div>
  )
}
