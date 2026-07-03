#!/usr/bin/env python3
"""
Neutralize dead in-body links: replace <a href="DEAD">text</a> with the plain
text, so an old post's sentence still reads but doesn't send a 2026 reader to a
404 / decommissioned platform. Live and ambiguous links are LEFT clickable.

Two sources of "dead" (JC decisions 2026-06-26 + 2026-07-03):
  1. DEAD_HOSTS -- hosts confirmed dead or about to be (Amy's own decommissioned
     platforms + defunct community sites + shut-down shorteners + shuttered craft
     companies). Host-level, no probe needed.
  2. _link-probe.json -- per-URL liveness verdicts from probe-links.py. A specific
     URL marked "dead" (404/410, DNS failure, or resolves to a dead host) gets
     stripped even when its host isn't globally dead (a single dead bit.ly, a
     404'd affiliate link). "alive" and "uncertain" URLs are KEPT -- stripping a
     working affiliate link is worse than a possibly-stale one, and an uncertain
     shortener (403 to a bot) stays clickable.

Operates on content/blog/posts/*.json bodies in place. Idempotent. Run --dry-run
first to see the count. Pass --no-probe to strip on the host list only.

Run: python3 scripts/blog-migration/strip-dead-links.py [--dry-run] [--no-probe]
"""
import argparse, json, re
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[2]
POSTS_DIR = REPO / "content" / "blog" / "posts"
PROBE = REPO / "content" / "blog" / "_link-probe.json"

# Never strip Amy's own internal links: the site's own redirect map (next.config)
# owns those, and old /blog/... paths that 404 on production TODAY will 301 once
# this branch merges -- a probe run against current prod would false-positive them.
OWN_HOST = "amytangerine.com"

# Hosts (www. stripped) whose links get unwrapped to plain text. Confirmed dead
# (probed 404/503/403; kept in sync with probe-links.py KNOWN_DEAD_HOSTS):
DEAD_HOSTS = {
    # Amy's own decommissioned platforms
    "amy-tan-z6av.squarespace.com",   # old SQS staging subdomain
    "static.squarespace.com",          # SQS static assets (site going away)
    "shop.amytangerine.com",           # old shop (replaced by Shopify /shop)
    "amytangerine.blogspot.com",       # pre-SQS blogspot
    # defunct community / platforms
    "twopeasinabucket.com",            # shut down ~2018
    "americancrafts.typepad.com",      # abandoned typepad
    "lm.inlinkz.com",                  # expired blog-hop linkup widgets
    "inlinkz.com",
    "studiocalico.com",                # subscription craft co., shut down ~2020
    "getchittrchattr.com",             # defunct
    # shut-down URL shorteners
    "goo.gl",                          # Google shortener, dead since 2024
}


def host_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().replace("www.", "")
    except ValueError:
        return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-probe", action="store_true", help="host list only; ignore _link-probe.json")
    args = ap.parse_args()

    probe = {}
    if not args.no_probe and PROBE.exists():
        probe = json.loads(PROBE.read_text())

    def is_dead(url: str) -> str | None:
        """Return the reason a link is dead (for reporting), or None to keep it."""
        if host_of(url) == OWN_HOST:
            return None  # internal link -> the redirect map owns it, never strip
        if host_of(url) in DEAD_HOSTS:
            return f"host:{host_of(url)}"
        if probe.get(url, {}).get("status") == "dead":
            return "probe:dead"
        return None  # alive / uncertain / unprobed -> KEEP clickable

    # Match <a ...href="...">inner</a>; unwrap to inner when the link is dead.
    A_RE = re.compile(r'<a\b[^>]*\bhref="([^"]*)"[^>]*>(.*?)</a>', re.S | re.I)
    stripped = posts_touched = 0
    by_reason = {}

    for f in sorted(POSTS_DIR.glob("*.json")):
        post = json.loads(f.read_text())
        changed = False

        def repl(m):
            nonlocal stripped, changed
            url, inner = m.group(1), m.group(2)
            reason = is_dead(url)
            if reason:
                stripped += 1
                key = reason if reason.startswith("probe") else reason
                by_reason[key] = by_reason.get(key, 0) + 1
                changed = True
                return inner  # keep the text, drop the dead link
            return m.group(0)

        new_body = A_RE.sub(repl, post["body"])
        if changed:
            posts_touched += 1
            if not args.dry_run:
                post["body"] = new_body
                f.write_text(json.dumps(post, ensure_ascii=False, indent=2))

    print(f"{'DRY RUN: ' if args.dry_run else ''}"
          f"stripped {stripped} dead links across {posts_touched} posts "
          f"(probe cache: {len(probe)} urls)")
    for r, c in sorted(by_reason.items(), key=lambda x: -x[1])[:20]:
        print(f"  {c:5}  {r}")


if __name__ == "__main__":
    main()
