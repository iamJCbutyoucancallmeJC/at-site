"use client"

import { useRouter } from "next/navigation"
import { SHOP_SORTS, shopHref, type ShopSortKey } from "@/lib/shop-sort"

// The /shop sort (design finish, Phase 2, 2026-11-10): a native select, because it
// works with a thumb and a screen reader without any of our code. Changing it
// navigates; without JavaScript the form submits the same query.

export default function ShopSort({
  sort,
  category,
  basePath,
}: {
  sort: ShopSortKey
  category: string
  basePath: string
}) {
  const router = useRouter()
  return (
    <form method="get" action={basePath} className="flex items-center gap-2 shrink-0">
      {category !== "all" && <input type="hidden" name="category" value={category} />}
      <label htmlFor="shop-sort" className="text-[14px] font-semibold" style={{ color: "var(--color-ink-soft)" }}>
        Sort
      </label>
      <select
        key={sort}
        id="shop-sort"
        name="sort"
        defaultValue={sort}
        onChange={(e) => router.push(shopHref(basePath, category, e.target.value as ShopSortKey))}
        className="h-10 rounded-lg pl-3 pr-8 text-[14px] font-semibold"
        style={{
          color: "var(--color-ink)",
          background: "var(--color-white)",
          border: "1px solid var(--color-border)",
        }}
      >
        {SHOP_SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="cta-secondary cta--compact">
          Go
        </button>
      </noscript>
    </form>
  )
}
