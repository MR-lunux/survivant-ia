# Pivot positioning : salariés → professionnels

**Date :** 2026-05-19
**Statut :** Validé · prêt pour implémentation
**Supersedes (partiellement) :** `2026-05-04-pivot-editorial-design.md` sur le seul axe « cible » et « tagline ». Le reste du pivot éditorial 2026-05-04 reste valide.

---

## 1. Contexte & diagnostic business

Le pivot éditorial du 2026-05-04 a établi `salarié non-tech, en poste` comme cible exclusive (allant jusqu'à interdire le mot « professionnels » dans la charte éditoriale).

**Diagnostic 2026-05-19 :** les salariés sont effectivement la bonne cible *lecteur* (newsletter, articles, scanner) mais sont une **mauvaise cible commerciale** pour les formations payantes annoncées « bientôt ». Raison : un salarié n'achète pas sa propre formation IA — il attend que sa boîte la finance. Les acheteurs réels seront freelances, indépendants, consultants, cadres avec budget formation perso, petits dirigeants. Tous se reconnaissent dans « professionnel », pas dans « salarié ».

**Conséquence :** on élargit la cible affichée à « professionnels ». La cible salarié reste incluse (les salariés sont aussi des professionnels), mais on cesse de la restreindre. La charte éditoriale qui interdisait « professionnels » doit être inversée.

---

## 2. Slogan canonique

> **Le repère des professionnels qui veulent rester pertinents face à l'IA pour en sortir gagnants.**

Décomposition voulue :
- **professionnels** : élargit la cible commerciale au-delà du salarié, sans l'exclure
- **rester pertinents face à l'IA** : promesse défensive, ancre le brand sur la pertinence
- **pour en sortir gagnants** : promesse offensive en queue, conserve la voix combative Survivant-IA, déclenche l'urgence d'achat

Note de débat (pour mémoire future) : « rester pertinents » a été préféré à « piloter pour en sortir gagnants ». Le head marketing avait flaggé que « rester pertinent » est défensif et passe le test « qui ne veut pas X ? » à toutes les cibles, donc différencie peu. Décision assumée par le fondateur. La queue « pour en sortir gagnants » compense en gardant l'arête offensive.

---

## 3. Hero (page d'accueil) — hiérarchie préservée

On conserve la hiérarchie actuelle du hero (option γ du brainstorming) : H1 petit (SEO), tagline géante (LCP), subtitle.

| Élément | Avant | Après |
|---|---|---|
| **H1** (`hero-h1`) | « Survivre à l'IA au travail, c'est apprendre à la piloter » | **Inchangé** (mot-clé brand préservé) |
| **Tagline** (`hero-tagline`) | « Le repère des salariés qui veulent maîtriser l'IA *pour en sortir gagnants.* » | **« Le repère des professionnels qui veulent rester pertinents face à l'IA *pour en sortir gagnants.* »** (l'italic d'accent reste sur « pour en sortir gagnants ») |
| **Subtitle** (`hero-subtitle`) | « Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité depuis dix ans. Voici les leviers pour devenir le salarié qui maîtrise l'IA mieux que les autres dans son équipe. Sans jargon, sans coder, sans formation de six mois. » | **« Tu sens que l'IA arrive sur ton métier. Tu as raison. Il y aura des gagnants et des perdants — et ça ne se jouera pas sur qui code le mieux, mais sur qui a compris à temps ce qui changeait dans son travail. C'est ce que tu trouves ici : des signaux clairs, une fois par semaine, pour passer de subir l'IA à garder le contrôle. »** |

Fichier : `app/pages/index.vue` (lignes ~50 à 60).

### Sous-titre des qcards (juste sous le hero)

| Élément | Avant | Après |
|---|---|---|
| `swiss-cta-eyebrow` & `swiss-cta-prompt` | inchangé | inchangé |

Pas de mention « salarié » dans les qcards (vérifié). Rien à modifier.

---

## 4. Section III — `HomeSkillsList.vue`

Périmètre : intro de section + corrections humanizer sur les 4 cards existantes (option II).

### Intro

| Élément | Avant | Après |
|---|---|---|
| Eyebrow | « Quatre compétences IA-proof » | **Inchangé** |
| H2 | « Devenir *indispensable*, pas remplaçable. » | **Inchangé** |
| Intro paragraph | « Quatre axes de travail concrets. Ce que les modèles de langage ne savent pas faire. Et ne sauront pas faire de sitôt. Ce que **personne ne va déléguer à un modèle**. » | « Quatre compétences que **personne ne déléguera à un modèle**. Quatre axes concrets pour devenir indispensable, pas remplaçable — sur lesquels tu peux travailler dès maintenant. » |

Note : le `<strong>` est déplacé sur « personne ne déléguera à un modèle » (continuité avec la version actuelle qui mettait en gras un fragment similaire). La nouvelle version finit sur une **action** (« sur lesquels tu peux travailler dès maintenant »), pas un constat.

### Cards — corrections humanizer

| Card | Champ | Avant | Après |
|---|---|---|---|
| **01** Pensée critique | body | (inchangé) | **Inchangé** |
| **02** Relation humaine | body | « …derrière ses mots. Aucun modèle de langage ne fait ça. **La confiance se construit humain à humain.** » | « …derrière ses mots. Aucun modèle ne fait ça. **La confiance ne se délègue pas à un modèle.** » |
| **03** Jugement contextuel | body | « L'IA optimise. Elle ne raisonne pas **en éthique, en contexte politique, en arbitrages d'équipe**. Quand le contexte est ambigu, c'est l'humain qui tranche, et c'est lui qu'on paie. » | « L'IA optimise. Elle ne raisonne pas **en éthique, ni en contexte politique**. Quand le contexte est ambigu, c'est l'humain qui tranche, et c'est lui qu'on paie. » |
| **04** Communication | body | « Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. **Communiquer engage un corps, un timing, une responsabilité** : c'est ça que personne ne délègue à un modèle. » | « Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. **Communiquer engage un corps et un risque.** Ça, personne ne le délègue à un modèle. » |

Fichier : `app/components/HomeSkillsList.vue` (lignes 3 à 32 dans l'array `skills` + lignes 38, 42-44 dans le template head).

---

## 5. Section V — `HomeFaq.vue`

Les questions Q4 et Q7 actuelles sont conservées intégralement parce qu'elles matchent des requêtes Google probables et contiennent des mots-clés brand (« survivre à l'IA au travail », « remplacer mon métier »). Les autres questions reçoivent des micro-ajustements éditoriaux. Le mot « salarié » dans la réponse Q4 est remplacé.

| # | Question — état final | Réponse — état final |
|---|---|---|
| 1 | « Comment ne pas se faire remplacer par l'IA dans son métier ? » (inchangé) | inchangée |
| 2 | « **Quelles** compétences développer face à l'IA ? » (suppression de « sont les ») | inchangée |
| 3 | « Faut-il se former à l'IA même **quand** on n'est pas dans la tech ? » (`si` → `quand`) | inchangée |
| 4 | « Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ? » (**conservée pour SEO brand**) | « En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir **le pro qui sait**. » (`le salarié qui sait` → `le pro qui sait`) |
| 5 | « C'est quoi « prendre le virage de l'IA »**,** concrètement ? » (virgule ajoutée) | inchangée |
| 6 | « Mon métier va-t-il vraiment être **transformé** par l'IA ? » (`remplacé` → `transformé`) | inchangée (la réponse parle déjà de transformation partielle, c'est cohérent) |
| 7 | « Combien de temps me reste-t-il avant que l'IA remplace mon métier ? » (**conservée pour SEO**) | inchangée (finit déjà sur de l'actionnable : « Plus tu prends le virage tôt, plus tu deviens celui qui pilote l'IA… ») |
| 8 | « C'est quoi la Fréquence Survivant-IA ? » (inchangée) | inchangée |

