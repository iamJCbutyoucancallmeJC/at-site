"use client"

import { useState, type ReactNode } from "react"
import { Plus, Minus } from "lucide-react"

// The product page's accordion (design finish, Phase 2, 2026-11-10): Details, Shipping &
// returns, About Amy. The FAQ pattern (faq-accordion.tsx: 18/600 ink titles, 16/1.6 body,
// hairline dividers, plus and minus in orange-ink), with panels that take HTML and real
// h2 triggers so the heading order under the h1 holds. Closed panels stay in the DOM
// (hidden), so the description is on the page for search engines either way.

export type ProductAccordionItem = { id: string; title: string; content: ReactNode }

export default function ProductAccordion({
  items,
  defaultOpen = 0,
}: {
  items: ProductAccordionItem[]
  defaultOpen?: number
}) {
  const [open, setOpen] = useState<string | null>(items[defaultOpen]?.id ?? null)

  return (
    <div className="border-t" style={{ borderColor: "var(--color-border)" }}>
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id} className="border-b" style={{ borderColor: "var(--color-border)" }}>
            <h2 className="m-0">
              <button
                type="button"
                id={`${item.id}-trigger`}
                aria-expanded={isOpen}
                aria-controls={`${item.id}-panel`}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-[18px] font-semibold leading-[1.3]" style={{ color: "var(--color-ink)" }}>
                  {item.title}
                </span>
                <span className="shrink-0" style={{ color: "var(--color-orange-ink)" }} aria-hidden="true">
                  {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                </span>
              </button>
            </h2>
            <div
              id={`${item.id}-panel`}
              role="region"
              aria-labelledby={`${item.id}-trigger`}
              hidden={!isOpen}
              className="pb-5 text-[16px] leading-[1.6]"
              style={{ color: "var(--color-ink)" }}
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
