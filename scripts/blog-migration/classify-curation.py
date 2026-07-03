#!/usr/bin/env python3
"""
classify-curation.py  (2026-07-03, v2 -- precision dead-destination lane)

Merchandising-curation pass over the migrated blog corpus. Fixes the gap the
blog-reinstate PRD named but never built: the default feed filtered by DATE only,
so stale COMMERCIAL ephemera that happened to be recent sailed onto the front door.

Three ways a post leaves the front feed (see PRD "Curation criteria refinement"):
  A. TITLE/TAG kind (self-evident from the headline): giveaway, blog hop, sale,
     class/workshop -> redirect; sponsored/dated-logistics -> archive-only.
  B. PRECISION dead-destination lane (JC decision 2026-07-03: purpose AND death):
     a post whose BODY reads commercial (sponsor/collab disclosure, product CTA,
     or freebie) AND whose commercial links are ALL dead (per _link-probe.json)
     -> redirect. Keyword-purpose ALONE never pulls -- that buries evergreen posts
     that merely mention a sponsor (Office Depot how-to, gifted-stay travel story).
  C. REVIEW list: commercial-purpose but links still live/uncertain -> KEPT in feed,
     surfaced in _curation-review.json for a human eyeball (JC/Amy, t846). Default
     is keep; we never auto-bury a post the probe can't prove is dead.

Treatment tiers:
  feed         front door + archive + tag + search.
  archive-only off the front feed; still indexed + reachable via archive/tag/search.
  redirect     301 -> /blog (URL still resolves, never 404); gone from every listing.

`_curation-overrides.json` ({slug: treatment}) wins over every lane -- the human
correction hook. Re-run after editing overrides or refreshing the link probe.

Outputs:
  content/blog/_curation.json          the pulled set (redirect + archive-only + overrides)
  content/blog/_curation-review.json   commercial-purpose-but-kept posts, for review
  lib/blog-curation-redirects.mjs      { source:'/blog/<slug>', destination:'/blog' }[]

Run: python3 scripts/blog-migration/classify-curation.py
     (run probe-links.py first to populate/refresh _link-probe.json)
"""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
BLOG = REPO / "content" / "blog"
POSTS = BLOG / "_posts.json"
POSTS_DIR = BLOG / "posts"
OVERRIDES = BLOG / "_curation-overrides.json"
PROBE = BLOG / "_link-probe.json"
OUT_JSON = BLOG / "_curation.json"
OUT_REVIEW = BLOG / "_curation-review.json"
OUT_REDIRECTS = REPO / "lib" / "blog-curation-redirects.mjs"

# ── Lane A: title/tag kinds (self-evident from the headline) ──────────────────
KINDS = [
    ("giveaway/blog-hop", r"\b(giveaway|blog ?hop|winner|enter to win|hop &|hop and giveaway)\b"),
    ("sale/discount/promo", r"\b(sale|discount|coupon|% off|percent off|promo code|lowest price|"
                            r"black friday|cyber monday|flash sale|save \$|sale ends|clean ?out|"
                            r"deal of the|door ?buster)\b"),
    ("class/workshop", r"\b(workshop|webinar|register now|registration (is )?open|sign up (now|today)|"
                       r"enroll|all week long|this week only|live class|free (online )?(workshop|class))\b"),
    ("sponsored", r"\b(sponsored|#ad|in partnership with|thanks? to .{0,30}for sponsor|"
                  r"this post is sponsored)\b"),
    ("dated-logistics", r"\b(seven on saturday|project life week|week \d+|new release|release day|"
                        r"coming soon|pre-?order|link ?up)\b"),
]
KIND_TREATMENT = {
    "giveaway/blog-hop": "redirect",
    "sale/discount/promo": "redirect",
    "class/workshop": "redirect",
    "sponsored": "archive-only",
    "dated-logistics": "archive-only",
}

# ── Lane B/C: commercial-PURPOSE signals read from the body ────────────────────
DISCL = re.compile(r"(in collaboration with|this post is sponsored|sponsored by|were gifted|"
                   r"was gifted|#ad\b|in partnership with| c/o |compensated|"
                   r"thank you to .{0,25}for sponsoring)", re.I)
CTA = re.compile(r"(shop (the|my|this|now)|available (now|online|to purchase)|"
                 r"purchase (online|yours)|buy (now|yours|it here)|use code|"
                 r"order (now|yours)|get yours|now available)", re.I)
FREEBIE = re.compile(r"\b(free printable|free download|freebie)\b", re.I)
A_HREF = re.compile(r'<a\b[^>]*\bhref="(https?://[^"]+)"', re.I)

# Links that don't count as a commercial "destination" for the dead-check: social
# profiles (evergreen) and Amy's own site (its own redirects handle it).
SOCIAL_HOSTS = {"instagram.com", "facebook.com", "youtube.com", "youtu.be", "twitter.com",
                "x.com", "pinterest.com", "tiktok.com", "linkedin.com", "fb.me"}
OWN_HOST = "amytangerine.com"
VALID_TREATMENTS = {"feed", "archive-only", "redirect"}


def host_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().replace("www.", "")
    except ValueError:
        return ""


