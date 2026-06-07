# Les angles morts de l'IA en entreprise suisse — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer le cycle éditorial "souveraineté IA" — article pilier + outil cheatsheet "le grand filtre" + 4 posts LinkedIn — selon le spec `docs/superpowers/specs/2026-06-07-angles-morts-ia-suisse-design.md`.

**Architecture:** Asset evergreen Nuxt Content (un article markdown + un outil markdown avec matrices) qui sert d'ancre SEO. 4 posts LinkedIn drafts dans `docs/linkedin/published/` qui pointent vers cet asset. PDF source dépollué du contexte client servi en statique.

**Tech Stack:** Nuxt 3 + @nuxt/content v3 + Vue 3 (template `app/pages/outils/[slug].vue` existant). Pas de nouveau composant runtime (kind `cheatsheet` se rend via intro/outro markdown sans Kit component dédié — confirmé en lecture du template L149-170).

**Important :** ce plan est éditorial + intégration code, pas un développement TDD classique. Les "tests" sont des **commandes de vérification** (grep, build, lint, visuel) plutôt que des unit tests.

**Travail dans le repo principal** (`/Users/mathieu/Documents/survivor`) sur la branche `main`. Pas de worktree créé : le scope ne touche que des fichiers nouveaux + ajouts ciblés à 3 fichiers de config.

**⚠️ MODE DRAFT — décision Mathieu 2026-06-07** : tout est créé sur disque mais **rien n'est rendu visible sur le site live tant que Mathieu ne donne pas le go**. Concrètement :

- Article pilier : frontmatter `status: draft` (au lieu de `published`)
- Outil : fichier `.md` créé mais **pas wiré** dans `outils-manifest.ts`, **pas ajouté** aux prerender routes, **pas de FAQs déclarées** dans `outil-faqs.ts`, **pas de CTA override**. Le fichier dort sur disque.
- Posts LinkedIn : drafts dans `docs/linkedin/published/`, prêts à copier-coller mais pas postés.
- PDF source : peut vivre dans `public/downloads/` (statique, mais pas linké tant que l'outil n'est pas wiré → pas de chemin SEO vers lui)

**Conséquence sur les tasks** :
- Tasks 1, 2, 3, 7 : exécutées **maintenant** (création des assets)
- Task 4 (wiring code), Task 5 (visual check sur site live), Task 6 (analytics), Task 8 (ship readiness) : **différées au jour J** où Mathieu donne le go.

À mettre en prod le moment venu, il suffira de :
1. Flip `status: draft` → `status: published` dans `content/rapports/angles-morts-ia-entreprise-suisse.md`
2. Exécuter Task 4 (manifest + CTAs + FAQs + prerender routes)
3. Exécuter Task 5 (visual check) + Task 6 (analytics) + Task 8 (verif finale + sitemap)
4. Push / déployer.

**Lecture obligatoire avant de commencer :**
- Spec : `docs/superpowers/specs/2026-06-07-angles-morts-ia-suisse-design.md`
- Charte voix : `docs/charte-voix.md`
- Charte éditoriale articles : `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` (4 dimensions de review §7)
- Source doc : `~/Downloads/Guide_IA_donnees_immobilier_nLPD_secret_affaires_final.docx`
- Convention manifest : header de `app/data/outils-manifest.ts` (checklist §11-19)

---

## File Structure

### Files to create

| Path | Responsibility |
|---|---|
| `content/rapports/angles-morts-ia-entreprise-suisse.md` | Article pilier (frontmatter + 8 sections) |
| `content/outils/le-grand-filtre.md` | Outil cheatsheet (frontmatter + intro avec matrices + outro) |
| `public/downloads/le-grand-filtre.pdf` | PDF source dépollué du contexte S&F |
| `docs/linkedin/published/2026-06-07-angles-morts-ia/post-1.md` | Post 1 origin / "le grand filtre" |
| `docs/linkedin/published/2026-06-07-angles-morts-ia/post-2.md` | Post 2 Shadow IT / LPD |
| `docs/linkedin/published/2026-06-07-angles-morts-ia/post-3.md` | Post 3 Cloud Act / coffre-clé |
| `docs/linkedin/published/2026-06-07-angles-morts-ia/post-4.md` | Post 4 kDrive Infomaniak (squelette) |
| `docs/linkedin/published/2026-06-07-angles-morts-ia/README.md` | Notes série (cadence, dépendances, CTAs) |

### Files to modify

| Path | Modification |
|---|---|
| `app/data/outils-manifest.ts` | Ajout entrée `le-grand-filtre` (kind: cheatsheet) |
| `app/data/outil-ctas.ts` | Override CTA "OUVRIR LE GRAND FILTRE" |
| `app/data/outil-faqs.ts` | 4-5 FAQs pour `le-grand-filtre` |
| `nuxt.config.ts` | Ajout `/outils/le-grand-filtre` et `/rapports/angles-morts-ia-entreprise-suisse` à `nitro.prerender.routes` |

### Files NOT to modify

- `app/pages/outils/[slug].vue` — vérification que `kind: cheatsheet` rend correctement via intro/outro markdown ; pas de changement requis a priori
- `content.config.ts` — interdit de modifier (mémoire `feedback_nuxt_content_schema.md` : invalide cache SQLite)

---

## Task 1 : Préparer la matière source (PDF dépollué)

**Objectif :** convertir le `.docx` source en `.md` propre, scrubber les références S&F (client immobilier), produire un PDF distribuable.

**Files:**
- Create: `idea/angles-morts-source-extraction.md` (extraction texte brute, scratchpad)
- Create: `idea/angles-morts-source-clean.md` (version dépolluée, source du PDF final)
- Create: `public/downloads/le-grand-filtre.pdf` (PDF généré)

- [ ] **Step 1.1 : Extraire le texte du docx**

