// /japan — Tokyo Tangerine Takeover waitlist landing (feature f001).
//
// Built for the Hobonichi YouTube feature (Thu Jun 4) + Amy's Japan vlog launch
// the same week. The trip ran March 2026 and sold out fast; this page converts
// the inbound traffic moment into a captured email list for the next trip.
//
// Capture: WaitlistForm -> POST /api/waitlist -> Kajabi opt-in form, tagged
// tokyo-takeover-waitlist / signup-from-at-site-japan / interest-future-craft-tours
// (pre-Klaviyo bridge; see scope-tokyo-takeover-page-2026-06-01.md).
//
// Imagery: see public/images/japan/README.md. Hero uses the brand logo if
// public/images/japan/tokyo-takeover-logo.png exists; otherwise it falls back
// to a styled text treatment. Gallery uses tokyo-01..06.webp (placeholders from
// the legacy SQS Tokyo Workshops post until Amy supplies March 2026 photos).
//
// ALL copy below is a JC starting point for Amy's voice pass.

import fs from "fs"
import path from "path"
import Image from "next/image"
import WaitlistForm from "@/components/waitlist-form"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "Tokyo Tangerine Takeover — Waitlist | Amy Tangerine",
  description:
    "Twenty crafters, six nights in Ginza, paper shops and a Mt. Fuji bullet-train day trip. The first Tokyo Tangerine Takeover sold out fast. Get on the list for the next one.",
}

// Resolve drop-in assets at build/render time so a missing file never breaks the
// page. Swap real files into public/images/japan/ (same filenames) — no code change.
function fileExists(publicRelPath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", publicRelPath))
  } catch {
    return false
  }
}

// Gallery: read whichever of tokyo-01..06 actually exist, in order.
const GALLERY = ["tokyo-01.webp", "tokyo-02.webp", "tokyo-03.webp", "tokyo-04.webp", "tokyo-05.webp", "tokyo-06.webp"]

export default function JapanPage() {
  const hasLogo = fileExists("images/japan/tokyo-takeover-logo.png")
  const gallery = GALLERY.filter((f) => fileExists(`images/japan/${f}`)).map((f) => `/images/japan/${f}`)

  return (
    <main className="min-h-screen">
      <PageEngagementTracker page="japan" />

      {/* ── Hero ── */}
      <section
        className="relative px-6 py-16 md:py-24 text-center overflow-hidden"
        style={{ background: "var(--color-orange-light)" }}
      >
        <p
          className="text-[11px] md:text-[13px] uppercase tracking-[0.25em] font-semibold mb-5"
          style={{ color: "var(--color-orange)" }}
        >
          Craft Tour · Tokyo, Japan
        </p>

        {hasLogo ? (
          <div className="relative mx-auto mb-2 w-[280px] h-[200px] md:w-[460px] md:h-[320px]">
            <Image
              src="/images/japan/tokyo-takeover-logo.png"
              alt="Tangerine Tokyo Takeover — the sweetest trip ever!"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 280px, 460px"
            />
          </div>
        ) : (
          <h1
            className="text-[40px] md:text-[72px] font-bold tracking-tight leading-[1.02] mb-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            <span style={{ color: "var(--color-orange)" }}>Tangerine</span>
            <br />
            <span style={{ color: "var(--color-teal)" }}>Tokyo Takeover</span>
          </h1>
        )}

        <p
          className="mt-4 text-[16px] md:text-[20px] max-w-xl mx-auto leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
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
        <h2
          className="text-[24px] md:text-[32px] font-bold leading-tight mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Twenty crafters. Six nights in Ginza. One unforgettable week.
        </h2>
        <p className="text-[15px] md:text-[17px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          In March 2026, a small group of us took over Tokyo: paper shops and stationery
          treasure hunts, washi tape we couldn&rsquo;t carry home, Tokyo SkyTree and Asakusa,
          a Disneyland day, and a Mt. Fuji bullet-train trip. The first one sold out fast.
          We&rsquo;re already dreaming up the next.
        </p>
      </section>

      {/* ── Gallery ── */}
      {gallery.length > 0 && (
        <section className="px-3 md:px-6 pb-12 md:pb-16">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {gallery.slice(0, 6).map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={src}
                  alt={`Tokyo Tangerine Takeover ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] uppercase tracking-[0.12em] mt-3" style={{ color: "var(--color-text-secondary)" }}>
            From the March 2026 trip
          </p>
        </section>
      )}

      {/* ── Waitlist form ── */}
      <section id="waitlist" className="px-6 py-12 md:py-16" style={{ background: "var(--color-teal)" }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[26px] md:text-[36px] font-bold leading-tight text-white mb-3">
            Get on the list for the next Tokyo Tangerine Takeover
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/85 mb-6 leading-relaxed">
            Be the first to know when the next trip is announced. No spam — just the details
            when there&rsquo;s real news.
          </p>
          <WaitlistForm sourcePage="at-site:/japan" />
          <p className="text-[13px] md:text-[14px] text-white/80 mt-5 leading-relaxed">
            Want to follow along in the meantime?{" "}
            <TrackableLink
              href="https://youtube.com/@amytangerine"
              event="external_link"
              eventData={{ destination: "youtube", source_page: "japan" }}
              className="underline underline-offset-2 hover:opacity-100 text-white font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch the recap on YouTube
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
    </main>
  )
}
