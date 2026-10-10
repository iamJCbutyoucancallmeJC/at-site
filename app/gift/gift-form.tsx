"use client"

import { useState, type FormEvent } from "react"

export default function GiftForm({ available, closed }: { available: boolean; closed: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
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
        <p id="gift-email-help" className="text-sm leading-relaxed text-[var(--color-text-secondary)]">Use their email, not yours. Their gift email is sent after purchase. Double-check it before continuing.</p>
        <label className="block">Your name<input className={input} name="senderName" autoComplete="name" maxLength={160} required /></label>
        <label className="block">A note from you <span className="text-sm">(optional)</span><textarea className={input} name="message" rows={3} maxLength={500} /></label>
        <fieldset aria-describedby="gift-start-help">
          <legend className="font-semibold mb-3">When would you like their mail to start?</legend>
          <label className="flex items-start gap-3 border rounded-lg p-4 mb-3 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="start" value="next" defaultChecked />With the next available envelope</label>
          <label className="flex items-start gap-3 border rounded-lg p-4 border-[var(--color-border)] cursor-pointer"><input className="mt-1" type="radio" name="start" value="january" />In January 2027</label>
          <p id="gift-start-help" className="text-sm leading-relaxed mt-3 text-[var(--color-text-secondary)]">Their gift email goes out right away either way. If you choose January, we set their first envelope to January 2027 after they redeem.</p>
        </fieldset>
      </fieldset>
      <p className="text-sm leading-relaxed">At checkout, use your own details. Your recipient enters their address separately when they redeem.</p>
      {error && <p role="alert" className="text-red-800">{error}</p>}
      <button disabled={busy || !available} className="w-full rounded-full p-4 font-semibold bg-[var(--color-orange)] text-black disabled:bg-gray-100 disabled:text-gray-500 enabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">{busy ? "Opening gift checkout…" : "Continue to gift checkout · $72"}</button>
    </form>
  )
}