```bash
unzip -p "/Users/mathieu/Downloads/Guide_IA_donnees_immobilier_nLPD_secret_affaires_final.docx" word/document.xml \
  | sed 's/<[^>]*>/ /g' | tr -s ' ' > /tmp/source-raw.txt
wc -w /tmp/source-raw.txt
```
Expected : ~2500-3000 mots.

- [ ] **Step 1.2 : Reformater en markdown propre dans `idea/angles-morts-source-extraction.md`**

Restituer la structure du doc original (8 sections, matrices en tables markdown, glossaire). C'est un fichier de travail, pas publié.

- [ ] **Step 1.3 : Dépolluer S&F → `idea/angles-morts-source-clean.md`**

À remplacer :
- "S&F" → retiré (ou "une PME suisse régulée" selon contexte)
- "Aide à la décision interne — S&F" → "Aide à la décision — sécurité de l'IA en entreprise suisse"
- "noms de locataires ou d'investisseurs" → "noms de clients, locataires, ou de parties prenantes financières" (élargi)
- Exemples spécifiques immo → conserver mais ajouter des exemples finance/santé en parallèle quand pertinent

Vérification : `grep -i "s&f\|s & f\|guide_ia_donnees_immobilier" idea/angles-morts-source-clean.md` retourne vide.

- [ ] **Step 1.4 : Générer le PDF distribuable**

Pandoc n'est pas installé. Deux options :
- **Option A (recommandée)** : Mathieu génère le PDF via export Word ou Pages depuis `idea/angles-morts-source-clean.md` → enregistre comme `public/downloads/le-grand-filtre.pdf`. Plus rapide et la mise en page sera meilleure pour un asset téléchargeable.
- **Option B** : installer pandoc (`brew install pandoc basictex`) puis `pandoc idea/angles-morts-source-clean.md -o public/downloads/le-grand-filtre.pdf --pdf-engine=xelatex -V mainfont="Helvetica" -V geometry:margin=2cm`

Préférer Option A. Bloquer cette étape sur Mathieu si l'option B échoue.

- [ ] **Step 1.5 : Vérifier le PDF**

```bash
ls -lh public/downloads/le-grand-filtre.pdf
file public/downloads/le-grand-filtre.pdf
```
Expected : `application/pdf`, taille raisonnable (< 500 KB).

- [ ] **Step 1.6 : Commit**

```bash
git add public/downloads/le-grand-filtre.pdf idea/angles-morts-source-clean.md idea/angles-morts-source-extraction.md
git commit -m "ingest(angles-morts-ia): source dépolluée + PDF distribuable"
```

---

## Task 2 : Article pilier (`content/rapports/angles-morts-ia-entreprise-suisse.md`)

**Objectif :** écrire l'article pilier 4000-5000 mots, voix Mathieu, charte appliquée.

**Files:**
- Create: `content/rapports/angles-morts-ia-entreprise-suisse.md`

- [ ] **Step 2.1 : Frontmatter**

```yaml
---
title: "Les angles morts de l'IA en entreprise suisse"
description: "LPD, secret d'affaires, Cloud Act. Ce que les éditeurs ne te disent pas quand ils vendent 'leur IA sécurisée'. Sept angles morts à vérifier avant de connecter une donnée client à un modèle."
date: 2026-06-07
category: souverainete-ia
kicker: "LECTURE LONGUE · 12 MIN"
status: draft
maintainer: human
---
```

> **Mode draft** : `status: draft` — à flipper en `published` au jour du ship.

Note : `category: souverainete-ia` est nouvelle. Vérifier que les pages `/rapports/index.vue` et filtres existants ne cassent pas (les autres categories sont des strings libres, donc OK).

- [ ] **Step 2.2 : Section 1 — "Le mot 'sécurisé' ne veut rien dire" (~300 mots)**

Hook : "Quand un éditeur te dit que son IA est sécurisée, il ne te dit pas de quelle sécurité il parle." Pose les 3 sens. Charte §3-4 respectée.

- [ ] **Step 2.3 : Section 2 — "Conformité ≠ secret d'affaires" (~600 mots)**

L'angle mort majeur. ChatGPT Enterprise compliant LPD mais exposé Cloud Act. Pose la distinction. Cas d'école : un cabinet immobilier suisse qui passe en Enterprise et croit être protégé.

- [ ] **Step 2.4 : Section 3 — "L'arbre de décision" (~700 mots)**

Les 5 questions du doc, chacune dépliée avec un exemple concret :
1. Données personnelles ? (noms locataires, coordonnées clients, IDs)
2. Anonymisation durable possible ? (alerter sur pseudonymisation)
3. Données sensibles / FINMA ?
4. Le fournisseur garantit-il no-train + DPA ?
5. Où traite-t-on ? (CH / UE / hors UE)

- [ ] **Step 2.5 : Section 4 — "La matrice des verdicts" (~400 mots)**

Version narrative : "7 catégories d'outils, 2 verdicts par outil (LPD + secret d'affaires)". Renvoyer explicitement à l'outil pour la matrice complète : "La matrice complète vit dans le grand filtre, lien plus bas. Ici, on extrait ce qui surprend le plus."

Surprises clés à raconter :
- ChatGPT perso = non-conforme LPD ET exposé
- ChatGPT Enterprise = conforme LPD MAIS exposé
- Infomaniak AI = conforme LPD ET protégé (point souvent ignoré)

- [ ] **Step 2.6 : Section 5 — "Les 7 angles morts" (~1200 mots, ~170 mots / angle)**

