#!/usr/bin/env python3
"""
Pull brief matinal — Hermes cron --script (avec mini LLM call).

Pattern hybride :
- Collecte 9 sources RSS en parallèle (stdlib + requests, 0 LLM)
- Filtre + score + rank (Python pur, 0 LLM)
- 1 SEUL appel LLM minimal (Mistral Small 4) pour générer les 3 angles Survivant-IA
- Output stdout → Hermes deliver telegram

Coût estimé : ~0.001 CHF/run.
"""

import os
import sys
import re
import datetime
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape

import requests

# === Sources RSS (9 sources A — presse tech anglo) ===
SOURCES = [
    ("MIT Technology Review", "https://www.technologyreview.com/feed/", 1.0),
    ("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", 0.9),
    ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index/", 0.9),
    ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", 0.9),
    ("FT Tech", "https://www.ft.com/technology?format=rss", 1.0),
    ("The Guardian Tech", "https://www.theguardian.com/technology/rss", 0.8),
    ("404 Media", "https://www.404media.co/rss/", 0.9),
    ("Hacker News", "https://hnrss.org/frontpage", 0.7),
    ("ArXiv cs.AI", "http://export.arxiv.org/rss/cs.AI", 0.6),
]

# === Mots-clés pertinents Survivant-IA (cluster 2 action prioritaire) ===
KEYWORDS_STRONG = {
    # IA core
    "ai", "llm", "gpt", "claude", "anthropic", "openai", "mistral", "gemini",
    "copilot", "prompt", "agent", "transformer", "rag", "embedding",
    # Travail + IA
    "worker", "employee", "job", "career", "profession", "skill",
    "automation", "productivity", "augmented",
    # Audience pro
    "developer", "engineer", "knowledge worker", "consultant",
}

KEYWORDS_NOISE = {
    # Pas pertinent pour Survivant-IA
    "deal", "sale", "discount", "watch this", "buy now", "sponsored",
    "vs apple", "vs samsung", "iphone", "android phone", "gaming",
}

INFOMANIAK_BASE = "https://api.infomaniak.com/2/ai/106389/openai/v1"
MODEL = "mistralai/Mistral-Small-4-119B-2603"


def fetch_rss(source_name: str, url: str, weight: float, timeout: int = 10) -> list[dict]:
    """Fetch et parse un feed RSS. Retourne liste d'items normalisés."""
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "HermesSurvivantIA/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        items = []
        # Compatible RSS 2.0 (<item>) et Atom (<entry>)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        # RSS 2.0
        for item in root.findall(".//item")[:25]:
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            desc = (item.findtext("description") or "").strip()
            pubdate = item.findtext("pubDate") or ""
            items.append({"title": unescape(title), "link": link, "desc": _clean_html(desc), "pubdate": pubdate, "source": source_name, "weight": weight})
        # Atom
        for entry in root.findall(".//atom:entry", ns)[:25]:
            title = (entry.findtext("atom:title", default="", namespaces=ns)).strip()
            link_el = entry.find("atom:link", ns)
            link = link_el.attrib.get("href", "") if link_el is not None else ""
            summary = (entry.findtext("atom:summary", default="", namespaces=ns)).strip()
            updated = entry.findtext("atom:updated", default="", namespaces=ns)
            items.append({"title": unescape(title), "link": link, "desc": _clean_html(summary), "pubdate": updated, "source": source_name, "weight": weight})
        return items
    except Exception as exc:
        sys.stderr.write(f"[WARN] {source_name} failed: {exc}\n")
        return []


def _clean_html(s: str) -> str:
    """Strip HTML tags + collapse whitespace."""
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s[:300]  # cap description


def score_item(item: dict) -> float:
    """Heuristic relevance score 0-10."""
    text = (item["title"] + " " + item["desc"]).lower()
    score = 0.0
    # Source weight
    score += item["weight"] * 2
    # Strong keywords (poids 1.5 each, max 4 matches counted)
    matches = sum(1 for kw in KEYWORDS_STRONG if kw in text)
    score += min(matches, 4) * 1.5
    # Noise penalty
    if any(kw in text for kw in KEYWORDS_NOISE):
        score -= 3
    # Bonus titres courts et clairs
    if 30 <= len(item["title"]) <= 100:
        score += 0.5
    return max(0.0, score)


