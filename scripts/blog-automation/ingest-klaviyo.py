#!/usr/bin/env python3
"""
Step 1 of the ongoing-post pipeline (t813): INGEST a sent Klaviyo campaign.

Amy's weekly newsletter is a Klaviyo CAMPAIGN sent to the AT Newsletter list
(RcAVAK). This connector is READ-ONLY against the Campaigns API: it lists sent
campaigns, picks one (by id, or the latest real send to the newsletter list),
pulls the campaign message's template HTML, strips the email chrome, and writes
a clean source into inbox/ plus a work bundle for draft.py. It never creates,
sends, or schedules anything.

Key: ~/.klaviyo-at.json field full_key (Full Access key at-vault-full-2026-09-21).
A 403 means the file is wrong, not that the UI is the path.

Usage:
  python3 ingest-klaviyo.py --list [--days 60]      # sent campaigns, newest first
  python3 ingest-klaviyo.py --latest                # latest real send to the newsletter list
  python3 ingest-klaviyo.py --campaign <id>         # a specific campaign
  python3 ingest-klaviyo.py --latest --dry-run      # print the cleaned source, write nothing
  python3 ingest-klaviyo.py --latest --include-tests  # allow "TEST ..." sends

Output:
  inbox/<send-date>-<label>.md       the clean source with provenance (committed: the record)
  work/<id>/source.txt               same text, what draft.py feeds the model
  work/<id>/source.html              the cleaned HTML (image urls, links intact)
  work/<id>/template.html            the raw template, verbatim, for forensics
  work/<id>/meta.json                provenance + status "ingested"
"""
import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import store

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    sys.exit("Need beautifulsoup4: pip3 install beautifulsoup4")

KEY_FILE = Path.home() / ".klaviyo-at.json"
REVISION = "2025-07-15"
NEWSLETTER_LIST = "RcAVAK"      # AT Newsletter: the Kajabi import plus every capture surface
API = "https://a.klaviyo.com/api"

# Hosts whose links are kept as-is (tracking params stripped). Everything else is
# kept too; this list only decides what counts as "ours" in the notes.
TRACKING_PARAMS = ("utm_", "_kx", "klaviyo", "fbclid", "gclid", "mc_cid", "mc_eid")
CHROME_WORDS = re.compile(
    r"unsubscribe|manage (your )?preferences|email preferences|update your preferences|"
    r"view (this email )?in (your )?browser|view in browser|no longer (wish|want) to receive|"
    r"you(’|')?re receiving this|why did I get this|powered by klaviyo|sent to .*@",
    re.I)


def key() -> str:
    try:
        return json.loads(KEY_FILE.read_text())["full_key"]
    except Exception as e:  # noqa: BLE001
        sys.exit(f"Cannot read the Klaviyo key from {KEY_FILE} (full_key): {e}")


def get(path: str, params: dict | None = None) -> dict:
    url = path if path.startswith("http") else f"{API}{path}"
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": f"Klaviyo-API-Key {key()}", "revision": REVISION,
        "accept": "application/vnd.api+json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        if e.code == 403:
            sys.exit("403 from Klaviyo: ~/.klaviyo-at.json should hold the Full Access key "
                     "at-vault-full-2026-09-21 (vault CLAUDE.md, Klaviyo: API first). Fix the file.")
        sys.exit(f"Klaviyo {e.code} on {url}: {body}")


def list_sent(days: int) -> list[dict]:
    """Sent email campaigns in the window, newest send first."""
    since = (date.today() - timedelta(days=days)).isoformat()
    flt = (f"greater-or-equal(scheduled_at,{since}T00:00:00Z),"
           "equals(messages.channel,'email'),equals(status,'Sent')")
    out, url = [], None
    params = {"filter": flt, "fields[campaign]": "name,status,send_time,scheduled_at,audiences",
              "sort": "-scheduled_at", "page[size]": 50}
    for _ in range(10):
        data = get(url or "/campaigns/", None if url else params)
        for c in data.get("data", []):
            a = c["attributes"]
            out.append(dict(id=c["id"], name=a.get("name") or "", status=a.get("status"),
                            send_time=a.get("send_time") or "",
                            lists=(a.get("audiences") or {}).get("included") or []))
        url = (data.get("links") or {}).get("next")
        if not url:
            break
    out.sort(key=lambda c: c["send_time"], reverse=True)
    return out


