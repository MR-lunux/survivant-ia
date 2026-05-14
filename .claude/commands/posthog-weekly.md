# /posthog-weekly

Génère un rapport hebdomadaire PostHog avec KPI, interprétation et 3 actions recommandées. Écrit le résultat dans `docs/posthog-reports/YYYY-MM-DD-weekly.md`.

## Usage

- `/posthog-weekly` → fenêtre par défaut : 7 derniers jours vs 7 jours précédents
- `/posthog-weekly 14d` → 14 derniers jours vs 14 d'avant
- `/posthog-weekly 30d` → 30 derniers jours vs 30 d'avant (utile pour audits mensuels)

## Contexte projet (à lire avant d'exécuter)

- Project PostHog : `169545` sur `eu.posthog.com` (région EU)
- MCP wired via Bearer auth. Tool : `mcp__plugin_posthog_posthog__exec` avec `command: "call execute-sql {...}"`
- 4 dashboards de référence (consultables en parallèle si besoin de drill-down) :
  - Pilotage Survivant — Hebdo : https://eu.posthog.com/project/169545/dashboard/652843
  - Funnel Newsletter : https://eu.posthog.com/project/169545/dashboard/680914
  - Funnel Scanner : https://eu.posthog.com/project/169545/dashboard/680918
  - Générateur écriture : https://eu.posthog.com/project/169545/dashboard/681019
- Métiers de référence : newsletter "La Fréquence" = conversion #1, scanner = aimant secondaire qui doit funnel vers newsletter, générateur écriture = outil "valeur livrée"
- Quirks d'instrumentation actuels (au 2026-05-14) :
  - `properties.source` est `None` sur les events newsletter → utiliser `properties.$pathname` pour breakdown par page
  - `properties.job_slug` fonctionne sur scanner events (valeurs : `comptable`, `administrateur-sys`, etc.)
  - Scanner pathnames : la gate fire sur `/scanner` (avec ou sans `/scanner/<slug>` en URL) ; les URLs `/scanner/<slug>` existent mais sont rares

## Procédure (à exécuter par Claude)

### 1. Parser la période

Default `7d`. Calculer `current_from`, `current_to` (= maintenant), `prev_from`, `prev_to` en absolu (timestamps ISO).

### 2. Fetcher les KPI via PostHog MCP

Run chaque query ci-dessous **deux fois** : période courante et période précédente. Pour chaque query, remplacer `{{from}}` et `{{to}}` par les timestamps absolus.

**Q1 — Visiteurs uniques**
```sql
SELECT count(DISTINCT person_id) AS n
FROM events
WHERE event = '$pageview'
  AND timestamp >= toDateTime('{{from}}')
  AND timestamp < toDateTime('{{to}}')
```

**Q2 — Newsletter signups réussis**
```sql
SELECT count() AS n
FROM events
WHERE event = 'newsletter_signup_succeeded'
  AND timestamp >= toDateTime('{{from}}')
  AND timestamp < toDateTime('{{to}}')
```

**Q3 — Scanners complétés**
```sql
SELECT count() AS n
FROM events
WHERE event = 'scanner_gate_succeeded'
  AND timestamp >= toDateTime('{{from}}')
  AND timestamp < toDateTime('{{to}}')
```

**Q4 — Funnel scanner → newsletter (7j après scan)**
```sql
SELECT
  count(DISTINCT s.person_id) AS scanner_succ,
  count(DISTINCT n.person_id) AS scanner_then_newsletter
FROM events s
LEFT JOIN events n
  ON s.person_id = n.person_id
  AND n.event = 'newsletter_signup_succeeded'
  AND n.timestamp BETWEEN s.timestamp AND s.timestamp + INTERVAL 7 DAY
WHERE s.event = 'scanner_gate_succeeded'
  AND s.timestamp >= toDateTime('{{from}}')
  AND s.timestamp < toDateTime('{{to}}')
```

**Q5 — Générateur écriture : adoption + santé**
```sql
SELECT
  count(DISTINCT person_id) AS users_uniques,
  countIf(event = 'generateur_ecriture_first_parse') AS premiers_parses,
  countIf(event = 'generateur_ecriture_parse_success') AS parsings_reussis,
  countIf(event = 'generateur_ecriture_parse_error') AS parsings_echecs,
  countIf(event = 'generateur_ecriture_voice_started') AS dictees_lancees,
  countIf(event = 'generateur_ecriture_voice_completed') AS dictees_completes,
  countIf(event = 'generateur_ecriture_row_added') AS lignes_ajoutees,
  countIf(event = 'generateur_ecriture_excel_downloaded') AS excel_telecharges
FROM events
WHERE event LIKE 'generateur_ecriture_%'
  AND timestamp >= toDateTime('{{from}}')
  AND timestamp < toDateTime('{{to}}')
```

