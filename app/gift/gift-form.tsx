"use client"

import { useMemo, useState, type FormEvent } from "react"
import { GIFT_JANUARY_LAST_SEND, GIFT_SEND_MAX_DAYS, addDays, pacificToday } from "@/lib/gift"

export default function GiftForm({ available, closed }: { available: boolean; closed: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [send, setSend] = useState<"now" | "date">("now")
  const [start, setStart] = useState<"next" | "january">("next")
  const today = useMemo(() => pacificToday(), [])
  const minDate = addDays(today, 1)
  const maxDate = (() => {
    const far = addDays(today, GIFT_SEND_MAX_DAYS)
    return start === "january" && far > GIFT_JANUARY_LAST_SEND ? GIFT_JANUARY_LAST_SEND : far
  })()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !available) return
    setBusy(true)
    setError("")
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget))
      const response = await fetch("/api/checkout/gift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const result = await response.json()
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Gift checkout could not open. Please try again.")
      window.location.assign(result.checkoutUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gift checkout could not open. Please try again.")
      setBusy(false)
    }
  }
  const input = "block w-full mt-2 border border-[var(--color-border)] rounded-lg p-3 bg-white focus:outline-2 focus:outline-black focus:outline-offset-2"
  return (
    <form onSubmit={submit} className="space-y-5">
      {!available && <p role="status" className="p-4 rounded-lg bg-[var(--color-orange-light)] leading-relaxed">{closed ? "Happy Mail is full for now." : "Gift checkout is not open yet."} {closed ? <a href="/happy-mail" className="underline">Join the waitlist.</a> : "Please check back soon."}</p>}
      <fieldset disabled={busy || !available} className="space-y-5">
        <legend className="font-semibold mb-4">Who is it for?</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <label>First name<input className={input} name="firstName" autoComplete="off" maxLength={80} required /></label>
          <label>Last name<input className={input} name="lastName" autoComplete="off" maxLength={80} required /></label>
        </div>
        <label className="block">Their email<input className={input} name="email" type="email" autoComplete="off" maxLength={254} required aria-describedby="gift-email-help" /></label>
        <p id="gift-email-help" className="text-sm leading-relaxed text-ink-soft">Use their email, not yours. Their gift email goes to this address. Double-check it before continuing.</p>
        <label className="block">Your name<input className={input} name="senderName" autoComplete="name" maxLength={160} required /></label>
        <label className="block">A note from you <span className="text-sm">(optional)</span><textarea className={input} name="message" rows={3} maxLength={500} /></label>
        <fieldset aria-describedby="gift-send-help">
          <legend className="font-semibold mb-3">When should we email them?</legend>
          <label className="flex items-start gap-3 border rounded-lg p-4 mb-3 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="send" value="now" checked={send === "now"} onChange={() => setSend("now")} />Right after you check out</label>
          <label className="flex items-start gap-3 border rounded-lg p-4 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="send" value="date" checked={send === "date"} onChange={() => setSend("date")} />On a day you choose</label>
          {send === "date" && (
            <label className="block mt-3">Send it on<input className={input} name="sendOn" type="date" min={minDate} max={maxDate} required /></label>
          )}
          <p id="gift-send-help" className="text-sm leading-relaxed mt-3 text-ink-soft">The email has your note and a link to claim their gift. Pick a day to keep it a surprise until a birthday or holiday.</p>
        </fieldset>
        <fieldset aria-describedby="gift-start-help">
          <legend className="font-semibold mb-3">When would you like their mail to start?</legend>
          <label className="flex items-start gap-3 border rounded-lg p-4 mb-3 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="start" value="next" checked={start === "next"} onChange={() => setStart("next")} />With the next available envelope</label>
          <label className="flex items-start gap-3 border rounded-lg p-4 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="start" value="january" checked={start === "january"} onChange={() => setStart("january")} />In January 2027</label>
          <p id="gift-start-help" className="text-sm leading-relaxed mt-3 text-ink-soft">If you choose January, we set their first envelope to January 2027 after they claim it.</p>
        </fieldset>
      </fieldset>
      <p className="text-sm leading-relaxed">At checkout, use your own details. Your recipient enters their address separately when they redeem.</p>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      <button disabled={busy || !available} className="cta-primary w-full">{busy ? "Opening gift checkout…" : "Continue to gift checkout · $72"}</button>
    </form>
  )
}
