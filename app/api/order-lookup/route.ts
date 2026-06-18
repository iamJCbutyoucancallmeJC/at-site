// GET /api/order-lookup?cart_id=<storefront-cart-token>
//
// Resolves a *completed* Shopify order from the Storefront cart token and
// returns the minimal fields GA4's standard `purchase` event needs. Revenue is
// server-verified (read straight from the order on Shopify) so the number in
// GA4 matches Shopify admin exactly — the honesty constraint behind t687.
//
// Why search-by-cart_token: in Admin API 2026-04 the `cart_token` field is NOT
// selectable on the Order type, but it IS accepted as an orders() search term.
// Verified live 2026-06-18: a Storefront cart's id (gid://shopify/Cart/<token>)
// yields the same <token> that lands on the order as cart_token, and
// `query: "cart_token:<token>"` resolves the order. See the t687 spec doc.

import { NextResponse } from "next/server"
import { adminFetch } from "@/lib/shopify-admin"

export const dynamic = "force-dynamic"

type OrderNode = {
  name: string
  displayFinancialStatus: string | null
  currentTotalPriceSet: { shopMoney: { amount: string; currencyCode: string } }
  lineItems: {
    nodes: {
      quantity: number
      originalUnitPriceSet: { shopMoney: { amount: string } } | null
      variant: {
        id: string | null
        sku: string | null
        title: string | null
        product: { title: string | null } | null
      } | null
    }[]
  }
}

const ORDER_BY_CART = `
  query OrderByCart($q: String!) {
    orders(first: 5, query: $q, sortKey: CREATED_AT, reverse: true) {
      nodes {
        name
        displayFinancialStatus
        currentTotalPriceSet { shopMoney { amount currencyCode } }
        lineItems(first: 50) {
          nodes {
            quantity
            originalUnitPriceSet { shopMoney { amount } }
            variant { id sku title product { title } }
          }
        }
      }
    }
  }
`

export async function GET(request: Request) {
  const cartId = new URL(request.url).searchParams.get("cart_id")
  if (!cartId || !/^[A-Za-z0-9_-]{8,64}$/.test(cartId)) {
    return NextResponse.json({ found: false, error: "missing or malformed cart_id" }, { status: 400 })
  }

  try {
    const data = await adminFetch<{ orders: { nodes: OrderNode[] } }>(ORDER_BY_CART, {
      q: `cart_token:${cartId}`,
    })

    const order = data?.orders?.nodes?.[0]
    if (!order) {
      // Not an error: subscription renewals and draft/manual orders have a null
      // cart_token, so a real buyer can legitimately have no match here. The
      // thank-you page simply skips the purchase event in that case.
      return NextResponse.json({ found: false })
    }

    const money = order.currentTotalPriceSet.shopMoney
    return NextResponse.json({
      found: true,
      // Order name is "#1198"; strip the # for a clean GA4 transaction_id.
      transaction_id: order.name.replace(/^#/, ""),
      value: Number(money.amount),
      currency: money.currencyCode,
      items: order.lineItems.nodes.map((li) => ({
        item_id: li.variant?.sku || li.variant?.id || "",
        item_name: li.variant?.product?.title || li.variant?.title || "",
        price: Number(li.originalUnitPriceSet?.shopMoney?.amount ?? 0),
        quantity: li.quantity,
      })),
    })
  } catch (err) {
    // Status 200 on purpose: the thank-you page must never break for the buyer
    // because an analytics lookup failed. Log for our own debugging.
    console.error("[order-lookup]", err)
    return NextResponse.json({ found: false, error: "lookup failed" }, { status: 200 })
  }
}
