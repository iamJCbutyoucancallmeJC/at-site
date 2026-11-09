"use client"

import { trackEvent } from "@/lib/analytics"
import type { AffiliatePick } from "@/lib/affiliate"

interface AffiliateSpotlightProps {
  pick: AffiliatePick
  /** Pre-tagged outbound Amazon href (built server-side via amazonHref). */
  href: string
  listTitle: string
}

/**
 * A featured pick shown wide: Amy's own photo on one side, her note and the
 * links on the other. Used for a friend moment (an author she knows, a photo of
 * the two of them) so it reads as a story, not one tile among twenty.
 */
export default function AffiliateSpotlight({ pick, href, listTitle }: AffiliateSpotlightProps) {
  const track = (destination: string, linkType: string) =>
    trackEvent("affiliate_click", {
      product_name: pick.title,
      list_title: listTitle,
      destination,
      link_type: linkType,
      page: "shop-my-faves",
    })

  return (
    <article
      className="mb-8 md:mb-10 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] rounded-2xl overflow-hidden border"
      style={{ borderColor: "var(--color-border)", background: "var(--color-orange-light)" }}
    >
      <div className="relative w-full aspect-[4/5] md:aspect-auto md:min-h-[420px]">
        {/* Amy's own photo from Shopify Files; dimensions vary, so a plain img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pick.imageUrl ?? ""}
          alt={pick.imageAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
        <h3
          className="text-[22px] md:text-[28px] font-bold leading-tight tracking-tight mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          {pick.title}
        </h3>
        {pick.note && (
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-7"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {pick.note}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={href}
            target="_blank"
            rel="noopener sponsored nofollow"
            onClick={() => track(href, "spotlight_amazon")}
            className="cta-primary"
          >
            Shop on Amazon
            <span aria-hidden="true">&rarr;</span>
          </a>
          {pick.linkUrl && pick.linkLabel && (
            <a
              href={pick.linkUrl}
              target="_blank"
              rel="noopener"
              onClick={() => track(pick.linkUrl ?? "", "spotlight_second_link")}
              className="inline-flex items-center gap-1.5 text-[15px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-orange-ink)" }}
            >
              {pick.linkLabel}
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
