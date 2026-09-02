// Metadata-only layout for /class/* — post-workshop pages for the people who
// were in the room (t1246; first instance: /class/orlando, Paper World
// Stationery Expo, Aug 29 2026).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own).
// Its one job is to mark every /class/* page noindex. These pages are reached
// from the note Amy sends the class, not from search, and they hold photos of
// real attendees — so they are deliberately unlisted: noindex here, absent
// from app/sitemap.ts, absent from the nav, and NOT added to robots.ts
// (a Disallow line would publish the path).
//
// Unlike the QR event landings (/paperworld, /keep) these pages KEEP the site
// chrome: the whole point of the follow-up is to bring the class onto Amy's
// site, so nav + footer stay.
//
// Convention for the next stop: app/class/<city>/page.tsx + photos in
// public/images/<city>-<year>/. Nothing else to register.

import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ClassLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
