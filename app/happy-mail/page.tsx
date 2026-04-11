// Happy Mail landing page
// Copy source: A5 Job/Linslow/Clients/Amy Tangerine/happy-mail-landing-copy.md
// Design: matches D3 editorial system — teal/orange, Epilogue, full-bleed sections
// Photos: placeholders until Amy provides styled shots (June 2026)

import type { Metadata } from "next"
import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"
import NewsletterForm from "@/components/newsletter-form"
import FaqAccordion from "@/components/faq-accordion"

export const metadata: Metadata = {
  title: "Happy Mail Subscription | Amy Tangerine",
  description:
    "Monthly craft supplies from Amy Tangerine — die cuts, stickers, and a hand-lettered envelope. $13/month or $66 for 6 months. Cancel anytime. US only.",
  openGraph: {
    title: "Happy Mail — Monthly Craft Subscription | Amy Tangerine",
    description:
      "Once a month, an envelope from Amy. Die cuts, stickers, and a personal note — your name hand-lettered on the front.",
    images: [{ url: "/images/products/happy-mail/1.jpg" }],
  },
}

const WHAT_INSIDE = [
  {
    title: "Your name, hand-lettered by Amy",
    body: "The envelope arrives addressed in Amy's handwriting. Not printed. Actually hand-lettered.",
    img: "/images/products/happy-mail/2.jpg",
  },
  {
    title: "Die cuts Amy designed, made in the USA",
    body: "New designs every month. Exclusively for subscribers — not available in the shop.",
    img: "/images/products/juicybitsstickers-happyedition/1.jpg",
  },
  {
    title: "First look at the newest sticker sheet",
    body: "Subscribers get it before anyone else. Often before it's even listed.",
    img: "/images/products/hearthealinghappiness-sticker-book/2.jpg",
  },
  {
    title: "A note from Amy",
    body: "What she's making, what she's loving, what's on her mind. Personal. Not a newsletter.",
    img: "/images/products/happy-mail/3.jpg",
  },
]

// Past months gallery — placeholders until Amy provides real package shots
const GALLERY_IMAGES = [
  { src: "/images/products/happy-mail/1.jpg", alt: "Happy Mail package" },
  { src: "/images/products/happy-mail/2.jpg", alt: "Hand-lettered envelope" },
  { src: "/images/products/juicybitsstickers-happyedition/2.jpg", alt: "Die cuts" },
  { src: "/images/products/juicybitsstickers-cozyedition/1.jpg", alt: "Sticker bundle" },
  { src: "/images/products/mini-kit-embellishments/1.jpg", alt: "Embellishments" },
  { src: "/images/products/hearthealinghappiness-sticker-book/3.jpg", alt: "Sticker book pages" },
]

// Testimonials — placeholders until Amy pulls from Instagram DMs/comments
const TESTIMONIALS = [
  {
    quote: "I literally squealed when it arrived. The hand-lettering detail is unreal.",
    name: "Sarah K.",
    location: "Portland, OR",
  },
  {
    quote: "I've tried other subscription boxes. Nothing comes close to getting actual mail from Amy.",
    name: "Melissa T.",
    location: "Austin, TX",
  },
  {
    quote: "The die cuts are exclusively for subscribers and they're always my favorites. Worth every penny.",
    name: "Rachel B.",
    location: "Chicago, IL",
  },
  {
    quote: "I gave this as a gift and my mom calls me every month when it arrives. She loves it.",
    name: "Jess M.",
    location: "Nashville, TN",
  },
]

const FAQ_ITEMS = [
  {
    q: "What's the difference between Monthly and 6-Month?",
    a: "Monthly ($13/mo) renews automatically each month until you cancel. 6-Month ($66) is a one-time payment for six months — no recurring charges. Both get the same monthly package.",
  },
  {
    q: "When does it ship?",
    a: "Around the 15th of each month. You'll get it like a letter from a friend — USPS first-class, no tracking number, usually arrives within a week.",
  },
  {
    q: "Are the contents available in your shop?",
    a: "Nope. Happy Mail goodies are subscriber-exclusive. That's part of the deal.",
  },
  {
    q: "Can I send it as a gift?",
    a: "Yes. At checkout, enter your recipient's shipping address. The 6-Month option is the most popular gift choice — they'll get mail from Amy for half a year.",
  },
  {
    q: "How do I cancel?",
    a: "Email hello@amytangerine.com. No questions asked. Just let us know before the 10th of the month and your cancellation takes effect that month. After the 10th, it takes effect the following month.",
  },
  {
    q: "What if my mail doesn't arrive?",
    a: "If you haven't received it by the 25th, email hello@amytangerine.com and we'll sort it out.",
  },
  {
    q: "Do you ship internationally?",
    a: "Not yet — US only for now.",
  },
]

