import { getAllProducts } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import PromoCard from "@/components/promo-card"
import ShopGrid, { selectProductsForCategory } from "@/components/shop-grid"
import { getClass } from "@/lib/classes"

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
  // The Glimmers class leads the All grid while it is on sale (JC 10/29). It links to
  // its sales page, never to a product page: classes check out from /glimmers.
  const glimmers = getClass("glimmers")
  const leadTiles =
    activeCategory === "all" && glimmers?.sales.live
      ? [{ href: "/glimmers", title: "Glimmers and Gratitude: a November class", price: `$${glimmers.sales.price}`, image: { src: "/images/classes/glimmers-amy-journal.jpg", alt: "Amy Tangerine holding her Glimmers and Gratitude journal" } }]
      : []

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="shop" />

      <ShopGrid products={products} activeCategory={activeCategory} leadTiles={leadTiles} />

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
