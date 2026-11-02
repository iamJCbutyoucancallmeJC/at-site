import React from "react"
import type { Metadata } from "next"
import { Epilogue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import CartDrawer from "@/components/cart-drawer"
import KlaviyoOnsite from "@/components/klaviyo-onsite"
import AdPageViews from "@/components/ad-page-views"
import { CartProvider } from "@/context/cart"
import "./globals.css"

// Ad pixels (docs/ad-tracking.md): dark until the ids land in Vercel env. Digits
// only, because each id is written into an inline script.
const META_PIXEL_ID = /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "") ? process.env.NEXT_PUBLIC_META_PIXEL_ID : ""
const PINTEREST_TAG_ID = /^\d+$/.test(process.env.NEXT_PUBLIC_PINTEREST_TAG_ID ?? "") ? process.env.NEXT_PUBLIC_PINTEREST_TAG_ID : ""

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
    // Default share image (design critic 2026-10). Pages that define their own
    // openGraph block (app/happy-mail/layout.tsx, app/blog/page.tsx) replace
    // this object wholesale, so they need their own `images` to show one.
    images: [{ url: "https://www.amytangerine.com/og.png", width: 1200, height: 630 }],
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
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){window.dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_title: document.title,
                    send_page_view: true
                  });
                `,
              }}
            />
          </>
        )}
        {/* Meta Pixel + Pinterest tag. beforeInteractive so the fbq/pintrk queues
            exist before any page effect fires an event (a /gift landing sends
            ViewContent on mount). The stubs only queue calls and load the vendor
            script async, so nothing blocks render. Events: lib/analytics.ts
            trackAdEvent; Purchase is server-side (lib/ad-conversions.ts). */}
        {META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq.disablePushState = true;
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {PINTEREST_TAG_ID && (
          <Script
            id="pinterest-tag"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(
                Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";
                var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];
                r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                pintrk('load', '${PINTEREST_TAG_ID}');
                pintrk('page');
              `,
            }}
          />
        )}
        {(META_PIXEL_ID || PINTEREST_TAG_ID) && <AdPageViews />}
        {/* Klaviyo onsite (t1092): serves Klaviyo-native signup forms (the D3
            timed/exit-intent popup Amy designs in Klaviyo's builder) once the
            company id lands in Vercel env. Renders nothing until then, and
            nothing on chromeless routes (components/klaviyo-onsite, t1101). */}
        {process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID && (
          <KlaviyoOnsite companyId={process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID} />
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
