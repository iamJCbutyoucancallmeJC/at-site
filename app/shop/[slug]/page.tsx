import { notFound, redirect } from "next/navigation"
import { getProductByHandle, getAllProducts } from "@/lib/shopify"
import { getVisitorCountry, isInternational } from "@/lib/geo"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import ProductDetail from "@/components/product-detail"

// Dynamic rendering: PDP varies by visitor country (Markets-scoped products).
export const dynamic = "force-dynamic"
// Render on-demand for any handle NOT in the build-time list (products added or
// published after the last deploy). Without this, a newly-published product 404s
// until the next rebuild -- which would bite the printables on publish.
export const dynamicParams = true

export async function generateStaticParams() {
  // US-default at build time; intl PDPs (Path B) resolve dynamically at request time.
  const products = await getAllProducts()
  return products.map((p) => ({ slug: p.handle }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductByHandle(slug)
  if (!product) return {}
  return {
    title: `${product.title} — Amy Tangerine`,
    description: product.description.slice(0, 155),
  }
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ plan?: string }>
}) {
  const { slug } = await params

  // Happy Mail has no standalone PDP. It's one Shopify product with two plan variants
  // (Monthly $13 / 6-Month $72), and /happy-mail is its canonical page (photos, both
  // plans, editorial, FAQ). Redirect every inbound /shop/happy-mail path -- cart links,
  // old bookmarks, search -- to the landing. Carry ?plan= so a 6-Month cart click
  // pre-selects the 6-Month plan there. (Replaces the old generic PDP that showed stale
  // Shopify copy + always the Monthly variant. 2026-05-30.)
  if (slug === "happy-mail") {
    const sp = await searchParams
    const plan = sp.plan === "6-month" ? "6-month" : "monthly"
    redirect(`/happy-mail?plan=${plan}`)
  }

  // International Happy Mail also has no standalone PDP -- it gets the same treatment as US
  // HM: /happy-mail-international is its rich landing page (IHM stamp, $16 pricing, intl FAQ).
  // Redirect every inbound /shop/happy-mail-international path there. (2026-05-30.) Works for
  // every visitor: an intl buyer lands on the buyable page; a US visitor sees it and is
  // cross-linked to /happy-mail (US can't purchase the intl product).
  if (slug === "happy-mail-international") {
    redirect("/happy-mail-international")
  }

  // Country is resolved for PRICING CONTEXT only (localized currency via @inContext).
  // The previous symmetric US<->intl redirect machinery was removed 2026-05-29: IHM is now
  // a normal catalog product visible to everyone; no geo routing. The single guard below is
  // the one piece kept -- it prevents an international visitor who lands on the US-only $13 HM
  // URL from hitting a dead "not found" (that product is market-scoped null for their context).
  const country = await getVisitorCountry()

  const product = await getProductByHandle(slug, country)
  if (!product) {
    // Guard: intl visitor requested the US-only HM product (null for their market) -> route to
    // the international HM landing instead of a dead end. Everything else 404s normally.
    if (slug === "happy-mail" && isInternational(country)) {
      redirect("/happy-mail-international")
    }
    notFound()
  }

  const allProducts = await getAllProducts(country)
  // Related: same collection, excluding current
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        p.collections.nodes.some((c) =>
          product.collections.nodes.some((pc) => pc.handle === c.handle)
        )
    )
    .slice(0, 4)

  // Path B: international subs subscribe directly from this PDP (no /happy-mail redirect).
  // Selling plan ID hardcoded as fallback; can be overridden via env var.
  const isHappyMailIntl = product.handle === "happy-mail-international"
  const HM_INTL_SELLING_PLAN_ID =
    process.env.NEXT_PUBLIC_HM_INTL_SELLING_PLAN_ID ?? "gid://shopify/SellingPlan/693645214016"
  const subscribeSellingPlanId = isHappyMailIntl ? HM_INTL_SELLING_PLAN_ID : undefined

  return (
    <>
      <PageEngagementTracker page={`pdp-${slug}`} />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        slug={slug}
        subscribeSellingPlanId={subscribeSellingPlanId}
      />
    </>
  )
}
