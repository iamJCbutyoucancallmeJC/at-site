// POST /api/waitlist
// Forwards a Tokyo Tangerine Takeover waitlist signup to a Kajabi opt-in form.
//
// This is the pre-Klaviyo bridge (scope-tokyo-takeover-page-2026-06-01.md,
// Option 1, capture mechanism (a)). It mirrors /api/newsletter but targets a
// SEPARATE Kajabi form so the waitlist gets its own tags and doesn't pollute
// the general newsletter list. When Klaviyo lands (t573, Jun 15 - Jul 15) the
// Kajabi tags below migrate cleanly to a Klaviyo List + Custom Properties +
// Event, so we don't have to re-tag anyone.
//
// Tagging schema (designed to migrate cleanly to Klaviyo Lists + Custom
// Properties + Events so the migration isn't double-work). The surface is now a
// general "where will Amy be / join a future event" landing page at /events
// (reframed 2026-06-01 PM per JC), so the tags are broader than Tokyo-only:
//   Kajabi tag  events-waitlist               -> Klaviyo List name + signup_source property
//   Kajabi tag  signup-from-at-site-events     -> surface attribution
//   Kajabi tag  interest-future-events         -> composable "wants to know where Amy is" flag
//   Kajabi tag  interest-future-craft-tours    -> narrower "would join a trip" flag (Tokyo etc.)
//   (Klaviyo)   signup_campaign: hobonichi-jun-2026  -> promo-window slice (set later)
//
// We send the tags as Kajabi hidden form fields. A Kajabi opt-in form applies
// tags via its own automation config; we also pass them in the payload so the
// values are recoverable from logs / a tag-mapping automation. The semantic
// source of truth is signup_source (a Custom Property at migration), NOT list
// membership -- see the scope's "Tagging principle worth keeping".
//
// Env vars (set in Vercel Production env when the Kajabi form is created):
//   KAJABI_WAITLIST_FORM_URL = full submission endpoint
//     (e.g. https://amytangerine.kajabi.com/forms/<id>/submissions)
//   KAJABI_WAITLIST_FORM_FIELD = name attr of the email input on the Kajabi
//     form (defaults to Kajabi's "form_submission[email]")
//   KAJABI_WAITLIST_NAME_FIELD = name attr of the (optional) first-name input
//     (defaults to "form_submission[name]")
//
// Behavior when KAJABI_WAITLIST_FORM_URL is unset (deliberate fail-open):
//   Returns 200 with {queued: true} and logs the signup to the Vercel function
//   log. The form on /japan works for the PDF preview and during the Hobonichi
//   window even before the env var is set; emails are recoverable from logs and
//   reconciled into Kajabi/Klaviyo by hand. Better than 500ing during a traffic
//   spike. Same pattern as /api/newsletter.

import { NextResponse } from "next/server"

const KAJABI_FORM_URL = process.env.KAJABI_WAITLIST_FORM_URL
const KAJABI_EMAIL_FIELD = process.env.KAJABI_WAITLIST_FORM_FIELD ?? "form_submission[email]"
const KAJABI_NAME_FIELD = process.env.KAJABI_WAITLIST_NAME_FIELD ?? "form_submission[name]"

// Tags applied to every events-waitlist signup. Order/values are load-bearing
// for the Klaviyo migration -- do not edit without updating the scope doc.
const WAITLIST_TAGS = [
  "events-waitlist",
  "signup-from-at-site-events",
  "interest-future-events",
  "interest-future-craft-tours",
] as const

// The signup_source Custom Property is the semantic source of truth that
// survives the Klaviyo migration (see scope "Tagging principle worth keeping").
const SIGNUP_SOURCE = "events-waitlist"

// Minimal email validation -- defer hard validation to Kajabi.
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254
}

export async function POST(request: Request) {
  let email: string
  let name: string
  let source: string
  try {
    const body = (await request.json()) as { email?: string; name?: string; source?: string }
    email = (body.email ?? "").trim().toLowerCase()
    name = (body.name ?? "").trim().slice(0, 120)
    source = (body.source ?? "at-site:/events").slice(0, 64)
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 })
  }

  // Fail-open: if the Kajabi form URL isn't configured yet, log + return 200 so
  // the email is recoverable from Vercel function logs and the visitor sees the
  // success state. Include the tags in the log so manual reconciliation knows
  // which list/properties to apply.
  if (!KAJABI_FORM_URL) {
    console.log(
      `[waitlist] queued (KAJABI_WAITLIST_FORM_URL unset): email=${email} name=${name || "-"} source=${source} tags=${WAITLIST_TAGS.join(",")}`
    )
    return NextResponse.json({ ok: true, queued: true })
  }

  try {
    const formBody = new URLSearchParams({
      [KAJABI_EMAIL_FIELD]: email,
      // signup_source is the semantic source of truth that survives migration.
      "form_submission[signup_source]": SIGNUP_SOURCE,
      "form_submission[signup_surface]": source,
      "form_submission[source]": source,
    })
    if (name) {
      formBody.set(KAJABI_NAME_FIELD, name)
    }
    // Tags as repeated hidden fields; a Kajabi form configured to accept them
    // applies each as a profile tag. Ignored harmlessly if the form isn't set
    // up for custom fields -- the form-level automation still tags by form ID.
    for (const tag of WAITLIST_TAGS) {
      formBody.append("form_submission[tags][]", tag)
    }

    const res = await fetch(KAJABI_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
      redirect: "manual",
    })

    // Kajabi returns 200/201 on programmatic success, 302 on browser-style
    // success (redirect to a thank-you page). All are real signups.
    if (res.status === 200 || res.status === 201 || (res.status >= 300 && res.status < 400)) {
      return NextResponse.json({ ok: true })
    }

    console.error(`[waitlist] kajabi rejected: status=${res.status} email=${email}`)
    return NextResponse.json({ error: "Signup failed, please try again later" }, { status: 502 })
  } catch (err) {
    console.error(`[waitlist] kajabi fetch failed:`, err, `email=${email}`)
    // Fail-open: log + return success so we don't lose the email.
    return NextResponse.json({ ok: true, queued: true })
  }
}
