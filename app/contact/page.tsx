import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import PromoCard from "@/components/promo-card"

export const metadata = {
  title: "Contact | Amy Tangerine",
  description:
    "Reach Amy Tangerine. Email for business and partnerships, or follow along on social.",
}

const SOCIAL = [
  {
    label: "Instagram",
    handle: "@amytangerine",
    href: "https://instagram.com/amytangerine",
  },
  {
    label: "YouTube",
    handle: "@amytangerine",
    href: "https://youtube.com/@amytangerine",
  },
  {
    label: "Pinterest",
    handle: "amytangerine",
    href: "https://pinterest.com/amytangerine",
  },
  {
    label: "TikTok",
    handle: "@amytangerine",
    href: "https://tiktok.com/@amytangerine",
  },
]

export default function ContactPage() {
  return (
    <>
      <PageEngagementTracker page="contact" />

      {/* ── Hero ── */}
      <section
        className="py-20 md:py-28 px-6 md:px-16 text-center"
        style={{ background: "var(--color-paper)" }}
      >
        <p
          className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-4"
          style={{ color: "var(--color-orange-ink)" }}
        >
          Say Hello
        </p>
        <h1
          className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-tight mb-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          Get in touch.
        </h1>
        <p
          className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          The fastest way to reach Amy is on Instagram. For orders, Happy Mail,
          and anything about a purchase, or for business, partnerships, and
          press, email works best.
        </p>
      </section>

      {/* ── Email block ── */}
      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-[24px] md:text-[28px] font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            Email
          </h2>

          {/* Customer service: orders, Happy Mail, anything about a purchase */}
          <p
            className="text-[15px] mb-3 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Questions about an order, Happy Mail, or a purchase:
          </p>
          <TrackableLink
            href="mailto:help@amytangerine.com"
            event="external_link"
            eventData={{ destination: "email", email_type: "cs", source_page: "contact" }}
            className="inline-block text-[20px] md:text-[24px] font-semibold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-orange-ink)" }}
          >
            help@amytangerine.com
          </TrackableLink>

          {/* Business: proposals, press, wholesale, partnerships, Amy access */}
          <p
            className="text-[15px] mb-3 mt-12 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Collabs, press, wholesale, or partnerships:
          </p>
          <TrackableLink
            href="mailto:hello@amytangerine.com"
            event="external_link"
            eventData={{ destination: "email", email_type: "business", source_page: "contact" }}
            className="inline-block text-[20px] md:text-[24px] font-semibold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-orange-ink)" }}
          >
            hello@amytangerine.com
          </TrackableLink>
        </div>
      </section>

      {/* ── Social block ── */}
      <section
        className="py-16 md:py-20 px-6 md:px-16"
        style={{ background: "var(--color-paper)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-[24px] md:text-[28px] font-bold mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Follow along
          </h2>
          <p
            className="text-[15px] mb-10 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Daily creative life, behind-the-scenes, and new project drops.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            {SOCIAL.map(({ label, handle, href }) => (
              <TrackableLink
                key={label}
                href={href}
                event="external_link"
                eventData={{ destination: label.toLowerCase(), source_page: "contact" }}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-secondary cta--compact"
              >
                {label}{" "}
                <span style={{ opacity: 0.7, marginLeft: "0.4em" }}>{handle}</span>
              </TrackableLink>
            ))}
          </div>
        </div>
      </section>

      {/* ── Happy Mail CTA (design finish Phase 1, 2026-10-28: the shared PromoCard on
          the pink, in place of the full-bleed orange band; copy unchanged) ── */}
      <section className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <PromoCard
            tone="pink"
            heading="h2"
            eyebrow="The good kind of mail"
            title="Get Happy Mail from Amy."
            text="Once a month, a package arrives — die cuts, stickers, and a personal note. The good kind of mail."
            cta={{
              href: "/happy-mail",
              label: "Learn more",
              event: "hero_cta_click",
              eventData: { cta_text: "Contact Happy Mail CTA", destination: "/happy-mail", page: "contact" },
            }}
            image={{ src: "/images/happy-mail/envelopes/2026-04.jpg", alt: "The April 2026 Happy Mail envelope and what came in it" }}
          />
        </div>
      </section>
    </>
  )
}
