#!/usr/bin/env python3
"""
classify-curation.py  (2026-07-03)

Merchandising-curation pass over the migrated blog corpus. Fixes the gap the
blog-reinstate PRD named but never built: the default feed filtered by DATE only
(`date >= 2019-01-01`), so stale COMMERCIAL ephemera (giveaways, expired sales,
closed workshops) that happen to be recent sailed straight onto the front door.
The PRD curation spec said "2019 -> present ... MINUS OBVIOUS PROMO"; this is the
"minus obvious promo" clause, plus a redirect tier for the deadest content.

Two levers, deliberately separate (see PRD "Curation criteria refinement"):
  - MIGRATION (does a URL exist?)  -> unchanged; every legacy URL still resolves.
  - MERCHANDISING (does a visitor MEET it?) -> this pass.

Treatment tiers:
  feed         evergreen + dated-personal. Front door + archive + tag + search.
  archive-only dated but has standalone value (sponsored personal posts, Project
               Life / Seven-on-Saturday logistics). Dropped from the front feed;
               still indexed + reachable via archive / tag / search.
  redirect     the DEADEST commercial ephemera (giveaways, blog hops, expired
               sales, closed classes/workshops). 301 -> /blog. No merchandising,
               no dead-offer page; the legacy URL still resolves (never 404).

Human-in-the-loop: auto-classification WILL mis-hit (a real essay that merely
mentions a sponsor; a "clean out" sale flagged as a class). `_curation-overrides.json`
({ "<slug>": "feed" | "archive-only" | "redirect" }) wins over the auto verdict, so
JC/Amy correct the list without touching code. Re-run after editing overrides.

Outputs:
  content/blog/_curation.json          per-post {slug,title,date,kind,treatment,reason,source}
  lib/blog-curation-redirects.mjs      { source:'/blog/<slug>', destination:'/blog', permanent:true }[]

Run: python3 scripts/blog-migration/classify-curation.py
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
BLOG = REPO / "content" / "blog"
POSTS = BLOG / "_posts.json"
OVERRIDES = BLOG / "_curation-overrides.json"
OUT_JSON = BLOG / "_curation.json"
OUT_REDIRECTS = REPO / "lib" / "blog-curation-redirects.mjs"

# Ephemera KIND signals (matched against title + tags, lowercased). Ordered by
# priority: the first matching kind wins, so put the strongest-signal kinds first.
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

# KIND -> default treatment. The deadest commercial offers 301; dated-but-real
# content is kept off the front door but stays reachable.
KIND_TREATMENT = {
    "giveaway/blog-hop": "redirect",
    "sale/discount/promo": "redirect",
    "class/workshop": "redirect",
    "sponsored": "archive-only",
    "dated-logistics": "archive-only",
}

VALID_TREATMENTS = {"feed", "archive-only", "redirect"}


def classify(post: dict):
    hay = (post.get("title", "") + " " + " ".join(post.get("tags", []) or [])).lower()
    for kind, rx in KINDS:
        if re.search(rx, hay):
            return kind, KIND_TREATMENT[kind]
    return None, "feed"


def main():
    posts = json.loads(POSTS.read_text())
    overrides = json.loads(OVERRIDES.read_text()) if OVERRIDES.exists() else {}
    bad = {k: v for k, v in overrides.items() if v not in VALID_TREATMENTS}
    if bad:
        raise SystemExit(f"Invalid override treatment(s): {bad} (allowed: {sorted(VALID_TREATMENTS)})")

    records = []
    for p in posts:
        kind, auto = classify(p)
        if p["slug"] in overrides:
            treatment, source = overrides[p["slug"]], "override"
        else:
            treatment, source = auto, "auto"
        if treatment == "feed" and source == "auto":
            continue  # only record posts that deviate from the default (keeps the file scannable)
        records.append({
            "slug": p["slug"],
            "title": p.get("title", ""),
            "date": p.get("date", ""),
            "kind": kind,
            "treatment": treatment,
            "reason": f"{kind} -> {treatment}" if kind else f"override -> {treatment}",
            "source": source,
        })

    records.sort(key=lambda r: (r["treatment"], r["date"] or ""), reverse=True)
    OUT_JSON.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")

    redirects = [r for r in records if r["treatment"] == "redirect"]
    lines = [
        "// AUTO-GENERATED by scripts/blog-migration/classify-curation.py -- do not hand-edit.",
        "// The deadest stale-commercial ephemera (giveaways, expired sales, closed classes):",
        "// 301 -> /blog so the legacy URL resolves (never 404) but no dead-offer page shows.",
        "// To move a post OUT of this list, set it to 'feed'/'archive-only' in",
        "// content/blog/_curation-overrides.json and re-run the classifier.",
        "export const blogCurationRedirects = [",
    ]
    for r in redirects:
        lines.append(f'  {{ source: "/blog/{r["slug"]}", destination: "/blog", permanent: true }},')
    lines.append("]")
    OUT_REDIRECTS.write_text("\n".join(lines) + "\n")

    # summary
    from collections import Counter
    tc = Counter(r["treatment"] for r in records)
    kc = Counter(r["kind"] for r in records if r["kind"])
    feed_2019 = [p for p in posts if (p.get("date") or "") >= "2019-01-01"]
    redirect_slugs = {r["slug"] for r in redirects}
    archive_slugs = {r["slug"] for r in records if r["treatment"] == "archive-only"}
    removed_from_feed = [p for p in feed_2019
                         if p["slug"] in redirect_slugs or p["slug"] in archive_slugs]
    ov = sum(1 for r in records if r["source"] == "override")

    print(f"Classified {len(posts)} posts -> {len(records)} non-default "
          f"({ov} from overrides)")
    print(f"  redirect (301 -> /blog): {tc.get('redirect', 0)}")
    print(f"  archive-only (off feed): {tc.get('archive-only', 0)}")
    print("  by kind: " + ", ".join(f"{k}={v}" for k, v in kc.most_common()))
    print(f"\n2019+ front feed: {len(feed_2019)} -> "
          f"{len(feed_2019) - len(removed_from_feed)} "
          f"({len(removed_from_feed)} pulled off the front door)")
    print(f"\nWrote {OUT_JSON.relative_to(REPO)} + {OUT_REDIRECTS.relative_to(REPO)}")


if __name__ == "__main__":
    main()
