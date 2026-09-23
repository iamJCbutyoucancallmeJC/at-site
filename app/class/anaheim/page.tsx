// /class/anaheim — the note + photos page for the Traveler's Notebook Workshop
// class at Paper World Stationery Expo, Anaheim, Sat Sep 19 2026 (t1509).
//
// Second instance of the /class/<city> convention (see app/class/layout.tsx and
// app/class/orlando/page.tsx). Reached from the thank-you note Amy sends the
// class (43 registrants from the expo's export). Unlisted: noindex via the
// layout, not in the sitemap or nav. Keeps the site chrome.
//
// Copy: drafted from Amy's words at the 9/23 studio sitting (home turf, no
// designated photographer, "the few photos I managed"); her own pass is still
// welcome and replaces this text verbatim when it comes. Photos: the nine Amy
// sent JC on 9/23 (shot 9/19 2:59 to 3:13 PM), chronological, resized to
// 1600px with orientation baked in and EXIF stripped (public/images/anaheim-2026/).
// Take-down promise at the bottom is real: help@ pulls a photo on request.
//
// No studio-spread section this time (there is no spread yet). The inline
// capture block renders null until NEXT_PUBLIC_CAPTURE_BLOCKS=1 (t1092); when
// it flips, this page gets the signup form with signup_source = class-anaheim.

import Link from "next/link"
import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import EmailCaptureInline from "@/components/email-capture-inline"
import PhotoGallery, { type GalleryPhoto } from "@/components/photo-gallery"

const PAGE = "class-anaheim"

const EVENT = {
  expo: "Paper World Stationery Expo",
  city: "Anaheim",
  dateLabel: "Saturday, September 19",
  workshop: "Traveler's Notebook Workshop",
}

const HERO = "/images/anaheim-2026/anaheim-09.jpg"

export const metadata = {
  title: "Anaheim class photos | Amy Tangerine",
  description:
    "Photos from the Traveler's Notebook Workshop at Paper World Stationery Expo in Anaheim, September 19, 2026.",
  openGraph: {
    title: "Anaheim class photos | Amy Tangerine",
    description: "Photos from Amy's Traveler's Notebook Workshop in Anaheim.",
    images: [{ url: HERO, width: 1200, height: 1600 }],
  },
}

// Chronological through the hour. Alt text is deliberately generic: nobody is
// named, and the page is for the people in the photos.
const P = (n: number, alt: string, width = 1200, height = 1600): GalleryPhoto => ({
  src: `/images/anaheim-2026/anaheim-${String(n).padStart(2, "0")}.jpg`,
  alt,
  width,
  height,
})

const PHOTOS: GalleryPhoto[] = [
  P(1, "A finished traveler's notebook cover in orange and pink paint on the workshop table"),
  P(2, "A traveler's notebook in its pouch: Wish you were here, remember this moment"),
  P(3, "A guest at work on her page, rainbow bead bracelet on"),
  P(4, "Kit, scissors and a Thank You page mid-build"),
  P(5, "Stickers going down on an Anaheim page"),
  P(6, "A guest holding up her finished Wish You Were Here page"),
  P(7, "A finished spread that reads Consider the totality of possibility"),
  P(8, "A spread that reads Big love for Paper World Anaheim"),
  P(9, "A guest with her painted page out on the expo floor"),
]

const UNTIL_NEXT_TIME = [
  {
    title: "Happy Mail",
    body: "An envelope from me once a month: die cuts, the newest sticker sheet, and a note. The good kind of mail.",
    href: "/happy-mail",
    cta: "See what's inside",
    img: "/images/products/happy-mail/1.jpg",
    contain: false,
  },
  {
    title: "Photo Booth",
    body: "Free, right here on my site. Take four photos, pick a filter, save the strip. It belongs on a page like the ones you made.",
    href: "/photobooth",
    cta: "Take a strip",
    img: "/images/photobooth-logo.png",
    contain: true,
  },
  {
    title: "Show me your pages",
    body: "Tag @amytangerine when you share. I look at every one.",
    href: "https://instagram.com/amytangerine",
    cta: "Find me on Instagram",
    external: true,
    img: "/images/anaheim-2026/anaheim-06.jpg",
    contain: false,
  },
]

