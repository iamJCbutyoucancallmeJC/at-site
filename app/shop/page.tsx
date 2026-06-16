import Image from "next/image"
import { getAllProducts } from "@/lib/shopify"
import { getVisitorCountry } from "@/lib/geo"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
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
                event="hm_subscribe_click"
                eventData={{ source: "cross-sell-shop", cta_text: "Shop Happy Mail Cross-sell", destination: "/happy-mail", page: "shop" }}
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
