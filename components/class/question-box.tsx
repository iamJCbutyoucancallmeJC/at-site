"use client"
// The question box at the bottom of the class home (t1651). Same shape as the
// prompt block (headline, italic line, small-caps label, underlined field) but
// a question is SENT, not autosaved: one button, then the sent questions show
// under the field so the student knows Amy has it. Only their own; nothing
// here is public.

import { useEffect, useRef, useState } from "react"

type Sent = { id: number; body: string; created_at: string }

export default function QuestionBox({ slug, initial, max }: { slug: string; initial: Sent[]; max: number }) {
  const [text, setText] = useState("")
  const [sent, setSent] = useState<Sent[]>(initial)
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "limit">("idle")
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.max(el.scrollHeight, 36)}px`
  }, [text])

  async function send() {
    const body = text.trim()
    if (!body || state === "sending") return
    setState("sending")
    try {
      const r = await fetch(`/classes/${slug}/question`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) })
      if (r.status === 429) { setState("limit"); return }
      if (!r.ok) throw new Error(String(r.status))
      setSent((s) => [...s, { id: Date.now(), body, created_at: new Date().toISOString() }])
      setText("")
      setState("sent")
    } catch {
      setState("error")
    }
  }

  const note =
    state === "sending" ? "sending" :
    state === "sent" ? "sent" :
    state === "error" ? "not sent, try again" :
    state === "limit" ? "that is plenty for one class" : ""

  return (
    <div className="w-full">
      <h2 className="text-[26px] md:text-[32px] font-bold leading-[1.05] mb-4" style={{ color: "var(--color-text-primary)" }}>
        Have a question for Amy?
      </h2>
      <p className="text-[16px] italic leading-relaxed mb-7" style={{ color: "var(--color-text-secondary)" }}>
        Leave it here. She collects them, answers on camera in the middle of the month, and that video lands on this page.
      </p>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] uppercase tracking-[0.18em] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Your question
        </span>
        <span className="text-[12px]" style={{ color: state === "error" ? "#b00020" : "var(--color-text-secondary)" }} aria-live="polite">
          {note}
        </span>
      </div>
      <textarea
        ref={ref}
        value={text}
        maxLength={max}
        onChange={(e) => { setText(e.target.value); if (state !== "sending") setState("idle") }}
        placeholder="Ask anything about the class, the journal, or the practice"
        rows={1}
        className="w-full bg-transparent resize-none outline-none text-[16px] leading-relaxed py-2 border-b-2"
        style={{ color: "var(--color-text-primary)", borderColor: "var(--color-orange)" }}
      />
      <button
        type="button"
        onClick={send}
        disabled={!text.trim() || state === "sending"}
        className="mt-5 px-6 py-2.5 rounded-full text-[12px] uppercase tracking-[0.12em] font-semibold text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--color-orange)" }}
      >
        Send to Amy
      </button>
      {sent.length ? (
        <div className="mt-10">
          <p className="text-[12px] uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: "var(--color-text-secondary)" }}>
            {sent.length === 1 ? "You asked" : `You asked (${sent.length})`}
          </p>
          <ul className="space-y-3">
            {sent.map((q) => (
              <li key={q.id} className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text-secondary)" }}>
                {q.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
