/**
 * Shopify CDN image sizing helper.
 *
 * Shopify's CDN (cdn.shopify.com) already resizes and caches images for free
 * via a `?width=` URL param. By requesting the right size from Shopify directly
 * and rendering the <Image> as `unoptimized`, Shopify product images skip
 * Vercel's /_next/image optimizer and don't count against the Hobby plan's
 * Image Optimization meter.
 *
 * Why a URL helper and not a custom next/image `loader` prop: most of this
 * app's image call sites are Server Components, and a function prop can't cross
 * the Server -> Client boundary ("Functions cannot be passed directly to
 * Client Components"). A plain string URL serializes fine, so we compute the
 * sized URL here and pass it as `src` with `unoptimized`.
 *
 * Use only for cdn.shopify.com URLs. Local/static images should keep the
 * default optimizer (render them normally, without this helper / unoptimized).
 *
 * Ref: https://shopify.dev/docs/api/liquid/filters/image_url (width param)
 */

/**
 * Returns a Shopify CDN URL sized to `width`. Non-Shopify srcs (e.g. a local
 * /images/... fallback) are returned untouched so call sites can pass either.
 */
export function shopifyImageUrl(src: string, width: number): string {
  if (!isShopifyCdn(src)) {
    return src
  }
  const url = new URL(src)
  url.searchParams.set("width", String(width))
  return url.toString()
}

/**
 * True when a src is a Shopify CDN URL (so it's been sized via the CDN and
 * should render `unoptimized`). Local images return false -> keep Vercel's optimizer.
 */
export function isShopifyCdn(src: string): boolean {
  return src.startsWith("https://cdn.shopify.com")
}
