"use client"

import { useState } from "react"
import type { ShopifyProduct } from "@/lib/shopify"
import { formatMoney } from "@/lib/money"
import AddToCartButton from "@/components/add-to-cart-button"
import BackInStockForm from "@/components/back-in-stock-form"
import {
  choosableVariants,
  isDigitalProduct,
  isPreorderVariant,
  isSubscriptionProduct,
  optionName,
  variantLabel,
} from "@/lib/product-state"
import {
  DIGITAL_LINE,
  PREORDER_LINE,
  SHIPPING_LINE,
  SHIPPING_LINE_FREE_US,
  SUBSCRIPTION_LINE,
} from "@/lib/shop-copy"

// The product page's buy box (design finish, Phase 2, 2026-11-10): the price at the
// h3 size (22/600, as a paragraph so the heading order stays h1 then h2), the option
// picker when a product comes in more than one design (the 11/13 shop update brings
// seven notebook inserts and two tins), the one button, and the shipping line under
// it. A sold-out variant shows the line "Sold out" and the back-in-stock form instead
// of a disabled pill (the Phase 1 read found two identical ink-ring pills stacked here).

export default function BuyBox({
  product,
  slug,
  subscribeSellingPlanId,
}: {
  product: ShopifyProduct
  slug: string
  subscribeSellingPlanId?: string
}) {
  const variants = choosableVariants(product)
  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => (variants.find((v) => v.availableForSale) ?? variants[0])?.id
  )
  const variant = variants.find((v) => v.id === selectedId) ?? variants[0]
  const subscription = isSubscriptionProduct(product)
  const digital = isDigitalProduct(product)
  const preorder = isPreorderVariant(variant)
  const showPicker = variants.length > 1
  const pickerTitle = optionName(product) ?? "Options"
  const price = variant ? formatMoney(variant.price) : formatMoney(product.priceRange.minVariantPrice)
  const compareAt =
    variant?.compareAtPrice && parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)
      ? formatMoney(variant.compareAtPrice)
      : null
  const available = !!variant && variant.availableForSale
  const freeUs = product.description.toLowerCase().includes("free us shipping")
  const shippingLine = !available
    ? null
    : digital
      ? DIGITAL_LINE
      : subscription
        ? SUBSCRIPTION_LINE
        : preorder
          ? PREORDER_LINE
          : freeUs
            ? SHIPPING_LINE_FREE_US
            : SHIPPING_LINE
  const selectedLabel = variant ? variantLabel(variant) : ""
  const cartTitle = showPicker && selectedLabel ? `${product.title} (${selectedLabel})` : product.title

  return (
    <div>
      <p className="text-[22px] font-semibold leading-tight" style={{ color: "var(--color-ink)" }}>
        {price}
        {subscription && (
          <span className="ml-1 text-[15px] font-normal" style={{ color: "var(--color-ink-soft)" }}>
            / month
          </span>
        )}
        {compareAt && (
          <s className="ml-2 text-[15px] font-normal" style={{ color: "var(--color-ink-soft)" }}>
            {compareAt}
          </s>
        )}
      </p>

      {showPicker && (
        <fieldset className="mt-5">
          <legend className="mb-2 text-[14px] font-semibold" style={{ color: "var(--color-ink)" }}>
            {pickerTitle}
          </legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const label = variantLabel(v) || "One size"
              const on = v.id === variant?.id
              return (
                <label key={v.id}>
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={on}
                    onChange={() => setSelectedId(v.id)}
                    className="sr-only"
                  />
                  <span
                    className={`option-chip${on ? " option-chip--on" : ""}${v.availableForSale ? "" : " option-chip--out"}`}
                  >
                    {label}
                    {!v.availableForSale && <span className="sr-only">, sold out</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-5">
        {available && variant ? (
          <AddToCartButton
            variantId={variant.id}
            productTitle={cartTitle}
            productHandle={slug}
            price={price}
            priceAmount={parseFloat(variant.price.amount)}
            imageUrl={product.images.nodes[0]?.url ?? ""}
            isSubscription={subscription}
            sellingPlanId={subscribeSellingPlanId}
            label={preorder ? "Preorder" : "Add to cart"}
            source="pdp"
          />
        ) : (
          <p className="text-[16px] font-semibold" style={{ color: "var(--color-ink)" }}>
            Sold out{showPicker && selectedLabel ? ` in ${selectedLabel}` : ""}
          </p>
        )}
      </div>

      {shippingLine && (
        <p className="mt-3 text-[13px] leading-snug" style={{ color: "var(--color-ink-soft)" }}>
          {shippingLine}
        </p>
      )}

      {variant && !variant.availableForSale && (
        <div id="back-in-stock" className="scroll-mt-24">
          <BackInStockForm variantId={variant.id} productHandle={slug} />
        </div>
      )}
    </div>
  )
}
