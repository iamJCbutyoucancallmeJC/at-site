import type { Metadata } from "next"

// Prices in the description below MUST stay in sync with PRICE_MONTHLY +
// PRICE_6MONTH in app/happy-mail/page.tsx. Static here because Next metadata
// resolution doesn't support runtime imports cleanly; revisit if pricing
// strategy changes more than once a year.
export const metadata: Metadata = {
  title: "Happy Mail Subscription | Amy Tangerine",
  // [t658] 6-month meta corrected (2026-05-29): was "$72 for 6 months. Cancel anytime." — "cancel anytime" overstates the
  // 6-month, which is a renewing commitment (cancel stops next renewal, not the current term). Options:
  //   A (live): "$13/month or $72 every 6 months. Monthly cancels anytime; 6-month is a renewing commitment."
  //   B:        "$13/month, or $72 for a renewing 6-month plan."
  // Final wording = JC+Amy. Do not mark t658 done.
  description:
    "Monthly craft supplies from Amy Tangerine — die cuts, stickers, and an envelope from Amy. $13/month or $72 every 6 months. Monthly cancels anytime; 6-month is a renewing commitment. Available in US, Canada, Australia, and UK ($16/mo international).",
  openGraph: {
    title: "Happy Mail — Monthly Craft Subscription | Amy Tangerine",
    description:
      "Once a month, an envelope from Amy. Die cuts, stickers, and a personal note. The good kind of mail.",
    images: [{ url: "/images/products/happy-mail/1.jpg" }],
  },
}

export default function HappyMailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
