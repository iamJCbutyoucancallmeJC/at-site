"use client"

// Klaviyo-native forms -> site analytics (t1092). Klaviyo's onsite script
// (app/layout.tsx) renders the popup and dispatches a window "klaviyoForms"
// CustomEvent for its lifecycle; nothing on the site would otherwise know a
// popup signup happened. This bridge turns those into the same GA4 / Vercel
// events the inline blocks fire, so every capture surface reports as one:
//   submit -> newsletter_signup { source_page: "popup", form_id }
//   open   -> popup_open  { form_id }
//   close  -> popup_close { form_id }
// Klaviyo detail.type values: open, embedOpen, close, redirectedToUrl, submit,
// stepSubmit. Only the final submit counts as a signup (stepSubmit is a
// multi-step form's intermediate step). Renders nothing.

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type KlaviyoFormsDetail = {
  type?: string
  formId?: string
  companyId?: string
  metaData?: Record<string, unknown>
}

export default function KlaviyoFormsBridge() {
  useEffect(() => {
    function onForm(e: Event) {
      const d = ((e as CustomEvent).detail || {}) as KlaviyoFormsDetail
      const form_id = String(d.formId || "")
      if (d.type === "submit") {
        trackEvent("newsletter_signup", { source_page: "popup", form_id })
      } else if (d.type === "open" || d.type === "embedOpen") {
        trackEvent("popup_open", { form_id })
      } else if (d.type === "close") {
        trackEvent("popup_close", { form_id })
      }
    }
    window.addEventListener("klaviyoForms", onForm)
    return () => window.removeEventListener("klaviyoForms", onForm)
  }, [])
  return null
}
