# PostHog reports

Rapports d'analyse PostHog générés par `/posthog-weekly`. Spec : `docs/superpowers/specs/2026-05-14-posthog-dashboards-design.md`.

## Fichiers

- `YYYY-MM-DD-weekly.md` — rapport hebdo standard (généré par `/posthog-weekly`)
- `YYYY-MM-DD-audit-*.md` — audits ad hoc (audit initial, audit mensuel, etc.)

## Quand re-générer un rapport hebdo

Idéalement chaque lundi matin. Si tu sautes une semaine, run `/posthog-weekly 14d` pour avoir une fenêtre plus large qui capture la période manquée.

## Comment lire

1. **TL;DR** — résume la semaine en une phrase
2. **KPI essentiels** — chiffres + variation vs semaine précédente
3. **Ce qui marche / Ce qui coince** — interprétation des chiffres, factuelle
4. **3 actions** — concrètes, testables cette semaine, avec hypothèse et KPI cible

## Dashboards PostHog associés

Quatre dashboards visuels complètent les rapports :

- **Pilotage Survivant — Hebdo** (Daily Pulse) : https://eu.posthog.com/project/169545/dashboard/652843
- **Funnel Newsletter** : https://eu.posthog.com/project/169545/dashboard/680914
- **Funnel Scanner** : https://eu.posthog.com/project/169545/dashboard/680918
- **Générateur écriture** : https://eu.posthog.com/project/169545/dashboard/681019
