// Day content for the Glimmers and Gratitude class (t1102).
//
// Server-only: imported by the gated pages, never shipped to the browser as a
// whole. Last year's 30 prompts loaded 2026-10-08 from Amy's Sheet (1vNyr6Wf) for the
// shoot; Amy's edited prompts + photos replace them in assembly week (Oct 19).
// Files named here are served from content/classes/glimmers/files/ by the
// gated files route, never from /public. Video ids are Bunny Stream GUIDs
// (scripts/bunny-upload.mjs prints them); videos never live in the repo.

import "server-only"

export type Cue = {
  at: number // seconds into the video when the prompt column appears
  key: string // saved-answer key, e.g. "d07" or "welcome-grateful"
  pause?: boolean // hold the video until the student types or clicks play (unused since 10/14: nothing waits on typing)
  noField?: boolean // headline and line only, no text field
  label?: string // small-caps label over the field
}

// The day's instructions for the PAPER page, as numbered steps (JC ruled
// 10/14: the journal is the class; the page tells you what to do in it). The
// field under the steps is an optional one-line log of what went on the page,
// which Day 30 lists in order.
export type Prompt = {
  key: string // the saved-log key for the day
  steps: string[]
  quoteBack?: string // key of an earlier log line to show in orange above the field
}

export type ClassVideo = { id: string; cues?: Cue[] }

export type ClassDay = {
  day: number
  title: string
  // The day's steps, rendered beside the circle video (if any) or on their own.
  prompt: Prompt
  // Paragraphs of longer prose under the prompt, plain text.
  body: string[]
  // Amy's page photo for the day (path under /public is fine: photos are not secret).
  photo?: { src: string; alt: string }
  video?: ClassVideo
  // A longer landscape "here is mine" video under the steps (Amy's 2023 page
  // videos from Kajabi, 10/14). Plain player, no cues.
  demo?: { id: string; caption: string }
  // Optional printable(s): file names inside content/classes/<slug>/files/.
  files?: { name: string; label: string }[]
}

