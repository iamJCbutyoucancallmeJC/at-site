import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import GiftForm from "./gift-form"
import { getProductByHandle } from "@/lib/shopify"
import { GIFT_CHECKOUT_ENABLED, GIFT_HANDLE, GIFT_PRICE, GIFT_VARIANT } from "@/lib/gift"
import { hmIsClosed } from "@/lib/happy-mail-content"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Give six months of Happy Mail | Amy Tangerine",
  description: "Give a little mailbox joy. Six months of Happy Mail for $72, redeemed by your recipient with their own email and shipping address.",
  alternates: { canonical: "/gift" },
}

export default async function GiftPage() {
  let available = false
  try {
    const product = await getProductByHandle(GIFT_HANDLE)
    const variant = product?.variants.nodes.find((v) => v.id === GIFT_VARIANT)
    available = GIFT_CHECKOUT_ENABLED && !!variant?.availableForSale && variant.price.currencyCode === "USD" && Number(variant.price.amount) === GIFT_PRICE
  } catch { /* Keep the explanation available during a Shopify outage. */ }
  const closed = hmIsClosed()
  return (
    <main className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-16">
      <Link href="/happy-mail" className="text-sm underline underline-offset-4">About Happy Mail</Link>
      {!available && <p role="status" className="mt-6 rounded-lg bg-[var(--color-orange-light)] p-4 leading-relaxed">Gift checkout is not open yet. Please don't buy a gift as another subscription on your account. For help with a gift, <a href="mailto:help@amytangerine.com" className="underline">email help@amytangerine.com</a>.</p>}
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-7 items-start">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">Give six months of mailbox joy.</h1>
          <p className="text-lg leading-relaxed mb-7">An envelope from Amy each month, filled with stickers, die cuts, a note, and little surprises. Their name hand-lettered on the front.</p>
          <Image src="/images/happy-mail/whats-inside.jpg" alt="The stickers, paper pieces, and note inside a Happy Mail envelope" width={800} height={800} className="rounded-2xl w-full" priority />
          <p className="text-sm mt-3 text-[var(--color-text-secondary)]">A peek inside. Each month's envelope is different.</p>
          <h2 className="text-2xl font-bold mt-9 mb-4">You give it. They make it theirs.</h2>
          <ol className="list-decimal pl-5 space-y-3 leading-relaxed">
            <li>Buy the $72 gift using your own billing details.</li>
            <li>They receive an email with your note and a redemption link.</li>
            <li>They choose the 6-Month option, their start date, and their own shipping address.</li>
          </ol>
          <p className="text-sm leading-relaxed mt-5">This gift is for US delivery. For an international gift, <a className="underline" href="mailto:help@amytangerine.com">email help@amytangerine.com</a> before ordering.</p>
        </div>
        <section aria-labelledby="gift-form-title" className="md:pt-2">
          <h2 id="gift-form-title" className="text-2xl font-bold">Six months of Happy Mail</h2>
          <p className="text-3xl font-semibold mt-3 mb-2">$72 <span className="text-base font-normal">USD</span></p>
          <p className="text-sm leading-relaxed mb-7">One gift payment. No renewal on your card. The gift provides $72 toward Happy Mail; your recipient selects the six-month plan when redeeming.</p>
          <GiftForm available={available && !closed} closed={closed} />
        </section>
      </div>
    </main>
  )
}
