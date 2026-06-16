import Image from "next/image"
import { formatPrice, type ShopifyProduct } from "@/lib/shopify"
import TrackableLink from "@/components/trackable-link"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductImageGallery from "@/components/product-image-gallery"

// Tags that are functional/internal, not customer-facing descriptors -- never
// shown in the PDP tag row. `preview-ready` is preview plumbing; the category +
// fulfillment tags drive filtering/logic, not browse display.
const HIDDEN_TAGS = new Set([
  "new",
  "subscription",
  "preview-ready",
  "digital-downloads",
  "printable",
  "printables",
  "happy-mail",
])

/**
 * The product detail (PDP) body, shared by the live /shop/[slug] page and the
 * gated /preview/shop/[handle] route. Keeping this in one component guarantees
 * the preview SKU page is identical to what ships.
 *
 * `basePath` lets the preview keep its links inside /preview (so clicking a
 * breadcrumb / related product stays in the gated preview, not the public shop).
 * `interactive` defaults true (real Add to Cart); the preview can disable the
 * buy flow if desired, but we keep it on so Amy sees the true page.
 */
export default function ProductDetail({
  product,
  relatedProducts,
  slug,
  shopBasePath = "/shop",
  pdpBasePath = "/shop",
  subscribeSellingPlanId,
}: {
  product: ShopifyProduct
  relatedProducts: ShopifyProduct[]
  slug: string
  shopBasePath?: string
  pdpBasePath?: string
  subscribeSellingPlanId?: string
}) {
  const mainVariant = product.variants.nodes[0]
  const priceFormatted = formatPrice(product.priceRange.minVariantPrice)
  const priceAmount = parseFloat(product.priceRange.minVariantPrice.amount)
  const mainImage = product.images.nodes[0]?.url ?? ""
  const isSubscription = product.tags.includes("subscription")
  const isHappyMailIntl = product.handle === "happy-mail-international"
  const isHappyMail =
    product.handle === "happy-mail" ||
    product.tags.includes("happy-mail") ||
    product.collections.nodes.some((c) => c.handle === "happy-mail")
  const breadcrumbCategory = product.collections.nodes[0]

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* ── Breadcrumb ── */}
      <nav
        className="px-4 md:px-10 py-3 text-[12px] flex gap-2 items-center border-b"
        style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
      >
        <TrackableLink
          href={shopBasePath}
          event="nav_click"
          eventData={{ link_text: "Shop", page: "pdp" }}
          className="hover:underline"
        >
          Shop
        </TrackableLink>
        {breadcrumbCategory && (
          <>
            <span>/</span>
            <TrackableLink
              href={`${shopBasePath}?category=${breadcrumbCategory.handle}`}
              event="category_click"
              eventData={{ category_name: breadcrumbCategory.title, page: "pdp" }}
              className="hover:underline"
            >
              {breadcrumbCategory.title}
            </TrackableLink>
          </>
        )}
        <span>/</span>
        <span style={{ color: "var(--color-text-primary)" }}>{product.title}</span>
      </nav>

      {/* ── Product Layout ── */}
      <div className="px-4 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="md:grid md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Left: Image Gallery */}
          <ProductImageGallery
            images={product.images.nodes}
            productTitle={product.title}
            handle={slug}
          />

          {/* Right: Product Info */}
          <div className="mt-6 md:mt-0">
            {product.tags.includes("new") && (
              <span
                className="inline-block mb-2 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] font-bold rounded-full text-white"
                style={{ background: "var(--color-orange)" }}
              >
                New
              </span>
            )}

            <h1
              className="text-[24px] md:text-[30px] font-bold leading-tight mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              {product.title}
            </h1>

            <p
              className="text-[22px] md:text-[24px] font-semibold mb-4"
              style={{ color: isHappyMail ? "var(--color-orange)" : "var(--color-text-primary)" }}
            >
              {priceFormatted}
              {isSubscription && (
                <span className="text-[14px] font-normal ml-1" style={{ color: "var(--color-text-secondary)" }}>
                  / month
                </span>
              )}
            </p>

            {isHappyMail && !isHappyMailIntl && (
              <div
                className="mb-4 p-3 rounded-lg text-[13px] leading-relaxed"
                style={{ background: "var(--color-orange-light)", border: "1px solid #fde0c0", color: "var(--color-text-primary)" }}
              >
                New to Happy Mail?{" "}
                <TrackableLink
                  href="/happy-mail"
                  event="nav_click"
                  eventData={{ link_text: "Learn about Happy Mail", page: "pdp" }}
                  className="font-semibold underline"
                  style={{ color: "var(--color-orange)" }}
                >
                  See what's inside, how it ships, and how to gift it →
                </TrackableLink>
              </div>
            )}

            {isHappyMailIntl && (
              <div
                className="mb-4 p-3 rounded-lg text-[13px] leading-relaxed"
                style={{ background: "var(--color-orange-light)", border: "1px solid #fde0c0", color: "var(--color-text-primary)" }}
              >
                <span className="font-semibold">Shipping outside the US?</span> This is the
                international edition of Happy Mail, for subscribers in Canada, Australia, and the
                UK. Same envelope, same surprises, shipped worldwide with postage included. (In the
                US?{" "}
                <TrackableLink
                  href="/happy-mail"
                  event="nav_click"
                  eventData={{ link_text: "US Happy Mail", page: "pdp" }}
                  className="font-semibold underline"
                  style={{ color: "var(--color-orange)" }}
                >
                  Subscribe to US Happy Mail here →
                </TrackableLink>
                )
              </div>
            )}

            {product.availableForSale && mainVariant ? (
              <AddToCartButton
                variantId={mainVariant.id}
                productTitle={product.title}
                productHandle={slug}
                price={priceFormatted}
                priceAmount={priceAmount}
                imageUrl={mainImage}
                isSubscription={isSubscription}
                sellingPlanId={subscribeSellingPlanId}
              />
            ) : (
              <div
                className="w-full py-3.5 text-center text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full border-2"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                Sold Out
              </div>
            )}

            {/* Free shipping callout */}
            {product.description.toLowerCase().includes("free us shipping") && (
              <p className="mt-3 text-[12px] text-center" style={{ color: "var(--color-text-secondary)" }}>
                Free US shipping included
              </p>
            )}

            {/* Description */}
            <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
              <h2
                className="text-[12px] uppercase tracking-[0.1em] font-semibold mb-3"
                style={{ color: "var(--color-text-primary)" }}
              >
                Details
              </h2>
              <div
                className="product-description text-[14px] leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>

            {/* Tags (internal/plumbing + category tags hidden; only descriptors show) */}
            {product.tags.filter((t) => !HIDDEN_TAGS.has(t)).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags
                  .filter((t) => !HIDDEN_TAGS.has(t))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-[11px] rounded-full border"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Happy Mail Cross-sell (non-HM products) ── */}
      {!isHappyMail && (
        <section
          className="mx-4 md:mx-10 mb-8 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4"
          style={{ background: "var(--color-orange-light)", border: "1px solid #fde0c0" }}
        >
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-1" style={{ color: "var(--color-orange)" }}>
              Monthly Subscription
            </p>
            <h3 className="text-[18px] font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
              Add Happy Mail to your life
            </h3>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--color-text-secondary)" }}>
              Every month, an envelope from Amy filled with stickers, die cuts, and surprises.
              Starting at $13/month.
            </p>
            <TrackableLink
              href="/happy-mail"
              event="hm_subscribe_click"
              eventData={{ source: "cross-sell-pdp", slug: slug, cta_text: "PDP Happy Mail Cross-sell", destination: "/happy-mail", page: "pdp" }}
              className="inline-block px-5 py-2 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full text-white transition-all duration-300"
              style={{ background: "var(--color-orange)" }}
            >
              Learn More
            </TrackableLink>
          </div>
          <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <Image src="/images/products/happy-mail/2.jpg" alt="Happy Mail" fill className="object-cover" sizes="128px" />
          </div>
        </section>
      )}

      {/* ── Related Products ── */}
      {relatedProducts.length > 0 && (
        <section className="px-4 md:px-10 pb-12">
          <h2
            className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => {
              const img = related.images.nodes[0]
              return (
                <TrackableLink
                  key={related.id}
                  href={`${pdpBasePath}/${related.handle}`}
                  event="product_click"
                  eventData={{ product_name: related.title, source_section: "related-products", page: "pdp" }}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-2 bg-gray-50">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.altText ?? related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <p className="text-[13px] font-medium line-clamp-2 leading-snug mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {related.title}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    {formatPrice(related.priceRange.minVariantPrice)}
                  </p>
                </TrackableLink>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
