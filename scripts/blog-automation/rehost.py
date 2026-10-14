#!/usr/bin/env python3
"""
Re-host a post's external images on Shopify Files, the way the migration did
(scripts/blog-migration/upload-images.py: stagedUploadsCreate -> POST bytes ->
fileCreate -> poll READY). Newsletter images live on Klaviyo's CDN
(d3k81ch9hvuctc.cloudfront.net); a post should not depend on an email host.

Record: scripts/blog-automation/image-url-map.json  {source_url: shopify_cdn_url}
(committed: the record, same as the migration's image-url-map.json). Re-runs are
idempotent: a mapped url is rewritten, never uploaded twice.

Needs .env.local in the repo (SHOPIFY_STORE_DOMAIN + admin client id/secret).
Without it, or on any upload error, the body is left pointing at the original
host and the failure is reported LOUDLY (returned in the report and printed to
stderr); approve.py then refuses to publish a post with external images unless
told otherwise.

Usage (also imported by draft.py / edit-post.py):
  python3 rehost.py <slug> [--dry-run]     # rehost an existing post's images in place
"""
import argparse
import hashlib
import importlib.util
import json
import mimetypes
import re
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import store

URL_MAP = store.AUTOMATION / "image-url-map.json"
IMG_DIR = store.AUTOMATION / "images"            # gitignored scratch for the downloaded bytes
MIGRATION_UPLOADER = store.REPO / "scripts" / "blog-migration" / "upload-images.py"
OWN_HOSTS = ("cdn.shopify.com", "amytangerine.com", "www.amytangerine.com")


def is_external(src: str) -> bool:
    m = re.match(r"https?://([^/]+)/", src or "")
    return bool(m) and m.group(1).lower() not in OWN_HOSTS


def external_images(body_html: str) -> list[str]:
    return [s for s in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', body_html, flags=re.I) if is_external(s)]


def load_map() -> dict:
    return json.loads(URL_MAP.read_text()) if URL_MAP.exists() else {}


def _uploader():
    """Import the migration uploader as a module (it reads .env.local at import)."""
    if not (store.REPO / ".env.local").exists():
        raise RuntimeError("no .env.local in the repo; cannot mint a Shopify Admin token")
    spec = importlib.util.spec_from_file_location("at_upload_images", MIGRATION_UPLOADER)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.TOKEN = mod.mint_token()
    return mod


def upload(mod, src: str, alt: str) -> str:
    IMG_DIR.mkdir(exist_ok=True)
    ext = Path(src.split("?")[0]).suffix.lower() or ".jpg"
    fname = hashlib.sha1(src.encode()).hexdigest()[:16] + ext
    path = IMG_DIR / fname
    if not path.exists():
        req = urllib.request.Request(src, headers={"User-Agent": "at-site blog-automation"})
        with urllib.request.urlopen(req, timeout=60) as r:
            path.write_bytes(r.read())
    data = path.read_bytes()
    mime = mimetypes.guess_type(fname)[0] or "image/jpeg"
    staged = mod.gql(mod.STAGED, {"input": [{"filename": fname, "mimeType": mime,
                                             "resource": "FILE", "httpMethod": "POST"}]})["stagedUploadsCreate"]
    if staged["userErrors"]:
        raise RuntimeError(staged["userErrors"])
    target = staged["stagedTargets"][0]
    mod.post_multipart(target["url"], target["parameters"], data, fname, mime)
    created = mod.gql(mod.FILE_CREATE, {"files": [{"originalSource": target["resourceUrl"], "contentType": "IMAGE",
                                                   "alt": alt or f"Journal image ({fname})"}]})["fileCreate"]
    if created["userErrors"]:
        raise RuntimeError(created["userErrors"])
    file_id = created["files"][0]["id"]
    for _ in range(20):
        node = mod.gql(mod.NODE, {"id": file_id})["node"]
        if node and node.get("fileStatus") == "READY" and (node.get("image") or {}).get("url"):
            return node["image"]["url"]
        time.sleep(1.5)
    raise TimeoutError(f"file {file_id} not READY in time")


def rehost_body(body_html: str, dry_run: bool = False) -> tuple[str, dict]:
    """Rewrite external <img src> to Shopify Files urls. Returns (body, report)."""
    report = {"rehosted": [], "already_mapped": [], "failed": [], "external_left": []}
    todo = sorted(set(external_images(body_html)))
    if not todo:
        return body_html, report
    url_map = load_map()
    mod = None
    for src in todo:
        alt_m = re.search(r'<img\b[^>]*\bsrc="' + re.escape(src) + r'"[^>]*\balt="([^"]*)"', body_html, flags=re.I) \
            or re.search(r'<img\b[^>]*\balt="([^"]*)"[^>]*\bsrc="' + re.escape(src) + r'"', body_html, flags=re.I)
        alt = alt_m.group(1) if alt_m else ""
        if src in url_map:
            report["already_mapped"].append(src)
            cdn = url_map[src]
        elif dry_run:
            report["external_left"].append(src)
            continue
        else:
            try:
                mod = mod or _uploader()
                cdn = upload(mod, src, alt)
                url_map[src] = cdn
                URL_MAP.write_text(json.dumps(url_map, indent=2))
                report["rehosted"].append({"from": src, "to": cdn})
            except Exception as e:  # noqa: BLE001
                report["failed"].append({"src": src, "error": f"{type(e).__name__}: {e}"})
                report["external_left"].append(src)
                print(f"WARNING: could not re-host {src}: {type(e).__name__}: {e}", file=sys.stderr)
                continue
        body_html = body_html.replace(f'src="{src}"', f'src="{cdn}"')
    return body_html, report


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    post = store.load_post(args.slug)
    if not post:
        sys.exit(f"No post with slug '{args.slug}'.")
    body, report = rehost_body(post["body"], dry_run=args.dry_run)
    print(json.dumps(report, indent=2))
    if body != post["body"] and not args.dry_run:
        post["body"] = body
        store.save_post(post)
        print(f"Updated {store.post_path(args.slug).relative_to(store.REPO)}")


if __name__ == "__main__":
    main()
