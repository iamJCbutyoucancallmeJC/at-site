import NewsletterForm from "@/components/newsletter-form"

// The site's one email-capture card (design critic 2026-10, F15): the orange
// "Keep up with Amy" panel the homepage has carried since launch (app/page.tsx,
// 2026-04-06), wording harmonized 9/6 (t1092). The footer renders this same
// card on pages without a capture form of their own (/shop, /happy-mail, ...),
// so the site has one newsletter design instead of the orange card on the
// homepage and a black band everywhere else. Posts via NewsletterForm ->
// /api/newsletter -> lib/klaviyo-subscribe (same Klaviyo list + signup_source
// as the old footer block).
//
// layout="panel": the homepage's right-hand half of the About + Newsletter split.
// layout="band":  a standalone full-width strip (what the footer uses).

export default function KeepUpCard({
  sourcePage,
  layout = "band",
  id,
}: {
  sourcePage: string
  layout?: "panel" | "band"
  id?: string
}) {
  const panel = layout === "panel"
  return (
    <div
      id={id}
      className={
        panel
          ? "md:flex-1 px-6 md:px-10 py-8 md:py-10 rounded-none md:rounded-r-lg flex flex-col justify-center scroll-mt-24"
          : "px-6 md:px-10 py-8 md:py-10"
      }
      style={{ background: "var(--color-orange)" }}
    >
      <div className={panel ? undefined : "max-w-md mx-auto text-center"}>
        <h2 className="text-[15px] md:text-[18px] uppercase tracking-[0.12em] font-semibold mb-3 text-white">
          Keep up with Amy
        </h2>
        <p className="text-[13px] md:text-[14px] mb-3 text-white/80">
          What she&apos;s making, right to your inbox.
        </p>
        <NewsletterForm sourcePage={sourcePage} />
      </div>
    </div>
  )
}
