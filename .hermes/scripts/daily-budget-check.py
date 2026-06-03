#!/usr/bin/env python3
"""
Daily budget check — Hermes cron --no-agent --script.

Pattern : script-only cron (cf. https://hermes-agent.nousresearch.com/docs/guides/cron-script-only).
Aucun appel LLM. 0 token, 0 coût.

Lit `hermes insights` pour extraire les tokens consommés aujourd'hui + sur 30 jours,
estime le coût CHF (Infomaniak AI pricing), compare aux seuils du SKILL.md racine
(soft 1 CHF/jour, hard 3 CHF/jour, alert 30 CHF/mois, exit 50 CHF/mois),
formatte un message Telegram qui sera livré par Hermes via stdout.
"""

import subprocess
import re
import datetime

# === Pricing Infomaniak AI (estimation au 2026-06-03) ===
# Ajuster selon ta facture réelle. Source : https://infomaniak.com/products/ai
INFOMANIAK_CHF_PER_M_TOKENS = 0.5  # estimation conservative pour Mistral Small 4

# === Seuils SKILL.md racine ===
DAILY_SOFT_CHF = 1.0
DAILY_HARD_CHF = 3.0
MONTHLY_ALERT_CHF = 30.0
MONTHLY_EXIT_CHF = 50.0

def run_insights(days: int) -> str:
    """Execute hermes insights and return raw text output."""
    try:
        result = subprocess.run(
            ["hermes", "insights", "--days", str(days)],
            capture_output=True, text=True, timeout=30
        )
        return result.stdout
    except Exception as exc:
        return f"ERROR running insights: {exc}"

def parse_total_tokens(insights_output: str) -> int:
    """
    Parse les tokens totaux depuis 'Most tokens X,XXX,XXX' OU somme des sessions.
    Heuristique : on prend 'Most tokens' comme upper bound de la session la plus chère.
    Pour précision, parser toutes les sessions via 'sessions' table.
    """
    m = re.search(r"Most tokens\s+([\d,]+)\s+tokens", insights_output)
    if m:
        return int(m.group(1).replace(",", ""))
    # fallback: regex sur "X total tokens" si présent
    m2 = re.search(r"([\d,]+)\s+total tokens", insights_output, re.IGNORECASE)
    if m2:
        return int(m2.group(1).replace(",", ""))
    return 0

def parse_session_count(insights_output: str) -> int:
    m = re.search(r"Distinct skills:\s+\d+\s+Loads:\s+(\d+)", insights_output)
    return int(m.group(1)) if m else 0

def estimate_cost(tokens: int) -> float:
    return (tokens / 1_000_000) * INFOMANIAK_CHF_PER_M_TOKENS

def status_emoji(month_cost: float, day_cost: float) -> tuple[str, str]:
    if month_cost > MONTHLY_EXIT_CHF:
        return "🚨", "EXIT CRITERIA TOUCHÉ"
    if month_cost > MONTHLY_ALERT_CHF:
        return "⚠️", "Seuil alerte mois"
    if day_cost > DAILY_HARD_CHF:
        return "⚠️", "Seuil alerte jour"
    if day_cost > DAILY_SOFT_CHF:
        return "📊", "Au-dessus soft daily"
    return "✓", "OK"

def main() -> None:
    today_raw = run_insights(1)
    month_raw = run_insights(30)

    today_tokens = parse_total_tokens(today_raw)
    today_cost = estimate_cost(today_tokens)
    today_sessions = parse_session_count(today_raw)

    month_tokens = parse_total_tokens(month_raw)
    month_cost = estimate_cost(month_tokens)

    emoji, status = status_emoji(month_cost, today_cost)
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    msg = f"""{emoji} Budget Hermes — {now}

Aujourd'hui : {today_tokens:,} tokens ≈ {today_cost:.3f} CHF
({today_sessions} session(s))

Mois courant : {month_tokens:,} tokens ≈ {month_cost:.2f} CHF
Seuils       : alerte {MONTHLY_ALERT_CHF}, exit {MONTHLY_EXIT_CHF}

Status : {status}"""

    if month_cost > MONTHLY_EXIT_CHF:
        msg += "\n\n🚨 Conformément à hard rule #7 du SKILL.md racine, Hermes devrait s'arrêter."
        msg += "\nReco : investiguer Web UI Hermes via SSH tunnel."

    print(msg)

if __name__ == "__main__":
    main()
