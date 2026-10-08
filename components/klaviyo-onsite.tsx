"use client"

// Klaviyo onsite script + the forms bridge (t1092), gated by route.
//
// The onsite script renders Amy's timed/exit-intent popup on every page it
// loads on. Chromeless routes (lib/chromeless-routes: booth QR landings,
// /keep, /back, /amzn) are single-purpose pages reached from a printed code or
// a campaign link, with their own capture or a single buy button; a popup there
// covers the button on a phone and double-asks for the email the page already
// asks for (seen on /events/<slug>/booth, 2026-10-07, event kit t1101). Same
// self-hide pattern as Nav and Footer. The popup's own targeting lives in
// Klaviyo's form builder (browser-only); this is the code-side guard.

import Script from "next/script"
import { usePathname } from "next/navigation"
import KlaviyoFormsBridge from "@/components/klaviyo-forms-bridge"
import { isChromelessRoute } from "@/lib/chromeless-routes"

export default function KlaviyoOnsite({ companyId }: { companyId: string }) {
  const pathname = usePathname()
  if (isChromelessRoute(pathname)) return null
  return (
    <>
      <Script src={`https://static.klaviyo.com/onsite/js/${companyId}/klaviyo.js`} strategy="afterInteractive" />
      <KlaviyoFormsBridge />
    </>
  )
}
