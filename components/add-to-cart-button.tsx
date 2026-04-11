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
}

export default function AddToCartButton({
  variantId,
  productTitle,
  productHandle,
  price,
  priceAmount,
  imageUrl,
  isSubscription = false,
}: Props) {
  const { addItem } = useCart()
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle")

  async function handleAddToCart() {
    setStatus("adding")
    addItem({
      variantId,
      productHandle,
      title: productTitle,
      price,
      priceAmount,
      imageUrl,
    })
    setStatus("added")
    setTimeout(() => setStatus("idle"), 2000)
  }

  if (isSubscription) {
    return (
      <a
        href="/happy-mail"
        className="block w-full py-3.5 text-center text-[13px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 text-white"
        style={{ background: "var(--color-orange)" }}
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

  return (
    <button
      onClick={handleAddToCart}
      disabled={status === "adding"}
      className="w-full py-3.5 text-[13px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 text-white disabled:opacity-70"
      style={{ background: status === "added" ? "var(--color-teal)" : "var(--color-orange)" }}
    >
      {status === "idle" && "Add to Cart"}
      {status === "adding" && "Adding..."}
      {status === "added" && "Added to Cart"}
    </button>
  )
}
