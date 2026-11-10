"use client"

import { useState } from "react"
import Image from "next/image"
import type { ShopifyImage, ShopifyProduct } from "@/lib/shopify"
import { formatMoney } from "@/lib/money"
import { formatDisplayPrice, hasPriceSpread } from "@/lib/display-price"
import { shopifyImageUrl, isShopifyCdn } from "@/lib/shopify-image-loader"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"
import {
  defaultVariant,
  hasOptions,
  isPreorderProduct,
  isSubscriptionProduct,
  productBadge,
  variantLabel,
  type ProductBadge,
} from "@/lib/product-state"

// ProductCard v2 (design finish, Phase 2, 2026-11-10; Design System "Amy Tangerine",
// components/ProductCard). One card for the shop grid, the homepage's New arrivals and
// the product page's cross-sell. A square photograph on paper at 12px, the second
// Shopify photo fading in on hover, one badge top-left (New on orange-tint, Sold out
// on paper, Preorder on teal-tint, all lettered in ink at 11px), the title at 16/600
// on two lines at most, the price at 15/600, then the action: Add to cart straight
// from the grid when there is one thing to buy, Choose options when there are several,
// Email me when it's back when it is sold out. Phones show the action always (one tap
// to the cart); desktop shows it on hover or focus. The sold-out photograph stays in
// full colour; the dark pill over the image is gone.

export const CARD_SIZES = {
  // /shop: 2 / 3 / 4 across (px-4 md:px-10, gap 16)
  grid: "(min-width: 1024px) calc((100vw - 152px) / 4), (min-width: 768px) calc((100vw - 128px) / 3), calc((100vw - 48px) / 2)",
  // Homepage New arrivals and the product page's cross-sell: 2 / 4 across
  four: "(min-width: 768px) calc((100vw - 128px) / 4), calc((100vw - 48px) / 2)",
}

const BADGE_BG: Record<ProductBadge["tone"], string> = {
  paper: "var(--color-paper)",
  teal: "var(--color-teal-tint)",
  orange: "var(--color-orange-tint)",
}

function CardImage({
  img,
  alt,
  sizes,
  eager = false,
  priority = false,
  className = "",
}: {
  img: ShopifyImage
  alt: string
  sizes: string
  eager?: boolean
  priority?: boolean
  className?: string
}) {
  if (isShopifyCdn(img.url)) {
    // Native srcSet keeps resizing on Shopify's CDN (the September perf fix): Next's
    // unoptimized Image drops srcSet, so phones downloaded every tile at 700px.
    const widths = [240, 360, 480, 640, 800, 1080, 1440]
      .filter((w) => w < img.width)
      .concat(Math.min(img.width || 1920, 1920))
    return (
      <img
        src={shopifyImageUrl(img.url, 700)}
        srcSet={widths.map((w) => `${shopifyImageUrl(img.url, w)} ${w}w`).join(", ")}
        sizes={sizes}
        width={img.width || undefined}
        height={img.height || undefined}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    )
  }
  return (
    <Image
      src={img.url}
      alt={alt}
      fill
      {...(priority ? { priority: true } : { loading: eager ? "eager" : "lazy" })}
      className={`object-cover ${className}`}
      sizes={sizes}
    />
  )
}

function Badge({ badge }: { badge: ProductBadge }) {
  return (
    <span
      className="absolute top-2 left-2 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] leading-none"
      style={{ background: BADGE_BG[badge.tone], color: "var(--color-ink)" }}
    >
      {badge.label}
    </span>
  )
}

const CARD_CLASS =
  "group relative flex flex-col min-w-0 rounded-xl transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-lift focus-within:shadow-lift"
// .card-action (globals.css): always visible on phones and on any device that cannot
// hover (a tablet at desktop width); hidden until hover or focus only where a pointer
// can hover. A plain md: breakpoint would have left iPad users with no button at all.
const ACTION_CLASS = "card-action mt-3 px-0.5 pb-1"