Un par un, chacun avec un exemple court. Liste figée par §5 du spec :
1. Conformité ≠ secret d'affaires (récap si pas redondant avec §2)
2. Anonymisation ≠ pseudonymisation
3. Plans grand public — entraînement par défaut (Pro/Max d'Anthropic, ChatGPT Plus individuel)
4. Agents de codage — héritent du backend (Claude Code, Cursor, Antigravity)
5. Self-host ≠ automatiquement souverain (VPS étranger)
6. Niveau "Bon" Azure/Bedrock CH illusoire sans HYOK + TEE + exemption journal
7. Résidence UE ≠ protection Cloud Act

- [ ] **Step 2.7 : Section 6 — "Le cas des agents de codage" (~500 mots)**

Audience C (indé, cadres tech). L'agent vaut ce que vaut son backend. Différencier les plans commerciaux (API, Bedrock, Vertex, Team, Enterprise) vs grand public (Pro/Max). Les 2 règles spécifiques : périmètre (code/test data, jamais prod réelle) + accès local (les transcripts en clair).

- [ ] **Step 2.8 : Section 7 — "Et alors, qu'est-ce qu'on fait ?" (~500 mots)**

Checklist déploiement : DPA, mécanisme de transfert, no-train confirmé, AIPD si risque, registre des traitements, info des personnes, mesures techniques. Spécifique Azure/Bedrock CH : HYOK + TEE + exemption journal. Périmètre FINMA : notification + audit + plan réversibilité.

- [ ] **Step 2.9 : Section 8 — "Glossaire et limites" (~400 mots)**

Glossaire (extraire du doc : LPD, RGPD, DPA, CCT/SCC, Swiss-US DPF, TIA, ZDR, CMK, HYOK, TEE, Cloud Act, AIPD, FINMA Circ. 2018/3).

Limites : "Ce n'est pas un conseil juridique. La qualification précise des données et la conformité d'un déploiement donné doivent être validées par un conseil juridique spécialisé. Les caractéristiques des fournisseurs évoluent. Date de dernière révision : 7 juin 2026."

CTA fin : "Pour vérifier ton setup en un coup d'œil, ouvre le grand filtre. Pour recevoir les mises à jour quand le marché bouge, La Fréquence."

- [ ] **Step 2.10 : Voice review (charte §3-4 + 4 dimensions du spec articles)**

Exécuter ces vérifications grep dans le draft :

```bash
# Emojis interdits
grep -P "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]" content/rapports/angles-morts-ia-entreprise-suisse.md
# Em-dashes
grep -- "—" content/rapports/angles-morts-ia-entreprise-suisse.md
# Négation incomplète
grep -E "je suis pas|c'est pas|y'a pas" content/rapports/angles-morts-ia-entreprise-suisse.md
# Mots bannis charte §2.2
grep -iE "\bméthode\b|chevaucher|crucial|pivot(?!al éditorial)|landscape" content/rapports/angles-morts-ia-entreprise-suisse.md
# Signposting
grep -iE "voyons ensemble|plongeons dans|sans plus attendre" content/rapports/angles-morts-ia-entreprise-suisse.md
```

Expected : tous retournent vide. Si non-vide, corriger.

- [ ] **Step 2.11 : Test interne 4 dimensions (charte editoriale articles §7)**

Self-check :
1. **Voix Mathieu** : remplacer "Mathieu" mentalement par un autre auteur — les phrases tiennent-elles ? Si oui sur 1 phrase, OK ; si oui sur 5+ phrases, recadrer.
2. **Différenciation** : ChatGPT pourrait-il écrire ça à un autre auteur sans changement ? L'angle "angles morts" + le ton lucide doivent rendre la réponse non.
3. **Hook → tension → résolution** : couper à 30% du texte, le lecteur a-t-il déjà la valeur ? L'angle mort §2 doit suffire.
4. **SEO de surface** : title ≤ 60 chars (actuellement "Les angles morts de l'IA en entreprise suisse" = 47 ✓), description claire, H2 incluent variations sémantiques.

- [ ] **Step 2.12 : Commit**

```bash
git add content/rapports/angles-morts-ia-entreprise-suisse.md
git commit -m "feat(rapports): article pilier 'angles morts de l'IA en entreprise suisse'"
```

---

## Task 3 : Outil "le grand filtre" (`content/outils/le-grand-filtre.md`)

**Objectif :** rédiger l'outil cheatsheet — frontmatter + intro (matrices) + outro (conditions, agents, glossaire, sources).

**Files:**
- Create: `content/outils/le-grand-filtre.md`

- [ ] **Step 3.1 : Frontmatter**

```yaml
---
code: le-grand-filtre
kind: cheatsheet
title: Le grand filtre
subtitle: "La matrice qui croise conformité LPD, secret d'affaires et réalité opérationnelle pour 7 catégories d'outils IA."
description: "Matrice consultable. Croise conformité LPD, protection du secret d'affaires et réalité opérationnelle pour 7 catégories d'outils IA (ChatGPT, API, Azure, Bedrock, Infomaniak, self-host). Gratuit, PDF téléchargeable, indexable."
kicker: KIT · LE GRAND FILTRE
parentArticleSlug: angles-morts-ia-entreprise-suisse
specs:
  - "7 OUTILS"
  - "3 DIMENSIONS"
  - "MATRICE CONSULTABLE"
  - "PDF TÉLÉCHARGEABLE"
calloutPitch: "Tu veux savoir si ton outil IA expose ta boîte ? Le grand filtre croise trois dimensions (conformité LPD, secret d'affaires, réalité opérationnelle) pour 7 catégories d'outils. Une consultation, un verdict."
metiers: []
intro: |
  Tu veux intégrer l'IA dans ton entreprise sans mettre tes données client ou ton secret d'affaires en risque. Mais entre "ChatGPT", "API OpenAI", "Azure CH", "Infomaniak", "Llama en self-host", les éditeurs te jurent tous que c'est "sécurisé". Sauf que ce mot recouvre trois choses qui ne se recoupent pas.

  Le grand filtre croise ces trois choses pour 7 catégories d'outils.

  Lis dans cet ordre : matrice 1 (conformité LPD — ai-je le droit ?), matrice 2 (secret d'affaires — mon secret tient-il face au Cloud Act ?), matrice 3 (réalité opérationnelle — qu'est-ce qui va peser une fois l'outil choisi ?).

  **Légende verdicts** : vert = conforme / risque faible, orange = sous conditions (a, b, c — voir conditions plus bas), rouge = non / risque élevé.

  ### Matrice 1 — Conformité LPD

  | Outil | Résidence | DPA | No-train | Verdict |
  |---|---|---|---|---|
  | ChatGPT perso (Free / Plus) | US | Non | Non | Non conforme |
  | ChatGPT Team / Enterprise | US (UE option) | Oui | Oui | Conforme sous condition **a** |
  | API OpenAI (+ ZDR) | US | Oui | Oui | Conforme sous condition **a** |
  | Azure OpenAI (CH North) | CH | Oui | Oui | Conforme |
  | AWS Bedrock (Zurich) | CH | Oui | Oui | Conforme |
  | Infomaniak AI (API) | CH | Oui | Oui | Conforme |
  | Self-host (Ollama / on-prem) | CH requis **c** | Sans objet | Oui | Conforme **c** |

  ### Matrice 2 — Secret d'affaires & souveraineté

  | Outil | CMK / clés | Cloud Act | Verdict |
  |---|---|---|---|
  | ChatGPT perso | Non | Élevé | Exposé |
  | ChatGPT Team / Enterprise | Non | Élevé | Risqué |
  | API OpenAI (+ ZDR) | Non | Élevé | Risqué |
  | Azure OpenAI (CH North) | Oui (+ HYOK) | Moyen | Bon **b** |
  | AWS Bedrock (Zurich) | Oui (+ HYOK) | Moyen | Bon **b** |
  | Infomaniak AI (API) | Chiffrement CH | Nul | Protégé |
  | Self-host | Total | Nul | Maximal **c** |

  ### Matrice 3 — Réalité opérationnelle

  | Outil | Point d'attention |
  |---|---|
  | ChatGPT perso | Le cauchemar du Shadow IT. Aucun contrôle d'accès, aucune visibilité sur ce que les employés copient-collent. |
  | ChatGPT Team / Enterprise | Faux sentiment de sécurité. Protège contre l'entraînement, pas contre une injonction étrangère. Exige une gouvernance SSO stricte. |
  | API OpenAI (+ ZDR) | Nécessite un middleware. Prévoir un tampon en amont pour filtrer ou pseudonymiser les requêtes avant le départ US. |
  | Azure OpenAI (CH North) | Lourdeur de configuration. Le niveau "Bon" suppose d'empiler HYOK + calcul confidentiel + exemption de journalisation. |
  | AWS Bedrock (Zurich) | Profil jumeau d'Azure. Souveraineté par empilement KMS externalisé + Nitro Enclaves. |
  | Infomaniak AI (API) | Écart de performance possible sur les raisonnements très complexes vs modèles frontière propriétaires. |
  | Self-host | Le piège de l'infrastructure. Le risque se déplace vers ta sécurité interne (accès, sauvegardes, durcissement). Coûts GPU souvent cachés. |
outro: |
  ## Lecture des verdicts et conditions

  Le verdict LPD dépend de la chaîne : résidence + DPA + non-entraînement + encadrement du transfert.
  Le verdict secret d'affaires dépend de qui peut, de fait, accéder au contenu : maîtrise des clés et exposition au Cloud Act.

  ### Condition a — Transfert vers les États-Unis

  "Conforme" seulement si le mécanisme de transfert est en place : fournisseur certifié Swiss-US DPF (adéquation reconnue depuis septembre 2024, à vérifier sur la liste officielle dataprivacyframework.gov/list, certification annuelle) **ou** clauses contractuelles types + analyse d'impact (TIA). Le statut DPF d'OpenAI est ambigu selon les sources ; Microsoft est certifié.

  ### Condition b — Niveau "Bon" Azure / Bedrock

  Atteint uniquement en empilant : clé en HYOK (hors d'atteinte de l'hébergeur), calcul confidentiel (TEE) pour l'inférence, et exemption de journalisation. Sans ces couches, le verdict retombe à "Moyen".

  ### Condition c — Self-host

  Valable à deux conditions : serveur physiquement en Suisse (matériel propre ou hébergeur suisse type Infomaniak ; un VPS étranger ou un cloud américain fait retomber la résidence et peut réintroduire le Cloud Act par la couche infrastructure), **et** sécurité interne (accès, sauvegardes, durcissement) à la hauteur.

  ## Le cas des agents de codage (Claude Code, Cursor, Antigravity, Copilot, Codex)

  Les agents de codage ne sont pas une ligne de la matrice : ce sont des clients, pas des backends d'hébergement. Leur conformité hérite du moteur d'inférence vers lequel ils sont configurés.

  - **Claude Code** : configurable. Par défaut, API Anthropic (US) → profil "API OpenAI". Routé vers Bedrock, Vertex ou Foundry (région européenne ou cloud privé) → profil "Azure / Bedrock CH". Sur un plan grand public (Pro/Max) l'entraînement peut être actif par défaut, même piège que ChatGPT personnel. Sur les plans commerciaux (API, Bedrock, Vertex, Team, Enterprise) : pas d'entraînement.
  - **Antigravity (Google)** : cloud-native, code par défaut sur les serveurs Google → profil "US". Via la plateforme Google Cloud entreprise (région suisse, Google certifié DPF), il se rapproche du profil "Azure / Bedrock CH". En exécution locale (Ollama), il rejoint le profil "self-host".

  **Deux règles propres aux agents**

  - **Périmètre** : un agent touche du code, pas des données de production. Garder l'agent sur du code et des données de test ou synthétiques, jamais sur des données personnelles ou réglementées réelles. Surveiller les secrets (clés API, mots de passe) qui ne doivent finir ni dans un prompt ni dans un cache local.
  - **Accès local** : les agents lisent le dépôt, exécutent des commandes, pilotent parfois un navigateur. Certains conservent les transcripts en clair localement. La surface d'exposition (exfiltration, injection de prompt) est plus large qu'un chatbot et appelle un contrôle d'accès strict.

  ## Avant de déployer (checklist)

  - **DPA / contrat de sous-traitance signé** (art. 9 LPD)
  - **Mécanisme de transfert** pour tout flux hors CH/UE : adéquation Swiss-US DPF ou CCT + analyse d'impact (TIA)
  - **Confirmation contractuelle du non-entraînement** (et du zero-data-retention si disponible)
  - **AIPD** (analyse d'impact) si le risque est élevé
  - **Mise à jour du registre des traitements** et de la politique de confidentialité ; information des personnes concernées
  - **Mesures techniques** : chiffrement, contrôle d'accès, journalisation

  Spécifique Azure / Bedrock CH : clé externalisée en HYOK + calcul confidentiel (TEE) + exemption de journalisation.

  Périmètre FINMA : notification d'externalisation, clause d'audit, plan de réversibilité (Circ. 2018/3). Politique interne d'usage de l'IA + classification des données.

  ## Glossaire

  - **LPD** : Loi fédérale suisse sur la protection des données, en vigueur depuis le 1er septembre 2023.
  - **RGPD** : Règlement général européen sur la protection des données.
  - **Donnée personnelle** : information se rapportant à une personne identifiée ou identifiable.
  - **Anonymisation** : rupture durable du lien avec la personne (réidentification à effort disproportionné) ; sort la donnée du champ de la loi.
  - **Pseudonymisation** : remplacement des identifiants par un pseudonyme, clé conservée à part ; la donnée reste personnelle.
  - **DPA** : Data Processing Agreement, contrat de sous-traitance (art. 9 LPD).
  - **CCT / SCC** : clauses contractuelles types pour les transferts transfrontières.
  - **Swiss-US DPF** : Data Privacy Framework ; depuis le 15 septembre 2024, voie d'adéquation pour les transferts vers les entreprises US certifiées.
  - **TIA** : Transfer Impact Assessment, requise hors voie d'adéquation.
  - **ZDR** : Zero Data Retention.
  - **CMK** : Customer-Managed Keys.
  - **HYOK** : Hold Your Own Key — clé hors d'atteinte de l'hébergeur.
  - **TEE / calcul confidentiel** : Trusted Execution Environment, protège la donnée en mémoire pendant le traitement.
  - **Cloud Act** : loi américaine permettant d'exiger d'une entreprise US la communication de données, y compris stockées hors des États-Unis.
  - **AIPD** : Analyse d'impact relative à la protection des données.
  - **FINMA (Circ. 2018/3)** : cadre suisse de l'externalisation applicable aux établissements financiers.

  ## Limites

  Ce document est une aide à la décision. Il ne constitue pas un avis juridique. La qualification précise des données et la conformité d'un déploiement donné doivent être validées par un conseil juridique spécialisé, en particulier sur le volet FINMA. Les caractéristiques des fournisseurs (résidence, options de chiffrement, statut DPF, conditions contractuelles) évoluent et doivent être vérifiées au moment de la contractualisation.

  Date de dernière révision : 7 juin 2026.

  ## Télécharger le PDF

  Le grand filtre est aussi disponible en PDF : [le-grand-filtre.pdf](/downloads/le-grand-filtre.pdf)

  ## Pour aller plus loin

  L'article pilier ["Les angles morts de l'IA en entreprise suisse"](/rapports/angles-morts-ia-entreprise-suisse) déplie chacun des angles morts avec des exemples concrets.

  Pour recevoir les mises à jour de la matrice quand le marché bouge (nouveaux outils, changements de statut DPF, évolutions FINMA), inscris-toi à [La Fréquence](/frequence).
data:
  posthog_event_prefix: le_grand_filtre
---
```

- [ ] **Step 3.2 : Voice review**

Mêmes greps que Task 2 Step 2.10. Ajouter une vérification spécifique :

```bash
# Tableaux markdown bien formés
grep -c "^|" content/outils/le-grand-filtre.md
```
Expected : ~30+ lignes (les 3 matrices ont 8 lignes header + 7 lignes data chacune).

- [ ] **Step 3.3 : Commit**

```bash
git add content/outils/le-grand-filtre.md
git commit -m "feat(outils): le grand filtre — matrice sécurité IA pour l'entreprise suisse"
```

---

## Task 4 : Intégration code (manifest + CTAs + FAQs + prerender) — **DIFFÉRÉE AU JOUR DU SHIP**

> Cette task et toutes les suivantes (5, 6, 8) sont **différées** jusqu'au moment où Mathieu donne le go pour publier. À ce moment-là, suivre ces tasks dans l'ordre.

**Files:**
- Modify: `app/data/outils-manifest.ts`
- Modify: `app/data/outil-ctas.ts`
- Modify: `app/data/outil-faqs.ts`
- Modify: `nuxt.config.ts`

- [ ] **Step 4.1 : Manifest — ajout de l'entrée**

Modifier `app/data/outils-manifest.ts` après l'entrée `generateur-processus-bpmn` (avant la closing bracket) :

```typescript
  {
    code: 'le-grand-filtre',
    path: '/outils/le-grand-filtre',
    title: 'Le grand filtre',
    subtitle: 'La matrice qui croise conformité LPD, secret d\'affaires et réalité opérationnelle pour 7 outils IA.',
    kind: 'cheatsheet',
    metiers: [],
  },
```

- [ ] **Step 4.2 : CTA override**

Modifier `app/data/outil-ctas.ts` — ajouter dans `OVERRIDES` :

```typescript
  'le-grand-filtre': 'OUVRIR LE GRAND FILTRE',
```

Le defaut pour `kind: 'cheatsheet'` est `'OUVRIR LA FICHE'`, mais on veut le verbe spécifique.

- [ ] **Step 4.3 : FAQs**

Modifier `app/data/outil-faqs.ts` — ajouter dans `OUTIL_FAQS` :

```typescript
  'le-grand-filtre': [
    {
      question: "Qui est responsable si je me trompe d'outil ?",
      answer: "Toi, et ton conseil juridique. Le grand filtre est une aide à la décision, pas un avis juridique. La qualification précise des données et la conformité d'un déploiement donné doivent être validées par un juriste spécialisé, en particulier sur le volet FINMA. Le document récapitule l'état du marché à la date affichée — les caractéristiques des fournisseurs évoluent.",
    },
    {
      question: "Pourquoi ChatGPT Enterprise est 'risqué' alors qu'il est conforme LPD ?",
      answer: "Parce que la LPD et le secret d'affaires sont deux choses différentes. ChatGPT Enterprise garantit le non-entraînement et un DPA, donc la LPD est respectée. Mais OpenAI reste une entreprise américaine, soumise au Cloud Act. Sur injonction d'un juge américain, elle peut être contrainte de livrer des données — même celles d'un client suisse. La LPD protège les personnes ; le Cloud Act expose les secrets d'entreprise.",
    },
    {
      question: "Self-host = solution parfaite ?",
      answer: "Sur le papier oui, en pratique non. Un VPS étranger fait retomber la résidence et peut réintroduire le Cloud Act par la couche infrastructure. Et la sécurité interne (accès, sauvegardes, durcissement, GPU à payer) devient ton problème. Le risque ne disparaît pas, il se déplace.",
    },
    {
      question: "Et les agents de codage comme Claude Code ou Cursor ?",
      answer: "Ils n'ont pas de conformité propre. Ils héritent de leur backend. Claude Code routé vers l'API Anthropic (US) = profil 'API OpenAI'. Routé vers Bedrock région européenne = profil 'Azure / Bedrock CH'. Et un plan grand public (Pro/Max) peut activer l'entraînement par défaut, même piège que ChatGPT personnel.",
    },
    {
      question: "C'est mis à jour quand ?",
      answer: "La date de dernière révision est affichée en bas de la fiche. Le marché de l'IA en entreprise change rapidement (nouveaux outils, changements de statut DPF, évolutions FINMA). Pour être notifié des mises à jour, inscris-toi à La Fréquence.",
    },
  ],
```

- [ ] **Step 4.4 : Prerender routes**

Modifier `nuxt.config.ts` L127-138 — ajouter deux entrées dans le tableau `routes` :

```typescript
        '/outils/le-grand-filtre',
        '/rapports/angles-morts-ia-entreprise-suisse',
```

À insérer dans l'ordre alphabétique du bloc existant (juste après les autres `/outils/...` et `/rapports/...`).

- [ ] **Step 4.5 : Build local pour vérifier**

```bash
npm run build
```

Expected : build réussit, aucune erreur sur les nouvelles routes. Si erreur "page not found for /outils/le-grand-filtre" : vérifier que `content/outils/le-grand-filtre.md` est bien indexable par `@nuxt/content`.

- [ ] **Step 4.6 : Commit**

```bash
git add app/data/outils-manifest.ts app/data/outil-ctas.ts app/data/outil-faqs.ts nuxt.config.ts
git commit -m "feat(outils): wire le-grand-filtre dans manifest + FAQs + prerender"
```

---

## Task 5 : Vérification rendu `kind: cheatsheet` — **DIFFÉRÉE AU JOUR DU SHIP**

**Objectif :** confirmer que le template `[slug].vue` rend correctement le nouveau type d'outil sans qu'on ait à toucher au composant.

**Files (read-only check):**
- Read: `app/pages/outils/[slug].vue`

- [ ] **Step 5.1 : Démarrer le dev server**

```bash
npm run dev
```

- [ ] **Step 5.2 : Charger `/outils/le-grand-filtre` dans un navigateur**

Vérifier visuellement :
- Hero rendu (kicker, titre, subtitle, specs cards visibles)
- Lien vers article pilier `/rapports/angles-morts-ia-entreprise-suisse` cliquable (la card "À LIRE D'ABORD")
- Intro markdown rendu — les 3 matrices markdown s'affichent comme tableaux
- Outro markdown rendu — sections conditions + agents + glossaire + limites + télécharger PDF
- FAQs s'affichent en accordéon en bas
- Footer "POUR EN SAVOIR PLUS" + NewsletterForm visible

- [ ] **Step 5.3 : Vérifier le téléchargement PDF**

Cliquer le lien "le-grand-filtre.pdf" dans l'outro. Le PDF doit s'ouvrir ou se télécharger sans 404.

- [ ] **Step 5.4 : Vérifier le rendu mobile**

Ouvrir DevTools en responsive 375px. Les 3 tableaux doivent rester scrollables horizontalement (overflow-x sur `.prose table` est probablement déjà en place — sinon noter pour Task 6).

- [ ] **Step 5.5 : Si tableaux cassent en mobile**

Vérifier l'existence d'une classe `.prose table` dans `app/assets/css/`. Si overflow-x:auto n'est pas géré, créer une issue de suivi mais ne pas bloquer le ship (la matrice reste lisible en desktop, qui est l'usage principal B2B).

