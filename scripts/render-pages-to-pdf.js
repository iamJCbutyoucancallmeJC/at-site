#!/usr/bin/env node
/*
 * render-pages-to-pdf.js
 *
 * Render one or more pages of the locally-running site to PDF using the
 * system Google Chrome in headless mode, then optionally merge into one file.
 *
 * Canonical command (from scope-tokyo-takeover-page-2026-06-01.md):
 *
 *   # with the dev server running on :3000
 *   node scripts/render-pages-to-pdf.js \
 *     --pages /events,/japan \
 *     --output ~/Desktop/at-site-tokyo-preview-2026-06-02.pdf \
 *     --combined
 *
 * Flags:
 *   --pages    Comma-separated site paths to render, in order. (required)
 *   --output   Output PDF path. With --combined this is the single file;
 *              without it, this is used as a basename and one PDF per page is
 *              written next to it (e.g. preview--events.pdf, preview--japan.pdf).
 *   --combined Merge all rendered pages into one PDF (page break between each).
 *   --base     Base URL of the running site. Default http://localhost:3000
 *   --width    Headless window width in px. Default 1280 (desktop layout).
 *   --wait     Extra ms to wait after load for fonts/images. Default 2500.
 *
 * No npm dependencies: drives the installed Chrome binary and shells out to
 * `pdfunite` (poppler) or `gs` (ghostscript) for the merge. Reusable for any
 * "render these site pages to a PDF for client approval" task.
 */

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

// ---- arg parsing --------------------------------------------------------
function parseArgs(argv) {
  const out = { combined: false, base: "http://localhost:3000", width: 1280, wait: 2500 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--combined") out.combined = true
    else if (a === "--pages") out.pages = argv[++i]
    else if (a === "--output") out.output = argv[++i]
    else if (a === "--base") out.base = argv[++i]
    else if (a === "--width") out.width = parseInt(argv[++i], 10)
    else if (a === "--wait") out.wait = parseInt(argv[++i], 10)
  }
  return out
}

function expandHome(p) {
  if (!p) return p
  return p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p
}

function findChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ]
  for (const c of candidates) if (fs.existsSync(c)) return c
  throw new Error("No Chrome/Chromium binary found. Install Google Chrome.")
}

function findMerger() {
  for (const tool of ["pdfunite", "gs"]) {
    try {
      execFileSync("which", [tool], { stdio: "pipe" })
      return tool
    } catch {
      /* keep looking */
    }
  }
  return null
}

function slugify(p) {
  return p.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home"
}

// ---- main ---------------------------------------------------------------
const args = parseArgs(process.argv.slice(2))
if (!args.pages || !args.output) {
  console.error("Usage: render-pages-to-pdf.js --pages /a,/b --output out.pdf [--combined] [--base URL] [--width N] [--wait MS]")
  process.exit(1)
}

const chrome = findChrome()
const output = expandHome(args.output)
const pages = args.pages.split(",").map((s) => s.trim()).filter(Boolean)
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "at-pdf-"))

console.log(`[render] chrome:  ${chrome}`)
console.log(`[render] base:    ${args.base}`)
console.log(`[render] pages:   ${pages.join(", ")}`)
console.log(`[render] width:   ${args.width}px, wait ${args.wait}ms`)

const partFiles = []
for (let i = 0; i < pages.length; i++) {
  const page = pages[i]
  const url = `${args.base}${page.startsWith("/") ? page : "/" + page}`
  const part = path.join(tmpDir, `part-${String(i).padStart(2, "0")}-${slugify(page)}.pdf`)
  console.log(`[render] -> ${url}`)
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      "--print-to-pdf-no-header",
      `--virtual-time-budget=${args.wait + 4000}`,
      `--window-size=${args.width},2000`,
      `--print-to-pdf=${part}`,
      url,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  )
  if (!fs.existsSync(part) || fs.statSync(part).size === 0) {
    throw new Error(`Chrome produced no PDF for ${url} — is the dev server running on ${args.base}?`)
  }
  partFiles.push(part)
}

fs.mkdirSync(path.dirname(output), { recursive: true })

if (args.combined && partFiles.length > 1) {
  const merger = findMerger()
  if (!merger) throw new Error("No PDF merge tool found (need `pdfunite` or `gs`). brew install poppler")
  if (merger === "pdfunite") {
    execFileSync("pdfunite", [...partFiles, output], { stdio: "inherit" })
  } else {
    execFileSync(
      "gs",
      ["-q", "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite", `-sOutputFile=${output}`, ...partFiles],
      { stdio: "inherit" }
    )
  }
  console.log(`[render] combined -> ${output} (via ${merger})`)
} else if (args.combined) {
  fs.copyFileSync(partFiles[0], output)
  console.log(`[render] single page -> ${output}`)
} else {
  // one file per page, named off the output basename
  const dir = path.dirname(output)
  const ext = path.extname(output) || ".pdf"
  const stem = path.basename(output, ext)
  pages.forEach((page, i) => {
    const dest = path.join(dir, `${stem}--${slugify(page)}${ext}`)
    fs.copyFileSync(partFiles[i], dest)
    console.log(`[render] -> ${dest}`)
  })
}

// cleanup temp
try {
  for (const f of partFiles) fs.unlinkSync(f)
  fs.rmdirSync(tmpDir)
} catch {
  /* best effort */
}

console.log("[render] done.")
