"use client"

// /signs — the sign maker (t1378).
//
// Amy types a phrase ("It's a beautiful day") and it goes up on a board the way
// the sign in her reference photo does. She saves the PNG and cuts stickers
// from it. Lives as an at-site route under the "Fun Stuff" nav like /photobooth
// (the standing rule: experiments are routes, never subdomains).
//
// THE REFERENCE. Amy's photo (emailed 2026-08-11, "Another dream project for
// Claude", IMG_1749.jpg; vault copy: A5 Job/Linslow/Clients/Amy Tangerine/
// Website Redesign/sign-maker-reference-2026-08-11.jpg) is NOT a painted wooden
// sign. It is a slide-in letter board from a farmers market: a white panel with
// horizontal cream rails, and each letter printed in heavy condensed black caps
// on its own white card, tucked under a rail. The cards sit a little crooked
// and at slightly different heights, the black is sun-faded into grey clouds,
// a space is a blank card, and one S went in upside down. "What I like about
// this is it's a little imperfect. I don't like that in fonts." That is the
// whole brief, so everything below models cards in rails, not brush strokes.
//
// Renderer: plain <canvas>, no new npm dependencies. Letters are Anton (Google
// Fonts via next/font, the nearest free face to the photo's condensed
// grotesque). Layout picks the largest card size whose greedy word wrap fits
// the board (cards are uniform width like a real letter set; wide letters get
// squeezed, never a bigger card), then draws every rail the board has room for
// so unused rails read as empty rails. Each card's nudge, tilt, slump and flip
// is seeded from the phrase and the style, so the same phrase renders the same
// way every time and a one-letter edit does not reshuffle the rest. "Messy" is
// the same machinery with the amplitudes raised. The photo's sun-fade is left
// out on purpose: painted onto the letters it read as glare (JC, 10/20).
//
// Every knob that shapes the look is a named constant in the "Tunable style
// parameters" block. Tune the constants, not the functions.
//
// Save: PNG at 2x the on-screen board (1800x2250 standard, 3600x900 long) for
// sticker printing, with Amy's logo centred at the foot (JC, 10/20: her brand,
// not just her name; a corner mark gets clipped by rounded message bubbles).
// Three ways out (JC, 10/20: share a sign without downloading it). Share opens
// the device's share sheet (phones, Safari, any browser that can share files),
// titled with the phrase. Where a browser cannot share files, Copy Image puts
// the sign on the clipboard to paste into a message. Download PNG is always
// there, for sticker printing.
//
// GA4 via the house trackEvent: signs_render (a phrase rendered; deduped per
// distinct phrase+settings) and signs_save (method share, copy or download).

import { useCallback, useEffect, useRef, useState } from "react"
import { trackEvent } from "@/lib/analytics"
import "./signs.css"

// ── Tunable style parameters ────────────────────────────────────────────────

type BoardSizeId = "standard" | "long"
type StyleId = "standard" | "messy"

// Board dimensions in logical pixels. The preview canvas is this size; the
// saved PNG is EXPORT_SCALE times it. "Standard" is a 4:5 portrait: the photo
// is taller (3:5), but at that shape a nine-letter word leaves half the rails
// empty, and at 4:5 the photo's own phrase lands as it does in the photo (four
// lines, four rails). "Long" is a banner, one or two rails. maxCardH caps the
// card height as a fraction of board height so a two-word phrase does not
// become two giant cards. logoH is the height of Amy's logo at the foot of the
// board, as a fraction of board height; the rails stay clear of it.
const BOARD_SIZES: { id: BoardSizeId; label: string; width: number; height: number; maxCardH: number; logoH: number }[] = [
  { id: "standard", label: "Standard", width: 900, height: 1125, maxCardH: 0.2, logoH: 0.045 },
  { id: "long", label: "Long", width: 1800, height: 450, maxCardH: 0.6, logoH: 0.09 },
]

const EXPORT_SCALE = 2

