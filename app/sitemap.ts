import type { MetadataRoute } from "next"
import { getAllProducts } from "@/lib/shopify"
import { getListablePosts } from "@/lib/blog"
import { detailPageEvents } from "@/lib/events-content"

// Sitemap (2026-07-09). Without one, search engines rediscover the site by
// brute-force recrawling every URL they have ever seen -- including years of
// dead Squarespace paths -- instead of converging on the live URL set. This
// also gets new blog posts and products indexed promptly.
//
// Deliberately excluded: /keep (campaign landing for email recipients),
// /amzn (redirectors), /preview, /v (non-canonical variants), /thank-you,
// and the two Happy Mail product handles (their PDPs redirect to the
// /happy-mail and /happy-mail-international landing pages listed below).

const BASE = "https://www.amytangerine.com"

const STATIC_PATHS = [
  "",
  "/shop",
  "/shop-my-faves",
  "/happy-mail",
  "/happy-mail-international",
  "/about",
  "/contact",
  "/events",
  "/japan",
  "/junklub",
  "/paperworld",
  "/blog",
  "/blog/archive",
]

const REDIRECTING_PRODUCT_HANDLES = new Set(["happy-mail", "happy-mail-international"])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${BASE}${p}`,
  }))

  const products = await getAllProducts()
  const productUrls: MetadataRoute.Sitemap = products
    .filter((p) => !REDIRECTING_PRODUCT_HANDLES.has(p.handle))
    .map((p) => ({ url: `${BASE}/shop/${p.handle}` }))

  const eventUrls: MetadataRoute.Sitemap = detailPageEvents().map((e) => ({
    url: `${BASE}/events/${e.slug}`,
  }))

  const postUrls: MetadataRoute.Sitemap = getListablePosts().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    ...(p.datePublishedISO ? { lastModified: p.datePublishedISO } : {}),
  }))

  return [...staticUrls, ...productUrls, ...eventUrls, ...postUrls]
}
