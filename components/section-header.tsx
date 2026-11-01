import Link from "next/link"

// SectionHeader (design finish, Phase 1 · 2026-10-25): the header every section
// starts with. An optional eyebrow (the only all-caps text outside buttons), a
// real h2 in sentence case, an optional lead, and an optional trailing link.
// Left-aligned always: the centered 11-15px caps labels this replaces
// (SHOP BY CATEGORY, NEW ARRIVALS, FAN MAIL ...) were the site's template tell.
// Tokens: eyebrow orange-ink (teal-ink on class pages), heading ink, lead ink-soft.

export default function SectionHeader({
  title,
  eyebrow,
  lead,
  link,
  tone = "orange",
  as: Heading = "h2",
  className = "",
}: {
  title: string
  eyebrow?: string
  lead?: string
  link?: { href: string; label: string }
  tone?: "orange" | "teal"
  as?: "h1" | "h2" | "h3"
  className?: string
}) {
  const eyebrowColor = tone === "teal" ? "var(--color-teal-ink)" : "var(--color-orange-ink)"
  return (
    <div className={`flex items-end justify-between gap-4 mb-6 ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p
            className="text-[12px] font-bold uppercase tracking-[0.12em] leading-tight mb-2"
            style={{ color: eyebrowColor }}
          >
            {eyebrow}
          </p>
        )}
        <Heading
          className="text-[24px] md:text-[28px] font-bold leading-[1.2] tracking-[-0.01em]"
          style={{ color: "var(--color-ink)" }}
        >
          {title}
        </Heading>
        {lead && (
          <p className="mt-2 text-[16px] md:text-[18px] leading-relaxed max-w-[42rem]" style={{ color: "var(--color-ink-soft)" }}>
            {lead}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className="shrink-0 text-[16px] font-semibold underline underline-offset-[3px] pb-0.5 whitespace-nowrap hover:text-[color:var(--color-ink)] transition-colors"
          style={{ color: "var(--color-orange-ink)" }}
        >
          {link.label}
        </Link>
      )}
    </div>
  )
}
