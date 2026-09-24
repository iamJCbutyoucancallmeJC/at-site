// GET /classes/[slug]/files/[file] : a class printable, behind the same
// cookie as the pages. Files live in content/classes/<slug>/files/ (NOT
// /public, which is served to anyone), and only a file some day of the class
// names is ever read (lib/class-content isClassFile), so a path can't reach
// anything else. The day that names the file must be open by date too.
//
// next.config.mjs lists content/classes/** in outputFileTracingIncludes so the
// files ship with the serverless function.

import { NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import path from "node:path"
import { getClass, isDayOpen } from "@/lib/classes"
import { getClassClaim } from "@/lib/class-session"
import { getClassDays } from "@/lib/class-content"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string; file: string }> }) {
  const { slug, file } = await ctx.params
  const c = getClass(slug)
  if (!c) return new NextResponse("Not found", { status: 404 })
  const claim = await getClassClaim(slug)
  if (!claim) return new NextResponse("Locked", { status: 403 })

  // Allow-list: the file must be named by an OPEN day of this class.
  const name = decodeURIComponent(file)
  const owner = getClassDays(slug).find((d) => d.files?.some((f) => f.name === name))
  if (!owner) return new NextResponse("Not found", { status: 404 })
  if (!isDayOpen(c, owner.day)) return new NextResponse("Not yet", { status: 403 })

  const ext = path.extname(name).toLowerCase()
  const type = TYPES[ext]
  if (!type) return new NextResponse("Not found", { status: 404 })

  const abs = path.join(process.cwd(), "content", "classes", slug, "files", path.basename(name))
  let bytes: Buffer
  try {
    bytes = await fs.readFile(abs)
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": type,
      "Content-Disposition": `inline; filename="${path.basename(name)}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
