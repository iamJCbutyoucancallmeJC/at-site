"use client"

// /signs — sign-style phrase generator (t1378, PROTOTYPE).
//
// Amy types a phrase ("It's a beautiful day") and it renders the way her
// hand-painted wooden signs look: imperfect brushed letters on a board,
// auto-wrapped and justified to the board width, in a Standard (3:2) or Long
// (4:1) board, in a Standard or Messy hand. She saves the PNG and cuts stickers
// from it. Lives as an at-site route under the "Fun Stuff" nav like /photobooth
// (the standing rule: experiments are routes, never subdomains).
//
// STYLE IS A PLACEHOLDER. Amy's sign photo was meant to be the style reference
// and it is not on disk anywhere (iMessage, Gmail, vault all searched), so the
// look here is a generic hand-painted approximation. Every knob that should
// move once the photo is in hand is a named constant in the "Tunable style
// parameters" block below: per-letter jitter, baseline wobble, rotation, stroke
// passes and spread (brush roughness), paint opacity, dry-brush speckling, the
// two board finishes, and the letter palette. Nothing about the look is buried
// in the drawing code; tune the constants, not the functions.
//
// Renderer: plain <canvas>, no new npm dependencies. Every glyph is drawn as
// several slightly offset stroke+fill passes with varying alpha and rounded
// caps (a brush laying paint down more than once), with a per-letter rotation
// and baseline offset seeded from the phrase, so the same phrase renders the
// same way every time and a tiny edit does not reshuffle every letter. "Messy"
// is the same machinery with the amplitudes raised. Letters are painted onto
// their own layer, dry-brush speckles are erased from that layer, and the layer
// is composited onto the board at paint opacity.
//
// Font: Quicksand 700, the one Google Font the site already loads (for the
// photobooth). app/signs/layout.tsx loads it via next/font; this file reads the
// resolved family off the CSS variable at runtime so the canvas can use it, and
// waits for document.fonts before the first paint.
//
// Save: PNG exported at 2x the on-screen board (2400x1600 standard, 3200x800
// long) for sticker printing, with a small "amytangerine.com" mark. Web Share
// first (iOS share sheet), download fallback, same path as the photobooth.
//
// GA4 via the house trackEvent: signs_render (a phrase rendered; deduped per
// distinct phrase+settings) and signs_save (PNG shared or downloaded).

import { useCallback, useEffect, useRef, useState } from "react"
import { trackEvent } from "@/lib/analytics"
import "./signs.css"

// ── Tunable style parameters ────────────────────────────────────────────────
// PLACEHOLDER values until Amy's sign photo is used to tune them.

type BoardSizeId = "standard" | "long"
type StyleId = "standard" | "messy"
type FinishId = "natural" | "white"

// Board dimensions in logical pixels. The preview canvas is this size; the
// saved PNG is EXPORT_SCALE times it.
const BOARD_SIZES: { id: BoardSizeId; label: string; width: number; height: number }[] = [
  { id: "standard", label: "Standard 3:2", width: 1200, height: 800 },
  { id: "long", label: "Long 4:1", width: 1600, height: 400 },
]

const EXPORT_SCALE = 2

// Per-hand amplitudes. Fractions are of the line's font size unless noted.
type StyleParams = {
  label: string
  jitterX: number // per-letter horizontal nudge
  baselineWobble: number // per-letter vertical nudge
  rotationDeg: number // per-letter rotation, degrees either way
  scaleJitter: number // per-letter size variance (0.05 = +/-5%)
  lineDrift: number // whole-line vertical drift
  lineTiltDeg: number // whole-line tilt, degrees either way
  strokePasses: number // offset stroke+fill passes per glyph (brush layering)
  strokeSpread: number // max offset of each pass
  strokeWidth: number // outline width of each pass
  passOpacityMin: number // alpha range for the passes
  passOpacityMax: number
  paintOpacity: number // whole letter layer over the board
  drySpeckles: number // dry-brush gaps erased per glyph (0 = none)
  speckleSize: number // max speckle radius
}

