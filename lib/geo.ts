// Geo detection for market-aware Shopify PRICING CONTEXT.
//
// Reads the visitor's country from the Vercel-provided `x-vercel-ip-country` header in Server
// Components and passes it to Shopify via @inContext so prices localize (CA$, AU$, £). Falls back
// to "US" if missing (local dev, non-Vercel hosts, or visitors Vercel couldn't geolocate) -- a
// missing header is harmless: the storefront shows USD base prices and Shopify checkout still
// localizes at the cart step.
//
// 2026-05-29: the `?country=` query-param override and all geo-based ROUTING (symmetric
// US<->intl PDP redirects, the /happy-mail redirect) were removed. Country now only colors
// pricing; it never changes which page/product a visitor lands on. The fragile launch-eve
// behavior lived in the routing, not here.

import { headers } from "next/headers"

// Markets configured in Shopify. Anything else -> US (base-currency) context.
const SUPPORTED_COUNTRIES = new Set(["US", "CA", "AU", "GB"])

export async function getVisitorCountry(): Promise<string> {
  const h = await headers()
  const country = h.get("x-vercel-ip-country")?.toUpperCase()
  if (country && SUPPORTED_COUNTRIES.has(country)) return country

  // Default to US (unsupported region or local dev).
  return "US"
}

export function isInternational(country: string): boolean {
  return country !== "US" && SUPPORTED_COUNTRIES.has(country)
}

// International Happy Mail countries (t2196, 2026-11-19). The original three sit in the
// "International" market with the shop catalog; the 13 added 11/19 sit in the
// "International Happy Mail" market, whose catalog holds ONLY the IHM product (JC ruled
// Happy Mail only, 11/16). They are deliberately NOT in SUPPORTED_COUNTRIES: the home page
// and shop grid read the catalog for the visitor's country, and an IHM-only catalog would
// show a one-product shop and a not-found page on every shop item. Only the IHM page reads
// this list, so only that page shows the local price. Germany is held (USPS 11/13 notice).
// Runbook: vault A5 Job/Linslow/Clients/Amy Tangerine/Happy Mail/ihm-expansion-runbook.md.
export const IHM_COUNTRIES = new Set([
  "CA", "AU", "GB",
  "NZ", "JP", "IL", "CH", "IE", "NL", "FR", "BE", "AT", "SE", "DK", "FI", "NO",
])

export async function getIhmVisitorCountry(): Promise<string> {
  const h = await headers()
  const country = h.get("x-vercel-ip-country")?.toUpperCase()
  if (country && IHM_COUNTRIES.has(country)) return country
  return "US"
}
