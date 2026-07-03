#!/usr/bin/env python3
"""
probe-links.py  (2026-07-03)

Liveness probe for outbound blog links. Feeds two lanes (JC decision 2026-07-03):
  1. Precision curation: classify-curation.py redirects a commercial-PURPOSE post
     only when its commercial destination is confirmed DEAD (purpose AND death).
  2. Link hygiene: strip-dead-links.py strips confirmed-dead links to plain text
     while KEEPING live ones clickable (live affiliate links earn money).

Probes each distinct URL once (HEAD, then GET fallback for hosts that 403/405 a
HEAD -- shorteners especially), follows redirects, and records a verdict:
  alive     final status 2xx/3xx and final host is not a known-dead host
  dead      404/410, DNS/connection failure, or resolves to a known-dead host
  uncertain 403/429/timeout/opaque shortener we can't resolve -> left clickable

Results cache to content/blog/_link-probe.json ({url: {status, code, final}}), so
re-runs are incremental and both consumers read the same cache. Known-dead hosts
(shared with strip-dead-links.py, plus shuttered craft platforms) short-circuit
without a network call.

Run:
  python3 scripts/blog-migration/probe-links.py               # commercial-purpose candidates
  python3 scripts/blog-migration/probe-links.py --all          # every outbound link in the corpus
  python3 scripts/blog-migration/probe-links.py --refresh dead # re-probe cached 'dead' verdicts
"""
import argparse, json, re, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse
import urllib.request, urllib.error, ssl

REPO = Path(__file__).resolve().parents[2]
BLOG = REPO / "content" / "blog"
POSTS_DIR = BLOG / "posts"
CACHE = BLOG / "_link-probe.json"

# Hosts that are dead without probing. Superset of strip-dead-links.py DEAD_HOSTS
# (kept in sync) plus shuttered craft-industry platforms Amy linked heavily.
KNOWN_DEAD_HOSTS = {
    "amy-tan-z6av.squarespace.com", "static.squarespace.com",
    "shop.amytangerine.com", "amytangerine.blogspot.com",
    "twopeasinabucket.com", "americancrafts.typepad.com",
    "lm.inlinkz.com", "inlinkz.com", "goo.gl",
    "studiocalico.com",          # subscription craft co., shut down ~2020
    "getchittrchattr.com",       # defunct
}

# Purpose signals (shared shape with classify-curation.py). Used only to pick the
# default probe set (--all overrides). Kept loose on purpose: over-including the
# candidate set is harmless (we just probe a few extra links).
DISCL = re.compile(r"(in collaboration with|this post is sponsored|sponsored by|were gifted|"
                   r"was gifted|#ad\b|in partnership with| c/o |compensated|"
                   r"thank you to .{0,25}for sponsoring)", re.I)
CTA = re.compile(r"(shop (the|my|this|now)|available (now|online|to purchase)|"
                 r"purchase (online|yours)|buy (now|yours|it here)|use code|"
                 r"order (now|yours)|get yours|now available)", re.I)
FREEBIE = re.compile(r"\b(free printable|free download|freebie)\b", re.I)
A_HREF = re.compile(r'<a\b[^>]*\bhref="(https?://[^"]+)"', re.I)

SHORTENERS = {"bit.ly", "amzn.to", "shrsl.com", "rstyle.me", "go.magik.ly",
              "youtu.be", "tinyurl.com", "ow.ly", "fb.me"}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def host_of(url: str) -> str:
    try:
        return urlparse(url).netloc.lower().replace("www.", "")
    except ValueError:
        return ""


def _request(url: str, method: str):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=10, context=CTX)


def probe_one(url: str) -> dict:
    if host_of(url) in KNOWN_DEAD_HOSTS:
        return {"status": "dead", "code": "known-dead-host", "final": url}
    for method in ("HEAD", "GET"):
        try:
            r = _request(url, method)
            final = r.geturl()
            code = r.getcode()
            if host_of(final) in KNOWN_DEAD_HOSTS:
                return {"status": "dead", "code": code, "final": final}
            return {"status": "alive", "code": code, "final": final}
        except urllib.error.HTTPError as e:
            if e.code in (403, 405, 429) and method == "HEAD":
                continue  # some hosts refuse HEAD; retry with GET
            if e.code in (404, 410):
                return {"status": "dead", "code": e.code, "final": url}
            return {"status": "uncertain", "code": e.code, "final": url}
        except (urllib.error.URLError, TimeoutError, ConnectionError, ssl.SSLError) as e:
            reason = getattr(e, "reason", e)
            msg = str(reason)
            # DNS failure / no such host / refused = the destination is gone.
            if any(s in msg.lower() for s in ("name or service", "nodename", "not known",
                                              "no address", "refused", "getaddrinfo")):
                return {"status": "dead", "code": f"conn:{msg[:40]}", "final": url}
            return {"status": "uncertain", "code": f"err:{msg[:40]}", "final": url}
    return {"status": "uncertain", "code": "no-response", "final": url}


def candidate_urls(all_posts: bool) -> set:
    urls = set()
    for f in sorted(POSTS_DIR.glob("*.json")):
        post = json.loads(f.read_text())
        body, title = post["body"], post.get("title", "")
        if all_posts or DISCL.search(body) or CTA.search(body) or CTA.search(title) \
                or FREEBIE.search(body) or FREEBIE.search(title):
            urls.update(A_HREF.findall(body))
    return urls


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="probe every outbound link, not just candidates")
    ap.add_argument("--refresh", choices=["dead", "uncertain", "all"], help="re-probe cached verdicts of this kind")
    args = ap.parse_args()

    cache = json.loads(CACHE.read_text()) if CACHE.exists() else {}
    urls = candidate_urls(args.all)
    todo = [u for u in urls if u not in cache
            or (args.refresh and (args.refresh == "all" or cache[u]["status"] == args.refresh))]
    print(f"{len(urls)} candidate URLs | {len(cache)} cached | probing {len(todo)}...")

    done = 0
    with ThreadPoolExecutor(max_workers=16) as ex:
        for url, res in zip(todo, ex.map(probe_one, todo)):
            cache[url] = res
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(todo)}", file=sys.stderr)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True) + "\n")

    from collections import Counter
    probed = {u: cache[u] for u in urls}
    c = Counter(v["status"] for v in probed.values())
    print(f"\nVerdicts over {len(probed)} candidate URLs: "
          f"alive={c['alive']} dead={c['dead']} uncertain={c['uncertain']}")
    dead_hosts = Counter(host_of(u) for u, v in probed.items() if v["status"] == "dead")
    print("Top dead hosts:", dict(dead_hosts.most_common(10)))
    print(f"Wrote {CACHE.relative_to(REPO)}")


if __name__ == "__main__":
    main()