- [ ] **Step 5.6 : Capture d'écran de référence pour PR / future review**

```bash
# Capturer la page en desktop
# (manuel : screenshot via cmd-shift-4 ou DevTools)
```

Sauvegarder dans `idea/le-grand-filtre-render-2026-06-07.png` (référence visuelle, pas committé en repo).

---

## Task 6 : PostHog events instrumentation — **DIFFÉRÉE AU JOUR DU SHIP**

**Objectif :** capturer les événements définis dans le spec §10.

**Files:**
- Modify: `app/pages/outils/[slug].vue` (si pas déjà en place sur les nouveaux events)

- [ ] **Step 6.1 : Auditer les events existants**

```bash
grep -n "capture(" app/pages/outils/\[slug\].vue
```

Identifier ceux déjà émis (kit_view, etc.) vs ceux du spec (`kit_pdf_download` est probablement nouveau).

- [ ] **Step 6.2 : Ajouter event `kit_pdf_download`**

Si le lien PDF dans l'outro n'a pas de capture, ajouter un listener au composant qui rend `outro` MDC. Plus simple : ajouter une directive @click via la prose ou (mieux) wrapper le lien PDF dans un composant.

Option pragmatique v1 : créer un composant `<DownloadPdfLink>` ou un attribut `data-event="le_grand_filtre_pdf_download"` lu par un wrapper global.

