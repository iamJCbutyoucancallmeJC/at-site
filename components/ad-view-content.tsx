"use client"
// A distinct ad "view" for a landing page ads point at (Meta ViewContent,
// Pinterest pagevisit), e.g. /gift. No-op unless an ad pixel is loaded.

import { useEffect, useRef } from "react"
import { trackAdEvent } from "@/lib/analytics"

export default function AdViewContent({ contentName, value }: { contentName: string; value?: number }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    trackAdEvent("ViewContent", { content_name: contentName, ...(value !== undefined ? { value, currency: "USD" } : {}) })
  }, [contentName, value])
  return null
}
