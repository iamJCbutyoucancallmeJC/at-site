'use client'

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import { trackEvent } from "@/lib/analytics"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent("error_view", {
      path: pathname ?? "(unknown)",
      digest: error.digest ?? "(none)",
    })
    if (process.env.NODE_ENV === "development") {
      console.error("[error.tsx]", error)
    }
  }, [error, pathname])

  return (
    <>
      <PageEngagementTracker page="error" />

      <section
        className="py-20 md:py-28 px-6 md:px-16 text-center"
        style={{ background: "var(--color-gray-light)" }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
          style={{ color: "var(--color-orange)" }}
        >
          Something went wrong
        </p>
        <h1
          className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight mb-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          We hit a snag.
        </h1>
        <p
          className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The page didn&rsquo;t load. Try again in a moment, or head back to the
          shop.
        </p>
      </section>

      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => reset()}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Try again
            </button>
            <TrackableLink
              href="/shop"
              event="nav_click"
              eventData={{ link_text: "Shop", source_page: "error" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Shop
            </TrackableLink>
            <TrackableLink
              href="/"
              event="nav_click"
              eventData={{ link_text: "Home", source_page: "error" }}
              className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Home
            </TrackableLink>
          </div>
        </div>
      </section>
    </>
  )
}