const STYLES: Record<StyleId, StyleParams> = {
  standard: {
    label: "Standard",
    jitterX: 0.015,
    baselineWobble: 0.03,
    rotationDeg: 2.5,
    scaleJitter: 0.04,
    lineDrift: 0.02,
    lineTiltDeg: 0.4,
    strokePasses: 3,
    strokeSpread: 0.012,
    strokeWidth: 0.035,
    passOpacityMin: 0.55,
    passOpacityMax: 0.85,
    paintOpacity: 0.94,
    drySpeckles: 3,
    speckleSize: 0.02,
  },
  messy: {
    label: "Messy",
    jitterX: 0.04,
    baselineWobble: 0.09,
    rotationDeg: 8,
    scaleJitter: 0.12,
    lineDrift: 0.06,
    lineTiltDeg: 1.5,
    strokePasses: 5,
    strokeSpread: 0.03,
    strokeWidth: 0.045,
    passOpacityMin: 0.4,
    passOpacityMax: 0.8,
    paintOpacity: 0.9,
    drySpeckles: 9,
    speckleSize: 0.035,
  },
}

// Letter colors. The first two are the site's brand orange and teal
// (app/globals.css); the rest are sign-paint guesses.
const LETTER_COLORS: { id: string; label: string; hex: string }[] = [
  { id: "white", label: "White", hex: "#F7F3EA" },
  { id: "black", label: "Black", hex: "#1F1B18" },
  { id: "orange", label: "Orange", hex: "#FD891C" },
  { id: "teal", label: "Teal", hex: "#00ADB3" },
  { id: "pink", label: "Pink", hex: "#E8557A" },
  { id: "navy", label: "Navy", hex: "#23395B" },
  { id: "mustard", label: "Mustard", hex: "#E0A526" },
  { id: "sage", label: "Sage", hex: "#7C9A6E" },
]

// Board finishes. grainAlpha scales every grain/seam line; edgeShade is the
// darkening at the board's edges.
type Finish = {
  id: FinishId
  label: string
  base: string
  baseLight: string
  grainDark: string
  grainLight: string
  grainAlpha: number
  seam: string
  edgeShade: number
  watermark: string
}

const FINISHES: Finish[] = [
  {
    id: "natural",
    label: "Natural wood",
    base: "#B98B5A",
    baseLight: "#CFA574",
    grainDark: "#7E5A34",
    grainLight: "#E2BE8F",
    grainAlpha: 0.32,
    seam: "#6E4B2A",
    edgeShade: 0.28,
    watermark: "rgba(40, 24, 10, 0.55)",
  },
  {
    id: "white",
    label: "White-washed",
    base: "#EFE9DE",
    baseLight: "#F8F4EC",
    grainDark: "#B9AD9A",
    grainLight: "#FFFFFF",
    grainAlpha: 0.22,
    seam: "#C9BFAE",
    edgeShade: 0.14,
    watermark: "rgba(60, 50, 40, 0.5)",
  },
]

// Layout, as fractions of board width/height.
const LAYOUT = {
  padX: 0.07, // side margin
  padY: 0.11, // top/bottom margin
  lineHeight: 1.12, // line box, in font sizes
  lineGap: 0.12, // extra space between lines, in font sizes
  maxFontFrac: 0.5, // font size ceiling as a fraction of board height
  minFontFrac: 0.05, // floor; below this the phrase is just too long
  maxWordGap: 1.1, // justify: max extra space per word gap, in font sizes
  maxLetterGap: 0.28, // justify: max extra tracking per letter, in font sizes
  grainLinesPerPlank: 14,
  plankHeight: 270, // logical px; boards taller than this get seams
}

const WATERMARK = {
  text: "amytangerine.com",
  sizeFrac: 0.016, // of board width
  inset: 0.02, // of board width, from the bottom-right corner
}

const DEFAULT_PHRASE = "It's a beautiful day"
const RENDER_DEBOUNCE_MS = 220

// ── Seeded randomness ───────────────────────────────────────────────────────
// cyrb53-style string hash into a mulberry32 stream. Seeded from the phrase and
// the style so a re-render is stable and a one-letter edit keeps most letters
// where they were (each letter draws from the stream by its own index).

function hashString(str: string): number {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0) * 4294967296 + (h1 >>> 0)
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Random in [-amp, amp].
function spread(rand: () => number, amp: number) {
  return (rand() * 2 - 1) * amp
}

