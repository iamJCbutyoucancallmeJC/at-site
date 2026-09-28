#!/usr/bin/env python3
"""
Step 1 of the ongoing-post pipeline (t813): INGEST a newsletter source.

Current reality (2026-07-08): ingest is MANUAL-PASTE / export based. Kajabi has
no email API (see project_at_email_analytics_gap), so a human (or an agent with
the newsletter on screen) drops the newsletter into scripts/blog-automation/inbox/
as .html (a Kajabi "view in browser" save / email export) or .txt/.md (pasted
text). This script normalizes whatever landed into a work bundle for draft.py.

Usage:
  python3 ingest.py --list                 # show inbox contents
  python3 ingest.py <file>                 # file path, or bare name in inbox/
  python3 ingest.py <file> --id my-id      # override the work-bundle id
  python3 ingest.py --from-kajabi          # NOT IMPLEMENTED (stub, see below)

Output: work/<id>/
  source.<ext>   verbatim copy of the input
  source.txt     extracted readable text (what draft.py feeds the model)
  source.html    lightly-cleaned HTML (scripts/styles/head stripped) when input was HTML
  meta.json      {id, source_file, title_guess, ingested_at, status: "ingested"}
"""
import argparse
import json
import re
import shutil
import sys
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import store

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("Need beautifulsoup4: pip3 install beautifulsoup4")

TEXT_EXTS = {".txt", ".md"}
HTML_EXTS = {".html", ".htm"}

KAJABI_TODO = """\
--from-kajabi is a STUB. Kajabi has no email API (verified during the AT email
analytics work, 2026-06); there is nothing to connect to programmatically.

TODO if this ever becomes real:
  - If AT email lands on Klaviyo (per the t773/Shape-E migration), implement this
    against the Klaviyo Campaigns API (GET /api/campaigns + template HTML) and
    rename the flag --from-klaviyo.
  - Until then the supported path is manual: save the sent newsletter as HTML
    ("view in browser" -> save page) or paste its text into a .txt/.md file,
    drop it in scripts/blog-automation/inbox/, and run: python3 ingest.py <file>
"""


def clean_html(soup: BeautifulSoup) -> str:
    for tag in soup(["script", "style", "head", "meta", "link", "title"]):
        tag.decompose()
    # Drop obvious email-chrome blocks (unsubscribe/footer boilerplate).
    for a in soup.find_all("a", href=True):
        if re.search(r"unsubscribe|email preferences|manage.*subscription", a.get_text(" ", strip=True), re.I):
            block = a.find_parent(["p", "td", "div"]) or a
            block.decompose()
    body = soup.body or soup
    return body.decode_contents() if hasattr(body, "decode_contents") else str(body)


def extract_text(soup: BeautifulSoup) -> str:
    text = soup.get_text("\n", strip=True)
    return re.sub(r"\n{3,}", "\n\n", text)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source", nargs="?", help="newsletter file (path, or bare name resolved in inbox/)")
    ap.add_argument("--id", help="work-bundle id (default: YYYY-MM-DD-<file-stem>)")
    ap.add_argument("--list", action="store_true", help="list inbox contents")
    ap.add_argument("--from-kajabi", action="store_true", help="live Kajabi pull (stub, not implemented)")
    args = ap.parse_args()

    if args.from_kajabi:
        sys.exit(KAJABI_TODO)

    if args.list:
        files = [f for f in sorted(store.INBOX.iterdir()) if f.is_file() and f.name != ".gitkeep"]
        if not files:
            print("inbox/ is empty. Drop a newsletter .html or .txt/.md here first.")
        for f in files:
            print(f.name)
        return

    if not args.source:
        ap.error("give a newsletter file (or --list / --from-kajabi)")

    src = Path(args.source)
    if not src.exists():
        src = store.INBOX / args.source
    if not src.exists():
        sys.exit(f"Not found: {args.source} (looked at the path given and in {store.INBOX})")

    ext = src.suffix.lower()
    if ext not in TEXT_EXTS | HTML_EXTS:
        sys.exit(f"Unsupported extension {ext}: expected .html/.htm/.txt/.md")

    work_id = args.id or f"{date.today().isoformat()}-{store.slugify(src.stem)}"
    work = store.WORK / work_id
    if work.exists():
        sys.exit(f"Work bundle already exists: {work} (pass --id to pick another)")
    work.mkdir(parents=True)

    shutil.copy2(src, work / f"source{ext}")
    raw = src.read_text(errors="replace")
    title_guess = ""

    if ext in HTML_EXTS:
        soup = BeautifulSoup(raw, "html.parser")
        if soup.title and soup.title.string:
            title_guess = soup.title.string.strip()
        (work / "source.html").write_text(clean_html(soup))
        text = extract_text(BeautifulSoup(raw, "html.parser"))
    else:
        text = raw.strip()
    if not title_guess:
        first = next((l.strip() for l in text.splitlines() if l.strip()), "")
        title_guess = re.sub(r"^#+\s*", "", first)[:120]

    if len(text.split()) < 30:
        print("WARNING: extracted under 30 words; is this really the newsletter?", file=sys.stderr)

    (work / "source.txt").write_text(text)
    meta = {
        "id": work_id,
        "source_file": src.name,
        "title_guess": title_guess,
        "ingested_at": datetime.now().astimezone().isoformat(timespec="seconds"),
        "status": "ingested",
    }
    (work / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    print(f"Ingested -> {work}")
    print(f"  title guess: {title_guess!r}")
    print(f"  next: python3 {Path(__file__).parent / 'draft.py'} {work_id}")


if __name__ == "__main__":
    main()
