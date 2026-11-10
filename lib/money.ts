// Price formatting with no environment reads, so client components (the product
// card, the buy box) can import it without pulling lib/shopify.ts into the browser
// bundle. lib/shopify.ts re-exports it as formatPrice.

export type Money = { amount: string; currencyCode: string }

export function formatMoney(price: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currencyCode,
  }).format(parseFloat(price.amount))
}
