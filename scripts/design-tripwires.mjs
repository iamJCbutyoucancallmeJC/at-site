#!/usr/bin/env node
// Design tripwires (design finish, Phase 5, 2026-11-20). The rules the Phase 0
// safety net used to paper over, now checked in the source instead of patched in
// the browser. Run before a push (`node scripts/design-tripwires.mjs`) and daily by
// the vault's site-qa.py (`--json`), which alerts on any hit that is new.
//
//   1. text-size   no arbitrary text-[...] beyond the baseline. ~690 sizes predate
//                  the type scale; the count per file may fall, never rise, and no
//                  file without one may gain one. Anything under 11px fails outright.
//                  Arbitrary text COLORS fail everywhere: use text-ink / text-ink-soft.
//   2. hex         no hex color outside app/globals.css, except the allowlisted art
//                  (photobooth, doodles, the IHM stamp, the vendored changelog CSS,
//                  the web manifest, which cannot read a CSS variable).
//   3. contrast    the money buttons, measured from the @theme values: .cta-primary
//                  and its hover, .cta-teal and its hover, .cta-secondary, and the
//                  outline variant, every one at 4.5:1 or better.
//   4. white-fill  no white text inside an orange or teal fill (white on orange is
//                  2.4:1). Exceptions are listed in the baseline with the reason.
//
// Exit 0 clean, 1 on any hit. `--write-baseline` re-records the text-size counts
// (only ever after a sweep that LOWERED them; review the diff).

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const BASELINE_FILE = path.join(ROOT, "scripts", "design-tripwires-baseline.json")
const DIRS = ["app", "components", "lib", "context", "hooks"]
const EXT = new Set([".tsx", ".ts", ".css", ".mjs", ".js"])
const HEX_ALLOW = [
  "app/globals.css",
  "app/photobooth/",
  "app/manifest.ts",
  "components/doodles.tsx",
  "components/changelog/changelog.css",
  "app/happy-mail-international/ihm-stamp.tsx",
]

const args = new Set(process.argv.slice(2))
const asJson = args.has("--json")

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (EXT.has(path.extname(e.name))) out.push(p)
  }
  return out
}
const files = DIRS.flatMap((d) => walk(path.join(ROOT, d))).map((p) => ({
  rel: path.relative(ROOT, p).split(path.sep).join("/"),
  text: fs.readFileSync(p, "utf8"),
}))
const baseline = fs.existsSync(BASELINE_FILE)
  ? JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"))
  : { textSize: {}, whiteFillAllow: [] }
const hits = []

// 1. text-size ratchet
const SIZE_RE = /text-\[(\d+(?:\.\d+)?)(px|rem)\]/g
const COLOR_RE = /text-\[(?!\d)[^\]]+\]/g
const counts = {}
for (const f of files) {
  if (!f.rel.endsWith(".tsx") && !f.rel.endsWith(".ts")) continue
  let n = 0
  for (const m of f.text.matchAll(SIZE_RE)) {
    n++
    const px = m[2] === "rem" ? parseFloat(m[1]) * 16 : parseFloat(m[1])
    if (px < 11) hits.push({ rule: "text-size", file: f.rel, detail: `${m[0]} is under the 11px badge floor` })
  }
  for (const m of f.text.matchAll(COLOR_RE)) {
    hits.push({ rule: "text-size", file: f.rel, detail: `${m[0]}: an arbitrary text color; use text-ink or text-ink-soft` })
  }
  if (n) counts[f.rel] = n
}
if (args.has("--write-baseline")) {
  baseline.textSize = Object.fromEntries(Object.entries(counts).sort())
  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2) + "\n")
  console.log(`baseline written: ${Object.values(counts).reduce((a, b) => a + b, 0)} arbitrary sizes in ${Object.keys(counts).length} files`)
  process.exit(0)
}
for (const [rel, n] of Object.entries(counts)) {
  const allowed = baseline.textSize[rel] ?? 0
  if (n > allowed) hits.push({ rule: "text-size", file: rel, detail: `${n} arbitrary text-[...] sizes, baseline ${allowed}: map new sizes to the type scale` })
}

// 2. hex outside globals.css
const HEX_RE = /(?<![\w&/])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g
for (const f of files) {
  if (HEX_ALLOW.some((a) => f.rel === a || (a.endsWith("/") && f.rel.startsWith(a)))) continue
  f.text.split("\n").forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
    for (const m of line.matchAll(HEX_RE)) {
      hits.push({ rule: "hex", file: `${f.rel}:${i + 1}`, detail: `${m[0]}: use a token from app/globals.css` })
    }
  })
}

