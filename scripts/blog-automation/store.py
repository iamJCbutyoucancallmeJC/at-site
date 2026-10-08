#!/usr/bin/env python3
"""
Shared store helpers for the ongoing blog pipeline (t813).

The blog store (DECIDED 2026-07-08, re-confirmed 2026-10-07): ongoing posts use
the SAME format as the migrated legacy corpus, so the site has exactly one
content shape:

  content/blog/posts/<slug>.json  -- full record incl. sanitized body HTML
  content/blog/_posts.json        -- index of post metadata (no body), date desc
  content/blog/revisions/<slug>/<stamp>.json -- prior versions kept by edit-post.py
                                                (never read by the site)

Ongoing posts carry legacyPath="" and legacyFile="" (they have no Squarespace
ancestor); that empty legacyFile is also how tooling tells an ongoing post from
a migrated one (retract refuses to touch the legacy corpus).

Drafts: a post with "draft": true is written to the store but filtered out of
every listing surface by lib/blog.ts (getListablePosts); it is still built and
served at /blog/<slug> with noindex, which is the preview URL Amy reads.
approve.py removes the flag, sets the date, and commits.

CAUTION: scripts/blog-migration/extract.py regenerates _posts.json wholesale
from the legacy HTML archive. It is a one-time migration script; if it is ever
re-run, ongoing posts vanish from the INDEX (their posts/*.json files survive).
Recovery: publish-prep.py rebuild-index rebuilds _posts.json from posts/.
"""
import json
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]          # the at-site checkout this file lives in
BLOG = REPO / "content" / "blog"
POSTS_DIR = BLOG / "posts"
INDEX = BLOG / "_posts.json"
REVISIONS_DIR = BLOG / "revisions"

AUTOMATION = Path(__file__).resolve().parent
INBOX = AUTOMATION / "inbox"
WORK = AUTOMATION / "work"
PROMPTS = AUTOMATION / "prompts"

# Index keys. "draft" is optional and only present (true) on unpublished posts;
# legacy entries never carry it.
META_KEYS = [
    "slug", "title", "date", "datePublishedISO", "tags",
    "excerpt", "legacyPath", "legacyFile", "imageCount",
]


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text or "post"


def load_index() -> list[dict]:
    return json.loads(INDEX.read_text())


def save_index(index: list[dict]) -> None:
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2))


def upsert_index(meta: dict) -> None:
    """Replace the entry in place, or insert it at its date position. The rest of
    the file is left in the extractor's order, so a publish is a small diff, not a
    re-sort of 1,359 entries (the index is date-desc; the site re-sorts anyway)."""
    index = load_index()
    for i, p in enumerate(index):
        if p["slug"] == meta["slug"]:
            index[i] = meta
            break
    else:
        at = next((i for i, p in enumerate(index) if (p.get("date") or "") <= (meta.get("date") or "")), len(index))
        index.insert(at, meta)
    save_index(index)


def meta_of(post: dict) -> dict:
    meta = {k: post.get(k) for k in META_KEYS}
    if post.get("draft"):
        meta["draft"] = True
    return meta


def load_post(slug: str) -> dict | None:
    f = POSTS_DIR / f"{slug}.json"
    return json.loads(f.read_text()) if f.exists() else None


def post_path(slug: str) -> Path:
    return POSTS_DIR / f"{slug}.json"


def save_post(post: dict) -> Path:
    """Write posts/<slug>.json and upsert its meta into _posts.json."""
    f = post_path(post["slug"])
    f.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    upsert_index(meta_of(post))
    return f


def save_revision(post: dict, reason: str) -> Path:
    """Keep the prior version of a post before an edit overwrites it."""
    d = REVISIONS_DIR / post["slug"]
    d.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().astimezone().strftime("%Y-%m-%dT%H%M%S")
    f = d / f"{stamp}.json"
    f.write_text(json.dumps({"kept_at": now_iso(), "reason": reason, "post": post},
                            ensure_ascii=False, indent=2))
    return f


def delete_post(slug: str) -> bool:
    """Remove posts/<slug>.json and its index entry. Returns True if found."""
    f = post_path(slug)
    found = f.exists()
    if found:
        f.unlink()
    index = load_index()
    trimmed = [p for p in index if p["slug"] != slug]
    if len(trimmed) != len(index):
        save_index(trimmed)
        found = True
    return found


def rebuild_index() -> int:
    """Regenerate _posts.json from posts/*.json (recovery after extract.py re-run)."""
    metas = []
    for f in sorted(POSTS_DIR.glob("*.json")):
        metas.append(meta_of(json.loads(f.read_text())))
    metas.sort(key=lambda p: (p.get("date") or "", p.get("slug") or ""), reverse=True)
    save_index(metas)
    return len(metas)


def ongoing_posts(published_only: bool = True) -> list[dict]:
    """Index entries for posts this pipeline wrote (no legacy ancestor), newest first."""
    out = [p for p in load_index() if not p.get("legacyFile")]
    if published_only:
        out = [p for p in out if not p.get("draft")]
    return out


def unique_slug(base: str) -> str:
    """base, or base-2, base-3 ... if the slug is already taken in the store."""
    slug, n = base, 1
    while load_post(slug):
        n += 1
        slug = f"{base}-{n}"
    return slug


def count_images(body_html: str) -> int:
    return len(re.findall(r"<img\b", body_html, flags=re.I))


def excerpt_of(body_html: str, words: int = 40) -> str:
    text = re.sub(r"<[^>]+>", " ", body_html)
    text = re.sub(r"\s+", " ", text).strip()
    toks = text.split(" ")
    out = " ".join(toks[:words])
    return out + ("…" if len(toks) > words else "")


def today() -> str:
    return date.today().isoformat()


def now_iso() -> str:
    # Match the legacy corpus format: 2024-11-07T06:00:00-0800
    return datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")


def top_tags(limit: int = 40) -> list[str]:
    counts: dict[str, int] = {}
    for p in load_index():
        for t in p.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    return [t for t, _ in sorted(counts.items(), key=lambda kv: -kv[1])[:limit]]
