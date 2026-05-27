// lib/download-token.ts
//
// HMAC-signed tokens for the /api/download/[orderId]/[lineItemId] route.
//
// Why we sign tokens instead of just relying on guess-resistance of order IDs:
// Shopify order IDs are sequential numerics (Order #1020 follows #1019). A
// curious customer could brute-force adjacent order numbers and try to
// download other people's PDFs. The HMAC signature locks each download URL
// to the exact (orderId, lineItemId, email, pdfFileId) tuple at issue-time.
//
// Threat model: prevents bypassing the order-ownership check. Does NOT
// prevent a legitimate buyer from sharing their PDF (same situation as
// every other digital-goods store; see digital-downloads-2day-plan-2026-05-28.md
// piracy section).

import { createHmac, timingSafeEqual } from "node:crypto"

const SECRET = process.env.DIGITAL_DOWNLOAD_SECRET

if (!SECRET && process.env.NODE_ENV === "production") {
  // Don't crash at import time in dev; do crash in prod so misconfigured
  // deploys don't silently issue unsignable links.
  throw new Error("DIGITAL_DOWNLOAD_SECRET must be set in production")
}

export type DownloadPayload = {
  orderId: string       // numeric (e.g. "7294176002368") or full GID
  lineItemId: string    // numeric
  email: string         // customer email at order time, lowercased
  pdfFileId: string     // Shopify GenericFile GID (resolves at serve time)
}

function canonical(p: DownloadPayload): string {
  // Stable, sorted, order-of-fields-doesn't-matter canonical form.
  return [
    `o=${p.orderId}`,
    `l=${p.lineItemId}`,
    `e=${p.email.toLowerCase().trim()}`,
    `f=${p.pdfFileId}`,
  ].join("&")
}

export function signDownloadToken(payload: DownloadPayload): string {
  const secret = SECRET
  if (!secret) throw new Error("DIGITAL_DOWNLOAD_SECRET not set")
  const mac = createHmac("sha256", secret).update(canonical(payload)).digest("hex")
  return mac
}

export function verifyDownloadToken(payload: DownloadPayload, token: string): boolean {
  const secret = SECRET
  if (!secret) return false
  const expected = createHmac("sha256", secret).update(canonical(payload)).digest()
  let provided: Buffer
  try {
    provided = Buffer.from(token, "hex")
  } catch {
    return false
  }
  if (provided.length !== expected.length) return false
  return timingSafeEqual(expected, provided)
}
