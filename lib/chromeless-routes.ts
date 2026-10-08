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
  "/paperworld", // fixed QR alias -> /events/<slug>/booth (t1101); kept so the redirect frame is chromeless too
  "/amzn",       // Amazon affiliate QR landings, e.g. /amzn/book (booth book QR)
  "/keep",       // Happy Mail originals renewal landing (cliff campaign, t759/t821)
  "/back",       // Happy Mail re-collection landing (t766 ghost arc; mint-on-click)
]

// Booth QR landings from the event kit (t1101): /events/<slug>/booth.
// The public /events/<slug> page keeps the chrome; only the booth page drops it.
const CHROMELESS_PATTERNS = [/^\/events\/[^/]+\/booth\/?$/]

export function isChromelessRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (CHROMELESS_PATTERNS.some((re) => re.test(pathname))) return true
  return CHROMELESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  )
}
