#!/usr/bin/env python3
"""
Shared store helpers for the ongoing blog pipeline (t813).

The blog store (DECIDED 2026-07-08, recorded in RUNBOOK.md): ongoing posts use
the SAME format as the migrated legacy corpus, so the site has exactly one
content shape:

  content/blog/posts/<slug>.json  -- full record incl. sanitized body HTML
  content/blog/_posts.json        -- index of post metadata (no body), date desc

Ongoing posts carry legacyPath="" and legacyFile="" (they have no Squarespace
ancestor); that empty legacyFile is also how tooling tells an ongoing post from
a migrated one (e.g. --retract refuses to touch the legacy corpus).

CAUTION: scripts/blog-migration/extract.py regenerates _posts.json wholesale
from the legacy HTML archive. It is a one-time migration script; if it is ever
re-run, ongoing posts vanish from the INDEX (their posts/*.json files survive).
Recovery: publish-prep.py --rebuild-index rebuilds _posts.json from posts/.
"""
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]          # ~/at-site
BLOG = REPO / "content" / "blog"
POSTS_DIR = BLOG / "posts"
INDEX = BLOG / "_posts.json"

AUTOMATION = Path(__file__).resolve().parent
INBOX = AUTOMATION / "inbox"
WORK = AUTOMATION / "work"
PROMPTS = AUTOMATION / "prompts"

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
    index.sort(key=lambda p: (p.get("date") or "", p.get("slug") or ""), reverse=True)
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2))


def meta_of(post: dict) -> dict:
    return {k: post[k] for k in META_KEYS}


def load_post(slug: str) -> dict | None:
    f = POSTS_DIR / f"{slug}.json"
    return json.loads(f.read_text()) if f.exists() else None


def save_post(post: dict) -> Path:
    """Write posts/<slug>.json and upsert its meta into _posts.json."""
    f = POSTS_DIR / f"{post['slug']}.json"
    f.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    index = [p for p in load_index() if p["slug"] != post["slug"]]
    index.append(meta_of(post))
    save_index(index)
    return f


def delete_post(slug: str) -> bool:
    """Remove posts/<slug>.json and its index entry. Returns True if found."""
    f = POSTS_DIR / f"{slug}.json"
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
    save_index(metas)
    return len(metas)


def count_images(body_html: str) -> int:
    return len(re.findall(r"<img\b", body_html, flags=re.I))


def excerpt_of(body_html: str, words: int = 40) -> str:
    text = re.sub(r"<[^>]+>", " ", body_html)
    text = re.sub(r"\s+", " ", text).strip()
    toks = text.split(" ")
    out = " ".join(toks[:words])
    return out + ("…" if len(toks) > words else "")


def now_iso() -> str:
    # Match the legacy corpus format: 2024-11-07T06:00:00-0800
    return datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M:%S%z")


def top_tags(limit: int = 40) -> list[str]:
    counts: dict[str, int] = {}
    for p in load_index():
        for t in p.get("tags", []):
            counts[t] = counts.get(t, 0) + 1
    return [t for t, _ in sorted(counts.items(), key=lambda kv: -kv[1])[:limit]]
