import { getAllProducts } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PromoCard from "@/components/promo-card"
import ShopGrid, { selectProductsForCategory } from "@/components/shop-grid"

// Dynamic rendering: grid varies by visitor country (Markets-scoped products).
export const dynamic = "force-dynamic"

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string }>
}) {
  const sp = await searchParams
  const activeCategory = sp.category ?? "all"
  // Country resolved for pricing context only (localized currency). No geo routing.
  const country = await getVisitorCountry()
  const allProducts = await getAllProducts(country)
  const products = selectProductsForCategory(allProducts, activeCategory)

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="shop" />

      <ShopGrid products={products} activeCategory={activeCategory} />

      {/* ── Happy Mail Cross-sell ── */}
      {activeCategory !== "happy-mail" && (
        // Design finish Phase 1 (2026-10-28): the shared PromoCard on the pink, in
        // place of the orange band with white type (2.4:1). Copy unchanged.
        <section className="mx-4 md:mx-10 mb-12">
          <PromoCard
            tone="pink"
            heading="h2"
            eyebrow="Monthly subscription"
            title="Happy Mail"
            text="Every month, an envelope from Amy — filled with stickers, die cuts, and surprises designed just for subscribers. Starting at $13/month."
            cta={{
              href: "/happy-mail",
              label: "Learn More",
              event: "hm_subscribe_click",
              eventData: { source: "cross-sell-shop", cta_text: "Shop Happy Mail Cross-sell", destination: "/happy-mail", page: "shop" },
            }}
            image={{ src: "/images/products/happy-mail/1.jpg", alt: "Happy Mail subscription" }}
          />
        </section>
      )}
    </main>
  )
}
