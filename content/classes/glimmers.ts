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

export const GLIMMERS_DAYS: ClassDay[] = [
  {
    day: 1,
    title: "Why Glimmers & Gratitude? Why now?",
    prompt: { key: "d01", headline: "What is one glimmer from today?", instruction: "The light through a window. The first sip. A song you forgot you loved. One sentence." },
    body: ["A glimmer is a small moment that makes you feel safe, calm, or quietly glad. The opposite of a trigger.", "Today, notice one. Write it down in a sentence. That is the whole practice."],
  },
  {
    day: 2,
    title: "Create your Glimmers & Gratitude journal",
    prompt: { key: "d02", headline: "Where will your glimmers go?", instruction: "Make a fun place for them. Any notebook works." },
    body: ["Find joy in the ordinary and put it into your dedicated notebook. Make your life more abundant with the little things that add up big time."],
    files: [{ name: "printable-1-journal-setup.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 3,
    title: "Expanding your practice",
    prompt: { key: "d03", headline: "What does gratitude spell out for you?", instruction: "Try an acronym: one word per letter." },
    body: ["A day for widening the lens. Look back at your first two pages and add one more thing you missed."],
  },
  {
    day: 4,
    title: "Somebody loves you",
    prompt: { key: "d04", headline: "Who put something kind in your hands lately?", instruction: "A handwritten note or card. Add it to the journal." },
    body: ["It doesn't have to be anything big. If you don't have one, ask someone to write something in it for you."],
  },
  {
    day: 5,
    title: "Include a photo of you",
    prompt: { key: "d05", headline: "What are you grateful for in this photo?", instruction: "Take a selfie smiling, or use a recent one. Print it and glue it in." },
    body: ["Write what you're currently grateful for and the story behind the photo."],
  },
  {
    day: 6,
    title: "Mondays are a fresh start",
    prompt: { key: "d06", headline: "What does your typical Monday feel like?", instruction: "Now imagine it as a fresh start. How would you reframe it?" },
    body: ["Describe the routine and the feelings it evokes. Then set one positive intention for the week."],
  },
  {
    day: 7,
    title: "Paying it forward",
    prompt: { key: "d07", headline: "When did someone's kindness change your day?", instruction: "Tell the story, then name one way to pass it on." },
    body: [],
  },
  {
    day: 8,
    title: "Looking back",
    prompt: { key: "d08", headline: "What was an everyday sweet moment this week?", instruction: "Look for a throughline. How can you keep noticing them?" },
    body: [],
  },
  {
    day: 9,
    title: "Pencil it in",
    prompt: { key: "d09", headline: "What everyday object holds meaning for you?", instruction: "Sketch it. This is not about talent, it's about the joy of making a mark." },
    body: ["Let go of the idea that you can't draw."],
  },
  {
    day: 10,
    title: "Be free",
    prompt: { key: "d10", headline: "What does freedom feel like to you?", instruction: "What do you do with your free time? Which parts of freedom are you most grateful for?" },
    body: [],
  },
  {
    day: 11,
    title: "Ideas",
    prompt: { key: "d11", headline: "How are you sparking ideas that inspire you?", instruction: "Write something about your outlook on ideas." },
    body: ["Cut out the Ideas tag and glue it in."],
    files: [{ name: "printable-2-ideas-tag.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 12,
    title: "Rest",
    prompt: { key: "d12", headline: "What is your relationship with rest?", instruction: "Find a quote about rest that resonates and write it down." },
    body: ["Rest is not the absence of activity but the presence of peace."],
  },
  {
    day: 13,
    title: "Finding light in the shadows",
    prompt: { key: "d13", headline: "Think of a recent low-energy day. What were three glimmers in it?", instruction: "Give thanks for them. How did noticing change the day?" },
    body: [],
  },
  {
    day: 14,
    title: "A beautiful mess",
    prompt: { key: "d14", headline: "What mess, little or big, could be reframed as beautiful?", instruction: "Journal about it." },
    body: [],
  },
  {
    day: 15,
    title: "Too good to be true",
    prompt: { key: "d15", headline: "What old idea no longer serves you?", instruction: "Make the perspective shift. Turn it into a fresh, positive one." },
    body: ["Magazine headings make good journal phrases."],
  },
  {
    day: 16,
    title: "Live session",
    prompt: { key: "d16", headline: "How can you create more space for receiving?", instruction: "The recording of the live lands here." },
    body: [],
  },
  {
    day: 17,
    title: "Celebrating the everyday",
    prompt: { key: "d17", headline: "What quote resonates with you right now?", instruction: "Write it in your notebook with the supplies on hand, any way that delights you." },
    body: [],
  },
  {
    day: 18,
    title: "Work in progress",
    prompt: { key: "d18", headline: "Where have you let yourself be imperfect?", instruction: "How did it grow you?" },
    body: ["Explore being a work in progress and the beauty in imperfection."],
    files: [{ name: "printable-3-work-in-progress.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 19,
    title: "Finding comfort",
    prompt: { key: "d19", headline: "What brings you comfort?", instruction: "Add it to your journal in a creative way. A list is fine." },
    body: ["Tea, blankets, hugs, rain, a stroll, a candle."],
  },
  {
    day: 20,
    title: "Ticket or token",
    prompt: { key: "d20", headline: "What quirky story is tied to one of your ticket stubs?", instruction: "Include the stub. How does it capture the moment?" },
    body: [],
  },
  {
    day: 21,
    title: "Embracing chaos",
    prompt: { key: "d21", headline: "How do you embrace beautiful chaos?", instruction: "Take some of those supplies you love and create just for the sake of it." },
    body: [],
  },
  {
    day: 22,
    title: "Habits and happiness",
    prompt: { key: "d22", headline: "Which habits bring you joy?", instruction: "You're past the 21 days. What have you noticed about habits and happiness?" },
    body: [],
  },
  {
    day: 23,
    title: "Giving thanks",
    prompt: { key: "d23", headline: "What ordinary thing did you notice today?", instruction: "Take a photo or a little video, write about it, give thanks." },
    body: [],
  },
  {
    day: 24,
    title: "Things people say",
    prompt: { key: "d24", headline: "What did someone say that delighted you?", instruction: "Write it down." },
    body: [],
  },
  {
    day: 25,
    title: "Where you live",
    prompt: { key: "d25", headline: "What do you love about where you live?" },
    body: [],
  },
  {
    day: 26,
    title: "Nourishing",
    prompt: { key: "d26", headline: "Who made your meals this week?", instruction: "Give a shout-out to the meals and the maker. Bonus points for food stickers." },
    body: [],
    files: [{ name: "printable-4-nourishing.pdf", label: "Printable (PDF)" }],
  },
  {
    day: 27,
    title: "Progress over perfection",
    prompt: { key: "d27", headline: "Where have you seen progress recently?", instruction: "How has gratitude played a role in appreciating the change?" },
    body: [],
  },
  {
    day: 28,
    title: "Embracing contrast",
    prompt: { key: "d28", headline: "Can you be grateful for something you wish had never happened?", instruction: "If that feels too deep, find a quote that resonates instead." },
    body: [],
  },
  {
    day: 29,
    title: "In your dreams",
    prompt: { key: "d29", headline: "Are you dreaming big enough?", instruction: "What does following your dreams unlock? Are you taking action?" },
    body: [],
  },
  {
    day: 30,
    title: "Thirty little pages",
    prompt: { key: "d30", headline: "Read back through the month. What do you notice?", instruction: "Everything you wrote is below. Take your time." },
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
  // Script 2, the welcome, cut 10/9 (0:53, Bunny "glimmers-welcome"). Beats measured on the cut:
  // 0:02 "Welcome to day one", 0:19 "What you need. A journal. Any journal.", 0:34 "The one rule."
  welcome: [
    { at: 2.4, key: "welcome-here", headline: "You're in.", instruction: "Each morning a new prompt opens and stays open. Nothing is lost if you start late." },
    { at: 19.5, key: "welcome-journal", headline: "Any journal.", instruction: "Which notebook will you use? Name it here so it is real.", pause: true },
    { at: 34.4, key: "welcome-rule", headline: "The one rule.", instruction: "Do not try to catch up. Do not make it good. One small good thing a day." },
  ],
  // Script 3, the walkthrough. Beat 3 does a prompt for real; the student does one too.
  walkthrough: [
    { at: 60, key: "walkthrough-try", headline: "Try one now.", instruction: "Read the prompt, write the date, two or three lines. That is a day.", pause: true },
  ],
}
