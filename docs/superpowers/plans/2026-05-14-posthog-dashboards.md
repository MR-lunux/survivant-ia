# PostHog Dashboards + Audit + Weekly Ritual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire 3 dashboards PostHog (Daily Pulse, Funnel Newsletter, Funnel Scanner) + un slash command `/posthog-weekly` qui génère des rapports markdown narratifs versionnés dans le repo. Première utilisation : un audit 30j en Phase B, puis un weekly 7j en Phase C.

**Architecture:** Hybride. Les dashboards visuels vivent dans PostHog (eu.posthog.com/project/169545) via MCP. Le slash command et les rapports générés vivent dans le repo (`docs/posthog-reports/`). Pas d'automation, pas de cron — tout est déclenché manuellement.

**Tech Stack:** PostHog MCP (Bearer auth via Personal API Key déjà wiré), HogQL pour les queries ad hoc, Native funnel insights pour les funnels, Markdown pour la sortie, Git pour le versioning.

**Référence spec :** `docs/superpowers/specs/2026-05-14-posthog-dashboards-design.md`

---

## File structure

**Files à créer dans le repo :**
- `.claude/commands/posthog-weekly.md` — prompt + recette du slash command
- `docs/posthog-reports/README.md` — comment lire les rapports, quand les regénérer
- `docs/posthog-reports/2026-05-14-audit-initial.md` — audit Phase B (généré)
- `docs/posthog-reports/YYYY-MM-DD-weekly.md` — premier weekly Phase C (généré)

**Artefacts PostHog créés via MCP (vivent dans eu.posthog.com, pas dans le repo) :**
- Dashboard `[Survivant-IA] Daily Pulse` + 6 insights
- Dashboard `[Survivant-IA] Funnel Newsletter` + 5 insights
- Dashboard `[Survivant-IA] Funnel Scanner` + 5 insights

**Files non modifiés** : aucun code applicatif ne change. Pas de modif `app/`, `server/`, `nuxt.config.ts`, etc.

---

## Phase 0 — Prérequis MCP

### Task 0: Vérifier que le MCP PostHog répond

**Files:** aucun

- [ ] **Step 1: Lister les tools MCP PostHog disponibles**

Vérifier qu'au moins ces tools sont accessibles (les noms peuvent légèrement varier selon la version du plugin) :
- Un tool de query HogQL (ex: `query-run`, `hogql-query`)
- Un tool de création d'insight (ex: `insight-create`)
- Un tool de création de dashboard (ex: `dashboard-create`)
- Un tool d'ajout d'insight à dashboard (ex: `dashboard-add-insight`)
- Des tools de discovery (ex: `event-definition-list`, `projects-list`)

Si les tools n'apparaissent pas, **Mathieu a oublié de redémarrer Claude Code** — lui demander de relancer.

- [ ] **Step 2: Sanity check via `projects-list` (ou équivalent)**

Confirmer que le project `169545` (Survivant-IA EU) apparaît bien et qu'on est authentifié. Si l'appel échoue avec un 401/403, la clé `phx_...` n'est pas correctement injectée — debug la config MCP.

- [ ] **Step 3: Test query simple**

Run une query HogQL minimale pour vérifier que les events arrivent :
```sql
SELECT event, count() AS n
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
GROUP BY event
ORDER BY n DESC
LIMIT 20
```

Attendu : une liste qui contient au moins `$pageview`, et idéalement quelques events custom (`newsletter_*`, `scanner_*`).

Si tout est vide ou que ça crash, stopper le plan et debug.

---

## Phase A — Dashboards PostHog

### Task A1: Audit de couverture d'events sur 30 jours

**Files:** aucun (recherche)

- [ ] **Step 1: Lister tous les events distincts captés sur 30j**

```sql
SELECT event, count() AS occurrences, min(timestamp) AS first_seen, max(timestamp) AS last_seen
FROM events
WHERE timestamp >= now() - INTERVAL 30 DAY
GROUP BY event
ORDER BY occurrences DESC
```

- [ ] **Step 2: Comparer avec les events instrumentés dans le code**

