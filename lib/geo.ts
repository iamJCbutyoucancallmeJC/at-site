// Geo detection for market-aware Shopify queries.
//
// Reads the visitor's country from the Vercel-provided `x-vercel-ip-country` header
// in Server Components. Falls back to "US" if missing (local dev, non-Vercel hosts,
// or visitors Vercel couldn't geolocate). The `country` query param overrides everything
// for testing.

import { headers } from "next/headers"

// Markets we've configured in Shopify. Anything else -> US.
const SUPPORTED_COUNTRIES = new Set(["US", "CA", "AU", "GB"])

export async function getVisitorCountry(searchParams?: Record<string, string | string[] | undefined>): Promise<string> {
  // Query param override (e.g., /shop?country=CA) for testing without VPN.
  const override = searchParams?.country
  if (typeof override === "string") {
    const upper = override.toUpperCase()
    if (SUPPORTED_COUNTRIES.has(upper)) return upper
  }

  // Vercel header.
  const h = await headers()
  const country = h.get("x-vercel-ip-country")?.toUpperCase()
  if (country && SUPPORTED_COUNTRIES.has(country)) return country

  // Default to US (unsupported region or local dev).
  return "US"
}

export function isInternational(country: string): boolean {
  return country !== "US" && SUPPORTED_COUNTRIES.has(country)
}
