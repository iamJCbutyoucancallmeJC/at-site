#!/usr/bin/env python3
"""
Amy Tangerine blog migration: extract posts from the captured Squarespace legacy HTML.

Source of truth (per blog-reinstate-prd-2026-06-20.md, Decision B):
  vault: .../Website Redesign/Archive/squarespace-legacy-2026-05-29/raw-html/blog__*.html

For each real post, extract:
  - title (from <title>, with the " — Amy Tangerine" suffix stripped)
  - datePublished (JSON-LD ISO timestamp)
  - slug (normalized from the legacy filename -> clean /blog/[slug])
  - tags / categories
  - body HTML (sanitized: Squarespace wrappers stripped, semantic HTML kept)
  - excerpt (first ~40 words of text)
  - legacyPath (original URL path, for the redirect map)
  - images (list of legacy image URLs found in the body)

Output:
  content/blog/_posts.json   -- array of post metadata (no body) for index/feed/search
  content/blog/posts/<slug>.json -- per-post full record incl. body HTML
  content/blog/_redirects.json -- legacy path -> /blog/<slug> (Decision B)

This is the SHELL data pass for t812. It deliberately keeps body as sanitized
HTML (not yet MDX, not yet re-hosted images) so the routes have real content to
render. The t811 migration pipeline formalizes MDX + image re-hosting on top of
the same extraction spine.

Run:  python3 extract.py [--limit N] [--dry-run]
"""
import argparse, json, os, re, sys
from datetime import datetime
from pathlib import Path

try:
    from bs4 import BeautifulSoup, Comment
except ImportError:
    sys.exit("Need beautifulsoup4: pip3 install beautifulsoup4")

VAULT = Path(
    "/Users/JCCangilla/Claudesidian Vault - Parent/Claudesidian Vault - JC"
    "/A5 Job/Linslow/Clients/Amy Tangerine/Website Redesign"
    "/Archive/squarespace-legacy-2026-05-29/raw-html"
)
REPO = Path(__file__).resolve().parents[2]   # ~/at-site
OUT = REPO / "content" / "blog"
POSTS_DIR = OUT / "posts"

TITLE_SUFFIX = re.compile(r"\s*[—–-]\s*Amy Tangerine\s*$")

# Filenames that are listing/pagination/author/tag pages, not real posts.
NON_POST_RE = re.compile(
    r"blog__(tag|category|author|page)[_-]|"
    r"blog__\d+\.html$|"          # bare numeric ids that are pagination
    r"blog\.html$",
    re.I,
)


def clean_title(raw: str) -> str:
    t = BeautifulSoup(raw, "html.parser").get_text()
    t = TITLE_SUFFIX.sub("", t).strip()
    return t


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower())
    return re.sub(r"-{2,}", "-", s).strip("-")


def is_opaque(slug: str) -> bool:
    """A Squarespace hash id like 0m33jp7njweyhx82pxefqeo0hzfmjj: long, no
    hyphens, mixes letters+digits. Not human-readable -> derive from title."""
    return len(slug) >= 16 and "-" not in slug and bool(re.search(r"\d", slug)) and bool(re.search(r"[a-z]", slug))


def slug_from_filename(fn: str, title: str | None = None) -> str:
    """blog__2012__01__be-light.html -> be-light ;
    blog__crafty-travel-essentials.html -> crafty-travel-essentials"""
    base = fn[len("blog__"):] if fn.startswith("blog__") else fn
    base = re.sub(r"\.html$", "", base)
    # drop a leading year/month path segment chain, keep the trailing slug
    parts = base.split("__")
    slug = parts[-1]
    # squarespace sometimes appended "html" into the slug (dont-laughhtml)
    slug = re.sub(r"html$", "", slug) if slug.endswith("html") and "-" in slug else slug
    slug = slugify(slug)
    if (not slug or is_opaque(slug)) and title:
        title_slug = slugify(TITLE_SUFFIX.sub("", title))
        if title_slug:
            slug = title_slug
    return slug or base


def legacy_path_from_filename(fn: str) -> str:
    base = re.sub(r"\.html$", "", fn)
    return "/" + base.replace("__", "/")


def extract_date(html: str):
    m = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    if not m:
        return None, None
    iso = m.group(1)
    try:
        dt = datetime.fromisoformat(iso)
        return iso, dt.date().isoformat()
    except ValueError:
        d = re.match(r"(\d{4}-\d{2}-\d{2})", iso)
        return iso, (d.group(1) if d else None)


def extract_tags(soup: BeautifulSoup):
    tags = set()
    # Squarespace marks tags with rel="tag" links to /blog/tag/<X> (and
    # categories to /blog/category/<X>), inside .blog-meta-item--tags/--cats.
    for a in soup.select('a[rel="tag"], a[href*="/blog/tag/"], a[href*="/blog/category/"]'):
        txt = a.get_text(strip=True)
        if txt:
            tags.add(txt)
    return sorted(tags)


# Layout-only wrapper tags that carry no semantics once their classes are gone.
# After attribute-stripping we unwrap these so the body isn't a pile of empty divs.
UNWRAP_TAGS = {"div", "section", "span"}


