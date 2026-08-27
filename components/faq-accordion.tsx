"use client"

import { useEffect, useState } from "react"
import { Plus, Minus } from "lucide-react"

type FaqItem = { q: string; a: string; lead?: string; link?: { href: string; label: string } }

// Stable per-question anchor id, e.g. "When does it ship?" -> "faq-when-does-it-ship"
function faqId(q: string): string {
  return (
    "faq-" +
    q
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  )
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  // On initial load, if the URL hash targets one of our questions, open it and scroll to it.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    const index = items.findIndex((item) => faqId(item.q) === hash)
    if (index === -1) return
    setOpen(index)
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [items])

  return (
    <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
      {items.map((item, i) => (
        <div key={i} id={faqId(item.q)} className="scroll-mt-24">
          <button
            className="w-full flex items-center justify-between gap-4 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span
              className="text-[14px] md:text-[15px] font-semibold leading-snug"
              style={{ color: "var(--color-text-primary)" }}
            >
              {item.q}
            </span>
            <span className="flex-shrink-0" style={{ color: "var(--color-orange)" }}>
              {open === i ? <Minus size={16} /> : <Plus size={16} />}
            </span>
          </button>
          {open === i && (
            <div
              className="pb-4 text-[14px] leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {item.lead && (
                <p
                  className="text-[18px] md:text-[20px] font-extrabold leading-tight mb-2"
                  style={{ color: "var(--color-teal)" }}
                >
                  {item.lead}
                </p>
              )}
              <p>{item.a}</p>
              {item.link && (
                <p className="mt-2">
                  <a
                    href={item.link.href}
                    style={{ color: "var(--color-orange)", textDecoration: "underline" }}
                  >
                    {item.link.label}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
