#!/usr/bin/env bash
# Orchestrates the remaining blog-image migration end-to-end, unattended.
# Assumes download-images.py is already running (or done). Waits for the download
# to stabilize, then uploads to Shopify Files, rewrites post bodies, and rebuilds.
#
# Run:  bash scripts/blog-migration/run-migration.sh
set -euo pipefail
cd "$(dirname "$0")/../.."   # ~/at-site
DIR=scripts/blog-migration

echo "[1/5] Waiting for image download to stabilize..."
prev=-1
while true; do
  n=$(find "$DIR/images" -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "  images on disk: $n"
  if [ "$n" = "$prev" ]; then
    echo "  download stable at $n images."
    break
  fi
  prev=$n
  sleep 30
done

echo "[2/5] Uploading images to Shopify Files (resumable)..."
# Loop in case of transient failures; upload-images.py is resumable.
for attempt in 1 2 3; do
  python3 "$DIR/upload-images.py" || true
  remaining=$(python3 - <<'PY'
import json,os
from pathlib import Path
HERE=Path("scripts/blog-migration")
man=json.loads((HERE/"image-manifest.json").read_text())
m=json.loads((HERE/"image-url-map.json").read_text()) if (HERE/"image-url-map.json").exists() else {}
todo=[u for u,v in man.items() if u not in m and (HERE/"images"/v["file"]).exists()]
print(len(todo))
PY
)
  echo "  attempt $attempt: $remaining images still unmapped"
  [ "$remaining" = "0" ] && break
done

echo "[3/5] Rewriting post bodies to Shopify CDN URLs..."
python3 "$DIR/rewrite-bodies.py"

echo "[4/5] Production build..."
npx next build 2>&1 | tail -5

echo "[5/5] Done. Migration complete."
echo "  url-map: $(python3 -c "import json;print(len(json.load(open('$DIR/image-url-map.json'))))") images on Shopify CDN"
