// /glimmers : the public sales page for Glimmers and Gratitude (t1102).
//
// Copy is Amy's voice, built from glimmers-sales-page-draft-2026-09-23.md with
// the rulings since: four printables (10/8), any journal, the Q&A as a video
// partway through the month (9/23). Amy's 10/27 edits are in as she wrote them:
// the intro, "Who it is for", and the supplies answer, which links her 2023
// journal on Amazon under her Associates tag. Amy edits the words; the shape stays.
//
// Hidden on production until lib/classes.ts says `sales.live: true` (the Oct 26
// commit); preview deploys and the dev server always render it so Amy can read
// it. The Join button checks the Storefront API at the moment of the click, so
// until class-go-live.mjs --open the page says when checkout opens.
//
// 10/29 conversion pass (branch glimmers-landing-review; checklist in the vault,
// A5 Job/Linslow/Clients/Amy Tangerine/sales-page-guide.md): the four facts beside
// the first button, the button label matching the launch email ("Join the class
// for $45"), an "About Amy" block from her own About page in place of
// testimonials (none exist for this class yet), four FAQ answers for the
// objections a buyer actually has, captions on the video. Amy's own words (the
// intro, "Who it is for", the supplies answer) are untouched.

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
import { withTag } from "@/lib/affiliate"

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
  // A shared link (Instagram bio, a text to a friend) shows Amy with the journal,
  // not the site-wide card.
  openGraph: {
    title: "Glimmers and Gratitude, a November class with Amy Tangerine",
    description: "Thirty days of noticing the small good things. One prompt a day, in your own journal, starting November 1.",
    url: "/glimmers",
    images: [{ url: "/images/classes/glimmers-amy-journal.jpg", width: 1200, height: 1600, alt: "Amy Tangerine holding her Glimmers and Gratitude journal" }],
  },
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

// Amy's 2023 Glimmers and Gratitude journal (JC, 10/27).
const JOURNAL_URL = withTag("https://www.amazon.com/dp/B0CLNXSR2G")

