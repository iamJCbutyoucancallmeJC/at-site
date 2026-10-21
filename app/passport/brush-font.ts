import localFont from "next/font/local"

// Amy's own hand (AmyHandwrittenBrush, the export used on the Happy Mail
// envelope labels), loaded only on the passport routes. The -tt build adds the
// space glyph her export lacks. Letters and digits only: the font has no period
// or apostrophe, so stamp text stays within month names and years.
export const amyBrush = localFont({
  src: "./fonts/amy-brush.ttf",
  variable: "--font-brush",
  display: "swap",
})