def sanitize_body(content_div) -> str:
    soup = content_div
    # remove comments
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    # remove scripts/styles/noscript
    for t in soup.find_all(["script", "style", "noscript"]):
        t.decompose()
    # normalize images: prefer data-src (squarespace lazy) then src
    for img in soup.find_all("img"):
        src = img.get("data-src") or img.get("src") or ""
        alt = img.get("alt", "")
        img.attrs = {}
        if src:
            img["src"] = src
        if alt:
            img["alt"] = alt
    # strip attrs on all tags except href (a) and src/alt (img); keep iframe src
    # (embedded video) and width/height off.
    for tag in soup.find_all(True):
        keep = {}
        if tag.name == "a" and tag.get("href"):
            keep["href"] = tag["href"]
        elif tag.name == "img":
            keep = {k: v for k, v in tag.attrs.items() if k in ("src", "alt")}
        elif tag.name == "iframe" and tag.get("src"):
            keep = {"src": tag["src"]}
        tag.attrs = keep

    # Unwrap layout-only wrappers (div/section/span with no attributes): replace
    # the tag with its children. Iterate to a fixed point since wrappers nest.
    changed = True
    while changed:
        changed = False
        for tag in soup.find_all(UNWRAP_TAGS):
            if not tag.attrs:
                tag.unwrap()
                changed = True
                break

    # Drop now-empty paragraphs / leftover whitespace-only tags.
    for tag in soup.find_all(["p", "figure", "figcaption"]):
        if not tag.get_text(strip=True) and not tag.find("img"):
            tag.decompose()

    # Return inner HTML of the root container (the container div itself is dropped).
    return "".join(str(c) for c in content_div.contents).strip()


def collect_images(body_html: str):
    return re.findall(r'<img[^>]+src="([^"]+)"', body_html)


def text_excerpt(content_div, words=40) -> str:
    txt = re.sub(r"\s+", " ", content_div.get_text(" ", strip=True)).strip()
    w = txt.split(" ")
    return " ".join(w[:words]) + ("…" if len(w) > words else "")


def parse_file(path: Path):
    html = path.read_text(encoding="utf-8", errors="replace")
    iso, date = extract_date(html)
    soup = BeautifulSoup(html, "html.parser")

    title_tag = soup.find("title")
    title = clean_title(title_tag.decode_contents()) if title_tag else None

    content_div = soup.select_one(".blog-item-content")
    if content_div is None:
        return None  # not a post body

    tags = extract_tags(soup)
    excerpt = text_excerpt(content_div)
    body = sanitize_body(content_div)
    images = collect_images(body)

    slug = slug_from_filename(path.name, title)
    return {
        "slug": slug,
        "title": title or slug.replace("-", " ").title(),
        "date": date,
        "datePublishedISO": iso,
        "tags": tags,
        "excerpt": excerpt,
        "legacyPath": legacy_path_from_filename(path.name),
        "legacyFile": path.name,
        "imageCount": len(images),
        "body": body,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not VAULT.exists():
        sys.exit(f"Source not found: {VAULT}")

    files = sorted(
        f for f in VAULT.iterdir()
        if f.name.startswith("blog__") and f.suffix == ".html"
        and not NON_POST_RE.search(f.name)
    )
    if args.limit:
        files = files[: args.limit]

    posts, redirects, skipped = [], {}, []
    seen_slugs = {}          # lowercased slug -> legacy file (uniqueness ledger)
    collisions = 0
    for f in files:
        rec = parse_file(f)
        if rec is None:
            skipped.append(f.name)
            continue
        base = rec["slug"]
        slug = base
        # Guarantee global uniqueness, case-insensitively (URLs + case-insensitive
        # filesystems). Increment -2, -3, ... until the candidate is genuinely free;
        # re-check each candidate so a generated suffix can't itself collide.
        if slug.lower() in seen_slugs:
            collisions += 1
            n = 2
            while f"{base}-{n}".lower() in seen_slugs:
                n += 1
            slug = f"{base}-{n}"
        rec["slug"] = slug
        seen_slugs[slug.lower()] = rec["legacyFile"]
        posts.append(rec)
        redirects[rec["legacyPath"]] = f"/blog/{slug}"

    posts.sort(key=lambda p: (p["date"] or "0000"), reverse=True)

    print(f"Parsed {len(posts)} posts | skipped {len(skipped)} non-body | "
          f"{collisions} slug collisions")
    dated = [p for p in posts if p["date"]]
    if dated:
        print(f"Date range: {dated[-1]['date']} .. {dated[0]['date']} "
              f"| undated: {len(posts)-len(dated)}")

    if args.dry_run:
        print("\nDry run. Sample:")
        for p in posts[:5]:
            print(f"  {p['date']}  /blog/{p['slug']}  ({p['imageCount']} imgs)  {p['title'][:50]}")
        return

    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    # index (no body) for feed/search
    index = [{k: v for k, v in p.items() if k != "body"} for p in posts]
    (OUT / "_posts.json").write_text(json.dumps(index, ensure_ascii=False, indent=2))
    (OUT / "_redirects.json").write_text(json.dumps(redirects, ensure_ascii=False, indent=2))
    for p in posts:
        (POSTS_DIR / f"{p['slug']}.json").write_text(
            json.dumps(p, ensure_ascii=False, indent=2)
        )
    print(f"\nWrote {len(posts)} post files + _posts.json + _redirects.json to {OUT}")


if __name__ == "__main__":
    main()
