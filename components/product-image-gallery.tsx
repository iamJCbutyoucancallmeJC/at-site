"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import type { ShopifyImage } from "@/lib/shopify"
import { shopifyImageUrl, isShopifyCdn } from "@/lib/shopify-image-loader"

// The product page's gallery (design finish, Phase 2, 2026-11-10): a 4:5 photograph on
// paper at 12px, tap to zoom (a full-screen view, Escape or the X closes it), and
// thumbnails at 8px with the active one ringed in ink. Shopify images keep resizing on
// Shopify's CDN (unoptimized), as everywhere else on the site.

interface Props {
  images: ShopifyImage[]
  productTitle: string
  handle: string
}

export default function ProductImageGallery({ images, productTitle }: Props) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!zoom) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false)
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [zoom])

  if (images.length === 0) {
    return (
      <div
        className="relative aspect-[4/5] rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: "var(--color-paper)" }}
      >
        <span className="text-[14px] font-semibold" style={{ color: "var(--color-ink-soft)" }}>
          Photo coming soon
        </span>
      </div>
    )
  }

  const img = images[Math.min(active, images.length - 1)]
  const alt = img.altText ?? productTitle

  return (
    <div>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`Zoom in on the photo: ${alt}`}
        className="relative block w-full aspect-[4/5] rounded-xl overflow-hidden cursor-zoom-in"
        style={{ background: "var(--color-paper)" }}
      >
        <Image
          src={shopifyImageUrl(img.url, 1200)}
          unoptimized={isShopifyCdn(img.url)}
          alt={alt}
          fill
          priority={active === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {images.map((thumb, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors"
              style={{
                borderColor: i === active ? "var(--color-ink)" : "var(--color-border)",
                background: "var(--color-paper)",
              }}
            >
              <Image
                src={shopifyImageUrl(thumb.url, 128)}
                unoptimized={isShopifyCdn(thumb.url)}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle}, zoomed in`}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
          style={{ background: "rgba(31, 26, 23, 0.92)" }}
          onClick={() => setZoom(false)}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Close the zoomed photo"
            className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-white)", color: "var(--color-ink)" }}
          >
            <X size={20} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shopifyImageUrl(img.url, 2048)}
            alt={alt}
            className="max-h-full max-w-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
