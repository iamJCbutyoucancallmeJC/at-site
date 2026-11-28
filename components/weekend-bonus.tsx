import Image from "next/image"

// Amy's weekend bonus on /shop (t2113): shows once the shop is open, through
// Sunday night Pacific (lib/shop-refresh.ts bonusActive). A small photograph of
// the sticker beside the words, so the offer reads as a thing and not a notice.
export default function WeekendBonus() {
  return (
    <section className="mx-4 md:mx-10 mt-6 md:mt-8" aria-label="Weekend bonus">
      <div className="rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6" style={{ background: "var(--color-paper)" }}>
        <div className="relative shrink-0 w-[92px] h-[92px] md:w-[132px] md:h-[132px] rounded-xl overflow-hidden">
          <Image
            src="/images/shop/bonus-sticker-square.jpg"
            alt="Amy's I'm a little obsessed sticker on a notebook cover"
            fill
            className="object-cover"
            sizes="132px"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] md:text-[13px] font-bold uppercase tracking-[0.12em] leading-tight mb-1.5 md:mb-2" style={{ color: "var(--color-orange-ink)" }}>
            This weekend only
          </p>
          <h2 className="text-[18px] md:text-[26px] font-bold leading-[1.2] tracking-tight mb-1 md:mb-2" style={{ color: "var(--color-ink)" }}>
            A bonus sticker with every order over $50
          </h2>
          <p className="text-[14px] md:text-[17px] leading-snug md:leading-relaxed" style={{ color: "var(--color-ink)" }}>
            Amy tucks an &ldquo;I&rsquo;m a little obsessed&rdquo; sticker in your package. No code needed. 1 per customer, while they last.
          </p>
        </div>
      </div>
    </section>
  )
}
