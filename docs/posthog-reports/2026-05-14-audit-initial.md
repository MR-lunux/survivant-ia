# Audit initial — fenêtre 30 jours (2026-04-14 → 2026-05-14)

> **TL;DR** : Premier audit après ~14 jours d'instrumentation effective (capture démarrée 2026-04-30). 397 visiteurs uniques, 3 inscriptions newsletter, 6 scanners complétés, 0 conversion scanner → newsletter. Le NewsletterForm ne convertit que depuis `/` ; les autres pages à fort trafic (scanner, générateur, rapports) ne firent aucun focus.

## KPI essentiels

| KPI | 30 derniers jours | Période -30 à -60j | Δ |
| --- | --- | --- | --- |
| Visiteurs uniques | 397 | n/a (avant instru) | n/a |
| Newsletter signups | 3 | n/a | n/a |
| Scanners complétés | 6 | n/a | n/a |
| Conversion globale (signups/visiteurs) | 0.76 % | n/a | n/a |
| Scanner → newsletter (30j) | 0 % (0 / 6) | n/a | n/a |
| Générateur : users uniques | 17 | n/a | n/a |
| Générateur : taux succès parsing | 50.0 % (10/20) | n/a | n/a |
| Générateur : taux succès dictée | 50.0 % (5/10) | n/a | n/a |

## Ce qui marche

- La page d'accueil `/` capte du trafic réel (488 pageviews, 41 % du total) et c'est la seule page où le funnel newsletter aboutit (5 focus, 3 signups, conversion focus→success = 60 %).
- Le scanner a une finition technique forte : sur 6 personnes qui focusent l'email, 6 soumettent et 6 réussissent (100 % submit→success). La friction se trouve avant la gate, pas dedans.
- Le générateur écriture comptable génère du trafic dès sa sortie : 64 pageviews et 17 users uniques sur 30j, dont 9 sont allés jusqu'à ajouter une ligne au tableau et 4 jusqu'au téléchargement Excel.
- L'instrumentation côté frontend est cohérente : 51 events distincts captés, pas d'event "fantôme" avec un volume aberrant.

## Ce qui coince

- **Aucune conversion scanner → newsletter sur 30j.** 6 personnes ont passé la gate scanner, 0 se sont inscrites à la newsletter ensuite. Le scanner sert d'aimant mais ne nourrit pas la conversion #1. C'est l'écart le plus stratégique de l'audit.
- **Le NewsletterForm n'apparaît (ou ne fire l'event) que depuis `/`.** 196 pageviews sur `/scanner`, 64 sur `/outils/generateur-ecriture-comptable`, 43 sur `/metiers`, 40 sur `/outils`, 28 sur `/rapports` : zéro focus newsletter sur ces pages. À vérifier : le form est-il visuellement présent là-bas ? L'event est-il instrumenté sur ces déclinaisons ?
- **Le générateur écriture a un taux d'échec parsing de 50 %.** 10 succès, 10 erreurs. Sans la prop `reason` sur `generateur_ecriture_parse_error`, impossible de diagnostiquer : timeout LLM, format inattendu, rate limit, autre ?
- **Dictée vocale : 5 succès, 6 échecs** (les 6 ventilés en `poll_error` 3, `permission_denied` 1, `upload_failed` 1, `transcription_failed` 1). Plus d'échecs que de succès.
- **9 events instrumentés ne fire jamais sur 30j** (voir section "État de l'instrumentation"). Soit ces parcours ne se produisent pas, soit l'instru est cassée.

## 3 actions stratégiques pour le mois

1. **Auditer la présence et l'instrumentation du NewsletterForm sur les pages non-`/`.**
   - *Hypothèse :* le form est rendu sur les autres pages (rapports, outils, scanner) mais ne fire pas `newsletter_form_focused` (composant différent ou listener manquant), OU il n'est carrément pas présent. Vu la spec V2 Editorial Dark qui mentionne le form sur multiple pages, le premier scénario est plus probable.
   - *Cible KPI :* faire passer `newsletter_form_focused` de 5/30j à 20+/30j d'ici fin juin, avec au moins 3 paths distincts représentés.
   - *Comment mesurer :* relancer la query Q6 (top pages avec focus / signup) dans 14 jours et 30 jours. Le nombre de paths distincts avec n_focus ≥ 1 doit augmenter.

2. **Réécrire le post-scan : poser explicitement la newsletter comme étape suivante.**
   - *Hypothèse :* après `scanner_gate_succeeded`, l'UI montre les résultats du scan mais ne ramène pas l'utilisateur vers la newsletter. La conversion scanner → newsletter est techniquement possible mais sémantiquement absente.
   - *Cible KPI :* atteindre 25 % (1.5 / 6) sur le funnel scanner → newsletter d'ici fin juin, sur la même base de scanners.
   - *Comment mesurer :* relancer la query Q4 (funnel scanner → newsletter 7j) dans 4 semaines. Volume faible donc à pondérer, mais la direction doit être claire.

