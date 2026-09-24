// Metadata + font layout for /signs (t1378 prototype).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own),
// same shape as app/photobooth/layout.tsx. Two jobs:
//   1. Carry the page <title>/description.
//   2. Load Quicksand, the one Google Font the site already pulls in (for the
//      photobooth). The renderer draws with it on a <canvas>, so the page reads
//      the resolved family name off the --font-quicksand variable at runtime
//      (see app/signs/page.tsx, resolveFontFamily) rather than naming the font
//      in CSS alone. No new font is added.
//
// NOT chromeless: the sign maker renders under the normal site Nav/Footer,
// like every other "Fun Stuff" route.

import type { Metadata } from "next"
import { Quicksand } from "next/font/google"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-quicksand",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sign Maker | Amy Tangerine",
  description:
    "Type a phrase and see it painted on a wooden sign, Amy Tangerine style. Save it as a PNG for stickers.",
}

export default function SignsLayout({ children }: { children: React.ReactNode }) {
  return <div className={quicksand.variable}>{children}</div>
}
