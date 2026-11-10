import type { ShopifyProduct, ShopPolicies } from "@/lib/shopify"
import TrackableLink from "@/components/trackable-link"
import SectionHeader from "@/components/section-header"
import PromoCard from "@/components/promo-card"
import ProductCard from "@/components/product-card"
import ProductImageGallery from "@/components/product-image-gallery"
import BuyBox from "@/components/buy-box"
import ProductAccordion from "@/components/product-accordion"
import { productBadge } from "@/lib/product-state"
import { ABOUT_AMY_SHORT, REFUND_POLICY_FALLBACK, SHIPPING_POLICY_FALLBACK } from "@/lib/shop-copy"

// Tags that are functional/internal, not customer-facing descriptors -- never
// shown in the PDP tag row. `preview-ready` is preview plumbing; the category +
// fulfillment tags drive filtering/logic, not browse display; a `shop-update-*`
// tag marks a drop's batch (11/13's drafts carry shop-update-2026-11-13).
const HIDDEN_TAGS = new Set([
  "new",
  "subscription",
  "preview-ready",
  "digital-downloads",
  "printable",
  "printables",
  "happy-mail",
])

const BADGE_BG = {
  paper: "var(--color-paper)",
  teal: "var(--color-teal-tint)",
  orange: "var(--color-orange-tint)",
} as const

/**
 * The product detail (PDP) body, shared by the live /shop/[slug] page and the
 * gated /preview/shop/[handle] route. Keeping this in one component guarantees
 * the preview SKU page is identical to what ships.
 *
 * Design finish, Phase 2 (2026-11-10): the 4:5 gallery with tap-to-zoom on the
 * left and the accordion (Details, Shipping & returns, About Amy) under it; the
 * buy box (price, option picker, one button, shipping line) on the right, sticky
 * on desktop; the tag row as a line of text; the cross-sell as four ProductCards;
 * the Happy Mail cross-sell as the shared PromoCard on the pink.
 *
 * `shopBasePath` / `pdpBasePath` let the preview keep its links inside /preview.
 * `policies` is the store's own shipping and refund copy from Shopify (Amy's words).
 */
