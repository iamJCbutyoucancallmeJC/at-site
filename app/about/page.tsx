import Image from "next/image"
import Link from "next/link"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "About Amy | Amy Tangerine",
  description:
    "Amy Tangerine is a multi-passionate maker, creative journaling teacher, and memory keeper based in Los Angeles, CA.",
}

const COLLABORATED_WITH = [
  { name: "Apple", file: "/images/logos/01-apple.jpg" },
  { name: "Target", file: "/images/logos/02-target.png" },
  { name: "Uniqlo", file: "/images/logos/03-uniqlo.png" },
  { name: "State Farm", file: "/images/logos/04-state-farm.png" },
  { name: "Kohl's", file: "/images/logos/05-kohls.png" },
  { name: "Fujifilm", file: "/images/logos/06-fujifilm.png" },
  { name: "Avery", file: "/images/logos/07-avery.png" },
  { name: "Fiskars", file: "/images/logos/08-fiskars.png" },
  { name: "Shutterfly", file: "/images/logos/09-shutterfly.png" },
  { name: "Dunkin'", file: "/images/logos/10-dunkin.png" },
  { name: "Crayola", file: "/images/logos/11-crayola.jpg" },
  { name: "H&R Block", file: "/images/logos/12-hr-block.png" },
  { name: "Samsung", file: "/images/logos/13-samsung.jpeg" },
  { name: "Intel", file: "/images/logos/14-intel.png" },
  { name: "HP", file: "/images/logos/15-hp.png" },
  { name: "Alaska Airlines", file: "/images/logos/16-alaska-airlines.png" },
  { name: "Amazon", file: "/images/logos/17-amazon.png" },
  { name: "General Mills", file: "/images/logos/18-general-mills.jpg" },
  { name: "Mixbook", file: "/images/logos/19-mixbook.jpg" },
  { name: "Four Seasons", file: "/images/logos/20-four-seasons.png" },
  { name: "Clinique", file: "/images/logos/21-clinique.png" },
  { name: "HBO", file: "/images/logos/22-hbo.png" },
  { name: "Disney", file: "/images/logos/23-disney.png" },
  { name: "Hallmark", file: "/images/logos/24-hallmark.png" },
  { name: "Happy Planner", file: "/images/logos/25-happy-planner.jpg" },
  { name: "Nordstrom", file: "/images/logos/26-nordstrom.png" },
  { name: "American Crafts", file: "/images/logos/27-american-crafts.png" },
  { name: "Hamilton Princess", file: "/images/logos/28-hamilton-princess.jpg" },
  { name: "Aulani", file: "/images/logos/29-aulani.jpg" },
  { name: "LEGOLAND", file: "/images/logos/30-legoland.jpg" },
  { name: "Olay", file: "/images/logos/31-olay.png" },
  { name: "Popsicle", file: "/images/logos/32-popsicle.jpg" },
]

const FEATURED_IN = [
  "Forbes",
  "PaperCrafter",
  "EventMarketer",
  "Cut & Paste",
  "MOTHER",
  "Adobe Blog",
  "Your Tango",
  "Craft Industry Alliance",
  "The Modern Creative Podcast",
  "Dear Handmade Life",
  "Liberty Session",
  "Proof to Product",
  "Exactly Enough Time",
  "The Brava Podcast",
  "Don't Keep Your Day Job",
  "The Lavendaire Lifestyle",
  "A Creative Approach",
  "Craft Hangout",
  "Elise Gets Crafty",
  "Raise Your Hand. Say Yes.",
  "Pimp Your Brilliance",
  "Misses Ambitious",
  "Homegirl Talk",
]

const LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Happy Mail", href: "/happy-mail" },
  { label: "Events", href: "/events" },
  { label: "YouTube", href: "https://youtube.com/@amytangerine", external: true },
]

