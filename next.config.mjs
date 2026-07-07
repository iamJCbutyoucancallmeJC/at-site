import { blogLegacyRedirects } from "./lib/blog-redirects.mjs"
import { blogCurationRedirects } from "./lib/blog-curation-redirects.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Houston conference cohort closed 2026-06-16 (t659): finite 6-month, 11 subs ride to
      // Oct expiry, no more conference sales. The /houston landing page + the /hm QR shortcut
      // now redirect to the main Happy Mail page so any stray bookmark/QR handout lands sensibly.
      // (Page source kept in git for a future conference; flip these back to revive it.)
      { source: "/houston", destination: "/happy-mail", permanent: false },
      { source: "/hm", destination: "/happy-mail", permanent: false },
      // Short path for Junklub event QR code handouts
      { source: "/jl", destination: "/junklub", permanent: false },

      // ---- Squarespace -> Next.js launch redirect map (2026-06-26, t421-class) ----
      // The pre-launch PRD (sections 6/8) called for a 301 map from the old SQS URL
      // structure to the new stack; it shipped incomplete. The t732 weekly digest then
      // surfaced 287 not_found_view events in 7 days (GA4 property 532481266) almost
      // entirely on un-redirected old SQS paths -- Google's still-indexed URLs and live
      // bookmarks 404ing. These are permanent (301): the old structure is gone for good,
      // and 301 lets search engines transfer ranking to the new canonical pages.
      // No new-site equivalent exists for blog/podcast/workshops content, so those route
      // to the nearest live surface (home or /shop) rather than a dead end.

      // Old SQS product URLs used /shop/p/<handle>; the new stack uses /shop/<handle>.
      // happy-mail has no PDP -- the app-level redirect in app/shop/[slug]/page.tsx sends
      // /shop/happy-mail -> /happy-mail, so routing /shop/p/happy-mail -> /shop/happy-mail
      // chains correctly. Retired/sold-out handles land on the styled 404 (which links to
      // /shop), which is the right outcome for a discontinued product.
      { source: "/shop/p/:handle", destination: "/shop/:handle", permanent: true },
      // SQS digital-prints listing -> the shop catalog (printables live there now).
      { source: "/shop/digital-prints", destination: "/shop", permanent: true },

      // Old SQS about page slug.
      { source: "/aboutamy", destination: "/about", permanent: true },
      // SQS default /pages/<slug> namespace -- only contact has a live equivalent.
      { source: "/pages/contact", destination: "/contact", permanent: true },

      // ---- Blog reinstated (t812, 2026-06-26) ----
      // The blog is back as MDX-in-repo on this stack (blog-reinstate-prd-2026-06-20.md,
      // Decision B: normalize every legacy URL to /blog/[slug] + 301, never 404). This
      // REPLACES the prior "no blog -> redirect /blog/* to /" rules.
      //
      // 1) Exception map FIRST (must precede the general rule): opaque SQS ids,
      //    'html'-suffixed slugs, and slug collisions whose clean slug differs from a
      //    pure date-strip. Auto-generated from the migration -- see lib/blog-redirects.mjs.
      ...blogLegacyRedirects,
      // 1b) Merchandising curation (2026-07-03): the deadest stale-commercial ephemera
      //    (giveaways, expired sales, closed classes) 301 -> /blog so the canonical URL
      //    resolves (never 404) without showing a dead-offer page. Auto-generated from
      //    content/blog/_curation.json -- see scripts/blog-migration/classify-curation.py.
      //    Placed before the generic collapse so a canonical /blog/<slug> hits in one hop.
      ...blogCurationRedirects,
      // 2) General collapse: every dated SQS path /blog/YYYY/MM(/DD)?/<slug> -> /blog/<slug>.
      //    Covers ~1,079 legacy posts in one rule. Clean-slug paths (~216) need no redirect:
      //    the /blog/[slug] route serves them at the canonical URL directly.
      { source: "/blog/:year(20\\d{2})/:month/:day/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/blog/:year(20\\d{2})/:month/:slug", destination: "/blog/:slug", permanent: true },
      // 3) Old SQS taxonomy pages: /blog/tag/X stays (we have a tag route); /blog/category/X
      //    maps to the same tag namespace (categories and tags were merged at extraction).
      { source: "/blog/category/:slug", destination: "/blog/tag/:slug", permanent: true },
      // Blogspot-era flat archive paths (pre-SQS), e.g. /2012/04/<slug>.html -> blog home
      // (no clean slug recoverable from these; they predate the captured corpus).
      { source: "/:year(20\\d{2})/:month/:rest*", destination: "/blog", permanent: true },

      // Podcast: no podcast page on the new site.
      { source: "/podcast/:path*", destination: "/", permanent: true },

      // SQS content/marketing pages with no new-site equivalent -> home.
      { source: "/faqs", destination: "/", permanent: true },
      { source: "/workshops", destination: "/", permanent: true },
      { source: "/retreats", destination: "/", permanent: true },
      { source: "/learn-from-amy", destination: "/", permanent: true },
      { source: "/featured-in", destination: "/", permanent: true },
      { source: "/collaborations/:path*", destination: "/", permanent: true },

      // /preview was an SQS staging namespace; /preview/paperworld -> the live page.
      { source: "/preview/paperworld", destination: "/paperworld", permanent: true },

      // Old SQS commerce/order/receipt URLs -- the underlying orders don't exist on the
      // new stack; send to home rather than 404 (order lookups go through Shopify email).
      { source: "/commerce/:path*", destination: "/", permanent: true },
      { source: "/store/receipt", destination: "/", permanent: true },
      { source: "/checkout/subscription-confirmed", destination: "/happy-mail", permanent: true },

      // ---- Residual not_found tail cleanup (2026-06-29, t833) ----
      // The t732 digest confirmed the blog/podcast 404s went to zero once the t812 blog
      // migration + redirect map deployed (Jun 26). The genuine post-deploy tail (~8/day)
      // is retired /shop/<handle> products + two stragglers with real targets:
      //   - Old SQS newsletter slug -> the live signup section on home (#newsletter anchor).
      { source: "/newsletter-sign-up", destination: "/#newsletter", permanent: true },
      //   - SQS /s/* static-asset namespace (e.g. old printable PDFs) -> home.
      { source: "/s/:path*", destination: "/", permanent: true },
      // Retired /shop/<handle> products are NOT redirected: they fall through to the
      // enriched 404 (app/not-found.tsx), which acknowledges the product retired and
      // shows the current lineup -- a better landing than a silent dump to /shop.
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
      },
      {
        protocol: "https",
        hostname: "media.rainpos.com",
      },
      // YouTube thumbnails for the click-to-play recap facade on
      // /events/<slug> pages (components/events/recap-video.tsx).
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
}

export default nextConfig
