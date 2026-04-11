"use client"

import { useState } from "react"
import Image from "next/image"
import type { ShopifyImage } from "@/lib/shopify"

interface Props {
  images: ShopifyImage[]
  productTitle: string
  handle: string
}

export default function ProductImageGallery({ images, productTitle }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div
        className="relative aspect-square rounded-xl overflow-hidden"
        style={{ background: "var(--color-gray-light)" }}
      />
    )
  }

  const activeImage = images[activeIndex]

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <Image
          src={activeImage.url}
          alt={activeImage.altText ?? productTitle}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200"
              style={{
                borderColor: i === activeIndex ? "var(--color-orange)" : "transparent",
              }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${productTitle} ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
