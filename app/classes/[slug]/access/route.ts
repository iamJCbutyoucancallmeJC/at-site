// GET /classes/[slug]/access?k=<token>
//
// The magic link's landing. Verifies the token for this class, sets the class
// cookie, and 303s to the clean class URL so the token never sits in the
// address bar, browser history beyond this hop, or a Referer header. A bad or
// missing token lands on the class page's locked view (no cookie set), which
// tells the visitor how to get back in.

import { NextResponse } from "next/server"
import { getClass } from "@/lib/classes"
import { classCookieName, verifyClassToken } from "@/lib/class-access"

export const dynamic = "force-dynamic"

const ONE_YEAR = 60 * 60 * 24 * 365

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const url = new URL(request.url)
  const dest = new URL(`/classes/${slug}`, url.origin)
  if (!getClass(slug)) return NextResponse.redirect(new URL("/", url.origin), 303)

  const token = url.searchParams.get("k")
  const claim = await verifyClassToken(token, slug)
  if (!claim || !token) {
    dest.searchParams.set("locked", "1")
    return NextResponse.redirect(dest, 303)
  }

  const res = NextResponse.redirect(dest, 303)
  res.cookies.set({
    name: classCookieName(slug),
    value: token,
    httpOnly: true,
    secure: url.protocol === "https:",
    sameSite: "lax",
    path: `/classes/${slug}`,
    // Renewed on every visit through the link; the link itself never expires.
    maxAge: ONE_YEAR,
  })
  return res
}