export const GLIMMERS_DAYS: ClassDay[] = [
  {
    day: 1,
    title: "Why Glimmers & Gratitude? Why now?",
    prompt: { key: "d01", steps: ["Open your journal to a fresh page and write the date.", "Notice one glimmer from today: the light through a window, the first sip, a song you forgot you loved.", "Write it down in one sentence. That is the whole practice."] },
    body: ["A glimmer is a small moment that makes you feel safe, calm, or quietly glad. The opposite of a trigger."],
  },
  {
    day: 2,
    title: "Create your Glimmers & Gratitude journal",
    // Amy to camera, shot 10/8; Amy-only re-cut 10/14 (Bunny "glimmers-d02"): the 10/9 cut
    // carried JC's "Make a fun place for your glimmers to go". 6.4 s.
    video: { id: "174e83b7-c2db-4770-a335-3bfca0b486bb", cues: [{ at: 6.1, key: "d02" }] },
    prompt: { key: "d02", steps: ["Pick the notebook. Any notebook works.", "Write today's date on the first page.", "Make a fun place for your glimmers to go: a title, a doodle, a strip of tape.", "Print the journal-setup page and glue it in, if you want it."] },
    body: [],
    files: [{ name: "printable-1-journal-setup.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 3,
    title: "Expanding your practice",
    // Amy to camera, shot 10/8 (IMG_4952), Amy-only cut 10/14 (Bunny "glimmers-d03"):
    // "I am so happy you're here. It's day three. What was one small good thing today?"
    video: { id: "aee663f5-38c5-4163-b0f6-227444267756", cues: [{ at: 4.8, key: "d03" }] },
    prompt: { key: "d03", steps: ["Name one small good thing from today. One sentence.", "Look back at your first two pages and add one thing you missed.", "Try an acronym for GRATITUDE: one word per letter."] },
    body: [],
  },
  {
    day: 4,
    title: "Somebody loves you",
    prompt: { key: "d04", steps: ["Find a handwritten note or card someone gave you.", "Add it to the journal. It does not have to be anything big.", "If you don't have one, ask someone to write a line in your journal for you."] },
    body: [],
  },
  {
    day: 5,
    title: "Include a photo of you",
    // Amy's 2023 page video from Kajabi (glimmers-kajabi-video-pull-runbook). 9/23 ruled "no 2023
    // replays"; JC asked for them 10/14. Wired for his read; Amy may still veto.
    demo: { id: "ddc2c784-62df-4c75-9120-302efa75ae0f", caption: "Amy's page, from the 2023 class." },
    prompt: { key: "d05", steps: ["Take a selfie smiling, or pick a recent photo you like.", "Print it and glue it in.", "Write what you're grateful for right now, and the story behind the photo."] },
    body: [],
  },
  {
    day: 6,
    title: "One small good thing",
    // Amy to camera, shot 10/8, square cut 10/9 (Bunny "glimmers-d06"): "Welcome to Day 6.
    // What was one small good thing today?" JC ruled 10/14: the prompt matches the clip.
    // (Last year's "Mondays are a fresh start" landed on a Friday this year anyway.)
    video: { id: "1fe38673-fc9b-49c4-a525-89ac24817c0f", cues: [{ at: 2.4, key: "d06" }] },
    prompt: { key: "d06", steps: ["Write the date.", "Name one small good thing from today. One sentence is plenty."] },
    body: ["Almost a week in. This is the whole practice in one question, so today is a plain day: name it, write it down, done."],
  },
  {
    day: 7,
    title: "Paying it forward",
    prompt: { key: "d07", steps: ["Think of a time someone's kindness changed your day.", "Tell the story on the page.", "Name one way to pass it on this week."] },
    body: [],
  },
  {
    day: 8,
    title: "Looking back",
    prompt: { key: "d08", steps: ["Read back through this week's pages.", "Write down one everyday sweet moment you noticed.", "Look for a throughline. How can you keep noticing them?"] },
    body: [],
  },
  {
    day: 9,
    title: "Pencil it in",
    prompt: { key: "d09", steps: ["Pick an everyday object that holds meaning for you.", "Sketch it. This is not about talent, it's about the joy of making a mark.", "Add a line about why it matters."] },
    body: ["Let go of the idea that you can't draw."],
  },
  {
    day: 10,
    title: "Be free",
    prompt: { key: "d10", steps: ["Write what freedom feels like to you.", "List what you do with your free time.", "Circle the parts of freedom you're most grateful for."] },
    body: [],
  },
  {
    day: 11,
    title: "Ideas",
    // Amy to camera, shot 10/8; Amy-only re-cut 10/14 (Bunny "glimmers-d11"), 8.5 s.
    video: { id: "20dd7640-731f-4edb-9eb8-65d7080045b8", cues: [{ at: 8.2, key: "d11" }] },
    prompt: { key: "d11", steps: ["Print the Ideas tag, cut it out, and glue it in.", "Write about your outlook on ideas.", "How are you sparking ideas that inspire you?"] },
    body: [],
    files: [{ name: "printable-2-ideas-tag.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 12,
    title: "Rest",
    prompt: { key: "d12", steps: ["Write a few lines about your relationship with rest.", "Find a quote about rest that resonates and copy it onto the page."] },
    body: ["Rest is not the absence of activity but the presence of peace."],
  },
  {
    day: 13,
    title: "Finding light in the shadows",
    prompt: { key: "d13", steps: ["Think of a recent low-energy day.", "Write three glimmers that were in it anyway.", "Give thanks for them. How did noticing change the day?"] },
    body: [],
  },
  {
    day: 14,
    title: "A beautiful mess",
    prompt: { key: "d14", steps: ["Pick a mess, little or big, from your life right now.", "Journal about how it could be reframed as beautiful."] },
    body: [],
  },
  {
    day: 15,
    title: "Too good to be true",
    // Amy's 10/8 "Mid-month check-in" line is on Bunny as glimmers-d15 (de32d480), 2.2 s. Pulled
    // from the page 10/14: a two-second clip that does not say the prompt reads as a glitch.
    // Re-wire if the reshoot gives Day 15 a real read.
    prompt: { key: "d15", steps: ["Name an old idea that no longer serves you.", "Turn it into a fresh, positive one on the page.", "Magazine headings make good journal phrases, if you have one around."] },
    body: [],
  },
  {
    day: 16,
    title: "Live session",
    prompt: { key: "d16", steps: ["How can you create more space for receiving? Write a few lines."] },
    body: ["The Q&A video, answering the questions from the box on the class page, lands there in the middle of the month."],
  },
  {
    day: 17,
    title: "Celebrating the everyday",
    // Amy's 2023 page video from Kajabi (glimmers-kajabi-video-pull-runbook). 9/23 ruled "no 2023
    // replays"; JC asked for them 10/14. Wired for his read; Amy may still veto.
    demo: { id: "c304418f-758b-43a3-a1b1-4e6166474bbb", caption: "Amy's page, from the 2023 class." },
    prompt: { key: "d17", steps: ["Pick a quote that resonates with you right now.", "Write it in your notebook with the supplies on hand, any way that delights you."] },
    body: [],
  },
  {
    day: 18,
    title: "Work in progress",
    // Amy to camera, shot 10/8, square cut 10/9 (Bunny "glimmers-d18")
    video: { id: "5fe8ebcc-01c4-4f30-8f67-8717847bfd86", cues: [{ at: 5.3, key: "d18" }] },
    prompt: { key: "d18", steps: ["Print the Work in Progress page and add it to your journal.", "Write about where you have let yourself be imperfect.", "How did it grow you?"] },
    body: [],
    files: [{ name: "printable-3-work-in-progress.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 19,
    title: "Finding comfort",
    prompt: { key: "d19", steps: ["List what brings you comfort: tea, blankets, hugs, rain, a stroll, a candle.", "Add it to your journal in a creative way. A list is fine."] },
    body: [],
  },
  {
    day: 20,
    title: "Ticket or token",
    // Amy's 2023 page video from Kajabi (glimmers-kajabi-video-pull-runbook). 9/23 ruled "no 2023
    // replays"; JC asked for them 10/14. Wired for his read; Amy may still veto.
    demo: { id: "f70f372e-a588-4040-9f9f-206db3a627d9", caption: "Amy's page, from the 2023 class." },
    prompt: { key: "d20", steps: ["Find a ticket stub or a small token with a story.", "Glue it in.", "Write the quirky story tied to it, and how it captures the moment."] },
    body: [],
  },
  {
    day: 21,
    title: "Embracing chaos",
    prompt: { key: "d21", steps: ["Take some of the supplies you love and create just for the sake of it.", "No plan beyond that. Write a line about how it felt."] },
    body: [],
  },
  {
    day: 22,
    title: "Habits and happiness",
    prompt: { key: "d22", steps: ["You're past the 21 days. Write what you've noticed about habits and happiness.", "List the habits that bring you joy."] },
    body: [],
  },
  {
    day: 23,
    title: "Giving thanks",
    prompt: { key: "d23", steps: ["Notice one ordinary thing today.", "Take a photo or a little video of it.", "Write about it and give thanks."] },
    body: [],
  },
  {
    day: 24,
    title: "Things people say",
    prompt: { key: "d24", steps: ["Write down something someone said that delighted you.", "Add who said it and when."] },
    body: [],
  },
  {
    day: 25,
    title: "Where you live",
    prompt: { key: "d25", steps: ["Write what you love about where you live."] },
    body: [],
  },
  {
    day: 26,
    title: "Nourishing",
    // Amy to camera, shot 10/8, square cut 10/9 (Bunny "glimmers-d26")
    video: { id: "38732fdc-0f65-433b-bd94-8684c92baa7d", cues: [{ at: 7.2, key: "d26" }] },
    prompt: { key: "d26", steps: ["Print the Nourishing page and add it in.", "Give a shout-out to this week's meals and whoever made them.", "Bonus points for food stickers."] },
    body: [],
    files: [{ name: "printable-4-nourishing.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 27,
    title: "Progress over perfection",
    prompt: { key: "d27", steps: ["Write about where you have seen progress recently.", "How has gratitude played a role in appreciating the change?"] },
    body: [],
  },
  {
    day: 28,
    title: "Embracing contrast",
    prompt: { key: "d28", steps: ["Can you be grateful for something you wish had never happened? Write about it.", "If that feels too deep, find a quote that resonates instead."] },
    body: [],
  },
  {
    day: 29,
    title: "In your dreams",
    prompt: { key: "d29", steps: ["Are you dreaming big enough? Write about it.", "What does following your dreams unlock? Are you taking action?"] },
    body: [],
  },
  {
    day: 30,
    title: "Thirty little pages",
    // Amy's 2023 page video from Kajabi (glimmers-kajabi-video-pull-runbook). 9/23 ruled "no 2023
    // replays"; JC asked for them 10/14. Wired for his read; Amy may still veto.
    demo: { id: "82e7bd94-7a67-4fec-8374-773b6e9c6002", caption: "Amy's journal at the end of the 2023 class." },
    // Amy to camera, shot 10/8; Amy-only re-cut 10/14 (Bunny "glimmers-d30"), 4.4 s.
    video: { id: "931c0e77-09d0-4d97-b614-89a171df0ee0", cues: [{ at: 4.1, key: "d30" }] },
    prompt: { key: "d30", steps: ["Read back through the month, page by page.", "Write what you notice.", "Your thirty log lines are below."] },
    body: ["Gratitude is not a 30-day practice, it's a lifelong one. Your journal is not complete, it is full."],
  },
]

export function getGlimmersDay(n: number): ClassDay | null {
  return GLIMMERS_DAYS.find((d) => d.day === n) ?? null
}

// Cue sheets for the two container videos (Bunny GUIDs come from the registry
// via env; the timestamps are set after the Oct 8 shoot once the cuts exist).
export type ContainerCue = Cue & { headline: string; instruction?: string }
export const GLIMMERS_CONTAINER: { welcome: ContainerCue[]; walkthrough: ContainerCue[] } = {
  // Script 2, the welcome, cut 10/9 (0:53, Bunny "glimmers-welcome"). Beats re-measured 10/14
  // with word-level whisper on the shipped cut: 0:03 "Welcome to day one", 0:20 "What you need",
  // 0:22-0:23 "A journal. Any journal.", 0:40.9 "The one rule." The journal cue pauses AFTER she
  // has said the line, not on "What you need"; the rule cue had been firing 6 s early.
  // Only the notebook beat has a field (naming it has no paper home); the video never holds.
  welcome: [
    { at: 2.4, key: "welcome-here", headline: "You're in.", instruction: "Each morning a new day opens and stays open. Nothing is lost if you start late.", noField: true },
    { at: 23.6, key: "welcome-journal", headline: "Any journal.", instruction: "Which notebook will you use? Name it here so it is real.", label: "Your notebook" },
    { at: 40.9, key: "welcome-rule", headline: "The one rule.", instruction: "Do not try to catch up. Do not make it good. One small good thing a day.", noField: true },
  ],
  // Script 3, the walkthrough. Beat 3 does a prompt for real; the student does one too, on paper.
  walkthrough: [
    { at: 60, key: "walkthrough-try", headline: "Try one now.", instruction: "Read the steps, write the date, two or three lines. That is a day.", noField: true },
  ],
}
