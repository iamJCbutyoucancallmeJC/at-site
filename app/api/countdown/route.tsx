import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { OPEN_AT, OPEN_LABEL, countdownParts, msUntilOpen } from "@/lib/shop-refresh"

// The countdown image in the shop-refresh email (t2113). Drawn fresh on every
// open: the mail client fetches it when the email is opened, so the numbers are
// right whenever someone reads it. After OPEN_AT it says the shop is open.
// Rendered at 2x (1120 wide) and shown at 560 in the email.

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const W = 1120
const H = 320
const INK = "#1F1A17"
const ORANGE_INK = "#B85300"
const PAPER = "#FFF7EE"

let fonts: { name: string; data: Buffer; weight: 500 | 700; style: "normal" }[] | null = null
async function loadFonts() {
  if (!fonts) {
    const dir = join(process.cwd(), "assets/fonts")
    const [w500, w700] = await Promise.all([readFile(join(dir, "epilogue-500.ttf")), readFile(join(dir, "epilogue-700.ttf"))])
    fonts = [
      { name: "Epilogue", data: w500, weight: 500, style: "normal" },
      { name: "Epilogue", data: w700, weight: 700, style: "normal" },
    ]
  }
  return fonts
}

function Unit({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 220 }}>
      <div style={{ fontSize: 120, fontWeight: 700, color: INK, lineHeight: 1 }}>{String(n).padStart(2, "0")}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: ORANGE_INK, letterSpacing: 4, marginTop: 14 }}>{label}</div>
    </div>
  )
}

export async function GET() {
  const ms = msUntilOpen()
  const open = ms <= 0
  const { days, hours, minutes } = countdownParts(ms)

  const body = open ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 700, color: ORANGE_INK, letterSpacing: 4 }}>SMALL BUSINESS SATURDAY</div>
      <div style={{ fontSize: 96, fontWeight: 700, color: INK, marginTop: 18 }}>The shop is open</div>
    </div>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 30, fontWeight: 500, color: INK, marginBottom: 30 }}>{`Opens ${OPEN_LABEL}`}</div>
      <div style={{ display: "flex" }}>
        <Unit n={days} label="DAYS" />
        <Unit n={hours} label="HOURS" />
        <Unit n={minutes} label="MINUTES" />
      </div>
    </div>
  )

  const img = new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PAPER,
          fontFamily: "Epilogue",
        }}
      >
        {body}
      </div>
    ),
    { width: W, height: H, fonts: await loadFonts() },
  )
  // Mail clients and their image proxies (Gmail's included) must fetch it fresh each open.
  img.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
  img.headers.set("Expires", "0")
  img.headers.set("X-Open-At", OPEN_AT)
  return img
}
