"use client"

import { useState } from "react"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"

interface Props {
  variantId: string
  productTitle: string
  productHandle: string
  price: string         // formatted, e.g. "$16.00"
  priceAmount: number   // numeric, e.g. 16.00
  imageUrl: string
  isSubscription?: boolean
  sellingPlanId?: string // if present, Subscribe adds to cart with this plan instead of redirecting
  /** "Add to cart" by default; the buy box passes "Preorder" for stock that is not here yet. */
  label?: string
  /** GA4 source_section on add_to_cart (pdp by default). */
  source?: string
}

export default function AddToCartButton({
  variantId,
  productTitle,
  productHandle,
  price,
  priceAmount,
  imageUrl,
  isSubscription = false,
  sellingPlanId,
  label = "Add to cart",
  source = "pdp",
}: Props) {
  const { addItem, hydrated } = useCart()
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle")

  async function handleAddToCart() {
    // The button stays disabled until the cart context reports `hydrated`, so a
    // click landing inside the hydration window cannot be swallowed or clobbered.
    // Belt-and-suspenders with the merging HYDRATE reducer in context/cart.tsx.
    if (!hydrated) return
    setStatus("adding")
    // Fires the GA4 add_to_cart event (standard ecommerce shape) from the cart
    // context, the single add path. See context/cart.tsx addItem. (t687)
    addItem(
      {
        variantId,
        productHandle,
        title: productTitle,
        price,
        priceAmount,
        imageUrl,
        sellingPlanId,
      },
      { source_section: source }
    )
    setStatus("added")
    setTimeout(() => setStatus("idle"), 2000)
  }

  if (isSubscription && !sellingPlanId) {
    // Canonical HM PDP at /shop/happy-mail: redirect to /happy-mail landing where the
    // Monthly/6-Month plan picker lives. Path B and any future Subscribe-direct PDPs
    // pass sellingPlanId to bypass this redirect.
    return (
      <a
        href="/happy-mail"
        className="cta-primary w-full"
        onClick={() =>
          trackEvent("hero_cta_click", {
            cta_text: "Subscribe",
            destination: "/happy-mail",
            page: "pdp",
          })
        }
      >
        Subscribe
      </a>
    )
  }

  if (isSubscription && sellingPlanId) {
    return (
      <button
        onClick={handleAddToCart}
        disabled={status === "adding" || !hydrated}
        className={`${status === "added" ? "cta-teal" : "cta-primary"} w-full`}
      >
        {status === "idle" && `Subscribe · ${price}/mo`}
        {status === "adding" && "Adding..."}
        {status === "added" && "Added to cart"}
      </button>
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={status === "adding" || !hydrated}
      className={`${status === "added" ? "cta-teal" : "cta-primary"} w-full`}
    >
      {status === "idle" && label}
      {status === "adding" && "Adding..."}
      {status === "added" && "Added to cart"}
    </button>
  )
}