Note : Q1 conserve le keyword « remplacer » au niveau page, donc le sacrifier sur Q6 n'est pas un risque SEO majeur.

Fichier : `app/components/HomeFaq.vue` (array `faqs` lignes 3-36).

---

## 6. Métadonnées, OG, schema (toutes pages)

Toutes les descriptions « salariés » deviennent « professionnels ». Le verbe-méthode `piloter l'IA dans leur métier` est **conservé** dans les descriptions fonctionnelles (cohérent avec le H1 et le brand) ; `rester pertinents face à l'IA` est réservé au slogan canonique.

| Fichier | Ligne | Avant | Après |
|---|---|---|---|
| `app/app.vue` | 20 | `Le repère des salariés qui veulent piloter l'IA dans leur métier. Articles hebdomadaires…` | `Le repère des professionnels qui veulent piloter l'IA dans leur métier. Articles hebdomadaires…` |
| `app/app.vue` | 34 | `Survivre à l'IA au travail, c'est apprendre à la piloter. Un nouvel article chaque semaine pour les salariés non-tech, un diagnostic IA par métier.` | `Survivre à l'IA au travail, c'est apprendre à la piloter. Un nouvel article chaque semaine pour les professionnels non-tech, un diagnostic IA par métier.` |
| `app/pages/index.vue` | 5 (meta) | `Le repère des salariés qui veulent maîtriser l'IA pour en sortir gagnants. Un nouvel article chaque semaine…` | `Le repère des professionnels qui veulent rester pertinents face à l'IA pour en sortir gagnants. Un nouvel article chaque semaine…` |
| `app/pages/index.vue` | 14 (OG title) | `Le repère des salariés qui veulent maîtriser l'IA` | `Le repère des professionnels qui veulent rester pertinents face à l'IA` |
| `app/pages/index.vue` | 15 (OG titleAccent) | `pour en sortir gagnants.` | `pour en sortir gagnants.` (inchangé) |
| `app/pages/frequence.vue` | 5 | `…pour les salariés qui veulent maîtriser l'IA dans leur métier.` | `…pour les professionnels qui veulent piloter l'IA dans leur métier.` |
| `app/pages/rapports/index.vue` | 5 | `La veille hebdo des salariés…` | `La veille hebdo des professionnels…` |
| `app/pages/outils/index.vue` | 5 | `…pour les salariés non-tech…` | `…pour les professionnels non-tech…` |
| `app/pages/identite.vue` | 5 (meta) | `…aider les salariés à piloter l'IA…` | `…aider les professionnels à piloter l'IA…` |
| `app/pages/identite.vue` | 26 (founder description schema) | `Aide les salariés à piloter l'IA dans leur métier.` | `Aide les professionnels à piloter l'IA dans leur métier.` |

