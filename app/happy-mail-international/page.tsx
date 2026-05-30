// /happy-mail-international — International Happy Mail (IHM) landing page.
//
// Mirrors /happy-mail (commit 61f0584): a rich landing surface. The PDP
// /shop/happy-mail-international redirects here (see app/shop/[slug]/page.tsx).
// IHM is intl-market-scoped (CA/AU/GB); a US visitor can VIEW this page but
// cannot purchase the intl product, so the page cross-links US readers to
// /happy-mail. No country-based routing (removed 2026-05-29).
//
// Unlike the US /happy-mail landing (static, flat $13), this page resolves the
// visitor's country and fetches the IHM product @inContext so the displayed
// price localizes (CA$23 / AU$23 / £13) instead of showing flat $16 USD.
// JC+Amy decision 2026-05-30: intl page shows in-country currency on the page,
// not only at checkout. Requires force-dynamic (reads per-request country).

import type { Metadata } from "next"
import { getProductByHandle, formatPrice } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"
import HappyMailInternationalClient from "./happy-mail-international-client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "International Happy Mail — Amy Tangerine",
  description:
    "Monthly Happy Mail shipped to Canada, the UK, and Australia. International postage included.",
}

export default async function HappyMailInternationalPage() {
  // Localized price for display. Country drives @inContext pricing only (CA$/AU$/£).
  // Falls back to null (client shows the flat $16 USD default) on local dev / no header /
  // a US visitor (US is null for this intl-scoped product, so we keep the $16 USD label).
  const country = await getVisitorCountry()
  const product = await getProductByHandle("happy-mail-international", country)
  const localizedPrice = product
    ? formatPrice(product.priceRange.minVariantPrice) // e.g. "CA$23.00", "£13.00", "$16.00"
    : null

  return <HappyMailInternationalClient localizedPrice={localizedPrice} />
}
