// /happy-mail/update-card — Cutover FAQ + card-update walkthrough (t664).
//
// PURPOSE: a public, no-login support page that absorbs the friction of the
// two-step (email-code) card-update flow after the Recharge cutover. NOT linked
// in the outbound re-collection email (that stays one clean CTA); this is what
// CS pastes on inbound "how do I do this?" and where a stuck customer self-serves.
//
// Walkthrough on top (5 steps, screenshot placeholders — capture fresh from the
// cleaned, frictionless-on portal). Broader cutover FAQ below (locked-policy copy).
//
// DRAFT for Amy approval. Screenshots are placeholders until captured.

import type { Metadata } from "next"
import Image from "next/image"
import FaqAccordion from "@/components/faq-accordion"

export const metadata: Metadata = {
  title: "Updating your Happy Mail card | Amy Tangerine",
  description:
    "How to re-add your payment card after the Happy Mail system move — step by step — plus answers to common questions about the change.",
  robots: { index: false, follow: false }, // support page, keep out of search
}

const PORTAL_LOGIN_URL = "https://q9x1sj-hc.myshopify.com/tools/recurring/login"

const IMG_BASE = "/images/happy-mail/update-card"

const STEPS = [
  {
    n: 1,
    title: "Open the login page",
    body: (
      <>
        Click the link in your email, or go to{" "}
        <a
          href={PORTAL_LOGIN_URL}
          className="font-semibold underline"
          style={{ color: "var(--color-orange)" }}
        >
          the Happy Mail account page
        </a>
        . You&apos;ll see a box that says &ldquo;Login.&rdquo; Enter the email address
        your subscription is under, then click{" "}
        <strong>&ldquo;Send login code.&rdquo;</strong>
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step1-login.png`, w: 1246, h: 450, alt: "The Happy Mail login screen with an email box and a Send login code button" },
  },
  {
    n: 2,
    title: "Grab your code (quickly!)",
    body: (
      <>
        We&apos;ll email you a 4-digit code right away. Look for an email from{" "}
        <strong>Amy Tangerine</strong> with the subject{" "}
        <strong>&ldquo;Amy Tangerine secure login code.&rdquo;</strong> Enter the 4
        digits on the screen.
      </>
    ),
    tip: "The code expires in about 4 minutes, so use it while it’s fresh — if it expires, just click “Send login code” again for a new one. (If you don’t see the email, check your spam or promotions folder.)",
    img: { src: `${IMG_BASE}/step2-code.png`, w: 1300, h: 450, alt: "The verification code entry screen with four digit boxes" },
  },
  {
    n: 3,
    title: "You’re in — find “Add payment method”",
    body: (
      <>
        After the code, you&apos;ll land on your subscription page
        (&ldquo;Welcome back!&rdquo;). Scroll to{" "}
        <strong>&ldquo;Shipping and payment&rdquo;</strong> and click the yellow{" "}
        <strong>&ldquo;Add payment method&rdquo;</strong> link.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step3-overview-v2.png`, w: 1824, h: 1780, alt: "The subscription portal overview with an orange arrow pointing to the Add payment method link" },
  },
  {
    n: 4,
    title: "Confirm you want to add a card",
    body: (
      <>
        A small window pops up:{" "}
        <strong>&ldquo;Add a payment method for your next order.&rdquo;</strong> Click
        the blue <strong>&ldquo;Add payment method&rdquo;</strong> button to open the
        card form.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step4-modal.png`, w: 1000, h: 480, alt: "A popup asking to add a payment method for your next order" },
  },
  {
    n: 5,
    title: "Enter your card — and you’re done",
    body: (
      <>
        Type in your card details and save. That&apos;s it &mdash; your card now shows
        under <strong>&ldquo;Shipping and payment,&rdquo;</strong> and your
        subscription will bill normally on its next date. Nothing else to do.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step5-saved.png`, w: 1882, h: 1520, alt: "The portal showing a saved card under Shipping and payment" },
  },
]

