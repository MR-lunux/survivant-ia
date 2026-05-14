#!/usr/bin/env bash
set -euo pipefail

WHISPER_DIR="${WHISPER_DIR:-$HOME/.local/whisper.cpp}"
MODEL_FILE="ggml-large-v3.bin"

if [ ! -d "$WHISPER_DIR" ]; then
  echo "→ Cloning whisper.cpp into $WHISPER_DIR"
  mkdir -p "$(dirname "$WHISPER_DIR")"
  git clone https://github.com/ggerganov/whisper.cpp "$WHISPER_DIR"
fi

cd "$WHISPER_DIR"

if [ ! -f "models/$MODEL_FILE" ]; then
  echo "→ Downloading model $MODEL_FILE (~3GB, one-time)"
  bash ./models/download-ggml-model.sh large-v3
fi

if [ ! -f "./build/bin/whisper-cli" ] && [ ! -f "./main" ]; then
  echo "→ Building whisper.cpp"
  cmake -B build
  cmake --build build --config Release -j
fi

echo "✓ Whisper ready at $WHISPER_DIR"
echo "✓ Model: $WHISPER_DIR/models/$MODEL_FILE"
