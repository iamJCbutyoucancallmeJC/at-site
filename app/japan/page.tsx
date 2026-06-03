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

// Photo #1 (Amy holding the trip card) is the hero. The rest fill the gallery.
const GALLERY = [
  "/images/japan/tokyo-02.webp", // stationery shop interior
  "/images/japan/tokyo-09.webp", // full group at Hobonichi HQ
  "/images/japan/tokyo-03.webp", // group at Rainbowholic cafe
  "/images/japan/tokyo-04.webp", // sticker wall
  "/images/japan/tokyo-07.webp", // group with Hobonichi bear
  "/images/japan/tokyo-06.webp", // Amy + cherry blossoms
  "/images/japan/tokyo-05.webp", // group indoors
  "/images/japan/tokyo-08.webp", // Mother/EarthBound plush finds
]

export default function JapanPage() {
  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="japan" />

      {/* ── Hero (photo #1: Amy holding the trip card) ── */}
      <section className="relative w-full h-[72vh] md:h-[80vh] overflow-hidden">
        <Image
          src="/images/japan/hero.webp"
          alt="Amy holding the Tangerine Tokyo Takeover card in Tokyo"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: "50% 30%" }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-20 px-6 text-center">
          <p className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-semibold mb-4 text-white/90">
            Craft Tour · Tokyo, Japan
          </p>
          <h1 className="text-[40px] md:text-[76px] font-bold tracking-tight leading-[1.0] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            Tangerine Tokyo Takeover
          </h1>
          <p className="mt-3 md:mt-4 text-[16px] md:text-[20px] max-w-xl mx-auto leading-relaxed text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
            The sweetest trip ever. Get on the list for the next one.
          </p>
          <a
            href="#waitlist"
            className="mt-6 md:mt-8 inline-block px-8 py-3 text-[13px] md:text-[14px] uppercase tracking-[0.12em] font-semibold rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
          >
            Get on the List
          </a>
        </div>
      </section>

      {/* ── The story ── */}
      <section className="max-w-2xl mx-auto px-6 py-12 md:py-16 text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold leading-tight mb-4" style={{ color: "var(--color-text-primary)" }}>
          A girlfriends&rsquo; shopping adventure through Tokyo.
        </h2>
        <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Six nights in Ginza, the world&rsquo;s most beautiful stationery and paper shops, a Tokyo
          Disneyland day, a super special trip to Hobonichi headquarters (pinch me!), late nights
          crafting away in the hotel lobby and the best tour bus guide to Mt. Fuji. The first
          Tangerine Tokyo Takeover sold out fast, and we&rsquo;re already dreaming up the next one.
        </p>
      </section>

      {/* ── Gallery ── */}
      <section className="px-3 md:px-6 pb-12 md:pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
          {GALLERY.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`Tangerine Tokyo Takeover trip photo ${i + 1}`}
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
            Get on the list for the next Tangerine Takeover
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/85 mb-6 leading-relaxed">
            Be it in Tokyo or somewhere closer. No spam, just the details when there&rsquo;s something
            to share, and you&rsquo;ll be among the first to know.
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