def kind(c: dict) -> str:
    """newsletter = a real send to the AT Newsletter list; test = a TEST send; other = another list."""
    if c["name"].upper().startswith("TEST"):
        return "test"
    return "newsletter" if NEWSLETTER_LIST in c["lists"] else "other"


def is_test(c: dict) -> bool:
    return kind(c) != "newsletter"


def pick_latest(days: int, include_tests: bool) -> dict:
    sent = list_sent(days)
    real = [c for c in sent if include_tests or not is_test(c)]
    if not real:
        sys.exit(f"No sent campaign to the newsletter list in the last {days} days "
                 f"({len(sent)} sends seen, all tests or other lists). Try --days or --campaign.")
    return real[0]


def fetch_campaign(campaign_id: str) -> dict:
    c = get(f"/campaigns/{campaign_id}", {"fields[campaign]": "name,status,send_time,scheduled_at,audiences"})["data"]
    a = c["attributes"]
    return dict(id=c["id"], name=a.get("name") or "", status=a.get("status"),
                send_time=a.get("send_time") or "", lists=(a.get("audiences") or {}).get("included") or [])


def fetch_message_and_template(campaign_id: str) -> tuple[dict, dict]:
    data = get(f"/campaigns/{campaign_id}/campaign-messages/", {"include": "template"})
    msgs = [m for m in data.get("data", []) if (m["attributes"].get("definition") or {}).get("channel", "email") == "email"]
    if not msgs:
        sys.exit(f"Campaign {campaign_id} has no email message.")
    m = msgs[0]
    content = (m["attributes"].get("definition") or {}).get("content") or {}
    tpl_id = ((m.get("relationships") or {}).get("template") or {}).get("data", {}).get("id")
    tpl = next((t for t in data.get("included", []) if t["type"] == "template" and t["id"] == tpl_id), None)
    if tpl is None and tpl_id:
        tpl = get(f"/templates/{tpl_id}")["data"]
    if tpl is None:
        sys.exit(f"Campaign {campaign_id}: message {m['id']} has no template to read.")
    message = dict(id=m["id"], subject=content.get("subject") or "", preview_text=content.get("preview_text") or "",
                   from_email=content.get("from_email") or "",
                   send_times=[s.get("datetime") for s in (m["attributes"].get("send_times") or [])])
    template = dict(id=tpl["id"], name=tpl["attributes"].get("name") or "",
                    editor_type=tpl["attributes"].get("editor_type") or "",
                    html=tpl["attributes"].get("html") or "", text=tpl["attributes"].get("text") or "")
    return message, template


# ---- chrome stripping ---------------------------------------------------------

def resolve_klaviyo_tags(html: str) -> str:
    """{{ first_name|default:"friend" }} -> friend; drop every other template tag."""
    html = re.sub(r"\{\{\s*[\w.]+\s*\|\s*default:\s*['\"]([^'\"]*)['\"]\s*\}\}", r"\1", html)
    html = re.sub(r"\{%.*?%\}", "", html, flags=re.S)
    html = re.sub(r"\{\{.*?\}\}", "", html, flags=re.S)
    return html


def clean_url(href: str) -> str:
    try:
        u = urllib.parse.urlsplit(href)
    except ValueError:
        return href
    q = [(k, v) for k, v in urllib.parse.parse_qsl(u.query, keep_blank_values=True)
         if not k.lower().startswith(TRACKING_PARAMS)]
    return urllib.parse.urlunsplit((u.scheme, u.netloc, u.path, urllib.parse.urlencode(q), u.fragment))


