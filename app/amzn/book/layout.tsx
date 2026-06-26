// Metadata-only layout for the Amazon book QR landing page (/amzn/book).
//
// Nested layout under the root app/layout.tsx (no <html>/<body> — one root layout
// for the app). Marks the page noindex. The page is chromeless: Nav/Footer/
// CartDrawer self-hide on /amzn/* via lib/chromeless-routes. Public (no password
// gate) so the QR works for booth visitors, but noindex since it's reached via the
// QR, not organic search. See lib/book-qr.ts + task for the build.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sunshine & Rainbows Traveler's Notebook | Amy Tangerine",
  description:
    "Grab Amy Tangerine's Sunshine & Rainbows Traveler's Notebook on Amazon, shipped to your door.",
  robots: { index: false, follow: false },
}

export default function BookQrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
