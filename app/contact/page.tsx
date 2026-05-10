import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

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
        style={{ background: "var(--color-gray-light)" }}
      >
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
          style={{ color: "var(--color-orange)" }}
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
          The fastest way to reach Amy is on Instagram. For business,
          partnerships, press, and Happy Mail customer service, email works
          best.
        </p>
      </section>

      {/* ── Email block ── */}
      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-[24px] md:text-[28px] font-bold mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            Email
          </h2>
          <p
            className="text-[15px] mb-6 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Business, press, partnerships, wholesale, and Happy Mail questions
            all go to:
          </p>
          <TrackableLink
            href="mailto:hello@amytangerine.com"
            event="external_link"
            eventData={{ destination: "email", source_page: "contact" }}
            className="inline-block text-[20px] md:text-[24px] font-semibold underline underline-offset-4 decoration-2 hover:opacity-70 transition-opacity"
            style={{ color: "var(--color-orange)" }}
          >
            hello@amytangerine.com
          </TrackableLink>
          <p
            className="text-[13px] mt-6 leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Subject lines that help us route faster:{" "}
            <em>Press</em>, <em>Wholesale</em>, <em>Partnership</em>,{" "}
            <em>Happy Mail</em>.
          </p>
        </div>
      </section>

      {/* ── Social block ── */}
      <section
        className="py-16 md:py-20 px-6 md:px-16"
        style={{ background: "var(--color-gray-light)" }}
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
                className="px-6 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: "var(--color-orange)",
                  color: "var(--color-orange)",
                }}
              >
                {label}{" "}
                <span style={{ opacity: 0.7, marginLeft: "0.4em" }}>{handle}</span>
              </TrackableLink>
            ))}
          </div>
        </div>
      </section>

      {/* ── Happy Mail CTA ── */}
      <section
        className="py-16 md:py-20 px-6 text-center"
        style={{ background: "var(--color-orange)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/70 mb-3">
          The good kind of mail
        </p>
        <h2 className="text-[28px] md:text-[40px] font-bold text-white leading-tight mb-4">
          Get Happy Mail from Amy.
        </h2>
        <p className="text-[15px] text-white/80 mb-8 max-w-sm mx-auto leading-relaxed">
          Once a month, a package arrives — die cuts, stickers, and a personal
          note. Your name, hand-lettered by Amy.
        </p>
        <TrackableLink
          href="/happy-mail"
          event="hero_cta_click"
          eventData={{ cta_text: "Contact Happy Mail CTA", destination: "/happy-mail", page: "contact" }}
          className="inline-block px-10 py-4 rounded-full bg-white text-[14px] font-semibold uppercase tracking-[0.1em] hover:bg-white/90 transition-all duration-200"
          style={{ color: "var(--color-orange)" }}
        >
          Learn more
        </TrackableLink>
      </section>
    </>
  )
}