// Per-letter RNG: one stream per (seed, letter index), so letter 7 gets the same
// quirks whether or not letter 3 changed.
function letterRand(seed: number, index: number) {
  return mulberry32((seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0)
}

// ── Layout ──────────────────────────────────────────────────────────────────

type Glyph = { ch: string; x: number; w: number } // x = left edge, in board px
type Line = { glyphs: Glyph[]; baseline: number; index: number }

type Measurer = (ch: string, fontSize: number) => number

// Greedy word wrap at a given font size. Returns null if a single word is wider
// than the line.
function wrapParagraph(
  words: string[],
  fontSize: number,
  innerW: number,
  measure: Measurer,
): string[][] | null {
  const lines: string[][] = []
  let current: string[] = []
  let currentW = 0
  const spaceW = measure(" ", fontSize)

  for (const word of words) {
    const w = wordWidth(word, fontSize, measure)
    if (w > innerW) return null
    if (current.length === 0) {
      current = [word]
      currentW = w
    } else if (currentW + spaceW + w <= innerW) {
      current.push(word)
      currentW += spaceW + w
    } else {
      lines.push(current)
      current = [word]
      currentW = w
    }
  }
  if (current.length) lines.push(current)
  return lines
}

function wordWidth(word: string, fontSize: number, measure: Measurer) {
  let w = 0
  for (const ch of word) w += measure(ch, fontSize)
  return w
}

// Find the largest font size whose greedy wrap fits the board, then place every
// glyph: each line justified to the inner width (extra space into word gaps
// first, then letter tracking, both capped; whatever is left centers the line).
function layoutPhrase(
  phrase: string,
  boardW: number,
  boardH: number,
  measure: Measurer,
): { lines: Line[]; fontSize: number } {
  const paragraphs = phrase
    .split("\n")
    .map((p) => p.trim().split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0)

  if (paragraphs.length === 0) return { lines: [], fontSize: 0 }

  const innerW = boardW * (1 - 2 * LAYOUT.padX)
  const innerH = boardH * (1 - 2 * LAYOUT.padY)
  const fsMax = boardH * LAYOUT.maxFontFrac
  const fsMin = boardH * LAYOUT.minFontFrac

  let chosen: { fontSize: number; wrapped: string[][] } | null = null
  for (let fs = fsMax; fs >= fsMin; fs *= 0.96) {
    const wrapped: string[][] = []
    let ok = true
    for (const words of paragraphs) {
      const lines = wrapParagraph(words, fs, innerW, measure)
      if (!lines) {
        ok = false
        break
      }
      wrapped.push(...lines)
    }
    if (!ok) continue
    const n = wrapped.length
    const blockH = n * fs * LAYOUT.lineHeight + (n - 1) * fs * LAYOUT.lineGap
    if (blockH <= innerH) {
      chosen = { fontSize: fs, wrapped }
      break
    }
  }
  if (!chosen) {
    // Too long even at the floor: lay it out at the floor size anyway and let
    // it overflow rather than render nothing. (Long phrases are her problem to
    // shorten; the status line says so.)
    const wrapped: string[][] = []
    for (const words of paragraphs) {
      const lines = wrapParagraph(words, fsMin, innerW, measure) ?? [words]
      wrapped.push(...lines)
    }
    chosen = { fontSize: fsMin, wrapped }
  }

  const { fontSize: fs, wrapped } = chosen
  const n = wrapped.length
  const lineStep = fs * (LAYOUT.lineHeight + LAYOUT.lineGap)
  const blockH = n * fs * LAYOUT.lineHeight + (n - 1) * fs * LAYOUT.lineGap
  const blockTop = (boardH - blockH) / 2
  const capH = fs * 0.7 // Quicksand cap height is roughly 0.7em
  const left = boardW * LAYOUT.padX
  const spaceW = measure(" ", fs)

  const lines: Line[] = wrapped.map((words, i) => {
    const baseline = blockTop + i * lineStep + (fs * LAYOUT.lineHeight - capH) / 2 + capH
    const natural =
      words.reduce((sum, w) => sum + wordWidth(w, fs, measure), 0) + spaceW * (words.length - 1)
    const letterCount = words.reduce((sum, w) => sum + Array.from(w).length, 0)
    const gaps = words.length - 1
    let extra = Math.max(0, innerW - natural)

    let wordGap = 0
    if (gaps > 0) {
      wordGap = Math.min(extra / gaps, fs * LAYOUT.maxWordGap)
      extra -= wordGap * gaps
    }
    const letterSlots = letterCount - words.length // gaps between letters inside words
    let letterGap = 0
    if (letterSlots > 0) {
      letterGap = Math.min(extra / letterSlots, fs * LAYOUT.maxLetterGap)
      extra -= letterGap * letterSlots
    }

    const glyphs: Glyph[] = []
    let x = left + extra / 2 // center whatever could not be justified away
    words.forEach((word, wi) => {
      const chars = Array.from(word)
      chars.forEach((ch, ci) => {
        const w = measure(ch, fs)
        glyphs.push({ ch, x, w })
        x += w + (ci < chars.length - 1 ? letterGap : 0)
      })
      if (wi < words.length - 1) x += spaceW + wordGap
    })
    return { glyphs, baseline, index: i }
  })

  return { lines, fontSize: fs }
}

// ── Drawing ─────────────────────────────────────────────────────────────────

type SignOptions = {
  phrase: string
  size: BoardSizeId
  style: StyleId
  colorHex: string
  finish: Finish
  fontFamily: string
}

function fontSpec(fontSize: number, family: string) {
  return `700 ${fontSize}px ${family}`
}

function drawBoard(ctx: CanvasRenderingContext2D, W: number, H: number, finish: Finish, seed: number) {
  const rand = mulberry32(seed ^ 0x5eed)

  // Base with a soft diagonal light.
  const base = ctx.createLinearGradient(0, 0, W, H)
  base.addColorStop(0, finish.baseLight)
  base.addColorStop(0.5, finish.base)
  base.addColorStop(1, finish.baseLight)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  // Planks: a tall board is several boards nailed together.
  const plankCount = Math.max(1, Math.round(H / LAYOUT.plankHeight))
  const plankH = H / plankCount

  for (let p = 0; p < plankCount; p++) {
    const top = p * plankH
    // Each plank gets its own tone shift so the seams read.
    ctx.globalAlpha = 0.08
    ctx.fillStyle = rand() > 0.5 ? finish.grainDark : finish.grainLight
    ctx.fillRect(0, top, W, plankH)
    ctx.globalAlpha = 1

    // Grain: long wavy strokes, dark and light, biased to the plank's middle.
    for (let i = 0; i < LAYOUT.grainLinesPerPlank; i++) {
      const y0 = top + plankH * (0.05 + rand() * 0.9)
      const amp = plankH * (0.02 + rand() * 0.06)
      const dark = rand() > 0.45
      ctx.strokeStyle = dark ? finish.grainDark : finish.grainLight
      ctx.globalAlpha = finish.grainAlpha * (0.35 + rand() * 0.65)
      ctx.lineWidth = 0.6 + rand() * 2.2
      ctx.lineCap = "round"
      ctx.beginPath()
      const segments = 6 + Math.floor(rand() * 5)
      const xStart = -W * 0.05 + rand() * W * 0.15
      const xEnd = W * 0.9 + rand() * W * 0.15
      ctx.moveTo(xStart, y0)
      let px = xStart
      let py = y0
      for (let s = 1; s <= segments; s++) {
        const nx = xStart + ((xEnd - xStart) * s) / segments
        const ny = y0 + spread(rand, amp)
        const cx = (px + nx) / 2 + spread(rand, W * 0.02)
        const cy = (py + ny) / 2 + spread(rand, amp)
        ctx.quadraticCurveTo(cx, cy, nx, ny)
        px = nx
        py = ny
      }
      ctx.stroke()
    }

    // Seam under each plank but the last.
    if (p < plankCount - 1) {
      const y = top + plankH
      ctx.globalAlpha = 0.55
      ctx.strokeStyle = finish.seam
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = finish.grainLight
      ctx.beginPath()
      ctx.moveTo(0, y + 2)
      ctx.lineTo(W, y + 2)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1

  // Edge shading: the board is a slab, not a flat rectangle.
  const edge = Math.min(W, H) * 0.06
  const shade = `rgba(30, 18, 8, ${finish.edgeShade})`
  const clear = "rgba(30, 18, 8, 0)"
  const sides: [number, number, number, number][] = [
    [0, 0, edge, 0],
    [W, 0, W - edge, 0],
    [0, 0, 0, edge],
    [0, H, 0, H - edge],
  ]
  for (const [x0, y0, x1, y1] of sides) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, shade)
    g.addColorStop(1, clear)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  // A thin light bevel along the top and left.
  ctx.globalAlpha = 0.35
  ctx.strokeStyle = finish.grainLight
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(1.5, H)
  ctx.lineTo(1.5, 1.5)
  ctx.lineTo(W, 1.5)
  ctx.stroke()
  ctx.globalAlpha = 1
}

// Paint the letters onto a separate transparent layer the size of the board,
// then return it. The caller composites it at paint opacity.
function paintLetters(
  W: number,
  H: number,
  scale: number,
  lines: Line[],
  fontSize: number,
  style: StyleParams,
  colorHex: string,
  family: string,
  seed: number,
): HTMLCanvasElement | null {
  const layer = document.createElement("canvas")
  layer.width = Math.round(W * scale)
  layer.height = Math.round(H * scale)
  const ctx = layer.getContext("2d")
  if (!ctx) return null
  ctx.scale(scale, scale)

  ctx.font = fontSpec(fontSize, family)
  ctx.textBaseline = "alphabetic"
  ctx.textAlign = "left"
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.fillStyle = colorHex
  ctx.strokeStyle = colorHex

  const fs = fontSize
  const boxes: { x: number; y: number; w: number; h: number }[] = []
  let letterIndex = 0

  for (const line of lines) {
    const lineRand = mulberry32((seed ^ Math.imul(line.index + 101, 0x85ebca6b)) >>> 0)
    const drift = spread(lineRand, style.lineDrift * fs)
    const tilt = (spread(lineRand, style.lineTiltDeg) * Math.PI) / 180
    const lineMidX = W / 2

    for (const g of line.glyphs) {
      const rand = letterRand(seed, letterIndex++)
      const dx = spread(rand, style.jitterX * fs)
      const dy = spread(rand, style.baselineWobble * fs)
      const rot = (spread(rand, style.rotationDeg) * Math.PI) / 180
      const sc = 1 + spread(rand, style.scaleJitter)

      // Line tilt pivots around the line's center; letters ride it.
      const relX = g.x + g.w / 2 - lineMidX
      const tiltDy = Math.sin(tilt) * relX
      const cx = g.x + g.w / 2 + dx
      const cy = line.baseline + drift + tiltDy + dy

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(rot + tilt)
      ctx.scale(sc, sc)
      ctx.lineWidth = style.strokeWidth * fs

      for (let p = 0; p < style.strokePasses; p++) {
        const ox = spread(rand, style.strokeSpread * fs)
        const oy = spread(rand, style.strokeSpread * fs)
        const alpha = style.passOpacityMin + rand() * (style.passOpacityMax - style.passOpacityMin)
        ctx.globalAlpha = alpha
        ctx.strokeText(g.ch, -g.w / 2 + ox, oy)
        ctx.globalAlpha = Math.min(1, alpha + 0.1)
        ctx.fillText(g.ch, -g.w / 2 + ox, oy)
      }
      ctx.restore()

      boxes.push({ x: cx - (g.w / 2) * sc - fs * 0.05, y: cy - fs * 0.8, w: g.w * sc + fs * 0.1, h: fs * 1.05 })
    }
  }
  ctx.globalAlpha = 1

  // Dry brush: erase small speckles inside the glyph boxes so the paint looks
  // like it skipped over the grain here and there.
  if (style.drySpeckles > 0) {
    const rand = mulberry32(seed ^ 0xd17b)
    ctx.globalCompositeOperation = "destination-out"
    for (const box of boxes) {
      for (let i = 0; i < style.drySpeckles; i++) {
        const r = fs * style.speckleSize * (0.3 + rand() * 0.7)
        const x = box.x + rand() * box.w
        const y = box.y + rand() * box.h
        ctx.globalAlpha = 0.35 + rand() * 0.5
        ctx.beginPath()
        ctx.ellipse(x, y, r, r * (0.4 + rand() * 0.6), rand() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
  }

  return layer
}

function drawWatermark(ctx: CanvasRenderingContext2D, W: number, H: number, finish: Finish, family: string) {
  const size = Math.max(10, W * WATERMARK.sizeFrac)
  ctx.font = fontSpec(size, family)
  ctx.textAlign = "right"
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = finish.watermark
  ctx.fillText(WATERMARK.text, W - W * WATERMARK.inset, H - W * WATERMARK.inset)
}

// Draw the whole sign into `canvas` at `scale` times the board's logical size.
// Returns the layout so the caller can report on it.
function drawSign(canvas: HTMLCanvasElement, opts: SignOptions, scale: number) {
  const board = BOARD_SIZES.find((b) => b.id === opts.size) ?? BOARD_SIZES[0]
  const W = board.width
  const H = board.height
  canvas.width = Math.round(W * scale)
  canvas.height = Math.round(H * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return { lineCount: 0, fontSize: 0, overflow: false }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(scale, scale)

  const style = STYLES[opts.style]
  const seed = hashString(`${opts.phrase}|${opts.style}`) >>> 0

  drawBoard(ctx, W, H, opts.finish, seed)

  // Measure with the same font the letters are painted in.
  const measureCache = new Map<string, number>()
  const measure: Measurer = (ch, fontSize) => {
    const key = `${fontSize}|${ch}`
    const hit = measureCache.get(key)
    if (hit !== undefined) return hit
    ctx.font = fontSpec(fontSize, opts.fontFamily)
    const w = ctx.measureText(ch).width
    measureCache.set(key, w)
    return w
  }

  const { lines, fontSize } = layoutPhrase(opts.phrase, W, H, measure)
  const n = lines.length
  const blockH = n * fontSize * LAYOUT.lineHeight + (n - 1) * fontSize * LAYOUT.lineGap
  const overflow = blockH > H * (1 - 2 * LAYOUT.padY) + 0.5

  if (lines.length) {
    const layer = paintLetters(W, H, scale, lines, fontSize, style, opts.colorHex, opts.fontFamily, seed)
    if (layer) {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = style.paintOpacity
      ctx.drawImage(layer, 0, 0)
      ctx.restore()
    }
  }

  drawWatermark(ctx, W, H, opts.finish, opts.fontFamily)
  return { lineCount: n, fontSize, overflow }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SignsPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastTrackedRef = useRef<string>("")
  const renderTimer = useRef<number | null>(null)

  const [phrase, setPhrase] = useState(DEFAULT_PHRASE)
  const [size, setSize] = useState<BoardSizeId>("standard")
  const [style, setStyle] = useState<StyleId>("standard")
  const [colorId, setColorId] = useState(LETTER_COLORS[0].id)
  const [finishId, setFinishId] = useState<FinishId>("natural")
  const [fontFamily, setFontFamily] = useState<string | null>(null)
  const [status, setStatus] = useState("Loading the brush...")
  const [saving, setSaving] = useState(false)

  const color = LETTER_COLORS.find((c) => c.id === colorId) ?? LETTER_COLORS[0]
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0]
  const boardDims = BOARD_SIZES.find((b) => b.id === size) ?? BOARD_SIZES[0]

  // Resolve the next/font family off the CSS variable and wait for it to load,
  // so the first canvas paint is in Quicksand and not the fallback.
  useEffect(() => {
    let alive = true
    const root = rootRef.current
    if (!root) return
    const family = getComputedStyle(root).fontFamily || "sans-serif"
    const ready = async () => {
      try {
        await document.fonts.load(fontSpec(40, family))
      } catch {
        // Some browsers reject a multi-family shorthand; fonts.ready still resolves.
      }
      try {
        await document.fonts.ready
      } catch {}
      if (alive) setFontFamily(family)
    }
    void ready()
    return () => {
      alive = false
    }
  }, [])

  const currentOptions = useCallback(
    (): SignOptions => ({
      phrase,
      size,
      style,
      colorHex: color.hex,
      finish,
      fontFamily: fontFamily ?? "sans-serif",
    }),
    [phrase, size, style, color.hex, finish, fontFamily],
  )

  // Debounced preview render. Fires signs_render once per distinct
  // phrase+settings so typing a sentence counts as one render, not twenty.
  useEffect(() => {
    if (!fontFamily) return
    if (renderTimer.current) window.clearTimeout(renderTimer.current)
    renderTimer.current = window.setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const opts = currentOptions()
      const result = drawSign(canvas, opts, 1)

      if (!opts.phrase.trim()) {
        setStatus("Type a phrase to paint it on the board.")
        return
      }
      setStatus(
        result.overflow
          ? "That is a lot of words for one sign. Shorten it or try the Standard board."
          : `${result.lineCount} line${result.lineCount === 1 ? "" : "s"}, ${STYLES[opts.style].label.toLowerCase()} hand`,
      )

      const key = [opts.phrase.trim(), opts.size, opts.style, colorId, finishId].join("|")
      if (key !== lastTrackedRef.current) {
        lastTrackedRef.current = key
        trackEvent("signs_render", {
          board: opts.size,
          style: opts.style,
          color: colorId,
          finish: finishId,
          lines: result.lineCount,
          chars: opts.phrase.trim().length,
        })
      }
    }, RENDER_DEBOUNCE_MS)
    return () => {
      if (renderTimer.current) window.clearTimeout(renderTimer.current)
    }
  }, [fontFamily, currentOptions, colorId, finishId])

  // Export at 2x, Web Share first, download fallback (the photobooth's path).
  const savePng = useCallback(async () => {
    if (!fontFamily || saving) return
    setSaving(true)
    try {
      const opts = currentOptions()
      const out = document.createElement("canvas")
      drawSign(out, opts, EXPORT_SCALE)

      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"))
      if (!blob) return

      const name = `sign-${Date.now()}.png`
      const file = new File([blob], name, { type: "image/png" })
      const eventData = { board: opts.size, style: opts.style, color: colorId, finish: finishId }

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Sign" })
          trackEvent("signs_save", { method: "share", ...eventData })
          return
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return
          // Otherwise fall through to download.
        }
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = name
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      trackEvent("signs_save", { method: "download", ...eventData })
    } finally {
      setSaving(false)
    }
  }, [fontFamily, saving, currentOptions, colorId, finishId])

  const reset = useCallback(() => {
    setPhrase(DEFAULT_PHRASE)
    setSize("standard")
    setStyle("standard")
    setColorId(LETTER_COLORS[0].id)
    setFinishId("natural")
  }, [])

  return (
    <div className="sg-root" ref={rootRef}>
      <div className="sg-container">
        <header className="sg-header">
          <h1 className="sg-title">Sign Maker</h1>
          <p className="sg-tagline">Type a phrase. Paint it on a board. Save it for stickers.</p>
        </header>

        <div className="sg-board-wrap">
          <canvas
            ref={canvasRef}
            className="sg-canvas"
            width={boardDims.width}
            height={boardDims.height}
            style={{ aspectRatio: `${boardDims.width} / ${boardDims.height}` }}
            aria-label={phrase ? `Painted sign reading: ${phrase}` : "Blank painted sign"}
            role="img"
          />
        </div>
        <p className="sg-status">{status}</p>

        <div className="sg-controls">
          <div className="sg-field sg-wide">
            <label className="sg-label" htmlFor="sg-phrase">
              Phrase
            </label>
            <textarea
              id="sg-phrase"
              className="sg-textarea"
              value={phrase}
              maxLength={140}
              placeholder="It's a beautiful day"
              onChange={(e) => setPhrase(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="sg-field">
            <span className="sg-label">Board</span>
            <div className="sg-row" role="group" aria-label="Board size">
              {BOARD_SIZES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`sg-chip${size === b.id ? " sg-active" : ""}`}
                  aria-pressed={size === b.id}
                  onClick={() => setSize(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sg-field">
            <span className="sg-label">Hand</span>
            <div className="sg-row" role="group" aria-label="Lettering style">
              {(Object.keys(STYLES) as StyleId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`sg-chip${style === id ? " sg-active" : ""}`}
                  aria-pressed={style === id}
                  onClick={() => setStyle(id)}
                >
                  {STYLES[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="sg-field">
            <span className="sg-label">Letters</span>
            <div className="sg-row" role="group" aria-label="Letter color">
              {LETTER_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`sg-swatch${colorId === c.id ? " sg-active" : ""}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={colorId === c.id}
                  onClick={() => setColorId(c.id)}
                />
              ))}
            </div>
          </div>

          <div className="sg-field">
            <span className="sg-label">Board finish</span>
            <div className="sg-row" role="group" aria-label="Board finish">
              {FINISHES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`sg-finish${finishId === f.id ? " sg-active" : ""}`}
                  style={{
                    background: `repeating-linear-gradient(180deg, ${f.base} 0 6px, ${f.baseLight} 6px 9px)`,
                  }}
                  title={f.label}
                  aria-label={f.label}
                  aria-pressed={finishId === f.id}
                  onClick={() => setFinishId(f.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="sg-actions">
          <button type="button" className="sg-btn" onClick={savePng} disabled={!fontFamily || saving}>
            {saving ? "Saving..." : "Save PNG"}
          </button>
          <button type="button" className="sg-btn sg-secondary" onClick={reset}>
            Start Over
          </button>
        </div>
        <p className="sg-note">
          Saves at {boardDims.width * EXPORT_SCALE} x {boardDims.height * EXPORT_SCALE} px, ready for sticker printing.
        </p>
      </div>
    </div>
  )
}
