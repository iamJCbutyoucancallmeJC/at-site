import Image from "next/image"
import Link from "next/link"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import TrackableLink from "@/components/trackable-link"

export const metadata = {
  title: "About Amy | Amy Tangerine",
  description:
    "Amy Tangerine is a multi-passionate maker, creative journaling teacher, and memory keeper based in Los Angeles, CA.",
}

// Brand logos in Amy's source order from amytangerine.com/featured-in (32 brands).
// Files live in /public/images/logos/, prefixed with order number.
const BRAND_LOGOS = [
  { name: "Apple",                       file: "01-apple.jpg" },
  { name: "Target",                      file: "02-target.png" },
  { name: "Uniqlo",                      file: "03-uniqlo.png" },
  { name: "State Farm",                  file: "04-state-farm.png" },
  { name: "Kohl's",                      file: "05-kohls.png" },
  { name: "Fujifilm",                    file: "06-fujifilm.png" },
  { name: "Avery",                       file: "07-avery.png" },
  { name: "Fiskars",                     file: "08-fiskars.png" },
  { name: "San Diego Tourism Authority", file: "09-san-diego-tourism.png" },
  { name: "Dunkin'",                     file: "10-dunkin.png" },
  { name: "Crayola",                     file: "11-crayola.jpg" },
  { name: "H&R Block",                   file: "12-hr-block.png" },
  { name: "Samsung",                     file: "13-samsung.jpeg" },
  { name: "Intel",                       file: "14-intel.png" },
  { name: "HP",                          file: "15-hp.png" },
  { name: "Alaska Airlines",             file: "16-alaska-airlines.png" },
  { name: "Amazon",                      file: "17-amazon.png" },
  { name: "General Mills",               file: "18-general-mills.jpg" },
  { name: "Mixbook",                     file: "19-mixbook.jpg" },
  { name: "Four Seasons",                file: "20-four-seasons.png" },
  { name: "Clinique",                    file: "21-clinique.png" },
  { name: "HBO",                         file: "22-hbo.png" },
  { name: "Disney",                      file: "23-disney.png" },
  { name: "Adobe",                       file: "24-adobe.png" },
  { name: "Happy Planner",               file: "25-happy-planner.jpg" },
  { name: "Nordstrom",                   file: "26-nordstrom.png" },
  { name: "American Crafts",             file: "27-american-crafts.png" },
  { name: "Hamilton Princess",           file: "28-hamilton-princess.jpg" },
  { name: "Aulani",                      file: "29-aulani.jpg" },
  { name: "Legoland",                    file: "30-legoland.jpg" },
  { name: "Olay",                        file: "31-olay.png" },
  { name: "Popsicle",                    file: "32-popsicle.jpg" },
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

      {/* ── Brand logo wall ── */}
      <section
        className="py-16 md:py-20 px-6 md:px-16 border-t border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-white)",
        }}
      >
        <div className="max-w-6xl mx-auto">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10 items-center">
            {BRAND_LOGOS.map(({ name, file }) => (
              <div
                key={file}
                className="relative aspect-[3/2] w-full"
                title={name}
              >
                <Image
                  src={`/images/logos/${file}`}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-contain"
                />
              </div>
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
                  event="nav_click"
                  eventData={{ label, source_page: "about" }}
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
          event="hero_cta_click"
          eventData={{ cta_text: "About Happy Mail CTA", destination: "/happy-mail", page: "about" }}
          className="inline-block px-10 py-4 rounded-full bg-white text-[14px] font-semibold uppercase tracking-[0.1em] hover:bg-white/90 transition-all duration-200"
          style={{ color: "var(--color-orange)" }}
        >
          Learn more
        </TrackableLink>
      </section>
    </>
  )
}
