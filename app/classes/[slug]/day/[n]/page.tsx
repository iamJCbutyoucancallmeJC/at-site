// /classes/[slug]/day/[n] : one day's prompt. Needs the class cookie AND the
// day to be open by date; a future day shows its unlock date instead of the
// prompt (the URL is guessable, the content is not served early).

import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import { getClass, isDayOpen, unlockDate, formatUnlockDate } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { getClassDay } from "@/lib/class-content"

export const dynamic = "force-dynamic"

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

  return (
    <main className="max-w-2xl mx-auto px-6 pt-16 pb-24">
      <PageEngagementTracker page={`class-${slug}-day`} />
      <p className="text-[12px] mb-8">
        <Link href={`/classes/${slug}`} className="underline underline-offset-2" style={{ color: "var(--color-text-secondary)" }}>
          {c.title}
        </Link>
      </p>
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>
        Day {n} of {c.days}
      </p>

      {!open || !day ? (
        <>
          <h1 className="text-[28px] md:text-[34px] font-bold leading-tight mb-4" style={{ color: "var(--color-text-primary)" }}>
            Not yet
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Day {n} opens {formatUnlockDate(unlockDate(c, n))}. One day at a time is the point.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-[28px] md:text-[36px] font-bold leading-tight mb-6" style={{ color: "var(--color-text-primary)" }}>
            {day.title}
          </h1>
          <div className="space-y-5">
            {day.body.map((p, i) => (
              <p key={i} className="text-[17px] leading-relaxed" style={{ color: "var(--color-text-primary)" }}>
                {p}
              </p>
            ))}
          </div>
          {day.files?.length ? (
            <ul className="mt-10 space-y-2">
              {day.files.map((f) => (
                <li key={f.name}>
                  <a
                    href={`/classes/${slug}/files/${encodeURIComponent(f.name)}`}
                    className="inline-block px-5 py-2.5 rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] text-white"
                    style={{ backgroundColor: "var(--color-orange)" }}
                  >
                    {f.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      <nav className="mt-14 flex justify-between text-[14px]">
        {n > 1 ? (
          <Link href={`/classes/${slug}/day/${n - 1}`} className="underline underline-offset-2" style={{ color: "var(--color-orange)" }}>
            Day {n - 1}
          </Link>
        ) : (
          <span />
        )}
        {n < c.days ? (
          <Link href={`/classes/${slug}/day/${n + 1}`} className="underline underline-offset-2" style={{ color: "var(--color-orange)" }}>
            Day {n + 1}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  )
}