Le wiring exact est un détail à arbitrer en implémentation. Acceptable de différer si l'instrumentation passe en suivi.

- [ ] **Step 6.3 : Vérifier `article_pilier_scroll_75` sur l'article**

Vérifier si un composant scroll-tracker existe déjà sur les rapports. Si non, créer une issue suivi (hors scope v1 si pas trivial).

- [ ] **Step 6.4 : Commit (si changements)**

```bash
git add -p
git commit -m "feat(analytics): le-grand-filtre PDF download + scroll events"
```

---

## Task 7 : LinkedIn posts (squelettes de la série)

**Objectif :** sauvegarder les 4 posts validés dans `docs/linkedin/published/2026-06-07-angles-morts-ia/`.

**Files:**
- Create: `docs/linkedin/published/2026-06-07-angles-morts-ia/README.md`
- Create: `docs/linkedin/published/2026-06-07-angles-morts-ia/post-1.md`
- Create: `docs/linkedin/published/2026-06-07-angles-morts-ia/post-2.md`
- Create: `docs/linkedin/published/2026-06-07-angles-morts-ia/post-3.md`
- Create: `docs/linkedin/published/2026-06-07-angles-morts-ia/post-4.md`

- [ ] **Step 7.1 : README.md de la série**

```markdown
# Série "Les angles morts de l'IA en entreprise suisse"

Cycle de 4 posts LinkedIn distribuant l'asset evergreen `/outils/le-grand-filtre` + `/rapports/angles-morts-ia-entreprise-suisse`.

## Cadence

| Post | Jour | Statut |
|---|---|---|
| Post 1 — origin / le grand filtre | J | prêt |
| Post 2 — Shadow IT / LPD | J+1 | prêt |
| Post 3 — Cloud Act / coffre-clé | J+2 | prêt |
| Post 4 — kDrive Infomaniak | J+X (7-15 jours) | bloqué sur REX kDrive |

## CTAs

- 1er commentaire (tous posts) : `https://survivant-ia.ch/outils/le-grand-filtre`
- 2e commentaire (posts 1-3) : `https://survivant-ia.ch/rapports/angles-morts-ia-entreprise-suisse`
- 2e commentaire (post 4) : invitation explicite La Fréquence → `https://survivant-ia.ch/frequence`

