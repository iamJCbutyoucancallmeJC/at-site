// The visitor's own calendar date, for the class day gate (server-only).
//
// Vercel geolocates every request and hands us the visitor's IANA zone in
// `x-vercel-ip-timezone`. Same header family as lib/geo.ts, which has colored
// Shopify pricing off x-vercel-ip-country since May 2026, so it is a proven
// source on this project rather than a new dependency.
//
// A missing header means local dev or a visitor Vercel could not place. Those
// fall back to Pacific, which is exactly the behavior the class shipped with,
// so the fallback can only ever be as wrong as the old gate was.
//
// This is IP geolocation, not the device clock: a student on a VPN or mid-flight
// gets the zone of the exit node and can be a day off either way. That is
// survivable for a journaling prompt, and the gate has to live on the server
// because the day URLs are guessable (the whole point of the files allow-list).

import "server-only"
import { headers } from "next/headers"
import { laDate, zonedDate } from "@/lib/classes"

// The IANA zone Vercel assigned this request, or null off-platform.
export async function viewerTimeZone(): Promise<string | null> {
  const h = await headers()
  const tz = h.get("x-vercel-ip-timezone")?.trim()
  return tz ? tz : null
}

// The date on the student's own wall calendar, as YYYY-MM-DD.
export async function viewerDate(at: Date = new Date()): Promise<string> {
  const tz = await viewerTimeZone()
  return tz ? zonedDate(tz, at) : laDate(at)
}
