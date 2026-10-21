// Happy Mail Passport data (innovation lab build, 2026-10-21; built and HELD).
//
// One stamp per envelope a subscriber has actually received, read from the
// Happy Mail ledger in the vault (fulfill logs + consumed log), never from
// charges: a charge is a promise, a mailed envelope is the stamp. The vault
// script hm-passport-export.py writes data/passport.json (gitignored: it
// carries first names). When that file is absent, data/passport.sample.json
// renders, so the branch builds anywhere.
//
// Tokens are keyed HMAC-style hashes of the Recharge subscription id with a
// local salt; the URL /passport/<token> is the subscriber's and only theirs.
// There is no lookup by email on purpose.

import fs from "node:fs"
import path from "node:path"

export type Stamp = {
  month: string // "2026-10"
  mailed: string | null // "2026-10-14" when the fulfill log has the date
  cycle: number | null
}

export type Passport = {
  token: string
  first: string
  since: string // first stamp month
  plan: "monthly" | "six-month" | null
  stamps: Stamp[]
}

type PassportFile = { generated: string; source: string; subscribers: Passport[] }

let cache: PassportFile | null = null

// The project root, found by walking up from the bundled module to the folder
// that holds package.json. process.cwd() is not reliable: `next dev <dir>`
// launched from another folder keeps that folder as cwd.
function projectRoot(): string {
  if (process.env.PASSPORT_ROOT) return process.env.PASSPORT_ROOT
  let dir = __dirname
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "package.json")) && fs.existsSync(path.join(dir, "data"))) return dir
    const up = path.dirname(dir)
    if (up === dir) break
    dir = up
  }
  return process.cwd()
}

export function loadPassports(): PassportFile {
  if (cache) return cache
  const root = projectRoot()
  const real = path.join(root, "data", "passport.json")
  const sample = path.join(root, "data", "passport.sample.json")
  const file = fs.existsSync(real) ? real : sample
  cache = JSON.parse(fs.readFileSync(file, "utf8")) as PassportFile
  return cache
}

export function getPassport(token: string): Passport | null {
  return loadPassports().subscribers.find((p) => p.token === token) ?? null
}

export function allTokens(): string[] {
  return loadPassports().subscribers.map((p) => p.token)
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

export function shortMonth(ym: string): string {
  return MONTH_NAMES[Number(ym.split("-")[1]) - 1].slice(0, 3)
}

export function mailedLabel(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split("-").map(Number)
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`
}

// The next envelope: the month after the newest stamp, shipping around the 15th.
export function nextMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number)
  const d = new Date(Date.UTC(y, m, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}
