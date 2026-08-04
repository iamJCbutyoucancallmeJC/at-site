// Metadata + font layout for /photobooth (t897 port).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own).
// Two jobs:
//   1. Carry the standalone booth's <title> and its zoom-locked viewport, so a
//      double-tap on the capture button doesn't zoom the page on mobile.
//   2. Load Quicksand. The site runs on Epilogue; the booth has always been
//      Quicksand, and keeping it is part of "the look doesn't change." Scoped to
//      this route via the --font-quicksand variable, which app/photobooth/
//      photobooth.css reads — no effect on any other page.
//
// NOT chromeless: the booth renders under the normal site Nav/Footer, which is
// the point of the port (it lives on the site now). Flipping it would mean
// adding "/photobooth" to lib/chromeless-routes.ts — one line.

import type { Metadata, Viewport } from "next"
import { Quicksand } from "next/font/google"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Photo Booth | Amy Tangerine",
  description:
    "Amy Tangerine's photo booth — take four photos, pick a filter, and save your strip.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return <div className={quicksand.variable}>{children}</div>
}
