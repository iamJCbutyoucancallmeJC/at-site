import Image from "next/image"
import TrackableLink from "@/components/trackable-link"
import type { AnalyticsEvent } from "@/lib/analytics"

// PromoCard (design finish, Phase 1 · 2026-10-25): the module that promotes one
// thing with one button. Words left, a real photograph right (40%), on paper;
// Happy Mail's card sits on the pink (orange-light) so pink keeps meaning the
// envelope. Replaces the full-bleed orange strip and the dark photo banners.
// On phones it stacks: picture first, words under, button full width.

export default function PromoCard({
  eyebrow,
  title,
  text,
  cta,
  image,
  tone = "paper",
  button = "primary",
}: {
  eyebrow: string
  title: string
  text: string
  cta: { href: string; label: string; event: AnalyticsEvent; eventData: Record<string, string | number> }
  image: { src: string; alt: string; position?: string }
  tone?: "paper" | "pink"
  button?: "primary" | "secondary"
}) {
  const bg = tone === "pink" ? "var(--color-orange-light)" : "var(--color-paper)"
  const buttonClass =
    button === "primary"
      ? "cta-primary w-full md:w-auto"
      : "inline-flex items-center justify-center w-full md:w-auto px-8 py-[1.15rem] rounded-full text-[15px] font-bold uppercase tracking-[0.08em] leading-[1.3] border-[1.5px] transition-colors hover:bg-white"
  const buttonStyle = button === "primary" ? undefined : { color: "var(--color-ink)", borderColor: "var(--color-ink)" }

  return (
    <div
      className="grid md:grid-cols-[1fr_40%] gap-5 md:gap-8 items-center rounded-2xl p-6 md:p-8"
      style={{ background: bg }}
    >
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden md:order-2">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          style={image.position ? { objectPosition: image.position } : undefined}
          sizes="(max-width: 768px) 100vw, 40vw"
        />
      </div>
      <div className="md:order-1 min-w-0">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] leading-tight mb-2" style={{ color: "var(--color-orange-ink)" }}>
          {eyebrow}
        </p>
        <h3 className="text-[22px] font-bold leading-[1.25] mb-2" style={{ color: "var(--color-ink)" }}>
          {title}
        </h3>
        <p className="text-[16px] leading-relaxed mb-5 max-w-[42rem]" style={{ color: "var(--color-ink)" }}>
          {text}
        </p>
        <TrackableLink
          href={cta.href}
          event={cta.event}
          eventData={cta.eventData}
          className={buttonClass}
          style={buttonStyle}
        >
          {cta.label}
        </TrackableLink>
      </div>
    </div>
  )
}
