"use client"

import { useState } from "react"
import { trackEvent } from "@/lib/analytics"

interface Props {
  variantId: string
  productTitle: string
  productHandle: string
  isSubscription?: boolean
}

export default function AddToCartButton({
  variantId,
  productTitle,
  productHandle,
  isSubscription = false,
}: Props) {
  const [status, setStatus] = useState<"idle" | "adding" | "added">("idle")

  async function handleAddToCart() {
    setStatus("adding")

    try {
      // TODO: wire to cart context / server action when cart drawer is built
      // For now: track the event and show confirmation feedback
      trackEvent("add_to_cart", {
        product_name: productTitle,
        variant_id: variantId,
        product_handle: productHandle,
      })

      // Simulate async (replace with real cart mutation)
      await new Promise((r) => setTimeout(r, 400))
      setStatus("added")
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("idle")
    }
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
      disabled={status !== "idle"}
      className="w-full py-3.5 text-[13px] uppercase tracking-[0.12em] font-semibold rounded-full transition-all duration-300 text-white disabled:opacity-70"
      style={{ background: status === "added" ? "var(--color-teal)" : "var(--color-orange)" }}
    >
      {status === "idle" && "Add to Cart"}
      {status === "adding" && "Adding..."}
      {status === "added" && "Added!"}
    </button>
  )
}
