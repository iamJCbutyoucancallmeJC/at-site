// lib/shopify-admin.ts
//
// Server-side Shopify Admin API helper. Used by /api/download to verify
// an order belongs to the customer requesting it, and to look up the PDF
// file attached to the line item's product.
//
// Auth flow: client_credentials grant -> 24hr admin token, cached in
// memory. See shopify-admin-api.md for the canonical reference. NEVER
// import this from a client component; the access tokens are sensitive.

const STORE = process.env.SHOPIFY_STORE_DOMAIN!
const CLIENT_ID = process.env.SHOPIFY_ADMIN_CLIENT_ID
const CLIENT_SECRET = process.env.SHOPIFY_ADMIN_CLIENT_SECRET
const API_VERSION = "2026-04"

let tokenCache: { value: string; expiresAt: number } | null = null

async function getAdminToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.value
  }
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("SHOPIFY_ADMIN_CLIENT_ID / SHOPIFY_ADMIN_CLIENT_SECRET not set")
  }
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`admin token exchange failed: ${res.status}`)
  }
  const json = (await res.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  }
  return tokenCache.value
}

export async function adminGraphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token = await getAdminToken()
  const res = await fetch(`https://${STORE}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`admin graphql failed: ${res.status}`)
  }
  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) {
    throw new Error(`admin graphql error: ${JSON.stringify(json.errors)}`)
  }
  return json.data as T
}

// ---------------------------------------------------------------------------
// Domain helpers for /api/download
// ---------------------------------------------------------------------------

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

const ORDER_QUERY = /* GraphQL */ `
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
                metafield(namespace: "digital", key: "pdf_file_gid") {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`

const FILE_URL_QUERY = /* GraphQL */ `
  query FileUrl($id: ID!) {
    node(id: $id) {
      ... on GenericFile {
        url
        mimeType
      }
    }
  }
`

/**
 * Look up an order line item and resolve its PDF download URL.
 *
 * Strategy: each product carries a `digital.pdf_file_gid` metafield pointing
 * to a Shopify GenericFile GID (the uploaded PDF). We query the order, find
 * the line item by ID, follow the variant -> product -> metafield chain,
 * then look up the file URL.
 */
export async function getDigitalLineItem(
  orderIdNumeric: string,
  lineItemIdNumeric: string,
): Promise<OrderLineItem | null> {
  const orderGid = `gid://shopify/Order/${orderIdNumeric}`
  const data = await adminGraphql<{
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
              product: {
                id: string
                title: string
                tags: string[]
                metafield: { value: string } | null
              }
            }
          }
        }>
      }
    } | null
  }>(ORDER_QUERY, { id: orderGid })

  if (!data.order) return null

  const targetGid = `gid://shopify/LineItem/${lineItemIdNumeric}`
  const match = data.order.lineItems.edges.find((e) => e.node.id === targetGid)
  if (!match) return null

  const product = match.node.variant.product
  const pdfFileGid = product.metafield?.value
  if (!pdfFileGid) {
    return {
      id: lineItemIdNumeric,
      email: data.order.email,
      productId: product.id.split("/").pop() ?? "",
      variantId: match.node.variant.id.split("/").pop() ?? "",
      productTitle: product.title,
      pdfFileGid: null,
      pdfFileUrl: null,
      pdfFilename: derivePdfFilename(product.title),
    }
  }

  const fileData = await adminGraphql<{
    node: { url: string; mimeType: string } | null
  }>(FILE_URL_QUERY, { id: pdfFileGid })

  return {
    id: lineItemIdNumeric,
    email: data.order.email,
    productId: product.id.split("/").pop() ?? "",
    variantId: match.node.variant.id.split("/").pop() ?? "",
    productTitle: product.title,
    pdfFileGid,
    pdfFileUrl: fileData.node?.url ?? null,
    pdfFilename: derivePdfFilename(product.title),
  }
}

function derivePdfFilename(title: string): string {
  // Strip Squarespace merchandising prefixes + non-filename chars.
  const base = title
    .replace(/^\*[A-Z][A-Z\s\-]*\*\s*/g, "")
    .replace(/\s*\*[A-Z][A-Z\s\-]*\*\s*$/g, "")
    .replace(/[^a-zA-Z0-9\s\-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
  return `${base || "download"}.pdf`
}