const QUESTIONS: [string, React.ReactNode][] = [
  ["When does it start?", "Day 1 opens Sunday, November 1. Day 30 is November 30."],
  // Amy's own words: "at least 10 minutes" (her 10/27 edit), "some days you write, some
  // days you decorate a page" (the class-is-open video).
  ["How much time does it take?", "Carve out at least 10 minutes a day. Some days you write, some days you decorate a page."],
  ["What if I fall behind?", "Nothing closes. Each day opens on its day and stays open. Do two on a Saturday."],
  ["Can I join after November 1?", "Yes. Every day that has already opened is waiting for you, so you start at Day 1 and catch up at your own pace."],
  ["How do I get the class?", "Your link arrives by email after checkout. It opens the class on your phone or laptop, with nothing to log in to. Questions about an order go to help@amytangerine.com."],
  ["Do I need special supplies?", (
    <>
      A journal and a pen. Any supplies you would like to use. If you want the exact journal Amy used and made for the workshop back in 2023, it is{" "}
      <a href={JOURNAL_URL} target="_blank" rel="sponsored noopener" className="underline underline-offset-4">Glimmers and Gratitude on Amazon<span className="sr-only"> (opens in a new tab)</span></a>
      . There are color printables provided. If you don&apos;t have a working printer, Amy suggests what she does: get them printed by a local print shop for about $1 a page.
    </>
  )],
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
  // Same words as the launch email's button (email-copy-guide.md: the label matches the page).
  const joinLabel = code ? "Join the class with your code" : `Join the class for ${price}`
  const facts = [code ? "$10 with your code" : `${price}, lifetime access`, "November 1 to 30", "One prompt a day", "Any journal works"]
  const secondary = "text-[var(--color-text-secondary)]"

  return (
    <main className="max-w-6xl mx-auto px-5 md:px-10 py-10 md:py-16">
      <PageEngagementTracker page={`class-${SLUG}-sales`} />

      <section className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] font-semibold mb-5" style={{ color: "var(--color-orange-ink)" }}>
            A thirty-day class with Amy
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">{c.title}</h1>
          <p className="text-lg md:text-xl leading-relaxed mb-6">
            Thirty days of noticing the small good things. One prompt a day, in your own journal, starting November 1.
          </p>
          <ul aria-label="The class at a glance" className="flex flex-wrap gap-2 mb-8">
            {facts.map((f) => (
              <li key={f} className="text-[14px] md:text-[15px] font-semibold rounded-full px-3 md:px-4 py-1 md:py-1.5" style={{ background: "var(--color-orange-light)", color: "var(--color-text-primary)" }}>
                {f}
              </li>
            ))}
          </ul>
          <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
          {code ? (
            <p className="text-sm leading-relaxed mt-5" style={{ color: "var(--color-text-primary)" }}>
              Your returning-student code <span className="font-semibold">{code}</span> is applied at checkout, so your price is $10.
            </p>
          ) : null}
          {/* The $10 line lives by the price and in the FAQ: a first-time visitor should not
              meet someone else's price beside her first button (round 1, CRO). */}
          <p className={`text-sm leading-relaxed mt-5 ${secondary}`}>
            Already joined for November?{" "}
            <Link href={`/classes/${SLUG}`} className="underline underline-offset-4" style={{ color: "var(--color-text-primary)" }}>
              Open your class
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
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
          <figcaption className={`text-sm mt-3 ${secondary}`}>Amy, with the journal she keeps on her desk.</figcaption>
        </figure>
      </section>

      {open ? (
        <section className="mt-14 md:mt-20 max-w-3xl">
          {/* Captions transcribed from the 10/29 cut (56 s, Bunny 6c8598a4). A re-cut needs a new file. */}
          <DemoPlayer hls={open.hls} hlsQuery={open.hlsQuery} mp4={open.mp4} poster={open.poster} captions="/classes/glimmers-class-is-open.vtt" label="Amy on Glimmers and Gratitude, under a minute" />
        </section>
      ) : null}

      <section className="mt-14 md:mt-20 max-w-3xl space-y-6 text-lg leading-relaxed">
        <p>
          A glimmer is the opposite of a trigger: a small moment that makes you feel calm, safe, or quietly glad. The light through the kitchen window. The first sip. A note in someone else&apos;s handwriting. They are everywhere, and most of them go by unnoticed.
        </p>
        <p>
          This class is 30 days of catching them. Every morning a new prompt opens. You write, sketch, tape something in, or simply make a list. You deserve to carve out at least 10 minutes to notice and play with your supplies. By the end of the month you have a journal that might not be completely finished, but it will certainly be full.
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
              Buy the class and your link arrives by email. Open it on your phone or your laptop, on as many devices as you like. Each day&apos;s prompt opens on its day, so the month has a rhythm instead of a pile. Miss a day, catch up whenever you like. Nothing to log in to, no password to remember.
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

      {available ? (
        <section className="mt-12 md:mt-14 max-w-3xl">
          <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
        </section>
      ) : null}

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
          Anyone who wants a consistent gratitude journaling practice that is creative and easeful. You do not need to be a scrapbooker or an artist. If you have ever kept a journal for three days and stopped, this is built for you: the prompt shows up, you answer. The process is easy and fun.
        </p>
      </section>

      {/* Trust in place of testimonials: the class has none on record yet, so this is
          Amy's own About page, in its words. Real student words replace nothing here;
          they go above the price once Amy has some (sales-page-guide.md). */}
      <section className="mt-14 md:mt-20 max-w-3xl flex flex-col sm:flex-row gap-6 sm:items-center">
        <Image
          src="/images/about/amy-hero.webp"
          alt=""
          width={120}
          height={150}
          className="rounded-2xl object-cover w-[96px] h-[120px] flex-shrink-0"
        />
        <div>
          <h2 className="text-2xl font-bold mb-3">About Amy</h2>
          <p className="text-lg leading-relaxed">
            Amy Tangerine is a modern-day memory keeper and self-proclaimed hobby collector, with creative journaling at the heart of it all. She has taught crafty workshops all over the world and filmed tons of YouTube videos, and she&apos;s all about helping others find joy in crafting a life they love.{" "}
            <Link href="/about" className="underline underline-offset-4">More about Amy</Link>
          </p>
        </div>
      </section>

      <section className="mt-14 md:mt-20 max-w-3xl rounded-2xl p-7 md:p-10" style={{ background: "var(--color-orange-light)" }}>
        <h2 className="text-2xl font-bold mb-3">The price</h2>
        {code ? (
          <>
            <p className="text-3xl font-semibold mb-2">$10 <span className="text-base font-normal">USD, with your code (usually {price})</span></p>
            <p className="text-lg leading-relaxed mb-7">For the class, with lifetime access. Your code is applied at checkout.</p>
          </>
        ) : (
          <>
            <p className="text-3xl font-semibold mb-2">{price} <span className="text-base font-normal">USD</span></p>
            <p className="text-lg leading-relaxed mb-7">For the class, with lifetime access.</p>
          </>
        )}
        <JoinClassButton slug={SLUG} available={available} label={joinLabel} notYet={notYet} code={code} />
        {code ? null : (
          <p className="text-base leading-relaxed mt-7">
            If you took Glimmers and Gratitude in 2023, your price is $10 with the code in your email. Can&apos;t find it? Write to{" "}
            <a href="mailto:help@amytangerine.com" className="underline underline-offset-4">help@amytangerine.com</a>{" "}
            and we will find you.
          </p>
        )}
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
        <p className={`text-sm mt-8 ${secondary}`}>As an Amazon Associate, Amy earns from qualifying purchases.</p>
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
