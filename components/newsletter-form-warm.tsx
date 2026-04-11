"use client"

import { EnvelopeDoodle } from "@/components/doodles"
import { trackEvent } from '@/lib/analytics'

export default function NewsletterFormWarm({ sourcePage = 'homepage' }: { sourcePage?: string }) {
  return (
    <div>
      <EnvelopeDoodle className="mb-3" />
      <h4
        className="text-lg md:text-xl font-extrabold mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        Bring some zest to your inbox
      </h4>
      <p
        className="text-[13px] md:text-sm mb-4 md:mb-5 leading-normal"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Creativity tips, new product drops, and the occasional discount. From Amy, not a robot.
      </p>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); trackEvent('newsletter_signup', { source_page: sourcePage }) }}>
        <input
          type="email"
          className="flex-1 px-3.5 md:px-4 py-3 md:py-3.5 rounded-xl text-sm md:text-[15px] border-2 outline-none"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-white)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-sans)",
          }}
          placeholder="amy@example.com"
        />
        <button
          type="submit"
          className="px-5 md:px-7 py-3 md:py-3.5 rounded-xl text-sm md:text-[15px] font-bold text-white"
          style={{
            background: "var(--color-orange)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Join
        </button>
      </form>
    </div>
  )
}
