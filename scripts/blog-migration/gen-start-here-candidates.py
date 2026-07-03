#!/usr/bin/env python3
"""
gen-start-here-candidates.py  (t814)

Surface ~30-40 "Start here" candidates from the migrated blog corpus for Amy to
pick her ~15-25 favorites from. Per blog-reinstate-prd-2026-06-20.md (Curation):
we PROPOSE the shortlist by an analytical pass (evergreen content-type +
mature-voice era + signal); Amy picks, she doesn't generate.

Scoring (transparent, tunable):
  + evergreen content-type  (tags: DIY/Hand Lettering/Crafting/Scrapbooking/
                             Motivational Mondays/Give Yourself Permission;
                             how-to/tips/tutorial/ways-to title patterns)
  + mature-voice era        (2017+ strongest; 2015-2016 partial)
  + image-rich              (imageCount, capped -- a tutorial needs pictures)
  - de-prioritize ephemera  (giveaway/blog-hop/winner/sale/sponsor/coupon)

Excludes the 5 posts already in _featured.json (no point re-proposing those).
Writes content/blog/_start-here-candidates.json (the shortlist for the CDQ ask);
does NOT write _start-here.json (that's Amy's picked set, shipped after she chooses).

Run: python3 scripts/blog-migration/gen-start-here-candidates.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
BLOG = HERE.parent.parent / "content" / "blog"
POSTS = BLOG / "_posts.json"
FEATURED = BLOG / "_featured.json"
OUT = BLOG / "_start-here-candidates.json"

TARGET = 38  # aim for ~30-40 so Amy picks ~15-25

EVERGREEN_TAGS = {
    "DIY", "Hand Lettering", "Crafting", "Scrapbooking",
    "Motivational Mondays", "Give Yourself Permission",
}
# content-type signal in the title (how-to / method / teaching)
HOWTO_RE = re.compile(
    r"\b(how to|how i|diy|tutorial|tips?|ways to|guide|ideas?|step[s -]|"
    r"technique|start(ing)?|beginner|basics|method|lessons?|learn|"
    r"make your own|getting started)\b", re.I)
# ephemera signal -> push DOWN (dated, low evergreen value)
EPHEMERA_RE = re.compile(
    r"\b(giveaway|blog hop|winner|sale|coupon|sponsor|discount|"
    r"last chance|enter to win|black friday|cyber monday|"
    r"week \d+|seven on saturday|sale ends|new release)\b", re.I)


def era_score(date: str) -> int:
    """Mature-voice era weighting. 2017+ strongest; 2015-16 partial; older weak."""
    y = date[:4]
    if y >= "2017":
        return 4
    if y >= "2015":
        return 2
    if y >= "2013":
        return 1
    return 0


def score(p: dict) -> tuple:
    s = 0
    title = p.get("title", "") or ""
    tags = set(p.get("tags", []) or [])
    # evergreen content-type (tag + title signal)
    if tags & EVERGREEN_TAGS:
        s += 3
    if HOWTO_RE.search(title):
        s += 3
    # mature voice
    s += era_score(p.get("date", ""))
    # image-rich (a real tutorial/method post has pictures), capped at +2
    s += min((p.get("imageCount") or 0) // 4, 2)
    # ephemera penalty
    if EPHEMERA_RE.search(title):
        s -= 5
    return s


def reason(p: dict) -> str:
    bits = []
    tags = set(p.get("tags", []) or [])
    hit = tags & EVERGREEN_TAGS
    if hit:
        bits.append("evergreen tag: " + ", ".join(sorted(hit)))
    if HOWTO_RE.search(p.get("title", "") or ""):
        bits.append("how-to/method title")
    y = (p.get("date", "") or "")[:4]
    if y >= "2017":
        bits.append(f"mature voice ({y})")
    elif y >= "2015":
        bits.append(f"later era ({y})")
    if (p.get("imageCount") or 0) >= 5:
        bits.append(f"{p['imageCount']} images")
    return "; ".join(bits) or "general"


def main():
    posts = json.loads(POSTS.read_text())
    featured_slugs = {f["slug"] for f in json.loads(FEATURED.read_text())} \
        if FEATURED.exists() else set()

    ranked = sorted(
        (p for p in posts if p["slug"] not in featured_slugs),
        key=lambda p: (score(p), p.get("date", "")),
        reverse=True,
    )
    top = [p for p in ranked if score(p) >= 6][:TARGET]

    # group into content-type buckets so Amy scans by kind, not a flat list
    def bucket(p):
        t = (p.get("title", "") or "")
        tags = set(p.get("tags", []) or [])
        if "Hand Lettering" in tags or re.search(r"letter", t, re.I):
            return "Hand lettering"
        if re.search(r"journal|planner|memory|project life|one little word|document", t, re.I) \
                or {"Scrapbooking"} & tags:
            return "Journaling & memory keeping"
        if "DIY" in tags or re.search(r"\bDIY\b|make|card|craft|paint|pour", t, re.I):
            return "DIY & craft tutorials"
        if {"Motivational Mondays", "Give Yourself Permission"} & tags \
                or re.search(r"permission|creativ|inspir|motivat", t, re.I):
            return "Creativity & encouragement"
        return "Other evergreen"

    candidates = [{
        "slug": p["slug"],
        "title": p.get("title", ""),
        "date": p.get("date", ""),
        "bucket": bucket(p),
        "imageCount": p.get("imageCount", 0),
        "score": score(p),
        "why": reason(p),
    } for p in top]

    OUT.write_text(json.dumps(candidates, indent=2) + "\n")

    # console summary by bucket
    from collections import Counter
    bc = Counter(c["bucket"] for c in candidates)
    print(f"Wrote {len(candidates)} candidates -> {OUT.relative_to(HERE.parent.parent)}")
    print(f"(excluded {len(featured_slugs)} already-featured)\n")
    for b in ["Hand lettering", "Journaling & memory keeping", "DIY & craft tutorials",
              "Creativity & encouragement", "Other evergreen"]:
        n = bc.get(b, 0)
        if n:
            print(f"  {b}: {n}")


if __name__ == "__main__":
    main()
