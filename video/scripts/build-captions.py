#!/usr/bin/env python3
"""
Match user-provided text lines (manual derush script) to Whisper transcript
timestamps and emit captions.json for the FaceCam captions overlay.

Usage: build-captions.py <user-text-path> <whisper-transcript-path> <out-path>

Algorithm:
- Walk user lines in order. For each line, find the first matching word in
  the Whisper word stream (case + accent insensitive, advancing the cursor).
- Caption start = matched Whisper word start time.
- Caption end = next caption start - 0.05s (or last Whisper word end for the
  final caption).
"""

import sys
import json
import unicodedata
from typing import Optional


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower().strip(".,?!:;'\"-")


STOP = {
    "en", "et", "de", "des", "du", "le", "la", "les", "a", "au", "aux",
    "un", "une", "dans", "sur", "pour", "par", "avec", "ce", "cette", "ces",
    "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils",
    "est", "es", "sont", "as", "ai", "ont",
    "qui", "que", "ou", "si", "ne", "pas",
    "non", "oui", "bien", "tout", "tres", "plus", "moins",
    "alors", "donc", "mais", "car",
    "ca", "tas", "tes", "tas", "cest", "tres", "y", "n", "t", "l", "m", "s",
}


def first_match(target: str, words: list, start_idx: int) -> Optional[int]:
    """Find first word in words[start_idx:] matching `target` (or 4-char shared prefix)."""
    n = normalize(target)
    if not n:
        return None
    for j in range(start_idx, len(words)):
        ww = normalize(words[j]["word"])
        if not ww:
            continue
        if ww == n:
            return j
        if len(n) >= 4 and len(ww) >= 3 and ww.startswith(n[:4]):
            return j
        if len(ww) >= 4 and len(n) >= 3 and n.startswith(ww[:4]):
            return j
    return None


def best_match(line: str, words: list, start_idx: int) -> Optional[int]:
    """Try distinctive (non-stop, len>=4) words first, then any line word."""
    line_words = line.split()
    distinctive = [w for w in line_words if normalize(w) not in STOP and len(normalize(w)) >= 4]
    for cw in distinctive:
        idx = first_match(cw, words, start_idx)
        if idx is not None:
            return idx
    for cw in line_words:
        idx = first_match(cw, words, start_idx)
        if idx is not None:
            return idx
    return None


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: build-captions.py <user-text> <transcript> <out>", file=sys.stderr)
        return 1
    text_path, transcript_path, out_path = sys.argv[1:]

    with open(text_path) as f:
        user_lines = [l.strip() for l in f if l.strip()]
    trans = json.load(open(transcript_path))
    words = [w for w in trans["words"] if w.get("start") is not None]

    captions = []
    cursor = 0
    for line in user_lines:
        idx = best_match(line, words, cursor)
        if idx is None:
            last_start = captions[-1]["start"] if captions else 0.0
            print(f"WARN: no match for '{line[:40]}' — fallback {last_start + 1.5:.2f}s", file=sys.stderr)
            captions.append({"text": line, "start": round(last_start + 1.5, 2), "end": None})
            continue
        captions.append({"text": line, "start": round(words[idx]["start"], 2), "end": None})
        cursor = idx + 1

    # Fill ends: each ends 0.05s before next start; last ends at last word end
    for i, cap in enumerate(captions):
        if i + 1 < len(captions):
            next_start = captions[i + 1]["start"]
            cap["end"] = round(max(cap["start"] + 0.4, next_start - 0.05), 2)
        else:
            cap["end"] = round(words[-1]["end"], 2)

    with open(out_path, "w") as f:
        json.dump(captions, f, ensure_ascii=False, indent=2)
    print(f"✓ {out_path} ({len(captions)} captions)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
