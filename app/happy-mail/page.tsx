// Happy Mail landing page -- CREATE per wireframes/happy-mail-landing-mobile.html + desktop.html
// Copy source: A5 Job/Linslow/Clients/Amy Tangerine/happy-mail-landing-copy.md
// Sections: Hero (pricing + CTA), What's Inside, How It Works,
//           Past Months gallery, Testimonials, FAQ, Bottom CTA band
// TODO Phase 2: wire Shopify product fetch for subscribe buttons + live subscriber count

export default function HappyMailPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>

      {/* Hero */}
      <section className="px-6 py-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Let me send you mail.
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Once a month, a package from me — die cuts, stickers, and a personal note.
          Your name, hand-lettered on the envelope.
        </p>

        {/* Pricing */}
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <div className="border rounded-2xl p-6 text-left min-w-[160px]" style={{ borderColor: "var(--color-border)", background: "var(--color-white)" }}>
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>Monthly</div>
            <div className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>$13</div>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>/month</div>
            <div className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>Renews monthly</div>
          </div>
          <div className="border-2 rounded-2xl p-6 text-left min-w-[160px]" style={{ borderColor: "var(--color-orange)", background: "var(--color-white)" }}>
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-orange)" }}>6 Months</div>
            <div className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>$66</div>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>one payment</div>
            <div className="text-xs mt-2" style={{ color: "var(--color-teal)" }}>Save $12</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          <button
            className="px-8 py-3 rounded-full font-semibold text-white"
            style={{ background: "var(--color-orange)" }}
          >
            Subscribe Monthly — $13/mo
          </button>
          <button
            className="px-8 py-3 rounded-full font-semibold border-2"
            style={{ borderColor: "var(--color-orange)", color: "var(--color-orange)" }}
          >
            Get 6 Months — $66
          </button>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Cancel anytime · Ships ~15th · US only · Limited spots
        </p>
      </section>

      {/* What's Inside */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--color-text-primary)" }}>
          Every month, you get:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Your name, hand-lettered by Amy", body: "The envelope arrives addressed in Amy's handwriting. Not printed. Actually hand-lettered." },
            { title: "Die cuts Amy designed, made in the USA", body: "New designs every month. Exclusively for subscribers — not in the shop." },
            { title: "First look at the newest sticker sheet", body: "Subscribers get it before anyone else. Often before it's even listed." },
            { title: "A note from Amy", body: "What she's making, what she's loving, what's on her mind. Personal. Not a newsletter." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl p-5" style={{ background: "var(--color-white)", border: "1px solid var(--color-border)" }}>
              <h3 className="font-bold text-sm mb-2" style={{ color: "var(--color-text-primary)" }}>{item.title}</h3>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--color-text-primary)" }}>
          Simple as it gets.
        </h2>
        <div className="space-y-6">
          {[
            { n: "1", title: "Subscribe today", body: "Choose monthly or 6 months. You're in. We lock in your spot." },
            { n: "2", title: "We prep your envelope", body: "Around the 10th, Amy hand-letters your name. We assemble your package with that month's goodies." },
            { n: "3", title: "It arrives mid-month", body: "Delivered like a letter from a friend — USPS first-class, right to your door around the 15th." },
          ].map((step) => (
            <div key={step.n} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: "var(--color-orange)" }}>
                {step.n}
              </div>
              <div>
                <div className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>{step.title}</div>
                <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--color-text-primary)" }}>
          Questions?
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "What's the difference between Monthly and 6-Month?",
              a: "Monthly ($13/mo) renews automatically each month until you cancel. 6-Month ($66) is a one-time payment for six months — no recurring charges. Both get the same monthly package."
            },
            {
              q: "When does it ship?",
              a: "Around the 15th of each month, via USPS first-class. No tracking number — it arrives like a letter from a friend."
            },
            {
              q: "Are the contents available in your shop?",
              a: "Nope. Happy Mail goodies are subscriber-exclusive."
            },
            {
              q: "Can I send it as a gift?",
              a: "Yes. At checkout, enter your recipient's shipping address. The 6-Month option is the most popular gift."
            },
            {
              q: "How do I cancel?",
              a: "Email hello@amytangerine.com. No questions asked. Just let us know before the 10th of the month."
            },
            {
              q: "Do you ship internationally?",
              a: "Not yet — US only for now."
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl p-5" style={{ background: "var(--color-white)", border: "1px solid var(--color-border)" }}>
              <div className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>{faq.q}</div>
              <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-16 text-center" style={{ background: "var(--color-orange)" }}>
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to get happy mail?</h2>
        <p className="text-white/80 mb-8">Join subscribers already getting a monthly package from Amy.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button className="px-8 py-3 rounded-full font-semibold bg-white" style={{ color: "var(--color-orange)" }}>
            Subscribe Monthly — $13/mo
          </button>
          <button className="px-8 py-3 rounded-full font-semibold border-2 border-white text-white">
            Get 6 Months — $66
          </button>
        </div>
        <p className="text-white/60 text-xs mt-4">Cancel anytime · Ships ~15th · US only</p>
      </section>

    </main>
  )
}
