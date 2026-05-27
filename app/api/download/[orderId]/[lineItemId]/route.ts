// GET /api/download/[orderId]/[lineItemId]?token=<hmac>&email=<email>
//
// Serves a printable PDF to the customer who purchased it.
//
// Flow:
//   1. Look up the order line item via Shopify Admin API
//   2. Verify the signed token (HMAC of orderId + lineItemId + email + pdfFileGid)
//   3. Confirm the order's email matches the requesting email
//   4. Fetch the PDF from Shopify Files CDN
//   5. Stream it back with Content-Disposition: attachment

import { NextResponse } from "next/server"
import { verifyDownloadToken } from "@/lib/download-token"
import { getDigitalLineItem } from "@/lib/shopify-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string; lineItemId: string }> },
) {
  const { orderId, lineItemId } = await params
  const url = new URL(request.url)
  const token = url.searchParams.get("token") ?? ""
  const email = (url.searchParams.get("email") ?? "").toLowerCase().trim()

  if (!token || !email) {
    return NextResponse.json({ error: "missing token or email" }, { status: 400 })
  }
  if (!/^\d+$/.test(orderId) || !/^\d+$/.test(lineItemId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 })
  }

  let lineItem
  try {
    lineItem = await getDigitalLineItem(orderId, lineItemId)
  } catch (e) {
    console.error("[download] admin lookup failed", e)
    return NextResponse.json({ error: "lookup failed" }, { status: 500 })
  }
  if (!lineItem) {
    return NextResponse.json({ error: "order or line item not found" }, { status: 404 })
  }
  if (!lineItem.pdfFileGid || !lineItem.pdfFileUrl) {
    return NextResponse.json({ error: "no pdf attached" }, { status: 404 })
  }

  const tokenOk = verifyDownloadToken(
    { orderId, lineItemId, email, pdfFileId: lineItem.pdfFileGid },
    token,
  )
  if (!tokenOk) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 })
  }
  if (lineItem.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "email mismatch" }, { status: 403 })
  }

  let pdfRes: Response
  try {
    pdfRes = await fetch(lineItem.pdfFileUrl, { cache: "no-store" })
  } catch (e) {
    console.error("[download] PDF fetch failed", e)
    return NextResponse.json({ error: "pdf fetch failed" }, { status: 502 })
  }
  if (!pdfRes.ok || !pdfRes.body) {
    return NextResponse.json({ error: "pdf unavailable" }, { status: 502 })
  }

  return new Response(pdfRes.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${lineItem.pdfFilename}"`,
      "Cache-Control": "private, no-store",
    },
  })
}
