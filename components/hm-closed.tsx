"use client"

import { useEffect, useState } from "react"
import { hmIsClosed } from "@/lib/happy-mail-content"

// October 2026 cap (t1702). Returns null until mounted, then whether Happy Mail is
// closed in Pacific time. Same shape as first-envelope-promise.tsx: the date must
// be evaluated in the browser after hydration, or the server and client renders
// differ and React throws a hydration error on every subscribe page. Callers
// render NO buy button and NO waitlist form while the value is null.
export function useHmClosed(): boolean | null {
  const [closed, setClosed] = useState<boolean | null>(null)
  useEffect(() => setClosed(hmIsClosed()), [])
  return closed
}

// Placeholder that holds the buttons' height while the date check runs, so the
// plan cards do not jump when the real control lands.
export function HmButtonPlaceholder() {
  return <div aria-hidden className="w-full py-3 rounded-full" style={{ minHeight: 44 }} />
}