export default function ProductDetail({
  product,
  relatedProducts,
  slug,
  shopBasePath = "/shop",
  pdpBasePath = "/shop",
  subscribeSellingPlanId,
  policies,
}: {
  product: ShopifyProduct
  relatedProducts: ShopifyProduct[]
  slug: string
  shopBasePath?: string
  pdpBasePath?: string
  subscribeSellingPlanId?: string
  policies?: ShopPolicies
}) {
  const isHappyMailIntl = product.handle === "happy-mail-international"
  const isHappyMail =
    product.handle === "happy-mail" ||
    product.tags.includes("happy-mail") ||
    product.collections.nodes.some((c) => c.handle === "happy-mail")
  const breadcrumbCategory = product.collections.nodes[0]
  const badge = productBadge(product)
  const visibleTags = product.tags.filter((t) => !HIDDEN_TAGS.has(t) && !t.startsWith("shop-update-"))

  const accordion = [
    {
      id: "details",
      title: "Details",
      content: (
        <div className="product-description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      ),
    },
    {
      id: "shipping",
      title: "Shipping & returns",
      content: (
        <div className="product-description">
          <div dangerouslySetInnerHTML={{ __html: policies?.shipping ?? SHIPPING_POLICY_FALLBACK }} />
          <div dangerouslySetInnerHTML={{ __html: policies?.refund ?? REFUND_POLICY_FALLBACK }} />
        </div>
      ),
    },
    {
      id: "about-amy",
      title: "About Amy",
      content: (
        <div className="product-description">
          <p>{ABOUT_AMY_SHORT}</p>
          <p>
            <TrackableLink
              href="/about"
              event="nav_click"
              eventData={{ link_text: "About Amy (product page)", page: "pdp" }}
            >
              Read more about Amy
            </TrackableLink>
          </p>
        </div>
      ),
    },
  ]

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* ── Breadcrumb ── */}
      <nav
        aria-label="Breadcrumb"
        className="px-4 md:px-10 py-3 text-[13px] flex gap-2 items-center border-b"
        style={{ color: "var(--color-ink-soft)", borderColor: "var(--color-border)" }}
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
            <span aria-hidden="true">/</span>
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
        <span aria-hidden="true">/</span>
        <span className="truncate" style={{ color: "var(--color-ink)" }} aria-current="page">
          {product.title}
        </span>
      </nav>

      {/* ── Product layout: gallery and accordion left, buy box right (sticky) ── */}
      <div className="px-4 md:px-10 py-8 md:py-12 max-w-6xl mx-auto">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-x-12 lg:gap-x-16 md:items-start">
          <div className="md:col-start-1 md:row-start-1">
            <ProductImageGallery images={product.images.nodes} productTitle={product.title} handle={slug} />
          </div>

          <div className="mt-6 md:mt-0 md:col-start-2 md:row-start-1 md:row-span-2 md:sticky md:top-8">
            {badge && (
              <span
                className="inline-block mb-3 rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em] leading-none"
                style={{ background: BADGE_BG[badge.tone], color: "var(--color-ink)" }}
              >
                {badge.label}
              </span>
            )}

            <h1
              className="text-[28px] md:text-[32px] font-bold leading-[1.15] tracking-[-0.01em] mb-3"
              style={{ color: "var(--color-ink)" }}
            >
              {product.title}
            </h1>

            <BuyBox product={product} slug={slug} subscribeSellingPlanId={subscribeSellingPlanId} />

            {isHappyMail && !isHappyMailIntl && (
              <div
                className="mt-5 p-4 rounded-xl text-[14px] leading-relaxed"
                style={{ background: "var(--color-orange-light)", border: "1px solid var(--color-orange-tint)", color: "var(--color-ink)" }}
              >
                New to Happy Mail?{" "}
                <TrackableLink
                  href="/happy-mail"
                  event="nav_click"
                  eventData={{ link_text: "Learn about Happy Mail", page: "pdp" }}
                  className="font-semibold underline"
                  style={{ color: "var(--color-orange-ink)" }}
                >
                  See what&apos;s inside, how it ships, and how to gift it
                </TrackableLink>
                <p className="mt-2">
                  <a href="/gift" className="font-semibold underline" style={{ color: "var(--color-orange-ink)" }}>
                    Give six months of Happy Mail for $72
                  </a>
                  . Your recipient redeems with their own address.
                </p>
              </div>
            )}

            {isHappyMailIntl && (
              <div
                className="mt-5 p-4 rounded-xl text-[14px] leading-relaxed"
                style={{ background: "var(--color-orange-light)", border: "1px solid var(--color-orange-tint)", color: "var(--color-ink)" }}
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
                  style={{ color: "var(--color-orange-ink)" }}
                >
                  Subscribe to US Happy Mail here
                </TrackableLink>
                )
              </div>
            )}

            {/* Tags as a line of text, not chips (Phase 2). */}
            {visibleTags.length > 0 && (
              <p className="mt-6 text-[13px]" style={{ color: "var(--color-ink-soft)" }}>
                Tags: {visibleTags.join(", ")}
              </p>
            )}
          </div>

          <div className="mt-8 md:mt-10 md:col-start-1 md:row-start-2">
            <ProductAccordion items={accordion} />
          </div>
        </div>
      </div>

      {/* ── Happy Mail cross-sell (non-HM products): the shared card on the pink ── */}
      {!isHappyMail && (
        <section className="mx-4 md:mx-10 mb-12">
          <PromoCard
            tone="pink"
            heading="h2"
            eyebrow="Monthly subscription"
            title="Add Happy Mail to your life"
            text="Every month, an envelope from Amy filled with stickers, die cuts, and surprises. Starting at $13/month."
            cta={{
              href: "/happy-mail",
              label: "Learn more",
              event: "hm_subscribe_click",
              eventData: { source: "cross-sell-pdp", slug, cta_text: "PDP Happy Mail Cross-sell", destination: "/happy-mail", page: "pdp" },
            }}
            image={{ src: "/images/products/happy-mail/2.jpg", alt: "A Happy Mail envelope and what came in it" }}
          />
        </section>
      )}

      {/* ── Related products: the same card as the shop grid ── */}
      {relatedProducts.length > 0 && (
        <section className="px-4 md:px-10 pb-12 md:pb-16">
          <SectionHeader title="You may also like" link={{ href: shopBasePath, label: "See all" }} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related.id}
                product={related}
                href={`${pdpBasePath}/${related.handle}`}
                source="related-products"
                page="pdp"
                sizes="four"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
