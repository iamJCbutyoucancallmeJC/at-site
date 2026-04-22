"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingBag } from "lucide-react"
import { trackEvent } from "@/lib/analytics"
import { useCart } from "@/context/cart"

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
]

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { count, openCart } = useCart()

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="hidden md:flex items-center h-[72px] px-12 border-b"
        style={{
          background: "var(--color-white)",
          borderColor: "var(--color-border)",
        }}
      >
        <Link href="/" className="shrink-0">
          <Image
            src="/images/amy-tangerine-logo.png"
            alt="Amy Tangerine"
            width={180}
            height={72}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>

        <div className="flex-1 flex items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--color-text-primary)" }}
              onClick={() => trackEvent("nav_click", { link_text: link.label, mobile_or_desktop: "desktop" })}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-5">
          <Link
            href="/happy-mail"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-base font-bold text-white"
            style={{
              background: "var(--color-orange)",
              boxShadow: "0 2px 8px rgba(253,137,28,0.3)",
            }}
            onClick={() => trackEvent("nav_click", { link_text: "Happy Mail", mobile_or_desktop: "desktop" })}
          >
            <span className="text-sm">♥</span> Happy Mail
          </Link>
          <button
            onClick={openCart}
            className="relative w-11 h-11 flex items-center justify-center"
            style={{ color: "var(--color-text-primary)" }}
            aria-label={`Cart${count > 0 ? ` (${count} items)` : ""}`}
          >
            <ShoppingBag size={22} />
            {count > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full text-white"
                style={{ background: "var(--color-orange)" }}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav
        className="md:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 border-b"
        style={{
          background: "var(--color-white)",
          borderColor: "var(--color-border)",
        }}
      >
        <button
          className="w-11 h-11 flex items-center justify-center"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/amy-tangerine-logo.png"
            alt="Amy Tangerine"
            width={120}
            height={48}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        <button
          onClick={openCart}
          className="relative w-11 h-11 flex items-center justify-center"
          style={{ color: "var(--color-text-primary)" }}
          aria-label={`Cart${count > 0 ? ` (${count} items)` : ""}`}
        >
          <ShoppingBag size={22} />
          {count > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full text-white"
              style={{ background: "var(--color-orange)" }}
            >
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-14 z-40"
          style={{ background: "var(--color-white)" }}
        >
          <div className="flex flex-col p-6 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-semibold py-3 border-b"
                style={{
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border)",
                }}
                onClick={() => { setMobileOpen(false); trackEvent("nav_click", { link_text: link.label, mobile_or_desktop: "mobile" }) }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/happy-mail"
              className="mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-full text-base font-bold text-white"
              style={{
                background: "var(--color-orange)",
                boxShadow: "0 2px 8px rgba(253,137,28,0.3)",
              }}
              onClick={() => { setMobileOpen(false); trackEvent("nav_click", { link_text: "Happy Mail", mobile_or_desktop: "mobile" }) }}
            >
              <span>♥</span> Happy Mail — $13/mo
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
