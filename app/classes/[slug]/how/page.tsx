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
        <GuidedPlayer slug={slug} hls={src.hls} poster={src.poster} cues={getContainerCues(slug, "walkthrough")} answers={answers} />
      ) : (
        <p className="text-[16px] leading-relaxed max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
          The walkthrough video is on its way. Each day a new prompt opens at the top of the class page and stays open. Read it, write the date, write two or three lines. Some days that is it.
        </p>
      )}
    </main>
  )
}
