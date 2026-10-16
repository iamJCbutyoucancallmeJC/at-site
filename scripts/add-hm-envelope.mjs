#!/usr/bin/env node
// Add one month's Happy Mail flat-lay to the /happy-mail "Recent envelopes" strip (#inside).
//
//   node scripts/add-hm-envelope.mjs <photo> "October 2026" ["optional caption"]
//
// Auto-orients, resizes to 1600px on the long edge, strips EXIF/GPS (phone photos carry the
// studio's location), writes public/images/happy-mail/envelopes/<yyyy-mm>.jpg, and puts the
// entry at the top of HM_RECENT_ENVELOPES in lib/happy-mail-content.ts. Re-running for the
// same month replaces that month's photo and entry. Needs ImageMagick (`magick`). [t1450]

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")

const [src, month, caption] = process.argv.slice(2)
const m = month?.match(/^([A-Z][a-z]+) (\d{4})$/)
if (!src || !m || !MONTHS.includes(m[1])) {
  console.error('usage: node scripts/add-hm-envelope.mjs <photo> "October 2026" ["caption"]')
  process.exit(1)
}
if (!existsSync(src)) {
  console.error(`no such file: ${src}`)
  process.exit(1)
}

const slug = `${m[2]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0")}`
const outDir = join(root, "public/images/happy-mail/envelopes")
mkdirSync(outDir, { recursive: true })
const out = join(outDir, `${slug}.jpg`)
execFileSync("magick", [src, "-auto-orient", "-resize", "1600x1600>", "-strip", "-quality", "85", out])
const left = execFileSync("magick", ["identify", "-format", "%[EXIF:*]", out]).toString().trim()
if (left) {
  console.error(`EXIF survived the strip in ${out}; not adding it`)
  process.exit(1)
}

const file = join(root, "lib/happy-mail-content.ts")
const text = readFileSync(file, "utf8")
const re = /export const HM_RECENT_ENVELOPES: HmEnvelope\[\] = \[([\s\S]*?)\]\n/
const cur = text.match(re)
if (!cur) {
  console.error("HM_RECENT_ENVELOPES not found in lib/happy-mail-content.ts")
  process.exit(1)
}
const kept = cur[1].split("\n").filter((l) => l.trim() && !l.includes(`month: "${month}"`))
const entry = `  { month: ${JSON.stringify(month)}, img: "/images/happy-mail/envelopes/${slug}.jpg"${caption ? `, caption: ${JSON.stringify(caption)}` : ""} },`
writeFileSync(file, text.replace(re, `export const HM_RECENT_ENVELOPES: HmEnvelope[] = [\n${[entry, ...kept].join("\n")}\n]\n`))

console.log(`wrote ${out}`)
console.log(`HM_RECENT_ENVELOPES now has ${kept.length + 1} entr${kept.length ? "ies" : "y"}`)
