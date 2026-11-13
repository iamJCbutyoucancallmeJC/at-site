// /join -- the on-site subscribe page (t1313 route B, built with t1092).
//
// Destination for the "join my list" link in Amy's emails, replacing Klaviyo's
// bare hosted subscribe page (manage.kmail-lists.com, white card, no logo).
// Keeps the site chrome so joining happens on amytangerine.com, tracked in
// GA4 like every other signup (newsletter_signup, source_page = join).
//
// Listed since 2026-09-09: JC ruled the capture go-live at the console queue
// (Amy edits afterwards), the popup is published and the blocks are live, so
// this page is indexable and in app/sitemap.ts. It stays off the nav. The
// form renders regardless of the NEXT_PUBLIC_CAPTURE_BLOCKS gate (ungated) so
// the join link in emails always lands on a working form. The footer skips
// its own capture block on this path.
//
// 2026-11-13 (JC, t2070): an invite link (#email=...&src=invite) signs the reader up
// on arrival and the page turns into a "You're in" note (join-client.tsx).

import type { Metadata } from "next"
import JoinClient from "./join-client"

export const metadata: Metadata = {
  title: "Join the list | Amy Tangerine",
  description: "A note from Amy when she has something to share.",
}

export default function JoinPage() {
  return (
    <main className="max-w-xl mx-auto px-6 pt-16 pb-24 text-center">
      <JoinClient />
    </main>
  )
}
