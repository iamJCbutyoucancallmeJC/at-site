// Pending checkout cart tokens, stashed in localStorage when a checkout is
// initiated so /thank-you can verify the round-trip and only clear the local
// cart on a real completion. See t621 (FNF Heidi 2026-05-24).
//
// Stored as a JSON array (not a single string) because a shopper can start
// checkout in two tabs: with one slot, Tab B's token overwrites Tab A's, and
// completing Tab A's order lands on /thank-you with a token that no longer
// matches, so the cart never clears. Matching against a small set fixes the
// last-writer-wins race. See t646.

const STORAGE_KEY = "at-cart-pending-token"

// Cap the stash so an abandoned-checkout habit can't grow it unbounded.
// FIFO: oldest token drops first — 5 concurrent pending checkouts is already
// far beyond real usage.
const MAX_TOKENS = 5

// Read the stashed tokens, tolerating both shapes: the current JSON array and
// the pre-t646 single raw string (tokens are hex-ish and never start with
// "["). Returns [] on missing/unreadable values.
function readTokens(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    if (raw.startsWith("[")) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string") : []
    }
    // Legacy single-string value from before the multi-tab fix.
    return [raw]
  } catch {
    return []
  }
}

function writeTokens(tokens: string[]) {
  try {
    if (tokens.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
    }
  } catch {
    // ignore (private mode / storage full) — worst case the cart doesn't
    // auto-clear on /thank-you, same as before the stash existed
  }
}

// Stash a token when initiating checkout. Dedupes (retrying the same checkout
// re-sends the same token) and keeps at most MAX_TOKENS, dropping oldest.
export function stashPendingCartToken(token: string) {
  const tokens = readTokens().filter((t) => t !== token)
  tokens.push(token)
  writeTokens(tokens.slice(-MAX_TOKENS))
}

// Called from /thank-you: returns true if cartId matches a stashed token and
// removes JUST that token, leaving other tabs' pending checkouts intact.
export function consumePendingCartToken(cartId: string): boolean {
  const tokens = readTokens()
  if (!tokens.includes(cartId)) return false
  writeTokens(tokens.filter((t) => t !== cartId))
  return true
}
