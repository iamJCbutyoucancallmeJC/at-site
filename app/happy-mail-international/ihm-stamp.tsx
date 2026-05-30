"use client"

// IHM "AIR MAIL" rubber-stamp imprint — recreated as SVG from the red stamp baked into
// public/images/products/happy-mail-international/1.jpg (the one JC + Amy liked). Rendered
// behind the page title, slightly askew, as if stamped onto the page. No baked-in price
// (so it survives the $16->$18 move + localization). Three variants for JC/Amy to pick via
// ?stamp=1|2|3. The chosen one becomes the default; the toggle + others get removed.

const RED = "#c0392b"

// Variant 1: bold double-ruled rectangle, "AIR MAIL / INTERNATIONAL HAPPY MAIL", ~ -8deg.
// Closest to the imprint in the source image. Larger, sits behind/around the headline.
function StampV1({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 240" className={className} aria-hidden role="presentation"
      style={{ transform: "rotate(-8deg)" }}>
      <rect x="10" y="10" width="400" height="220" fill="none" stroke={RED} strokeWidth="5" rx="6" opacity="0.85" />
      <rect x="22" y="22" width="376" height="196" fill="none" stroke={RED} strokeWidth="2" rx="4" opacity="0.85" />
      <text x="210" y="70" textAnchor="middle" fill={RED} opacity="0.9"
        style={{ font: "700 26px ui-sans-serif, system-ui", letterSpacing: "6px" }}>AIR MAIL</text>
      <line x1="40" y1="90" x2="380" y2="90" stroke={RED} strokeWidth="2" opacity="0.7" />
      <text x="210" y="150" textAnchor="middle" fill={RED} opacity="0.92"
        style={{ font: "800 46px ui-sans-serif, system-ui", letterSpacing: "2px" }}>INTERNATIONAL</text>
      <text x="210" y="195" textAnchor="middle" fill={RED} opacity="0.92"
        style={{ font: "800 40px ui-sans-serif, system-ui", letterSpacing: "8px" }}>HAPPY MAIL</text>
    </svg>
  )
}

// Variant 2: circular "postmark" stamp — ring with text on top arc, "INTL" big in center,
// "HAPPY MAIL" on bottom. ~ -6deg. Reads more like a cancellation postmark than a box.
function StampV2({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 260" className={className} aria-hidden role="presentation"
      style={{ transform: "rotate(-6deg)" }}>
      <circle cx="130" cy="130" r="118" fill="none" stroke={RED} strokeWidth="5" opacity="0.85" />
      <circle cx="130" cy="130" r="104" fill="none" stroke={RED} strokeWidth="2" opacity="0.7" />
      <defs>
        <path id="topArc" d="M 38 130 A 92 92 0 0 1 222 130" fill="none" />
        <path id="botArc" d="M 222 130 A 92 92 0 0 1 38 130" fill="none" />
      </defs>
      <text fill={RED} opacity="0.9" style={{ font: "700 19px ui-sans-serif, system-ui", letterSpacing: "5px" }}>
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">AIR MAIL · INTERNATIONAL</textPath>
      </text>
      <text fill={RED} opacity="0.9" style={{ font: "700 18px ui-sans-serif, system-ui", letterSpacing: "6px" }}>
        <textPath href="#botArc" startOffset="50%" textAnchor="middle">HAPPY MAIL</textPath>
      </text>
      <text x="130" y="148" textAnchor="middle" fill={RED} opacity="0.92"
        style={{ font: "800 56px ui-sans-serif, system-ui", letterSpacing: "2px" }}>INTL</text>
    </svg>
  )
}

// Variant 3: compact angled "AIR MAIL · INTL" badge — small, tucked top-right of the headline,
// least likely to interfere with text. ~ +9deg. Lightest touch.
function StampV3({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 130" className={className} aria-hidden role="presentation"
      style={{ transform: "rotate(9deg)" }}>
      <rect x="8" y="8" width="284" height="114" fill="none" stroke={RED} strokeWidth="4" rx="10" opacity="0.85" />
      <text x="150" y="52" textAnchor="middle" fill={RED} opacity="0.9"
        style={{ font: "700 20px ui-sans-serif, system-ui", letterSpacing: "7px" }}>AIR MAIL</text>
      <line x1="32" y1="66" x2="268" y2="66" stroke={RED} strokeWidth="1.5" opacity="0.6" />
      <text x="150" y="100" textAnchor="middle" fill={RED} opacity="0.92"
        style={{ font: "800 34px ui-sans-serif, system-ui", letterSpacing: "10px" }}>INTL</text>
    </svg>
  )
}

// Variant "png": the REAL stamp art extracted from the source product image
// (public/images/happy-mail/ihm-stamp.png — the "AIR MAIL / INTL" red rubber stamp, price
// removed). This is the actual brand asset, not a recreation. Best-effort extraction; a clean
// re-export from the original design file is a post-launch task. Already tilted in the PNG.
function StampPng() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/happy-mail/ihm-stamp.png" alt="" aria-hidden className="w-full h-auto select-none" />
  )
}

export function IhmStamp({ variant }: { variant: 1 | 2 | 3 | "png" }) {
  if (variant === "png") {
    return (
      <div aria-hidden className="pointer-events-none absolute hidden md:block"
        style={{ top: "-44px", right: "0%", width: "360px", opacity: 0.5, zIndex: 0 }}>
        <StampPng />
      </div>
    )
  }
  // Positioned absolutely behind the headline, low opacity so text stays readable.
  // Each variant gets a placement tuned so it sits "askew, stamped on" without covering copy.
  if (variant === 2) {
    return (
      <div aria-hidden className="pointer-events-none absolute hidden md:block"
        style={{ top: "-18px", right: "4%", width: "200px", opacity: 0.5, zIndex: 0 }}>
        <StampV2 className="w-full h-auto" />
      </div>
    )
  }
  if (variant === 3) {
    return (
      <div aria-hidden className="pointer-events-none absolute hidden md:block"
        style={{ top: "-6px", right: "6%", width: "230px", opacity: 0.55, zIndex: 0 }}>
        <StampV3 className="w-full h-auto" />
      </div>
    )
  }
  // variant 1 (default)
  return (
    <div aria-hidden className="pointer-events-none absolute hidden md:block"
      style={{ top: "-30px", right: "2%", width: "320px", opacity: 0.42, zIndex: 0 }}>
      <StampV1 className="w-full h-auto" />
    </div>
  )
}
