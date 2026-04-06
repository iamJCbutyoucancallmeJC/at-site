import React from "react"
import type { Metadata } from "next"
import { Nunito_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import "./globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Amy Tangerine",
  description: "Craft supplies, stickers, and die cuts by Amy Tangerine. Monthly Happy Mail subscription.",
  metadataBase: new URL("https://amytangerine.com"),
  openGraph: {
    title: "Amy Tangerine",
    description: "Craft supplies, stickers, and die cuts by Amy Tangerine. Monthly Happy Mail subscription.",
    url: "https://amytangerine.com",
    siteName: "Amy Tangerine",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className="antialiased">
        <Nav />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
