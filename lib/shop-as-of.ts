/**
 * PREVIEW BRANCH ONLY (preview/saturday-open, t2113). Never merge to main.
 *
 * Shows the shop as it will read at 9:01am Pacific on Saturday 11/28: the
 * products Shopify has scheduled for the Online Store at 9:00 are not visible
 * to the Storefront API until then, so this branch reads the grid and product
 * pages through the Admin API and keeps exactly what a US shopper will see:
 * ACTIVE, in the US catalog, and on the Online Store now or by AS_OF.
 *
 * The cart still talks to the real Storefront, so an item that opens Saturday
 * cannot be added to a cart from this preview before 9am.
 */
import "server-only"
import type { ShopifyProduct } from "@/lib/shopify"
import { adminFetch, ADMIN_PRODUCT_FIELDS, mapAdminProduct, type AdminProductNode } from "@/lib/shopify-admin"
import { PREVIEW_AS_OF } from "@/lib/shop-refresh"

const PUB_ONLINE = "gid://shopify/Publication/290470854976"
const PUB_US = "gid://shopify/Publication/296161968448"

type Node = AdminProductNode & {
  status: string
  us: boolean
  resourcePublicationsV2: { nodes: { publication: { id: string }; isPublished: boolean; publishDate: string | null }[] }
}

const FIELDS = `
  ${ADMIN_PRODUCT_FIELDS}
  us: publishedOnPublication(publicationId: "${PUB_US}")
  resourcePublicationsV2(first: 20, onlyPublished: false) {
    nodes { publication { id } isPublished publishDate }
  }
`

function visibleAsOf(p: Node): boolean {
  if (p.status !== "ACTIVE" || !p.us) return false
  const asOf = Date.parse(PREVIEW_AS_OF)
  return p.resourcePublicationsV2.nodes.some(
    (n) =>
      n.publication.id === PUB_ONLINE &&
      (n.isPublished || (n.publishDate !== null && Date.parse(n.publishDate) <= asOf)),
  )
}

export async function getAllProducts(_country?: string): Promise<ShopifyProduct[]> {
  const out: Node[] = []
  let after: string | null = null
  for (;;) {
    const data: { products: { nodes: Node[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } } =
      await adminFetch(
        `query AsOf($after: String) {
          products(first: 50, after: $after, sortKey: TITLE, query: "status:active") {
            nodes { ${FIELDS} }
            pageInfo { hasNextPage endCursor }
          }
        }`,
        { after },
      )
    out.push(...data.products.nodes)
    if (!data.products.pageInfo.hasNextPage) break
    after = data.products.pageInfo.endCursor
  }
  return out
    .filter(visibleAsOf)
    .map((p) => mapAdminProduct(p, "USD"))
    .filter((p) => !p.tags.includes("Recharge Gift Product") && p.productType !== "Class")
}

export async function getProductByHandle(handle: string, _country?: string): Promise<ShopifyProduct | null> {
  const data = await adminFetch<{ productByHandle: Node | null }>(
    `query AsOfOne($handle: String!) { productByHandle(handle: $handle) { ${FIELDS} } }`,
    { handle },
  )
  const p = data.productByHandle
  return p && visibleAsOf(p) ? mapAdminProduct(p, "USD") : null
}
