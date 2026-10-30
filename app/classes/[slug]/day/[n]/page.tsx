// /classes/[slug]/day/[n] : one day's prompt. Needs the class cookie AND the
// day to be open by date; a future day shows its unlock date instead of the
// prompt (the URL is guessable, the content is not served early).
//
// Layout is the Lightbulb shape (classes-on-site-scope, "observed" section):
// an optional circle video on the left, the prompt column with the saved
// answer on the right; without a video the prompt column stands alone.

import Link from "next/link"
import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PromptBlock from "@/components/class/prompt-block"
import GuidedPlayer from "@/components/class/guided-player"
import DemoPlayer from "@/components/class/demo-player"
import { getClass, isDayOpen, unlockDate, formatUnlockDate } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { getClassDay, getClassDays } from "@/lib/class-content"
import { getAnswers } from "@/lib/class-answers"
import { playbackSource } from "@/lib/video"

export const dynamic = "force-dynamic"

const link = { color: "var(--color-orange-ink)" }
// The field under the steps is a log of the paper page, not the answer (10/14).
const LOG_LABEL = "Your page, in a line"
const LOG_PLACEHOLDER = "What went on the page? (optional)"

export default async function ClassDayPage({ params }: { params: Promise<{ slug: string; n: string }> }) {
  const { slug, n: nRaw } = await params
  const c = getClass(slug)
  if (!c) notFound()
  const n = Number(nRaw)
  if (!Number.isInteger(n) || n < 1 || n > c.days) notFound()

  const claim = await getClassClaim(slug)
  if (!claim) redirect(`/classes/${slug}`)

  const open = isDayOpen(c, n)
  const day = open ? getClassDay(slug, n) : null
  const answers = open ? await getAnswers(claim) : {}
  const src = day?.video ? await playbackSource(day.video.id) : null
  const demos = await Promise.all(
    (day?.demo ? [day.demo].flat() : []).map(async (d) => ({ ...d, src: await playbackSource(d.id) })),
  )
  const quote = day?.prompt.quoteBack && answers[day.prompt.quoteBack]
    ? { label: "You wrote earlier:", text: answers[day.prompt.quoteBack] }
    : null
  const isLast = n === c.days
  const allDays = isLast ? getClassDays(slug) : []

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
      <PageEngagementTracker page={`class-${slug}-day`} />
      <p className="text-[12px] mb-8">
        <Link href={`/classes/${slug}`} className="underline underline-offset-2" style={{ color: "var(--color-text-secondary)" }}>
          {c.title}
        </Link>
      </p>
      <p className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-6" style={link}>
        Day {n} of {c.days}
      </p>

      {!open || !day ? (
        <div className="max-w-2xl">
          <h1 className="text-[28px] md:text-[34px] font-bold leading-tight mb-4" style={{ color: "var(--color-text-primary)" }}>
            Not yet
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Day {n} opens {formatUnlockDate(unlockDate(c, n))}. One day at a time is the point.
          </p>
        </div>
      ) : src && day.video ? (
        <GuidedPlayer
          slug={slug}
          hls={src.hls}
          hlsQuery={src.hlsQuery}
          mp4={src.mp4}
          poster={src.poster}
          answers={answers}
          open
          cues={[
            ...(day.video.cues ?? []).map((cue) => ({ ...cue, headline: day.title, steps: day.prompt.steps, label: LOG_LABEL, placeholder: LOG_PLACEHOLDER, quoteBack: quote })),
            ...((day.video.cues ?? []).length ? [] : [{ at: 0, key: day.prompt.key, headline: day.title, steps: day.prompt.steps, label: LOG_LABEL, placeholder: LOG_PLACEHOLDER, quoteBack: quote }]),
          ]}
        />
      ) : (
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          {day.photo ? (
            <div className="shrink-0 w-full md:w-[300px]">
              <Image src={day.photo.src} alt={day.photo.alt} width={600} height={600} className="w-full h-auto rounded-sm" />
            </div>
          ) : null}
          <div className="flex-1 max-w-[520px]">
            <PromptBlock
              slug={slug}
              promptKey={day.prompt.key}
              headline={day.title}
              steps={day.prompt.steps}
              label={LOG_LABEL}
              placeholder={LOG_PLACEHOLDER}
              quoteBack={quote}
              initial={answers[day.prompt.key] ?? ""}
            />
          </div>
        </div>
      )}

      {open && day ? (
        <div className="max-w-2xl mt-14">
          {day.body.length ? (
            <div className="space-y-5">
              {day.body.map((p, i) => (
                <p key={i} className="text-[17px] leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
                  {p}
                </p>
              ))}
            </div>
          ) : null}
          {demos.map((d) =>
            d.src ? (
              <div key={d.id} className="mt-12">
                <DemoPlayer hls={d.src.hls} hlsQuery={d.src.hlsQuery} mp4={d.src.mp4} poster={d.src.poster} caption={d.caption} />
              </div>
            ) : null,
          )}
          {day.files?.length ? (
            <ul className="mt-10 space-y-2">
              {day.files.map((f) => (
                <li key={f.name}>
                  <a
                    href={`/classes/${slug}/files/${encodeURIComponent(f.name)}`}
                    className="cta-teal cta--compact"
                  >
                    {f.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {isLast ? (
            <section className="mt-16">
              <p className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-6" style={link}>
                Your thirty little pages
              </p>
              <p className="text-[15px] italic mb-8" style={{ color: "var(--color-text-secondary)" }}>
                The line you left on each day. The pages themselves are in your journal.
              </p>
              <ol className="space-y-6">
                {allDays.map((d) => (
                  <li key={d.day}>
                    <p className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
                      Day {d.day}: {d.title}
                    </p>
                    <p className="text-[16px] leading-relaxed whitespace-pre-wrap" style={{ color: answers[d.prompt.key] ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                      {answers[d.prompt.key] || "(no note)"}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      ) : null}

      <nav className="mt-14 flex justify-between text-[14px] max-w-2xl">
        {n > 1 ? (
          <Link href={`/classes/${slug}/day/${n - 1}`} className="underline underline-offset-2" style={link}>
            Day {n - 1}
          </Link>
        ) : <span />}
        {n < c.days && isDayOpen(c, n + 1) ? (
          <Link href={`/classes/${slug}/day/${n + 1}`} className="underline underline-offset-2" style={link}>
            Day {n + 1}
          </Link>
        ) : <span />}
      </nav>
    </main>
  )
}