export default function ProductCard({
  product,
  href,
  source,
  page,
  sizes = "grid",
  eager = false,
  priority = false,
}: {
  product: ShopifyProduct
  /** Where the photo and title go: the product page, or a Happy Mail landing. */
  href: string
  /** GA4 source_section on product_click and add_to_cart (shop-grid, new-arrivals, related-products). */
  source: string
  page: string
  sizes?: keyof typeof CARD_SIZES
  eager?: boolean
  priority?: boolean
}) {
  const { addItem, hydrated } = useCart()
  const [status, setStatus] = useState<"idle" | "added">("idle")
  const [first, second] = product.images.nodes
  const badge = productBadge(product)
  const subscription = isSubscriptionProduct(product)
  const options = hasOptions(product)
  const preorder = isPreorderProduct(product)
  const variant = defaultVariant(product)
  const price = `${hasPriceSpread(product) ? "From " : ""}${formatDisplayPrice(product)}`
  const sizesAttr = CARD_SIZES[sizes]
  const clickData = { product_name: product.title, source_section: source, page }

  function add() {
    if (!hydrated || !variant) return
    const label = variantLabel(variant)
    addItem(
      {
        variantId: variant.id,
        productHandle: product.handle,
        title: label ? `${product.title} (${label})` : product.title,
        price: formatMoney(variant.price),
        priceAmount: parseFloat(variant.price.amount),
        imageUrl: first?.url ?? "",
      },
      { source_section: source }
    )
    setStatus("added")
    setTimeout(() => setStatus("idle"), 2000)
  }

  let action: React.ReactNode
  if (!product.availableForSale) {
    action = (
      <a
        href={`${href}#back-in-stock`}
        className="cta-secondary cta--card"
        onClick={() => trackEvent("product_click", { ...clickData, cta_text: "Email me when it's back" })}
      >
        <span className="md:hidden">Email me</span>
        <span className="hidden md:inline">Email me when it&apos;s back</span>
      </a>
    )
  } else if (subscription || options || !variant) {
    const label = subscription ? "See plans" : "Choose options"
    action = (
      <a
        href={href}
        className="cta-secondary cta--card"
        onClick={() => trackEvent("product_click", { ...clickData, cta_text: label })}
      >
        {label}
      </a>
    )
  } else {
    action = (
      <button
        type="button"
        onClick={add}
        disabled={!hydrated}
        className={`${status === "added" ? "cta-teal" : "cta-primary"} cta--card`}
        aria-label={`${preorder ? "Preorder" : "Add to cart"}: ${product.title}`}
      >
        {status === "added" ? "Added" : preorder ? "Preorder" : "Add to cart"}
      </button>
    )
  }

  return (
    <article className={CARD_CLASS}>
      <a
        href={href}
        onClick={() => trackEvent("product_click", clickData)}
        className="block min-w-0 rounded-xl"
      >
        <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: "var(--color-paper)" }}>
          {first ? (
            <>
              <CardImage img={first} alt={first.altText ?? product.title} sizes={sizesAttr} eager={eager} priority={priority} />
              {second && (
                <CardImage
                  img={second}
                  alt=""
                  sizes={sizesAttr}
                  className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-2 text-center text-[12px] font-semibold" style={{ color: "var(--color-ink-soft)" }}>
                Photo coming soon
              </span>
            </div>
          )}
          {badge && <Badge badge={badge} />}
        </div>
        <p className="mt-3 px-0.5 text-[16px] font-semibold leading-[1.35] line-clamp-2" style={{ color: "var(--color-ink)" }}>
          {product.title}
        </p>
        <p className="mt-1 px-0.5 text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>
          {price}
        </p>
      </a>
      <div className={ACTION_CLASS}>{action}</div>
    </article>
  )
}

/**
 * The same card for a tile that is not a product: the Glimmers class leads the
 * shop grid and sells from its own page (JC 10/29). Photo, title, price and one
 * secondary action that goes where the tile goes.
 */
export function ProductTileLink({
  href,
  title,
  price,
  image,
  action,
  source,
  page,
  sizes = "grid",
}: {
  href: string
  title: string
  price: string
  image: { src: string; alt: string }
  action: string
  source: string
  page: string
  sizes?: keyof typeof CARD_SIZES
}) {
  const clickData = { product_name: title, source_section: source, page }
  return (
    <article className={CARD_CLASS}>
      <a href={href} onClick={() => trackEvent("product_click", clickData)} className="block min-w-0 rounded-xl">
        <div className="relative aspect-square overflow-hidden rounded-xl" style={{ background: "var(--color-paper)" }}>
          <Image src={image.src} alt={image.alt} fill className="object-cover object-top" sizes={CARD_SIZES[sizes]} />
        </div>
        <p className="mt-3 px-0.5 text-[16px] font-semibold leading-[1.35] line-clamp-2" style={{ color: "var(--color-ink)" }}>
          {title}
        </p>
        <p className="mt-1 px-0.5 text-[15px] font-semibold" style={{ color: "var(--color-ink)" }}>
          {price}
        </p>
      </a>
      <div className={ACTION_CLASS}>
        <a
          href={href}
          className="cta-secondary cta--card"
          onClick={() => trackEvent("product_click", { ...clickData, cta_text: action })}
        >
          {action}
        </a>
      </div>
    </article>
  )
}
