// /preview/classes/[slug]/questions : the question box, read side (t1651).
// Every question a student sent from the class home, newest first, with the
// buyer's name and email looked up from the order in Shopify. Gated by the
// preview password (proxy.ts, /preview/*). Never linked from the public site.
// Terminal equivalent: node scripts/class-questions.mjs <slug>.

import { notFound } from "next/navigation"
import { getClass } from "@/lib/classes"
import { allQuestions } from "@/lib/class-questions"
import { adminFetch } from "@/lib/shopify-admin"
import { dbConfigured } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Buyer = { name: string; email: string }

// One Admin query per distinct order number. Best effort: a miss (test order,
// scope gap, Admin down) leaves the order number, which is still enough to
// find the buyer by hand.
async function lookupBuyers(orderRefs: string[]): Promise<Map<string, Buyer>> {
  const out = new Map<string, Buyer>()
  for (const ref of orderRefs) {
    try {
      const data = await adminFetch<{ orders: { edges: { node: { email: string | null; customer: { firstName: string | null; lastName: string | null } | null } }[] } }>(
        `query($q: String!) { orders(first: 1, query: $q) { edges { node { email customer { firstName lastName } } } } }`,
        { q: `name:#${ref}` },
      )
      const node = data.orders.edges[0]?.node
      if (!node) continue
      const name = [node.customer?.firstName, node.customer?.lastName].filter(Boolean).join(" ")
      out.set(ref, { name, email: node.email ?? "" })
    } catch (e) {
      console.error("[class questions] order lookup failed", ref, (e as Error).message)
    }
  }
  return out
}

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

export default async function ClassQuestionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getClass(slug)
  if (!c) notFound()
  const rows = dbConfigured() ? await allQuestions(slug) : []
  const buyers = await lookupBuyers([...new Set(rows.map((r) => r.order_ref))])

  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <div className="px-4 md:px-10 py-2.5 text-center text-[12px] uppercase tracking-[0.12em] font-semibold" style={{ background: "var(--color-orange)", color: "#fff" }}>
        Preview only. Student questions for {c.title}; not public.
      </div>
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        <h1 className="text-[28px] font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Questions from the box
        </h1>
        <p className="text-[14px] mb-10" style={{ color: "var(--color-text-secondary)" }}>
          {rows.length} question{rows.length === 1 ? "" : "s"}, newest first. {dbConfigured() ? "" : "DATABASE_URL is not set on this deploy."}
        </p>
        {rows.length === 0 ? (
          <p className="text-[15px]" style={{ color: "var(--color-text-secondary)" }}>Nothing yet.</p>
        ) : (
          <ol className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {rows.map((r) => {
              const b = buyers.get(r.order_ref)
              return (
                <li key={r.id} className="py-5">
                  <p className="text-[12px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: "var(--color-orange)" }}>
                    {when(r.created_at)} · order #{r.order_ref}
                    {b ? <span className="normal-case tracking-normal font-normal" style={{ color: "var(--color-text-secondary)" }}> · {b.name || "(no name)"}{b.email ? ` · ${b.email}` : ""}</span> : null}
                  </p>
                  <p className="text-[16px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>{r.body}</p>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </main>
  )
}
