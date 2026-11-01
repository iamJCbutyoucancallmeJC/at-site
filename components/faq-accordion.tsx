"use client"

import { useEffect, useState } from "react"
import { Plus, Minus } from "lucide-react"

type FaqItem = { q: string; a: string; lead?: string; link?: { href: string; label: string } }

// Phase 4 (2026-11-01): questions at the h4 style (18px / 600, ink), answers in body
// (16px / 1.6, ink-soft) at the 42rem measure. Shared by /happy-mail, its
// international twin and /happy-mail/update-card.

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
    <div className="divide-y divide-[color:var(--color-border)]">
      {items.map((item, i) => (
        <div key={i} id={faqId(item.q)} className="scroll-mt-24">
          <button
            className="w-full flex items-center justify-between gap-4 py-5 text-left"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span
              className="text-[18px] font-semibold leading-[1.3]"
              style={{ color: "var(--color-ink)" }}
            >
              {item.q}
            </span>
            <span className="flex-shrink-0" style={{ color: "var(--color-orange-ink)" }}>
              {open === i ? <Minus size={20} /> : <Plus size={20} />}
            </span>
          </button>
          {open === i && (
            <div
              className="pb-5 text-[16px] leading-[1.6] max-w-[42rem]"
              style={{ color: "var(--color-ink-soft)" }}
            >
              {item.lead && (
                <p
                  className="text-[18px] md:text-[20px] font-extrabold leading-tight mb-2"
                  style={{ color: "var(--color-teal-ink)" }}
                >
                  {item.lead}
                </p>
              )}
              <p>{item.a}</p>
              {item.link && (
                <p className="mt-2">
                  <a
                    href={item.link.href}
                    style={{ color: "var(--color-orange-ink)", textDecoration: "underline" }}
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
