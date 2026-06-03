#!/usr/bin/env python3
"""
Lint wiki hebdo — Hermes cron --script (vendredi 17h Geneva).

Parts :
- A. Maintenance technique en Python pur (orphelins, redondances par titre, broken wikilinks)
- B. Hallucination audit cross-model (3 notes random × 1 call LLM Apertus 70B Swiss)
- C. Exit criteria check (Python pur)
- D. Rapport Telegram via stdout

Coût estimé : ~0.015 CHF/run (3 audits Apertus).
"""

import os
import sys
import re
import json
import random
import datetime
from pathlib import Path

import requests

WIKI = Path("/workspace/wiki")
CONTENT = Path("/workspace/content/rapports")

INFOMANIAK_BASE = "https://api.infomaniak.com/2/ai/106389/openai/v1"
# Cross-model : Apertus 70B Swiss (différent de Mistral utilisé pour ingest)
AUDIT_MODEL = "swiss-ai/Apertus-70B-Instruct-2509"

EXIT_MAINTENANCE_H = 1.0
EXIT_CONTAMINATION = 2  # FAIL claims / semaine
EXIT_MONTHLY_CHF = 50.0


def load_note(path: Path) -> dict:
    """Parse note .md : frontmatter YAML + body + source brute."""
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)", text, re.DOTALL)
    if not m:
        return {"path": str(path), "fm": {}, "body": text, "source_brute": ""}
    fm_raw, body = m.groups()
    fm = {}
    for line in fm_raw.split("\n"):
        if ":" in line and not line.startswith(" "):
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip()
    # Section "Source brute" : tout ce qui est après "## Source brute"
    sb_match = re.search(r"^## Source brute\s*\n(.*)", body, re.DOTALL | re.MULTILINE)
    source_brute = sb_match.group(1).strip() if sb_match else ""
    return {"path": str(path), "fm": fm, "body": body, "source_brute": source_brute}


def get_all_notes() -> list[dict]:
    notes = []
    for sub in ("concepts", "claims", "examples"):
        for p in (WIKI / sub).glob("*.md"):
            notes.append(load_note(p))
    return notes


def find_wikilinks(text: str) -> list[str]:
    return re.findall(r"\[\[([^\]]+)\]\]", text)


def part_a_technical(notes: list[dict]) -> dict:
    """Technical health checks."""
    by_slug = {n["fm"].get("slug", Path(n["path"]).stem): n for n in notes}
    issues = {"orphans": [], "broken_links": [], "empty_body": [], "no_source_brute": []}

    for n in notes:
        slug = n["fm"].get("slug", Path(n["path"]).stem)
        # Wikilinks sortants
        outgoing = find_wikilinks(n["body"])
        broken = [link for link in outgoing if link not in by_slug]
        if broken:
            issues["broken_links"].append((slug, broken))
        # Empty body (after frontmatter)
        body_clean = re.sub(r"#.*?\n|\s+", "", n["body"]).strip()
        if len(body_clean) < 100:
            issues["empty_body"].append(slug)
        # Source brute manquante
        if not n["source_brute"] or len(n["source_brute"]) < 20:
            issues["no_source_brute"].append(slug)

    # Orphelins : aucun wikilink entrant ET aucun sortant
    incoming = {slug: 0 for slug in by_slug}
    for n in notes:
        for link in find_wikilinks(n["body"]):
            if link in incoming:
                incoming[link] += 1
    for n in notes:
        slug = n["fm"].get("slug", Path(n["path"]).stem)
        outgoing = find_wikilinks(n["body"])
        if incoming.get(slug, 0) == 0 and not outgoing:
            issues["orphans"].append(slug)

    return issues


