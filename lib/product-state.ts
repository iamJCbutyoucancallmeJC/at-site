// What a product IS for the shop surfaces (design finish, Phase 2, 2026-11-10): sold
// out, a preorder, a subscription, a download, one thing or a choice of several.
// One home so the card, the buy box and the cart agree. No environment reads, so
// client components can import it.

import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify"
import { HM_VARIANT_6MONTH_GID, IHM_VARIANT_6MONTH_GID } from "@/lib/happy-mail-content"

// The 6-month Happy Mail variants are per-delivery billing rows for Recharge, not a
// choice a shopper makes here (lib/display-price.ts has the history).
const PER_DELIVERY_VARIANT_GIDS = new Set([HM_VARIANT_6MONTH_GID, IHM_VARIANT_6MONTH_GID])

export function isSubscriptionProduct(p: ShopifyProduct): boolean {
  return (
    p.tags.includes("subscription") ||
    p.handle === "happy-mail" ||
    p.handle === "happy-mail-international"
  )
}

export function isDigitalProduct(p: ShopifyProduct): boolean {
  return (
    p.tags.includes("printables") ||
    p.tags.includes("printable") ||
    p.tags.includes("digital-downloads") ||
    p.collections.nodes.some((c) => c.handle === "printables")
  )
}

export function isNewProduct(p: ShopifyProduct): boolean {
  return p.tags.includes("new")
}

/** The variants a shopper actually picks between. */
export function choosableVariants(p: ShopifyProduct): ShopifyVariant[] {
  return p.variants.nodes.filter((v) => !PER_DELIVERY_VARIANT_GIDS.has(v.id))
}

/** More than one real variant: the card says Choose options and the page shows a picker. */
export function hasOptions(p: ShopifyProduct): boolean {
  return choosableVariants(p).length > 1
}

/** The variant a one-tap add uses: the first that can be bought, else the first. */
export function defaultVariant(p: ShopifyProduct): ShopifyVariant | undefined {
  const vs = choosableVariants(p)
  return vs.find((v) => v.availableForSale) ?? vs[0] ?? p.variants.nodes[0]
}

/** Sells, but from stock that is not here yet. */
export function isPreorderVariant(v: ShopifyVariant | undefined): boolean {
  return !!v && v.availableForSale && v.currentlyNotInStock === true
}

/** Every buyable variant is a preorder (the badge and the card button read Preorder). */
export function isPreorderProduct(p: ShopifyProduct): boolean {
  const buyable = choosableVariants(p).filter((v) => v.availableForSale)
  return buyable.length > 0 && buyable.every((v) => v.currentlyNotInStock === true)
}

/** "Default Title" is Shopify's placeholder for a product with no options; show nothing for it. */
export function variantLabel(v: ShopifyVariant): string {
  return v.title === "Default Title" ? "" : v.title
}

/** The option the picker is titled with ("Design", "Color"); undefined for a one-variant product. */
export function optionName(p: ShopifyProduct): string | undefined {
  return p.options?.find((o) => o.name && o.name !== "Title")?.name
}

export type ProductBadge = { label: "Sold out" | "Preorder" | "New"; tone: "paper" | "teal" | "orange" }

/** The one badge a tile or page shows, by priority: sold out, then preorder, then new. */
export function productBadge(p: ShopifyProduct): ProductBadge | null {
  if (!p.availableForSale) return { label: "Sold out", tone: "paper" }
  if (isPreorderProduct(p)) return { label: "Preorder", tone: "teal" }
  if (isNewProduct(p)) return { label: "New", tone: "orange" }
  return null
}