def strip_chrome(html: str) -> BeautifulSoup:
    soup = BeautifulSoup(resolve_klaviyo_tags(html), "html.parser")
    for t in soup(["script", "style", "head", "meta", "link", "title", "noscript"]):
        t.decompose()
    # Preheader and hidden blocks.
    for t in soup.find_all(True):
        if not isinstance(t, Tag):
            continue
        style = (t.get("style") or "").replace(" ", "").lower()
        if t.get("data-kl-pt") or "display:none" in style or "max-height:0" in style:
            t.decompose()
    # Tracking pixels and spacer gifs.
    for img in soup.find_all("img"):
        src = img.get("src") or ""
        w, h = (img.get("width") or ""), (img.get("height") or "")
        if w in ("0", "1") or h in ("0", "1") or re.search(r"/track|/open\b|pixel|spacer|\.gif\?", src, re.I) or not src:
            img.decompose()
    # Footer / unsubscribe / view-in-browser blocks: remove the smallest block around them.
    for a in list(soup.find_all("a", href=True)):
        txt = a.get_text(" ", strip=True)
        if CHROME_WORDS.search(txt) or re.search(r"/unsubscribe|manage_preferences|preferences|view_in_browser|/view\b", a["href"], re.I):
            block = a.find_parent(["p", "td", "div", "li"]) or a
            block.decompose()
    for t in list(soup.find_all(["p", "td", "div"])):
        if t.parent is None:
            continue
        txt = t.get_text(" ", strip=True)
        if txt and len(txt) < 400 and CHROME_WORDS.search(txt) and not t.find(["img", "h1", "h2", "h3"]):
            t.decompose()
    # Links: drop tracking params, wrapper spans, email-only attributes.
    for a in soup.find_all("a", href=True):
        a["href"] = clean_url(a["href"])
        for k in ("rel", "target", "style", "class"):
            a.attrs.pop(k, None)
    for t in soup.find_all(True):
        for k in list(t.attrs):
            if k in ("style", "class", "border", "cellpadding", "cellspacing", "role", "align", "valign", "bgcolor") or k.startswith("data-"):
                del t.attrs[k]
    return soup


def to_markdownish(soup: BeautifulSoup) -> str:
    """A plain, readable rendering: paragraphs, headings, lists, [text](url), ![alt](url)."""
    out: list[str] = []

    def inline(node) -> str:
        if isinstance(node, NavigableString):
            return re.sub(r"\s+", " ", str(node))
        if not isinstance(node, Tag):
            return ""
        if node.name == "br":
            return "\n"
        if node.name == "img":
            return f"\n![{node.get('alt') or ''}]({node.get('src')})\n"
        inner = "".join(inline(c) for c in node.children)
        if node.name == "a" and node.get("href"):
            inner = inner.strip()
            return f"[{inner}]({node['href']})" if inner else f"<{node['href']}>"
        if node.name in ("strong", "b"):
            return f"**{inner.strip()}**" if inner.strip() else ""
        if node.name in ("em", "i"):
            return f"*{inner.strip()}*" if inner.strip() else ""
        return inner

    def walk(node, depth=0):
        if isinstance(node, NavigableString):
            s = str(node).strip()
            if s and node.parent and node.parent.name in ("td", "div", "body", "[document]", "center", "span"):
                out.append(s)
            return
        if not isinstance(node, Tag):
            return
        n = node.name
        if n in ("h1", "h2", "h3", "h4"):
            out.append("#" * min(int(n[1]), 3) + " " + inline(node).strip())
        elif n == "p":
            txt = inline(node).strip()
            if txt:
                out.append(txt)
        elif n in ("ul", "ol"):
            for i, li in enumerate(node.find_all("li", recursive=False), 1):
                mark = f"{i}." if n == "ol" else "-"
                out.append(f"{mark} {inline(li).strip()}")
        elif n == "blockquote":
            out.append("> " + inline(node).strip())
        elif n == "img":
            out.append(inline(node).strip())
        elif n == "hr":
            pass
        else:
            for c in node.children:
                walk(c, depth + 1)

    walk(soup)
    text = "\n\n".join(s for s in out if s.strip())
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def body_html(soup: BeautifulSoup) -> str:
    body = soup.body or soup
    return re.sub(r"\n{3,}", "\n\n", body.decode_contents()).strip()


def images_in(soup: BeautifulSoup) -> list[dict]:
    return [dict(src=i.get("src"), alt=i.get("alt") or "") for i in soup.find_all("img") if i.get("src")]


