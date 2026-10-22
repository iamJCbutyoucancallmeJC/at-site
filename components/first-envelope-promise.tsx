"use client"

import { useEffect, useState } from "react"
import hmPolicy from "@/lib/hm-policy.json"

// d062 (t1079): date-aware first-envelope promise, rendered near the subscribe
// CTA. D1 ruled INCLUSIVE 2026-09-02: subscribe on the 1st through the stated cutoff day
// and your first envelope is THIS month's; the day after, NEXT month's. Same sense as the
// FAQ's "Order by the Nth" on this page, which reads the same file.
// [t1307, ledger P3] The day comes from lib/hm-policy.json, generated from the Happy Mail
// month policy record by the vault's hm-policy-sync.py and committed with each month's
// ruling. Never edit the number here or in the JSON by hand.
const LATE_CUTOFF = hmPolicy.stated_cutoff_day

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
  const early = now.getDate() <= LATE_CUTOFF

  return (
    <p className="text-center text-[11px] mt-4" style={style}>
      {early
        ? `Subscribe today and your first envelope is ${thisMonth}'s. Envelopes ship around the 15th.`
        : `Subscribe today and your first envelope is ${nextMonth}'s. ${thisMonth}'s envelopes are already in the mail.`}
    </p>
  )
}
