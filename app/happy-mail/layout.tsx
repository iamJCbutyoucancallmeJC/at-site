import type { Metadata } from "next"

// Prices in the description below MUST stay in sync with PRICE_MONTHLY +
// PRICE_6MONTH in app/happy-mail/page.tsx. Static here because Next metadata
// resolution doesn't support runtime imports cleanly; revisit if pricing
// strategy changes more than once a year.
export const metadata: Metadata = {
  title: "Happy Mail Subscription | Amy Tangerine",
  description:
    "Monthly craft supplies from Amy Tangerine — die cuts, stickers, and an envelope from Amy. $13/month or $72 for 6 months. Cancel anytime. Available in US, Canada, Australia, and UK ($16/mo international).",
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
