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
  | 'hm_page_view'
  | 'hm_plan_select'
  | 'hm_subscribe_click'
  | 'scroll_depth'
  | 'time_on_page'
  | 'nav_click'
  | 'footer_click'
  | 'external_link'
  | 'variant_engagement'
  | 'purchase_complete'
  | 'thank_you_cta_click'
  | 'not_found_view'
  | 'error_view'

type EventData = Record<string, string | number | boolean>

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