def call_llm_for_angles(top3: list[dict]) -> list[str]:
    """1 SEUL call LLM avec contexte minimal."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return ["[ERROR: OPENAI_API_KEY not set]"] * len(top3)
    items_text = "\n\n".join(
        f"[{i + 1}] {it['source']} — {it['title']}\n{it['desc'][:200]}"
        for i, it in enumerate(top3)
    )
    system = (
        "Tu écris des angles éditoriaux pour Survivant-IA, le repère des professionnels qui veulent "
        "rester pertinents face à l'IA. Voix : lucide, sèche, autodérision, tu jamais vous, cluster 2 "
        "action (piloter/leviers/se former), pas cluster peur. Mot banni : 'méthode'. Pas d'emoji."
    )
    user = (
        f"Pour chacun de ces {len(top3)} sujets, propose un angle Survivant-IA d'une seule phrase "
        f"(20-40 mots), prêt à être un hook de post LinkedIn. Tague le pilier entre crochets : "
        f"[outil-concret], [soft-skill] ou [décryptage]. Format strict :\n"
        f"[1] <tag> <angle>\n[2] <tag> <angle>\n[3] <tag> <angle>\n\nSujets :\n\n{items_text}"
    )
    try:
        resp = requests.post(
            f"{INFOMANIAK_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "max_tokens": 400,
                "temperature": 0.7,
            },
            timeout=60,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        lines = [line.strip() for line in content.split("\n") if re.match(r"^\[\d\]", line)]
        return lines[: len(top3)] if lines else ["[parsing failed]"]
    except Exception as exc:
        sys.stderr.write(f"[LLM ERROR] {exc}\n")
        return [f"[LLM call failed: {exc}]"]


def is_sunday() -> bool:
    return datetime.datetime.now().weekday() == 6  # Monday=0, Sunday=6


def main() -> None:
    # Dimanche silence (cf. SKILL.md pull-brief)
    if is_sunday():
        return

    # Collecte parallèle
    all_items: list[dict] = []
    with ThreadPoolExecutor(max_workers=9) as ex:
        futures = {ex.submit(fetch_rss, name, url, weight): name for name, url, weight in SOURCES}
        for fut in as_completed(futures, timeout=60):
            try:
                all_items.extend(fut.result())
            except Exception as exc:
                sys.stderr.write(f"[WARN] {futures[fut]} aborted: {exc}\n")

    if not all_items:
        print("📡 Brief matinal — pas de contenu RSS récupéré ce matin. Sources indisponibles ?")
        return

    # Dédup par URL
    seen = set()
    deduped = []
    for it in all_items:
        if it["link"] not in seen:
            seen.add(it["link"])
            deduped.append(it)

    # Score + rank
    for it in deduped:
        it["score"] = score_item(it)
    ranked = sorted(deduped, key=lambda x: x["score"], reverse=True)
    top3 = ranked[:3]

    if not top3 or top3[0]["score"] < 3:
        print("📡 Brief matinal — aucun sujet pertinent ce matin (top score < 3).")
        return

    # 1 call LLM pour les angles
    angles = call_llm_for_angles(top3)

    # Format Telegram
    now = datetime.datetime.now().strftime("%A %d %B")
    msg = f"📡 FRÉQUENCE — Brief du {now}\n\n{len(top3)} signaux qui valent un coup d'œil :\n\n"
    for i, (it, angle) in enumerate(zip(top3, angles), 1):
        msg += f"[{i}] {it['title']}\n"
        msg += f"    Source : {it['source']} · Score {it['score']:.1f}\n"
        msg += f"    Angle : {angle if angle.startswith('[') else angle}\n"
        msg += f"    🔗 {it['link']}\n\n"

    msg += f"📊 Volume scanné : {len(all_items)} items → {len(deduped)} dédup → top {len(top3)}"
    print(msg)


if __name__ == "__main__":
    main()
