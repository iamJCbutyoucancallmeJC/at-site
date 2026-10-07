// Day content for the Glimmers and Gratitude class (t1102).
//
// Server-only: imported by the gated pages, never shipped to the browser as a
// whole. Amy's real 30 prompts land here in assembly week (Oct 19) via
// scripts/import-glimmers-sheet.mjs; until then placeholders prove the engine.
// Files named here are served from content/classes/glimmers/files/ by the
// gated files route, never from /public. Video ids are Bunny Stream GUIDs
// (scripts/bunny-upload.mjs prints them); videos never live in the repo.

import "server-only"

export type Cue = {
  at: number // seconds into the video when the prompt column appears
  key: string // saved-answer key, e.g. "d07" or "welcome-grateful"
  pause?: boolean // hold the video until the student types or clicks play
}

export type Prompt = {
  key: string // the saved-answer key for the day
  headline: string
  instruction?: string // one italic line
  quoteBack?: string // key of an earlier answer to show in orange above the field
}

export type ClassVideo = { id: string; cues?: Cue[] }

export type ClassDay = {
  day: number
  title: string
  // The one question of the day, rendered Lightbulb-style beside the circle
  // video (if any) or on its own.
  prompt: Prompt
  // Paragraphs of longer prose under the prompt, plain text.
  body: string[]
  // Amy's page photo for the day (path under /public is fine: photos are not secret).
  photo?: { src: string; alt: string }
  video?: ClassVideo
  // Optional printable(s): file names inside content/classes/<slug>/files/.
  files?: { name: string; label: string }[]
}

const pad = (n: number) => String(n).padStart(2, "0")

const placeholder = (n: number): ClassDay => ({
  day: n,
  title: `Day ${n}`,
  prompt: {
    key: `d${pad(n)}`,
    headline: "What was one small good thing today?",
    instruction: "A sentence is plenty. Don't overthink it.",
  },
  body: ["Placeholder prompt. Amy's updated prompt for this day replaces this text in assembly week."],
})

export const GLIMMERS_DAYS: ClassDay[] = [
  {
    day: 1,
    title: "What a glimmer is",
    prompt: {
      key: "d01",
      headline: "What is one glimmer from today?",
      instruction: "The light through a window. The first sip. A song you forgot you loved. One sentence.",
    },
    body: [
      "A glimmer is the opposite of a trigger: a small moment that makes you feel safe, calm, or quietly glad.",
      "Today, notice one. Write it down in a sentence. That is the whole practice.",
    ],
    files: [{ name: "day-01-printable.pdf", label: "Day 1 printable (PDF)" }],
  },
  ...Array.from({ length: 28 }, (_, i) => placeholder(i + 2)),
  {
    day: 30,
    title: "Thirty little pages",
    prompt: {
      key: "d30",
      headline: "Read back through the month. What do you notice?",
      instruction: "Everything you wrote is below. Take your time.",
    },
    body: ["The last prompt is the whole month. Your thirty answers are collected under this one."],
  },
]

export function getGlimmersDay(n: number): ClassDay | null {
  return GLIMMERS_DAYS.find((d) => d.day === n) ?? null
}

// Cue sheets for the two container videos (Bunny GUIDs come from the registry
// via env; the timestamps are set after the Oct 8 shoot once the cuts exist).
export type ContainerCue = Cue & { headline: string; instruction?: string }
export const GLIMMERS_CONTAINER: { welcome: ContainerCue[]; walkthrough: ContainerCue[] } = {
  // Script 2, the welcome. One optional pause near the end: "A journal. Any journal."
  welcome: [],
  // Script 3, the walkthrough. Beat 3 does a prompt for real; the student does one too.
  walkthrough: [
    { at: 60, key: "walkthrough-try", headline: "Try one now.", instruction: "Read the prompt, write the date, two or three lines. That is a day.", pause: true },
  ],
}
