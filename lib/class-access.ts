// Class access tokens (t1102 auth spike, 2026-09-23).
//
// The site has no customer accounts. Access to a class is an ORDER-KEYED
// MAGIC LINK: when an order containing a class product is created, the
// orders-create webhook mints a token for (class slug, order number) and the
// buyer gets a permanent link. Visiting the link sets a cookie for that class;
// the pages check the cookie. No database: the token is an HMAC over its own
// payload, so verifying it is a signature check against CLASS_ACCESS_SECRET.
//
// Properties, on purpose:
//   - permanent: no expiry field. Lifetime access is the product promise
//     (classes-on-site-scope-2026-08-11.md, v1 item 2). Rotating the secret is
//     the only revocation and it revokes every link at once.
//   - one token per (class, order): the same order re-clicked yields the same
//     token, so a webhook retry does not mint a second link.
//   - the email address is NOT in the token. The link is the credential; a
//     forwarded link works for whoever holds it, same as Kajabi's magic links.
//
// Web Crypto only (no node:crypto) so the same code runs in a route handler,
// a server component or the proxy if that is ever needed.

import "server-only"

const SECRET = process.env.CLASS_ACCESS_SECRET ?? ""
const VERSION = "1"

export const CLASS_COOKIE_PREFIX = "at_class_"

export function classAccessConfigured(): boolean {
  return SECRET.length >= 16
}

function b64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url")
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))
  return b64url(new Uint8Array(sig))
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Token shape: <version>.<slug>.<orderRef>.<signature>
// orderRef is the order NAME without '#' (e.g. 1234), human-readable so support
// can read a link and find the order.
export async function mintClassToken(slug: string, orderRef: string): Promise<string> {
  if (!classAccessConfigured()) throw new Error("CLASS_ACCESS_SECRET missing")
  const clean = String(orderRef).replace(/^#/, "")
  const payload = `${VERSION}.${slug}.${clean}`
  const sig = await hmac(payload)
  return `${payload}.${sig}`
}

export type ClassClaim = { slug: string; orderRef: string }

// Returns the claim if the token verifies for THIS slug, else null.
export async function verifyClassToken(token: string | undefined | null, slug: string): Promise<ClassClaim | null> {
  if (!token || !classAccessConfigured()) return null
  const parts = token.split(".")
  if (parts.length !== 4) return null
  const [ver, tSlug, orderRef, sig] = parts
  if (ver !== VERSION || tSlug !== slug) return null
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(orderRef)) return null
  const expected = await hmac(`${ver}.${tSlug}.${orderRef}`)
  if (!timingSafeEqual(expected, sig)) return null
  return { slug, orderRef }
}

export function classCookieName(slug: string): string {
  return `${CLASS_COOKIE_PREFIX}${slug}`
}

// The permanent link a buyer receives. SITE_URL falls back to production.
export function classAccessUrl(slug: string, token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.amytangerine.com").replace(/\/$/, "")
  return `${base}/classes/${slug}/access?k=${encodeURIComponent(token)}`
}
