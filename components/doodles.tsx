// Hand-drawn SVG accent elements for the Amy Tangerine brand.
// These should feel like quick pen doodles — organic, not polished.

export function TangerineDoodle({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="11" r="8" fill="#FD891C" opacity="0.85" />
      <path d="M10 3C10 3 11.5 1 13 1.5" stroke="#00ADB3" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 4C9 4 8 2.5 8.5 1" stroke="#00ADB3" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export function SquigglyUnderline({ className = "", color = "#FD891C" }: { className?: string; color?: string }) {
  return (
    <svg width="120" height="8" viewBox="0 0 120 8" fill="none" className={className} preserveAspectRatio="none">
      <path
        d="M1 5C8 1 15 7 22 3C29 -1 36 7 43 3C50 -1 57 7 64 3C71 -1 78 7 85 3C92 -1 99 7 106 3C113 -1 119 5 119 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

export function StarBurst({ className = "", color = "#FD891C" }: { className?: string; color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M7 0.5L8.5 5L13.5 7L8.5 9L7 13.5L5.5 9L0.5 7L5.5 5L7 0.5Z"
        fill={color}
        opacity="0.7"
      />
    </svg>
  )
}

export function EnvelopeDoodle({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none" className={className}>
      <rect x="1.5" y="1.5" width="25" height="19" rx="3" stroke="#FD891C" strokeWidth="2" opacity="0.6" />
      <path d="M2 2L14 12L26 2" stroke="#FD891C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <path d="M20 14C20 14 21 13 22 13.5C23 14 22.5 15.5 20 17C17.5 15.5 17 14 18 13.5C19 13 20 14 20 14Z" fill="#FD891C" opacity="0.5" />
    </svg>
  )
}

export function HeartDoodle({ className = "", color = "#FD891C" }: { className?: string; color?: string }) {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" className={className}>
      <path
        d="M9 15C9 15 1 10 1 5.5C1 3 3 1 5.5 1C7 1 8.5 2 9 3.5C9.5 2 11 1 12.5 1C15 1 17 3 17 5.5C17 10 9 15 9 15Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill={color}
        fillOpacity="0.15"
      />
    </svg>
  )
}
