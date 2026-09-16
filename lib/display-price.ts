import { formatPrice, type ShopifyPrice, type ShopifyProduct } from "@/lib/shopify"
import { HM_VARIANT_6MONTH_GID, IHM_VARIANT_6MONTH_GID } from "@/lib/happy-mail-content"

// Why this file exists (Amy flagged the /shop tile reading "$12.00" on 2026-09-16):
// Shopify's priceRange.minVariantPrice is NOT the entry price for either Happy Mail
// product. Both 6-month prepaid plans are priced PER DELIVERY, because Recharge's
// prepaid Variant-Level model multiplies the variant price by the number of deliveries
// (US: $12 x6 = $72; intl: $15 x6 = $90 — see the vault's
// recharge-prepaid-pricing-CANONICAL-2026-06-16.md). Those per-delivery variant prices
// are internal billing math: nobody is ever charged $12 or $15. But they ARE the
// cheapest variant, so every surface that priced a product off minVariantPrice showed
// the per-delivery number — $12.00 on the US tile, CA$22.00/£12.00 on the intl landing
// where the real monthly is CA$23.00/£13.00.
//
// The variant prices themselves must NOT be "corrected" in Shopify: repricing them
// changes what the prepaid plans charge (that is exactly how the CA$759 overcharge
// happened in June). The fix is display-side: skip the per-delivery variants when
// deciding what price to show.
const PER_DELIVERY_VARIANT_GIDS = new Set([HM_VARIANT_6MONTH_GID, IHM_VARIANT_6MONTH_GID])

/**
 * The lowest price a customer can actually pay for this product, in the visitor's
 * currency (@inContext already applied by the caller's query). Falls back to
 * minVariantPrice when every variant is per-delivery — which happens when a market
 * scopes out the real ones (e.g. the US Happy Mail product viewed from Canada).
 */
export function displayPrice(product: ShopifyProduct): ShopifyPrice {
  const payable = product.variants.nodes.filter((v) => !PER_DELIVERY_VARIANT_GIDS.has(v.id))
  if (payable.length === 0) return product.priceRange.minVariantPrice
  return payable.reduce(
    (lowest, v) => (parseFloat(v.price.amount) < parseFloat(lowest.amount) ? v.price : lowest),
    payable[0].price
  )
}

/** displayPrice, formatted for render ("$13.00", "CA$23.00", "£13.00"). */
export function formatDisplayPrice(product: ShopifyProduct): string {
  return formatPrice(displayPrice(product))
}
