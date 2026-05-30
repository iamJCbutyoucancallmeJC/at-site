// /happy-mail — Happy Mail landing page (Option A). Renders for everyone.
//
// The geo-redirect (intl visitors -> /shop/happy-mail-international) was removed 2026-05-29:
// IHM is now a normal catalog product reachable via the shop grid, so this landing page no
// longer needs to fork by country. International HM subscribers reach the intl product through
// /shop or the explanatory cross-link on the intl PDP.

import { Suspense } from "react"
import HappyMailClient from "./happy-mail-client"

// HappyMailClient reads ?plan= via useSearchParams (to pre-select the 6-Month plan when
// redirected here from a 6-Month cart item), which requires a Suspense boundary.
export default function HappyMailPage() {
  return (
    <Suspense>
      <HappyMailClient />
    </Suspense>
  )
}
