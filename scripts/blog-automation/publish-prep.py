#!/usr/bin/env python3
"""
Step 3 of the ongoing-post pipeline (t813): PUBLISH-PREP + EDIT-EXISTING.

Nothing here deploys. This step writes an approved draft into the blog store the
site serves (content/blog/posts/<slug>.json + _posts.json), leaving the change
UNCOMMITTED for a human to review the git diff and push. Deploy = a person (or a
future hook), never this script (the classifier blocks Claude from pushing client
content anyway).

Three jobs:

  publish   take work/<id>/draft.json -> live store (upsert)
  edit      pull an existing post OUT to a file, or push an edited file back IN
  retract   remove an ONGOING post (refuses to touch the migrated legacy corpus)

Usage:
  # publish an approved draft
  python3 publish-prep.py publish <work-id> [--force]

  # edit-existing: check a post out, edit the file, check it back in
  python3 publish-prep.py edit <slug> --out post.json
  #   ...edit post.json (body/title/tags)...
  python3 publish-prep.py edit <slug> --in post.json

  # housekeeping
  python3 publish-prep.py retract <slug>          # ongoing posts only
  python3 publish-prep.py rebuild-index           # after a legacy extract.py re-run
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import store


def _print_next_steps(f: Path) -> None:
    print(f"Wrote {f} (and updated _posts.json). Nothing deployed.")
    print("Review + publish:")
    print("  git -C ~/at-site add content/blog && git -C ~/at-site diff --staged")
    print("  # preview locally (npm run dev), then a HUMAN commits + pushes.")


def cmd_publish(args) -> None:
    draft = store.WORK / args.work_id / "draft.json"
    if not draft.exists():
        sys.exit(f"No draft.json in {draft.parent}. Run draft.py first.")
    post = json.loads(draft.read_text())
    if store.load_post(post["slug"]) and not args.force:
        sys.exit(f"Post '{post['slug']}' already exists. Use edit, or --force to overwrite.")
    f = store.save_post(post)
    _print_next_steps(f)


def cmd_edit(args) -> None:
    if bool(args.out) == bool(args.in_):
        sys.exit("Pick exactly one direction: --out <file> (check out) or --in <file> (check in).")
    if args.out:
        post = store.load_post(args.slug)
        if not post:
            sys.exit(f"No post with slug '{args.slug}'.")
        Path(args.out).write_text(json.dumps(post, ensure_ascii=False, indent=2))
        print(f"Checked out '{args.slug}' -> {args.out}. Edit body/title/tags, then:")
        print(f"  python3 {Path(__file__).name} edit {args.slug} --in {args.out}")
        return
    # check-in
    post = json.loads(Path(args.in_).read_text())
    if post.get("slug") != args.slug:
        sys.exit(f"slug in file ({post.get('slug')!r}) != {args.slug!r}. Refusing to write.")
    # keep imageCount honest after a body edit
    post["imageCount"] = str(store.count_images(post.get("body", "")))
    f = store.save_post(post)
    _print_next_steps(f)


def cmd_retract(args) -> None:
    post = store.load_post(args.slug)
    if not post:
        sys.exit(f"No post with slug '{args.slug}'.")
    if post.get("legacyFile"):
        sys.exit(f"'{args.slug}' is a MIGRATED legacy post (legacyFile set). "
                 "This tool only retracts ongoing posts; refusing.")
    if store.delete_post(args.slug):
        print(f"Removed ongoing post '{args.slug}' from posts/ and _posts.json. Nothing deployed.")


def cmd_rebuild(args) -> None:
    n = store.rebuild_index()
    print(f"Rebuilt _posts.json from posts/ ({n} entries).")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("publish", help="approved draft -> live store")
    p.add_argument("work_id")
    p.add_argument("--force", action="store_true", help="overwrite an existing slug")
    p.set_defaults(func=cmd_publish)

    p = sub.add_parser("edit", help="check an existing post out/in for editing")
    p.add_argument("slug")
    p.add_argument("--out", help="write the post to this file for editing")
    p.add_argument("--in", dest="in_", help="write this edited file back into the store")
    p.set_defaults(func=cmd_edit)

    p = sub.add_parser("retract", help="remove an ongoing post (not legacy)")
    p.add_argument("slug")
    p.set_defaults(func=cmd_retract)

    p = sub.add_parser("rebuild-index", help="regenerate _posts.json from posts/")
    p.set_defaults(func=cmd_rebuild)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
