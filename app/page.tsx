// Homepage -- REWRITE per wireframes/homepage-mobile.html + homepage-desktop.html
// Copy: happy-mail-landing-copy.md (hero, HM banner, category grid, product scroll)
// TODO Phase 2: wire getAllProducts() from lib/shopify.ts

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-cream)" }}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            Amy Tangerine
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Craft supplies, stickers & die cuts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/shop"
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "var(--color-coral)" }}
            >
              Shop
            </a>
            <a
              href="/happy-mail"
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "var(--color-tangerine)" }}
            >
              Happy Mail
            </a>
          </div>
          <p className="text-xs mt-8" style={{ color: "var(--color-text-secondary)" }}>
            at-site scaffold — Phase 2 build
          </p>
        </div>
      </div>
    </main>
  )
}
