"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart, type CartItem } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"
import { HM_VARIANT_6MONTH_GID } from "@/lib/happy-mail-content"
import { isChromelessRoute, isQuietRoute } from "@/lib/chromeless-routes"
import { stashPendingCartToken } from "@/lib/pending-checkout-tokens"
import { CART_NUDGE } from "@/lib/shop-copy"

// The cart drawer (design finish, Phase 2, 2026-11-10): a sheet that rises from the
// bottom of a phone (16px top radius) and slides in from the right on desktop (16px
// left radius), rows at 14px, the Happy Mail row on orange-tint, one .cta-primary
// Checkout, and one nudge line grounded in the flat-rate shipping policy
// (lib/shop-copy.ts CART_NUDGE; set it to null to remove it). When closed the dialog
// is inert, so nothing inside it can take focus or be read.

// Detect local (non-Shopify) variant IDs — checkout not available yet
function isLocalVariant(variantId: string) {
  return variantId.startsWith("local-")
}

// Read the GA4 client_id from the _ga cookie. Format: "GA1.1.<cid1>.<cid2>"
// where the client_id GA4 uses is "<cid1>.<cid2>". Returns "" if not present
// (e.g. consent-blocked); the webhook tolerates a missing cid.
function readGaClientId(): string {
  try {
    const m = document.cookie.match(/(?:^|;\s*)_ga=GA\d\.\d\.(\d+\.\d+)/)
    return m ? m[1] : ""
  } catch {
    return ""
  }
}

// Resolve the PDP link for a cart item. Happy Mail is one product/handle with two
// plan variants (Monthly + 6-Month); the rebuilt /shop/happy-mail PDP reads ?plan=
// so the clicked item lands on the right plan instead of the default Monthly view.
function productHref(variantId: string, productHandle: string): string {
  if (productHandle === "happy-mail") {
    const plan = variantId === HM_VARIANT_6MONTH_GID ? "6-month" : "monthly"
    return `/shop/happy-mail?plan=${plan}`
  }
  return `/shop/${productHandle}`
}

