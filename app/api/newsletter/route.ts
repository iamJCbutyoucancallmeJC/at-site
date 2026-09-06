// POST /api/newsletter
// The homepage newsletter form (components/newsletter-form.tsx, sourcePage
// "homepage"; also the /v/events variant).
//
// 2026-09-06 (t1092): signups go to KLAVIYO, the system of record since the
// account, sending domain and paid tier went live 9/1. Before this the route
// forwarded to a Kajabi opt-in form, so homepage signups between the 8/26
// Kajabi export and 9/6 sit only in Kajabi (catch-up export noted in the
// capture runbook). The Kajabi POST below is kept ONLY as the fallback when
// Klaviyo is not configured, so the form never loses an address in any
// environment; it is dead code in production.
//
// Env: NEXT_PUBLIC_KLAVIYO_COMPANY_ID + KLAVIYO_NEWSLETTER_LIST_ID (Klaviyo);
// KAJABI_NEWSLETTER_FORM_URL / KAJABI_NEWSLETTER_FORM_FIELD (legacy fallback).
//
// Behavior when neither is configured: 200 {queued: true} + console log
// (deliberate fail-open; Vercel function logs preserve the email).

import { NextResponse } from "next/server"
import { klaviyoConfigured, klaviyoSubscribe } from "@/lib/klaviyo-subscribe"

const KAJABI_FORM_URL = process.env.KAJABI_NEWSLETTER_FORM_URL
const KAJABI_EMAIL_FIELD = process.env.KAJABI_NEWSLETTER_FORM_FIELD ?? "form_submission[email]"

// Minimal email validation -- defer hard validation to Kajabi.
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}

export async function POST(request: Request) {
  let email: string
  let source: string
  try {
    const body = await request.json() as { email?: string; source?: string }
    email = (body.email ?? "").trim().toLowerCase()
    source = (body.source ?? "unknown").slice(0, 64)
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 })
  }

  // Klaviyo is the system of record (t1092, 9/6).
  if (klaviyoConfigured()) {
    const result = await klaviyoSubscribe(email, source)
    if (!result.ok) {
      console.error("[newsletter] klaviyo upstream error", result.status, result.detail)
      return NextResponse.json({ error: "Signup didn't go through. Please try again." }, { status: 502 })
    }
    return NextResponse.json({ ok: true, subscribed: true })
  }

  // Legacy fallback (Kajabi opt-in form), only when Klaviyo is unconfigured.
  // Fail-open: if the Kajabi form URL isn't configured either, log + return 200.
  // Vercel function logs preserve the email so we can recover them.
  if (!KAJABI_FORM_URL) {
    console.log(`[newsletter] queued (KAJABI_NEWSLETTER_FORM_URL unset): email=${email} source=${source}`)
    return NextResponse.json({ ok: true, queued: true })
  }

  try {
    const formBody = new URLSearchParams({
      [KAJABI_EMAIL_FIELD]: email,
      // Kajabi form_submission tracks the source via hidden fields if the
      // form is configured to accept them. Safe to include; ignored if not.
      "form_submission[source]": source,
    })

    const res = await fetch(KAJABI_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Kajabi sometimes returns 302 redirects on success; tell fetch we'll
        // handle the redirect (a 302 is a happy-path signal from Kajabi).
      },
      body: formBody.toString(),
      redirect: "manual",
    })

    // Kajabi returns 200 OK on programmatic success, 302 on browser-style
    // success (redirect to thank-you page). Either is a real signup.
    if (res.status === 200 || res.status === 201 || (res.status >= 300 && res.status < 400)) {
      return NextResponse.json({ ok: true })
    }

    console.error(`[newsletter] kajabi rejected: status=${res.status} email=${email}`)
    return NextResponse.json({ error: "Signup failed, please try again later" }, { status: 502 })
  } catch (err) {
    console.error(`[newsletter] kajabi fetch failed:`, err, `email=${email}`)
    // Fail-open here too: log + return success so we don't lose the email
    // and the user doesn't see an error.
    return NextResponse.json({ ok: true, queued: true })
  }
}
