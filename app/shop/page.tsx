// Shop page -- REWRITE per wireframes/shop-mobile.html + shop-desktop.html
// Category pills: Stamps, Stickers & Dies, Digital, Bundles
// HM cross-sell card inline after row 3
// TODO Phase 2: wire getAllProducts() and filter by collection

import { getAllProducts } from "@/lib/shopify"

export default async function ShopPage() {
  // TODO: uncomment once Shopify store is set up
  // const products = await getAllProducts()

  return (
    <main className="min-h-screen p-8" style={{ background: "var(--color-white)" }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>
        Shop
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Products will load here once Shopify is connected.
      </p>
    </main>
  )
}
