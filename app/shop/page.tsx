import Image from "next/image"
import { getAllProducts, formatPrice } from "@/lib/shopify"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const revalidate = 60

const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Stickers", value: "stickers" },
  { label: "Die Cuts", value: "die-cuts" },
  { label: "Stamps", value: "stamps" },
  { label: "Happy Mail", value: "happy-mail" },
  { label: "Apparel", value: "apparel" },
]

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category ?? "all"
  const allProducts = await getAllProducts()

  const products =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter((p) =>
          p.collections.nodes.some((c) => c.handle === activeCategory) ||
          p.tags.includes(activeCategory)
        )

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="shop" />

      {/* ── Header ── */}
      <div
        className="py-8 md:py-12 px-4 md:px-10 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
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
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value
          return (
            <TrackableLink
              key={cat.value}
              href={cat.value === "all" ? "/shop" : `/shop?category=${cat.value}`}
              event="category_click"
              eventData={{ category_name: cat.label, page: "shop" }}
              className="flex-shrink-0 px-4 py-1.5 text-[12px] uppercase tracking-[0.08em] font-semibold rounded-full border transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "var(--color-orange)",
                      borderColor: "var(--color-orange)",
                      color: "#fff",
                    }
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
          <p
            className="text-center py-16 text-[14px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No products in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const img = product.images.nodes[0]
              const priceStr = formatPrice(product.priceRange.minVariantPrice)
              return (
                <TrackableLink
                  key={product.id}
                  href={`/shop/${product.handle}`}
                  event="product_click"
                  eventData={{
                    product_name: product.title,
                    source_section: "shop-grid",
                    page: "shop",
                  }}
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
                      />
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

      {/* ── Happy Mail Cross-sell ── */}
      {activeCategory !== "happy-mail" && (
        <section
          className="mx-4 md:mx-10 mb-12 rounded-xl overflow-hidden"
          style={{ background: "var(--color-orange)" }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/70 mb-1">Monthly Subscription</p>
              <h2 className="text-[22px] md:text-[28px] font-bold text-white leading-tight mb-2">
                Happy Mail
              </h2>
              <p className="text-[14px] text-white/80 mb-4 leading-relaxed">
                Every month, an envelope from Amy — filled with stickers, die cuts, and surprises
                designed just for subscribers. Starting at $13/month.
              </p>
              <TrackableLink
                href="/happy-mail"
                event="hero_cta_click"
                eventData={{ cta_text: "Shop Happy Mail Cross-sell", destination: "/happy-mail", page: "shop" }}
                className="inline-block px-6 py-2.5 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                Learn More
              </TrackableLink>
            </div>
            <div className="relative w-full md:w-64 h-48 md:h-40 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/images/products/happy-mail/1.jpg"
                alt="Happy Mail subscription"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 256px"
              />
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
