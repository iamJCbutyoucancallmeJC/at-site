"use client"

// Photo gallery + lightbox for the /class/* follow-up pages (t1246).
//
// Grid of 3:4 tiles (2-up on phones, 3-up on desktop). Tapping a tile opens a
// full-bleed lightbox with the 1600px file, prev/next, and a Save button. The
// lightbox image is a bare <img> (not wrapped in a link) on purpose: on iPhone
// a press-and-hold on a bare image offers "Save to Photos", which is how most
// of the class will actually save these. The Save button (same-origin href +
// `download`) covers desktop and Android.
//
// Photos are local files under public/images/<stop>/, resized to 1600px on the
// long edge with EXIF stripped (no GPS, no device data) before commit. They
// render through the default next/image optimizer (local files, so NOT the
// Shopify-CDN `unoptimized` path in lib/shopify-image-loader.ts).
//
// Analytics: class_photo_open / class_photo_save carry the page + photo index
// so the weekly digest can see whether the class actually opened the photos.

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { trackEvent } from "@/lib/analytics"

export type GalleryPhoto = {
  src: string
  alt: string
  width: number
  height: number
}

export default function PhotoGallery({
  photos,
  page,
}: {
  photos: GalleryPhoto[]
  page: string
}) {
  const [open, setOpen] = useState<number | null>(null)

  const show = useCallback(
    (i: number) => {
      const idx = (i + photos.length) % photos.length
      setOpen(idx)
      trackEvent("class_photo_open", { page, photo: idx + 1 })
    },
    [page, photos.length],
  )

  const close = useCallback(() => setOpen(null), [])

  // Keyboard + scroll lock while the lightbox is up.
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      else if (e.key === "ArrowRight") show(open + 1)
      else if (e.key === "ArrowLeft") show(open - 1)
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, close, show])

  const current = open === null ? null : photos[open]

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => show(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="relative aspect-[3/4] rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2"
            style={{ background: "var(--color-gray-light)" }}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              className="object-cover transition-transform duration-300 hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 320px"
              loading={i < 6 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${open + 1} of ${photos.length}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
          onClick={close}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 text-[13px]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white/70">
              {open + 1} / {photos.length}
            </span>
            <div className="flex items-center gap-3">
              <a
                href={current.src}
                download
                onClick={() => trackEvent("class_photo_save", { page, photo: open + 1 })}
                className="px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-[0.1em]"
                style={{ background: "var(--color-orange)" }}
              >
                Save photo
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[20px] leading-none bg-white/10 hover:bg-white/20"
              >
                ×
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- bare <img> so press-and-hold saves on iOS */}
            <img
              src={current.src}
              alt={current.alt}
              className="max-h-full max-w-full object-contain rounded-lg select-none"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />

            {/* Prev / next */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                show(open - 1)
              }}
              aria-label="Previous photo"
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-[22px]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                show(open + 1)
              }}
              aria-label="Next photo"
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-[22px]"
            >
              ›
            </button>
          </div>

          <p className="pb-4 text-center text-[12px] text-white/50 px-6">
            On a phone, press and hold the photo to save it.
          </p>
        </div>
      )}
    </>
  )
}
