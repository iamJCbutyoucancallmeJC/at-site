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
