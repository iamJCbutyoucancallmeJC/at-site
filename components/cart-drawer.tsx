"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"

// Detect local (non-Shopify) variant IDs — checkout not available yet
function isLocalVariant(variantId: string) {
  return variantId.startsWith("local-")
}

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, removeItem, updateQty } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) closeCart()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, closeCart])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const hasLocalItems = items.some((i) => isLocalVariant(i.variantId))

  function handleCheckout() {
    trackEvent("begin_checkout", {
      item_count: count,
      subtotal,
    })
    // TODO: when Shopify products are imported, call createCart() + redirect to checkoutUrl
    // For now, nothing — button is disabled for local items
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          background: "var(--color-white)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: "var(--color-text-primary)" }} />
            <h2
              className="text-[15px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Cart
            </h2>
            {count > 0 && (
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white"
                style={{ background: "var(--color-orange)" }}
              >
                {count}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
              <ShoppingBag size={40} style={{ color: "var(--color-border)" }} />
              <p
                className="text-[14px] text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Your cart is empty
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="px-6 py-2.5 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full text-white transition-colors"
                style={{ background: "var(--color-orange)" }}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 pb-4 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {/* Image */}
                  <Link
                    href={`/shop/${item.productHandle}`}
                    onClick={closeCart}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-50"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${item.productHandle}`}
                      onClick={closeCart}
                      className="block text-[13px] font-medium leading-snug line-clamp-2 hover:underline mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </Link>
                    <p
                      className="text-[13px] mb-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.price}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center border rounded-full overflow-hidden"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-[13px] font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-[11px] uppercase tracking-[0.05em] hover:underline ml-1"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <p
                    className="text-[13px] font-semibold flex-shrink-0"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(item.priceAmount * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="flex-shrink-0 px-5 py-5 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="text-[13px] uppercase tracking-[0.08em] font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Subtotal
              </span>
              <span
                className="text-[18px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {subtotal}
              </span>
            </div>

            {hasLocalItems ? (
              <div>
                <div
                  className="w-full py-3.5 text-center text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 mb-2"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Checkout coming soon
                </div>
                <p
                  className="text-[11px] text-center leading-snug"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Full checkout will be available when the store launches.
                </p>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="w-full py-3.5 text-[13px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-colors"
                style={{ background: "var(--color-orange)" }}
              >
                Checkout
              </button>
            )}

            <Link
              href="/shop"
              onClick={closeCart}
              className="block mt-3 text-center text-[12px] uppercase tracking-[0.08em] font-medium hover:underline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