export default function AnaheimClassPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page={PAGE} />

      {/* ── Note + hero photo ── */}
      <section className="px-6 md:px-10 pt-10 md:pt-16 pb-12 md:pb-16" style={{ background: "var(--color-gray-light)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          <div className="flex-1 order-2 md:order-1">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
              style={{ color: "var(--color-orange)" }}
            >
              {EVENT.expo} · {EVENT.city} · {EVENT.dateLabel}
            </p>
            <h1
              className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              Thank you, Anaheim!
            </h1>
            <div
              className="space-y-4 text-[16px] md:text-[17px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <p>
                Home turf. A sold-out room an hour from the studio, full of people I already knew
                from the internet and people I got to meet for the first time. Every kit was the
                same, and every notebook came out different. That part never stops amazing me.
              </p>
              <p>
                I did not have anyone on camera duty this time, so these are the few photos I
                managed between tables. If you took some, tag me. I would love to see the room
                from your side.
              </p>
              <p>
                Save any you love, share them wherever you like, and tag me so I can see.
              </p>
              <p>Thank you for being you, and for being close enough to come.</p>
            </div>
            <p
              className="mt-6 text-[18px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              xo, Amy
            </p>
          </div>

          <div className="relative w-full md:w-[380px] flex-shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg order-1 md:order-2 md:sticky md:top-24">
            <Image
              src={HERO}
              alt="A guest with her painted page out on the expo floor"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 380px"
            />
          </div>
        </div>
      </section>

      {/* ── Photos ── */}
      <section className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2
              className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              From the event
            </h2>
            <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
              Tap a photo to open it. Press and hold to save it to your phone, or use the
              Save button.
            </p>
          </div>
          <PhotoGallery photos={PHOTOS} page={PAGE} />
          <p
            className="mt-6 text-center text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Rather not be in one of these? Email{" "}
            <a
              href="mailto:help@amytangerine.com?subject=Anaheim%20class%20photo"
              className="underline hover:opacity-70"
              style={{ color: "var(--color-orange)" }}
            >
              help@amytangerine.com
            </a>{" "}
            and it comes down, no questions asked.
          </p>
        </div>
      </section>

      {/* ── Until next time ── */}
      <section className="px-6 md:px-10 py-12 md:py-16" style={{ background: "var(--color-gray-light)" }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[15px] md:text-[17px] uppercase tracking-[0.12em] font-semibold text-center mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Until next time
          </h2>
          <p className="text-center text-[14px] mb-8" style={{ color: "var(--color-text-secondary)" }}>
            A few ways to keep making things together.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {UNTIL_NEXT_TIME.map((item) => {
              const inner = (
                <>
                  <div
                    className="relative aspect-[4/3]"
                    style={item.contain ? { background: "var(--color-gray-light)" } : undefined}
                  >
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className={item.contain ? "object-contain p-8" : "object-cover"}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-[15px] font-semibold mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-[13px] leading-relaxed mb-3"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.body}
                    </p>
                    <span
                      className="text-[12px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--color-orange)" }}
                    >
                      {item.cta} →
                    </span>
                  </div>
                </>
              )
              const cls = "rounded-xl overflow-hidden border block hover:shadow-md transition-shadow"
              const style = { background: "var(--color-white)", borderColor: "var(--color-border)" }
              return item.external ? (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cls}
                  style={style}
                >
                  {inner}
                </a>
              ) : (
                <Link key={item.title} href={item.href} className={cls} style={style}>
                  {inner}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Renders null until NEXT_PUBLIC_CAPTURE_BLOCKS=1 (t1092 gate). */}
      <EmailCaptureInline source={PAGE} />
    </main>
  )
}