3. **Ajouter la prop `reason` à `generateur_ecriture_parse_error` côté code.**
   - *Hypothèse :* le générateur a un problème de fiabilité (50 % de taux d'échec), mais sans la raison, on ne sait pas s'il faut investir sur le prompt, le format de sortie, le throttling LLM, ou un bug applicatif.
   - *Cible KPI :* d'ici 7 jours, 100 % des `generateur_ecriture_parse_error` portent une `reason` non-nulle. À 30 jours après le fix, dresser un Pareto des raisons et viser les 2 plus fréquentes.
   - *Comment mesurer :* relancer Q7 (échecs récents) après le déploiement, vérifier `reason IS NOT NULL` sur tous les parse_error.

## Annexe — drill-downs

### Top 10 pages (pageviews + activité newsletter, 30j)

| Path | Pageviews | Newsletter focus | Newsletter success |
| --- | --- | --- | --- |
| `/` | 488 | 5 | 3 |
| `/scanner` | 196 | 0 | 0 |
| `/outils/generateur-ecriture-comptable` | 64 | 0 | 0 |
| `/metiers` | 43 | 0 | 0 |
| `/outils` | 40 | 0 | 0 |
| `/identite` | 33 | 0 | 0 |
| `/rapports` | 28 | 0 | 0 |
| `/outils/trc-01` | 19 | 0 | 0 |
| `/rapports/offloading-cognitif-quand-l-ia-pense-a-ta-place` | 16 | 0 | 0 |
| `/rapports/2026-05-07-demence-numerique-simple-valideur` | 11 | 0 | 0 |

### Funnel scanner → newsletter

- Scanner gate franchie (uniques) : 6
- Parmi eux, newsletter signup ensuite : 0
- Taux : **0 %**

### Funnel newsletter principal

| Étape | Volume |
| --- | --- |
| Pageview (toutes pages) | 1 123 |
| Newsletter form focused | 5 |
| Newsletter signup submitted | 3 |
| Newsletter signup succeeded | 3 |

### Funnel scanner principal

| Étape | Volume |
| --- | --- |
| Pageview `/scanner*` | 217 (196 + 21 sur les variantes) |
| Scanner gate email focused | 6 |
| Scanner gate submitted | 6 |
| Scanner gate succeeded | 6 |

### Générateur écriture comptable (30j)

| Metric | Valeur |
| --- | --- |
| Users uniques | 17 |
| Premier parse (essais réels) | 7 |
| Parsings réussis | 10 |
| Parsings échoués | 10 |
| Taux de succès parsing | 50.0 % |
| Dictées lancées | 10 |
| Dictées complétées | 5 |
| Dictées échouées | 6 |
| Lignes ajoutées au tableau | 9 |
| Excel téléchargés | 4 |
| Feedback soumis | 1 |

### Échecs récents (30j)

| Event | Reason | Count |
| --- | --- | --- |
| `generateur_ecriture_parse_error` | _none_ (prop manquante) | 10 |
| `generateur_ecriture_voice_failed` | `poll_error` | 3 |
| `generateur_ecriture_voice_failed` | `permission_denied` | 1 |
| `generateur_ecriture_voice_failed` | `upload_failed` | 1 |
| `generateur_ecriture_voice_failed` | `transcription_failed` | 1 |
| `chantier_intent_failed` | `server` | 1 |

## État de l'instrumentation (audit one-shot)

### Events instrumentés mais jamais firés sur 30j

| Event | Cause probable |
| --- | --- |
| `newsletter_signup_failed` | Aucun échec côté serveur en 30j (peu probable vu 3 signups) ; plus probable : le handler de fail ne fire pas l'event. À tester en provoquant une erreur. |
| `newsletter_subscribed_from_generateur_ecriture` | CTA newsletter depuis le générateur soit absent, soit l'event n'est pas câblé. |
| `scanner_gate_failed` | Idem : 6 scanners succès / 0 échec, suspect. Vérifier le code du handler d'erreur Brevo / API. |
| `metier_article_clicked` | Aucun clic sur les articles depuis une page métier en 30j. |
| `metiers_request_failed` | 3 metiers_request_succeeded vs 0 failed → idem suspicion. |
| `chantier_intent_succeeded` | 1 soumission, 1 échec, 0 succès → handler de succès silencieux. |
| `article_source_clicked` | Aucun lecteur n'a cliqué sur une source bibliographique. Possible vu le low volume, mais à surveiller. |
| `kit_quiz_abandoned` | 6 quiz démarrés, 6 complétés, 0 abandonné → cohérent ou event jamais déclenché. |
| `generateur_ecriture_rate_limit_hit` | Rate limit jamais atteint OU instru manquante. Acceptable si volume faible. |

### Trous d'instrumentation à corriger

1. **`generateur_ecriture_parse_error` sans `reason`** (10 occurrences orphelines, voir action #3).
2. **`newsletter_signup_failed`, `scanner_gate_failed`, `metiers_request_failed`** : vérifier que le handler d'erreur côté serveur fire bien l'event PostHog avant de renvoyer la réponse.
3. **`chantier_intent_succeeded`** : symétrie incomplète avec `_submitted` / `_failed`. Soit ajouter, soit retirer les deux autres pour cohérence.
4. **`newsletter_form_focused` sur pages non-`/`** : vérifier que toutes les instances du NewsletterForm portent bien le tracking (voir action #1).

### Recommandations instrumentation

1. Avant chaque déploiement d'un nouvel outil ou page, exiger une checklist "events tracés" + un test manuel qui provoque chaque event (succès, échec, action utilisateur).
2. Mettre en place un re-audit "events 0-occurrence" toutes les 4 semaines pour détecter les régressions.
3. Standardiser le format `*_failed` avec une prop `reason` obligatoire (enum côté code).

---

*Audit généré le 2026-05-14 via `/posthog-weekly 30d` (variant audit initial). Sources : 7 queries HogQL sur project PostHog 169545.*
