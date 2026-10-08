#!/usr/bin/env python3
"""
Approve path (t813): flip a draft to published and COMMIT it on the current
branch. The deploy is the normal merge of that branch to main (Vercel builds
main); this script never pushes, merges, or deploys.

What it does:
  - refuses if the post is not a draft, or still has images on an external host
    (pass --allow-external to override, knowingly)
  - sets date to today (or --date YYYY-MM-DD) and datePublishedISO to now
  - removes the draft flag, rewrites the index entry in place
  - commits ONLY the two store files, with a message naming the post and its
    source campaign, unless --no-commit

Usage:
  python3 approve.py <slug>
  python3 approve.py <slug> --date 2026-10-10
  python3 approve.py <slug> --no-commit
"""
import argparse
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import rehost
import store


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("--date", help="publish date YYYY-MM-DD (default today)")
    ap.add_argument("--allow-external", action="store_true", help="publish even with images on an external host")
    ap.add_argument("--no-commit", action="store_true", help="flip the flag, leave the change uncommitted")
    args = ap.parse_args()

    post = store.load_post(args.slug)
    if not post:
        sys.exit(f"No post with slug '{args.slug}'.")
    if not post.get("draft"):
        sys.exit(f"'{args.slug}' is not a draft (already published, or a legacy post). Nothing to do.")
    external = rehost.external_images(post["body"])
    if external and not args.allow_external:
        sys.exit("Refusing: the body still has image(s) on an external host:\n  " + "\n  ".join(external)
                 + "\nRun rehost.py <slug> first, or pass --allow-external.")
    if args.date and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        sys.exit("--date must be YYYY-MM-DD")

    post["date"] = args.date or date.today().isoformat()
    post["datePublishedISO"] = store.now_iso() if not args.date else f"{args.date}T06:00:00-0700"
    post.pop("draft", None)
    src = post.get("source")
    if isinstance(src, dict):
        src["approved_at"] = store.now_iso()
    f = store.save_post(post)
    paths = [str(f.relative_to(store.REPO)), str(store.INDEX.relative_to(store.REPO))]
    print(f"Published in the store: {paths[0]} (date {post['date']}), index entry updated.")

    if args.no_commit:
        print("Not committed (--no-commit). Commit the two files when ready.")
        return
    camp = (src or {}).get("campaign_name") or (src or {}).get("subject") or "manual source"
    msg = f"blog: publish \"{post['title']}\" ({post['slug']})\n\nSource: {camp}; approved via scripts/blog-automation/approve.py (t813).\n"
    subprocess.run(["git", "-C", str(store.REPO), "add", "--", *paths], check=True)
    r = subprocess.run(["git", "-C", str(store.REPO), "commit", "--only", "-m", msg, "--", *paths],
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"git commit failed:\n{r.stderr or r.stdout}")
    sha = subprocess.run(["git", "-C", str(store.REPO), "rev-parse", "--short", "HEAD"], capture_output=True, text=True).stdout.strip()
    branch = subprocess.run(["git", "-C", str(store.REPO), "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True).stdout.strip()
    print(f"Committed {sha} on {branch}. Deploy = push the branch and merge it to main (see README.md); nothing pushed.")


if __name__ == "__main__":
    main()
