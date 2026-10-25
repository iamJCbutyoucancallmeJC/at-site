// /glimmers : the public sales page for Glimmers and Gratitude (t1102).
//
// Copy is Amy's voice, built from glimmers-sales-page-draft-2026-09-23.md with
// the rulings since: four printables (10/8), any journal (the Amazon journal
// will not be live by Nov 1, 10/8), the Q&A as a video partway through the
// month (9/23). Amy edits the words; the shape stays.
//
// Hidden on production until lib/classes.ts says `sales.live: true` (the Oct 26
// commit); preview deploys and the dev server always render it so Amy can read
// it. The Join button checks the Storefront API at the moment of the click, so
// until class-go-live.mjs --open the page says when checkout opens.

import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PageEngagementTracker from "@/components/page-engagement-tracker"
import JoinClassButton from "@/components/class/join-class-button"
import DemoPlayer from "@/components/class/demo-player"
import { getClass, salesPageVisible, formatUnlockDate } from "@/lib/classes"
import { getProductByHandle } from "@/lib/shopify"
import { playbackSource } from "@/lib/video"

export const dynamic = "force-dynamic"

const SLUG = "glimmers"
// Alumni codes arrive as /glimmers?code=GLIMMERS-XXXXXX from the Klaviyo email and are
// applied at checkout by the Join button (app/api/checkout/class). Shape-checked here so
// nothing else from the query string travels.
const CODE_SHAPE = /^[A-Z0-9-]{4,40}$/

export const metadata: Metadata = {
  title: "Glimmers and Gratitude | Amy Tangerine",
  description: "Thirty days of noticing the small good things. One prompt a day, in your own journal, starting November 1. A class with Amy Tangerine.",
  alternates: { canonical: "/glimmers" },
}

function dollars(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
}

const TASTE = [
  ["Somebody loves you", "put a card or a note in someone else's handwriting into your journal."],
  ["Pencil it in", "sketch an everyday object, and let go of the idea that you can't draw."],
  ["Things people say", "write down the sentences that delighted you this week."],
  ["Where you live", "what do you love about the place you are?"],
  ["Progress over perfection", "one area where you have seen real change, and the part gratitude played in noticing it."],
]

const QUESTIONS: [string, string][] = [
  ["When does it start?", "Day 1 opens Sunday, November 1. Day 30 is November 30."],
  ["What if I fall behind?", "Nothing closes. Each day opens on its day and stays open. Do two on a Saturday."],
  ["Do I need special supplies?", "A journal and a pen. Everything else is a bonus."],
  ["Is there a live session?", "There is a question-and-answer session on video partway through the month. You send questions in ahead of time, and the recording lives in the class."],
  ["Is this the same as the 2023 class?", "Same idea, updated. Most of the prompts that worked are back, freshened, and a few are new. If you took it before, your price is $10."],
  ["How long do I have access?", "For good. The link in your email never expires."],
]

