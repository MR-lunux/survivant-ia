#!/usr/bin/env bash
# Generate all favicon variants from logo/favicon-source.svg.
# Run manually whenever the brand mark changes; commit the resulting public/ files.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="logo/favicon-source.svg"
OUT="public"

if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found" >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "Error: ImageMagick 'magick' command not found" >&2
  exit 1
fi

echo "Generating favicons from $SRC..."

# Modern SVG favicon (served as-is to recent browsers)
cp "$SRC" "$OUT/favicon.svg"

# iOS home screen
magick -background none "$SRC" -resize 180x180 "$OUT/apple-touch-icon.png"

# PWA / manifest icons (Android, installable web app)
magick -background none "$SRC" -resize 192x192 "$OUT/icon-192.png"
magick -background none "$SRC" -resize 512x512 "$OUT/icon-512.png"

# Multi-resolution .ico (legacy browsers + Windows)
magick -background none "$SRC" \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  -delete 0 "$OUT/favicon.ico"

echo
echo "Done. Generated:"
ls -la "$OUT"/{favicon.svg,favicon.ico,apple-touch-icon.png,icon-192.png,icon-512.png}
