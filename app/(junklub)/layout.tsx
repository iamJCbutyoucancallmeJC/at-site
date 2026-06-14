// Isolated layout for the Junklub event page.
// No nav, no footer, no cart — standalone purchase experience reached via QR.

import React from "react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"

const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

export const metadata: Metadata = {
  title: "Happy Mail — Junklub Exclusive | Amy Tangerine",
  description:
    "Six months of happy mail from Amy Tangerine. An event-only price for Junklub friends.",
  robots: { index: false, follow: false },
}

export default function JunklubLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={epilogue.variable}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
