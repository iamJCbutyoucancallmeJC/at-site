import { getPreviewProducts } from "@/lib/shopify-admin"
import ShopGrid, { selectProductsForCategory } from "@/components/shop-grid"

// Preview-only: reads DRAFT + ACTIVE products via the Admin API so unpublished
// items can be reviewed before they go live. Gated by middleware.ts (password).
// Never linked from the public site. Always dynamic, never cached.
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PreviewShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const sp = await searchParams
  // Default to the Printables tab -- the current review subject. Reviewer can switch tabs.
  const activeCategory = sp.category ?? "printables"
  const allProducts = await getPreviewProducts()
  const products = selectProductsForCategory(allProducts, activeCategory)

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* PREVIEW banner -- unmistakable, so this is never read as the live shop. */}
      <div
        className="px-4 md:px-10 py-2.5 text-center text-[12px] uppercase tracking-[0.12em] font-semibold"
        style={{ background: "var(--color-orange)", color: "#fff" }}
      >
        Preview only — not live. Includes unpublished (draft) products for review.
      </div>

      <ShopGrid
        products={products}
        activeCategory={activeCategory}
        basePath="/preview/shop"
        pdpBasePath="/preview/shop"
        useLandingPages={false}
      />
    </main>
  )
}
