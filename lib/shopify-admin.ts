/**
 * Shopify ADMIN API client -- PREVIEW USE ONLY.
 *
 * The public site reads via the Storefront API (lib/shopify.ts), which can only
 * see ACTIVE products published to the Online Store. This module reads via the
 * Admin API, which CAN see DRAFT products, so the gated /preview/shop route can
 * show Amy products before they go live.
 *
 * It mints a short-lived Admin token via the client_credentials grant using the
 * app credentials already in the environment (SHOPIFY_ADMIN_CLIENT_ID /
 * SHOPIFY_ADMIN_CLIENT_SECRET). No new credentials are introduced.
 *
 * SERVER-ONLY. Never import this into a client component. The Admin token must
 * never reach the browser. The /preview/* route is also password-gated in
 * middleware.ts as defense-in-depth.
 *
 * Output is mapped to the SAME ShopifyProduct shape that lib/shopify.ts returns,
 * so the shared <ShopGrid> renders preview and production identically.
 */

import "server-only"
import type { ShopifyProduct } from "@/lib/shopify"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const ADMIN_CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID!
const ADMIN_CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET!
const ADMIN_API_VERSION = "2026-04"
const ADMIN_ENDPOINT = `https://${SHOPIFY_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`
const TOKEN_ENDPOINT = `https://${SHOPIFY_DOMAIN}/admin/oauth/access_token`

// ---------------------------------------------------------------------------
// Token (client_credentials grant) -- cached in-process for its short lifetime
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null

async function adminToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: ADMIN_CLIENT_ID,
      client_secret: ADMIN_CLIENT_SECRET,
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Admin token fetch failed: ${res.status} ${res.statusText}`)
  const json = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) throw new Error("Admin token response missing access_token")
  // expires_in is seconds; default to 1h if absent.
  cachedToken = { value: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 }
  return cachedToken.value
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await adminToken()
  const res = await fetch(ADMIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Admin fetch failed: ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (json.errors) throw new Error(`Admin GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data as T
}

// ---------------------------------------------------------------------------
// Admin product shape (only the fields the shop grid + PDP consume) -> mapped
// ---------------------------------------------------------------------------

type AdminMoney = { amount: string; currencyCode: string }

type AdminProductNode = {
  id: string
  handle: string
  title: string
  status: "ACTIVE" | "DRAFT" | "ARCHIVED"
  description: string
  descriptionHtml: string
  totalInventory: number | null
  tracksInventory: boolean
  productType: string
  tags: string[]
  priceRangeV2: { minVariantPrice: AdminMoney; maxVariantPrice: AdminMoney }
  featuredImage: { url: string; altText: string | null; width: number | null; height: number | null } | null
  media: {
    nodes: { image: { url: string; altText: string | null; width: number | null; height: number | null } | null }[]
  }
  variants: {
    nodes: {
      id: string
      title: string
      availableForSale: boolean
      price: string
      compareAtPrice: string | null
    }[]
  }
  collections: { nodes: { handle: string; title: string }[] }
}

function mapAdminProduct(p: AdminProductNode, currency: string): ShopifyProduct {
  const images = p.media.nodes
    .map((m) => m.image)
    .filter((img): img is NonNullable<typeof img> => !!img)
    .map((img) => ({
      url: img.url,
      altText: img.altText,
      width: img.width ?? 0,
      height: img.height ?? 0,
    }))
  // Fall back to featuredImage if media is empty.
  if (images.length === 0 && p.featuredImage) {
    images.push({
      url: p.featuredImage.url,
      altText: p.featuredImage.altText,
      width: p.featuredImage.width ?? 0,
      height: p.featuredImage.height ?? 0,
    })
  }

  const money = (amount: string): AdminMoney => ({ amount, currencyCode: currency })

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    // Admin has no availableForSale at product level; derive from any variant.
    availableForSale: p.variants.nodes.some((v) => v.availableForSale),
    priceRange: {
      minVariantPrice: { amount: p.priceRangeV2.minVariantPrice.amount, currencyCode: currency },
      maxVariantPrice: { amount: p.priceRangeV2.maxVariantPrice.amount, currencyCode: currency },
    },
    images: { nodes: images },
    variants: {
      nodes: p.variants.nodes.map((v) => ({
        id: v.id,
        title: v.title,
        availableForSale: v.availableForSale,
        price: money(v.price),
        compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
      })),
    },
    tags: p.tags,
    productType: p.productType,
    collections: { nodes: p.collections.nodes },
  }
}

const ADMIN_PRODUCT_FIELDS = `
  id
  handle
  title
  status
  description
  descriptionHtml
  totalInventory
  tracksInventory
  productType
  tags
  priceRangeV2 {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  featuredImage { url altText width height }
  media(first: 10) {
    nodes { ... on MediaImage { image { url altText width height } } }
  }
  variants(first: 20) {
    nodes { id title availableForSale price compareAtPrice }
  }
  collections(first: 5) { nodes { handle title } }
`

// ---------------------------------------------------------------------------
// Public: preview product reads (DRAFT + ACTIVE)
// ---------------------------------------------------------------------------

// Products opt INTO the preview by carrying this tag in Shopify. This keeps the
// preview scoped to the curated review set (not every draft in the catalog), and
// makes the process reusable: tag a product `preview-ready`, it shows up here;
// untag it (or publish it) when done. Live ACTIVE products are also shown so the
// reviewer sees the new items in the context of the real shop.
const PREVIEW_TAG = "preview-ready"

