// /happy-mail/update-address — shipping-address walkthrough (t1277).
//
// PURPOSE: sibling to /happy-mail/update-card. A public, no-login support page
// CS pastes on inbound "how do I change my address?" questions, and where a
// customer who searched for it self-serves. The subscriber account is the ONLY
// place an address change reaches the envelope; a change made on the shop
// account, in the Shop app, or with the post office does not move it. The page
// says what to do, not why (no internal setup details, per the 8/18 ruling).
//
// noindex, not linked in nav or sitemap: reachable by direct URL only.
// Screenshots captured 2026-09-20 from a synthetic subscriber on the live portal.
//
// DRAFT for JC/Amy voice-and-publish call.

import type { Metadata } from "next"
import Image from "next/image"
import { HM_PORTAL_LOGIN_URL } from "@/lib/happy-mail-content"

export const metadata: Metadata = {
  title: "Changing your Happy Mail shipping address | Amy Tangerine",
  description:
    "How to update the address your Happy Mail envelope goes to, step by step.",
  robots: { index: false, follow: false }, // support page, keep out of search
}

// One home for this URL: lib/happy-mail-content.ts
const PORTAL_LOGIN_URL = HM_PORTAL_LOGIN_URL

const IMG_BASE = "/images/happy-mail/update-address"

const STEPS = [
  {
    n: 1,
    title: "Open the subscriber login page",
    body: (
      <>
        Go to{" "}
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
    tip: "This is your subscriber account, which is separate from the shop account you use to place orders. No password to remember: you get a quick code by email each time.",
    img: { src: `${IMG_BASE}/step1-login.png`, w: 1246, h: 450, alt: "The Happy Mail login screen with an email box and a Send login code button" },
  },
  {
    n: 2,
    title: "Enter the code from your email",
    body: (
      <>
        We&apos;ll email you a 4-digit code right away. Look for an email from{" "}
        <strong>Amy Tangerine</strong> with the subject{" "}
        <strong>&ldquo;Amy Tangerine secure login code.&rdquo;</strong> Type the 4
        digits into the boxes on the screen.
      </>
    ),
    tip: "The code expires after a few minutes, so use it while it’s fresh. If it expires, click “Send login code” again for a new one. If no email arrives, it’s almost always because the subscription is under a different email than the one you typed; write help@amytangerine.com and we’ll point you to the right one.",
    img: { src: `${IMG_BASE}/step2-code.png`, w: 1300, h: 450, alt: "The verification code entry screen with four digit boxes" },
  },
  {
    n: 3,
    title: "Find “Shipping and payment” and click Edit",
    body: (
      <>
        After the code, you&apos;ll land on your next order page
        (&ldquo;Welcome back!&rdquo;). Scroll down to{" "}
        <strong>&ldquo;Shipping and payment.&rdquo;</strong> Your current address is
        listed there. Click the <strong>&ldquo;Edit&rdquo;</strong> link right under
        it.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step3-overview.png`, w: 1680, h: 1600, alt: "The subscriber account page with an orange arrow pointing to the Edit link under Shipping and payment" },
  },
  {
    n: 4,
    title: "Type in your new address",
    body: (
      <>
        A window called <strong>&ldquo;Edit your address&rdquo;</strong> opens. Leave
        the top choice as it is, then update the address fields: street, apartment or
        unit if you have one, city, state, and zip. Double-check the apartment or unit
        number, since that&apos;s the piece most often left off.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step4-modal-top.png`, w: 1198, h: 1276, alt: "The Edit your address window with name and address fields" },
  },
  {
    n: 5,
    title: "Save changes",
    body: (
      <>
        Scroll to the bottom of the window and click the blue{" "}
        <strong>&ldquo;Save changes&rdquo;</strong> button.
      </>
    ),
    tip: null,
    img: { src: `${IMG_BASE}/step5-modal-save.png`, w: 1198, h: 838, alt: "The bottom of the Edit your address window with the Save changes button" },
  },
  {
    n: 6,
    title: "You’re done",
    body: (
      <>
        You&apos;ll see a green &ldquo;Your address has been updated&rdquo; message,
        and the new address now shows under{" "}
        <strong>&ldquo;Shipping and payment.&rdquo;</strong> That&apos;s the address
        your next envelope is printed from. Nothing else to do.
      </>
    ),
    tip: "Timing: we pull addresses for the mail run about a week before the 15th. Make the change before then and it’s in that month’s envelope; after that, it takes effect the following month.",
    img: { src: `${IMG_BASE}/step6-saved.png`, w: 1680, h: 460, alt: "The Shipping and payment block showing the new address and a green confirmation message" },
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

export default function UpdateAddressPage() {
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
            Changing your Happy Mail shipping address
          </h1>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-3"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Moving, or want your envelope somewhere new? Update the address in your
            subscriber account and the next envelope goes there. It takes about a
            minute. Here&apos;s exactly how, step by step.
          </p>
          <p
            className="text-[14px] leading-relaxed italic"
            style={{ color: "var(--color-text-secondary)" }}
          >
            If you get stuck anywhere, write us at help@amytangerine.com with your new
            address and we&apos;ll update it for you.
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
              className="text-[13px] md:text-[14px] leading-relaxed mb-3"
              style={{ color: "var(--color-text-primary)" }}
            >
              <strong>One thing worth knowing first:</strong> your subscription keeps
              its own shipping address, and that&apos;s the one your envelope is printed
              from. Changing your address on your shop account, in the Shop app, or with
              the post office doesn&apos;t move it. The steps below are the ones that do.
            </p>
            <p
              className="text-[13px] md:text-[14px] leading-relaxed"
              style={{ color: "var(--color-text-primary)" }}
            >
              <strong>What you&apos;ll need:</strong> the email address your Happy Mail
              subscription is under, and a minute. You&apos;ll get a quick 4-digit code
              by email to log in.
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
              Update your address
            </a>
            <p
              className="mt-4 text-[14px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Stuck on any step? Write <strong>help@amytangerine.com</strong> with your
              new address and a real person (hi, it&apos;s us) will update it for you.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
