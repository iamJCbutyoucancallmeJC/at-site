// POST /api/checkout/junklub — RETIRED 2026-06-23 (t764).
//
// The Junklub event ran Jun 13–22, 2026 and is over. The page now redirects to
// /happy-mail, so this route is no longer called. It previously added the 6mo
// variant WITHOUT a selling plan; after the t764 per-delivery migration that
// would resolve to $12 (then $6 after the JUNKLUB discount), so it is disabled
// rather than left to underbill. Returns 410 Gone.

import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "The Junklub event has ended." },
    { status: 410 },
  )
}
