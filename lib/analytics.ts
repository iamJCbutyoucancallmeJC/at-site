// lib/analytics.ts
// Thin wrapper that fires to both Vercel Analytics and GA4.
// Import and call from any component or page.

export type AnalyticsEvent =
  | 'hero_cta_click'
  | 'category_click'
  | 'product_click'
  | 'product_view'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'newsletter_signup'
  | 'waitlist_signup'
  | 'back_in_stock_signup'
  | 'event_cta_click'
  | 'affiliate_click'
  | 'section_link_click'
  | 'hm_page_view'
  | 'hm_plan_select'
  | 'hm_subscribe_click'
  | 'scroll_depth'
  | 'time_on_page'
  | 'nav_click'
  | 'footer_click'
  | 'external_link'
  | 'affiliate_click'
  | 'variant_engagement'
  | 'purchase_complete'
  | 'thank_you_cta_click'
  | 'not_found_view'
  | 'error_view'
  // Photo booth (/photobooth, t897). The standalone subdomain had zero
  // measurement; these are the two moments worth counting.
  | 'photobooth_session_start'
  | 'photobooth_strip_save'
  // Class follow-up pages (/class/*, t1246): did the class open + save the photos?
  | 'class_photo_open'
  | 'class_photo_save'
  // Klaviyo-native popup (t1092): the site's own newsletter_signup fires on
  // submit via components/klaviyo-forms-bridge.tsx; these two frame it.
  | 'popup_open'
  | 'popup_close'
  // Event kit (t1101): the booth capture form on /events/<slug>/booth.
  | 'event_booth_signup'
  // Class sales page (t1102): the Join button on /glimmers and later classes.
  | 'class_join_click'

// GA4 standard ecommerce item (items[] on add_to_cart / begin_checkout / purchase).
export type GA4Item = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_variant?: string
}

// Scalar params plus the optional GA4 ecommerce items[] array.
type EventData = Record<string, string | number | boolean | GA4Item[]>

export function trackEvent(name: AnalyticsEvent, data?: EventData) {
  // Vercel Analytics custom events
  try {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', { name, ...data })
    }
  } catch {}

  // GA4 via gtag
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, data)
    }
  } catch {}

  // Dev logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics] ${name}`, data)
  }
}

// ── Ad pixels: Meta Pixel + Pinterest tag ─────────────────────────────────
// app/layout.tsx loads each snippet only when NEXT_PUBLIC_META_PIXEL_ID /
// NEXT_PUBLIC_PINTEREST_TAG_ID is set; with neither set, window.fbq and
// window.pintrk never exist and everything below is a no-op (same guard as gtag
// above). The snippets send the first PageView; components/ad-page-views.tsx
// sends one per client-side navigation.
//
// Purchase is NOT here: checkout runs on Shopify's hosted checkout, where this
// code never runs, so Purchase goes server-side from the orders/create webhook
// (lib/ad-conversions.ts) with the Shopify order id as its event_id. Every
// browser event still carries its own event_id so a later server twin dedupes.
// See docs/ad-tracking.md.

export type AdEvent = 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout'

export type AdEventData = {
  value?: number
  currency?: string
  content_name?: string
  items?: GA4Item[]
}

// Pinterest names. Its `checkout` IS the purchase conversion, so it must never
// fire at checkout handoff; InitiateCheckout goes as `custom` instead.
const PINTEREST_EVENT: Record<AdEvent, string | null> = {
  PageView: null, // pintrk('page')
  ViewContent: 'pagevisit',
  AddToCart: 'addtocart',
  InitiateCheckout: 'custom',
}

export function newAdEventId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}.${Math.random().toString(36).slice(2)}`
  }
}

// Shopify variant GIDs (gid://shopify/ProductVariant/123) -> "123", the id the
// server-side Purchase uses, so catalog matching sees one id per variant.
function adContentId(itemId: string): string {
  const m = itemId.match(/(\d+)$/)
  return m ? m[1] : itemId
}

// Returns the event_id it used.
export function trackAdEvent(name: AdEvent, data: AdEventData = {}): string {
  const eventId = newAdEventId()
  if (typeof window === 'undefined') return eventId
  const w = window as any
  const items = data.items ?? []
  const numItems = items.reduce((n, i) => n + i.quantity, 0)
  const hasValue = typeof data.value === 'number'
  const currency = data.currency ?? 'USD'

  try {
    if (w.fbq) {
      const params: Record<string, unknown> = {}
      if (data.content_name) params.content_name = data.content_name
      if (items.length) {
        params.content_type = 'product'
        params.content_ids = items.map((i) => adContentId(i.item_id))
        params.contents = items.map((i) => ({ id: adContentId(i.item_id), quantity: i.quantity, item_price: i.price }))
        params.num_items = numItems
      }
      if (hasValue) {
        params.value = data.value
        params.currency = currency
      }
      w.fbq('track', name, params, { eventID: eventId })
    }
  } catch {}

  try {
    if (w.pintrk) {
      const pin = PINTEREST_EVENT[name]
      if (!pin) {
        w.pintrk('page')
      } else {
        const params: Record<string, unknown> = { event_id: eventId }
        if (hasValue) {
          params.value = data.value
          params.currency = currency
        }
        if (items.length) {
          params.order_quantity = numItems
          params.line_items = items.map((i) => ({
            product_id: adContentId(i.item_id),
            product_name: i.item_name,
            product_price: i.price,
            product_quantity: i.quantity,
          }))
        }
        w.pintrk('track', pin, params)
      }
    }
  } catch {}

  if (process.env.NODE_ENV === 'development') {
    console.log(`[analytics:ads] ${name}`, { eventId, ...data })
  }
  return eventId
}

// The ad platforms' first-party click/browser ids, sent with each checkout
// handoff and stamped as `_fbp` / `_fbc` / `_epik` cart attributes so the
// server-side Purchase can match the ad click (lib/ad-conversions.ts).
export type AdClickIds = { fbp?: string; fbc?: string; epik?: string }

export function readAdClickIds(): AdClickIds {
  const out: AdClickIds = {}
  try {
    const pairs = [['_fbp', 'fbp'], ['_fbc', 'fbc'], ['_epik', 'epik']] as const
    for (const [cookie, key] of pairs) {
      const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookie}=([^;]+)`))
      if (m) out[key] = decodeURIComponent(m[1])
    }
  } catch {}
  return out
}
