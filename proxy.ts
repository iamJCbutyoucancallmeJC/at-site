import { NextRequest, NextResponse } from "next/server"

/**
 * Password gate for /preview/* ONLY.
 *
 * The /preview/shop route reads DRAFT (unpublished) products via the Admin API so
 * they can be reviewed before going live. This proxy keeps that route private:
 * a visitor must enter PREVIEW_PASSWORD once, then gets a signed session cookie.
 *
 * Scope is strictly /preview/* (see `matcher`) -- the public site is never gated.
 *
 * Pattern: vercel/examples basic-auth, hardened with a signed cookie so the
 * reviewer enters the password once (not every request). Runs at the Edge, so an
 * unauthenticated request is bounced before the preview route (and its Admin fetch)
 * ever executes.
 */

const COOKIE = "at_preview_auth"
const SECRET = process.env.PREVIEW_SECRET ?? ""
const PASSWORD = process.env.PREVIEW_PASSWORD ?? ""

// --- Web Crypto HMAC (Edge runtime has no Node 'crypto') ---
async function sign(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  return Buffer.from(new Uint8Array(sig)).toString("base64url")
}

// The cookie value is a signed constant -- proves the holder knew the password,
// without storing the password itself.
async function expectedCookie(): Promise<string> {
  return sign("preview-ok")
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function promptResponse(message?: string): NextResponse {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Amy Tangerine — Preview</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#faf8f5;color:#222}
      .card{width:320px;padding:32px;border:1px solid #e7e2da;border-radius:12px;background:#fff;text-align:center}
      h1{font-size:18px;margin:0 0 4px}p{font-size:13px;color:#666;margin:0 0 20px}
      input{width:100%;box-sizing:border-box;padding:10px;font-size:14px;border:1px solid #ddd;border-radius:8px;margin-bottom:12px}
      button{width:100%;padding:10px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;color:#fff;background:#e8743b;border:0;border-radius:999px;cursor:pointer}
      .err{color:#c0392b;font-size:12px;margin-bottom:10px}
    </style></head><body>
    <form class="card" method="POST" action="">
      <h1>Preview</h1><p>Enter the preview password to continue.</p>
      ${message ? `<div class="err">${message}</div>` : ""}
      <input type="password" name="password" placeholder="Password" autofocus />
      <button type="submit">Enter</button>
    </form></body></html>`
  return new NextResponse(html, { status: 401, headers: { "Content-Type": "text/html" } })
}

export async function proxy(req: NextRequest) {
  // Fail closed: if the gate isn't configured, do not expose the preview.
  if (!SECRET || !PASSWORD) {
    return new NextResponse("Preview is not configured.", { status: 503 })
  }

  // Handle the password form submission.
  if (req.method === "POST") {
    const form = await req.formData()
    const submitted = String(form.get("password") ?? "")
    if (timingSafeEqual(submitted, PASSWORD)) {
      // 303 See Other: the browser MUST switch to GET for the follow-up request.
      // A default redirect is 307 (preserves the method), which would re-POST to
      // this same path and loop forever.
      const res = NextResponse.redirect(new URL(req.nextUrl.pathname + req.nextUrl.search, req.url), 303)
      res.cookies.set(COOKIE, await expectedCookie(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/preview",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return res
    }
    return promptResponse("Incorrect password.")
  }

  // Check the signed cookie.
  const cookie = req.cookies.get(COOKIE)?.value
  if (cookie && timingSafeEqual(cookie, await expectedCookie())) {
    return NextResponse.next()
  }
  return promptResponse()
}

export const config = {
  matcher: ["/preview/:path*"],
}