const FAQ_ITEMS = [
  {
    q: "Why do I have to re-add my card?",
    a: "We moved Happy Mail to a new system behind the scenes, so we can put our energy into the actual envelopes (which is the whole point). For security, payment cards couldn't carry over automatically — so we're asking everyone to re-add theirs once. After that, you're set; billing continues normally.",
  },
  {
    q: "Will my subscription change? Will I miss an envelope?",
    a: "No. Same envelopes, same mid-month delivery, same price. Your next envelope is already set aside. The only thing on your end is re-adding the card.",
  },
  {
    q: "What will the charge look like on my statement?",
    a: "Your Happy Mail charge will now show up as “RECHARGE * AMY TANGERINE” on your bank or card statement. That's us — same subscription, just the new system's name on the line item.",
  },
  {
    q: "What's the difference between Monthly and 6-Month?",
    a: "Monthly ($13/mo) renews automatically each month — cancel anytime and billing stops. 6-Month ($72) is a six-month commitment billed once up front, then auto-renews every 6 months. You can cancel before a renewal to stop the next term; the current six-month term isn't cancelled or refunded partway through. Both get the same monthly package, and if something's ever wrong with an order, we'll always make it right.",
  },
  {
    q: "Can I skip a month?",
    a: "Happy Mail doesn't offer skipping. Once a charge goes through, that envelope is already printed and on its way to you. If you need to stop, you can cancel anytime (see below) and billing stops going forward.",
  },
  {
    q: "How does cancelling work, and what's the timing?",
    a: "You can cancel your Monthly subscription anytime, and billing stops going forward. The one timing thing to know: once you've been billed for a month, that envelope is already in the works and on its way — cancelling takes effect for the next month. (For 6-Month subscribers: cancelling stops the next renewal; it doesn't exit the current paid six-month term.)",
  },
  {
    q: "What about refunds?",
    a: "If something's ever wrong with an order — it didn't arrive, it came damaged, it's the wrong item — tell us and we'll always make it right. We don't do change-of-mind refunds on envelopes already billed and mailed, but a real problem is always a real problem and we'll fix it. Just write help@amytangerine.com.",
  },
  {
    q: "I'd rather not deal with the card every month.",
    a: "You can switch to the 6-Month plan — same package, billed once every six months, auto-renews so you don't have to think about it. Just reply to the email we sent you and we'll set it up.",
  },
  {
    q: "I need help, or something isn't working.",
    a: "Reply to your email or write help@amytangerine.com. A real person will help you finish.",
  },
]

function StepScreenshot({ img }: { img: { src: string; w: number; h: number; alt: string } }) {
  return (
    <div
      className="mt-4 rounded-xl overflow-hidden border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <Image
        src={img.src}
        width={img.w}
        height={img.h}
        alt={img.alt}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, 640px"
      />
    </div>
  )
}

export default function UpdateCardPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      {/* Hero */}
      <section className="px-4 md:px-10 pt-10 md:pt-16 pb-6 md:pb-8">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Happy Mail
          </p>
          <h1
            className="text-[32px] md:text-[44px] font-bold leading-[1.07] tracking-tight mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Updating your Happy Mail card
          </h1>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            We moved Happy Mail to a new system, so we need you to re-add your
            payment card. It takes about a minute. Here&apos;s exactly how, step by
            step.
          </p>
          <p
            className="text-[14px] leading-relaxed italic"
            style={{ color: "var(--color-text-secondary)" }}
          >
            If you get stuck anywhere, just reply to the email we sent you (or write
            us at help@amytangerine.com) and we&apos;ll sort it out together. Your
            envelopes are set aside; nothing is going anywhere.
          </p>
        </div>
      </section>

      {/* Walkthrough */}
      <section className="px-4 md:px-10 pb-10 md:pb-12">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-5 md:p-6 mb-8 border"
            style={{
              background: "var(--color-gray-light)",
              borderColor: "var(--color-border)",
            }}
          >
            <p
              className="text-[13px] md:text-[14px] leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              <strong>What you&apos;ll need:</strong> the email address your Happy Mail
              subscription is under, and a minute. You&apos;ll get a quick 4-digit code
              by email to log in (this keeps your account secure, no password to
              remember).
            </p>
          </div>

          <ol className="space-y-8">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold text-white"
                  style={{ background: "var(--color-orange)" }}
                >
                  {step.n}
                </span>
                <div className="flex-1">
                  <h2
                    className="text-[18px] md:text-[20px] font-bold leading-snug mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {step.title}
                  </h2>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {step.body}
                  </p>
                  {step.tip && (
                    <p
                      className="mt-2 text-[13px] leading-relaxed pl-3 border-l-2"
                      style={{
                        color: "var(--color-text-secondary)",
                        borderColor: "var(--color-orange)",
                      }}
                    >
                      Tip: {step.tip}
                    </p>
                  )}
                  {step.img && <StepScreenshot img={step.img} />}
                </div>
              </li>
            ))}
          </ol>

          {/* Primary CTA */}
          <div className="mt-10 text-center">
            <a
              href={PORTAL_LOGIN_URL}
              className="inline-block px-8 py-3 rounded-full text-[13px] uppercase tracking-[0.1em] font-semibold text-white transition-all duration-300 hover:opacity-90"
              style={{ background: "var(--color-orange)" }}
            >
              Update your card
            </a>
            <p
              className="mt-4 text-[14px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Stuck on any step? Reply to your email or write{" "}
              <strong>help@amytangerine.com</strong> — a real person (hi, it&apos;s
              us) will help you finish.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="px-4 md:px-10 py-10 md:py-14"
        style={{ background: "var(--color-gray-light)" }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
            style={{ color: "var(--color-orange)" }}
          >
            Common questions
          </p>
          <h2
            className="text-[26px] md:text-[32px] font-bold leading-tight tracking-tight mb-6"
            style={{ color: "var(--color-text-primary)" }}
          >
            About the change
          </h2>
          <div
            className="rounded-2xl px-5 md:px-6 border"
            style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}
          >
            <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </div>
      </section>
    </main>
  )
}
