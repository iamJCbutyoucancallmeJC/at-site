"use client"

export default function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        className="flex-1 px-3.5 md:px-4 py-3 md:py-3.5 rounded-lg md:rounded-[10px] text-sm md:text-[15px] border-2 outline-none"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-white)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
        }}
        placeholder="Your email"
      />
      <button
        type="submit"
        className="px-5 md:px-7 py-3 md:py-3.5 rounded-lg md:rounded-[10px] text-sm md:text-[15px] font-bold text-white"
        style={{
          background: "var(--color-coral)",
          fontFamily: "var(--font-sans)",
        }}
      >
        Join
      </button>
    </form>
  )
}
