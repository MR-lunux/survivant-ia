# Spec — Les angles morts de l'IA en entreprise suisse

Date : 2026-06-07
Status : design validé, prêt à passer en plan
Auteur : Mathieu Rerat / Claude
Source matière : `~/Downloads/Guide_IA_donnees_immobilier_nLPD_secret_affaires_final.docx` (guide aide à la décision interne, client immobilier S&F, version 2026-06-05)

## 1. Intention

Produire un cycle éditorial autour de la sécurité de l'IA en Suisse — LPD, secret d'affaires, Cloud Act, FINMA — pour ouvrir une nouvelle zone de positionnement Survivant-IA : la souveraineté de l'IA en entreprise. Le cycle s'articule autour d'un asset evergreen (article pilier + outil cheatsheet) et d'une série de 4 posts LinkedIn qui le distribuent.

L'angle éditorial unifiant : **les angles morts de l'utilisation de l'IA**. Le mot "sécurisé" est jeté à toutes les sauces par les éditeurs, alors qu'il recouvre trois choses distinctes qui ne se recoupent pas (conformité réglementaire, protection du secret d'affaires, résidence des données). L'asset central met ces angles morts en lumière de manière scannable.

## 2. Audience

| Cible | Statut | Voix |
|---|---|---|
| Dirigeants / DPO / responsables IT de PME suisses régulées (finance, immobilier, santé) | Primaire | exécutive, substance dense |
| Indépendants et cadres qui utilisent l'IA au travail sans mesurer le risque pour leur boîte ou leurs clients | Secondaire (sensibilisation) | accessible, didactique |

L'angle "angles morts" sert les deux : la cible primaire découvre des nuances qu'elle croyait avoir résolues (Conformité ≠ secret d'affaires), la cible secondaire prend conscience d'un risque qu'elle ignorait.

## 3. Architecture du cycle

```
┌─────────────────────────────────────────────────────────────┐
│  ASSET EVERGREEN (toujours en ligne)                        │
│  ┌────────────────────────┐    ┌────────────────────────┐  │
│  │ Article pilier          │←──→│ Outil "le grand filtre"│  │
│  │ /rapports/angles-morts… │    │ /outils/le-grand-filtre│  │
│  └────────────────────────┘    └────────────────────────┘  │
└──────────────────────▲──────────────────────────────────────┘
                       │
            ┌──────────┴───────────┐
            │  4 posts LinkedIn    │
            │  J / J+1 / J+2 / J+X │
            └──────────────────────┘
```

Chaque post pointe vers l'asset evergreen. L'asset evergreen survit aux posts (décroissance LinkedIn ≈ 48h) et continue de capter du SEO.

## 4. Article pilier

**Slug** : `angles-morts-ia-entreprise-suisse`
**Path** : `content/rapports/angles-morts-ia-entreprise-suisse.md`
**Titre** : Les angles morts de l'IA en entreprise suisse
**Description** : LPD, secret d'affaires, Cloud Act. Ce que les éditeurs ne te disent pas quand ils vendent "leur IA sécurisée". Sept angles morts à vérifier avant de connecter une donnée client à un modèle.
**Kicker** : `LECTURE LONGUE · 12 MIN`
**Catégorie** : `souverainete-ia` (nouvelle catégorie à introduire)
**Status** : `published`
**Maintainer** : `human`

### 4.1 Cluster SEO

Nouveau cluster "souveraineté IA" qui s'ajoute aux clusters existants (action, résilience cognitive). Cluster mots-clés :

- Principal : `ia entreprise suisse LPD`
- Secondaires : `chatgpt enterprise suisse conformité`, `cloud act ia suisse`, `outil ia souverain suisse`, `secret d'affaires ia`, `finma ia externalisation`, `LPD chatgpt`

### 4.2 Structure (8 sections)

1. **Le mot "sécurisé" ne veut rien dire** — intro. Trois sens distincts, jamais explicités.
2. **Conformité ≠ secret d'affaires** — angle mort majeur. ChatGPT Enterprise est conforme LPD mais le Cloud Act vide quand même ton secret. Cas d'école.
3. **L'arbre de décision** — les 5 questions du doc, dépliées avec exemples concrets.
4. **La matrice des verdicts** — version narrative (la matrice complète vit dans l'outil, l'article résume et renvoie).
5. **Les 7 angles morts** — un par un, chacun avec un exemple court :
   1. Conformité ≠ secret d'affaires
   2. Anonymisation ≠ pseudonymisation
   3. Plans grand public (Pro/Max) — entraînement par défaut
   4. Agents de codage — héritent du backend
   5. Self-host ≠ automatiquement souverain (VPS étranger = retour Cloud Act)
   6. Niveau "Bon" Azure/Bedrock CH illusoire sans HYOK + TEE + exemption journal
   7. Résidence UE ≠ protection Cloud Act
6. **Le cas des agents de codage** — section dédiée pour audience C (indé, cadres tech). Claude Code, Antigravity, Copilot, Cursor — l'agent vaut ce que vaut son backend.
7. **Et alors, qu'est-ce qu'on fait ?** — checklist déploiement (DPA, TIA, AIPD, registre, mesures techniques, FINMA si applicable).
8. **Glossaire et limites** — pas un conseil juridique, à valider avec un juriste, le marché évolue.

### 4.3 Format et rédaction

- Pilier long : 4000-5000 mots
- Archetype A+C dominant (cadre transformatif + tactiques concrètes)
- Mode rédac A : Mathieu draft → Claude copyedit chirurgical → Mathieu remix final
- Voix : Mathieu le Survivant de l'IA, lucide, sec. Pas de jargon juridique sans glossaire inline.
- Charte de voix §3-4 appliquée strictement (négation complète, em-dashes interdits, emojis interdits, anti-patterns AI)
- Pas d'invention factuelle : sourcer la LPD (art. 9), la FINMA Circ. 2018/3, le Swiss-US DPF (15 sept 2024), la LCD art. 6, le CP art. 162.

## 5. Outil "le grand filtre" (matrice statique)

**Slug** : `le-grand-filtre`
**Code** : `le-grand-filtre`
**Path** : `content/outils/le-grand-filtre.md`
**Route** : `/outils/le-grand-filtre`
**Kind** : `cheatsheet` (premier outil à utiliser ce type — déjà prévu dans le manifest)
**parentArticleSlug** : `angles-morts-ia-entreprise-suisse`
**Titre** : Le grand filtre
**Subtitle** : La matrice qui croise conformité LPD, secret d'affaires et réalité opérationnelle pour 7 catégories d'outils IA.
**Specs** (cards header) :
- "7 OUTILS"
- "3 DIMENSIONS"
- "MATRICE CONSULTABLE"
- "PDF TÉLÉCHARGEABLE"

### 5.1 Page layout

Hero standard (KickerLabel `KIT · LE GRAND FILTRE`, titre, subtitle, specs cards).

Bloc intro court (3-4 lignes) : comment lire la matrice, à qui elle s'adresse, ce qu'elle ne remplace pas.

**Matrice 1 — Conformité LPD**
Colonnes : Outil / Résidence / DPA / No-train / Verdict
Lignes : ChatGPT perso, ChatGPT Team/Enterprise, API OpenAI + ZDR, Azure OpenAI (CH North), AWS Bedrock (Zurich), Infomaniak AI (API), Self-host (Ollama/on-prem)

**Matrice 2 — Secret d'affaires & souveraineté**
Colonnes : Outil / CMK / Cloud Act / Verdict
Mêmes 7 lignes.

**Matrice 3 — Réalité opérationnelle**
Colonnes : Outil / Point d'attention (texte long)
Mêmes 7 lignes.

**Section conditions** : a / b / c (transfert US, niveau "Bon" Azure/Bedrock, self-host) dépliées sous les matrices.

**Section agents de codage** : Claude Code, Antigravity, Copilot, Cursor, Codex — rattachement aux lignes de la matrice + 2 règles spécifiques (périmètre, accès local).

**Légende verdicts** : codes couleurs sobres via CSS (points colorés ou badges), jamais d'emoji. Vert = conforme / risque faible, orange = sous conditions, rouge = non / risque élevé.

**Bouton télécharger PDF** : le PDF original du guide, hébergé en statique dans `public/downloads/le-grand-filtre.pdf`. Pas de génération dynamique en v1.

Outro de l'outil : lien vers article pilier + CTA La Fréquence.

### 5.2 Pas de filtres interactifs en v1

Décision explicite : la matrice est consultable, scannable, indexable Google. Pas de tri / filtre par profil / questionnaire. Si l'engagement le justifie, v2 ajoute filtres ou diagnostic personnel.

### 5.3 Intégration code

Checklist d'ajout d'un nouvel outil (selon header de `app/data/outils-manifest.ts`) :

1. `content/outils/le-grand-filtre.md` — frontmatter + intro + outro + matrices en YAML `data:` ou en markdown tables
2. `app/data/outils-manifest.ts` — nouvelle entrée OUTILS_MANIFEST
3. `app/data/outil-ctas.ts` — CTA override si voulu (sinon défaut = article pilier)
4. `app/data/outil-faqs.ts` — FAQs spécifiques (3-5 questions courantes)
5. `nuxt.config.ts` → `nitro.prerender.routes` — ajouter `/outils/le-grand-filtre`
6. `app/pages/outils/[slug].vue` — pas de composant Kit dédié (kind `cheatsheet` se rend via le template par défaut, à vérifier)
7. `public/downloads/le-grand-filtre.pdf` — copier le PDF source

### 5.4 SEO de l'outil

- Title ≤ 60 caractères : "Le grand filtre · matrice sécurité IA en entreprise suisse"
- Description : "Matrice qui croise conformité LPD, secret d'affaires et souveraineté pour 7 catégories d'outils IA. Gratuit, consultable, PDF téléchargeable."
- Schema.org `HowTo` ou `Table` (à arbitrer en plan)

## 6. Série LinkedIn (4 posts)

Voix Survivant-IA, tutoiement, charte appliquée. Pas de hashtags, pas d'emojis, bullets `-`.

### 6.1 Post 1 — origin / le grand filtre (Jour J)

```
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

CTA 1er commentaire : `https://survivant-ia.ch/outils/le-grand-filtre`
CTA 2e commentaire : `https://survivant-ia.ch/rapports/angles-morts-ia-entreprise-suisse`

### 6.2 Post 2 — Shadow IT / LPD (J+1)

```
Ne copie JAMAIS les données d'un client dans le ChatGPT gratuit. Jamais.

C'est la règle numéro 1. Et c'est pourtant le cauchemar quotidien des directions IT que je croise.

On veut gagner du temps. On demande à l'IA de résumer le dossier d'un locataire, de trier des fiches de paie, de rédiger un mail RH.

Avec un compte gratuit, ou même un abonnement Plus individuel, tu paies avec ces données. Le modèle s'entraîne dessus. C'est une fuite caractérisée, et une violation directe de la LPD.

Pour être en règle, il n'y a pas 36 solutions. Trois conditions à cocher :

1. Un abonnement B2B (ChatGPT Enterprise, Copilot 365) ou un passage par l'API.
2. Une garantie contractuelle "zéro entraînement" sur tes prompts.
3. Un DPA (Data Processing Agreement) signé avec le fournisseur.

Tant que ces trois conditions ne sont pas posées, tes données personnelles sont dans la nature.

Le grand filtre que j'ai partagé hier classe les outils selon ce standard. Lien en premier commentaire.

Mais respecter la LPD ne protège pas ton secret d'affaires. Demain, j'explique pourquoi.
```

CTA 1er commentaire : `https://survivant-ia.ch/outils/le-grand-filtre`
CTA 2e commentaire : `https://survivant-ia.ch/rapports/angles-morts-ia-entreprise-suisse`

### 6.3 Post 3 — Cloud Act / coffre-clé (J+2)

```
Imagine un coffre-fort construit en Suisse, avec des matériaux suisses. Mais la seule clé est confiée à une entreprise américaine.

C'est exactement ce que font beaucoup de boîtes avec leurs données stratégiques (stratégie de fonds, M&A, secrets de fabrication).

Elles choisissent des serveurs physiquement basés en Suisse, comme Azure Switzerland North. Elles se disent : "C'est en Suisse, c'est LPD compliant, on est tranquilles."

Faux.

Si l'entreprise qui opère ces serveurs est américaine, elle reste soumise au US Cloud Act. Sur simple injonction d'un juge américain, elle peut être contrainte de déchiffrer tes données et de les livrer. Adieu le secret d'affaires.

La parade technique s'appelle le CMK (Customer-Managed Keys). En pratique : tu utilises leur puissance de calcul en Suisse, mais c'est toi qui apportes tes propres clés de chiffrement. Si on leur demande tes données, ils ne peuvent fournir qu'une bouillie indéchiffrable.

Ton outil actuel gère le CMK ? Vérifie dans le grand filtre, lien en premier commentaire.

Demain, pour clore la série : la voie haute, le self-host souverain, et le test que je m'apprête à lancer pour voir si on peut faire plus simple.
```

CTA 1er commentaire : `https://survivant-ia.ch/outils/le-grand-filtre`
CTA 2e commentaire : `https://survivant-ia.ch/rapports/angles-morts-ia-entreprise-suisse`

### 6.4 Post 4 — kDrive Infomaniak (J+X, bloqué sur REX)

```
Le moyen le plus sûr d'utiliser l'IA en Suisse demande beaucoup trop d'efforts. Alors je cherche une alternative.

On l'a vu cette semaine : pour une sécurité maximale (zéro risque Cloud Act, conformité LPD complète), la voie la plus solide est le self-host. Un modèle open source (Llama 3, Mistral) qui tourne sur un VPS chez un hébergeur 100% suisse. Aucune frontière traversée, aucune entreprise étrangère dans la boucle.

Sauf que techniquement, c'est lourd.

Il faut gérer l'infra, durcir la sécurité serveur, payer la puissance GPU. Pour une PME ou un projet interne, ce n'est pas toujours tenable.

Je cherchais un entre-deux. Une solution packagée, souveraine, hébergée en Suisse, sans la maintenance d'un serveur dédié.

C'est là que je vais tester l'intégration IA de kDrive et kChat chez Infomaniak.

Hébergement local, modèles souverains, chiffrement, prêt à l'emploi. Sur le papier ça coche les cases. Reste à voir en conditions réelles. Je passe l'outil à la moulinette sur mes propres process dans les prochains jours, et je publie le retour.

Qui ici a déjà testé leur IA au quotidien ? Preneur de tes retours en commentaires.

Le grand filtre (qui inclut kDrive et les autres souverains) est en premier commentaire.
```

CTA 1er commentaire : `https://survivant-ia.ch/outils/le-grand-filtre`
CTA 2e commentaire : invitation explicite La Fréquence — "le REX complet sur kDrive part dans La Fréquence cette semaine, inscris-toi → `/frequence`"

Le post est un squelette validé. Le contenu réel (verdict kDrive, points forts / points faibles, écart au modèle frontière) sera ajusté après l'expérimentation.

### 6.5 Cadence

| Post | Jour | Dépendance |
|---|---|---|
| Post 1 | Jour J | Article pilier + outil en ligne |
| Post 2 | J+1 | Aucune (réutilise asset existant) |
| Post 3 | J+2 | Aucune |
| Post 4 | J+X (X = 7 à 15 jours) | Expérimentation kDrive complète |

Posts 1-3 en jours consécutifs : maintient la dynamique de série, capture les vues répétées. Post 4 décroche pour laisser le temps du REX honnête. Le cliff-hanger du post 3 ("le test que je m'apprête à lancer") tient même avec un délai.

## 7. CTA et funnel

| Élément | Sert | Mesure |
|---|---|---|
| Posts LinkedIn | Trafic vers asset evergreen | clics 1er commentaire (matrice) + 2e commentaire (article) |
| Outil matrice | Capture le pro qui cherche une réponse rapide, prouve la valeur | événement `kit_view` + téléchargements PDF |
| Article pilier | Capture le pro qui cherche du fond, support du SEO long-tail | scroll-depth, temps de lecture, conversion newsletter |
| La Fréquence (newsletter) | Conversion #1, transformation visiteur → abonné | inscriptions issues des landings outil et article |

Le post 4 introduit un funnel inversé sur la conversion newsletter (CTA explicite "le REX complet part dans La Fréquence") — c'est le post le plus chargé conversion, justifié par la curiosité construite sur 3 posts.

## 8. Voix et anti-patterns appliqués

Charte de voix Survivant-IA (`docs/charte-voix.md`) appliquée à toute la copy. Synthèse en 8 points pour la série :

1. **Voix Mathieu** — chaque phrase signable Mathieu, pas un autre auteur
2. **Différenciation** — ChatGPT ne pourrait pas écrire l'angle "angles morts" à un autre auteur
3. **Hook → tension → résolution** — première ligne porte la promesse, chaque post tient
4. **Zéro emoji** dans tous les `.md`
5. **Em-dash interdit** — `:` ou `,`
6. **Négation française complète** — `je ne suis pas`, jamais `je suis pas`
7. **Anti-patterns AI** — pas de signposting, attributions floues, inflation, conclusions positives génériques
8. **Casse concepts coined** en minuscules : `le grand filtre` dans la copy, `Le grand filtre` en titre de page (sentence case)

`#MrScaling` retiré, hashtags supprimés intégralement (alignement sur post "comment écrire un prompt" publié).

## 9. Risques et limites

| Risque | Mitigation |
|---|---|
| Le doc source est marqué "aide à la décision interne" client S&F | Reformulé en générique, retrait des références client. Le doc original n'est pas distribué tel quel ; le PDF téléchargeable est une version dépolluée. |
| Sujet juridique : risque de mauvaise interprétation par un lecteur | Disclaimer explicite dans l'article et dans l'outil : pas un conseil juridique, à valider avec un juriste. Présent dans le doc source, à conserver. |
| Évolution rapide du marché (DPF, certifications, options souveraines) | Date de dernière révision affichée dans l'outil. Frontmatter `dateModified`. Process de relecture semestrielle. |
| Post 4 bloqué sur REX kDrive | Cliff-hanger du post 3 tient un délai 1-2 semaines. Si REX décevant, post 4 reste honnête (REX = REX, pas pub). |
| Nouveau cluster "souveraineté IA" — déconnecté du cluster 2 SEO (action) | Le cluster souveraineté complète, ne remplace pas. Mémoire `project_survivant_ia_seo_positioning.md` à mettre à jour si l'expérience est concluante. |

## 10. Critères d'acceptation

- [ ] Article pilier publié à `/rapports/angles-morts-ia-entreprise-suisse`, 4000-5000 mots, 8 sections complètes
- [ ] Outil publié à `/outils/le-grand-filtre`, 3 matrices, conditions a/b/c, section agents de codage, PDF téléchargeable
- [ ] Manifest et FAQs mis à jour, route préprendue ajoutée à `nuxt.config.ts`
- [ ] 4 posts LinkedIn nettoyés, dans `docs/linkedin/published/2026-06-XX-angles-morts-ia/post-1.md` à `post-4.md` (Posts 1-3 prêts, Post 4 squelette)
- [ ] Charte voix respectée (8 points), grep emojis et `#MrScaling` retournent vide
- [ ] Schema.org structuré sur article et outil
- [ ] Évènements PostHog instrumentés : `kit_view`, `kit_pdf_download`, `article_pilier_scroll_75`

## 11. Hors scope (v1)

- Filtres interactifs sur la matrice (envisagé v2 si engagement justifie)
- Questionnaire de diagnostic personnel (envisagé v2)
- Génération dynamique du PDF (v1 = PDF statique)
- Versions traduites (DE/EN) — envisagé si trafic suisse alémanique le justifie
- Schéma `JuridicalArticle` ou variant (à valider en plan)

## 12. Dépendances

- Doc source : `~/Downloads/Guide_IA_donnees_immobilier_nLPD_secret_affaires_final.docx` (à dépolluer du contexte S&F)
- Expérimentation kDrive : à planifier, blocage Post 4 jusqu'à complétion
- Validation juridique : optionnelle mais recommandée — Mathieu garde la main sur les phrases sensibles
