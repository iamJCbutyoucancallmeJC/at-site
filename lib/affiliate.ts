/**
 * Affiliate shop data layer (t815)
 * Spec: affiliate-shop-prd-2026-06-20.md
 *
 * Reads the two app-namespaced metaobjects that back /shop-my-faves:
 *   - app--345947701249--affiliate_pick        ("Affiliate Pick")
 *   - app--345947701249--affiliate_pick_list   ("Affiliate Pick List")
 *
 * This is CONTENT, not products -- these items never touch the catalog, cart, or
 * MarketCatalog. Each card links OUT to Amazon under Amy's Associates tag, which
 * is appended here at render (config-driven, never hand-pasted into URLs).
 *
 * No pricing is read or shown: Amazon prohibits cached/scraped prices, so the
 * card is product + Amy's note + outbound link, full stop.
 *
 * READ PATH -- via the ADMIN API (lib/shopify-admin adminFetch), SERVER-ONLY.
 *   The metaobject definitions are storefront PUBLIC_READ, BUT the Storefront API
 *   token additionally needs the `unauthenticated_read_metaobjects` access scope,
 *   which this app does not currently hold (verified 2026-06-24). Rather than
 *   gate the build on an app re-install, we read these server-side with the Admin
 *   token (same pattern as lib/shopify-admin.ts reads draft products for the
 *   preview shop). The /shop-my-faves page is a server component, so the Admin
 *   token never reaches the browser. If `unauthenticated_read_metaobjects` is
 *   added later, this can switch to a public Storefront read with no UI change.
 */

import "server-only"
import { adminFetch } from "@/lib/shopify-admin"

// App-namespaced metaobject types (see scripts/define-affiliate-metaobjects.mjs).
const LIST_TYPE = "app--345947701249--affiliate_pick_list"

// Amy's Amazon Associates tracking tag. d055 (2026-06-23): v1 uses a SITE-SPECIFIC
// sub-tag (not the storefront Influencer tag) for clean on-site attribution.
// Lives here so the tag is changed in ONE place; it is appended to every outbound
// URL at render, never stored on the metaobject. Overridable via env for staging.
// NOTE: the concrete tag value is pending Amy's confirmation (t816 CDQ #2); until
// then this default keeps links well-formed and clearly attributable to the site.
export const AMAZON_ASSOCIATES_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATES_TAG || "amytangsite-20"

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type AffiliatePick = {
  id: string
  title: string
  note: string | null
  /** Raw Amazon URL as authored (no tag). Use `amazonUrl(pick)` for the tagged href. */
  amazonUrl: string | null
  /** Resolved image src (uploaded file URL, else hosted image_url), or null. */
  imageUrl: string | null
  imageAlt: string
  featured: boolean
  active: boolean
}

export type AffiliatePickList = {
  id: string
  title: string
  description: string | null
  /** URL-safe anchor for deep-linking. Falls back to a slugified title. */
  slug: string
  sortOrder: number | null
  featured: boolean
  active: boolean
  picks: AffiliatePick[]
}

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------

// A Pick's fields + its image reference (file_reference -> MediaImage.image.url).
const PICK_FIELDS = `
  id
  fields {
    key
    value
    reference {
      ... on MediaImage { image { url altText } }
    }
  }
`

const LISTS_QUERY = `
  query AffiliatePickLists($listType: String!, $first: Int!) {
    metaobjects(type: $listType, first: $first) {
      nodes {
        id
        fields {
          key
          value
          references(first: 100) {
            nodes {
              ... on Metaobject { ${PICK_FIELDS} }
            }
          }
        }
      }
    }
  }
`

// ---------------------------------------------------------------------------
// Field-extraction helpers (metaobject fields are an untyped key/value list)
// ---------------------------------------------------------------------------

type RawField = {
  key: string
  value: string | null
  reference?: { image?: { url: string; altText: string | null } | null } | null
  references?: { nodes: RawPick[] } | null
}
type RawPick = { id: string; fields: RawField[] }

function fieldMap(fields: RawField[]): Map<string, RawField> {
  return new Map(fields.map((f) => [f.key, f]))
}

function bool(f?: RawField): boolean {
  return f?.value === "true"
}

// active defaults to TRUE when the field was never set, so a freshly-authored
// entry shows without the author having to remember to tick the box. Authors
// hide an entry by explicitly setting active=false.
function activeFlag(f?: RawField): boolean {
  return f?.value !== "false"
}

function text(f?: RawField): string | null {
  const v = f?.value?.trim()
  return v ? v : null
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function mapPick(raw: RawPick): AffiliatePick {
  const m = fieldMap(raw.fields)
  const title = text(m.get("title")) ?? "Untitled"
  // Image: prefer the uploaded file_reference; fall back to a hosted image_url.
  const uploaded = m.get("image")?.reference?.image
  const imageUrl = uploaded?.url ?? text(m.get("image_url"))
  return {
    id: raw.id,
    title,
    note: text(m.get("note")),
    amazonUrl: text(m.get("amazon_url")),
    imageUrl: imageUrl ?? null,
    imageAlt: uploaded?.altText ?? title,
    featured: bool(m.get("featured")),
    active: activeFlag(m.get("active")),
  }
}

type RawList = {
  id: string
  fields: RawField[]
}

function mapList(raw: RawList): AffiliatePickList {
  const m = fieldMap(raw.fields)
  const title = text(m.get("title")) ?? "Untitled list"
  const picksField = m.get("picks")
  const picks = (picksField?.references?.nodes ?? [])
    .map(mapPick)
    // Only active picks with a usable Amazon link render.
    .filter((p) => p.active && p.amazonUrl)
  const sortRaw = text(m.get("sort_order"))
  return {
    id: raw.id,
    title,
    description: text(m.get("description")),
    slug: text(m.get("slug")) ?? slugify(title),
    sortOrder: sortRaw != null ? Number(sortRaw) : null,
    featured: bool(m.get("featured")),
    active: activeFlag(m.get("active")),
    picks,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * All active Pick Lists, each with its active (linked) picks, ready to render.
 * Lists with no renderable picks are dropped. Sort: explicit sort_order first
 * (ascending), then alphabetical by title.
 */
export async function getAffiliatePickLists(): Promise<AffiliatePickList[]> {
  const data = await adminFetch<{ metaobjects: { nodes: RawList[] } }>(LISTS_QUERY, {
    listType: LIST_TYPE,
    first: 50,
  })
  const lists = data.metaobjects.nodes
    .map(mapList)
    .filter((l) => l.active && l.picks.length > 0)

  lists.sort((a, b) => {
    const ao = a.sortOrder ?? Number.POSITIVE_INFINITY
    const bo = b.sortOrder ?? Number.POSITIVE_INFINITY
    if (ao !== bo) return ao - bo
    return a.title.localeCompare(b.title)
  })
  return lists
}

/**
 * Build the outbound Amazon href for a pick: the raw product URL with Amy's
 * Associates `tag` parameter appended (replacing any existing tag). Centralizing
 * this keeps the tag in one config spot. Returns "" if the pick has no URL.
 */
export function amazonHref(pick: AffiliatePick): string {
  if (!pick.amazonUrl) return ""
  try {
    const u = new URL(pick.amazonUrl)
    u.searchParams.set("tag", AMAZON_ASSOCIATES_TAG)
    return u.toString()
  } catch {
    // Not a parseable absolute URL -- append the tag defensively.
    const sep = pick.amazonUrl.includes("?") ? "&" : "?"
    return `${pick.amazonUrl}${sep}tag=${encodeURIComponent(AMAZON_ASSOCIATES_TAG)}`
  }
}
