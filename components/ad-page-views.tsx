"use client"
// Ad-pixel PageView on client-side navigation (Meta Pixel + Pinterest tag).
// The snippets in app/layout.tsx send the first PageView on load and Meta's own
// history tracking is off (fbq.disablePushState), so this sends exactly one per
// route change. Mounted only when an ad pixel id is set. See lib/analytics.ts.

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { trackAdEvent } from "@/lib/analytics"

export default function AdPageViews() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)
  useEffect(() => {
    if (last.current === null) {
      last.current = pathname
      return
    }
    if (last.current === pathname) return
    last.current = pathname
    trackAdEvent("PageView")
  }, [pathname])
  return null
}
