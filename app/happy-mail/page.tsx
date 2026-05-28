// /happy-mail — Server wrapper. Geo-redirects intl visitors to /shop/happy-mail-international
// (Path B PDP — different product, different price, different Recharge plan). US visitors get
// the Option A landing page client component below.

import { redirect } from "next/navigation"
import { getVisitorCountry, isInternational } from "@/lib/geo"
import HappyMailClient from "./happy-mail-client"

// Dynamic rendering: redirect target varies by visitor country.
export const dynamic = "force-dynamic"

export default async function HappyMailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const country = await getVisitorCountry(sp)
  if (isInternational(country)) {
    redirect("/shop/happy-mail-international")
  }
  return <HappyMailClient />
}
