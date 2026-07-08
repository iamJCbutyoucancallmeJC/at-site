// Metadata-only layout for the /keep renewal landing (cliff campaign, t759/t821).
//
// NESTED layout under the root app/layout.tsx (no <html>/<body> of its own).
// Its only job is to mark the page noindex. The page is chromeless: Nav, Footer,
// and CartDrawer self-hide via lib/chromeless-routes, so the visitor sees a
// standalone landing — reached from the in-envelope card QR (envelope 6 of 6)
// or the renewal emails, not organic search.
//
// NOTE: checkout 409s with a friendly message once the ORIGINAL66 code expires
// (Aug 3 Pacific) — the page can stay up harmlessly after the window closes.

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keep your Happy Mail coming | Amy Tangerine",
  description:
    "Six more months of Happy Mail at your original price — a thank-you for being one of the first.",
  robots: { index: false, follow: false },
}

export default function KeepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
