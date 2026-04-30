import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Happy Mail Subscription | Amy Tangerine",
  description:
    "Monthly craft supplies from Amy Tangerine — die cuts, stickers, and a hand-lettered envelope. $13/month or $66 for 6 months. Cancel anytime. US only.",
  openGraph: {
    title: "Happy Mail — Monthly Craft Subscription | Amy Tangerine",
    description:
      "Once a month, an envelope from Amy. Die cuts, stickers, and a personal note — your name hand-lettered on the front.",
    images: [{ url: "/images/products/happy-mail/1.jpg" }],
  },
}

export default function HappyMailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