// Card and rail geometry, measured off the photo (cards about 180x330 on a
// 1178x2014 frame, strips about 50 tall, four rails).
const CARD = {
  aspect: 0.56, // card width / card height
  gap: 0.035, // gap between neighbouring cards, of card width
  blankFrac: 0.72, // a space is a blank card this wide
  narrowFrac: 0.58, // punctuation sits on a narrower card
  letterH: 0.76, // cap height as a fraction of card height
  letterW: 0.66, // the width a letter is stretched toward, of card width (the photo's face is wider than Anton)
  maxStretch: 1.45, // never widen a glyph more than this
  maxLetterW: 0.86, // a letter may use this much of the card width before it is squeezed
  stripH: 0.15, // rail strip height, of card height
  tuck: 0.5, // fraction of the strip that overlaps the card top
  railGap: 0.07, // room under a card before the next strip, of card height
}

const LAYOUT = {
  padX: 0.08, // side margin, of board width
  padY: 0.05, // top/bottom margin, of board height
  minCardH: 0.028, // of board height; below this the phrase is just too long
  shrinkStep: 0.95, // card-size search step
}

// Per-style amplitudes. Fractions are of card width (dx) or card height (dy,
// slump) unless noted.
type StyleParams = {
  label: string
  cardDx: number // per-card horizontal nudge
  cardDy: number // per-card vertical nudge
  cardTiltDeg: number // per-card tilt, degrees either way
  slumpChance: number // chance a card has slipped down its rail
  slump: number // how far a slipped card drops
  lineShift: number // whole-line horizontal drift, of board width
  flipSymmetric: number // chance an S/N/Z/H/I/O/X goes in upside down (reads almost right, like the photo)
  flipAny: number // chance any other letter goes in upside down
  inkVariance: number // per-letter lightening of the ink, 0..1
  cardTone: number // per-card greying of the white card, 0..1
}

const STYLES: Record<StyleId, StyleParams> = {
  standard: {
    label: "Standard",
    cardDx: 0.03,
    cardDy: 0.03,
    cardTiltDeg: 1.4,
    slumpChance: 0.2,
    slump: 0.03,
    lineShift: 0.008,
    flipSymmetric: 0.12,
    flipAny: 0,
    inkVariance: 0.06,
    cardTone: 0.03,
  },
  messy: {
    label: "Messy",
    cardDx: 0.07,
    cardDy: 0.07,
    cardTiltDeg: 4.5,
    slumpChance: 0.35,
    slump: 0.1,
    lineShift: 0.03,
    flipSymmetric: 0.3,
    flipAny: 0.07,
    inkVariance: 0.14,
    cardTone: 0.06,
  },
}

// Letters that still read when a card goes in upside down.
const SYMMETRIC_LETTERS = new Set(["S", "N", "Z", "H", "I", "O", "X", "0", "8"])

// Characters that sit on a narrow card.
const NARROW_CHARS = new Set(["'", "’", ",", ".", "!", "?", ":", ";", "-", "|", "‘", '"', "“", "”"])

// Ink. Black is the photo; the rest are for stickers that want colour. The
// orange and teal are the site's brand pair (app/globals.css).
const INKS: { id: string; label: string; hex: string }[] = [
  { id: "black", label: "Black", hex: "#171717" },
  { id: "red", label: "Red", hex: "#B5281E" },
  { id: "navy", label: "Navy", hex: "#1F2F4D" },
  { id: "orange", label: "Orange", hex: "#FD891C" },
  { id: "teal", label: "Teal", hex: "#00ADB3" },
]

// Board and card colours, from the photo.
const BOARD = {
  panel: "#ECEDED", // the white-painted panel behind the rails, a touch cool
  panelLight: "#F5F5F4",
  groove: "rgba(0, 0, 0, 0.04)", // faint vertical siding lines
  grooveCount: 5,
  vignette: 0.07,
  strip: "#E5E2D9", // the cream rail strips
  stripHighlight: "rgba(255, 255, 255, 0.55)",
  stripShadow: 0.14, // shadow the strip throws on the cards under it
  card: "#FBFBF9",
  cardEdge: "rgba(0, 0, 0, 0.08)",
  cardShadow: "rgba(0, 0, 0, 0.18)",
}

