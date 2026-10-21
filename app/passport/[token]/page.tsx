// /passport/<token> — one subscriber's Happy Mail passport: a stamp for every
// envelope the mailing record says they received. Innovation lab build,
// 2026-10-21; built and HELD (not linked, not deployed, noindex).
//
// Where the stamps come from: the Happy Mail ledger in the vault (the fulfill
// logs' mark-mailed records and the consumed log), exported by
// hm-passport-export.py into data/passport.json. Not from charges. The ledger
// was built so a billing dispute could be settled from evidence; this page is
// the same evidence read as a keepsake.

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import { allTokens, getPassport, monthLabel, mailedLabel, nextMonth, shortMonth, MONTH_NAMES } from "@/lib/passport"
import { amyBrush } from "../brush-font"
import { EmptySlot, Stamp } from "../stamp"
import "../passport.css"

export const dynamicParams = false

export function generateStaticParams() {
  return allTokens().map((token) => ({ token }))
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const p = getPassport(token)
  return {
    title: p ? `${p.first}'s Happy Mail Passport | Amy Tangerine` : "Happy Mail Passport | Amy Tangerine",
    description: "Every Happy Mail envelope you've received, stamped.",
    robots: { index: false, follow: false },
  }
}

// A tilt per stamp so the spread reads as pasted by hand, not laid out by a grid.
const TILTS = [-2.2, 1.6, -1.1, 2.4, -1.8, 0.9, 1.9, -2.6]

export default async function PassportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const p = getPassport(token)
  if (!p) notFound()

  const stamps = [...p.stamps].sort((a, b) => a.month.localeCompare(b.month))
  const newest = stamps[stamps.length - 1]
  const upcoming = newest ? nextMonth(newest.month) : null
  const years = new Set(stamps.map((s) => s.month.slice(0, 4)))
  const sinceLabel = monthLabel(p.since)
  const count = stamps.length

  return (
    <main className={`hm-passport ${amyBrush.variable}`}>
      <PageEngagementTracker page="passport" />
      <section className="hm-cover">
        {/* The apostrophe is set in Epilogue: Amy's font has no apostrophe glyph. */}
        <h1 className="hm-title">{p.first}<span style={{ fontFamily: "var(--font-sans)", fontSize: "0.6em" }}>&rsquo;</span>s Happy Mail Passport</h1>
        <p className="hm-lede">
          One stamp for every envelope I've mailed you, since {sinceLabel}. Every one of these left Culver City
          with your name hand-lettered on the front.
        </p>
        <div className="hm-stat" role="status">
          <span><b>{count}</b> {count === 1 ? "envelope" : "envelopes"}</span>
          <span><b>{years.size}</b> {years.size === 1 ? "year" : "years"}</span>
          {p.plan ? <span>{p.plan === "six-month" ? "6-month" : "monthly"}</span> : null}
        </div>
      </section>

      <section className="hm-spread" aria-label="Your stamps">
        {stamps.map((s, i) => {
          const mailed = mailedLabel(s.mailed)
          return (
            <figure key={s.month} style={{ ["--tilt" as string]: `${TILTS[i % TILTS.length]}deg` }}>
              <Stamp month={s.month} mailed={s.mailed} cycle={s.cycle} brushClass={amyBrush.className} />
              <figcaption>
                <b>{monthLabel(s.month)}</b>
                <br />
                {mailed ? `mailed ${mailed}` : `mailed in ${shortMonth(s.month)}`}
              </figcaption>
            </figure>
          )
        })}
        {upcoming ? (
          <figure>
            <EmptySlot label={`${MONTH_NAMES[Number(upcoming.split("-")[1]) - 1]} ${upcoming.slice(0, 4)}`} sub="ships around the 15th" />
            <figcaption>next envelope</figcaption>
          </figure>
        ) : null}
      </section>

      <p className="hm-foot">
        Stamps come from the mailing record, not from billing. Missing one you know arrived? Tell me at{" "}
        <a href="mailto:help@amytangerine.com">help@amytangerine.com</a> and I'll add it. <Link href="/happy-mail">About Happy Mail</Link>
      </p>
    </main>
  )
}
