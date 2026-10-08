#!/usr/bin/env python3
"""
Step 2 of the ongoing-post pipeline (t813): DRAFT a post in Amy's voice and
write it to the store as an UNLISTED DRAFT.

The model call is `claude -p` on the Max login (llm.py), with
prompts/amy-voice-post.md filled in: the tag vocabulary, the most recent
Journal posts, today's date, and the ingested source. The reply is validated,
its external images are re-hosted on Shopify Files (rehost.py), and the post is
written as content/blog/posts/<slug>.json with "draft": true plus an index entry.
lib/blog.ts keeps drafts out of every listing; the post still builds and serves
at /blog/<slug> with noindex, which is the preview URL for the voice pass.

Nothing here commits or deploys. approve.py flips the draft and commits.

Usage:
  python3 draft.py <work-id>                     # ingest -> claude -p -> store draft
  python3 draft.py <work-id> --model opus        # a different CLI model alias
  python3 draft.py <work-id> --print             # print the assembled prompt, call nothing
  python3 draft.py <work-id> --reply reply.json  # ingest a reply an agent session produced
  python3 draft.py <work-id> --no-rehost         # leave image urls as they are
  python3 draft.py <work-id> --force             # redo a work bundle that already has a draft

Output: work/<work-id>/prompt.txt, reply.json (raw), draft.json (the post record)
        content/blog/posts/<slug>.json + _posts.json entry (draft: true)
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import llm
import rehost
import store

PROMPT_TEMPLATE = store.PROMPTS / "amy-voice-post.md"
ALLOWED_TAGS = {"p", "h2", "h3", "a", "figure", "img", "ul", "ol", "li", "em", "strong", "blockquote", "iframe", "br"}


def recent_posts_block(n: int = 3) -> str:
    rows = store.ongoing_posts()[:n]
    if not rows:
        return "- (no ongoing posts yet; the Journal's newest post is from the migrated archive)"
    return "\n".join(f"- {p['date']} {p['title']!r}: {p['excerpt']}" for p in rows)


def assemble_prompt(source_text: str) -> str:
    tpl = PROMPT_TEMPLATE.read_text()
    vocab = "\n".join(f"- {t}" for t in store.top_tags(40)) or "- (no tags yet)"
    return (tpl.replace("{{TAG_VOCABULARY}}", vocab)
               .replace("{{RECENT_POSTS}}", recent_posts_block())
               .replace("{{TODAY}}", store.today())
               .replace("{{SOURCE_TEXT}}", source_text))


def check_body(body: str) -> list[str]:
    """Vocabulary check on the body HTML. Returns warnings (never silently rewrites)."""
    warns = []
    tags = {t.lower() for t in re.findall(r"<\s*([a-zA-Z][a-zA-Z0-9]*)", body)}
    bad = sorted(tags - ALLOWED_TAGS)
    if bad:
        warns.append(f"body uses tags outside the Journal vocabulary: {', '.join(bad)}")
    if re.search(r'\s(style|class)="', body):
        warns.append("body carries style/class attributes")
    if re.search(r"[—]", body):
        warns.append("body contains an em dash")
    if re.search(r"unsubscribe|preferences|view in browser", body, re.I):
        warns.append("body still mentions email chrome (unsubscribe/preferences/view in browser)")
    return warns


def to_post(reply: dict, meta: dict, model: str) -> dict:
    required = ("title", "slug", "tags", "excerpt", "body_html")
    missing = [k for k in required if k not in reply]
    if missing:
        raise ValueError(f"model reply missing keys: {missing}")
    body = reply["body_html"].strip()
    if len(re.sub(r"<[^>]+>", " ", body).split()) < 40:
        raise ValueError("model body is under 40 words; refusing to store it as a post")
    slug = store.unique_slug(store.slugify(reply["slug"] or reply["title"]))
    return {
        "slug": slug,
        "title": reply["title"].strip(),
        "date": store.today(),
        "datePublishedISO": store.now_iso(),
        "tags": [t.strip() for t in (reply.get("tags") or []) if isinstance(t, str) and t.strip()][:3],
        "excerpt": (reply.get("excerpt") or store.excerpt_of(body)).strip(),
        "body": body,
        "legacyPath": "",
        "legacyFile": "",
        "imageCount": store.count_images(body),
        "draft": True,
        "source": {
            "work_id": meta.get("id"),
            "kind": meta.get("source"),
            "campaign_id": meta.get("campaign_id"),
            "campaign_name": meta.get("campaign_name"),
            "subject": meta.get("subject"),
            "send_date": meta.get("send_date"),
            "drafted_at": store.now_iso(),
            "model": model,
            "notes": (reply.get("notes") or "").strip(),
        },
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("work_id", help="work-bundle id from ingest-klaviyo.py / ingest.py")
    ap.add_argument("--print", dest="just_print", action="store_true", help="print the prompt, call nothing")
    ap.add_argument("--reply", help="JSON reply file to ingest instead of calling claude -p")
    ap.add_argument("--model", default=llm.DEFAULT_MODEL, help=f"claude CLI model alias (default {llm.DEFAULT_MODEL})")
    ap.add_argument("--no-rehost", action="store_true", help="leave external image urls alone")
    ap.add_argument("--force", action="store_true", help="redo a bundle that already has draft.json")
    args = ap.parse_args()

    work = store.WORK / args.work_id
    src = work / "source.txt"
    if not src.exists():
        sys.exit(f"No source.txt in {work}. Run ingest-klaviyo.py (or ingest.py) first.")
    meta = json.loads((work / "meta.json").read_text()) if (work / "meta.json").exists() else {"id": args.work_id}
    if (work / "draft.json").exists() and not args.force and not args.just_print:
        prior = json.loads((work / "draft.json").read_text())
        sys.exit(f"{args.work_id} already drafted as '{prior.get('slug')}'. Pass --force to draft again "
                 "(the earlier draft post stays in the store; retract it if unwanted).")

    prompt = assemble_prompt(src.read_text())
    (work / "prompt.txt").write_text(prompt)
    if args.just_print:
        print(prompt)
        return

    if args.reply:
        raw, model = Path(args.reply).read_text(), "agent-session"
    else:
        raw, model = llm.run_claude(prompt, model=args.model), args.model   # raises on any failure
    (work / "reply.json").write_text(raw)
    post = to_post(llm.parse_model_json(raw), meta, model)

    warns = check_body(post["body"])
    if not args.no_rehost:
        post["body"], report = rehost.rehost_body(post["body"])
        post["imageCount"] = store.count_images(post["body"])
        post["source"]["rehost"] = report
        if report["failed"]:
            warns.append(f"{len(report['failed'])} image(s) could not be re-hosted; still on an external host")
    else:
        left = rehost.external_images(post["body"])
        if left:
            warns.append(f"{len(left)} external image(s) left in place (--no-rehost)")

    (work / "draft.json").write_text(json.dumps(post, ensure_ascii=False, indent=2))
    f = store.save_post(post)
    meta.update(status="drafted", slug=post["slug"], drafted_at=post["source"]["drafted_at"])
    (work / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))

    print(f"Draft written (unlisted): {f.relative_to(store.REPO)}")
    print(f"  title: {post['title']!r}")
    print(f"  slug:  {post['slug']}   tags: {post['tags']}   images: {post['imageCount']}   words: "
          f"{len(re.sub(r'<[^>]+>', ' ', post['body']).split())}")
    if post["source"]["notes"]:
        print(f"  NOTES from the model: {post['source']['notes']}")
    for w in warns:
        print(f"  WARNING: {w}")
    print(f"  preview: /blog/{post['slug']}  (npm run dev, or the branch's Vercel preview)")
    print(f"  next:    python3 scripts/blog-automation/edit-post.py {post['slug']} \"<instruction>\"   # voice pass")
    print(f"           python3 scripts/blog-automation/approve.py {post['slug']}                      # JC approve")


if __name__ == "__main__":
    main()