## Voix appliquée

Charte `docs/charte-voix.md` §3-4 + 8 points check du spec §8. Pas d'emoji, pas de hashtag, tutoiement, négation française complète, em-dash interdit.

## Dépendances

- L'article pilier et l'outil DOIVENT être en ligne avant la publication du Post 1.
- L'expérimentation kDrive (à planifier) débloque le Post 4. Le squelette est validé, le contenu réel sera ajusté après le REX.
```

- [ ] **Step 7.2 : `post-1.md`**

Frontmatter aligné sur le post précédent (`docs/linkedin/published/2026-05-21-comment-ecrire-prompt/post.md`) :

```markdown
---
date: 2026-06-07
status: ready-to-publish
cluster: souverainete-ia (nouveau cluster — sécurité IA entreprise suisse)
archetype: A (origin story — pose la légitimité en début de série)
format: court (LinkedIn, post text seul)
cta_1: lien outil /outils/le-grand-filtre en 1er commentaire
cta_2: lien article /rapports/angles-morts-ia-entreprise-suisse en 2e commentaire
target_chars: 1000-1200
serie: angles-morts-ia (1/4)
---

# Post 1 — origin / le grand filtre

J'ai cherché partout un tableau clair sur la sécurité de l'IA en Suisse. Je n'ai rien trouvé. Alors je l'ai construit.

