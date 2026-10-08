#!/usr/bin/env python3
"""Booth QR for an event (event kit, t1101).

Writes a print-ready PNG whose URL carries the UTMs the site's GA4 setup expects
(A5 Job/Linslow/Clients/Amy Tangerine/utm-convention.md, "Event QR codes" row):
    utm_source=event  utm_medium=qr  utm_campaign=<slug>

    python3 scripts/event-qr.py little-craft-fest-fall-2026
    python3 scripts/event-qr.py paper-world-anaheim-september --alias paperworld
    python3 scripts/event-qr.py <slug> --out /some/dir --folder "2026-10-23 Little Craft Fest Conroe"

Per-event QR (default): https://www.amytangerine.com/events/<slug>/booth?utm_...
Alias QR (--alias):     https://www.amytangerine.com/<alias>?utm_... (utm_campaign=<alias>).
The alias form is the one that never changes between stops (the printed Paper
World sign); /<alias> redirects to the current stop's booth page, query intact.

Output lands in the vault's per-event folder (event-support-runbook.md filing
rule: Events/<date> <event>/), as <slug>-booth-qr.png plus a .txt with the URL,
so the destination of a printed code is always on record. Pure stdlib + the
`qrcode` package (Pillow for PNG); nothing from the Next app is imported.
"""

import argparse
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlencode

try:
    import qrcode
    from qrcode.constants import ERROR_CORRECT_H
except ImportError:
    sys.exit("pip install qrcode pillow")

REPO = Path(__file__).resolve().parent.parent
CONTENT = REPO / "lib" / "events-content.ts"
BASE_DEFAULT = "https://www.amytangerine.com"
VAULT_EVENTS_DEFAULT = (
    Path.home()
    / "Claudesidian Vault - Parent"
    / "Claudesidian Vault - JC"
    / "A5 Job"
    / "Linslow"
    / "Clients"
    / "Amy Tangerine"
    / "Events"
)


def read_event(slug: str) -> dict:
    """Pull title/city/sortDate/booth-ness for one slug out of events-content.ts.

    A regex over the TS literal, not a parser: the file is hand-kept and each
    entry starts with `slug: "..."`, so the block runs to the next `slug:`.
    """
    text = CONTENT.read_text()
    m = re.search(r'slug:\s*"%s"' % re.escape(slug), text)
    if not m:
        sys.exit(f"slug {slug!r} not found in {CONTENT}")
    nxt = re.search(r'\n\s*slug:\s*"', text[m.end():])
    block = text[m.start(): m.end() + (nxt.start() if nxt else len(text))]

    def field(name: str) -> str:
        f = re.search(r'\b%s:\s*"([^"]*)"' % name, block)
        return f.group(1) if f else ""

    return {
        "slug": slug,
        "title": field("title"),
        "city": field("city"),
        "sortDate": field("sortDate"),
        "hasBooth": bool(re.search(r"\bbooth:\s*\{", block)),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", help="event slug from lib/events-content.ts")
    ap.add_argument("--alias", help="encode the fixed short path /<alias> instead of the per-event booth path")
    ap.add_argument("--base", default=BASE_DEFAULT, help="site origin (default %(default)s)")
    ap.add_argument("--out", help="directory to write into (default: the vault Events folder)")
    ap.add_argument("--folder", help="per-event folder name under --out (default: '<sortDate> <title> <city>')")
    ap.add_argument("--box", type=int, default=24, help="pixels per module (default 24; about 1,500px wide at version 5)")
    args = ap.parse_args()

    ev = read_event(args.slug)
    if not ev["hasBooth"]:
        sys.exit(f"{args.slug} has no `booth` block in events-content.ts; add one first (the page 404s without it)")

    if args.alias:
        path = f"/{args.alias.strip('/')}"
        campaign = args.alias.strip("/")
    else:
        path = f"/events/{args.slug}/booth"
        campaign = args.slug
    url = f"{args.base.rstrip('/')}{path}?" + urlencode(
        {"utm_source": "event", "utm_medium": "qr", "utm_campaign": campaign}
    )

    out_root = Path(args.out) if args.out else VAULT_EVENTS_DEFAULT
    city = ev["city"].split(",")[0].strip()
    folder = args.folder or " ".join(x for x in (ev["sortDate"], ev["title"], city) if x)
    out_dir = out_root / folder
    out_dir.mkdir(parents=True, exist_ok=True)

    stem = f"{args.alias}-alias-qr" if args.alias else f"{args.slug}-booth-qr"
    png = out_dir / f"{stem}.png"
    txt = out_dir / f"{stem}.txt"

    qr = qrcode.QRCode(error_correction=ERROR_CORRECT_H, box_size=args.box, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(png)
    txt.write_text(
        f"{url}\n\nevent: {ev['title']} · {ev['city']} · {ev['sortDate']}\n"
        f"generated: {os.path.basename(__file__)} on {__import__('datetime').date.today().isoformat()}\n"
        "Print at 2 inches or larger; error correction H survives a logo overlay up to about 30%.\n"
    )
    w, h = img.size
    print(f"wrote {png} ({w}x{h}px)")
    print(f"wrote {txt}")
    print(url)


if __name__ == "__main__":
    main()