// A Happy Mail line (either edition, or any subscription plan) gets the pink row.
function isHappyMailItem(item: CartItem): boolean {
  return item.productHandle.startsWith("happy-mail") || !!item.sellingPlanId
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, removeItem, updateQty } = useCart()
  const drawerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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
  const hasOneTimeItems = items.some((i) => !isHappyMailItem(i))

  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    setCheckingOut(true)
    // GA4 standard ecommerce shape (items[] + value + currency) so native
    // funnel reports populate; item_count/subtotal kept for back-compat. The
    // authoritative revenue is the server-side `purchase` event. See t687.
    const checkoutValue = items.reduce((sum, i) => sum + i.priceAmount * i.quantity, 0)
    trackEvent("begin_checkout", {
      item_count: count,
      subtotal,
      currency: "USD",
      value: checkoutValue,
      items: items.map((i) => ({
        item_id: i.variantId,
        item_name: i.title,
        price: i.priceAmount,
        quantity: i.quantity,
        ...(i.sellingPlanId ? { item_variant: "subscription" } : {}),
      })),
    })

    // Safety net: if the redirect hasn't happened after 8s (typical mobile
    // navigation is < 2s even on slow networks), reset the button so the user
    // can retry instead of staring at "One moment..." indefinitely. The
    // pageshow handler also clears it if the user lands back here via Shop Pay
    // intercept or browser back. See FNF-H-04 (Heidi 2026-05-24).
    const resetTimer = setTimeout(() => setCheckingOut(false), 8000)

    try {
      const res = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity, sellingPlanId: i.sellingPlanId })),
          // GA client_id so the orders/create webhook can attribute the
          // server-side purchase event to this browsing session (t687).
          gaClientId: readGaClientId(),
        }),
      })
      if (!res.ok) throw new Error("checkout failed")
      const { checkoutUrl, cartToken } = await res.json()
      // Stash the cart token so /thank-you can verify the round-trip and
      // only clear the local cart on a real checkout completion. Stashed as a
      // set so a checkout started in another tab doesn't clobber this one.
      // See t621, t646.
      if (cartToken) {
        stashPendingCartToken(cartToken)
      }
      window.location.href = checkoutUrl
    } catch {
      clearTimeout(resetTimer)
      setCheckingOut(false)
    }
  }

  // Reset checkout button if user returns to the cart via browser back/Shop
  // Pay cancel without a full page reload (bfcache restore).
  useEffect(() => {
    function onPageShow(e: PageTransitionEvent) {
      if (e.persisted) setCheckingOut(false)
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  // Chromeless (isolated event) routes have no cart drawer — checkout is a
  // single direct-to-Shopify redirect. Guard placed AFTER all hooks so hook
  // order stays stable across renders. See lib/chromeless-routes.
  if (isChromelessRoute(pathname) || isQuietRoute(pathname)) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(31, 26, 23, 0.45)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer: a bottom sheet on phones, a right-hand panel from md up. */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        inert={!isOpen}
        // visibility rides the transition: hidden once the slide-out ends, shown the
        // instant it opens, so the closed drawer is off-canvas AND invisible.
        className={`fixed z-50 flex flex-col shadow-2xl transition-[transform,visibility] duration-300 inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-full md:max-w-sm md:rounded-none md:rounded-l-2xl ${
          isOpen ? "visible translate-y-0 md:translate-x-0" : "invisible translate-y-full md:translate-y-0 md:translate-x-full"
        }`}
        style={{ background: "var(--color-white)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pl-5 pr-3 py-3 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} style={{ color: "var(--color-ink)" }} aria-hidden="true" />
            <h2 className="text-[18px] font-semibold" style={{ color: "var(--color-ink)" }}>
              Cart
            </h2>
            {count > 0 && (
              <span
                className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-[12px] font-bold"
                style={{ background: "var(--color-orange)", color: "var(--color-ink)" }}
              >
                {count}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="w-11 h-11 flex items-center justify-center rounded-full transition-colors hover:bg-[color:var(--color-paper)]"
            style={{ color: "var(--color-ink)" }}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 md:h-full md:pb-16">
              <ShoppingBag size={40} style={{ color: "var(--color-border)" }} aria-hidden="true" />
              <p className="text-[16px] text-center" style={{ color: "var(--color-ink)" }}>
                Your cart is empty
              </p>
              <Link href="/shop" onClick={closeCart} className="cta-primary cta--compact">
                Shop now
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => {
                const hm = isHappyMailItem(item)
                const href = productHref(item.variantId, item.productHandle)
                return (
                  <li
                    key={item.variantId}
                    className={`flex gap-3 ${hm ? "rounded-xl p-3" : "py-3 border-b"}`}
                    style={hm ? { background: "var(--color-orange-tint)" } : { borderColor: "var(--color-border)" }}
                  >
                    {/* Image (the title beside it is the link) */}
                    <div
                      className="relative shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden"
                      style={{ background: "var(--color-paper)" }}
                    >
                      {item.imageUrl && (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="72px" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={href}
                        onClick={closeCart}
                        className="block text-[14px] font-semibold leading-snug line-clamp-2 hover:underline"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-[14px]" style={{ color: "var(--color-ink-soft)" }}>
                        {item.price}
                      </p>

                      {/* Qty controls */}
                      <div className="mt-2 flex items-center gap-3">
                        <div
                          className="inline-flex items-center rounded-lg"
                          style={{ border: "1px solid var(--color-border)", background: "var(--color-white)" }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQty(item.variantId, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-l-lg transition-colors hover:bg-[color:var(--color-paper)]"
                            style={{ color: "var(--color-ink)" }}
                            aria-label={`Decrease quantity of ${item.title}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-6 text-center text-[14px] font-semibold" style={{ color: "var(--color-ink)" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.variantId, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-r-lg transition-colors hover:bg-[color:var(--color-paper)]"
                            style={{ color: "var(--color-ink)" }}
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          className="min-h-9 text-[13px] font-semibold underline underline-offset-2 hover:text-[color:var(--color-ink)]"
                          style={{ color: "var(--color-ink-soft)" }}
                          aria-label={`Remove ${item.title}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <p className="text-[14px] font-semibold shrink-0" style={{ color: "var(--color-ink)" }}>
                      {money.format(item.priceAmount * item.quantity)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 px-5 py-5 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[14px] font-semibold" style={{ color: "var(--color-ink-soft)" }}>
                Subtotal
              </span>
              <span className="text-[18px] font-bold" style={{ color: "var(--color-ink)" }}>
                {subtotal}
              </span>
            </div>

            {CART_NUDGE && hasOneTimeItems && (
              <p className="text-[13px] leading-snug mb-3" style={{ color: "var(--color-ink-soft)" }}>
                {CART_NUDGE}
              </p>
            )}

            {/* d051 (t1076): intl pass-through pricing is deliberate; say it before
                checkout so a ~$39 USPS first-class rate never lands as a surprise. */}
            <p className="text-[13px] leading-snug mb-4" style={{ color: "var(--color-ink-soft)" }}>
              International orders ship at live USPS rates by weight, shown at checkout before you pay.
            </p>

            {hasLocalItems ? (
              <div>
                <button type="button" disabled className="cta-secondary w-full mb-2">
                  Checkout coming soon
                </button>
                <p className="text-[13px] text-center leading-snug" style={{ color: "var(--color-ink-soft)" }}>
                  Full checkout will be available when the store launches.
                </p>
              </div>
            ) : (
              <button type="button" onClick={handleCheckout} disabled={checkingOut} className="cta-primary w-full">
                {checkingOut ? "One moment..." : "Checkout"}
              </button>
            )}

            <Link
              href="/shop"
              onClick={closeCart}
              className="block mt-3 text-center text-[14px] font-semibold underline underline-offset-[3px] hover:text-[color:var(--color-ink)]"
              style={{ color: "var(--color-ink-soft)" }}
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