Quand on parle d'intégrer l'IA dans nos processus, surtout dans des secteurs exigeants comme l'immobilier ou la finance, le mot "sécurisé" est jeté à toutes les sauces.

Mais de quelle sécurité parle-t-on ?

- La protection des données personnelles (LPD) ?
- Le secret d'affaires de la boîte ?
- La résidence des serveurs face aux lois étrangères ?

J'étais fatigué des discours évasifs des éditeurs. J'avais besoin d'une matrice claire pour savoir, en un coup d'œil, si je mettais une entreprise en danger.

Le document n'existait pas. Je l'ai construit. Je l'appelle le grand filtre.

Il croise la conformité LPD, la protection du secret d'affaires et la réalité opérationnelle. Des outils grand public aux API, en passant par le cloud suisse et le self-host.

Je l'ai mis en libre accès sur Survivant-IA. Lien en premier commentaire.

Demain, l'erreur la plus fréquente que je vois sur ChatGPT et la LPD.
```

- [ ] **Step 7.3 : `post-2.md`**

Mêmes conventions, `serie: angles-morts-ia (2/4)`, archetype `B (didactique structuré)`, body = Post 2 validé.

- [ ] **Step 7.4 : `post-3.md`**

`serie: angles-morts-ia (3/4)`, archetype `C (image / métaphore)`, body = Post 3 validé.

- [ ] **Step 7.5 : `post-4.md`**

`serie: angles-morts-ia (4/4)`, archetype `D (REX / expérimentation)`, `status: skeleton — bloqué sur REX kDrive`, body = Post 4 validé. Ajouter une note de tête :

```markdown
> **Statut :** squelette validé en design. Le contenu sera ajusté après l'expérimentation kDrive / kChat Infomaniak — verdict réel, points forts / points faibles, écart aux modèles frontière.
```

- [ ] **Step 7.6 : Voice grep sur les 4 posts**

```bash
# Emojis interdits
grep -rP "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]" docs/linkedin/published/2026-06-07-angles-morts-ia/
# #MrScaling
grep -r "MrScaling" docs/linkedin/published/2026-06-07-angles-morts-ia/
# Em-dashes
grep -r -- "—" docs/linkedin/published/2026-06-07-angles-morts-ia/
# Hashtags suspects (autres que dans les notes README)
grep -rE "^#[A-Z]" docs/linkedin/published/2026-06-07-angles-morts-ia/post-*.md
```

Expected : tous retournent vide (ou seul le README contient des `#` de titres markdown, normal).

