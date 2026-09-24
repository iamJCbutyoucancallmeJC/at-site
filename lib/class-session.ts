// Read the class cookie for the current request and verify it (server-only).
// Pages call this; a null answer means "show the locked view".

import "server-only"
import { cookies } from "next/headers"
import { classCookieName, verifyClassToken, type ClassClaim } from "@/lib/class-access"

export async function getClassClaim(slug: string): Promise<ClassClaim | null> {
  const jar = await cookies()
  const token = jar.get(classCookieName(slug))?.value
  return verifyClassToken(token, slug)
}
