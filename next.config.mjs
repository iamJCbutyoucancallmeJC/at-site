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

      // Blog: no blog on the new site. Catch the index, all posts (flat + dated SQS
      // paths like /blog/2015/4/8/<slug>), and /blog/tag|category/* taxonomy pages.
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
      // Blogspot-era flat archive paths (pre-SQS), e.g. /2012/04/<slug>.html.
      { source: "/:year(20\\d{2})/:month/:rest*", destination: "/", permanent: true },

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
    ],
  },
}

export default nextConfig
