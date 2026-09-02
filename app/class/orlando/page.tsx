// /class/orlando — the note + photos page for the Traveler's Notebook Workshop
// class at Paper World Stationery Expo, Orlando, Sat Aug 29 2026 (t1246).
//
// Reached from the thank-you note Amy sends the class (45 registrants from the
// expo's export). Unlisted: noindex via app/class/layout.tsx, not in the
// sitemap or nav. Keeps the site chrome so the class lands on Amy's site.
//
// Copy below is a JC starting point in Amy's voice, pending her pass (same
// hold as /japan). Photos: 20 from the room + one from the evening (per JC
// 9/01, shot by participants), chronological, resized to 1600px with EXIF stripped (public/images/orlando-2026/).
// Take-down promise at the bottom is real: help@ pulls a photo on request.
//
// The inline capture block renders null until NEXT_PUBLIC_CAPTURE_BLOCKS=1
// (Amy's aesthetic pass, t1092); when it flips, this page gets the signup
// form automatically with signup_source = class-orlando.

import Link from "next/link"
import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import EmailCaptureInline from "@/components/email-capture-inline"
import PhotoGallery, { type GalleryPhoto } from "@/components/photo-gallery"

const PAGE = "class-orlando"

const EVENT = {
  expo: "Paper World Stationery Expo",
  city: "Orlando",
  dateLabel: "Saturday, August 29",
  workshop: "Traveler's Notebook Workshop",
}

const HERO = "/images/orlando-2026/orlando-09.jpg"

export const metadata = {
  title: "Orlando class photos | Amy Tangerine",
  description:
    "Photos from the Traveler's Notebook Workshop at Paper World Stationery Expo in Orlando, August 29, 2026.",
  openGraph: {
    title: "Orlando class photos | Amy Tangerine",
    description: "Photos from Amy's Traveler's Notebook Workshop in Orlando.",
    images: [{ url: HERO, width: 1200, height: 1600 }],
  },
}

// Chronological through the hour. Alt text is deliberately generic: nobody is
// named, and the page is for the people in the photos.
const P = (n: number, alt: string, width = 1200, height = 1600): GalleryPhoto => ({
  src: `/images/orlando-2026/orlando-${String(n).padStart(2, "0")}.jpg`,
  alt,
  width,
  height,
})

const PHOTOS: GalleryPhoto[] = [
  P(1, "Amy with a workshop guest holding a finished traveler's notebook page"),
  P(2, "Workshop table mid-project: papers, washi, scissors and hands at work"),
  P(3, "Stickers, ephemera and a notebook spread on the workshop table"),
  P(4, "Workshop kit on the table", 900, 1600),
  P(5, "A guest holding up her traveler's notebook page"),
  P(6, "A full table of the Orlando class at work"),
  P(7, "The Orlando class at their tables"),
  P(8, "Amy with a table of the Orlando class"),
  P(9, "Amy standing with the class in the workshop room"),
  P(10, "A table of guests holding up their pages"),
  P(11, "A guest showing her finished traveler's notebook spread"),
  P(12, "A guest holding up her traveler's notebook page"),
  P(13, "A guest holding her page at the workshop table"),
  P(14, "A guest with her finished notebook page"),
  P(15, "A guest holding up her page at the table"),
  P(16, "A guest showing her traveler's notebook page"),
  P(17, "A stamped kraft notebook page that reads Find Your Wild"),
  P(18, "Amy with a workshop guest and her finished page"),
  P(19, "A finished traveler's notebook page that reads Create and Lucky One"),
  P(20, "Amy with a workshop guest holding her page"),
  P(21, "Amy with a workshop guest at Paper World"),
]

const UNTIL_NEXT_TIME = [
  {
    title: "Happy Mail",
    body: "An envelope from me once a month: die cuts, the newest sticker sheet, and a note. The good kind of mail.",
    href: "/happy-mail",
    cta: "See what's inside",
    img: "/images/products/happy-mail/1.jpg",
  },
  {
    title: "Sunshine & Rainbows",
    body: "My traveler's notebook, if you want a fresh one to fill. It's on Amazon.",
    href: "/amzn/book",
    cta: "Get the notebook",
    img: "/images/book/sunshine-rainbows-cover.jpeg",
  },
  {
    title: "Show me your pages",
    body: "Tag @amytangerine when you share. I look at every one.",
    href: "https://instagram.com/amytangerine",
    cta: "Find me on Instagram",
    external: true,
    img: "/images/orlando-2026/orlando-19.jpg",
  },
]

export default function OrlandoClassPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page={PAGE} />

      {/* ── Note + hero photo ── */}
      <section className="px-6 md:px-10 pt-10 md:pt-16 pb-12 md:pb-16" style={{ background: "var(--color-gray-light)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-14 items-center">
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
              Thank you, Orlando!
            </h1>
            <div
              className="space-y-4 text-[16px] md:text-[17px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <p>
                What a room. A sold-out class, a stack of traveler&apos;s notebooks, and one
                hour that flew by. Every page that came out of it looked different from the
                one next to it, and that is exactly the point.
              </p>
              <p>
                Here are photos from the event. Save any you love, share them wherever you
                like, and tag me so I can see.
              </p>
              <p>
                Thank you for spending part of your Saturday with me. A room full of people
                who love paper as much as I do is my favorite kind of day.
              </p>
            </div>
            <p
              className="mt-6 text-[18px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              xo, Amy
            </p>
          </div>

          <div className="relative w-full md:w-[380px] flex-shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg order-1 md:order-2">
            <Image
              src={HERO}
              alt="Amy standing with the class in the workshop room"
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
              From class
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
              href="mailto:help@amytangerine.com?subject=Orlando%20class%20photo"
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
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover"
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
