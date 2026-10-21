// /passport — what a Happy Mail passport is, with the sample passport as the
// demonstration. HELD prototype (innovation lab, 2026-10-21): not in the nav,
// not in the sitemap, noindex. A subscriber reaches their own passport only
// through their token link; there is no lookup by email here on purpose.

import type { Metadata } from "next"
import Link from "next/link"
import { loadPassports } from "@/lib/passport"
import { amyBrush } from "./brush-font"
import { Stamp } from "./stamp"
import "./passport.css"

export const metadata: Metadata = {
  title: "Happy Mail Passport | Amy Tangerine",
  description: "A stamp for every Happy Mail envelope you've received.",
  robots: { index: false, follow: false },
}

export default function PassportIndex() {
  const sample = loadPassports().subscribers[0]
  const latest = [...sample.stamps].sort((a, b) => b.month.localeCompare(a.month)).slice(0, 4).reverse()
  return (
    <main className={`hm-passport ${amyBrush.variable}`}>
      <section className="hm-cover">
        <h1 className="hm-title">Happy Mail Passport</h1>
        <p className="hm-lede">
          Every envelope I mail you earns a stamp. Your passport collects them: the month, the day it left Culver
          City, and the number it was in your run. The link to yours is in your Happy Mail email each month.
        </p>
      </section>
      <section className="hm-spread" aria-label="Sample stamps">
        {latest.map((s) => (
          <figure key={s.month}>
            <Stamp month={s.month} mailed={s.mailed} cycle={s.cycle} brushClass={amyBrush.className} />
          </figure>
        ))}
      </section>
      <p className="hm-foot">
        A sample passport is at <Link href={`/passport/${sample.token}`}>/passport/{sample.token}</Link>. <Link href="/happy-mail">About Happy Mail</Link>
      </p>
    </main>
  )
}
