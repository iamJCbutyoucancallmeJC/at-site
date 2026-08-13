"use client"

import { useEffect, useState } from "react"

// d062 (t1079): date-aware first-envelope promise, rendered near the subscribe
// CTA. Policy mirror of zz_System/Scripts/lib/hm_funds_month.py (LATE_CUTOFF = 15,
// JC-ruled 2026-07-20): a charge on the 1st-14th funds THIS month's envelope; the
// 15th onward funds NEXT month's. If the policy day changes, change it there first.
const LATE_CUTOFF = 15

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function FirstEnvelopePromise() {
  // Date must be the visitor's, not the build server's: render the old static
  // line until hydration, then swap in the date-aware promise.
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])

  const style = { color: "var(--color-text-secondary)" }
  if (!now) {
    return (
      <p className="text-center text-[11px] mt-4" style={style}>
        Envelopes ship around the 15th.
      </p>
    )
  }

  const thisMonth = MONTHS[now.getMonth()]
  const nextMonth = MONTHS[(now.getMonth() + 1) % 12]
  const early = now.getDate() < LATE_CUTOFF

  return (
    <p className="text-center text-[11px] mt-4" style={style}>
      {early
        ? `Subscribe today and your first envelope is ${thisMonth}'s. Envelopes ship around the 15th.`
        : `Subscribe today and your first envelope is ${nextMonth}'s. ${thisMonth}'s envelopes are already in the mail.`}
    </p>
  )
}
