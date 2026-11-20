import type { Metadata } from "next"

// Prices in the description below MUST stay in sync with PRICE_MONTHLY +
// PRICE_6MONTH in app/happy-mail/page.tsx. Static here because Next metadata
// resolution doesn't support runtime imports cleanly; revisit if pricing
// strategy changes more than once a year.
export const metadata: Metadata = {
  title: "Happy Mail Subscription | Amy Tangerine",
  alternates: { canonical: "/happy-mail" },
  // [t658] 6-month meta corrected (2026-05-29): was "$72 for 6 months. Cancel anytime." — "cancel anytime" overstates the
  // 6-month, which is a renewing commitment (cancel stops next renewal, not the current term). Options:
  //   A (live): "$13/month or $72 every 6 months. Monthly cancels anytime; 6-month is a renewing commitment."
  //   B:        "$13/month, or $72 for a renewing 6-month plan."
  // Final wording = JC+Amy. Do not mark t658 done.
  description:
    "Monthly craft supplies from Amy Tangerine — die cuts, stickers, and an envelope from Amy. $13/month or $72 every 6 months. Monthly cancels anytime; 6-month is a renewing commitment. Available in the US and 17 other countries ($16/mo international).",
  openGraph: {
    title: "Happy Mail — Monthly Craft Subscription | Amy Tangerine",
    description:
      "Once a month, an envelope from Amy. Die cuts, stickers, and a personal note. The good kind of mail.",
    // Phase 5 (2026-11-20): a 1200x630 cut of the newest envelope flat lay (the old
    // image was a 2500x2864 portrait that every share card cropped to its middle).
    images: [{ url: "/og/happy-mail.jpg", width: 1200, height: 630 }],
  },
}

export default function HappyMailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