// Shared subscribe CTAs — used in hero and bottom band
function SubscribeCTAs({
  variant = "dark",
}: {
  variant?: "dark" | "light"
}) {
  const primaryStyle =
    variant === "dark"
      ? {
          background: "var(--color-orange)",
          color: "#fff",
          border: "2px solid var(--color-orange)",
        }
      : {
          background: "#fff",
          color: "var(--color-orange)",
          border: "2px solid #fff",
        }
  const secondaryStyle =
    variant === "dark"
      ? {
          background: "transparent",
          color: "var(--color-orange)",
          border: "2px solid var(--color-orange)",
        }
      : {
          background: "transparent",
          color: "#fff",
          border: "2px solid rgba(255,255,255,0.7)",
        }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <TrackableLink
        href="/shop/happy-mail"
        event="hm_subscribe_click"
        eventData={{ plan: "monthly", price: "13.00", page: "happy-mail" }}
        className="inline-block px-7 py-3.5 text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full text-center transition-all duration-300 hover:opacity-90"
        style={primaryStyle}
      >
        Subscribe Monthly — $13/mo
      </TrackableLink>
      <TrackableLink
        href="/shop/happy-mail-6-month"
        event="hm_subscribe_click"
        eventData={{ plan: "6-month", price: "66.00", page: "happy-mail" }}
        className="inline-block px-7 py-3.5 text-[13px] uppercase tracking-[0.1em] font-semibold rounded-full text-center transition-all duration-300 hover:opacity-80"
        style={secondaryStyle}
      >
        Get 6 Months — $66
      </TrackableLink>
    </div>
  )
}

