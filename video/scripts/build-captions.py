#!/usr/bin/env python3
"""
Build word-level burned-in captions for FaceCam silent-mode reading.

Two-step approach:
1. Line-level anchor: find each user line's start time in the Whisper transcript
   via distinctive-word search (skipping stop-words).
2. Word distribution: within each line, distribute words evenly across the line's
   time range, then chunk into single-line phrases (max MAX_CHARS).

Outputs captions JSON with word-level start/end for karaoke-style highlighting.

Usage: build-captions.py <user-text> <transcript> <out>
"""

import sys
import json
import unicodedata
from typing import Optional

MAX_CHARS = 30  # ≈ single line at 42px on 940px max width
WORD_PAD_END = 0.05

STOP = {
    "en", "et", "de", "des", "du", "le", "la", "les", "a", "au", "aux",
    "un", "une", "dans", "sur", "pour", "par", "avec", "ce", "cette", "ces",
    "mon", "ton", "son", "ma", "ta", "sa", "mes", "tes", "ses",
    "je", "tu", "il", "elle", "on", "nous", "vous", "ils",
    "est", "es", "sont", "as", "ai", "ont",
    "qui", "que", "ou", "si", "ne", "pas",
    "non", "oui", "bien", "tout", "tres", "plus", "moins",
    "alors", "donc", "mais", "car",
    "ca", "cest", "y", "n", "t", "l", "m", "s",
}


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower().strip(".,?!:;'\"-")


def first_match(target: str, words: list, start_idx: int) -> Optional[int]:
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

    # Step 1: line-level start times via distinctive-word matching
    line_starts = []  # list of start_time per line (parallel to user_lines)
    cursor = 0
    for line in user_lines:
        idx = best_match(line, words, cursor)
        if idx is None:
            last = line_starts[-1] if line_starts else 0.0
            line_starts.append(round(last + 1.5, 2))
            print(f"WARN: no match for '{line[:40]}'", file=sys.stderr)
        else:
            line_starts.append(round(words[idx]["start"], 2))
            cursor = idx + 1

    # Compute line end times: next line start - 0.05s OR last Whisper word end
    line_ends = []
    for i in range(len(line_starts)):
        if i + 1 < len(line_starts):
            end = max(line_starts[i] + 0.4, line_starts[i + 1] - WORD_PAD_END)
        else:
            end = round(words[-1]["end"], 2)
        line_ends.append(round(end, 2))

    # Step 2: for each line, distribute words evenly across the line's time range,
    #         then chunk into single-line phrases of MAX_CHARS.
    captions = []
    for li, line in enumerate(user_lines):
        line_words = line.split()
        n = len(line_words)
        ls, le = line_starts[li], line_ends[li]
        line_dur = le - ls

        # Per-word start times: linearly distributed
        per_word = [round(ls + (i / n) * line_dur, 2) for i in range(n)]

        # Chunk into single-line groups
        chunks = []
        current = []
        current_chars = 0
        for i, w in enumerate(line_words):
            word_chars = len(w) + (1 if current else 0)
            if current_chars + word_chars > MAX_CHARS and current:
                chunks.append(current)
                current = []
                current_chars = 0
            current.append((w, per_word[i]))
            current_chars += word_chars
        if current:
            chunks.append(current)

        # Build captions
        for j, chunk in enumerate(chunks):
            ps = chunk[0][1]
            # Phrase end = next chunk's first word start, or line_end for last chunk
            if j + 1 < len(chunks):
                pe = round(chunks[j + 1][0][1] - WORD_PAD_END, 2)
            else:
                pe = le
            words_out = []
            for k, (w, ws) in enumerate(chunk):
                we = chunk[k + 1][1] if k + 1 < len(chunk) else pe
                words_out.append({"text": w, "start": ws, "end": round(we, 2)})
            captions.append({"start": ps, "end": pe, "words": words_out})

    with open(out_path, "w") as f:
        json.dump(captions, f, ensure_ascii=False, indent=2)
    total_words = sum(len(c["words"]) for c in captions)
    print(f"✓ {out_path} ({len(captions)} captions, {total_words} words)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
