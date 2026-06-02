// /japan — Tangerine Tokyo Takeover (feature f001).
//
// Dedicated page for Amy's OWN signature event, per the event-page business
// rule (Amy-only events get a page; guest appearances get an external link).
// Linked from /events ("Learn More" on the Tokyo Takeover card).
//
// The trip ran spring 2026 and sold out. This page is a recap + waitlist for
// the next one, timed to the Hobonichi YouTube feature (Jun 4) and Amy's Japan
// vlog. Operated with Crafty Destinations (craftydestinations.com).
//
// Capture: WaitlistForm -> POST /api/waitlist (Kajabi-bridged).
// Imagery: public/images/japan/ (placeholders from the legacy SQS Tokyo
// Workshops post until Amy supplies real March 2026 photos; see that README).
// No build-time fs checks (they caused a deploy-only hydration crash) — photos
// are committed and referenced as plain constants.
//
// Copy is a JC starting point for Amy's voice pass.

import Image from "next/image"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "Tangerine Tokyo Takeover | Amy Tangerine",
  description:
    "Amy's girlfriends' shopping adventure through Tokyo's best stationery and paper shops. The first trip sold out fast. Get on the list for the next Tangerine Tokyo Takeover.",
}

const GALLERY = [
  "/images/japan/tokyo-01.webp",
  "/images/japan/tokyo-02.webp",
  "/images/japan/tokyo-03.webp",
  "/images/japan/tokyo-04.webp",
  "/images/japan/tokyo-05.webp",
  "/images/japan/tokyo-06.webp",
]

export default function JapanPage() {
  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="japan" />

      {/* ── Hero (brand text treatment; swap in tokyo-takeover-logo.png later) ── */}
      <section className="px-6 py-16 md:py-24 text-center" style={{ background: "var(--color-orange-light)" }}>
        <p className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-semibold mb-5" style={{ color: "var(--color-orange)" }}>
          Craft Tour · Tokyo, Japan
        </p>
        <h1 className="text-[40px] md:text-[72px] font-bold tracking-tight leading-[1.02] mb-3" style={{ color: "var(--color-text-primary)" }}>
          <span style={{ color: "var(--color-orange)" }}>Tangerine</span>
          <br />
          <span style={{ color: "var(--color-teal)" }}>Tokyo Takeover</span>
        </h1>
        <p className="mt-4 text-[16px] md:text-[20px] max-w-xl mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          The sweetest trip ever. Get on the list for the next one.
        </p>
        <a
          href="#waitlist"
          className="mt-7 inline-block px-8 py-3 text-[13px] md:text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full text-white transition-all duration-300 hover:opacity-90"
          style={{ background: "var(--color-orange)" }}
        >
          Get on the List
        </a>
      </section>

      {/* ── The story ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16 text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold leading-tight mb-4" style={{ color: "var(--color-text-primary)" }}>
          A girlfriends&rsquo; shopping adventure through Tokyo.
        </h2>
        <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Six nights in Ginza, the world&rsquo;s most beautiful stationery and paper shops, washi tape
          we couldn&rsquo;t carry home, Tokyo SkyTree and Asakusa, a Disneyland day, and a Mt. Fuji
          bullet-train trip. The first Tangerine Tokyo Takeover sold out fast, and we&rsquo;re already
          dreaming up the next one.
        </p>
      </section>

      {/* ── Gallery ── */}
      <section className="px-3 md:px-6 pb-12 md:pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {GALLERY.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`Tangerine Tokyo Takeover ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] uppercase tracking-[0.12em] mt-3" style={{ color: "var(--color-text-secondary)" }}>
          From the first trip
        </p>
      </section>

      {/* ── Waitlist ── */}
      <section id="waitlist" className="px-6 py-12 md:py-16" style={{ background: "var(--color-teal)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[36px] font-bold leading-tight text-white mb-3">
            Get on the list for the next Tokyo Takeover
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/85 mb-6 leading-relaxed">
            Be the first to know when the next trip is announced. No spam, just the details when
            there&rsquo;s real news.
          </p>
          <WaitlistForm sourcePage="at-site:/japan" />
          <p className="text-[13px] md:text-[14px] text-white/80 mt-5 leading-relaxed">
            Want to follow along?{" "}
            <TrackableLink
              href="https://youtube.com/@amytangerine"
              event="external_link"
              eventData={{ destination: "youtube", source_page: "japan" }}
              className="underline underline-offset-2 hover:opacity-100 text-white font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch on YouTube
            </TrackableLink>{" "}
            or{" "}
            <TrackableLink
              href="https://instagram.com/amytangerine"
              event="external_link"
              eventData={{ destination: "instagram", source_page: "japan" }}
              className="underline underline-offset-2 hover:opacity-100 text-white font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              follow on Instagram
            </TrackableLink>
            .
          </p>
        </div>
      </section>

      {/* ── Back to all events ── */}
      <section className="px-6 py-8 text-center">
        <TrackableLink
          href="/events"
          event="footer_click"
          eventData={{ link_text: "Back to all events", page: "japan" }}
          className="text-[13px] uppercase tracking-[0.1em] font-semibold hover:opacity-70"
          style={{ color: "var(--color-orange)" }}
        >
          ← See all events
        </TrackableLink>
      </section>
    </main>
  )
}