// 3. contrast on the money buttons
const css = files.find((f) => f.rel === "app/globals.css")?.text ?? ""
const theme = {}
for (const m of css.matchAll(/--color-([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) theme[m[1]] = m[2]
function rule(selector) {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`(?:^|\\n|,)\\s*${esc}\\s*(?:,[^{]*)?\\{([^}]*)\\}`, "g")
  const decl = {}
  for (const m of css.matchAll(re)) {
    for (const d of m[1].matchAll(/(background|color):\s*var\(--color-([\w-]+)\)/g)) decl[d[1]] = d[2]
    for (const d of m[1].matchAll(/(background):\s*transparent/g)) decl[d[1]] = "white"
  }
  return decl
}
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const BUTTONS = [
  [".cta-primary", null],
  [".cta-primary:hover:not(:disabled)", ".cta-primary"],
  [".cta-teal", null],
  [".cta-teal:hover:not(:disabled)", ".cta-teal"],
  [".cta-secondary", null],
  [".cta-primary--outline", ".cta-primary"],
]
const contrast = []
for (const [sel, inherit] of BUTTONS) {
  const d = { ...(inherit ? rule(inherit) : {}), ...rule(sel) }
  const fg = theme[d.color]
  const bg = theme[d.background ?? "white"]
  if (!fg || !bg) {
    hits.push({ rule: "contrast", file: "app/globals.css", detail: `${sel}: could not read its color and background from the @theme tokens` })
    continue
  }
  const r = Math.round(ratio(fg, bg) * 10) / 10
  contrast.push({ selector: sel, color: d.color, background: d.background ?? "white", ratio: r })
  if (r < 4.5) hits.push({ rule: "contrast", file: "app/globals.css", detail: `${sel}: ${d.color} on ${d.background ?? "white"} is ${r}:1, under 4.5:1` })
}

// 4. white text inside an orange or teal fill
const FILL_RE = /(background(Color)?:\s*"var\(--color-(orange|teal)(-dark)?\)"|bg-\[var\(--color-(orange|teal)(-dark)?\)\]|\bbg-(orange|teal)(-dark)?\b)/
const WHITE_RE = /\btext-white\b|cta-secondary--light|color:\s*"(white|#fff(fff)?|var\(--color-white\))"/i
const indent = (l) => l.length - l.trimStart().length
for (const f of files) {
  if (!f.rel.endsWith(".tsx")) continue
  const L = f.text.split("\n")
  L.forEach((line, i) => {
    if (!FILL_RE.test(line)) return
    let j = i
    while (j > 0 && !/^\s*<[A-Za-z]/.test(L[j])) j--
    const n = indent(L[j])
    let end = i
    // A tag that closes itself on the fill line (<div ... />) holds no text.
    if (/\/>\s*$/.test(L[i]) && !/>\s*[^/\s]/.test(L[i].slice(L[i].indexOf("<")))) return
    for (let k = j + 1; k < Math.min(L.length, j + 400); k++) {
      if (indent(L[k]) === n && L[k].trim().startsWith("</")) { end = k; break }
      if (indent(L[k]) <= n && /\/>\s*$/.test(L[k])) { end = k; break }
    }
    for (let m = j; m <= end; m++) {
      if (!WHITE_RE.test(L[m])) continue
      const ok = (baseline.whiteFillAllow || []).some((a) => a.file === f.rel && L[m].includes(a.match))
      if (!ok) hits.push({ rule: "white-fill", file: `${f.rel}:${m + 1}`, detail: "white text inside an orange or teal fill; letter it in ink" })
    }
  })
}

const seen = new Set()
const unique = hits.filter((h) => { const k = `${h.rule}|${h.file}|${h.detail}`; if (seen.has(k)) return false; seen.add(k); return true })
const totalSizes = Object.values(counts).reduce((a, b) => a + b, 0)
if (asJson) {
  console.log(JSON.stringify({ ok: unique.length === 0, hits: unique, contrast, textSizes: totalSizes }, null, 1))
} else {
  for (const c of contrast) console.log(`contrast ${c.selector}: ${c.color} on ${c.background} ${c.ratio}:1`)
  console.log(`text-size: ${totalSizes} arbitrary sizes (baseline ${Object.values(baseline.textSize).reduce((a, b) => a + b, 0)})`)
  for (const h of unique) console.log(`FAIL ${h.rule} ${h.file}: ${h.detail}`)
  console.log(unique.length ? `${unique.length} tripwire hit(s)` : "design tripwires clean")
}
process.exit(unique.length ? 1 : 0)
