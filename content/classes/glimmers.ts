// Day content for the Glimmers and Gratitude class (staging copy, t1102).
//
// Server-only: imported by the gated pages, never shipped to the browser as a
// whole. Amy's real 30 prompts land here in assembly week (Oct 19, per
// class-one-glimmers-and-january-class-scope-2026-09-16.md); until then these
// are placeholders that prove the engine. Files named here are served from
// content/classes/glimmers/files/ by the gated files route, never from /public.

import "server-only"

export type ClassDay = {
  day: number
  title: string
  // Paragraphs of the prompt, plain text.
  body: string[]
  // Optional printable(s): file names inside content/classes/<slug>/files/.
  files?: { name: string; label: string }[]
}

const placeholder = (n: number): ClassDay => ({
  day: n,
  title: `Day ${n}`,
  body: [
    "Placeholder prompt. Amy's updated prompt for this day replaces this text in assembly week.",
    "Notice one small good thing today and write it down before the day is over.",
  ],
})

export const GLIMMERS_DAYS: ClassDay[] = [
  {
    day: 1,
    title: "What a glimmer is",
    body: [
      "A glimmer is the opposite of a trigger: a small moment that makes you feel safe, calm, or quietly glad. The light through a window. The first sip. A song you forgot you loved.",
      "Today, notice one. Write it down in a sentence. That is the whole practice.",
    ],
    files: [{ name: "day-01-printable.pdf", label: "Day 1 printable (PDF)" }],
  },
  ...Array.from({ length: 29 }, (_, i) => placeholder(i + 2)),
]

export function getGlimmersDay(n: number): ClassDay | null {
  return GLIMMERS_DAYS.find((d) => d.day === n) ?? null
}
