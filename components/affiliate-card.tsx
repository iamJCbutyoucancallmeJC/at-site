"use client"

import { trackEvent } from "@/lib/analytics"
import type { AffiliatePick } from "@/lib/affiliate"

interface AffiliateCardProps {
  pick: AffiliatePick
  /** Pre-tagged outbound href (built server-side via amazonHref). */
  href: string
  /** The list this card belongs to, for GA4 attribution. */
  listTitle: string
}

/**
 * One affiliate product card. Links OUT to Amazon in a new tab with affiliate-
 * correct rel attributes, and fires a GA4 `affiliate_click` on click so Amy can
 * see which picks drive outbound clicks (deeper conversion lives in her Amazon
 * Associates dashboard). No price is shown -- Amazon prohibits cached prices.
 */
export default function AffiliateCard({ pick, href, listTitle }: AffiliateCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      // sponsored + nofollow are the correct rel for paid affiliate links (protects
      // SEO and follows Amazon/FTC norms); noopener for new-tab security.
      rel="noopener sponsored nofollow"
      onClick={() =>
        trackEvent("affiliate_click", {
          product_name: pick.title,
          list_title: listTitle,
          destination: href,
          page: "shop-my-faves",
        })
      }
      className="group flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg"
      style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}
    >
      {/* Image (square). Falls back to a branded placeholder when no image is set
          yet -- SiteStripe images are loaded in t816. */}
      <div
        className="relative w-full aspect-square overflow-hidden"
        style={{ background: "var(--color-gray-light)" }}
      >
        {pick.imageUrl ? (
          // Third-party (Amazon/SiteStripe) images are not on an allowed next/image
          // host, and we never know their dimensions, so a plain <img> is correct
          // here. object-contain keeps product shots from being awkwardly cropped.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pick.imageUrl}
            alt={pick.imageAlt}
            loading="lazy"
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-[11px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Amy&rsquo;s pick
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3
          className="text-[15px] font-bold leading-snug mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {pick.title}
        </h3>
        {pick.note && (
          <p
            className="text-[13px] leading-relaxed mb-4 flex-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {pick.note}
          </p>
        )}
        <span
          className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors group-hover:opacity-90"
          style={{ background: "var(--color-orange)" }}
        >
          Shop on Amazon
          <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </a>
  )
}
