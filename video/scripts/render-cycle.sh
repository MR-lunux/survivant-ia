#!/usr/bin/env bash
# video/scripts/render-cycle.sh
# Render un cycle complet : 8 PNG (Instagram) + 1 PDF (LinkedIn).
#
# Usage: ./scripts/render-cycle.sh <composition-id>
# Exemple: ./scripts/render-cycle.sh Carousel-Template
#         ./scripts/render-cycle.sh Carousel-Cycle1

set -euo pipefail

COMPOSITION_ID="${1:-}"

if [[ -z "$COMPOSITION_ID" ]]; then
  echo "Usage: $0 <composition-id>"
  echo "Exemples : Carousel-Template, Carousel-Cycle1"
  exit 1
fi

# Slug = lowercase de l'ID (ex: Carousel-Template → carousel-template)
SLUG=$(echo "$COMPOSITION_ID" | tr '[:upper:]' '[:lower:]')
OUT_DIR="out/$SLUG"

echo "→ Render $COMPOSITION_ID dans $OUT_DIR/"
mkdir -p "$OUT_DIR"

# Render 8 PNG (frames 0-7)
for i in 0 1 2 3 4 5 6 7; do
  npx remotion still "$COMPOSITION_ID" "$OUT_DIR/slide-$((i+1)).png" --frame=$i
done

echo "→ Concat PDF $OUT_DIR/carousel.pdf"
node scripts/concat-pdf.mjs "$OUT_DIR/" "$OUT_DIR/carousel.pdf"

echo ""
echo "✓ Cycle rendu :"
echo "  Instagram (8 PNG) : $OUT_DIR/slide-1.png ... slide-8.png"
echo "  LinkedIn  (1 PDF) : $OUT_DIR/carousel.pdf"