export default function AboutPage() {
  return (
    <>
      <PageEngagementTracker page="about" />

      {/* ── Hero ── */}
      <section
        className="py-16 md:py-24 px-6 md:px-16"
        style={{ background: "var(--color-gray-light)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-center">

          {/* Photo placeholder -- swap for Amy headshot when received */}
          <div className="relative w-full md:w-[380px] flex-shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/images/products/happy-mail/3.jpg"
              alt="Amy Tangerine"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 380px"
            />
          </div>

          {/* Intro */}
          <div className="flex-1">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-4"
              style={{ color: "var(--color-orange)" }}
            >
              About Amy
            </p>
            <h1
              className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              Craft a life
              <br />
              you love.
            </h1>
            <p
              className="text-[17px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Amy Tangerine is a modern-day memory keeper and self-proclaimed
              hobby collector, with creative journaling at the heart of it all.
              Whether she&rsquo;s documenting travel adventures or sharing
              inspiration on YouTube, she&rsquo;s all about helping others find
              joy in crafting a life they love.
            </p>
          </div>
        </div>
      </section>

      {/* ── Bio ── */}
      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            As a multi-passionate maker ever since she can remember, Amy
            Tangerine thrives in providing creatives with the space and tools to
            see the bright side of life.
          </p>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed mb-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            She has taught crafty workshops all over the world, filmed tons of
            YouTube videos, and consulted with awesome brands including Disney,
            Apple, Avery and more. Featured in publications like NY Times, Real
            Simple, and Forbes, she enjoys sharing ways to craft a life you
            love.
          </p>
          <p
            className="text-[16px] md:text-[18px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Amy loves any excuse to celebrate and spread happiness. She spends a
            lot of her time in her art studio in Los Angeles, CA or hanging out
            with her husband and 2 kids. You can meet Amy at the intersection of
            creativity, passion, and purpose.
          </p>
        </div>
      </section>

      {/* ── Collaborated with / Featured in ── */}
      <section
        className="py-16 md:py-20 px-6 md:px-16 border-t border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-white)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 text-center"
            style={{ color: "var(--color-orange)" }}
          >
            Collaborated with
          </p>
          <h2
            className="text-[22px] md:text-[28px] font-bold mb-10 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Creative partners &amp; clients.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 mb-20">
            {COLLABORATED_WITH.map(({ name, file }) => (
              <div
                key={name}
                className="relative w-full aspect-[3/2] flex items-center justify-center"
              >
                <Image
                  src={file}
                  alt={name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                />
              </div>
            ))}
          </div>

          <p
            className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 text-center"
            style={{ color: "var(--color-orange)" }}
          >
            Featured in
          </p>
          <h2
            className="text-[22px] md:text-[28px] font-bold mb-10 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            Press, podcasts &amp; publications.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-5">
            {FEATURED_IN.map((name) => (
              <span
                key={name}
                className="text-[13px] md:text-[14px] font-semibold text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values strip ── */}
      <section
        className="py-16 md:py-20 px-6 md:px-16"
        style={{ background: "var(--color-teal)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-white text-center">
          <div>
            <p className="text-[28px] font-bold mb-2">Creativity</p>
            <p className="text-[14px] leading-relaxed text-white/75">
              Everyone has a story to tell. Amy&rsquo;s work is about helping
              you find the tools and space to tell yours.
            </p>
          </div>
          <div>
            <p className="text-[28px] font-bold mb-2">Journaling</p>
            <p className="text-[14px] leading-relaxed text-white/75">
              From travel notebooks to memory keeping, Amy believes that
              documenting your life is a practice worth protecting.
            </p>
          </div>
          <div>
            <p className="text-[28px] font-bold mb-2">Community</p>
            <p className="text-[14px] leading-relaxed text-white/75">
              Workshops, retreats, YouTube, and Happy Mail. Connection with
              fellow makers is at the heart of everything Amy does.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA links ── */}
      <section className="py-16 md:py-20 px-6 md:px-16">
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-[13px] uppercase tracking-[0.18em] font-semibold mb-4"
            style={{ color: "var(--color-orange)" }}
          >
            Explore
          </p>
          <h2
            className="text-[28px] md:text-[36px] font-bold mb-10"
            style={{ color: "var(--color-text-primary)" }}
          >
            Find your corner of Amy&rsquo;s world.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {LINKS.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
                  style={{
                    borderColor: "var(--color-orange)",
                    color: "var(--color-orange)",
                  }}
                >
                  {label}
                </a>
              ) : (
                <TrackableLink
                  key={label}
                  href={href}
                  eventName="about_cta_click"
                  eventData={{ label }}
                  className="px-8 py-3 rounded-full text-[13px] font-semibold uppercase tracking-[0.1em] border transition-all duration-200 hover:opacity-80"
                  style={{
                    borderColor: "var(--color-orange)",
                    color: "var(--color-orange)",
                  }}
                >
                  {label}
                </TrackableLink>
              )
            )}
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
          eventName="about_hm_cta_click"
          className="inline-block px-10 py-4 rounded-full bg-white text-[14px] font-semibold uppercase tracking-[0.1em] hover:bg-white/90 transition-all duration-200"
          style={{ color: "var(--color-orange)" }}
        >
          Learn more
        </TrackableLink>
      </section>
    </>
  )
}
