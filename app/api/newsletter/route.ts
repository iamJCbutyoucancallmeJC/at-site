// POST /api/newsletter
// Forwards an email signup to a Kajabi opt-in form.
//
// The newsletter forms (components/newsletter-form.tsx +
// components/newsletter-form-warm.tsx) were decorative pre-launch -- submit
// handlers only fired the `newsletter_signup` analytics event but never read
// the input or POSTed anywhere. Heidi-era FNF would have silently lost emails;
// public launch would lose them at scale. This route closes the gap.
//
// Kajabi's REST API is gated behind Pro plan / $25/mo add-on. Amy is on Basic.
// But Kajabi opt-in forms have public submission endpoints on all plans, so
// we POST directly to the form-submission URL using application/x-www-form-
// urlencoded (Kajabi's form-engine format). See kajabi-api-reference.md and
// daily-note Wed PM Capture for context.
//
// Env vars (set in Vercel Production env):
//   KAJABI_NEWSLETTER_FORM_URL = full submission endpoint
//     (e.g. https://amytangerine.kajabi.com/forms/<id>/submissions)
//   KAJABI_NEWSLETTER_FORM_FIELD = name attribute of the email input on the
//     Kajabi form (defaults to "form_submission[email]" which is the Kajabi
//     default; some form configurations use "email" instead)
//
// Behavior when env is unset:
//   Returns 200 with `{queued: true}` and logs the submission to console.
//   This is a deliberate fail-open: if the env var isn't set Friday but
//   public traffic submits, we don't lose the email, we just queue it for
//   manual reconciliation from Vercel function logs. Better than 500ing.

import { NextResponse } from "next/server"

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

  // Fail-open: if Kajabi form URL isn't configured yet, log + return 200.
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