Liste de référence (depuis le grep effectué pendant le brainstorming) :

Newsletter : `newsletter_form_focused`, `newsletter_signup_submitted`, `newsletter_signup_succeeded`, `newsletter_signup_failed`, `newsletter_subscribed_from_generateur_ecriture`

Scanner : `scanner_gate_email_focused`, `scanner_gate_submitted`, `scanner_gate_succeeded`, `scanner_gate_failed`

Métiers : `metier_article_clicked`, `metier_similar_clicked`, `metiers_request_form_focused`, `metiers_request_submitted`, `metiers_request_succeeded`, `metiers_request_failed`

Articles/rapports : `report_read_progress`, `article_internal_link_clicked`, `article_source_clicked`

Kits : `kit_cta_clicked_from_article`, `kit_quiz_started`, `kit_quiz_question_answered`, `kit_quiz_completed`, `kit_quiz_restarted`, `kit_quiz_abandoned`

Générateur écriture : `generateur_ecriture_example_chip_clicked`, `*_voice_started/completed/failed`, `*_parse_error`, `*_first_parse`, `*_parse_success`, `*_rate_limit_hit`, `*_row_edited_before_add`, `*_row_added`, `*_excel_downloaded`, `*_feedback_submitted`

Home : `home_cta_clicked`

Chantier : `chantier_intent_submitted`, `chantier_intent_succeeded`, `chantier_intent_failed`

FAQ : custom names from `FaqAccordion` (variable)

- [ ] **Step 3: Flagger les events instrumentés-mais-jamais-firés**

