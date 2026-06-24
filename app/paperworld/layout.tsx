// Metadata-only layout for the Seattle Paper World event page (t824).
//
// This is a NESTED layout under the root app/layout.tsx (it does NOT render its
// own <html>/<body> — there is one root layout for the whole app). Its only job
// is to mark the page noindex. The page itself is chromeless: Nav, Footer, and
// CartDrawer self-hide on this route via lib/chromeless-routes, so the visitor
// sees a standalone event landing with no site nav, footer, or cart drawer.
//
// Public at /paperworld (the QR destination on Amy's booth signage), but kept
// noindex on purpose — like the prior junklub/houston event pages, it's reached
// via the QR, not organic search, and shouldn't linger in Google after the show.
// NOTE: checkout 409s until the PAPERWORLD discount is created + ACTIVE in
// Shopify (scoped to variant 52363362861376, June-27 date window).

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Happy Mail — Paper World Exclusive | Amy Tangerine",
  description:
    "Six months of happy mail from Amy Tangerine. An event-only price for Paper World Stationery Expo friends.",
  robots: { index: false, follow: false },
}

export default function PaperworldLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
