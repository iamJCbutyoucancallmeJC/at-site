// /classes/[slug]/how : the walkthrough video (script 3) in the guided player,
// with its cue sheet. Linked from the class home under "How the class works".

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import GuidedPlayer from "@/components/class/guided-player"
import { getClass } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { getContainerCues } from "@/lib/class-content"
import { getAnswers } from "@/lib/class-answers"
import { playbackSource } from "@/lib/video"

export const dynamic = "force-dynamic"

export default async function ClassHowPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getClass(slug)
  if (!c) notFound()
  const claim = await getClassClaim(slug)
  if (!claim) redirect(`/classes/${slug}`)
  const src = c.walkthroughVideo ? await playbackSource(c.walkthroughVideo) : null
  const answers = await getAnswers(claim)

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      <PageEngagementTracker page={`class-${slug}-how`} />
      <p className="text-[12px] mb-8">
        <Link href={`/classes/${slug}`} className="underline underline-offset-2" style={{ color: "var(--color-text-secondary)" }}>
          {c.title}
        </Link>
      </p>
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-10" style={{ color: "var(--color-orange)" }}>
        How the class works
      </p>
      {src ? (
        <GuidedPlayer slug={slug} hls={src.hls} hlsQuery={src.hlsQuery} mp4={src.mp4} poster={src.poster} cues={getContainerCues(slug, "walkthrough")} answers={answers} />
      ) : (
        <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
          <p>Each morning a new day opens on the class page and stays open. Open it, read the question, write the date in your journal, write two or three lines. Some days that is it. Some days you add a scrap or a sticker.</p>
          <p>There is a field under every question. Whatever you type there is saved to this class, on any device you open your link on, and on Day 30 all thirty show up in a row.</p>
          <p>Four of the days have a printable: Days 2, 11, 18 and 26. Print them once, or do not print them at all. They are there if you want a place to keep the list.</p>
          <p>If you have a question, there is a box at the bottom of the class page. Amy collects them, answers on camera in the middle of the month, and that video lands on the class page.</p>
          <p>Do not try to catch up. Do not make it good. One small good thing a day, somewhere you can find it later.</p>
        </div>
      )}
    </main>
  )
}
