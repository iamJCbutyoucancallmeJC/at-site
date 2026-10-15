// /classes/[slug] : the class home. Locked view without a valid class cookie;
// with one, the day list (open days link, future days show their unlock date).

import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import { getClass, isDayOpen, unlockDate, formatUnlockDate, laDate } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { getClassDays, getContainerCues } from "@/lib/class-content"
import { getAnswers } from "@/lib/class-answers"
import { playbackSource } from "@/lib/video"
import GuidedPlayer from "@/components/class/guided-player"
import QuestionBox from "@/components/class/question-box"
import DemoPlayer from "@/components/class/demo-player"
import { myQuestions, QUESTION_MAX_CHARS } from "@/lib/class-questions"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getClass(slug)
  return { title: c ? `${c.title} | Amy Tangerine` : "Class | Amy Tangerine" }
}

export default async function ClassHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ locked?: string }>
}) {
  const { slug } = await params
  const c = getClass(slug)
  if (!c) notFound()
  const claim = await getClassClaim(slug)
  const sp = await searchParams

  if (!claim) {
    return (
      <main className="max-w-xl mx-auto px-6 pt-16 pb-24 text-center">
        <PageEngagementTracker page={`class-${slug}-locked`} />
        <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "var(--color-orange)" }}>
          {c.title}
        </p>
        <h1 className="text-[28px] md:text-[34px] font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          {sp.locked ? "That link didn't work" : "This page is for the class"}
        </h1>
        <p className="text-[15px] leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Your class link is in the email you got when you signed up. Open that link
          and this page unlocks on this device. It works on as many devices as you
          like, and it never expires.
        </p>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Can&apos;t find it? Write to{" "}
          <a href="mailto:help@amytangerine.com" className="underline underline-offset-2" style={{ color: "var(--color-orange)" }}>
            help@amytangerine.com
          </a>{" "}
          with the email you ordered with and we&apos;ll send it again.
        </p>
      </main>
    )
  }

  const days = getClassDays(slug)
  const now = new Date()
  // The day that unlocked today, if the class is running; marked in the list so
  // a returning student does not have to count.
  const today = laDate(now)
  const todayN = Array.from({ length: c.days }, (_, i) => i + 1).find((n) => unlockDate(c, n) === today) ?? null
  const answers = await getAnswers(claim)
  const asked = await myQuestions(claim)
  const welcome = c.welcomeVideo ? await playbackSource(c.welcomeVideo) : null
  // The mid-month Q&A video, once Amy has recorded it (t1651): under the box it answers.
  const qa = c.qaVideo ? await playbackSource(c.qaVideo) : null

  return (
    <main className="max-w-2xl mx-auto px-6 pt-16 pb-24">
      <PageEngagementTracker page={`class-${slug}`} />
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4" style={{ color: "var(--color-orange)" }}>
        Your class
      </p>
      <h1 className="text-[32px] md:text-[40px] font-bold leading-tight mb-3" style={{ color: "var(--color-text-primary)" }}>
        {c.title}
      </h1>
      <p className="text-[16px] leading-relaxed mb-10" style={{ color: "var(--color-text-secondary)" }}>
        {c.tagline}
      </p>

      {welcome ? (
        <section className="mb-14">
          {/* The welcome master is landscape with Amy left of centre; 38% keeps her in the circle. */}
          <GuidedPlayer slug={slug} hls={welcome.hls} hlsQuery={welcome.hlsQuery} mp4={welcome.mp4} poster={welcome.poster} cues={getContainerCues(slug, "welcome")} answers={answers} focus="38% 50%" />
        </section>
      ) : null}

      <p className="text-[14px] mb-10">
        <Link href={`/classes/${slug}/how`} className="underline underline-offset-4" style={{ color: "var(--color-orange)" }}>
          How the class works
        </Link>
      </p>

      <ol className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {Array.from({ length: c.days }, (_, i) => i + 1).map((n) => {
          const open = isDayOpen(c, n, now)
          const d = days.find((x) => x.day === n)
          const label = d?.title ?? `Day ${n}`
          return (
            <li key={n} className="py-4 flex items-baseline gap-4">
              <span className="w-14 shrink-0 text-[12px] uppercase tracking-[0.12em] font-semibold" style={{ color: open ? "var(--color-orange)" : "var(--color-text-secondary)" }}>
                Day {n}
              </span>
              {open ? (
                <span className="flex items-baseline gap-3 flex-wrap">
                  <Link href={`/classes/${slug}/day/${n}`} className="text-[17px] font-semibold underline-offset-4 hover:underline" style={{ color: "var(--color-text-primary)" }}>
                    {label}
                  </Link>
                  {n === todayN ? (
                    <span className="text-[11px] uppercase tracking-[0.12em] font-semibold" style={{ color: "var(--color-orange)" }}>
                      Today
                    </span>
                  ) : null}
                </span>
              ) : (
                <span className="text-[15px]" style={{ color: "var(--color-text-secondary)" }}>
                  Opens {formatUnlockDate(unlockDate(c, n))}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <section className="mt-16 max-w-[520px]">
        <QuestionBox slug={slug} initial={asked} max={QUESTION_MAX_CHARS} />
      </section>

      {qa ? (
        <section className="mt-14">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Amy answers your questions
          </p>
          <DemoPlayer hls={qa.hls} hlsQuery={qa.hlsQuery} mp4={qa.mp4} poster={qa.poster} caption="Recorded in the middle of the month, from the questions left in the box." />
        </section>
      ) : null}

      <p className="mt-12 text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        Order #{claim.orderRef}. Questions or a lost link:{" "}
        <a href="mailto:help@amytangerine.com" className="underline underline-offset-2" style={{ color: "var(--color-orange)" }}>
          help@amytangerine.com
        </a>
        .
      </p>
    </main>
  )
}
