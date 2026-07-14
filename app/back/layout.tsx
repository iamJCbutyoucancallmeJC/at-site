// Metadata-only layout for the /back re-collection landing (t766 ghost arc).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own).
// Marks the page noindex — it's reached from CS replies and re-collection
// emails, not organic search. The page is chromeless via lib/chromeless-routes.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Welcome back to Happy Mail | Amy Tangerine",
  description: "Pick your Happy Mail back up right where it paused.",
  robots: { index: false, follow: false },
}

export default function BackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
