"use client"

// /happy-mail — Happy Mail landing page
// Direction: "Product-grid hero." The hero IS the box. Four tiles above the
// fold show what you get (die cuts, sticker sheet, envelope, Amy's note).
// Plan-comparison cards immediately below in the same viewport. Decision
// happens without scrolling. Chosen 2026-05-27 from Option A/B/C preview;
// previous design archived in git history (commit prior to FNF branch merge).

import Image from "next/image"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import { useCart } from "@/context/cart"
import { trackEvent } from "@/lib/analytics"

const HM_VARIANT_MONTHLY_GID = process.env.NEXT_PUBLIC_HM_VARIANT_MONTHLY_GID ?? "gid://shopify/ProductVariant/51926357311808"
const HM_VARIANT_6MONTH_GID = process.env.NEXT_PUBLIC_HM_VARIANT_6MONTH_GID ?? "gid://shopify/ProductVariant/51998971068736"
const SELLING_PLAN_1MO = process.env.NEXT_PUBLIC_HM_SELLING_PLAN_1MO ?? "gid://shopify/SellingPlan/693610938688"
const SELLING_PLAN_6MO = process.env.NEXT_PUBLIC_HM_SELLING_PLAN_6MO ?? "gid://shopify/SellingPlan/693625356608"
const PRICE_MONTHLY = 13
const PRICE_6MONTH = 72

const BOX_CONTENTS = [
  { label: "Die cuts", body: "New designs every month", img: "/images/products/juicybitsstickers-happyedition/1.jpg" },
  { label: "Sticker sheet", body: "Exclusive, before anyone else", img: "/images/products/hearthealinghappiness-sticker-book/2.jpg" },
  { label: "An envelope from Amy", body: "Sent straight to your door", img: "/images/products/happy-mail/2.jpg" },
  { label: "A note from Amy", body: "What she's making, what she loves", img: "/images/products/happy-mail/3.jpg" },
]

function SubscribeButton({ plan, dark = true }: { plan: "monthly" | "6-month"; dark?: boolean }) {
  const { addItem } = useCart()
  const isMonthly = plan === "monthly"
  const variantId = isMonthly ? HM_VARIANT_MONTHLY_GID : HM_VARIANT_6MONTH_GID
  const sellingPlanId = isMonthly ? SELLING_PLAN_1MO : SELLING_PLAN_6MO
  const priceAmount = isMonthly ? PRICE_MONTHLY : PRICE_6MONTH
  function handle() {
    addItem({
      variantId,
      productHandle: "happy-mail",
      title: isMonthly ? "Happy Mail — Monthly Subscription" : "Happy Mail — 6-Month Subscription",
      price: `$${priceAmount.toFixed(2)}`,
      priceAmount,
      imageUrl: "/images/products/happy-mail/1.jpg",
      sellingPlanId,
    })
    trackEvent("hm_subscribe_click", { plan, price: priceAmount.toString(), source: "happy-mail", page: "happy-mail" })
  }
  const styles = dark
    ? { background: "var(--color-orange)", color: "#fff", border: "2px solid var(--color-orange)" }
    : { background: "transparent", color: "var(--color-orange)", border: "2px solid var(--color-orange)" }
  return (
    <button onClick={handle} className="w-full py-3 text-[12px] uppercase tracking-[0.1em] font-semibold rounded-full transition-all duration-300 hover:opacity-90 cursor-pointer" style={styles}>
      {isMonthly ? `Subscribe Monthly · $${PRICE_MONTHLY}/mo` : `Get 6 Months · $${PRICE_6MONTH}`}
    </button>
  )
}

export default function HappyMailPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--color-white)" }}>
      <PageEngagementTracker page="happy-mail" />

      <section className="px-4 md:px-10 pt-10 md:pt-16 pb-8 md:pb-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>Monthly Subscription</p>
          <h1 className="text-[36px] md:text-[52px] font-bold leading-[1.05] tracking-tight mb-4" style={{ color: "var(--color-text-primary)" }}>Every month, a letter from me.</h1>
          <p className="text-[16px] md:text-[18px] leading-relaxed max-w-xl mb-8" style={{ color: "var(--color-text-secondary)" }}>Die cuts, stickers, an envelope from Amy, and a note. The good kind of mail.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {BOX_CONTENTS.map((item) => (
              <div key={item.label} className="rounded-xl overflow-hidden">
                <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-2">
                  <Image src={item.img} alt={item.label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>{item.label}</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscribe" className="px-4 md:px-10 pb-12 md:pb-16">
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl p-5 border" style={{ background: "var(--color-white)", borderColor: "var(--color-border)" }}>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>Monthly</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>${PRICE_MONTHLY}</span>
              <span className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>/month</span>
            </div>
            <p className="text-[11px] mb-4" style={{ color: "var(--color-text-secondary)" }}>Renews monthly · cancel anytime</p>
            <SubscribeButton plan="monthly" dark={false} />
          </div>
          <div className="rounded-2xl p-5 border-2 relative" style={{ background: "var(--color-white)", borderColor: "var(--color-orange)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] uppercase tracking-[0.12em] font-bold rounded-full text-white" style={{ background: "var(--color-teal)" }}>Best value</span>
            <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-2" style={{ color: "var(--color-orange)" }}>6 Months</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[36px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>${PRICE_6MONTH}</span>
              <span className="text-[13px] mb-1" style={{ color: "var(--color-text-secondary)" }}>one payment</span>
            </div>
            <p className="text-[11px] mb-4" style={{ color: "var(--color-teal)" }}>Save $6 · no recurring charge</p>
            <SubscribeButton plan="6-month" dark={true} />
          </div>
        </div>
        <p className="text-center text-[11px] mt-4" style={{ color: "var(--color-text-secondary)" }}>Ships around the 15th · US only · Cancel anytime</p>
      </section>

      <section className="px-4 md:px-10 py-12 md:py-16" style={{ background: "var(--color-gray-light)" }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-3" style={{ color: "var(--color-orange)" }}>What subscribers say</p>
          <p className="text-[20px] md:text-[26px] font-medium leading-snug mb-4" style={{ color: "var(--color-text-primary)" }}>"It's the only mail I look forward to. Amy puts so much care into every package — it feels like getting a letter from a friend."</p>
          <p className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>— a real subscriber (placeholder)</p>
        </div>
      </section>

      <section className="px-4 md:px-10 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[24px] md:text-[30px] font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Questions</h2>
          <div className="space-y-4 text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
            <p><span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>When does it ship?</span> Around the 15th of each month via USPS.</p>
            <p><span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Can I cancel?</span> Anytime, no questions asked.</p>
            <p><span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Can I send it as a gift?</span> Yes — enter the recipient's address at checkout.</p>
            <p><span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>International?</span> Not yet — US only for now.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