export default function HappyMailPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="happy-mail" />

      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] md:min-h-[75vh] flex flex-col md:flex-row">
        {/* Left: Copy */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-16 py-16 md:py-20 order-2 md:order-1">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Monthly Subscription
          </p>
          <h1
            className="text-[40px] md:text-[56px] lg:text-[64px] font-bold leading-[1.05] tracking-tight mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Let me send
            <br />
            you mail.
          </h1>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-8 max-w-md"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Once a month, a package from me — die cuts, stickers, and a personal
            note. Your name, hand-lettered on the envelope. The good kind of mail.
          </p>

          <SubscribeCTAs variant="dark" />

          <p
            className="mt-4 text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Cancel anytime · Ships around the 15th · US only · Limited spots
          </p>
        </div>

        {/* Right: Image */}
        <div className="relative flex-1 min-h-[50vw] md:min-h-0 order-1 md:order-2">
          <Image
            src="/images/products/happy-mail/1.jpg"
            alt="Happy Mail envelope from Amy Tangerine"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 md:bg-gradient-to-r md:from-white/10 md:to-transparent" />
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section
        id="subscribe"
        className="py-12 md:py-16 px-4 md:px-10"
        style={{ background: "var(--color-gray-light)" }}
      >
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-8"
          style={{ color: "var(--color-text-primary)" }}
        >
          Choose your plan
        </h2>
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Monthly */}
          <div
            className="rounded-2xl p-6 border"
            style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Monthly
            </p>
            <div className="flex items-end gap-1 mb-1">
              <span
                className="text-[44px] font-bold leading-none"
                style={{ color: "var(--color-text-primary)" }}
              >
                $13
              </span>
              <span
                className="text-[14px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                /month
              </span>
            </div>
            <p className="text-[12px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
              Renews monthly · cancel anytime
            </p>
            <TrackableLink
              href="/shop/happy-mail"
              event="hm_subscribe_click"
              eventData={{ plan: "monthly", price: "13.00", source: "pricing-card", page: "happy-mail" }}
              className="block w-full py-3 text-center text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 transition-all duration-300 hover:opacity-80"
              style={{
                borderColor: "var(--color-orange)",
                color: "var(--color-orange)",
              }}
            >
              Subscribe Monthly
            </TrackableLink>
          </div>

          {/* 6 Months */}
          <div
            className="rounded-2xl p-6 border-2 relative"
            style={{ background: "var(--color-white)", borderColor: "var(--color-orange)" }}
          >
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] uppercase tracking-[0.12em] font-bold rounded-full text-white"
              style={{ background: "var(--color-teal)" }}
            >
              Best value
            </span>
            <p
              className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-3"
              style={{ color: "var(--color-orange)" }}
            >
              6 Months
            </p>
            <div className="flex items-end gap-1 mb-1">
              <span
                className="text-[44px] font-bold leading-none"
                style={{ color: "var(--color-text-primary)" }}
              >
                $66
              </span>
              <span
                className="text-[14px] mb-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                one payment
              </span>
            </div>
            <p className="text-[12px] mb-1" style={{ color: "var(--color-teal)" }}>
              Save $12 vs. monthly
            </p>
            <p className="text-[12px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
              No recurring charge · great as a gift
            </p>
            <TrackableLink
              href="/shop/happy-mail-6-month"
              event="hm_subscribe_click"
              eventData={{ plan: "6-month", price: "66.00", source: "pricing-card", page: "happy-mail" }}
              className="block w-full py-3 text-center text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full text-white transition-all duration-300 hover:opacity-90"
              style={{ background: "var(--color-orange)" }}
            >
              Get 6 Months — $66
            </TrackableLink>
          </div>
        </div>
      </section>

      {/* ── What's Inside ── */}
      <section className="py-12 md:py-16 px-4 md:px-10">
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Every month, you get:
        </h2>
        <p
          className="text-center text-[14px] mb-8 md:mb-10"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Four things, assembled and sent with care.
        </p>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {WHAT_INSIDE.map((item, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="relative aspect-square">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h3
                  className="text-[13px] font-semibold mb-1.5 leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </h3>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section
        className="py-12 md:py-16 px-4 md:px-10"
        style={{ background: "var(--color-teal)" }}
      >
        <h2 className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-8 md:mb-10 text-white">
          Simple as it gets.
        </h2>
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          {[
            {
              n: "1",
              title: "Subscribe today",
              body: "Choose monthly or 6 months. You're in. We lock in your spot.",
            },
            {
              n: "2",
              title: "We prep your envelope",
              body: "Around the 10th, Amy hand-letters your name. We assemble your package with that month's goodies.",
            },
            {
              n: "3",
              title: "It arrives mid-month",
              body: "Delivered like a letter from a friend — USPS first-class, right to your door around the 15th.",
            },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 items-start">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px] flex-shrink-0 border-2 border-white/40"
                style={{ color: "white" }}
              >
                {step.n}
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white mb-0.5">{step.title}</p>
                <p className="text-[13px] text-white/75 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Past Months Gallery ── */}
      <section className="py-12 md:py-16">
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold px-4 md:px-10 mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          A few recent months:
        </h2>
        <p className="text-[13px] px-4 md:px-10 mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Every month is different. That's the point.
        </p>
        <div
          className="flex gap-3 overflow-x-auto px-4 md:px-10 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-52 h-52 md:w-64 md:h-64 rounded-xl overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section
        className="py-12 md:py-16 px-4 md:px-10"
        style={{ background: "var(--color-gray-light)" }}
      >
        <h2
          className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-8 md:mb-10"
          style={{ color: "var(--color-text-primary)" }}
        >
          From the mailbox:
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-xl p-5 flex flex-col"
              style={{ background: "var(--color-white)", border: "1px solid var(--color-border)" }}
            >
              <p
                className="text-[13px] leading-relaxed flex-1 mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p
                  className="text-[12px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {t.name}
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                  {t.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mid-page CTA strip ── */}
      <section
        className="py-5 px-4 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-y"
        style={{
          background: "var(--color-orange)",
          borderColor: "var(--color-orange)",
        }}
      >
        <p className="text-[14px] md:text-[15px] font-semibold text-white text-center sm:text-left">
          287 subscribers are already getting Happy Mail. Join them.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <TrackableLink
            href="/shop/happy-mail"
            event="hm_subscribe_click"
            eventData={{ plan: "monthly", source: "mid-page-strip", page: "happy-mail" }}
            className="px-5 py-2.5 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full bg-white transition-opacity hover:opacity-90"
            style={{ color: "var(--color-orange)" }}
          >
            Monthly — $13
          </TrackableLink>
          <TrackableLink
            href="/shop/happy-mail-6-month"
            event="hm_subscribe_click"
            eventData={{ plan: "6-month", source: "mid-page-strip", page: "happy-mail" }}
            className="px-5 py-2.5 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full border-2 border-white text-white transition-opacity hover:opacity-80"
          >
            6 Months — $66
          </TrackableLink>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 md:py-16 px-4 md:px-10">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            Questions?
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section
        className="py-10 md:py-14 px-4 md:px-10"
        style={{ background: "var(--color-gray-light)" }}
      >
        <div className="max-w-md mx-auto text-center">
          <h2
            className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Not ready to subscribe?
          </h2>
          <p className="text-[13px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
            Get on the list. We'll send new arrivals, restocks, and the occasional
            behind-the-scenes look at what Amy's making.
          </p>
          <NewsletterForm sourcePage="happy-mail" />
        </div>
      </section>

      {/* ── Bottom CTA Band ── */}
      <section
        className="py-16 md:py-20 px-4 md:px-10 text-center"
        style={{ background: "var(--color-teal)" }}
      >
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-3">
          Monthly Subscription
        </p>
        <h2 className="text-[32px] md:text-[44px] font-bold text-white leading-tight mb-4">
          Ready to get happy mail?
        </h2>
        <p className="text-[15px] text-white/75 mb-8 max-w-md mx-auto leading-relaxed">
          Join 287 subscribers already getting a monthly package from Amy.
          First one ships around the 15th.
        </p>

        <SubscribeCTAs variant="light" />

        <p className="mt-5 text-[12px] text-white/50">
          Cancel anytime · Ships ~15th · US only
        </p>
      </section>
    </main>
  )
}