# ---- main ---------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--list", action="store_true", help="list sent campaigns and exit")
    g.add_argument("--latest", action="store_true", help="ingest the latest real send to the newsletter list")
    g.add_argument("--campaign", help="ingest this campaign id")
    ap.add_argument("--days", type=int, default=60, help="window for --list/--latest (default 60)")
    ap.add_argument("--include-tests", action="store_true", help="let TEST sends / other lists qualify for --latest")
    ap.add_argument("--id", help="work-bundle id (default: <send-date>-<campaign-label>)")
    ap.add_argument("--dry-run", action="store_true", help="print the cleaned source; write nothing")
    ap.add_argument("--force", action="store_true", help="overwrite an existing inbox file / work bundle")
    args = ap.parse_args()

    if args.list:
        for c in list_sent(args.days):
            print(f"{c['send_time'][:16]:16} {kind(c):10} {c['id']}  {c['name']}  lists={','.join(c['lists'])}")
        return
    if not (args.latest or args.campaign):
        ap.error("pick one of --list, --latest, --campaign <id>")

    camp = fetch_campaign(args.campaign) if args.campaign else pick_latest(args.days, args.include_tests)
    if camp["status"] != "Sent":
        sys.exit(f"Campaign {camp['id']} ({camp['name']}) is {camp['status']}, not Sent. "
                 "Only sent newsletters become posts.")
    msg, tpl = fetch_message_and_template(camp["id"])
    send_date = (camp["send_time"] or (msg["send_times"] or [""])[0] or "")[:10]

    soup = strip_chrome(tpl["html"])
    text = to_markdownish(soup)
    html = body_html(soup)
    images = images_in(soup)
    if len(text.split()) < 30:
        print("WARNING: under 30 words after stripping; check work/<id>/template.html", file=sys.stderr)

    label = store.slugify(camp["name"])[:60]
    work_id = args.id or f"{send_date}-{label}"
    provenance = {
        "source": "klaviyo-campaign",
        "campaign_id": camp["id"], "campaign_name": camp["name"], "campaign_status": camp["status"],
        "message_id": msg["id"], "template_id": tpl["id"], "template_editor": tpl["editor_type"],
        "subject": msg["subject"], "preview_text": msg["preview_text"], "from_email": msg["from_email"],
        "send_date": send_date, "send_time": camp["send_time"], "lists": camp["lists"],
        "images": images,
    }
    front = "\n".join([
        "---",
        f"source: klaviyo-campaign",
        f"campaign_id: {camp['id']}",
        f"campaign_name: {camp['name']}",
        f"subject: {json.dumps(msg['subject'])}",
        f"preview_text: {json.dumps(msg['preview_text'])}",
        f"send_date: {send_date}",
        f"template_id: {tpl['id']}",
        f"ingested: {store.today()}",
        "---",
    ])
    source_md = f"{front}\n\n# {msg['subject']}\n\n{text}\n"

    if args.dry_run:
        print(source_md)
        print(f"\n[dry run] campaign {camp['id']} sent {send_date}; {len(images)} image(s); work id would be {work_id}",
              file=sys.stderr)
        return

    inbox_file = store.INBOX / f"{work_id}.md"
    work = store.WORK / work_id
    if (inbox_file.exists() or work.exists()) and not args.force:
        sys.exit(f"Already ingested: {inbox_file} / {work}. Pass --force to redo, or --id for a new bundle.")
    store.INBOX.mkdir(parents=True, exist_ok=True)
    work.mkdir(parents=True, exist_ok=True)
    inbox_file.write_text(source_md)
    (work / "source.txt").write_text(source_md)
    (work / "source.html").write_text(html)
    (work / "template.html").write_text(tpl["html"])
    meta = {"id": work_id, "ingested_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "status": "ingested", "inbox_file": str(inbox_file.relative_to(store.REPO)), **provenance}
    (work / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    print(f"Ingested campaign {camp['id']} ({camp['name']}), sent {send_date}")
    print(f"  subject: {msg['subject']!r}")
    print(f"  source:  {inbox_file.relative_to(store.REPO)}  ({len(text.split())} words, {len(images)} images)")
    print(f"  next:    python3 scripts/blog-automation/draft.py {work_id}")


if __name__ == "__main__":
    main()