def title_kind(title: str, tags):
    hay = (title + " " + " ".join(tags or [])).lower()
    for kind, rx in KINDS:
        if re.search(rx, hay):
            return kind
    return None


def purpose_of(title: str, body: str):
    if DISCL.search(body):
        return "sponsored/collab"
    if FREEBIE.search(title) or FREEBIE.search(body):
        return "freebie/download"
    if CTA.search(title) or CTA.search(body):
        return "commercial-CTA"
    return None


def link_liveness(body: str, probe: dict):
    """Count the post's COMMERCIAL destinations (non-social, non-own) by verdict."""
    alive = dead = 0
    for url in A_HREF.findall(body):
        h = host_of(url)
        if h in SOCIAL_HOSTS or h == OWN_HOST:
            continue
        st = probe.get(url, {}).get("status")
        if st == "alive":
            alive += 1
        elif st == "dead":
            dead += 1
    return alive, dead


def main():
    posts = json.loads(POSTS.read_text())
    overrides = json.loads(OVERRIDES.read_text()) if OVERRIDES.exists() else {}
    probe = json.loads(PROBE.read_text()) if PROBE.exists() else {}
    bad = {k: v for k, v in overrides.items() if v not in VALID_TREATMENTS}
    if bad:
        raise SystemExit(f"Invalid override treatment(s): {bad} (allowed: {sorted(VALID_TREATMENTS)})")

    pulled, review = [], []
    for p in posts:
        slug = p["slug"]
        body = json.loads((POSTS_DIR / f"{slug}.json").read_text())["body"]
        kind = title_kind(p.get("title", ""), p.get("tags"))
        auto = KIND_TREATMENT.get(kind, "feed")
        purpose = purpose_of(p.get("title", ""), body)
        alive, dead = link_liveness(body, probe)
        dead_destination = dead >= 1 and alive == 0

        source = "auto"
        if slug in overrides:
            treatment, source, reason = overrides[slug], "override", f"override -> {overrides[slug]}"
        elif auto != "feed":                                   # Lane A
            treatment, reason = auto, f"title: {kind}"
        elif purpose and dead_destination:                     # Lane B (precision)
            treatment, source = "redirect", "auto-dead-link"
            kind, reason = f"{purpose}+dead-dest", f"{purpose}; {dead} dead commercial link(s), 0 alive"
        elif purpose:                                          # Lane C (review, keep)
            review.append({
                "slug": slug, "title": p.get("title", ""), "date": p.get("date", ""),
                "purpose": purpose, "links_alive": alive, "links_dead": dead,
                "note": "commercial-purpose but destination not proven dead -> KEPT in feed; eyeball",
            })
            continue
        else:
            continue                                           # plain feed post

        pulled.append({
            "slug": slug, "title": p.get("title", ""), "date": p.get("date", ""),
            "kind": kind, "treatment": treatment, "reason": reason, "source": source,
        })

    pulled.sort(key=lambda r: (r["treatment"], r["date"] or ""), reverse=True)
    review.sort(key=lambda r: r["date"] or "", reverse=True)
    OUT_JSON.write_text(json.dumps(pulled, ensure_ascii=False, indent=2) + "\n")
    OUT_REVIEW.write_text(json.dumps(review, ensure_ascii=False, indent=2) + "\n")

    redirects = [r for r in pulled if r["treatment"] == "redirect"]
    lines = [
        "// AUTO-GENERATED by scripts/blog-migration/classify-curation.py -- do not hand-edit.",
        "// Stale-commercial ephemera (title-obvious) + commercial-purpose posts whose",
        "// destinations are confirmed DEAD (per _link-probe.json): 301 -> /blog so the",
        "// legacy URL resolves (never 404) without showing a dead-offer/dead-link page.",
        "// Move a post out: set it in content/blog/_curation-overrides.json + re-run.",
        "export const blogCurationRedirects = [",
    ]
    for r in redirects:
        lines.append(f'  {{ source: "/blog/{r["slug"]}", destination: "/blog", permanent: true }},')
    lines.append("]")
    OUT_REDIRECTS.write_text("\n".join(lines) + "\n")

    from collections import Counter
    tc = Counter(r["treatment"] for r in pulled)
    sc = Counter(r["source"] for r in pulled)
    feed_2019 = [p for p in posts if (p.get("date") or "") >= "2019-01-01"]
    pulled_slugs = {r["slug"] for r in pulled}
    off_feed = [p for p in feed_2019 if p["slug"] in pulled_slugs]
    print(f"Classified {len(posts)} posts -> {len(pulled)} pulled, {len(review)} to review")
    print(f"  redirect: {tc.get('redirect', 0)}   archive-only: {tc.get('archive-only', 0)}")
    print(f"  by source: {dict(sc)}")
    print(f"  dead-destination redirects (Lane B): {sc.get('auto-dead-link', 0)}")
    print(f"2019+ front feed: {len(feed_2019)} -> {len(feed_2019) - len(off_feed)} "
          f"({len(off_feed)} pulled)")
    print(f"\nWrote {OUT_JSON.name}, {OUT_REVIEW.name}, {OUT_REDIRECTS.relative_to(REPO)}")


if __name__ == "__main__":
    main()
