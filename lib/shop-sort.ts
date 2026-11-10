// The /shop sort control's vocabulary (design finish, Phase 2, 2026-11-10). A plain
// module so the server grid and the client select share it without a cycle.

export type ShopSortKey = "featured" | "newest" | "price-asc" | "price-desc"

export const SHOP_SORTS: { value: ShopSortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

export function parseSort(value: string | undefined): ShopSortKey {
  return SHOP_SORTS.some((s) => s.value === value) ? (value as ShopSortKey) : "featured"
}

/** The /shop URL for a category and sort, omitting the defaults. */
export function shopHref(basePath: string, category: string, sort: ShopSortKey): string {
  const sp = new URLSearchParams()
  if (category !== "all") sp.set("category", category)
  if (sort !== "featured") sp.set("sort", sort)
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}
