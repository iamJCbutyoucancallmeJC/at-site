import { notFound } from "next/navigation"
import { getPreviewProductByHandle, getPreviewProducts } from "@/lib/shopify-admin"
import ProductDetail from "@/components/product-detail"

// Preview-only PDP: reads the DRAFT product via the Admin API and renders the
// SAME <ProductDetail> the live /shop/[slug] page uses, so the SKU page Amy
// reviews is identical to what ships. Gated by proxy.ts. Never cached.
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PreviewProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getPreviewProductByHandle(handle)
  if (!product) notFound()

  // Related: same collection, drawn from the preview set (draft + active).
  const all = await getPreviewProducts()
  const relatedProducts = all
    .filter(
      (p) =>
        p.id !== product.id &&
        p.collections.nodes.some((c) =>
          product.collections.nodes.some((pc) => pc.handle === c.handle)
        )
    )
    .slice(0, 4)

  return (
    <>
      {/* PREVIEW banner so a SKU page is never mistaken for the live product. */}
      <div
        className="px-4 md:px-10 py-2.5 text-center text-[12px] uppercase tracking-[0.12em] font-semibold"
        style={{ background: "var(--color-orange)", color: "#fff" }}
      >
        Preview only — not live. This is an unpublished (draft) product.
      </div>
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        slug={handle}
        shopBasePath="/preview/shop"
        pdpBasePath="/preview/shop"
      />
    </>
  )
}
