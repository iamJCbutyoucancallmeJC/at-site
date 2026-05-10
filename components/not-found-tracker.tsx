'use client'

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackEvent } from "@/lib/analytics"

export default function NotFoundTracker() {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent("not_found_view", { path: pathname ?? "(unknown)" })
  }, [pathname])

  return null
}