// Amy's logo, the one in the site header. Same origin, so drawing it keeps the
// canvas exportable. If it fails to load, the foot falls back to the text mark.
const LOGO = {
  src: "/images/amy-tangerine-logo.png",
  aspect: 1500 / 389, // the file's width / height
}

const WATERMARK = {
  text: "amytangerine.com",
  sizeFrac: 0.5, // of the logo height it stands in for
  color: "rgba(60, 60, 60, 0.7)",
}

const DEFAULT_PHRASE = "It's a beautiful day"
const RENDER_DEBOUNCE_MS = 220
const FALLBACK_LETTER_FONT = "Impact, 'Arial Narrow', sans-serif"
const FALLBACK_UI_FONT = "sans-serif"

// ── Seeded randomness ───────────────────────────────────────────────────────
// cyrb53-style string hash into a mulberry32 stream. Seeded from the phrase and
// the settings so a re-render is stable and a one-letter edit keeps most cards
// where they were (each card draws from the stream by its own index).

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

// Per-card RNG: one stream per (seed, card index), so card 7 gets the same
// quirks whether or not card 3 changed.
function cardRand(seed: number, index: number) {
  return mulberry32((seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0)
}

// ── Colour helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r}, ${g}, ${bl})`
}

// ── Layout ──────────────────────────────────────────────────────────────────

type CardKind = "letter" | "blank"
type Card = { kind: CardKind; ch: string; x: number; w: number; index: number } // x = left edge, board px
type Line = { cards: Card[]; width: number; rail: number }

type Layout = {
  cardH: number
  cardW: number
  fontSize: number
  stripH: number
  pitch: number
  blockTop: number
  railsTotal: number
  lines: Line[]
  overflow: boolean
}

type Measurer = (ch: string, fontSize: number) => number

// Split the phrase into paragraphs of words, each word a list of uppercase
// characters. A letter board is capitals; what she typed stays in the box.
function tokenize(phrase: string): string[][][] {
  return phrase
    .split("\n")
    .map((p) =>
      p
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => Array.from(word.toLocaleUpperCase("en-US"))),
    )
    .filter((words) => words.length > 0)
}

function cardWidthFor(ch: string, cardW: number) {
  return NARROW_CHARS.has(ch) ? cardW * CARD.narrowFrac : cardW
}

function wordWidth(word: string[], cardW: number, gap: number) {
  let w = 0
  word.forEach((ch, i) => {
    w += cardWidthFor(ch, cardW) + (i < word.length - 1 ? gap : 0)
  })
  return w
}

// Greedy word wrap at a given card size. Returns null if one word is wider
// than the rail.
function wrapParagraph(words: string[][], cardW: number, gap: number, innerW: number): string[][][] | null {
  const blankW = cardW * CARD.blankFrac
  const lines: string[][][] = []
  let current: string[][] = []
  let currentW = 0
  for (const word of words) {
    const w = wordWidth(word, cardW, gap)
    if (w > innerW) return null
    if (current.length === 0) {
      current = [word]
      currentW = w
    } else if (currentW + gap + blankW + gap + w <= innerW) {
      current.push(word)
      currentW += gap + blankW + gap + w
    } else {
      lines.push(current)
      current = [word]
      currentW = w
    }
  }
  if (current.length) lines.push(current)
  return lines
}

