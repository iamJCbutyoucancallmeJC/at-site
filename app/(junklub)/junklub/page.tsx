// Junklub event landing page — RETIRED 2026-06-23 (t764).
//
// The Junklub event (junk-journal attendees, QR-gated $66 6-month offer) ran
// Jun 13–22, 2026 and is over. After the t764 US 6mo migration, the 6-month
// variant is the new per-delivery variant ($12 base), and this page added the
// variant WITHOUT a selling plan — which would have resolved to $12 (then $6
// after the JUNKLUB discount). Rather than leave that landmine for a stale QR
// scan, the page now redirects to the live /happy-mail product page.
//
// The next event page (Seattle Paperworld) is a fresh build with the correct
// variant + selling plan baked in — do NOT revive this file for it.

import { redirect } from "next/navigation"

export default function JunklubRetired() {
  redirect("/happy-mail")
}