export default async function GlimmersSalesPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const c = getClass(SLUG)
  if (!c || !salesPageVisible(c)) notFound()
  const sp = await searchParams
  const code = typeof sp.code === "string" && CODE_SHAPE.test(sp.code.trim().toUpperCase()) ? sp.code.trim().toUpperCase() : ""
  // v1 "the class is open" (shot 10/8, re-cut 10/15 without the Amazon line), on Bunny.
  const open = c.openVideo ? await playbackSource(c.openVideo) : null

  let available = false
  let price = dollars(c.sales.price)
  try {
    const product = await getProductByHandle(c.sales.productHandle, "US")
    const v = product?.variants.nodes[0]
    if (v?.availableForSale && v.price.currencyCode === "USD") {
      available = true
      price = dollars(Number(v.price.amount))
    }
  } catch { /* Shopify down: the page still reads; the button says not yet. */ }
  const notYet = `Checkout opens ${formatUnlockDate(c.sales.onSaleDate)}. Day 1 is Sunday, November 1.`
  const joinLabel = code ? "Join the class with your code" : `Join the class, ${price}`
  const secondary = "text-[var(--color-text-secondary)]"

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-16">
      <PageEngagementTracker page={`class-${SLUG}-sales`} />

      <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-5" style={{ color: "var(--color-orange)" }}>
            A thirty-day class with Amy
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">{c.title}</h1>
          <p className="text-lg md:text-xl leading-relaxed mb-8">
            Thirty days of noticing the small good things. One prompt a day, in your own journal, starting November 1.
          </p>
          <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
          {code ? (
            <p className="text-sm leading-relaxed mt-5" style={{ color: "var(--color-text-primary)" }}>
              Your returning-student code <span className="font-semibold">{code}</span> is applied at checkout, so your price is $10.
            </p>
          ) : null}
          <p className={`text-sm leading-relaxed mt-5 ${secondary}`}>
            {code ? "" : "Took the class in 2023? Your link is in your inbox. "}
            Already in the class?{" "}
            <Link href={`/classes/${SLUG}`} className="underline underline-offset-4" style={{ color: "var(--color-text-primary)" }}>
              Open it
            </Link>
            .
          </p>
        </div>
        <figure>
          <Image
            src="/images/classes/glimmers-amy-journal.jpg"
            alt="Amy Tangerine in her studio, holding her Glimmers and Gratitude journal"
            width={1200}
            height={1600}
            className="rounded-2xl w-full h-auto"
            priority
          />
          <figcaption className={`text-sm mt-3 ${secondary}`}>Amy, with the journal she keeps on her desk.</figcaption>
        </figure>
      </section>

      {open ? (
        <section className="mt-14 md:mt-20 max-w-3xl">
          <DemoPlayer hls={open.hls} hlsQuery={open.hlsQuery} mp4={open.mp4} poster={open.poster} caption="Amy on the class, a minute and a quarter." />
        </section>
      ) : null}

      <section className="mt-14 md:mt-20 max-w-3xl space-y-6 text-lg leading-relaxed">
        <p>
          A glimmer is the opposite of a trigger: a small moment that makes you feel calm, safe, or quietly glad. The light through the kitchen window. The first sip. A note in someone else&apos;s handwriting. They are everywhere, and most of them go by unnoticed.
        </p>
        <p>
          This class is thirty days of catching them. Every morning a new prompt opens. You write, sketch, tape something in, or just make a list. Ten minutes is plenty. By the end of the month you have a journal that is not finished, but full.
        </p>
        <p>
          I first ran Glimmers and Gratitude in 2023 and I still keep the journal from it on my desk. This is the updated version: the prompts that landed, freshened, with a few new ones, and a place to do it that is finally on my own site.
        </p>
      </section>

      <section className="mt-14 md:mt-20 grid md:grid-cols-2 gap-10 md:gap-16 max-w-5xl">
        <div>
          <h2 className="text-2xl font-bold mb-5">What you get</h2>
          <ul className="space-y-4 text-lg leading-relaxed list-disc pl-5">
            <li>Thirty daily prompts, one opening each morning from November 1 through November 30, so the month runs right through Thanksgiving.</li>
            <li>Four printables to cut out and add to your pages.</li>
            <li>A question-and-answer session on video partway through the month: you send your questions ahead, I answer them on camera, and the recording goes into the class.</li>
            <li>Lifetime access. Your link never expires, and the prompts stay yours to come back to in January, or next November.</li>
          </ul>
        </div>
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">How it works</h2>
            <p className="text-lg leading-relaxed">
              Buy the class and your link arrives by email. Open it on your phone or your laptop, on as many devices as you like. Each day&apos;s prompt unlocks on its day, so the month has a rhythm instead of a pile. Miss a day, catch up whenever you like. Nothing to log in to, no password to remember.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">What you need</h2>
            <p className="text-lg leading-relaxed">
              A journal and whatever you already have: pens, tape, stickers, a glue stick, scraps. Any notebook works.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 md:mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold mb-5">A taste of the month</h2>
        <ul className="space-y-4 text-lg leading-relaxed">
          {TASTE.map(([lead, rest]) => (
            <li key={lead}>
              <span className="font-semibold">{lead}:</span> {rest}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 md:mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Who it is for</h2>
        <p className="text-lg leading-relaxed">
          Anyone who wants a gratitude practice that is creative instead of dutiful. You do not need to be a scrapbooker or a good drawer. If you have ever kept a journal for three days and stopped, this is built for you: the prompt shows up, you answer it, that is the whole thing.
        </p>
      </section>

      <section className="mt-14 md:mt-20 max-w-3xl rounded-2xl p-7 md:p-10" style={{ background: "var(--color-orange-light)" }}>
        <h2 className="text-2xl font-bold mb-3">The price</h2>
        <p className="text-3xl font-semibold mb-2">{price} <span className="text-base font-normal">USD</span></p>
        <p className="text-lg leading-relaxed mb-7">For the class, with lifetime access.</p>
        <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
        <p className="text-base leading-relaxed mt-7">
          If you took Glimmers and Gratitude in 2023, your price is $10. Check your email for your link, or write to{" "}
          <a href="mailto:help@amytangerine.com" className="underline underline-offset-4">help@amytangerine.com</a>{" "}
          and we will find you.
        </p>
      </section>

      <section className="mt-14 md:mt-20 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Questions</h2>
        <dl className="space-y-7">
          {QUESTIONS.map(([q, a]) => (
            <div key={q}>
              <dt className="text-lg font-semibold mb-1">{q}</dt>
              <dd className="text-lg leading-relaxed">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {available ? (
        <section className="mt-14 md:mt-20 max-w-3xl">
          <p className="text-lg leading-relaxed mb-6">Day 1 opens Sunday, November 1.</p>
          <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
        </section>
      ) : null}
    </main>
  )
}
