// Isolated layout for Houston conference page.
// No nav, no footer, no cart — standalone purchase experience.

import React from "react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"

const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

export const metadata: Metadata = {
  title: "Happy Mail — Amy Tangerine",
  description: "Six months of happy mail from Amy Tangerine. Exclusively for conference attendees.",
  robots: { index: false, follow: false },
}

export default function HoustonLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={epilogue.variable}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
