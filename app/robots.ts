import type { MetadataRoute } from "next"

// Crawler rules (2026-07-09). Before this file existed, every bot's /robots.txt
// probe server-rendered the full 404 page, and crawlers walked the site with no
// guidance -- including non-canonical surfaces. Disallowed:
//   /api/      - no crawlable content
//   /preview/  - draft-product review routes (not for indexing)
//   /v/        - homepage variants (duplicate content vs /)
//   /amzn/     - affiliate redirectors
//   /thank-you - post-checkout page
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/preview/", "/v/", "/amzn/", "/thank-you"],
      },
    ],
    sitemap: "https://www.amytangerine.com/sitemap.xml",
  }
}
