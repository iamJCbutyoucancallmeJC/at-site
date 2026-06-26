"use client"

// Standalone Amazon book QR landing page (/amzn/book).
//
// The booth scenario: Amy is debuting her KDP book at Seattle Paper World and may
// sell out of the physical copies she brought. This page is the QR she hands to
// interested customers so they can buy it on Amazon. It is an AFFILIATE link-out
// (Amazon Associates tag atwbsite-20), NOT an AT Shopify checkout — nothing
// transacts on at-site; the sale and fulfillment are Amazon's.
//
// Chromeless (no nav/footer/cart) like the Paper World event page, reached via QR,
// noindex. Mirrors the Shop My Faves affiliate conventions (tag, rel hygiene,
// disclosure, GA4 affiliate_click) so it stays consistent when that build ships.

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import {
  BOOK_HREF,
  BOOK_TITLE,
  BOOK_TITLE_CONFIRMED,
  AFFILIATE_DISCLOSURE,
} from "@/lib/book-qr"

// UTM tags so booth scans are attributable in GA4 (mirrors the Paper World QR
// convention). The affiliate_click event below is the on-site signal; UTM tags
// the landing visit.
const BOOK_HREF_UTM = (() => {
  try {
    const u = new URL(BOOK_HREF)
    u.searchParams.set("utm_source", "booth-qr")
    u.searchParams.set("utm_medium", "qr")
    u.searchParams.set("utm_campaign", "paperworld-seattle-book")
    return u.toString()
  } catch {
    return BOOK_HREF
  }
})()

// Generic, always-correct hero copy. If Amy confirms the exact title, set
// BOOK_TITLE in lib/book-qr.ts and it appears here automatically.
const HEADLINE = BOOK_TITLE_CONFIRMED && BOOK_TITLE ? BOOK_TITLE : "Amy's new book."

export default function BookQrPage() {
  const [clicked, setClicked] = useState(false)

  function handleBuy() {
    setClicked(true)
    trackEvent("affiliate_click", {
      product_name: BOOK_TITLE || "Amy Tangerine book (KDP)",
      list_title: "paperworld-booth",
      source: "paperworld",
      page: "amzn-book",
    })
    // Let the analytics call fire, then the native <a> navigation proceeds.
  }

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* Header — logo only, no nav */}
      <header
        className="flex items-center justify-center py-5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Image
          src="/images/amy-tangerine-logo.png"
          alt="Amy Tangerine"
          width={140}
          height={40}
          className="object-contain"
          priority
        />
      </header>

      {/* Disclosure — top (Amazon-required, verbatim) */}
      <div
        className="py-2 px-4 text-center text-[11px] leading-snug"
        style={{ background: "var(--color-gray-light)", color: "var(--color-text-secondary)" }}
      >
        {AFFILIATE_DISCLOSURE}
      </div>

      {/* Hero */}
      <section className="max-w-xl mx-auto px-6 pt-12 md:pt-16 pb-10 text-center">
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
          style={{ color: "var(--color-orange)" }}
        >
          Just for friends at the booth
        </p>
        <h1
          className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          {HEADLINE}
        </h1>
        <p
          className="text-[16px] md:text-[18px] leading-relaxed mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Thanks for stopping by! If we&rsquo;ve sold out at the table, you can grab
          your copy on Amazon and have it sent straight to your door.
        </p>
        <p
          className="text-[14px] leading-relaxed mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Same book, shipped to you. No carrying it around the show.
        </p>

        {/* CTA — affiliate link-out to Amazon (new tab, sponsored/nofollow) */}
        <a
          href={BOOK_HREF_UTM}
          target="_blank"
          rel="noopener sponsored nofollow"
          onClick={handleBuy}
          className="inline-flex items-center justify-center gap-2 px-10 py-4 text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 hover:opacity-90"
          style={{ background: "var(--color-orange)" }}
        >
          Get it on Amazon
        </a>

        <p
          className="mt-4 text-[12px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {clicked ? "Opening Amazon in a new tab…" : "Opens Amazon in a new tab"}
        </p>
      </section>

      {/* Footer — minimal + disclosure echo */}
      <footer
        className="py-6 px-6 text-center text-[12px]"
        style={{ color: "var(--color-text-secondary)", borderTop: "1px solid var(--color-border)" }}
      >
        <p className="mb-2">{AFFILIATE_DISCLOSURE}</p>
        <p>
          Questions?{" "}
          <a
            href="mailto:help@amytangerine.com"
            className="underline hover:opacity-70"
            style={{ color: "var(--color-orange)" }}
          >
            help@amytangerine.com
          </a>
          {" "}&middot; amytangerine.com
        </p>
      </footer>
    </main>
  )
}
