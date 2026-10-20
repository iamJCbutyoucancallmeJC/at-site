// Metadata + font layout for /signs (t1378).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own),
// same shape as app/photobooth/layout.tsx. Two jobs:
//   1. Carry the page <title>/description.
//   2. Load the two fonts the sign maker draws with. Anton is the letters: the
//      nearest free face to the heavy condensed caps on the slide-in letter
//      cards in Amy's reference photo. Quicksand is the page chrome and the
//      watermark, the same font the photobooth uses. Both are exposed as CSS
//      variables; app/signs/page.tsx reads the resolved family names off them
//      at runtime so the <canvas> can use them.
//
// NOT chromeless: the sign maker renders under the normal site Nav/Footer,
// like every other "Fun Stuff" route.

import type { Metadata } from "next"
import { Anton, Quicksand } from "next/font/google"

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
})

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-quicksand",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sign Maker | Amy Tangerine",
  description:
    "Type a phrase and see it go up on a letter-board sign, one card at a time. Save it as a PNG for stickers.",
}

export default function SignsLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${quicksand.variable} ${anton.variable}`}>{children}</div>
}
