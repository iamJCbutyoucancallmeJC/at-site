/**
 * Shopify Storefront API client
 *
 * Requires env vars:
 *   SHOPIFY_STORE_DOMAIN       e.g. "amy-tangerine.myshopify.com"
 *   SHOPIFY_STOREFRONT_TOKEN   Storefront API public access token
 *
 * Storefront API version: 2025-01
 */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!
const SHOPIFY_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!
const API_VERSION = "2025-01"
const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR: revalidate product data every 60s
  })

  if (!res.ok) {
    throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  }

  return json.data as T
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ShopifyImage = {
  url: string
  altText: string | null
  width: number
  height: number
}

export type ShopifyPrice = {
  amount: string
  currencyCode: string
}

export type ShopifyVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyPrice
  compareAtPrice: ShopifyPrice | null
}

export type ShopifyProduct = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  priceRange: {
    minVariantPrice: ShopifyPrice
    maxVariantPrice: ShopifyPrice
  }
  images: { nodes: ShopifyImage[] }
  variants: { nodes: ShopifyVariant[] }
  tags: string[]
  productType: string
  collections: { nodes: { handle: string; title: string }[] }
}

export type ShopifyCart = {
  id: string
  checkoutUrl: string
  lines: {
    nodes: {
      id: string
      quantity: number
      merchandise: {
        id: string
        title: string
        product: Pick<ShopifyProduct, "title" | "handle" | "images">
        price: ShopifyPrice
      }
    }[]
  }
  cost: {
    subtotalAmount: ShopifyPrice
    totalAmount: ShopifyPrice
  }
}

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const IMAGE_FRAGMENT = `
  fragment ImageFragment on Image {
    url
    altText
    width
    height
  }
`

const PRICE_FRAGMENT = `
  fragment PriceFragment on MoneyV2 {
    amount
    currencyCode
  }
`

const VARIANT_FRAGMENT = `
  fragment VariantFragment on ProductVariant {
    id
    title
    availableForSale
    price { ...PriceFragment }
    compareAtPrice { ...PriceFragment }
  }
`

const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    handle
    title
    description
    descriptionHtml
    availableForSale
    tags
    productType
    priceRange {
      minVariantPrice { ...PriceFragment }
      maxVariantPrice { ...PriceFragment }
    }
    images(first: 10) {
      nodes { ...ImageFragment }
    }
    variants(first: 20) {
      nodes { ...VariantFragment }
    }
    collections(first: 5) {
      nodes { handle title }
    }
  }
`

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  // If no Shopify credentials are configured, use local catalog immediately
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    const { getAllLocalProducts } = await import("./products")
    return getAllLocalProducts()
  }

  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetAllProducts {
      products(first: 100, sortKey: TITLE) {
        nodes { ...ProductFragment }
      }
    }
  `

  try {
    const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(query)
    const products = data.products.nodes
    // Fall back to local catalog if Shopify store has no products yet
    if (products.length === 0) {
      const { getAllLocalProducts } = await import("./products")
      return getAllLocalProducts()
    }
    return products
  } catch {
    const { getAllLocalProducts } = await import("./products")
    return getAllLocalProducts()
  }
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    const { getLocalProductByHandle } = await import("./products")
    return getLocalProductByHandle(handle)
  }

  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetProduct($handle: String!) {
      productByHandle(handle: $handle) {
        ...ProductFragment
      }
    }
  `

  try {
    const data = await shopifyFetch<{ productByHandle: ShopifyProduct | null }>(query, { handle })
    if (data.productByHandle) return data.productByHandle
    // Fall back to local catalog if product not found in Shopify
    const { getLocalProductByHandle } = await import("./products")
    return getLocalProductByHandle(handle)
  } catch {
    const { getLocalProductByHandle } = await import("./products")
    return getLocalProductByHandle(handle)
  }
}

export async function getProductsByCollection(collectionHandle: string): Promise<ShopifyProduct[]> {
  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${VARIANT_FRAGMENT}
    ${PRODUCT_FRAGMENT}

    query GetCollection($handle: String!) {
      collection(handle: $handle) {
        products(first: 100) {
          nodes { ...ProductFragment }
        }
      }
    }
  `

  const data = await shopifyFetch<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
    query,
    { handle: collectionHandle }
  )
  return data.collection?.products.nodes ?? []
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { ...PriceFragment }
            product {
              title
              handle
              images(first: 1) {
                nodes { ...ImageFragment }
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount { ...PriceFragment }
      totalAmount { ...PriceFragment }
    }
  }
`

export async function createCart(): Promise<ShopifyCart> {
  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation CreateCart {
      cartCreate {
        cart { ...CartFragment }
      }
    }
  `

  const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(query)
  return data.cartCreate.cart
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<ShopifyCart> {
  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFragment }
      }
    }
  `

  const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(query, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  })
  return data.cartLinesAdd.cart
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${CART_FRAGMENT}

    query GetCart($cartId: ID!) {
      cart(id: $cartId) { ...CartFragment }
    }
  `

  const data = await shopifyFetch<{ cart: ShopifyCart | null }>(query, { cartId })
  return data.cart
}

export async function removeFromCart(cartId: string, lineId: string): Promise<ShopifyCart> {
  const query = `
    ${IMAGE_FRAGMENT}
    ${PRICE_FRAGMENT}
    ${CART_FRAGMENT}

    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFragment }
      }
    }
  `

  const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(query, {
    cartId,
    lineIds: [lineId],
  })
  return data.cartLinesRemove.cart
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatPrice(price: ShopifyPrice): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(parseFloat(price.amount))
}
