# Decisions log — brainstorming Hermes 2026-06-02

Toutes les décisions prises pendant le brainstorming Mathieu ↔ Claude, dans l'ordre, avec leurs justifications.

## Q1 — Quelle douleur Hermes attaque en premier ?
**Décision** : Pipeline contenu (option B). Pipeline outils explicitement reporté.
**Pourquoi** : focus sur un seul flow pour un design propre. Le pipeline outils sera un spec séparé.

## Q2 — Choix d'architecture LLM
**Décision** : Infomaniak AI uniquement.
**Pourquoi** : cohérence avec la stack existante (`docs/infomaniak-models.md`), souveraineté CH, prix prévisible. Possibilité de prendre Mistral plus gros pour qualité.

## Q3 — Trigger : push / pull / les deux
**Décision** : C (les deux), pas de phasage MVP — push ET pull en même temps.
**Pourquoi** : Mathieu veut les deux dès le départ. Garde-fous compensent l'ambition.

## Q4 — Canal d'entrée et validation
**Décision** : Telegram + Web UI Hermes, validation V1 (manuelle systématique, drafts dans repo, publication à la main).
**Pourquoi** : Telegram natif Hermes pour mobile, Web UI pour desktop confort, V1 respecte workflow Git existant + protège contre dérive auto-publish (recherche LinkedIn 2026 algo).

## Q5 — Mapping input → canaux de sortie
**Décision** : D (hybride) — Push = Mathieu choisit à la volée, Pull = brief tout fait avec mapping suggéré.
**Pourquoi** : quand tu pushes tu es là (autant te demander 2 sec), quand Pull à 6h30 autant livrer actionnable.

## Q6 — Niveau de structure du second cerveau
**Décision** : B (setup Karpathy LLM Wiki complet).
**Pourquoi** : choix ambitieux assumé. Bénéfices long-terme de cross-référence narrative.

## Q7 — Valider les 9 garde-fous post-recherche
**Décision** : A (les 9 révisions validées).
**Pourquoi** : 18+ sources unanimes sur les patterns de graveyard (Karpathy criticism, Tiago Forte critiques, Collector's Fallacy, AI brain fry, LinkedIn 2026 algo). Ces garde-fous rendent le design survivable à 6 mois.

### Les 9 révisions :
1. 3 skills core only, le reste à la demande
2. Cap 5 atomic notes/article (pas 8-15)
3. Exit criteria explicites
4. Audit hallucinations hebdo cross-model
5. Plugins Obsidian strict (Git, Templater, Smart Connections seulement)
6. MOC par questions, jamais exhaustives
7. Hard rule "wiki éphémère"
8. Voice-check humanizer obligatoire
9. Bootstrap passif 3 semaines

## Cost dashboard discussion
**Décision** : SANS PostHog LLM Analytics au MVP. Web UI Hermes natif suffit. Skill cron `daily-budget-check` ajouté pour alertes Telegram.
**Pourquoi** : pushback de Mathieu — Web UI affiche tokens/coût/breakdown nativement (7/30/90j, par modèle, par session). PostHog ajoutable plus tard si alertes business-correlation devient besoin.

## Ollama local sur VPS
**Décision** : NON.
**Pourquoi** : VPS 4 vCPU sans GPU. 7B Q4 = 80s pour un post LinkedIn. Llama 3B = qualité insuffisante pour la voix. Économie ~10-15 CHF/mois pour perte massive de qualité + 50x slower. Mauvais arbitrage. Mac avec Apple Silicon serait mieux placé (phase 2 optionnelle via Tailscale).

## Question "tu / vous"
**Décision** : tu systématique.
**Pourquoi** : posts récents Mathieu utilisent "tu", aligné persona Survivant et registre direct.

## Skill `ingest-tool` (jumeau d'`ingest-article` pour `content/outils/`)
**Décision** : DIFFÉRÉ. Mathieu l'ajoutera à la fin si besoin.
**Pourquoi** : MVP minimaliste, ajout possible à J+60.

## Mode "annonce-outil" dans `draft-linkedin`
**Décision** : OUI.
**Pourquoi** : pattern observé sur 3 posts publiés Mathieu = template structurel (hook gifle / pivot rhétorique / self-disclosure / 80-20 / CTA non-extractif / closing capsule).

## Carousel LinkedIn
**Décision** : option `[LC]`. Hermes génère structure markdown des 8 slides. Mathieu rend en PDF via workflow Remotion existant.
**Pourquoi** : pas d'auto-render fragile, le workflow Mathieu marche.

## Newsletter La Fréquence
**Décision** : DIFFÉRÉE hors scope MVP. Architecture compatible pour activation ultérieure.
**Pourquoi** : 0 numéro envoyé à ce jour. Drafter dans le vide = coût gaspillé sans validation marché.

## Sources Pull
**Décision finale** : 9 sources = MIT TR AI + The Verge AI + Ars Technica AI + TechCrunch AI + FT Tech + Guardian Tech + 404 Media + HN + ArXiv. Plus PostHog/Git/Brevo (couche C) et Google Alerts + Google News RSS 10 keywords FR (couche D).
**Skippé** : X / Twitter (pas d'avis Mathieu, scraping fragile), Substacks (Mathieu ne lit pas).

## Heure brief matinal
**Décision** : 6h30 Geneva.
**Pourquoi** : Mathieu est salarié diversifié. Fenêtre Survivant-IA = avant boulot salarié. 6h30 laisse marge d'action vs 7h trop tard.

## Bookmarks app
**Décision** : SKIP MVP.
**Pourquoi** : Mathieu n'a pas mentionné Readwise/Pocket/Raindrop. Pas d'inventer.

## Spec + dossier hermes/
**Décision** : Spec canonique `docs/superpowers/specs/2026-06-02-hermes-pipeline-contenu-design.md` + dossier `hermes/` avec breakdown navigable.

## Items reportés (à traiter à l'install)
- Backfill `post.md` du carousel BPMN 2026-05-30
- Mise à jour mémoire `reference_linkedin_corpus.md` (15 posts → 2 réels)
- Recherche éventuelle UI password Hermes Web UI
- Configuration Coolify spécifique du container Hermes
