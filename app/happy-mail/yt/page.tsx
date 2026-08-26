// /happy-mail/yt — V6 of the happy-mail landing family (t1096, growth strategy
// "V6: YouTube"). The link that lives in YouTube video descriptions: video
// embed, seen-it-on-YouTube framing, $9 first month via YTHM9 (minted
// 2026-08-25, once per customer, evergreen), email capture -> Klaviyo with
// signup_source. Checkout is the same mint-on-click shape as /back
// (/api/checkout/yt), so the description link never goes stale.
//
// noindex on purpose: the $9 offer is channel-scoped to YouTube viewers; the
// canonical indexable page stays /happy-mail. Video id comes from
// NEXT_PUBLIC_YT_LANDING_VIDEO_ID (JC/Amy pick the video; page renders the
// product photo until it is set).

import type { Metadata } from "next"
import YtLandingClient from "./yt-client"

export const metadata: Metadata = {
  title: "Happy Mail, as seen on YouTube | Amy Tangerine",
  description:
    "Watched Amy make it? Get Happy Mail in your own mailbox — die cuts, the newest sticker sheet, and a note from Amy, once a month.",
  robots: { index: false, follow: false },
}

export default function YtLandingPage() {
  return <YtLandingClient videoId={process.env.NEXT_PUBLIC_YT_LANDING_VIDEO_ID ?? ""} />
}
