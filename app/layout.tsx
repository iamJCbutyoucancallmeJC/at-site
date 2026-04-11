import React from "react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import CartDrawer from "@/components/cart-drawer"
import { CartProvider } from "@/context/cart"
import "./globals.css"

const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-sans", display: "swap" })

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
    <html lang="en" className={epilogue.variable}>
      <body className="antialiased">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_title: document.title,
                send_page_view: true
              });
            `}</Script>
          </>
        )}
        <CartProvider>
          <Nav />
          {children}
          <Footer />
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
