import type { ShopifyProduct } from "@/lib/shopify"
import { displayPrice } from "@/lib/display-price"
import TrackableLink from "@/components/trackable-link"
import ProductCard, { ProductTileLink } from "@/components/product-card"
import ShopSort from "@/components/shop-sort"
import { shopHref, type ShopSortKey } from "@/lib/shop-sort"
import { CATEGORY_LINES } from "@/lib/shop-copy"

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
 * out of the All grid" rule, and orders them. Shared by the live /shop page and the
 * /preview/shop route so both behave identically.
 */
export function selectProductsForCategory(
  allProducts: ShopifyProduct[],
  activeCategory: string,
  sort: ShopSortKey = "featured"
): ShopifyProduct[] {
  // What a person can buy comes first (design critic F38, 2026-11-04). On 11/04 the All
  // grid ran eleven tiles of which seven were sold out, interleaved, so a shopper on a
  // phone scrolled four rows that were mostly unavailable to reach the four things in
  // stock. Sold out still shows, because the sticker someone saw on Instagram should be
  // findable and the badge tells the truth; it just stops leading. That rule holds under
  // every sort (Phase 2, 2026-11-10): Newest and the two price sorts order WITHIN the
  // in-stock group and the sold-out group. Then the international HM product to the very
  // back, as before. Array.prototype.sort is stable, so with no sort Shopify's own order
  // is untouched.
  const created = (p: ShopifyProduct) => {
    const t = Date.parse(p.createdAt ?? "")
    return Number.isNaN(t) ? 0 : t
  }
  const amount = (p: ShopifyProduct) => parseFloat(displayPrice(p).amount)
  const bySort = (a: ShopifyProduct, b: ShopifyProduct) => {
    switch (sort) {
      case "newest":
        return created(b) - created(a)
      case "price-asc":
        return amount(a) - amount(b)
      case "price-desc":
        return amount(b) - amount(a)
      default:
        return 0
    }
  }
  const ordered = [...allProducts].sort((a, b) => {
    const aOut = a.availableForSale ? 0 : 1
    const bOut = b.availableForSale ? 0 : 1
    if (aOut !== bOut) return aOut - bOut
    const s = bySort(a, b)
    if (s !== 0) return s
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
 * The shop's header, category chips, sort and product grid (design finish, Phase 2,
 * 2026-11-10). Presentational. The category links are configurable so the preview
 * route can point them at /preview/shop instead of /shop.
 */
export default function ShopGrid({
  products,
  activeCategory,
  sort = "featured",
  basePath = "/shop",
  pdpBasePath = "/shop",
  useLandingPages = true,
  leadTiles = [],
}: {
  products: ShopifyProduct[]
  // Tiles that link to their own page instead of a product page, shown first in the
  // grid (the Glimmers class, JC 10/29: classes sell from their sales page).
  leadTiles?: { href: string; title: string; price: string; image: { src: string; alt: string } }[]
  activeCategory: string
  sort?: ShopSortKey
  basePath?: string
  pdpBasePath?: string
  // When true, the two HM products route to their rich landing pages. The preview
  // turns this off so every tile goes to a PDP (the landing pages aren't part of a
  // product-lineup review).
  useLandingPages?: boolean
}) {
  // The count is what the grid shows, lead tiles included (design critic F38,
  // 2026-11-04): it read "10 products" over eleven tiles while the Glimmers
  // class led the All grid.
  const count = products.length + leadTiles.length
  // One sentence per chip, drafted for Amy (lib/shop-copy.ts).
  const line = CATEGORY_LINES[activeCategory] ?? CATEGORY_LINES.all

  return (
    <>
      {/* Header: the h1 and count stay; a sentence for the category; the sort. */}
      <header className="px-4 md:px-10 pt-8 md:pt-12 pb-5 md:pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h1
              className="text-[28px] md:text-[32px] font-bold leading-[1.15] tracking-[-0.01em]"
              style={{ color: "var(--color-ink)" }}
            >
              Shop
            </h1>
            <p className="text-[14px]" style={{ color: "var(--color-ink-soft)" }}>
              {count} {count === 1 ? "product" : "products"}
            </p>
          </div>
          <p className="mt-2 text-[16px] md:text-[18px] leading-relaxed max-w-[42rem]" style={{ color: "var(--color-ink-soft)" }}>
            {line}
          </p>
        </div>
        <ShopSort sort={sort} category={activeCategory} basePath={basePath} />
      </header>

      {/* Category chips: pills, the selected one on orange-tint (globals.css .chip).
          Sticky under the phone header (h-14); the desktop header does not stick. */}
      <nav
        aria-label="Shop categories"
        className="sticky top-14 md:top-0 z-10 px-4 md:px-10 py-3 flex gap-2 overflow-x-auto border-y"
        style={{ background: "var(--color-white)", borderColor: "var(--color-border)", scrollbarWidth: "none" }}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value
          return (
            <TrackableLink
              key={cat.value}
              href={shopHref(basePath, cat.value, sort)}
              event="category_click"
              eventData={{ category_name: cat.label, page: "shop" }}
              className={`chip${isActive ? " chip--on" : ""}`}
              ariaCurrent={isActive ? "page" : undefined}
            >
              {cat.label}
            </TrackableLink>
          )
        })}
      </nav>

      {/* Grid: 2 / 3 / 4 across, gap 16, every tile a ProductCard. */}
      <div className="px-4 md:px-10 py-6 md:py-8">
        {count === 0 ? (
          <p className="text-center py-16 text-[16px]" style={{ color: "var(--color-ink-soft)" }}>
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {leadTiles.map((tile) => (
              <ProductTileLink
                key={tile.href}
                href={tile.href}
                title={tile.title}
                price={tile.price}
                image={tile.image}
                action="View the class"
                source="shop-grid"
                page="shop"
              />
            ))}
            {products.map((product, index) => {
              const tileHref =
                useLandingPages && product.handle === "happy-mail"
                  ? "/happy-mail"
                  : useLandingPages && product.handle === "happy-mail-international"
                    ? "/happy-mail-international"
                    : `${pdpBasePath}/${product.handle}`
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  href={tileHref}
                  source="shop-grid"
                  page="shop"
                  eager={index < 2}
                  priority={index === 0}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
