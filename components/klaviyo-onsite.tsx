"use client"
// Klaviyo onsite (klaviyo.js + the forms bridge), skipped on the gated class
// surface: a student who has paid should never see the newsletter popup
// over their class (2026-10-07, Glimmers container).

import Script from "next/script"
import { usePathname } from "next/navigation"
import KlaviyoFormsBridge from "@/components/klaviyo-forms-bridge"

const SKIP_PREFIXES = ["/classes"]

export default function KlaviyoOnsite({ companyId }: { companyId: string }) {
  const pathname = usePathname() ?? ""
  if (SKIP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null
  return (
    <>
      <Script src={`https://static.klaviyo.com/onsite/js/${companyId}/klaviyo.js`} strategy="afterInteractive" />
      <KlaviyoFormsBridge />
    </>
  )
}