// Find the largest card size whose wrap fits the board, then place every card.
// Lines are centred in their rails; the rails fill the board so the empty ones
// show, like a real letter board with a short message on it.
function layoutPhrase(
  phrase: string,
  board: (typeof BOARD_SIZES)[number],
  fontSizeFor: (cardH: number) => number,
): Layout {
  const W = board.width
  const H = board.height
  const innerW = W * (1 - 2 * LAYOUT.padX)
  const innerH = H * (1 - 2 * LAYOUT.padY - board.logoH)
  const paragraphs = tokenize(phrase)

  const geometry = (cardH: number) => {
    const cardW = cardH * CARD.aspect
    const gap = cardW * CARD.gap
    const stripH = cardH * CARD.stripH
    const pitch = stripH * (1 - CARD.tuck) + cardH * (1 + CARD.railGap)
    return { cardW, gap, stripH, pitch }
  }

  const empty = (cardH: number): Layout => {
    const g = geometry(cardH)
    const railsTotal = Math.max(1, Math.floor((innerH - g.stripH) / g.pitch))
    const blockH = railsTotal * g.pitch + g.stripH
    return {
      cardH,
      cardW: g.cardW,
      fontSize: fontSizeFor(cardH),
      stripH: g.stripH,
      pitch: g.pitch,
      blockTop: H * LAYOUT.padY + (innerH - blockH) / 2,
      railsTotal,
      lines: [],
      overflow: false,
    }
  }

  const maxCardH = H * board.maxCardH
  const minCardH = H * LAYOUT.minCardH
  if (paragraphs.length === 0) return empty(maxCardH)

  let chosen: { cardH: number; wrapped: string[][][]; overflow: boolean } | null = null
  for (let cardH = maxCardH; cardH >= minCardH; cardH *= LAYOUT.shrinkStep) {
    const g = geometry(cardH)
    const wrapped: string[][][] = []
    let ok = true
    for (const words of paragraphs) {
      const lines = wrapParagraph(words, g.cardW, g.gap, innerW)
      if (!lines) {
        ok = false
        break
      }
      wrapped.push(...lines)
    }
    if (!ok) continue
    if (wrapped.length * g.pitch + g.stripH <= innerH) {
      chosen = { cardH, wrapped, overflow: false }
      break
    }
  }
  if (!chosen) {
    // Too long even at the floor: lay it out at the floor size and let it run
    // off the board rather than render nothing. The status line says so.
    const g = geometry(minCardH)
    const wrapped: string[][][] = []
    for (const words of paragraphs) {
      wrapped.push(...(wrapParagraph(words, g.cardW, g.gap, innerW) ?? [words]))
    }
    chosen = { cardH: minCardH, wrapped, overflow: true }
  }

  const { cardH, wrapped, overflow } = chosen
  const g = geometry(cardH)
  const blankW = g.cardW * CARD.blankFrac
  const railsTotal = Math.max(wrapped.length, Math.floor((innerH - g.stripH) / g.pitch))
  const blockH = railsTotal * g.pitch + g.stripH
  const blockTop = H * LAYOUT.padY + (innerH - blockH) / 2
  const firstRail = Math.floor((railsTotal - wrapped.length) / 2)
  const left = W * LAYOUT.padX

  let cardIndex = 0
  const lines: Line[] = wrapped.map((words, li) => {
    const cards: Card[] = []
    let x = 0
    words.forEach((word, wi) => {
      word.forEach((ch) => {
        const w = cardWidthFor(ch, g.cardW)
        cards.push({ kind: "letter", ch, x, w, index: cardIndex++ })
        x += w + g.gap
      })
      if (wi < words.length - 1) {
        cards.push({ kind: "blank", ch: " ", x, w: blankW, index: cardIndex++ })
        x += blankW + g.gap
      }
    })
    const width = x - g.gap
    const offset = left + (innerW - width) / 2
    for (const c of cards) c.x += offset
    return { cards, width, rail: firstRail + li }
  })

  return {
    cardH,
    cardW: g.cardW,
    fontSize: fontSizeFor(cardH),
    stripH: g.stripH,
    pitch: g.pitch,
    blockTop,
    railsTotal,
    lines,
    overflow,
  }
}

// ── Drawing ─────────────────────────────────────────────────────────────────

