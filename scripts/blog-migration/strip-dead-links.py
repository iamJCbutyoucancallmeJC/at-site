#!/usr/bin/env python3
"""
Neutralize known-dead in-body links: replace <a href="DEAD">text</a> with the
plain text, so an old post's sentence still reads but doesn't send a 2026 reader
to a 404 / decommissioned platform. Live and ambiguous links are LEFT clickable.

Conservative by design (JC review 2026-06-26): only strip hosts confirmed dead or
about to be (Amy's own decommissioned platforms + defunct community sites +
shut-down shorteners). Affiliate links / shorteners that MAY still redirect
(bit.ly, avantlink, shareasale, shrsl, amzn.to) are KEPT -- stripping a working
affiliate link is worse than a possibly-stale one.

Operates on content/blog/posts/*.json bodies in place. Idempotent. Run --dry-run
first to see the count.

Run: python3 scripts/blog-migration/strip-dead-links.py [--dry-run]
"""
import argparse, json, re
from pathlib import Path
from urllib.parse import urlparse

REPO = Path(__file__).resolve().parents[2]
POSTS_DIR = REPO / "content" / "blog" / "posts"

# Hosts (www. stripped) whose links get unwrapped to plain text. Confirmed dead
# 2026-06-26 (probed: 404/503/403):
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
    args = ap.parse_args()

    # Match <a ...href="...">inner</a>; unwrap to inner when host is dead.
    A_RE = re.compile(r'<a\b[^>]*\bhref="([^"]*)"[^>]*>(.*?)</a>', re.S | re.I)
    stripped = posts_touched = 0
    by_host = {}

    for f in sorted(POSTS_DIR.glob("*.json")):
        post = json.loads(f.read_text())
        changed = False

        def repl(m):
            nonlocal stripped, changed
            url, inner = m.group(1), m.group(2)
            if host_of(url) in DEAD_HOSTS:
                stripped += 1
                by_host[host_of(url)] = by_host.get(host_of(url), 0) + 1
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
          f"stripped {stripped} dead links across {posts_touched} posts")
    for h, c in sorted(by_host.items(), key=lambda x: -x[1]):
        print(f"  {c:5}  {h}")


if __name__ == "__main__":
    main()
