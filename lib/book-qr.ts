// Config for the standalone Amazon book QR landing page (/amzn/book).
//
// This is a small, self-contained affiliate landing for Amy's KDP book, built to
// be deployable NOW — independent of the larger Shop My Faves affiliate build
// (lib/affiliate.ts + /shop-my-faves), which is on an unmerged branch. It mirrors
// that build's conventions (same Associates tag, same outbound hygiene, same GA4
// affiliate_click event, same disclosure) so the two stay consistent. When the
// affiliate shop ships, this book can also become a featured pick there; this page
// is the booth/QR front door.

// Amy's KDP book. The amzn.to short link she gave resolves to this ASIN.
export const BOOK_ASIN = "B0H414S9DK"

// RAW canonical product URL (no tag — the tag is appended at render, one place).
export const BOOK_AMAZON_URL = `https://www.amazon.com/dp/${BOOK_ASIN}`

// Confirmed 2026-06-26 from the live Amazon listing (JC).
// Full title: "Sunshine & Rainbows Traveler's Notebook: A Colorful Foundation
// for Creativity, Memories & Everyday Joy" — by Amy Tangerine, paperback, 75 pp.
// The hero uses the short main title; the subtitle renders below it.
// (No price on the page — Amazon prohibits cached/scraped prices.)
export const BOOK_TITLE = "Sunshine & Rainbows"
export const BOOK_SUBTITLE =
  "A Traveler's Notebook for creativity, memories & everyday joy"
export const BOOK_TITLE_CONFIRMED = true

// Amazon Associates tag — SAME tag as the Shop My Faves build (atwbsite-20, the
// site-specific tag Amy created 2026-06-24, NOT her storefront influencer tag).
// Override via env to keep both surfaces in lockstep.
export const AMAZON_ASSOCIATES_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG || "atwbsite-20"

// FTC / Amazon-required verbatim disclosure. Do not alter — it protects Amy's
// live Associates account. Same string the affiliate shop uses.
export const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate, Amy earns from qualifying purchases."

// Append the Associates tag (replacing any existing tag) so the tag lives in ONE
// place. Mirrors lib/affiliate.ts withTag().
export function withTag(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.set("tag", AMAZON_ASSOCIATES_TAG)
    return u.toString()
  } catch {
    const sep = url.includes("?") ? "&" : "?"
    return `${url}${sep}tag=${encodeURIComponent(AMAZON_ASSOCIATES_TAG)}`
  }
}

// The tagged outbound href the page's CTA uses.
export const BOOK_HREF = withTag(BOOK_AMAZON_URL)
