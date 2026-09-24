// /classes/* : the gated class delivery surface (t1102, Classes v1).
//
// NESTED layout under the root app/layout.tsx. Every page here is behind a
// per-class cookie set by the magic link (app/classes/[slug]/access), so
// nothing under this path is indexable: noindex here, absent from
// app/sitemap.ts and the nav, and NOT in robots.ts (a Disallow line would
// publish the path). The site chrome stays: the class lives on Amy's site.
//
// Distinct from /class/<city>, the unlisted post-workshop photo pages.

import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
