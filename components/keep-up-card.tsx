import NewsletterForm from "@/components/newsletter-form"

// The site's one email-capture card (design critic 2026-10, F15). Restyled in
// the design finish, Phase 1 (2026-10-25): a white card with a hairline on the
// paper ground, ink text, the Join button in ink on orange. The orange panel it
// replaces is in the 10/25 changelog entry. Posts via NewsletterForm ->
// /api/newsletter -> lib/klaviyo-subscribe (same Klaviyo list + signup_source).
//
// layout="panel": the right-hand card of the homepage's About + Keep up section.
// layout="band":  a standalone paper band with the card centered (the footer,
//                  and the end of a Journal post or a class landing).
// gated: render nothing until NEXT_PUBLIC_CAPTURE_BLOCKS=1 (Amy's aesthetic-pass
// hold, t1092). The footer and the in-page blocks honour it; the homepage does not.

const CAPTURE_BLOCKS = process.env.NEXT_PUBLIC_CAPTURE_BLOCKS === "1"

export default function KeepUpCard({
  sourcePage,
  layout = "band",
  id,
  gated = false,
}: {
  sourcePage: string
  layout?: "panel" | "band"
  id?: string
  gated?: boolean
}) {
  if (gated && !CAPTURE_BLOCKS) return null
  const card = (
    <div
      id={id}
      className="rounded-2xl border p-6 md:p-8 scroll-mt-24"
      style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}
    >
      <h2 className="text-[22px] font-bold leading-[1.25] mb-1.5" style={{ color: "var(--color-ink)" }}>
        Keep up with Amy
      </h2>
      <p className="text-[16px] leading-relaxed mb-4" style={{ color: "var(--color-ink-soft)" }}>
        What she&apos;s making, right to your inbox.
      </p>
      <NewsletterForm sourcePage={sourcePage} />
    </div>
  )
  if (layout === "panel") return card
  return (
    <div
      className="px-4 md:px-10 py-12 md:py-16 border-t"
      style={{ background: "var(--color-paper)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-3xl mx-auto">{card}</div>
    </div>
  )
}
