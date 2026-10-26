#!/usr/bin/env bash
# Export game/PotionShop.json to an HTML5 build with the official GDevelop CLI.
# Usage: tools/export.sh <path to extracted GDevelop portable app dir> [output dir]
set -euo pipefail
GD_APP="${1:?path to the extracted GDevelop portable zip}"
OUT="${2:-docs}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
cp -r "$ROOT/game/." "$WORK/"
NODE_OPTIONS= timeout 600 xvfb-run -a "$GD_APP/gdevelop" --no-sandbox --disable-update-check --disable-gpu \
  --run-command EXPORT_HTML5_EXTERNAL "$WORK/PotionShop.json" 2>&1 | grep -iE "error|fail|export" | grep -viE "dbus|gpu|bus.cc" || true
test -f "$WORK/build/index.html" || { echo "Export failed: no index.html"; exit 1; }
rm -rf "$ROOT/$OUT"
mkdir -p "$ROOT/$OUT"
cp -r "$WORK/build/." "$ROOT/$OUT/"
touch "$ROOT/$OUT/.nojekyll"
# PWA layer (manifest, service worker, icons, ad adapter). docs/ is the test
# build: it uses the development ad config (clearly labelled simulated ads).
# The production deploy re-applies it with --ads production.
python3 "$ROOT/tools/pwa/apply_pwa.py" "$ROOT/$OUT" --ads "${ADS_MODE:-development}"
rm -rf "$WORK"
echo "Exported to $OUT ($(du -sh "$ROOT/$OUT" | cut -f1))"