- [ ] **Step 7.7 : Commit**

```bash
git add docs/linkedin/published/2026-06-07-angles-morts-ia/
git commit -m "feat(linkedin): série 'angles morts de l'IA' — 4 posts (post 4 squelette)"
```

---

## Task 8 : Verification finale + ship readiness — **DIFFÉRÉE AU JOUR DU SHIP**

**Objectif :** confirmer que tout l'asset evergreen est prêt à servir et que les posts sont prêts à programmer.

- [ ] **Step 8.1 : Build complet**

```bash
npm run build
```

Expected : build vert. Aucun warning sur prerender. Les routes `/outils/le-grand-filtre` et `/rapports/angles-morts-ia-entreprise-suisse` apparaissent dans la sortie.

- [ ] **Step 8.2 : Test SEO (manuel)**

Lancer le serveur de preview du build :

```bash
npm run preview
```

Ouvrir chrome devtools sur les deux URLs :
- `/outils/le-grand-filtre` → vérifier `<title>`, `<meta description>`, JSON-LD si applicable
- `/rapports/angles-morts-ia-entreprise-suisse` → idem + breadcrumb si présent

Tous les meta tags doivent être conformes au spec §4.3 et §5.4.

- [ ] **Step 8.3 : Vérifier que les liens internes ne sont pas cassés**

Depuis l'article pilier, vérifier que les liens vers `/outils/le-grand-filtre` fonctionnent. Depuis l'outil, vérifier que le lien vers `/rapports/angles-morts-ia-entreprise-suisse` fonctionne. Vérifier que le lien PDF `/downloads/le-grand-filtre.pdf` est servi en statique.

- [ ] **Step 8.4 : Sitemap**

Le sitemap est généré automatiquement par Nuxt. Vérifier après build :

```bash
grep -E "angles-morts|grand-filtre" .output/public/sitemap.xml 2>/dev/null || grep -E "angles-morts|grand-filtre" .output/public/__sitemap__/en.xml 2>/dev/null
```

Expected : les deux URLs apparaissent.

- [ ] **Step 8.5 : Sanity-check sur les memos / mémoire à mettre à jour**

Si le cycle s'avère concluant, prévoir de mettre à jour :
- `~/.claude/projects/-Users-mathieu-Documents-survivor/memory/project_survivant_ia_seo_positioning.md` (ajouter cluster "souveraineté IA" comme nouvel axe)
- `~/.claude/projects/-Users-mathieu-Documents-survivor/memory/MEMORY.md` (entrée pour la nouvelle catégorie `souverainete-ia`)

À faire après le ship effectif des posts, pas pendant l'implémentation.

- [ ] **Step 8.6 : Commit de fin et tag**

Pas de tag git nécessaire (pas de release versionnée). Confirmer qu'on est sur main et qu'on peut push :

```bash
git log --oneline -10
git status
```

- [ ] **Step 8.7 : Handoff Mathieu**

Préparer un récap court pour Mathieu :
- URLs en ligne (preview ou prod si déployé)
- Cadence proposée (J, J+1, J+2, J+X)
- Le post 4 reste bloqué — planifier l'expérimentation kDrive (créneau de quelques jours, process à passer à la moulinette)
- Mises à jour de mémoire à faire après ship effectif

---

## Notes d'implémentation

### Dépendances entre tasks

```
Task 1 (PDF source) ─┐
                     ├─> Task 3 (outil) ─┐
Task 2 (article) ────┘                   ├─> Task 4 (intégration code) ─> Task 5 (visual check) ─> Task 6 (analytics)
                                         └─> Task 7 (posts LinkedIn)              │
                                                                                   └─> Task 8 (verif finale)
```

Task 1 et 2 peuvent se faire en parallèle. Task 3 dépend de Task 1 (le PDF doit exister pour que le lien outro fonctionne). Task 4 dépend de Task 3. Task 5-6 dépendent de Task 4. Task 7 peut se faire en parallèle avec Task 4-5-6 (les posts ne touchent pas le code).

### Hors scope (rappel spec §11)

- Filtres interactifs / tri sur la matrice (v2)
- Questionnaire de diagnostic personnel (v2)
- Génération dynamique de PDF (v1 = statique)
- Versions DE / EN (à valider si trafic le justifie)
- Article pilier sur post 4 (le REX kDrive est sa propre histoire — peut devenir un mini-article séparé après l'expérimentation, mais c'est out of scope ici)

### Critères d'acceptation (rappel spec §10)

À cocher au moment du ship :

- [ ] Article pilier publié à `/rapports/angles-morts-ia-entreprise-suisse`, 4000-5000 mots, 8 sections complètes
- [ ] Outil publié à `/outils/le-grand-filtre`, 3 matrices, conditions a/b/c, section agents de codage, PDF téléchargeable
- [ ] Manifest et FAQs mis à jour, route préprendue ajoutée à `nuxt.config.ts`
- [ ] 4 posts LinkedIn nettoyés, dans `docs/linkedin/published/2026-06-07-angles-morts-ia/` (Posts 1-3 prêts, Post 4 squelette)
- [ ] Charte voix respectée (8 points), grep emojis et `#MrScaling` retournent vide
- [ ] Schema.org structuré sur article et outil (à valider en build local)
- [ ] Events PostHog instrumentés : `kit_view` (déjà en place), `kit_pdf_download` (à ajouter), `article_pilier_scroll_75` (à voir si infra existe)
