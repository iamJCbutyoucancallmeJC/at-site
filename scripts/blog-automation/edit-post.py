#!/usr/bin/env python3
"""
Edit-existing path (t813): apply one instruction to a post via `claude -p`,
keeping the prior version.

Works on drafts (Amy's voice pass: "make the second paragraph shorter", "add a
closing line like my other posts") and on published posts alike. The prior
record is kept at content/blog/revisions/<slug>/<stamp>.json before the store is
overwritten, and git history keeps every committed version on top of that.
Nothing here commits; approve.py (drafts) or a normal commit (published posts)
carries the change forward.

Usage:
  python3 edit-post.py <slug> "<instruction>"
  python3 edit-post.py <slug> --instruction-file notes.txt
  python3 edit-post.py <slug> "<instruction>" --model opus
  python3 edit-post.py <slug> "<instruction>" --print        # show the prompt, change nothing
  python3 edit-post.py <slug> --reply reply.json             # ingest an agent session's reply
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import llm
import rehost
import store
from draft import check_body

PROMPT_TEMPLATE = store.PROMPTS / "amy-voice-edit.md"


def assemble_prompt(post: dict, instruction: str) -> str:
    return (PROMPT_TEMPLATE.read_text()
            .replace("{{INSTRUCTION}}", instruction.strip())
            .replace("{{TITLE}}", post["title"])
            .replace("{{TAGS}}", ", ".join(post.get("tags") or []) or "(none)")
            .replace("{{EXCERPT}}", post.get("excerpt") or "")
            .replace("{{BODY_HTML}}", post["body"]))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("instruction", nargs="?", help="what to change, in plain words")
    ap.add_argument("--instruction-file", help="read the instruction from a file")
    ap.add_argument("--model", default=llm.DEFAULT_MODEL)
    ap.add_argument("--print", dest="just_print", action="store_true")
    ap.add_argument("--reply", help="JSON reply file to ingest instead of calling claude -p")
    args = ap.parse_args()

    post = store.load_post(args.slug)
    if not post:
        sys.exit(f"No post with slug '{args.slug}'.")
    if post.get("legacyFile"):
        print("Note: this is a migrated legacy post; edits are allowed but the prior version is kept.", file=sys.stderr)

    instruction = Path(args.instruction_file).read_text() if args.instruction_file else (args.instruction or "")
    if not instruction.strip() and not args.reply:
        ap.error("give an instruction (positional or --instruction-file)")

    prompt = assemble_prompt(post, instruction or "(reply supplied)")
    if args.just_print:
        print(prompt)
        return
    raw = Path(args.reply).read_text() if args.reply else llm.run_claude(prompt, model=args.model)
    reply = llm.parse_model_json(raw)
    body = (reply.get("body_html") or "").strip()
    if not body:
        sys.exit("model reply has no body_html; nothing changed")

    kept = store.save_revision(post, reason=instruction.strip()[:300] or "reply supplied")
    new = dict(post)
    new["title"] = (reply.get("title") or post["title"]).strip()
    new["tags"] = [t.strip() for t in (reply.get("tags") or post["tags"]) if isinstance(t, str) and t.strip()][:3]
    new["excerpt"] = (reply.get("excerpt") or store.excerpt_of(body)).strip()
    new["body"], report = rehost.rehost_body(body)
    new["imageCount"] = store.count_images(new["body"])
    src = dict(new.get("source") or {})
    src.setdefault("edits", []).append({"at": store.now_iso(), "instruction": instruction.strip(),
                                        "model": "agent-session" if args.reply else args.model,
                                        "notes": (reply.get("notes") or "").strip(), "prior": str(kept.relative_to(store.REPO))})
    new["source"] = src
    f = store.save_post(new)

    print(f"Edited {f.relative_to(store.REPO)}  (prior kept at {kept.relative_to(store.REPO)})")
    if post["title"] != new["title"]:
        print(f"  title: {post['title']!r} -> {new['title']!r}")
    if reply.get("notes"):
        print(f"  NOTES from the model: {reply['notes'].strip()}")
    for w in check_body(new["body"]):
        print(f"  WARNING: {w}")
    if report["failed"]:
        print(f"  WARNING: {len(report['failed'])} image(s) could not be re-hosted")
    state = "draft (unlisted)" if new.get("draft") else "PUBLISHED post; commit the change to ship it"
    print(f"  state: {state}")


if __name__ == "__main__":
    main()
