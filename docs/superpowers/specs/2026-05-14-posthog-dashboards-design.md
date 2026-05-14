# PostHog Dashboards + Audit + Rituel d'analyse hebdo — Design

**Date** : 2026-05-14
**Status** : approved (brainstorm validé, prêt pour plan d'implémentation)
**Author** : Mathieu + Claude

## Contexte

PostHog est intégré côté code depuis fin avril (voir `docs/superpowers/specs/2026-04-30-posthog-integration-design.md`). ~35+ events sont instrumentés : newsletter, scanner, articles/rapports, kits/outils, home, chantier. **Côté PostHog UI, rien n'est encore construit** — pas de dashboards, pas de rapports, pas de rituel d'analyse.

L'objectif de ce design : transformer PostHog d'un outil "qui collecte sans rien rendre" à un système qui (1) montre l'essentiel quand on ouvre l'app, et (2) pousse régulièrement un résumé interprété avec des actions concrètes.

**Coordonnées PostHog** : région EU, project ID `169545`, accessible via MCP authentifié par Personal API Key (voir mémoire `reference_posthog.md`).

## Décisions de brainstorming

1. **Plan global** : phase A (dashboards) → phase B (audit) → phase C (rituel hebdo) — séquentiel
2. **Dashboards** : trois — Exécutif Daily Pulse, Funnel Newsletter, Funnel Scanner (les trois plus stratégiques au regard du business model : newsletter = conversion #1, scanner = aimant secondaire)
3. **Rituel hebdo** : cadence hebdomadaire / livraison markdown commit dans le repo / profondeur "KPI + interprétation + 1-3 actions recommandées"
4. **Audit initial** : périmètre 30 derniers jours
5. **Trigger du rituel** : slash command manuel (`/posthog-weekly`) — pas de cron, pas d'email pour l'instant
6. **Architecture** : hybride PostHog (dashboards visuels) + repo (rapports markdown narratifs)

## Architecture

### Surfaces

| Surface | Où ça vit | Quoi |
| --- | --- | --- |
| Dashboards visuels | PostHog (eu.posthog.com/project/169545) | 3 dashboards créés via MCP |
| Slash command | `.claude/commands/posthog-weekly.md` | Recette pour Claude quand on lance `/posthog-weekly` |
| Rapports markdown | `docs/posthog-reports/*.md` | Output narratif versionné dans git |

### Data flow d'un `/posthog-weekly`

```
User: /posthog-weekly
  → Claude lit la commande, calcule la fenêtre (7j vs 7j prev par défaut)
  → Claude appelle PostHog MCP (~8-10 queries HogQL)
  → Claude détecte les anomalies (delta >20 %, nouveaux patterns d'échec)
  → Claude génère le markdown narratif
  → Claude écrit docs/posthog-reports/YYYY-MM-DD-weekly.md
  → Claude affiche TL;DR + actions en chat, propose le commit
```

## Spec — Dashboards

### Dashboard 1 — [Survivant-IA] Daily Pulse

**Vue par défaut** : 7 derniers jours, comparé aux 7 jours précédents.

**Tuiles** :
1. **Visiteurs uniques** — `$pageview` distinct par `$device_id` (count + delta %)
2. **Newsletter signups réussis** — `newsletter_signup_succeeded` (count + delta %)
3. **Scanners complétés** — `scanner_gate_succeeded` (count + delta %)
4. **Taux de conversion global** — `newsletter_signup_succeeded` / visiteurs uniques (% + delta)
5. **Top 5 pages** par `$pageview` — table avec colonnes : path, pageviews, taux de conversion newsletter individuel
6. **Top sources** — `$initial_referring_domain` ou referrer breakdown

### Dashboard 2 — [Survivant-IA] Funnel Newsletter

**Vue par défaut** : 30 derniers jours, comparé aux 30 jours précédents.

**Insights** :
1. **Funnel principal** — étapes : `$pageview` sur une page avec NewsletterForm → `newsletter_form_focused` → `newsletter_signup_submitted` → `newsletter_signup_succeeded`. Taux de chute à chaque étape.
2. **Funnel breakdown par source** — même funnel découpé par la prop `source` (`home`, `article`, `scanner`, `outil`, etc.) — montre où la conversion se passe vraiment.
3. **Signups par jour** — `newsletter_signup_succeeded` en trend journalier.
4. **Échecs par raison** — `newsletter_signup_failed` × `reason` (table ou bar chart) — détecte les bugs silencieux (rate limit, API down, validation).
5. **Top 10 pages** qui produisent des `newsletter_form_focused` mais peu de `newsletter_signup_succeeded` — pages qui montrent le formulaire mais ne convertissent pas.

### Dashboard 3 — [Survivant-IA] Funnel Scanner

**Vue par défaut** : 30 derniers jours, comparé aux 30 jours précédents.

**Insights** :
1. **Funnel principal** — `$pageview` sur `/scanner/*` → `scanner_gate_email_focused` → `scanner_gate_submitted` → `scanner_gate_succeeded`.
2. **Funnel scanner → newsletter** (KPI stratégique) — `scanner_gate_succeeded` puis `newsletter_signup_succeeded` dans les 7 jours suivants (même `$device_id`). Le scanner est un aimant pour la newsletter ; il faut mesurer s'il joue ce rôle.
3. **Drop-off par métier** — taux d'achèvement par `job_slug` — quels métiers convertissent / lesquels font peur ou sont mal compris.
4. **Trend scanners complétés/jour**.
5. **Échecs scanner par raison** — `scanner_gate_failed` × `reason`.

## Spec — Slash command `/posthog-weekly`

### Fichier

`.claude/commands/posthog-weekly.md` — slash command Claude Code natif. Contient le prompt complet qui guide Claude pour générer le rapport.

### Inputs

- Aucun par défaut → fenêtre 7j vs 7j-1
- Argument optionnel : `/posthog-weekly <period>` où `<period>` est `7d`, `14d`, `30d`, etc. Pour les audits / rétrospectives plus longues.

### Comportement

1. **Calculer la fenêtre** : `from` = today - period, `to` = today. `prev_from` = from - period, `prev_to` = from.
2. **Fetcher les KPIs** via PostHog MCP queries (~8-10 queries HogQL) :
   - Visiteurs uniques
   - Newsletter signups réussis
   - Scanners complétés
   - Taux de conversion global
   - Top 5 pages + leur conversion individuelle
   - Funnel newsletter complet
   - Funnel scanner complet
   - Échecs récents (`*_failed` events groupés par raison)
   - Nouveaux events / events qui ont disparu (signal de régression d'instrumentation)
3. **Calculer les deltas** semaine vs semaine-1, en % et absolu.
4. **Détecter les anomalies** :
   - Delta > 20 % sur un KPI principal → flag
   - Nouveau pattern d'échec qui n'existait pas la semaine précédente → flag
   - Page qui chute de >30 % en pageviews → flag
   - Données trop minces (<50 events sur la fenêtre) → flag "interprétation limitée"
5. **Générer le markdown** au format ci-dessous.
6. **Écrire le fichier** `docs/posthog-reports/YYYY-MM-DD-weekly.md`.
7. **Afficher en chat** : TL;DR + KPI table + 3 actions, et proposer le commit.

### Format de sortie

```markdown
# Rapport hebdo — Semaine du <date1> au <date2>

> **TL;DR** : <1 phrase qui résume la semaine>

## KPI essentiels
| KPI | Cette semaine | Semaine -1 | Δ |
| --- | --- | --- | --- |
| Visiteurs uniques | 423 | 380 | +11 % |
| Newsletter signups | 12 | 18 | -33 % |
| Scanners complétés | 4 | 3 | +33 % |
| Conv. globale | 2.8 % | 4.7 % | -40 % |

## Ce qui marche
- <bullet avec chiffres concrets>
- <bullet avec chiffres concrets>

## Ce qui coince
- <bullet avec chiffres + diagnostic probable>

## 3 actions à tester cette semaine
1. **<Action concrète>** — *Hypothèse :* ... *Cible KPI :* ... *Comment mesurer :* ...
2. ...
3. ...

## Annexe — drill-downs
<funnels détaillés, top pages, événements d'échec>
```

### Garde-fous

- **Pas d'invention factuelle** : si un chiffre n'est pas dans PostHog, on ne le sort pas. Si une query MCP échoue, on remplace par `n/a` et on continue. (Cf. mémoire `feedback_pas_invention_factuelle.md`.)
- **Données minces** : si <50 events sur la fenêtre, le rapport est marqué "données trop minces" et les conclusions sont conditionnées.
- **Pas d'emojis** dans les fichiers générés (DA V2 Editorial Dark, cf. mémoire `feedback_no_emojis_da.md`).
- **Français propre** : "je ne suis pas" et non "je suis pas", concepts coined en minuscules (cf. mémoires `feedback_french_negation.md`, `feedback_casse_minuscules_concepts.md`).

## Phase B — Audit initial

L'audit initial **réutilise les mêmes queries HogQL** que `/posthog-weekly`, mais avec :
- Période = 30 derniers jours (au lieu de 7)
- Filename de sortie = `docs/posthog-reports/2026-05-14-audit-initial.md` (au lieu de `*-weekly.md`)
- **Une section additionnelle** "État de l'instrumentation" : liste des events captés sur 30j, volumétrie de chacun, et flag si un event instrumenté dans le code n'a *jamais* fired (signal de bug ou de path mort)

Côté implémentation : pour cette première fois on **n'ajoute pas de flag dans le slash command**. Claude run l'audit manuellement en utilisant le même prompt que le slash command + l'extension "État de l'instrumentation". Si on en refait régulièrement, on extraira un slash command `/posthog-audit` séparé à ce moment-là.

## Plan d'exécution

| Phase | Tâche | Estimation |
| --- | --- | --- |
| 0 | Vérifier que le MCP PostHog répond après redémarrage Claude Code | 2 min |
| A | Sanity check 30j d'events via MCP (event coverage) | 10 min |
| A | Créer dashboard 1 (Daily Pulse) via MCP | 10 min |
| A | Créer dashboard 2 (Funnel Newsletter) via MCP | 10 min |
| A | Créer dashboard 3 (Funnel Scanner) via MCP | 10 min |
| A | Mathieu valide visuellement les 3 dashboards | — |
| B | Écrire `.claude/commands/posthog-weekly.md` (squelette + queries) | 30 min |
| B | Run `/posthog-weekly 30d` → produit l'audit initial | 15 min |
| B | Mathieu lit l'audit, commente | — |
| C | Ajuster la commande si le format de l'audit n'allait pas | 10-20 min |
| C | Run `/posthog-weekly` (7j) pour valider le format hebdo | 10 min |
| C | Si OK, commit du tout | 5 min |

**Total estimé** : ~1h30-2h de travail Claude, étalé sur 3 phases avec validations utilisateur entre chacune.

## Open questions / décisions à reporter à plus tard

- Automatiser le rituel hebdo (cron, schedule remote, email) — pour quand le format aura prouvé son utilité.
- Dashboards additionnels (Contenu, Outils, Acquisition SEO) — phase 2, après que les 3 essentiels aient fait leurs preuves.
- PostHog Subscriptions natives (envoi par email depuis PostHog) — option C alternative si le rituel markdown s'avère trop lourd.
- Alerts PostHog sur anomalies (slack ou email) — option future plutôt que weekly rapport.
