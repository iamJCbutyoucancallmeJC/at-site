#!/usr/bin/env python3
"""
Download all blog-body images off the live Squarespace CDN before SQS is
decommissioned (weeks/months out). The iCloud legacy archive only captured the
101 rich-pass pages' images, NOT blog bodies -- so the ~5,660 blog images live
ONLY on the live CDN right now. This beats the shutdown clock.

Reads image URLs from content/blog/posts/*.json, downloads each unique image to
scripts/blog-migration/images/<sha1>.<ext>, and writes a manifest mapping
original URL -> local file (+ which posts use it). The Shopify-Files upload pass
(upload-images.py) reads that manifest next.

Only fetches images.squarespace-cdn.com (Amy's own content). Third-party hosts
(inlinkz badges, typepad, old amazon links -- ~145 refs) are left as-is: they're
external link-rot, not content we're preserving.

Run: python3 scripts/blog-migration/download-images.py [--limit N]
Resumable: skips images already on disk.
"""
import argparse, hashlib, json, os, re, sys, time
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

REPO = Path(__file__).resolve().parents[2]
POSTS_DIR = REPO / "content" / "blog" / "posts"
IMG_DIR = Path(__file__).resolve().parent / "images"
MANIFEST = Path(__file__).resolve().parent / "image-manifest.json"

KEEP_HOST = "images.squarespace-cdn.com"
EXT_RE = re.compile(r"\.(jpe?g|png|gif|webp|avif)(\?|$)", re.I)


def url_to_filename(url: str) -> str:
    h = hashlib.sha1(url.encode()).hexdigest()[:16]
    m = EXT_RE.search(url)
    ext = (m.group(1).lower() if m else "jpg").replace("jpeg", "jpg")
    return f"{h}.{ext}"


def collect_urls():
    """url -> list of post slugs that reference it (only SQS-hosted images)."""
    refs = {}
    for fn in sorted(os.listdir(POSTS_DIR)):
        if not fn.endswith(".json"):
            continue
        post = json.loads((POSTS_DIR / fn).read_text())
        for m in re.finditer(r'<img[^>]+src="([^"]+)"', post["body"]):
            url = m.group(1)
            if urlparse(url).netloc != KEEP_HOST:
                continue
            refs.setdefault(url, []).append(post["slug"])
    return refs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    args = ap.parse_args()

    IMG_DIR.mkdir(parents=True, exist_ok=True)
    refs = collect_urls()
    urls = list(refs)
    if args.limit:
        urls = urls[: args.limit]
    print(f"{len(urls)} unique SQS images to fetch -> {IMG_DIR}")

    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    ok = skip = fail = 0
    failures = []
    for i, url in enumerate(urls, 1):
        fname = url_to_filename(url)
        dest = IMG_DIR / fname
        rec = {"file": fname, "posts": refs[url]}
        if dest.exists() and dest.stat().st_size > 0:
            manifest[url] = rec
            skip += 1
        else:
            try:
                req = Request(url, headers={"User-Agent": "Mozilla/5.0 at-blog-migration"})
                with urlopen(req, timeout=30) as r:
                    data = r.read()
                dest.write_bytes(data)
                manifest[url] = rec
                ok += 1
            except (HTTPError, URLError, TimeoutError, OSError) as e:
                fail += 1
                failures.append({"url": url, "error": str(e)})
        if i % 100 == 0:
            MANIFEST.write_text(json.dumps(manifest, indent=2))
            print(f"  {i}/{len(urls)}  ok={ok} skip={skip} fail={fail}")
            time.sleep(0.2)  # be polite to the CDN

    MANIFEST.write_text(json.dumps(manifest, indent=2))
    if failures:
        (IMG_DIR.parent / "image-download-failures.json").write_text(
            json.dumps(failures, indent=2)
        )
    print(f"\nDone. ok={ok} skip={skip} fail={fail} | manifest: {len(manifest)} images")
    if failures:
        print(f"  {len(failures)} failures -> image-download-failures.json")


if __name__ == "__main__":
    main()