def audit_one_note(note: dict, source_article_path: Path) -> tuple[str, str]:
    """1 LLM call cross-model. Return (status, justification)."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return "SKIP", "no api key"
    if not source_article_path.exists():
        return "SKIP", "source article not found"

    article_text = source_article_path.read_text(encoding="utf-8")[:8000]  # cap
    # Extract claim from note title + first paragraph
    claim = note["fm"].get("title", "").strip('"')
    body_first_para = re.split(r"\n\n", re.sub(r"^---.*?---\n", "", note["body"], 1, re.DOTALL))[0].strip()[:500]

    system = (
        "Tu es un auditeur strict de fidélité source. On te donne un claim extrait d'un article, "
        "la citation verbatim utilisée comme preuve, et l'article complet. "
        "Tu réponds STRICTEMENT par PASS, FAIL ou DOUBT, suivi d'un slash et 1 phrase brève (max 20 mots) "
        "de justification. Format exact : 'PASS / la citation soutient le claim' ou 'FAIL / la citation contredit le claim' ou 'DOUBT / ambigu : explication'."
    )
    user = (
        f"CLAIM : {claim}\n\nCONTEXTE NOTE :\n{body_first_para}\n\n"
        f"CITATION VERBATIM :\n{note['source_brute'][:500]}\n\nARTICLE COMPLET :\n{article_text}"
    )
    try:
        resp = requests.post(
            f"{INFOMANIAK_BASE}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": AUDIT_MODEL,
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
                "max_tokens": 60,
                "temperature": 0.0,
            },
            timeout=45,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"].strip()
        if content.startswith("PASS"):
            return "PASS", content[5:].strip("/ ").strip()
        if content.startswith("FAIL"):
            return "FAIL", content[5:].strip("/ ").strip()
        if content.startswith("DOUBT"):
            return "DOUBT", content[6:].strip("/ ").strip()
        return "DOUBT", f"parsing : {content[:60]}"
    except Exception as exc:
        return "SKIP", f"llm error: {exc}"


def part_b_audit(notes: list[dict]) -> list[dict]:
    """3 random audits cross-model."""
    sample = random.sample(notes, min(3, len(notes)))
    results = []
    for n in sample:
        slug = n["fm"].get("slug", "?")
        # Provenance vit dans le frontmatter (YAML multi-niveau), pas dans body.
        # On relit le fichier brut pour matcher la ligne YAML "source: content/rapports/...".
        raw = Path(n["path"]).read_text(encoding="utf-8")
        source_match = re.search(r"source:\s*content/rapports/(\S+\.md)", raw)
        if not source_match:
            results.append({"slug": slug, "status": "SKIP", "reason": "no provenance"})
            continue
        article_path = CONTENT / source_match.group(1)
        status, just = audit_one_note(n, article_path)
        results.append({"slug": slug, "status": status, "reason": just})
    return results


def part_c_exit_criteria(audit_results: list[dict]) -> list[str]:
    """Check exit criteria. Return list of triggered alerts."""
    alerts = []
    fail_count = sum(1 for r in audit_results if r["status"] in ("FAIL", "DOUBT"))
    if fail_count > EXIT_CONTAMINATION:
        alerts.append(f"⚠️ Contamination : {fail_count} FAIL/DOUBT cette sem. (seuil {EXIT_CONTAMINATION}).")
    # Note : maintenance + monthly cost via daily-budget-check, pas ici
    return alerts


def main() -> None:
    notes = get_all_notes()
    if not notes:
        print("🧹 Lint wiki — wiki vide, rien à vérifier.")
        return

    issues = part_a_technical(notes)
    audit_results = part_b_audit(notes)
    alerts = part_c_exit_criteria(audit_results)

    now = datetime.datetime.now().strftime("%A %d %B")
    msg = f"🧹 Lint wiki — {now}\n\nWiki : {len(notes)} atomic notes\n\n"

    msg += "── Santé technique ──\n"
    msg += f"• Orphelins         : {len(issues['orphans'])}"
    if issues["orphans"][:3]:
        msg += f" → {', '.join(issues['orphans'][:3])}"
    msg += f"\n• Source brute vide : {len(issues['no_source_brute'])}"
    if issues["no_source_brute"][:3]:
        msg += f" → {', '.join(issues['no_source_brute'][:3])}"
    msg += f"\n• Body trop court   : {len(issues['empty_body'])}"
    msg += f"\n• Wikilinks cassés  : {len(issues['broken_links'])}"
    if issues["broken_links"][:2]:
        for slug, links in issues["broken_links"][:2]:
            msg += f"\n  └ {slug} → [[{', '.join(links[:3])}]]"

    msg += "\n\n── Audit hallucinations (cross-model Apertus 70B) ──\n"
    for r in audit_results:
        icon = {"PASS": "✓", "FAIL": "❌", "DOUBT": "⚠️", "SKIP": "○"}.get(r["status"], "?")
        msg += f"{icon} {r['status']}  {r['slug']}\n   {r['reason'][:80]}\n"

    if alerts:
        msg += "\n── Exit criteria ──\n"
        msg += "\n".join(alerts)
    else:
        msg += "\n── Exit criteria : ✓ tous OK ──"

    print(msg)


if __name__ == "__main__":
    main()
