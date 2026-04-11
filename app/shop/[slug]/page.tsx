// Product detail page -- per wireframes/pdp-mobile.html + pdp-desktop.html
// Sections: image carousel, breadcrumb, product info, qty+ATC, details accordion,
//           HM cross-sell, "You may also like" (same category), "Pairs well with" (cross-category)
// TODO Phase 2: wire getProductByHandle() and related products query

import { getProductByHandle } from "@/lib/shopify"
import { notFound } from "next/navigation"

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // TODO: uncomment once Shopify store is set up
  // const product = await getProductByHandle(params.slug)
  // if (!product) notFound()

  return (
    <main className="min-h-screen p-8" style={{ background: "var(--color-white)" }}>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Product: <strong>{params.slug}</strong> — loads once Shopify is connected.
      </p>
    </main>
  )
}
