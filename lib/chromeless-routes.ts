// Routes that render WITHOUT the global Nav / Footer / CartDrawer.
//
// The root layout (app/layout.tsx) wraps every page in Nav + Footer + CartDrawer,
// so an "isolated" page (e.g. a QR-gated event landing reached at the booth)
// can't escape the chrome via a route group — there is a single root layout that
// owns the <html>/<body>. Instead Nav, Footer, and CartDrawer each consult this
// list via usePathname() and render null on a match. Single source of truth so
// the three components never drift.
//
// Event pages are deliberately chromeless: no nav to wander off into, no footer,
// no cart drawer — checkout is a single direct-to-Shopify redirect.

const CHROMELESS_PREFIXES = [
  "/paperworld", // Seattle Paper World event page (t824)
  "/amzn",       // Amazon affiliate QR landings, e.g. /amzn/book (booth book QR)
  "/keep",       // Happy Mail originals renewal landing (cliff campaign, t759/t821)
  "/back",       // Happy Mail re-collection landing (t766 ghost arc; mint-on-click)
]

export function isChromelessRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  return CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  )
}
