"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

type FaqItem = { q: string; a: string; lead?: string; link?: { href: string; label: string } }

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
      {items.map((item, i) => (
        <div key={i}>
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
