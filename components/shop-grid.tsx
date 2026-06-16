import Image from "next/image"
import { formatPrice, type ShopifyProduct } from "@/lib/shopify"
import TrackableLink from "@/components/trackable-link"

export const SHOP_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "stickers" },
  { label: "Stamps", value: "stamps" },
  // Printables: one menu tab, not mixed into the main grid (Amy's intent: digital
  // printables shouldn't dominate the shop). Filters via the `printables` tag.
  { label: "Printables", value: "printables" },
  { label: "Happy Mail", value: "happy-mail" },
]

export function isPrintable(p: ShopifyProduct): boolean {
  return p.tags.includes("printables") || p.collections.nodes.some((c) => c.handle === "printables")
}

/**
 * Selects which products show for a given category, applying the "printables stay
 * out of the All grid" rule. Shared by the live /shop page and the /preview/shop route
 * so both behave identically.
 */
export function selectProductsForCategory(
  allProducts: ShopifyProduct[],
  activeCategory: string
): ShopifyProduct[] {
  // Sort the international HM product to the very back of the grid.
  const ordered = [...allProducts].sort((a, b) => {
    const aIntl = a.handle === "happy-mail-international" ? 1 : 0
    const bIntl = b.handle === "happy-mail-international" ? 1 : 0
    return aIntl - bIntl
  })

  return activeCategory === "all"
    ? ordered.filter((p) => !isPrintable(p))
    : ordered.filter(
        (p) =>
          p.collections.nodes.some((c) => c.handle === activeCategory) ||
          p.tags.includes(activeCategory)
      )
}

/**
 * The shop's category-filter + product grid. Presentational. The category links
 * are configurable so the preview route can point them at /preview/shop instead
 * of /shop.
 */
export default function ShopGrid({
  products,
  activeCategory,
  basePath = "/shop",
  pdpBasePath = "/shop",
  useLandingPages = true,
}: {
  products: ShopifyProduct[]
  activeCategory: string
  basePath?: string
  pdpBasePath?: string
  // When true, the two HM products route to their rich landing pages. The preview
  // turns this off so every tile goes to a PDP (the landing pages aren't part of a
  // product-lineup review).
  useLandingPages?: boolean
}) {
  return (
    <>
      {/* ── Header ── */}
      <div className="py-8 md:py-12 px-4 md:px-10 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h1
          className="text-[24px] md:text-[32px] font-bold tracking-tight mb-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          Shop
        </h1>
        <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
      </div>

      {/* ── Category Filter ── */}
      <div
        className="sticky top-0 z-10 px-4 md:px-10 py-3 flex gap-2 overflow-x-auto border-b bg-white"
        style={{ borderColor: "var(--color-border)", scrollbarWidth: "none" }}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value
          return (
            <TrackableLink
              key={cat.value}
              href={cat.value === "all" ? basePath : `${basePath}?category=${cat.value}`}
              event="category_click"
              eventData={{ category_name: cat.label, page: "shop" }}
              className="flex-shrink-0 px-4 py-1.5 text-[12px] uppercase tracking-[0.08em] font-semibold rounded-full border transition-all duration-200"
              style={
                isActive
                  ? { background: "var(--color-orange)", borderColor: "var(--color-orange)", color: "#fff" }
                  : {
                      background: "transparent",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }
              }
            >
              {cat.label}
            </TrackableLink>
          )
        })}
      </div>

      {/* ── Product Grid ── */}
      <div className="px-4 md:px-10 py-8">
        {products.length === 0 ? (
          <p className="text-center py-16 text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const img = product.images.nodes[0]
              const priceStr = formatPrice(product.priceRange.minVariantPrice)
              const tileHref =
                useLandingPages && product.handle === "happy-mail"
                  ? "/happy-mail"
                  : useLandingPages && product.handle === "happy-mail-international"
                    ? "/happy-mail-international"
                    : `${pdpBasePath}/${product.handle}`
              return (
                <TrackableLink
                  key={product.id}
                  href={tileHref}
                  event="product_click"
                  eventData={{ product_name: product.title, source_section: "shop-grid", page: "shop" }}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-3 bg-gray-50">
                    {img ? (
                      <Image
                        src={img.url}
                        alt={img.altText ?? product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: "var(--color-gray-light)" }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-[0.1em] text-center px-2"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Image coming soon
                        </span>
                      </div>
                    )}
                    {!product.availableForSale && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span
                          className="text-[11px] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full"
                          style={{ background: "var(--color-text-secondary)", color: "#fff" }}
                        >
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <p
                    className="text-[13px] md:text-[14px] font-medium leading-snug mb-0.5 line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {product.title}
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                    {priceStr}
                  </p>
                </TrackableLink>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
