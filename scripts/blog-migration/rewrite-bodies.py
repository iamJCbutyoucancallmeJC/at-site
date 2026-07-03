#!/usr/bin/env python3
"""
Final migration step: rewrite legacy Squarespace image URLs in post bodies to
their Shopify-CDN equivalents, using the map from upload-images.py.

Run AFTER download-images.py + upload-images.py are complete (the URL map must
cover every SQS image, or unmapped ones are left pointing at SQS and reported).

Rewrites content/blog/posts/*.json bodies in place (and re-emits _posts.json
imageCount). Idempotent: an already-Shopify URL is left alone. Run with --dry-run
first to see coverage.

Run: python3 scripts/blog-migration/rewrite-bodies.py [--dry-run]
"""
import argparse, json, re
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
POSTS_DIR = REPO / "content" / "blog" / "posts"
INDEX = REPO / "content" / "blog" / "_posts.json"
URL_MAP = HERE / "image-url-map.json"
KEEP_HOST = "images.squarespace-cdn.com"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    url_map = json.loads(URL_MAP.read_text())
    rewritten = unmapped = posts_touched = 0
    unmapped_urls = set()

    index = {p["slug"]: p for p in json.loads(INDEX.read_text())}

    for f in sorted(POSTS_DIR.glob("*.json")):
        post = json.loads(f.read_text())
        body = post["body"]
        changed = False

        def repl(m):
            nonlocal rewritten, unmapped, changed
            url = m.group(1)
            if urlparse(url).netloc != KEEP_HOST:
                return m.group(0)
            if url in url_map:
                rewritten += 1
                changed = True
                return m.group(0).replace(url, url_map[url])
            unmapped += 1
            unmapped_urls.add(url)
            return m.group(0)

        new_body = re.sub(r'<img[^>]+src="([^"]+)"', repl, body)
        if changed and not args.dry_run:
            post["body"] = new_body
            f.write_text(json.dumps(post, ensure_ascii=False, indent=2))
            if post["slug"] in index:
                index[post["slug"]]["imageCount"] = new_body.count("<img")
        if changed:
            posts_touched += 1

    if not args.dry_run and posts_touched:
        # preserve original index order (already date-sorted) by reloading + remapping
        ordered = json.loads(INDEX.read_text())
        for p in ordered:
            if p["slug"] in index:
                p["imageCount"] = index[p["slug"]]["imageCount"]
        INDEX.write_text(json.dumps(ordered, ensure_ascii=False, indent=2))

    print(f"{'DRY RUN: ' if args.dry_run else ''}"
          f"rewrote {rewritten} img refs across {posts_touched} posts | "
          f"{unmapped} still-unmapped SQS refs ({len(unmapped_urls)} unique)")
    if unmapped_urls:
        (HERE / "rewrite-unmapped.json").write_text(
            json.dumps(sorted(unmapped_urls), indent=2))
        print("  unmapped URLs -> rewrite-unmapped.json (run upload-images.py for these)")


if __name__ == "__main__":
    main()
