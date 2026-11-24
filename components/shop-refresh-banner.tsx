"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OPEN_LABEL_SHORT, countdownParts, msUntilOpen } from "@/lib/shop-refresh"

// The /shop banner for the Small Business Saturday refresh (t2113). Says the
// same time as the email (lib/shop-refresh.ts). The page only renders it before
// OPEN_AT; when the clock reaches zero in an open tab it refreshes the page, and
// by then Shopify has published the new products, so they appear in the grid.

function Unit({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[64px] md:min-w-[84px]">
      <span className="text-[32px] md:text-[44px] font-bold leading-none tabular-nums" style={{ color: "var(--color-ink)" }}>
        {String(n).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-orange-ink)" }}>
        {label}
      </span>
    </div>
  )
}

export default function ShopRefreshBanner() {
  const router = useRouter()
  // Null until mounted so the server and the browser never disagree on the numbers.
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => {
      const left = msUntilOpen()
      setMs(left)
      if (left <= 0) {
        clearInterval(id)
        router.refresh()
      }
    }
    const id = setInterval(tick, 1000)
    tick()
    return () => clearInterval(id)
  }, [router])

  if (ms !== null && ms <= 0) return null
  const p = countdownParts(ms ?? 0)

  return (
    <section className="mx-4 md:mx-10 mt-6 md:mt-8" aria-label="Shop refresh countdown">
      <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8" style={{ background: "var(--color-paper)" }}>
        <div className="min-w-0">
          <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.12em] leading-tight mb-2" style={{ color: "var(--color-orange-ink)" }}>
            Small Business Saturday
          </p>
          <h2 className="text-[22px] md:text-[28px] font-bold leading-[1.2] tracking-tight mb-2" style={{ color: "var(--color-ink)" }}>
            New things from Amy&apos;s show table land here Saturday
          </h2>
          <p className="text-[16px] md:text-[18px] leading-relaxed max-w-[38rem]" style={{ color: "var(--color-ink)" }}>
            Stamp sets, books, jewelry and more, online November 28 at {OPEN_LABEL_SHORT}.
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 shrink-0" aria-live="off" style={{ visibility: ms === null ? "hidden" : "visible" }}>
          <Unit n={p.days} label="Days" />
          <Unit n={p.hours} label="Hours" />
          <Unit n={p.minutes} label="Min" />
          <Unit n={p.seconds} label="Sec" />
        </div>
      </div>
    </section>
  )
}
