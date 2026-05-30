// /happy-mail — Happy Mail landing page (Option A). Renders for everyone.
//
// The geo-redirect (intl visitors -> /shop/happy-mail-international) was removed 2026-05-29:
// IHM is now a normal catalog product reachable via the shop grid, so this landing page no
// longer needs to fork by country. International HM subscribers reach the intl product through
// /shop or the explanatory cross-link on the intl PDP.

import HappyMailClient from "./happy-mail-client"

export default function HappyMailPage() {
  return <HappyMailClient />
}