**Q6 — Top pages avec activité newsletter**
```sql
WITH
  views AS (SELECT properties.$pathname AS p, count() AS n_views FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p),
  focuses AS (SELECT properties.$pathname AS p, count() AS n_focus FROM events WHERE event = 'newsletter_form_focused' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p),
  successes AS (SELECT properties.$pathname AS p, count() AS n_success FROM events WHERE event = 'newsletter_signup_succeeded' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p)
SELECT views.p AS path, views.n_views, coalesce(focuses.n_focus, 0) AS n_focus, coalesce(successes.n_success, 0) AS n_success
FROM views
LEFT JOIN focuses ON views.p = focuses.p
LEFT JOIN successes ON views.p = successes.p
ORDER BY views.n_views DESC
LIMIT 10
```

**Q7 — Échecs récents (tous events `*_failed` ou `*_error`)**
```sql
SELECT event, properties.reason AS reason, count() AS n
FROM events
WHERE (event LIKE '%_failed' OR event LIKE '%_error')
  AND timestamp >= toDateTime('{{from}}')
  AND timestamp < toDateTime('{{to}}')
GROUP BY event, reason
ORDER BY n DESC
LIMIT 20
```

### 3. Calculer les deltas

Pour chaque KPI : `(current - prev) / prev * 100`. Si `prev == 0`, marquer comme "nouveau" (pas de pourcentage).

Pour les ratios (conversion globale, taux succès parsing), calculer la valeur en points (`current_pct - prev_pct`).

### 4. Détecter les anomalies (à flagger dans "Ce qui coince")

- Delta > 20 % (positif ou négatif) sur un KPI count → flag
- Nouveau pattern d'échec absent en période précédente → flag
- Page qui chute de > 30 % en pageviews → flag
- Taux de succès parsing générateur < 70 % → flag (cible : > 80 %)
- Taux de succès dictée vocale < 50 % → flag
- Si total events sur la fenêtre < 50 → flag "données minces, interprétation limitée"

### 5. Rédiger le markdown

**Règles de style strictes** (cf. mémoire projet) :
- Pas d'emojis dans le rendu final
- "je ne suis pas", pas "je suis pas" (full negation)
- Concepts coined en minuscules (sauf début de phrase / titres standard)
- Pas d'invention factuelle : si une query échoue ou retourne null, écrire "n/a" et continuer

Format :

```markdown
# Rapport hebdo — Semaine du {{date1}} au {{date2}}

> **TL;DR** : <1 phrase, faits durs uniquement>

## KPI essentiels

| KPI | Cette semaine | Semaine -1 | Δ |
| --- | --- | --- | --- |
| Visiteurs uniques | X | Y | ±N % |
| Newsletter signups | X | Y | ±N % |
| Scanners complétés | X | Y | ±N % |
| Conversion globale (signups/visiteurs) | X.X % | Y.Y % | ±N pts |
| Scanner → newsletter (7j) | X.X % | Y.Y % | ±N pts |
| Générateur : users uniques | X | Y | ±N % |
| Générateur : taux succès parsing | X.X % | Y.Y % | ±N pts |

## Ce qui marche
- <bullet, chiffres concrets, factuel>

## Ce qui coince
- <bullet, chiffres + diagnostic probable, factuel>

## 3 actions à tester cette semaine
1. **<Action concrète>** — *Hypothèse :* ... *Cible KPI :* ... *Comment mesurer :* ...
2. ...
3. ...

## Annexe — drill-downs

### Top pages cette semaine
<table : path / pageviews / focus newsletter / signups>

### Funnel scanner → newsletter
<scanner_succ : N, scanner_then_newsletter : M, taux : %>

### Générateur écriture
<users / first_parse / parsings réussis vs échecs / dictées lancées vs complétées / lignes ajoutées / excel téléchargés>

### Échecs récents
<table : event / reason / count>
```

### 6. Écrire le fichier

Path : `docs/posthog-reports/YYYY-MM-DD-weekly.md` (YYYY-MM-DD = aujourd'hui).

### 7. Afficher au user

Dans le chat : TL;DR + table KPI + 3 actions. Demander : "Je commit ?"

### 8. Commit si oui

```bash
git add docs/posthog-reports/YYYY-MM-DD-weekly.md
git commit -m "docs(posthog): rapport hebdo <date1>-<date2>"
```