### OG image — régénération
Les images OG de la home utilisent `defineOgImage` avec `title` + `titleAccent`. Après la modif de `app/pages/index.vue:14-15`, les images OG seront automatiquement régénérées au prochain build. Vérifier après déploiement que le rendu OG est correct sur :
- `https://survivant-ia.ch/` (home)
- Partage LinkedIn/Twitter via debugger officiel

---

## 7. Page identité — copie marketing

| Fichier | Ligne | Avant | Après |
|---|---|---|---|
| `app/pages/identite.vue` | 133 | `Ce site existe pour les salariés qui voient l'IA arriver sans savoir comment se positionner…` | `Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se positionner…` |
| `app/pages/identite.vue` | 217 (mission) | `Aider les salariés à piloter l'IA dans leur métier avant de la subir.` | `Aider les professionnels à piloter l'IA dans leur métier avant de la subir.` |

---

## 8. Doc opérationnel à mettre à jour

`docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` est la charte qui guide la voix des nouveaux articles (référencée en mémoire). Elle est en contradiction frontale avec ce pivot.

| Ligne | Avant | Après |
|---|---|---|
| 73 | `Problème salarié réel → galère sans la bonne méthode…` | `Problème pro réel → galère sans la bonne méthode…` |
| 144 | `**Cible** : salarié non-tech en poste — éviter \`professionnels\`, \`gens\`, \`dirigeants\`` | `**Cible** : professionnel non-tech (salarié, indé, freelance, cadre, petit dirigeant) — préférer \`professionnel\` ou \`pro\` ; éviter \`gens\`, \`utilisateurs\`` |
| 265 | (passage exemple article — contient « simple valideur : un salarié dont la seule compétence active… ») | Conserver — c'est un exemple d'article cité, modifier dégraderait la cohérence avec l'article publié `content/rapports/2026-05-07-demence-numerique-simple-valideur.md` |

---

## 9. Ajustements de voix pour futurs contenus

La voix combative Survivant-IA est conservée intégralement. Deux nuances pour les futurs articles/posts :

| Réflexe à éviter | Réflexe à privilégier |
|---|---|
| « ton équipe », « tes collègues » comme défaut | À utiliser quand le contexte est clairement salarial ; ne pas systématiser (un indé n'a pas d'équipe). Alternative neutre : « ton entourage pro » |
| « ton boss », « ton manager » | À compléter par « tes clients » quand le contexte vise le pan freelance/indé |
| « le salarié qui sait » | « le pro qui sait » ou « celui qui sait » |

