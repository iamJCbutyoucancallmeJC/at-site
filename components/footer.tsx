import Link from "next/link"

const DESKTOP_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Learn", href: "/learn" },
  { label: "About", href: "/about" },
  { label: "Instagram", href: "https://instagram.com/amytangerine" },
  { label: "YouTube", href: "https://youtube.com/@amytangerine" },
  { label: "Contact", href: "/contact" },
]

const MOBILE_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Learn", href: "/learn" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-text-primary)" }}>
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-12 py-8">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          &copy; {new Date().getFullYear()} Amy Tangerine
        </p>
        <div className="flex gap-6">
          {DESKTOP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm hover:opacity-100 transition-opacity"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden text-center py-6 px-5">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
          {MOBILE_LINKS.map((link, i) => (
            <span key={link.href}>
              {i > 0 && <span style={{ color: "rgba(255,255,255,0.4)" }}> &middot; </span>}
              <Link href={link.href} style={{ color: "rgba(255,255,255,0.7)" }}>
                {link.label}
              </Link>
            </span>
          ))}
        </p>
        <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          &copy; {new Date().getFullYear()} Amy Tangerine
        </p>
      </div>
    </footer>
  )
}