/**
 * Products the preview should show: anything tagged `preview-ready` (typically
 * DRAFT items staged for review) PLUS all live ACTIVE products, so a reviewer sees
 * the candidates alongside the existing shop. Currency is base USD; the preview is
 * for layout/lineup review, not localized-pricing QA.
 */
export async function getPreviewProducts(): Promise<ShopifyProduct[]> {
  const query = `
    query PreviewProducts {
      products(first: 120, sortKey: TITLE, query: "tag:${PREVIEW_TAG} OR status:active") {
        nodes { ${ADMIN_PRODUCT_FIELDS} }
      }
    }
  `
  const data = await adminFetch<{ products: { nodes: AdminProductNode[] } }>(query)
  return data.products.nodes.map((p) => mapAdminProduct(p, "USD"))
}

export async function getPreviewProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const query = `
    query PreviewProduct($handle: String!) {
      productByHandle(handle: $handle) { ${ADMIN_PRODUCT_FIELDS} }
    }
  `
  const data = await adminFetch<{ productByHandle: AdminProductNode | null }>(query, { handle })
  return data.productByHandle ? mapAdminProduct(data.productByHandle, "USD") : null
}

// ===========================================================================
// Digital download delivery (printables) -- used by /api/download and the
// /api/digital-orders/notify webhook. Ported from the digital-downloads
// architecture (digital-downloads-architecture-2026-05-27.md). Reuses the
// adminFetch token machinery above.
// ===========================================================================

export type OrderLineItem = {
  id: string                  // numeric (last segment of GID)
  email: string               // customer email on the order
  productId: string           // numeric
  variantId: string           // numeric
  productTitle: string
  pdfFileGid: string | null   // GenericFile GID from product metafield
  pdfFileUrl: string | null   // resolved file URL (CDN)
  pdfFilename: string         // derived from product title
}

const ORDER_QUERY = `
  query OrderForDownload($id: ID!) {
    order(id: $id) {
      id
      email
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            variant {
              id
              product {
                id
                title
                tags
                metafield(namespace: "digital", key: "pdf_file_gid") { value }
              }
            }
          }
        }
      }
    }
  }
`

const FILE_URL_QUERY = `
  query FileUrl($id: ID!) {
    node(id: $id) { ... on GenericFile { url mimeType } }
  }
`

function derivePdfFilename(title: string): string {
  const base = title
    .replace(/^\*[A-Z][A-Z\s\-]*\*\s*/g, "")
    .replace(/\s*\*[A-Z][A-Z\s\-]*\*\s*$/g, "")
    .replace(/[^a-zA-Z0-9\s\-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
  return `${base || "download"}.pdf`
}

type OrderQueryResult = {
  order: {
    id: string
    email: string
    lineItems: {
      edges: Array<{
        node: {
          id: string
          title: string
          variant: {
            id: string
            product: { id: string; title: string; tags: string[]; metafield: { value: string } | null }
          }
        }
      }>
    }
  } | null
}

/** Resolve a single order line item -> its PDF download URL. */
export async function getDigitalLineItem(
  orderIdNumeric: string,
  lineItemIdNumeric: string,
): Promise<OrderLineItem | null> {
  const orderGid = `gid://shopify/Order/${orderIdNumeric}`
  const data = await adminFetch<OrderQueryResult>(ORDER_QUERY, { id: orderGid })
  if (!data.order) return null

  const targetGid = `gid://shopify/LineItem/${lineItemIdNumeric}`
  const match = data.order.lineItems.edges.find((e) => e.node.id === targetGid)
  if (!match) return null

  const product = match.node.variant.product
  const pdfFileGid = product.metafield?.value ?? null
  let pdfFileUrl: string | null = null
  if (pdfFileGid) {
    const fileData = await adminFetch<{ node: { url: string; mimeType: string } | null }>(
      FILE_URL_QUERY, { id: pdfFileGid })
    pdfFileUrl = fileData.node?.url ?? null
  }

  return {
    id: lineItemIdNumeric,
    email: data.order.email,
    productId: product.id.split("/").pop() ?? "",
    variantId: match.node.variant.id.split("/").pop() ?? "",
    productTitle: product.title,
    pdfFileGid,
    pdfFileUrl,
    pdfFilename: derivePdfFilename(product.title),
  }
}

/** All digital (printable) line items on an order, for the post-purchase notify webhook. */
export async function getDigitalLineItems(orderIdNumeric: string): Promise<OrderLineItem[]> {
  const orderGid = `gid://shopify/Order/${orderIdNumeric}`
  const data = await adminFetch<OrderQueryResult>(ORDER_QUERY, { id: orderGid })
  if (!data.order) return []
  const email = data.order.email
  const out: OrderLineItem[] = []
  for (const edge of data.order.lineItems.edges) {
    const product = edge.node.variant.product
    const pdfFileGid = product.metafield?.value ?? null
    if (!pdfFileGid) continue // not a digital line item
    let pdfFileUrl: string | null = null
    const fileData = await adminFetch<{ node: { url: string; mimeType: string } | null }>(
      FILE_URL_QUERY, { id: pdfFileGid })
    pdfFileUrl = fileData.node?.url ?? null
    out.push({
      id: edge.node.id.split("/").pop() ?? "",
      email,
      productId: product.id.split("/").pop() ?? "",
      variantId: product.id.split("/").pop() ?? "",
      productTitle: product.title,
      pdfFileGid,
      pdfFileUrl,
      pdfFilename: derivePdfFilename(product.title),
    })
  }
  return out
}