Mots-clés brand à **conserver intacts** : `survivre`, `piloter`, `sortir gagnant`, `Survivant-IA`. Le mot `rester pertinent` entre dans le vocabulaire brand via la tagline, mais **ne remplace pas** les verbes-clés ci-dessus dans le corps des contenus.

---

## 10. Hors scope (acté)

- `app/data/metier-content.ts` : mentions de « salariés » factuelles (taille d'entreprise réglementaire) — ne pas toucher
- `content/rapports/*.md` et `content/outils/*.md` : articles publiés, l'occurrence ponctuelle de « salarié » dans le corps reste légitime car cohérente avec le pan salarial (qui reste inclus)
- Specs projet historiques (`2026-05-04-pivot-editorial-design.md`, `2026-05-07-scanner-v2-design.md`, `2026-05-07-boite-a-outils-design.md`, `2026-05-09-scanner-seo-longtail-design.md`) : photos datées d'un état antérieur, ne pas réécrire
- Posts LinkedIn `docs/linkedin/published/*.md` : vérifié, aucune occurrence de « salarié(s) » comme cible
- H1 de la home : conservé pour SEO brand

---

## 11. Trade-offs actés (pour mémoire)

1. **Tagline plus longue** : 16 mots vs 14 avant. Acceptable, la phrase reste lisible.
2. **Tension défensif/offensif dans la tagline** : « rester pertinents » (défensif) + « pour en sortir gagnants » (offensif) — assumé. Le head marketing avait suggéré soit purement offensif (« piloter pour en sortir gagnants ») soit choix B&W. La forme retenue est un compromis qui inclut la promesse de pertinence (chère au fondateur) sans sacrifier l'arête commerciale.
3. **Sacrifice keyword Q6 FAQ** : `remplacé` → `transformé` peut faire perdre quelques requêtes mais Q1 conserve `remplacer`. Risque faible.
4. **« Professionnels » reste large** : risque de dilution brand vs « salariés » qui était hyper-niché. Compensé par le reste de la voix Survivant-IA qui reste tranchée.

---

## 12. Liste d'implémentation (tâches en ordre)

1. **Hero** — `app/pages/index.vue` lignes 5, 14, 53, 57-59 (meta, OG title, tagline, subtitle réécrit)
2. **App schema** — `app/app.vue` lignes 20, 34
3. **Pages secondaires meta** — `app/pages/frequence.vue` ligne 5, `app/pages/rapports/index.vue` ligne 5, `app/pages/outils/index.vue` ligne 5
4. **Page identité** — `app/pages/identite.vue` lignes 5, 26, 133, 217
5. **Section III** — `app/components/HomeSkillsList.vue` : intro (lignes 38, 42-44) + cards 02, 03, 04 (lignes 16, 23, 30)
6. **Section V** — `app/components/HomeFaq.vue` : array `faqs` (lignes 3-36)
7. **Charte éditoriale** — `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` lignes 73, 144
8. **Vérifications post-build** : `npm run build` puis grep `salari[éeè]` sur `app/` pour confirmer qu'aucune mention positioning ne reste (les mentions factuelles dans `metier-content.ts` doivent rester)
9. **Smoke test visuel** : `npm run dev`, vérifier hero, section III, FAQ, page identité, page fréquence, OG image

---

## 13. Post-implémentation

1. **Régénération OG image** — automatique au build. Vérifier le rendu via :
   - LinkedIn Post Inspector
   - Twitter Card Validator (si applicable)
2. **Demande de réindexation Google** — via Google Search Console :
   - `https://survivant-ia.ch/`
   - `https://survivant-ia.ch/frequence`
   - `https://survivant-ia.ch/rapports`
   - `https://survivant-ia.ch/outils`
   - `https://survivant-ia.ch/identite`
3. **Mise à jour mémoire** — actualiser :
   - `project_charte_editoriale_articles.md` (cible élargie)
   - `project_survivant_ia_seo_positioning.md` si nécessaire
   - Créer une nouvelle entry `project_positioning_professionnels.md` qui pointe vers ce spec et explique le pivot du 2026-05-19
