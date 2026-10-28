"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ChevronDown, Instagram, Youtube } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { isChromelessRoute, isQuietRoute } from "@/lib/chromeless-routes"
import KeepUpCard from "@/components/keep-up-card"

// Footer (design finish, Phase 1, 2026-10-28). Three layers, top to bottom:
//   1. the capture card (KeepUpCard, gated; skipped where the page has its own form)
//   2. a paper band: logo, four columns (Shop / Happy Mail / Learn / About) on
//      desktop and an accordion of the same four on phones, then the social row
//   3. an ink strip: copyright and the changelog link
// It replaces the black bar with nine links in a row. Column labels are new;
// every link points at a page that already existed.

type FooterLink = { label: string; href: string }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Shop My Stuff", href: "/shop" },
      { label: "Shop My Faves", href: "/shop-my-faves" },
    ],
  },
  {
    title: "Happy Mail",
    links: [
      { label: "Subscribe", href: "/happy-mail" },
      { label: "Give Happy Mail", href: "/gift" },
      { label: "Outside the US", href: "/happy-mail-international" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Journal", href: "/blog" },
      { label: "In Person", href: "/events" },
      { label: "Photobooth", href: "/photobooth" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Amy", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Join the list", href: "/join" },
    ],
  },
]

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/amytangerine", Icon: Instagram },
  { label: "YouTube", href: "https://youtube.com/@amytangerine", Icon: Youtube },
]

function ColumnLink({ link, group }: { link: FooterLink; group: string }) {
  return (
    <Link
      href={link.href}
      className="block py-1.5 text-[15px] hover:underline underline-offset-4"
      style={{ color: "var(--color-ink)" }}
      onClick={() => trackEvent("footer_click", { link_text: link.label, group })}
    >
      {link.label}
    </Link>
  )
}

// Pages that already carry a capture form of their own (JC 9/6: two on one
// page is one too many).
// Keep in sync with every page that renders WaitlistForm, NewsletterForm or KeepUpCard
// itself (JC 9/23: event detail pages were showing both).
const OWN_FORM_EXACT = ["/", "/join", "/creativity", "/events", "/japan"]
const OWN_FORM_PREFIXES = ["/v/", "/events/", "/blog/", "/class/"]
function hasOwnCaptureForm(pathname: string | null): boolean {
  if (!pathname) return false
  return OWN_FORM_EXACT.includes(pathname) || OWN_FORM_PREFIXES.some((p) => pathname.startsWith(p))
}

export default function Footer() {
  const pathname = usePathname()

  // Chromeless (isolated event) routes render no global footer. See lib/chromeless-routes.
  if (isChromelessRoute(pathname)) return null

  // Quiet routes (the gated class pages): one line, no link rows, no capture.
  if (isQuietRoute(pathname)) {
    return (
      <footer className="px-5 md:px-12 py-8 text-center md:text-left text-xs" style={{ background: "var(--color-ink)", color: "rgba(255,255,255,0.75)" }}>
        &copy; {new Date().getFullYear()} Amy Tangerine &middot;{" "}
        <Link href="/" style={{ color: "var(--color-white)" }}>amytangerine.com</Link>
      </footer>
    )
  }

  const year = new Date().getFullYear()

  return (
    <footer>
      {/* Email capture (t1092, D3 inline block): renders null until
          NEXT_PUBLIC_CAPTURE_BLOCKS=1 (Amy aesthetic pass gate). One form per
          page: skipped where the page carries its own (hasOwnCaptureForm). */}
      {!hasOwnCaptureForm(pathname) && <KeepUpCard sourcePage="footer" gated />}

      <div className="px-5 md:px-12 pt-10 md:pt-14 pb-8 border-t" style={{ background: "var(--color-paper)", borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="md:grid md:grid-cols-[1.2fr_repeat(4,1fr)] md:gap-8">
            <Link href="/" className="inline-block mb-6 md:mb-0" aria-label="Amy Tangerine home">
              <Image
                src="/images/amy-tangerine-logo.png"
                alt="Amy Tangerine"
                width={160}
                height={64}
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop: four columns */}
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title} className="hidden md:block">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: "var(--color-ink-soft)" }}>
                  {col.title}
                </h2>
                {col.links.map((link) => (
                  <ColumnLink key={link.href} link={link} group={col.title} />
                ))}
              </nav>
            ))}

            {/* Phones: the same four as an accordion */}
            <div className="md:hidden border-t" style={{ borderColor: "var(--color-border)" }}>
              {COLUMNS.map((col) => (
                <details key={col.title} className="group border-b" style={{ borderColor: "var(--color-border)" }}>
                  <summary
                    className="flex items-center justify-between py-4 text-[16px] font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {col.title}
                    <ChevronDown size={18} aria-hidden="true" className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-3">
                    {col.links.map((link) => (
                      <ColumnLink key={link.href} link={link} group={col.title} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-8">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Amy on ${label}`}
                className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-white transition-colors"
                style={{ color: "var(--color-ink)" }}
                onClick={() => trackEvent("external_link", { destination: label.toLowerCase(), source_page: "footer" })}
              >
                <Icon size={22} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 md:px-12 py-5" style={{ background: "var(--color-ink)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
          <p>&copy; {year} Amy Tangerine</p>
          <Link
            href="/changelog"
            className="underline underline-offset-4 hover:text-white"
            style={{ color: "rgba(255,255,255,0.85)" }}
            onClick={() => trackEvent("footer_click", { link_text: "Changelog" })}
          >
            Changelog
          </Link>
        </div>
      </div>
    </footer>
  )
}
