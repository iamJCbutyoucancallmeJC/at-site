#!/usr/bin/env python3
"""
Upload downloaded legacy blog images to Shopify Files, then record the
SQS-URL -> Shopify-CDN-URL mapping. Decouples the blog from the Squarespace CDN
before SQS is decommissioned (the at-site app token already has write_files --
see memory at_site_app_admin_scopes_broad).

Flow per image (Shopify Files GraphQL):
  1. stagedUploadsCreate  -> signed upload target (resource: FILE)
  2. POST the bytes to the staged target
  3. fileCreate           -> register the file (originalSource = staged resourceUrl)
  4. poll node(id) until fileStatus=READY and image.url is populated

Reads:  scripts/blog-migration/image-manifest.json  (url -> {file, posts})
        scripts/blog-migration/images/<file>
Writes: scripts/blog-migration/image-url-map.json    (sqs_url -> shopify_cdn_url)

Resumable: skips any sqs_url already in image-url-map.json.
Run: python3 scripts/blog-migration/upload-images.py [--limit N] [--dry-run]
"""
import argparse, json, mimetypes, os, sys, time
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
IMG_DIR = HERE / "images"
MANIFEST = HERE / "image-manifest.json"
URL_MAP = HERE / "image-url-map.json"
API_VERSION = "2025-01"


def env(key):
    for line in (REPO / ".env.local").read_text().splitlines():
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit(f"missing {key} in .env.local")


DOMAIN = env("SHOPIFY_STORE_DOMAIN")
CLIENT_ID = env("SHOPIFY_ADMIN_CLIENT_ID")
CLIENT_SECRET = env("SHOPIFY_ADMIN_CLIENT_SECRET")


def mint_token():
    req = Request(
        f"https://{DOMAIN}/admin/oauth/access_token",
        data=json.dumps({
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "client_credentials",
        }).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urlopen(req, timeout=30) as r:
        return json.load(r)["access_token"]


TOKEN = None


def gql(query, variables=None):
    req = Request(
        f"https://{DOMAIN}/admin/api/{API_VERSION}/graphql.json",
        data=json.dumps({"query": query, "variables": variables or {}}).encode(),
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN},
    )
    with urlopen(req, timeout=60) as r:
        out = json.load(r)
    if "errors" in out:
        raise RuntimeError(out["errors"])
    return out["data"]


STAGED = """
mutation stage($input:[StagedUploadInput!]!){
  stagedUploadsCreate(input:$input){
    stagedTargets{ url resourceUrl parameters{ name value } }
    userErrors{ field message }
  }
}"""

FILE_CREATE = """
mutation fc($files:[FileCreateInput!]!){
  fileCreate(files:$files){
    files{ id fileStatus alt }
    userErrors{ field message }
  }
}"""

NODE = """
query n($id:ID!){
  node(id:$id){ ... on MediaImage { id fileStatus image{ url } } }
}"""


def post_multipart(url, params, file_bytes, filename, mime):
    boundary = "----atblogmigration7f3a"
    parts = []
    for p in params:
        parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{p['name']}\"\r\n\r\n{p['value']}\r\n".encode())
    parts.append(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n"
        f"Content-Type: {mime}\r\n\r\n".encode()
        + file_bytes + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)
    req = Request(url, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urlopen(req, timeout=120) as r:
        return r.status


def upload_one(sqs_url, fname):
    path = IMG_DIR / fname
    data = path.read_bytes()
    mime = mimetypes.guess_type(fname)[0] or "image/jpeg"

    staged = gql(STAGED, {"input": [{
        "filename": fname, "mimeType": mime,
        "resource": "FILE", "httpMethod": "POST",
    }]})["stagedUploadsCreate"]
    if staged["userErrors"]:
        raise RuntimeError(staged["userErrors"])
    target = staged["stagedTargets"][0]
    post_multipart(target["url"], target["parameters"], data, fname, mime)

    created = gql(FILE_CREATE, {"files": [{
        "originalSource": target["resourceUrl"],
        "contentType": "IMAGE",
        "alt": f"Legacy blog image ({sqs_url.rsplit('/',1)[-1]})",
    }]})["fileCreate"]
    if created["userErrors"]:
        raise RuntimeError(created["userErrors"])
    file_id = created["files"][0]["id"]

    # poll for READY + cdn url
    for _ in range(20):
        node = gql(NODE, {"id": file_id})["node"]
        if node and node.get("fileStatus") == "READY" and node.get("image", {}).get("url"):
            return node["image"]["url"]
        time.sleep(1.5)
    raise TimeoutError(f"file {file_id} not READY in time")


def main():
    global TOKEN
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    manifest = json.loads(MANIFEST.read_text())
    url_map = json.loads(URL_MAP.read_text()) if URL_MAP.exists() else {}
    todo = [(u, m["file"]) for u, m in manifest.items()
            if u not in url_map and (IMG_DIR / m["file"]).exists()]
    if args.limit:
        todo = todo[: args.limit]
    print(f"{len(todo)} images to upload ({len(url_map)} already mapped, "
          f"{len(manifest)} in manifest)")
    if args.dry_run:
        return

    TOKEN = mint_token()
    ok = fail = 0
    failures = []
    for i, (sqs_url, fname) in enumerate(todo, 1):
        try:
            cdn = upload_one(sqs_url, fname)
            url_map[sqs_url] = cdn
            ok += 1
        except Exception as e:  # noqa: BLE001
            fail += 1
            failures.append({"url": sqs_url, "file": fname, "error": str(e)})
        if i % 50 == 0:
            URL_MAP.write_text(json.dumps(url_map, indent=2))
            print(f"  {i}/{len(todo)}  ok={ok} fail={fail}")
            TOKEN = mint_token()  # refresh before it can expire

    URL_MAP.write_text(json.dumps(url_map, indent=2))
    if failures:
        (HERE / "image-upload-failures.json").write_text(json.dumps(failures, indent=2))
    print(f"\nDone. ok={ok} fail={fail} | url-map: {len(url_map)} images mapped")


if __name__ == "__main__":
    main()