type SignOptions = {
  phrase: string
  size: BoardSizeId
  style: StyleId
  inkHex: string
  letterFont: string
  uiFont: string
  logo: HTMLImageElement | null
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.download = name
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function letterFontSpec(fontSize: number, family: string) {
  return `400 ${fontSize}px ${family}`
}

function drawPanel(ctx: CanvasRenderingContext2D, W: number, H: number, seed: number) {
  const rand = mulberry32(seed ^ 0x5eed)

  const base = ctx.createLinearGradient(0, 0, W, H)
  base.addColorStop(0, BOARD.panelLight)
  base.addColorStop(0.55, BOARD.panel)
  base.addColorStop(1, BOARD.panelLight)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, W, H)

  // Faint vertical siding lines, unevenly spaced.
  ctx.strokeStyle = BOARD.groove
  ctx.lineWidth = 1.2
  for (let i = 1; i <= BOARD.grooveCount; i++) {
    const x = (W * i) / (BOARD.grooveCount + 1) + spread(rand, W * 0.02)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + spread(rand, 2), H)
    ctx.stroke()
  }

  // Vignette: the panel is lit from the middle.
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75)
  v.addColorStop(0, "rgba(0, 0, 0, 0)")
  v.addColorStop(1, `rgba(0, 0, 0, ${BOARD.vignette})`)
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)
}

type PlacedCard = {
  card: Card
  cx: number
  cy: number
  tilt: number
  flip: boolean
  tone: number
  ink: string
}

// Where each card actually sits once its quirks are applied.
function placeCards(layout: Layout, style: StyleParams, inkHex: string, W: number, seed: number): PlacedCard[] {
  const ink = hexToRgb(inkHex)
  const white: [number, number, number] = [255, 255, 255]
  const placed: PlacedCard[] = []
  for (const line of layout.lines) {
    const lineRand = mulberry32((seed ^ Math.imul(line.rail + 101, 0x85ebca6b)) >>> 0)
    const shift = spread(lineRand, style.lineShift * W)
    const cardTop = layout.blockTop + line.rail * layout.pitch + layout.stripH * (1 - CARD.tuck)
    for (const card of line.cards) {
      const rand = cardRand(seed, card.index)
      const dx = spread(rand, style.cardDx * layout.cardW)
      const dy = spread(rand, style.cardDy * layout.cardH)
      const slump = rand() < style.slumpChance ? rand() * style.slump * layout.cardH : 0
      const tilt = (spread(rand, style.cardTiltDeg) * Math.PI) / 180
      const tone = rand() * style.cardTone
      let flip = false
      if (card.kind === "letter") {
        const roll = rand()
        flip = SYMMETRIC_LETTERS.has(card.ch) ? roll < style.flipSymmetric : roll < style.flipAny
      }
      const lighten = rand() * style.inkVariance
      placed.push({
        card,
        cx: card.x + card.w / 2 + dx + shift,
        cy: cardTop + layout.cardH / 2 + dy + slump,
        tilt,
        flip,
        tone,
        ink: mix(ink, white, lighten),
      })
    }
  }
  return placed
}

function drawCards(ctx: CanvasRenderingContext2D, placed: PlacedCard[], layout: Layout) {
  const cardRgb = hexToRgb(BOARD.card)
  const grey: [number, number, number] = [205, 205, 200]
  for (const p of placed) {
    ctx.save()
    ctx.translate(p.cx, p.cy)
    ctx.rotate(p.tilt)
    ctx.shadowColor = BOARD.cardShadow
    ctx.shadowBlur = layout.cardH * 0.03
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = layout.cardH * 0.012
    ctx.fillStyle = mix(cardRgb, grey, p.tone)
    ctx.fillRect(-p.card.w / 2, -layout.cardH / 2, p.card.w, layout.cardH)
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.strokeStyle = BOARD.cardEdge
    ctx.lineWidth = 1
    ctx.strokeRect(-p.card.w / 2, -layout.cardH / 2, p.card.w, layout.cardH)
    ctx.restore()
  }
}

function drawLetters(
  ctx: CanvasRenderingContext2D,
  placed: PlacedCard[],
  layout: Layout,
  family: string,
  capRatio: number,
) {
  const fs = layout.fontSize
  const capH = fs * capRatio
  ctx.font = letterFontSpec(fs, family)
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"

  const letters = placed.filter((p) => p.card.kind === "letter")
  for (const p of letters) {
    const adv = ctx.measureText(p.card.ch).width
    const maxW = p.card.w * CARD.maxLetterW
    // Widen toward the photo's heavier face, within the card; squeeze if the
    // glyph is wider than the card allows (W and M on a narrow card).
    const wanted = Math.min(maxW, Math.max(adv, p.card.w * CARD.letterW, 0), adv * CARD.maxStretch)
    const sx = adv > 0 ? wanted / adv : 1
    ctx.save()
    ctx.translate(p.cx, p.cy)
    ctx.rotate(p.tilt + (p.flip ? Math.PI : 0))
    ctx.scale(sx, 1)
    ctx.fillStyle = p.ink
    ctx.fillText(p.card.ch, 0, capH / 2)
    ctx.restore()
  }
}