Pour chaque event de la liste de référence absent de la sortie de Step 1 sur les 30 derniers jours, noter dans un brouillon mental (à inclure dans l'audit Phase B section "État de l'instrumentation"). Ne pas créer de fichier ici, juste retenir.

- [ ] **Step 4: Identifier les props clés disponibles**

Pour les events critiques (`newsletter_signup_*`, `scanner_gate_*`), lister leurs props via :

```sql
SELECT properties FROM events
WHERE event = 'newsletter_signup_succeeded'
  AND timestamp >= now() - INTERVAL 30 DAY
LIMIT 5
```

Attendu : confirmer que `source` (sur newsletter), `job_slug` ou similaire (sur scanner), et `reason` (sur les *_failed) sont bien là. Si une prop manque, l'utiliser nécessitera un fallback dans le funnel.

### Task A2: Dashboard 1 — Daily Pulse

**Files:** aucun (création via MCP)

- [ ] **Step 1: Créer les 6 insights**

Pour chaque insight ci-dessous, utiliser `insight-create` (ou équivalent) avec les paramètres listés. Tous les insights ont la période par défaut **last_7_days** avec comparaison vs **previous 7 days**.

**Insight 1.1 — Visiteurs uniques (7j vs 7j-1)**
- Type : Trends (number)
- Source : `$pageview`
- Math : `dau` (unique users) ou `unique_session`
- Comparison : enabled, previous period
- Nom : `[SIA] Visiteurs uniques`

**Insight 1.2 — Newsletter signups réussis**
- Type : Trends (number)
- Source : `newsletter_signup_succeeded`
- Math : `total` count
- Comparison : previous period
- Nom : `[SIA] Newsletter signups`

**Insight 1.3 — Scanners complétés**
- Type : Trends (number)
- Source : `scanner_gate_succeeded`
- Math : `total` count
- Comparison : previous period
- Nom : `[SIA] Scanners complétés`

**Insight 1.4 — Taux de conversion global**
- Type : HogQL insight (parce que le ratio entre 2 metrics n'est pas natif sur les Trends)
- Query :
```sql
WITH
  signups AS (SELECT count() AS n FROM events WHERE event = 'newsletter_signup_succeeded' AND timestamp >= now() - INTERVAL 7 DAY),
  visitors AS (SELECT count(DISTINCT person_id) AS n FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 7 DAY)
SELECT round(signups.n / visitors.n * 100, 2) AS conversion_pct
FROM signups, visitors
```
- Nom : `[SIA] Conversion globale (%)`

**Insight 1.5 — Top 5 pages par pageviews**
- Type : Trends (table)
- Source : `$pageview`
- Math : `total`
- Breakdown : `$pathname`
- Limit : 5
- Nom : `[SIA] Top 5 pages`

**Insight 1.6 — Top sources**
- Type : Trends (table)
- Source : `$pageview`
- Math : `dau`
- Breakdown : `$initial_referring_domain`
- Limit : 10
- Nom : `[SIA] Top sources`

- [ ] **Step 2: Créer le dashboard**

Appel `dashboard-create` (ou équivalent) :
- Nom : `[Survivant-IA] Daily Pulse`
- Description : `Vue exécutive 7j vs 7j-1. La page à ouvrir en premier le matin.`

- [ ] **Step 3: Ajouter les 6 insights au dashboard**

Appel `dashboard-add-insight` × 6 (ou équivalent batch). Ordre des tuiles :
- Ligne 1 : 1.1, 1.2, 1.3 (les 3 KPI counts)
- Ligne 2 : 1.4 (conversion, pleine largeur ou half)
- Ligne 3 : 1.5, 1.6 (les 2 tables)

- [ ] **Step 4: Récupérer l'URL et l'afficher au user**

Format à afficher : `https://eu.posthog.com/project/169545/dashboard/<id>`

### Task A3: Dashboard 2 — Funnel Newsletter

**Files:** aucun

- [ ] **Step 1: Créer les 5 insights** (période par défaut = 30 derniers jours)

**Insight 2.1 — Funnel principal newsletter**
- Type : Funnel
- Étapes (ordered) :
  1. Event = `$pageview` avec filtre `$pathname matches /^\/(rapports|outils|frequence|$)/` (pages qui contiennent le NewsletterForm)
  2. Event = `newsletter_form_focused`
  3. Event = `newsletter_signup_submitted`
  4. Event = `newsletter_signup_succeeded`
- Conversion window : 1 day
- Nom : `[SIA] Funnel newsletter (principal)`

**Insight 2.2 — Funnel newsletter breakdown par source**
- Type : Funnel
- Mêmes étapes que 2.1, mais à partir de l'étape 2
- Breakdown : `event_property` `source` (sur l'event `newsletter_form_focused`)
- Nom : `[SIA] Funnel newsletter par source`

**Insight 2.3 — Signups par jour**
- Type : Trends (line)
- Source : `newsletter_signup_succeeded`
- Math : `total`
- Interval : day
- Nom : `[SIA] Signups par jour (30j)`

**Insight 2.4 — Échecs par raison**
- Type : Trends (bar)
- Source : `newsletter_signup_failed`
- Math : `total`
- Breakdown : `event_property` `reason`
- Nom : `[SIA] Échecs newsletter par raison`

**Insight 2.5 — Pages qui montrent le form sans convertir**
- Type : HogQL insight (parce qu'il faut un ratio par page)
- Query :
```sql
WITH
  focuses AS (
    SELECT properties.$pathname AS path, count() AS n_focus
    FROM events
    WHERE event = 'newsletter_form_focused'
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY path
  ),
  successes AS (
    SELECT properties.$pathname AS path, count() AS n_success
    FROM events
    WHERE event = 'newsletter_signup_succeeded'
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY path
  )
SELECT
  focuses.path,
  focuses.n_focus,
  coalesce(successes.n_success, 0) AS n_success,
  round(coalesce(successes.n_success, 0) / focuses.n_focus * 100, 1) AS conv_rate_pct
FROM focuses
LEFT JOIN successes ON focuses.path = successes.path
WHERE focuses.n_focus >= 5
ORDER BY conv_rate_pct ASC, focuses.n_focus DESC
LIMIT 10
```
- Nom : `[SIA] Pages : focus form sans conversion`

- [ ] **Step 2: Créer le dashboard et y ajouter les insights**

- Nom : `[Survivant-IA] Funnel Newsletter`
- Description : `Funnel complet newsletter 30j vs 30j-1. La conversion #1.`
- Ajouter insights 2.1 à 2.5 dans cet ordre.

- [ ] **Step 3: Afficher l'URL au user**

### Task A4: Dashboard 3 — Funnel Scanner

**Files:** aucun

- [ ] **Step 1: Créer les 5 insights** (période 30j)

**Insight 3.1 — Funnel scanner principal**
- Type : Funnel
- Étapes :
  1. Event = `$pageview` avec filtre `$pathname matches /^\/scanner\//`
  2. Event = `scanner_gate_email_focused`
  3. Event = `scanner_gate_submitted`
  4. Event = `scanner_gate_succeeded`
- Conversion window : 1 day
- Nom : `[SIA] Funnel scanner (principal)`

**Insight 3.2 — Funnel scanner → newsletter (KPI stratégique)**
- Type : Funnel
- Étapes :
  1. Event = `scanner_gate_succeeded`
  2. Event = `newsletter_signup_succeeded`
- Conversion window : 7 days
- Nom : `[SIA] Funnel scanner → newsletter (7j)`

**Insight 3.3 — Drop-off par métier**
- Type : HogQL insight (pour avoir taux d'achèvement par job_slug)
- Query :
```sql
WITH
  views AS (
    SELECT extract(properties.$pathname, '^/scanner/(.+)$') AS slug, count(DISTINCT person_id) AS n_visit
    FROM events
    WHERE event = '$pageview' AND properties.$pathname LIKE '/scanner/%'
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY slug
  ),
  successes AS (
    SELECT properties.job_slug AS slug, count(DISTINCT person_id) AS n_success
    FROM events
    WHERE event = 'scanner_gate_succeeded'
      AND timestamp >= now() - INTERVAL 30 DAY
    GROUP BY slug
  )
SELECT
  views.slug,
  views.n_visit,
  coalesce(successes.n_success, 0) AS n_success,
  round(coalesce(successes.n_success, 0) / views.n_visit * 100, 1) AS conv_rate_pct
FROM views
LEFT JOIN successes ON views.slug = successes.slug
WHERE views.n_visit >= 5
ORDER BY conv_rate_pct ASC
```
- Nom : `[SIA] Scanner : taux d'achèvement par métier`
- Note : Si `properties.job_slug` n'existe pas (voir Task A1 step 4), utiliser `extract(properties.$pathname, '^/scanner/(.+)$')` aussi pour `successes`.

**Insight 3.4 — Scanners complétés par jour**
- Type : Trends (line)
- Source : `scanner_gate_succeeded`
- Math : `total`
- Interval : day
- Nom : `[SIA] Scanners complétés par jour (30j)`

**Insight 3.5 — Échecs scanner par raison**
- Type : Trends (bar)
- Source : `scanner_gate_failed`
- Math : `total`
- Breakdown : `event_property` `reason`
- Nom : `[SIA] Échecs scanner par raison`

- [ ] **Step 2: Créer le dashboard et y ajouter les insights**

- Nom : `[Survivant-IA] Funnel Scanner`
- Description : `Funnel scanner 30j + funnel stratégique scanner→newsletter.`
- Ajouter insights 3.1 à 3.5 dans cet ordre.

- [ ] **Step 3: Afficher l'URL au user**

### Checkpoint A: Validation visuelle par Mathieu

Affiche les 3 URLs et demande à Mathieu d'ouvrir chacune :
- Daily Pulse : `https://eu.posthog.com/project/169545/dashboard/<id1>`
- Funnel Newsletter : `https://eu.posthog.com/project/169545/dashboard/<id2>`
- Funnel Scanner : `https://eu.posthog.com/project/169545/dashboard/<id3>`

Demander explicitement :
> "Ouvre les 3 dashboards. Pour chacun : (1) les chiffres sont-ils non-nuls ? (2) les funnels affichent-ils bien plusieurs étapes ? (3) y a-t-il un insight qui crash ou qui affiche 'n/a' ?"

Si problème : ne pas passer à la Phase B, retourner aux Tasks A2-A4 pour fix.

---

## Phase B — Slash command + Audit initial

### Task B1: Squelette du slash command

**Files:**
- Create: `.claude/commands/posthog-weekly.md`

- [ ] **Step 1: Écrire le fichier**

Contenu :

````markdown
# /posthog-weekly

Génère un rapport hebdomadaire PostHog avec KPI, interprétation et 3 actions recommandées. Écrit le résultat dans `docs/posthog-reports/YYYY-MM-DD-weekly.md`.

## Usage

- `/posthog-weekly` → fenêtre par défaut : 7 derniers jours vs 7 jours précédents
- `/posthog-weekly 14d` → 14 derniers jours vs 14 d'avant
- `/posthog-weekly 30d` → 30 derniers jours vs 30 d'avant (utile pour audits mensuels)

## Procédure (à exécuter par Claude)

1. **Parser la période** (default `7d`) → calculer `current_from`, `current_to`, `prev_from`, `prev_to` en absolu.

2. **Fetcher les KPI via PostHog MCP** (project 169545, EU). Run les queries ci-dessous une fois pour la période courante, une fois pour la période précédente.

   Query — Visiteurs uniques :
   ```sql
   SELECT count(DISTINCT person_id) AS n
   FROM events
   WHERE event = '$pageview'
     AND timestamp >= toDateTime('{{from}}')
     AND timestamp < toDateTime('{{to}}')
   ```

   Query — Newsletter signups :
   ```sql
   SELECT count() AS n
   FROM events
   WHERE event = 'newsletter_signup_succeeded'
     AND timestamp >= toDateTime('{{from}}')
     AND timestamp < toDateTime('{{to}}')
   ```

   Query — Scanners complétés :
   ```sql
   SELECT count() AS n
   FROM events
   WHERE event = 'scanner_gate_succeeded'
     AND timestamp >= toDateTime('{{from}}')
     AND timestamp < toDateTime('{{to}}')
   ```

   Query — Top 5 pages avec conv newsletter par page :
   ```sql
   WITH
     views AS (SELECT properties.$pathname AS p, count() AS n_views FROM events WHERE event = '$pageview' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p),
     focuses AS (SELECT properties.$pathname AS p, count() AS n_focus FROM events WHERE event = 'newsletter_form_focused' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p),
     successes AS (SELECT properties.$pathname AS p, count() AS n_success FROM events WHERE event = 'newsletter_signup_succeeded' AND timestamp >= toDateTime('{{from}}') AND timestamp < toDateTime('{{to}}') GROUP BY p)
   SELECT views.p, views.n_views, coalesce(focuses.n_focus, 0) AS n_focus, coalesce(successes.n_success, 0) AS n_success
   FROM views
   LEFT JOIN focuses ON views.p = focuses.p
   LEFT JOIN successes ON views.p = successes.p
   ORDER BY views.n_views DESC
   LIMIT 5
   ```

   Query — Échecs récents :
   ```sql
   SELECT event, properties.reason AS reason, count() AS n
   FROM events
   WHERE event LIKE '%_failed'
     AND timestamp >= toDateTime('{{from}}')
     AND timestamp < toDateTime('{{to}}')
   GROUP BY event, reason
   ORDER BY n DESC
   ```

   Query — Funnel newsletter (taux par étape) :
   Utiliser l'API insight funnel via MCP plutôt que HogQL.

   Query — Funnel scanner :
   Utiliser l'API insight funnel via MCP.

   Query — Funnel scanner → newsletter (7j) :
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

3. **Calculer les deltas** pour chaque KPI : `(current - prev) / prev * 100`. Si `prev == 0`, marquer comme "nouveau" et ne pas calculer le pourcentage.

4. **Détecter les anomalies** :
   - Tout delta > 20 % (positif ou négatif) → flag
   - Nouveau pattern d'échec qui n'existait pas dans `prev` → flag
   - Page qui chute de > 30 % en pageviews → flag
   - Si total events sur la fenêtre < 50 → flag "données minces, interprétation limitée"

5. **Rédiger le markdown** au format suivant. Respect strict des règles de style projet (cf. spec) :
   - Pas d'emojis
   - "je ne suis pas" pas "je suis pas"
   - Concepts coined en minuscules
   - Pas d'invention factuelle : si une query échoue, écrire "n/a" et continuer

   Format :
   ```markdown
   # Rapport hebdo — Semaine du {{date1}} au {{date2}}

   > **TL;DR** : <1 phrase qui résume la semaine en faits>

   ## KPI essentiels
   | KPI | Cette semaine | Semaine -1 | Δ |
   | --- | --- | --- | --- |
   | Visiteurs uniques | X | Y | ±N % |
   | Newsletter signups | X | Y | ±N % |
   | Scanners complétés | X | Y | ±N % |
   | Conv. globale | X.X % | Y.Y % | ±N pts |
   | Scanner → newsletter (7j) | X.X % | Y.Y % | ±N pts |

   ## Ce qui marche
   - <bullet, chiffres concrets seulement>

   ## Ce qui coince
   - <bullet, chiffres + diagnostic probable>

   ## 3 actions à tester cette semaine
   1. **<Action concrète>** — *Hypothèse :* ... *Cible KPI :* ... *Comment mesurer :* ...
   2. ...
   3. ...

   ## Annexe — drill-downs
   ### Top 5 pages
   <table>
   ### Échecs récents
   <table>
   ### Funnel newsletter (étapes)
   <% par étape>
   ### Funnel scanner (étapes)
   <% par étape>
   ```

6. **Écrire le fichier** dans `docs/posthog-reports/YYYY-MM-DD-weekly.md` (YYYY-MM-DD = today).

7. **Afficher au user** dans le chat : TL;DR + table KPI + 3 actions. Demander : "Je commit ?"

8. **Si oui**, commit avec message : `docs(posthog): rapport hebdo <date1>-<date2>`.
````

- [ ] **Step 2: Sanity check du fichier**

Lire `.claude/commands/posthog-weekly.md` après écriture. Vérifier : pas d'emojis, encoding propre, blocs SQL fermés correctement.

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/posthog-weekly.md
git commit -m "feat(claude): add /posthog-weekly slash command

Generates a weekly PostHog report with KPIs, interpretation, and 3
recommended actions. Output committed to docs/posthog-reports/."
```

### Task B2: README du dossier posthog-reports

**Files:**
- Create: `docs/posthog-reports/README.md`

- [ ] **Step 1: Écrire le README**

Contenu :
```markdown
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
3. **Ce qui marche / Ce qui coince** — interprétation des chiffres
4. **3 actions** — concrètes, testables cette semaine, avec hypothèse et KPI cible

## Dashboards PostHog

Trois dashboards visuels complètent les rapports :
- Daily Pulse : vue 7j exécutive
- Funnel Newsletter : 30j, conversion #1
- Funnel Scanner : 30j, aimant secondaire + funnel scanner→newsletter

URLs : `https://eu.posthog.com/project/169545/dashboards`
```

- [ ] **Step 2: Commit**

```bash
git add docs/posthog-reports/README.md
git commit -m "docs(posthog): add readme for posthog-reports/"
```

### Task B3: Audit initial (Phase B livrable)

**Files:**
- Create: `docs/posthog-reports/2026-05-14-audit-initial.md` (généré)

- [ ] **Step 1: Exécuter le slash command en mode audit**

Faire comme si on lançait `/posthog-weekly 30d`, mais :
- Filename de sortie = `2026-05-14-audit-initial.md`
- Ajouter une section **"État de l'instrumentation"** entre "Annexe" et la fin

Section additionnelle à inclure :

```markdown
## État de l'instrumentation (audit one-shot)

### Events captés sur 30 jours
| Event | Occurrences | Premier seen | Dernier seen |
| --- | --- | --- | --- |
| ... | ... | ... | ... |

### Events instrumentés mais jamais firés
- `<event_name>` — instrumenté dans `<file:line>` mais 0 occurrence sur 30j. Cause probable : <hypothèse>.

### Recommandations instrumentation
1. ...
2. ...
```

Réutiliser le résultat de Task A1 step 3 pour cette section.

- [ ] **Step 2: Run les queries**

Exécuter les queries du slash command avec période = 30 jours. Récupérer les résultats.

- [ ] **Step 3: Rédiger le markdown**

Au format du slash command + la section "État de l'instrumentation". Respecter les règles de style.

**Important** : cet audit ayant une période plus longue (30j) qu'un weekly (7j), les "3 actions" peuvent être plus stratégiques que tactiques — viser le mois, pas la semaine.

- [ ] **Step 4: Écrire le fichier**

Path : `docs/posthog-reports/2026-05-14-audit-initial.md`.

- [ ] **Step 5: Afficher au user**

Montrer dans le chat : TL;DR + KPI essentiels + 3 actions stratégiques. Demander : "Tu veux que je commit, ou tu veux d'abord lire et commenter ?"

### Checkpoint B: Mathieu lit l'audit

Attendre le retour de Mathieu sur l'audit avant Phase C. Si Mathieu trouve que :
- Une action recommandée est hors-sujet → noter, ajuster la section "guidelines" dans le slash command
- Une métrique manque → l'ajouter dans `.claude/commands/posthog-weekly.md`
- Le format ne va pas → réécrire la section format

Si modifs : revenir à Task B1 step 1, ajuster, re-commit.

- [ ] **Step 6: Commit (si Mathieu valide)**

```bash
git add docs/posthog-reports/2026-05-14-audit-initial.md
git commit -m "docs(posthog): audit initial 30j (phase B)"
```

---

## Phase C — First weekly run + validation

### Task C1: Premier weekly réel

**Files:**
- Create: `docs/posthog-reports/YYYY-MM-DD-weekly.md` (généré, date = today)

- [ ] **Step 1: Run `/posthog-weekly`**

Lancer le slash command sans argument (défaut 7j vs 7j-1).

- [ ] **Step 2: Vérifier la sortie**

Checklist :
- [ ] TL;DR présent et factuel (pas vide)
- [ ] Tous les KPI ont une valeur ou explicitement "n/a"
- [ ] Les deltas sont calculés ou marqués "nouveau" si prev=0
- [ ] 3 actions présentes (ou < 3 avec justification "semaine calme")
- [ ] Annexe drill-downs présente
- [ ] Pas d'emojis
- [ ] Filename = `YYYY-MM-DD-weekly.md` avec today's date

- [ ] **Step 3: Si le format dérape → fix le slash command**

Si la sortie n'est pas conforme : revenir à `.claude/commands/posthog-weekly.md`, ajuster l'instruction qui a causé le souci, supprimer le fichier de rapport généré, relancer.

- [ ] **Step 4: Commit (si OK)**

```bash
git add docs/posthog-reports/YYYY-MM-DD-weekly.md
git commit -m "docs(posthog): rapport hebdo <date1>-<date2> (phase C, premier run)"
```

### Checkpoint C: Validation finale

- [ ] Mathieu confirme que le format weekly lui convient
- [ ] Mathieu confirme qu'il sait comment relancer (`/posthog-weekly` chaque lundi)
- [ ] Les 3 dashboards PostHog sont accessibles et affichent des données

Si tout est validé → fin du plan. Mettre à jour les tasks Claude correspondantes en `completed`.

---

## Risques connus

1. **PostHog MCP tools peuvent avoir des noms différents** de ce qui est listé ici. Au moment de Task 0, ajuster les références "insight-create", "dashboard-create" aux vrais noms.

2. **Le `properties.job_slug` peut ne pas exister** sur les events scanner. Vérifier dans Task A1 step 4. Si absent, utiliser `extract(properties.$pathname, '^/scanner/(.+)$')` partout.

3. **`properties.source` sur newsletter events** : vérifier qu'elle est bien fournie par le code. Si certains events n'ont pas la prop, le breakdown par source sera incomplet.

4. **HogQL `BETWEEN x AND x + INTERVAL`** sur les self-joins peut être lent sur de gros volumes. Sur 30j de données Survivant-IA, ça devrait passer largement (faible volume actuel).

5. **Plugin PostHog mis à jour** : la clé Personal API Key est dans le cache du plugin. Si le plugin se met à jour, le bloc `headers` peut être écrasé. Cf. `memory/reference_posthog.md` pour réappliquer.
