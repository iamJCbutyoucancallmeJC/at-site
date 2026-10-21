// One postage stamp per envelope received. Pure SVG, no client JS.
//
// The stamp is white paper with a perforated edge (the perforation circles are
// filled with the page ground, so the stamp must sit on a tinted ground), a
// colored month panel inside, the month in Amy's brush hand, a small motif,
// a "13" denomination (the $13 monthly price, the way a stamp carries cents),
// and a postmark struck over the corner with the day the envelope was mailed.
//
// Month colors stay inside Amy's brand: her orange and teal carry the year's
// two poles, the rest are warm paper tones that read as a set on one page.

import { mailedLabel, shortMonth } from "@/lib/passport"

const GROUND = "#FFF5FA" // --color-orange-light, the passport page ground

const MONTH_COLOR: Record<number, string> = {
  1: "#8CC4E8", 2: "#F4A3C0", 3: "#A9D18E", 4: "#F9D976", 5: "#F7B7D2", 6: "#FD891C",
  7: "#F47C63", 8: "#FFC46B", 9: "#D59A64", 10: "#EF8A3C", 11: "#C2A27C", 12: "#00ADB3",
}

// Motifs, one per month, drawn in a 40x40 box. Kept simple so they print.
function Motif({ month }: { month: number }) {
  const ink = "rgba(0,0,0,0.55)"
  switch (month) {
    case 2: // heart
      return <path d="M20 34 L6 20 A8 8 0 0 1 20 10 A8 8 0 0 1 34 20 Z" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    case 3:
    case 4: // flower
      return (
        <g fill="none" stroke={ink} strokeWidth="2.5">
          <circle cx="20" cy="20" r="4" />
          <circle cx="20" cy="9" r="5" /><circle cx="31" cy="20" r="5" /><circle cx="20" cy="31" r="5" /><circle cx="9" cy="20" r="5" />
        </g>
      )
    case 6:
    case 7: // sun
      return (
        <g stroke={ink} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <circle cx="20" cy="20" r="7" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180
            return <line key={a} x1={20 + Math.cos(r) * 11} y1={20 + Math.sin(r) * 11} x2={20 + Math.cos(r) * 15} y2={20 + Math.sin(r) * 15} />
          })}
        </g>
      )
    case 9:
    case 10:
    case 11: // leaf
      return (
        <g fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round">
          <path d="M8 32 C8 14 20 8 32 8 C32 22 24 32 8 32 Z" />
          <path d="M8 32 L26 14" />
        </g>
      )
    case 12: // star
      return <path d="M20 5 L24.5 15.5 L36 16.5 L27.5 24 L30 35 L20 29 L10 35 L12.5 24 L4 16.5 L15.5 15.5 Z" fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
    default: // envelope
      return (
        <g fill="none" stroke={ink} strokeWidth="2.5" strokeLinejoin="round">
          <rect x="5" y="10" width="30" height="21" rx="2" />
          <path d="M5 12 L20 23 L35 12" />
        </g>
      )
  }
}

function Perforation() {
  // Circles along each edge, filled with the page ground: the classic die-cut.
  const dots: { x: number; y: number }[] = []
  const step = 14
  for (let x = 7; x <= 193; x += step) { dots.push({ x, y: 0 }); dots.push({ x, y: 240 }) }
  for (let y = 7; y <= 233; y += step) { dots.push({ x: 0, y }); dots.push({ x: 200, y }) }
  return (
    <g fill={GROUND}>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="5" />)}
    </g>
  )
}

export function Stamp({
  month,
  mailed,
  cycle,
  brushClass,
}: {
  month: string
  mailed: string | null
  cycle: number | null
  brushClass: string
}) {
  const m = Number(month.split("-")[1])
  const year = month.split("-")[0]
  const color = MONTH_COLOR[m] ?? "#FD891C"
  const postmark = mailedLabel(mailed)
  const title = postmark ? `${shortMonth(month)} ${year}, mailed ${postmark}` : `${shortMonth(month)} ${year}`

  return (
    <svg viewBox="0 0 200 240" width="100%" role="img" aria-label={title} className="hm-stamp">
      <title>{title}</title>
      {/* stamp paper */}
      <rect x="0" y="0" width="200" height="240" fill="#fff" />
      <Perforation />
      {/* the month panel */}
      <rect x="16" y="16" width="168" height="208" fill={color} />
      <rect x="22" y="22" width="156" height="196" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      {/* denomination */}
      <text x="162" y="52" textAnchor="end" fontFamily="var(--font-sans)" fontWeight="800" fontSize="22" fill="rgba(0,0,0,0.6)">13</text>
      <text x="162" y="64" textAnchor="end" fontFamily="var(--font-sans)" fontWeight="600" fontSize="8" letterSpacing="1.5" fill="rgba(0,0,0,0.55)">HAPPY MAIL</text>
      {/* motif */}
      <g transform="translate(36 36)"><Motif month={m} /></g>
      {/* the month, in Amy's hand */}
      <text x="100" y="152" textAnchor="middle" className={brushClass} fontSize="64" fill="#fff">{shortMonth(month)}</text>
      <text x="100" y="196" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="18" letterSpacing="3" fill="rgba(0,0,0,0.6)">{year}</text>
      {cycle ? (
        <text x="38" y="206" fontFamily="var(--font-sans)" fontWeight="600" fontSize="8" letterSpacing="1.5" fill="rgba(0,0,0,0.45)">NO. {cycle}</text>
      ) : null}
      {/* postmark */}
      {postmark ? (
        <g transform="translate(154 200) rotate(-14)" opacity="0.78">
          <circle cx="0" cy="0" r="30" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          <text x="0" y="-5" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="7" fill="#1a1a1a">MAILED</text>
          <text x="0" y="5" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="7.5" fill="#1a1a1a">{postmark.toUpperCase()}</text>
          <text x="0" y="14" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="600" fontSize="5.5" letterSpacing="0.6" fill="#1a1a1a">CULVER CITY CA</text>
          <g stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round">
            <path d="M34 -12 q8 -4 16 0 q8 4 16 0" fill="none" />
            <path d="M34 -2 q8 -4 16 0 q8 4 16 0" fill="none" />
            <path d="M34 8 q8 -4 16 0 q8 4 16 0" fill="none" />
          </g>
        </g>
      ) : null}
    </svg>
  )
}

export function EmptySlot({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="hm-slot" aria-label={`${label}: ${sub}`}>
      <svg viewBox="0 0 200 240" width="100%" aria-hidden="true">
        <rect x="8" y="8" width="184" height="224" rx="4" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" strokeDasharray="6 6" />
        <g transform="translate(80 92)" opacity="0.35">
          <rect x="5" y="10" width="30" height="21" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
          <path d="M5 12 L20 23 L35 12" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
        </g>
        <text x="100" y="160" textAnchor="middle" fontFamily="var(--font-sans)" fontWeight="700" fontSize="14" fill="rgba(0,0,0,0.55)">{label}</text>
        <text x="100" y="180" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fill="rgba(0,0,0,0.5)">{sub}</text>
      </svg>
    </div>
  )
}
