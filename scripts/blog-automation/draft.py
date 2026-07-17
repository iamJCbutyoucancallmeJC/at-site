#!/usr/bin/env python3
"""
Step 2 of the ongoing-post pipeline (t813): DRAFT a post in Amy's voice.

This is the agent-run step. It does NOT contain a fake offline "AI": it builds
the exact prompt (prompts/amy-voice-post.md with the tag vocabulary, today's
date, and the ingested source text filled in) and either:

  (a) --print   : prints the assembled prompt so an agent session (or a human
                  with Claude open) can run it and paste the JSON reply back, OR
  (b) (default) : shells out to the `claude` CLI in headless mode
                  (`claude -p`) if it is on PATH, captures the JSON, validates it.

Either way the model's JSON reply is validated and written into the work bundle
as draft.json (mapped to the store's post shape). publish-prep.py turns that into
the live posts/<slug>.json + _posts.json entry after a human approves.

Usage:
  python3 draft.py <work-id>                 # run via `claude -p` if available
  python3 draft.py <work-id> --print         # just print the prompt (manual/agent)
  python3 draft.py <work-id> --reply reply.json   # ingest a pasted JSON reply
  python3 draft.py <work-id> --model claude-opus-4-8

Output: work/<work-id>/
  prompt.txt   the assembled prompt actually used
  draft.json   {slug,title,date,datePublishedISO,tags,excerpt,body,legacyPath:"",
                legacyFile:"",imageCount,notes} -- store-shaped, status advanced
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import store

PROMPT_TEMPLATE = store.PROMPTS / "amy-voice-post.md"


def assemble_prompt(source_text: str) -> str:
    tpl = PROMPT_TEMPLATE.read_text()
    vocab = "\n".join(f"- {t}" for t in store.top_tags(40)) or "- (no tags yet)"
    return (tpl
            .replace("{{TAG_VOCABULARY}}", vocab)
            .replace("{{TODAY}}", store.now_iso()[:10])
            .replace("{{SOURCE_TEXT}}", source_text))


def parse_model_json(raw: str) -> dict:
    """Tolerate a model that wrapped the JSON in prose or ``` fences."""
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.lstrip().startswith("json"):
            raw = raw.lstrip()[4:]
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object found in model reply")
    return json.loads(raw[start:end + 1])


def to_post(reply: dict) -> dict:
    """Map the prompt's JSON contract onto the store's post shape (matches the
    migrated corpus: body under 'body', legacy* empty for ongoing posts)."""
    required = ("title", "slug", "tags", "excerpt", "body_html")
    missing = [k for k in required if k not in reply]
    if missing:
        raise ValueError(f"model reply missing keys: {missing}")
    body = reply["body_html"].strip()
    slug = store.slugify(reply["slug"] or reply["title"])
    return {
        "slug": slug,
        "title": reply["title"].strip(),
        "date": store.now_iso()[:10],
        "datePublishedISO": store.now_iso(),
        "tags": [t.strip() for t in reply["tags"] if t.strip()][:3],
        "excerpt": (reply.get("excerpt") or store.excerpt_of(body)).strip(),
        "body": body,
        "legacyPath": "",
        "legacyFile": "",
        "imageCount": str(store.count_images(body)),
        "notes": reply.get("notes", ""),
    }


def run_claude_cli(prompt: str, model: str | None) -> str:
    cli = shutil.which("claude")
    if not cli:
        sys.exit("`claude` CLI not on PATH. Re-run with --print and paste the "
                 "reply back via --reply reply.json.")
    cmd = [cli, "-p", prompt]
    if model:
        cmd += ["--model", model]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"claude CLI failed ({res.returncode}):\n{res.stderr}")
    return res.stdout


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("work_id", help="work-bundle id from ingest.py")
    ap.add_argument("--print", dest="just_print", action="store_true",
                    help="print the assembled prompt instead of calling the model")
    ap.add_argument("--reply", help="path to a JSON reply file to ingest (manual/agent path)")
    ap.add_argument("--model", help="model id for the claude CLI (default: CLI default)")
    args = ap.parse_args()

    work = store.WORK / args.work_id
    src = work / "source.txt"
    if not src.exists():
        sys.exit(f"No source.txt in {work}. Run ingest.py first.")

    prompt = assemble_prompt(src.read_text())
    (work / "prompt.txt").write_text(prompt)

    if args.just_print:
        print(prompt)
        print("\n--- when the model replies, save its JSON and run: "
              f"python3 {Path(__file__).name} {args.work_id} --reply reply.json ---",
              file=sys.stderr)
        return

    raw = Path(args.reply).read_text() if args.reply else run_claude_cli(prompt, args.model)
    reply = parse_model_json(raw)
    post = to_post(reply)
    (work / "draft.json").write_text(json.dumps(post, ensure_ascii=False, indent=2))

    print(f"Drafted -> {work / 'draft.json'}")
    print(f"  title: {post['title']!r}")
    print(f"  slug:  {post['slug']}   tags: {post['tags']}   images: {post['imageCount']}")
    if post["notes"]:
        print(f"  NOTES for reviewer: {post['notes']}")
    print(f"  next (after human review): python3 {Path(__file__).parent / 'publish-prep.py'} {args.work_id}")


if __name__ == "__main__":
    main()