// The rail strips go on last so they overlap the card tops (the cards are
// tucked under them). Every rail the board has room for gets a strip, used or
// not, plus the closing strip under the last one.
function drawRails(ctx: CanvasRenderingContext2D, layout: Layout, W: number) {
  for (let r = 0; r <= layout.railsTotal; r++) {
    const y = layout.blockTop + r * layout.pitch
    const h = layout.stripH
    ctx.fillStyle = BOARD.strip
    ctx.fillRect(0, y, W, h)
    ctx.strokeStyle = BOARD.stripHighlight
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, y + 0.75)
    ctx.lineTo(W, y + 0.75)
    ctx.stroke()
    const shadow = ctx.createLinearGradient(0, y + h, 0, y + h + h * 0.6)
    shadow.addColorStop(0, `rgba(0, 0, 0, ${BOARD.stripShadow})`)
    shadow.addColorStop(1, "rgba(0, 0, 0, 0)")
    ctx.fillStyle = shadow
    ctx.fillRect(0, y + h, W, h * 0.6)
  }
}

// Amy's logo, centred in the band below the rails (the bottom margin plus the
// board's logoH). Centred, not in a corner: a rounded message bubble clips corners.
function drawLogo(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  logoFrac: number,
  logo: HTMLImageElement | null,
  uiFont: string,
) {
  const h = H * logoFrac
  const bandTop = H * (1 - LAYOUT.padY - logoFrac)
  const cy = (bandTop + H) / 2
  if (logo) {
    const w = h * LOGO.aspect
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(logo, W / 2 - w / 2, cy - h / 2, w, h)
    return
  }
  ctx.font = `700 ${Math.max(10, h * WATERMARK.sizeFrac)}px ${uiFont}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = WATERMARK.color
  ctx.fillText(WATERMARK.text, W / 2, cy)
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
  if (!ctx) return { lineCount: 0, railsTotal: 0, overflow: false }
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(scale, scale)

  const style = STYLES[opts.style]
  const seed = hashString(`${opts.phrase}|${opts.style}|${opts.size}`) >>> 0

  // How tall a capital is in this font, as a fraction of the font size, so a
  // card's letter can be sized to the card rather than the other way round.
  ctx.font = letterFontSpec(100, opts.letterFont)
  const probe = ctx.measureText("H")
  const capRatio = probe.actualBoundingBoxAscent > 0 ? probe.actualBoundingBoxAscent / 100 : 0.72
  const fontSizeFor = (cardH: number) => (cardH * CARD.letterH) / capRatio

  const layout = layoutPhrase(opts.phrase, board, fontSizeFor)

  drawPanel(ctx, W, H, seed)
  const placed = placeCards(layout, style, opts.inkHex, W, seed)
  drawCards(ctx, placed, layout)
  drawLetters(ctx, placed, layout, opts.letterFont, capRatio)
  drawRails(ctx, layout, W)
  drawLogo(ctx, W, H, board.logoH, opts.logo, opts.uiFont)

  return { lineCount: layout.lines.length, railsTotal: layout.railsTotal, overflow: layout.overflow }
}

// ── Page ────────────────────────────────────────────────────────────────────

type Fonts = { letter: string; ui: string }

export default function SignsPage() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastTrackedRef = useRef<string>("")
  const renderTimer = useRef<number | null>(null)

  const [phrase, setPhrase] = useState(DEFAULT_PHRASE)
  const [size, setSize] = useState<BoardSizeId>("standard")
  const [style, setStyle] = useState<StyleId>("standard")
  const [inkId, setInkId] = useState(INKS[0].id)
  const [fonts, setFonts] = useState<Fonts | null>(null)
  const [logo, setLogo] = useState<HTMLImageElement | null>(null)
  const [status, setStatus] = useState("Sorting the letters...")
  const [saving, setSaving] = useState(false)
  const [can, setCan] = useState({ share: false, copy: false })
  const [copyLabel, setCopyLabel] = useState("Copy Image")

  const ink = INKS.find((c) => c.id === inkId) ?? INKS[0]
  const boardDims = BOARD_SIZES.find((b) => b.id === size) ?? BOARD_SIZES[0]

  // Resolve the next/font families off their CSS variables (app/signs/
  // layout.tsx sets them) and wait for the letter font and the logo to load, so
  // the first canvas paint is in Anton and carries the logo.
  useEffect(() => {
    let alive = true
    const root = rootRef.current
    if (!root) return
    const styles = getComputedStyle(root)
    const letter = styles.getPropertyValue("--font-anton").trim() || FALLBACK_LETTER_FONT
    const ui = styles.getPropertyValue("--font-quicksand").trim() || FALLBACK_UI_FONT
    const ready = async () => {
      const logoLoad = loadImage(LOGO.src)
      try {
        await document.fonts.load(letterFontSpec(40, letter))
      } catch {
        // Some browsers reject a multi-family shorthand; fonts.ready still resolves.
      }
      try {
        await document.fonts.ready
      } catch {}
      const img = await logoLoad
      if (!alive) return
      setLogo(img)
      setFonts({ letter, ui })
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
      inkHex: ink.hex,
      letterFont: fonts?.letter ?? FALLBACK_LETTER_FONT,
      uiFont: fonts?.ui ?? FALLBACK_UI_FONT,
      logo,
    }),
    [phrase, size, style, ink.hex, fonts, logo],
  )

  // Debounced preview render. Fires signs_render once per distinct
  // phrase+settings so typing a sentence counts as one render, not twenty.
  useEffect(() => {
    if (!fonts) return
    if (renderTimer.current) window.clearTimeout(renderTimer.current)
    renderTimer.current = window.setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const opts = currentOptions()
      const result = drawSign(canvas, opts, 1)

      if (!opts.phrase.trim()) {
        setStatus("Type a phrase to put it up on the board.")
        return
      }
      setStatus(
        result.overflow
          ? "That is a lot of letters for one board. Shorten it or try the Long board."
          : `${result.lineCount} of ${result.railsTotal} rails, ${STYLES[opts.style].label.toLowerCase()}`,
      )

      const key = [opts.phrase.trim(), opts.size, opts.style, inkId].join("|")
      if (key !== lastTrackedRef.current) {
        lastTrackedRef.current = key
        trackEvent("signs_render", {
          board: opts.size,
          style: opts.style,
          ink: inkId,
          lines: result.lineCount,
          rails: result.railsTotal,
          chars: opts.phrase.trim().length,
        })
      }
    }, RENDER_DEBOUNCE_MS)
    return () => {
      if (renderTimer.current) window.clearTimeout(renderTimer.current)
    }
  }, [fonts, currentOptions, inkId])

  // Which ways out this browser has. Probed after mount so the server render
  // and the first client render agree.
  useEffect(() => {
    const probe = new File([new Blob([], { type: "image/png" })], "probe.png", { type: "image/png" })
    setCan({
      share: "share" in navigator && "canShare" in navigator && navigator.canShare({ files: [probe] }),
      copy: typeof ClipboardItem !== "undefined" && !!navigator.clipboard?.write,
    })
  }, [])

  // The 2x export, named for the phrase, so the file and the share sheet's
  // title (which Messages puts in as text) say what the sign says, not "Sign".
  const exportSign = useCallback(() => {
    const opts = currentOptions()
    const out = document.createElement("canvas")
    drawSign(out, opts, EXPORT_SCALE)
    const phraseText = opts.phrase.trim().replace(/\s+/g, " ")
    const slug = phraseText
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/, "")
    return {
      name: `amy-tangerine-sign${slug ? `-${slug}` : ""}.png`,
      title: phraseText || "Amy Tangerine sign",
      blob: new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png")),
      eventData: { board: opts.size, style: opts.style, ink: inkId },
    }
  }, [currentOptions, inkId])

  const shareSign = useCallback(async () => {
    if (!fonts || saving) return
    setSaving(true)
    try {
      const sign = exportSign()
      const blob = await sign.blob
      if (!blob) return
      const file = new File([blob], sign.name, { type: "image/png" })
      try {
        await navigator.share({ files: [file], title: sign.title })
        trackEvent("signs_save", { method: "share", ...sign.eventData })
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return
        // The sheet was refused (the tap went stale, say): hand over the file instead.
        downloadBlob(blob, sign.name)
        trackEvent("signs_save", { method: "download", ...sign.eventData })
      }
    } finally {
      setSaving(false)
    }
  }, [fonts, saving, exportSign])

  const copySign = useCallback(async () => {
    if (!fonts) return
    const sign = exportSign()
    // Safari only allows the write inside the tap itself, so the image goes in
    // as a promise rather than being awaited first.
    const png = sign.blob.then((b) => {
      if (!b) throw new Error("No image to copy")
      return b
    })
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })])
      setCopyLabel("Copied")
      trackEvent("signs_save", { method: "copy", ...sign.eventData })
    } catch {
      setCopyLabel("Could not copy")
    }
    window.setTimeout(() => setCopyLabel("Copy Image"), 2000)
  }, [fonts, exportSign])

  const downloadSign = useCallback(async () => {
    if (!fonts || saving) return
    setSaving(true)
    try {
      const sign = exportSign()
      const blob = await sign.blob
      if (!blob) return
      downloadBlob(blob, sign.name)
      trackEvent("signs_save", { method: "download", ...sign.eventData })
    } finally {
      setSaving(false)
    }
  }, [fonts, saving, exportSign])

  const reset = useCallback(() => {
    setPhrase(DEFAULT_PHRASE)
    setSize("standard")
    setStyle("standard")
    setInkId(INKS[0].id)
  }, [])

  return (
    <div className="sg-root" ref={rootRef}>
      <div className="sg-container">
        <header className="sg-header">
          <h1 className="sg-title">Sign Maker</h1>
          <p className="sg-tagline">Type a phrase. It goes up on the board, one letter at a time. Save it for stickers.</p>
        </header>

        <div className="sg-board-wrap">
          <canvas
            ref={canvasRef}
            className="sg-canvas"
            width={boardDims.width}
            height={boardDims.height}
            style={{ aspectRatio: `${boardDims.width} / ${boardDims.height}` }}
            aria-label={phrase ? `Letter-board sign reading: ${phrase}` : "Blank letter-board sign"}
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
            <span className="sg-label">Style</span>
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
            <div className="sg-row" role="group" aria-label="Letter colour">
              {INKS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`sg-swatch${inkId === c.id ? " sg-active" : ""}`}
                  style={{ background: c.hex }}
                  title={c.label}
                  aria-label={c.label}
                  aria-pressed={inkId === c.id}
                  onClick={() => setInkId(c.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="sg-actions">
          {can.share ? (
            <button type="button" className="sg-btn" onClick={shareSign} disabled={!fonts || saving}>
              {saving ? "Sharing..." : "Share"}
            </button>
          ) : can.copy ? (
            <button type="button" className="sg-btn" onClick={copySign} disabled={!fonts}>
              {copyLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={`sg-btn${can.share || can.copy ? " sg-secondary" : ""}`}
            onClick={downloadSign}
            disabled={!fonts || saving}
          >
            Download PNG
          </button>
          <button type="button" className="sg-btn sg-secondary" onClick={reset}>
            Start Over
          </button>
        </div>
        <p className="sg-note">
          {can.share
            ? "Share sends the sign straight to a text, an email or AirDrop, no download. "
            : can.copy
              ? "Copy Image puts the sign on your clipboard to paste into a message. "
              : ""}
          Download saves it at {boardDims.width * EXPORT_SCALE} x {boardDims.height * EXPORT_SCALE} px, ready for
          sticker printing.
        </p>
      </div>
    </div>
  )
}
