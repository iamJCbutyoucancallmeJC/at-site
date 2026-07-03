"use client"

// Standalone Amazon affiliate landing page for Amy's notebook (/amzn/book).
//
// Audience-neutral as of 2026-07-03: this page now serves ALL entry points —
// Amy's email newsletter, the homepage Feature Spotlight, and the Seattle Paper
// World booth QR. It is an AFFILIATE link-out (Amazon Associates tag atwbsite-20),
// NOT an AT Shopify checkout — nothing transacts on at-site; the sale and
// fulfillment are Amazon's. (Originally built booth-only 2026-06-26; copy
// generalized when the newsletter push reused it.)
//
// Chromeless (no nav/footer/cart), noindex. Mirrors the Shop My Faves affiliate
// conventions (tag, rel hygiene, disclosure, GA4 affiliate_click) so it stays
// consistent when that build ships.

import { useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"
import {
  BOOK_HREF,
  BOOK_TITLE,
  BOOK_SUBTITLE,
  BOOK_TITLE_CONFIRMED,
  AFFILIATE_DISCLOSURE,
} from "@/lib/book-qr"

// Outbound Amazon href = the tagged canonical URL (atwbsite-20). No hardcoded
// booth UTMs anymore: this page now serves ALL sources (newsletter, homepage
// spotlight, and the booth QR). Inbound source attribution comes from each
// entry point's own UTMs on the landing URL, which GA4 captures on page load.
const BOOK_HREF_OUT = BOOK_HREF

// Hero headline = the short main title once confirmed; falls back to generic
// copy if the title is ever cleared in lib/book-qr.ts.
const HEADLINE = BOOK_TITLE_CONFIRMED && BOOK_TITLE ? BOOK_TITLE : "Amy's new notebook."

export default function BookQrPage() {
  const [clicked, setClicked] = useState(false)

  function handleBuy() {
    setClicked(true)
    trackEvent("affiliate_click", {
      product_name: BOOK_TITLE || "Amy Tangerine book (KDP)",
      list_title: "sunshine-rainbows",
      source: "amzn-book",
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
          New from Amy Tangerine
        </p>
        <h1
          className="text-[36px] md:text-[48px] font-bold leading-[1.05] tracking-tight mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          {HEADLINE}
        </h1>
        {BOOK_TITLE_CONFIRMED && BOOK_SUBTITLE && (
          <p
            className="text-[15px] md:text-[16px] font-medium leading-snug mb-5 max-w-md mx-auto"
            style={{ color: "var(--color-text-primary)" }}
          >
            {BOOK_SUBTITLE}
          </p>
        )}
        <p
          className="text-[16px] md:text-[18px] leading-relaxed mb-3"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Amy&rsquo;s new traveler&rsquo;s notebook — a colorful foundation for
          creativity, memories, and everyday joy. Grab your copy on Amazon and have
          it shipped straight to your door.
        </p>
        <p
          className="text-[14px] leading-relaxed mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          75 pages of prompts and inspiration to make your own.
        </p>

        {/* CTA — affiliate link-out to Amazon (new tab, sponsored/nofollow) */}
        <a
          href={BOOK_HREF_OUT}
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

        {/* Cover image — below the CTA (per booth-page direction). Centered,
            contained cover at a capped width; the art already carries the title. */}
        <div className="mt-10 flex justify-center">
          <Image
            src="/images/book/sunshine-rainbows-cover.jpeg"
            alt="Sunshine &amp; Rainbows Traveler's Notebook cover by Amy Tangerine"
            width={719}
            height={1399}
            className="w-[260px] md:w-[280px] h-auto rounded-2xl"
            style={{ border: "1px solid var(--color-border)" }}
            priority
          />
        </div>
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
