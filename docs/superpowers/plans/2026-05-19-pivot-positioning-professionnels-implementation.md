# Pivot positioning : salariés → professionnels — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la cible affichée « salariés » par « professionnels » sur l'ensemble du site (positioning + meta + OG + sections clés), réécrire la tagline canonique, appliquer des fixes humanizer sur la Section III, et mettre à jour la charte éditoriale.

**Architecture:** Edits ciblés sur 8 fichiers `.vue` + 1 doc `.md`. Aucun code nouveau. Chaque tâche = un fichier (ou un composant cohérent) → vérification par `grep` → commit atomique. Smoke test visuel final (Nuxt dev server).

**Tech Stack:** Nuxt 3 + Vue 3, `defineOgImage` pour OG, `useSeoMeta` pour les meta tags. Aucune dépendance ajoutée.

**Spec source:** `docs/superpowers/specs/2026-05-19-pivot-positioning-professionnels-design.md`

---

## File Structure

Fichiers modifiés (9 total) :

| Fichier | Responsabilité dans ce plan |
|---|---|
| `app/pages/index.vue` | Hero (H1 inchangé, tagline réécrite, subtitle réécrit) + meta + OG |
| `app/app.vue` | 2 descriptions schema.org (Organization + WebSite) |
| `app/pages/frequence.vue` | Meta description |
| `app/pages/rapports/index.vue` | Meta description |
| `app/pages/outils/index.vue` | Meta description |
| `app/pages/identite.vue` | Meta + founder schema + intro + mission |
| `app/components/HomeSkillsList.vue` | Intro section III + cards 02/03/04 (humanizer) |
| `app/components/HomeFaq.vue` | Array `faqs` : Q2/Q3/Q5/Q6 micro-edits + réponse Q4 (« salarié » → « pro ») |
| `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` | Lignes 73 et 144 |

Convention de commit (reprise du repo, voir `git log --oneline -10`) : conventional commits avec scope. On utilise `refactor(positioning):` pour tout ce plan.

---

## Task 1 : Hero index.vue — tagline, subtitle, meta, OG

**Files:**
- Modify: `app/pages/index.vue:5` (meta description)
- Modify: `app/pages/index.vue:14` (OG title)
- Modify: `app/pages/index.vue:53` (tagline)
- Modify: `app/pages/index.vue:56-60` (subtitle réécrit)

**Verify before:** `grep -n "salariés\|maîtriser l'IA" app/pages/index.vue` doit renvoyer 4 lignes minimum (5, 14, 53, 58).

- [ ] **Step 1 : Remplacer la meta description (ligne 5)**

Dans `app/pages/index.vue`, remplacer la ligne 5 :

Avant :
```
  description: 'Le repère des salariés qui veulent maîtriser l\'IA pour en sortir gagnants. Un nouvel article chaque semaine, sans jargon. Et un diagnostic IA par métier.',
```

Après :
```
  description: 'Le repère des professionnels qui veulent rester pertinents face à l\'IA pour en sortir gagnants. Un nouvel article chaque semaine, sans jargon. Et un diagnostic IA par métier.',
```

- [ ] **Step 2 : Remplacer le OG title (ligne 14)**

Avant :
```
  title: 'Le repère des salariés qui veulent maîtriser l\'IA',
```

Après :
```
  title: 'Le repère des professionnels qui veulent rester pertinents face à l\'IA',
```

Note : `titleAccent: 'pour en sortir gagnants.'` (ligne 15) reste **inchangé**.

- [ ] **Step 3 : Remplacer la tagline du hero (ligne 53)**

Avant :
```
          Le repère des salariés qui veulent maîtriser l'IA <span class="accent">pour en sortir gagnants.</span>
```

Après :
```
          Le repère des professionnels qui veulent rester pertinents face à l'IA <span class="accent">pour en sortir gagnants.</span>
```

- [ ] **Step 4 : Réécrire le subtitle (lignes 56-60)**

Avant :
```
        <p class="hero-subtitle">
          Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité depuis dix ans.
          Voici <strong>les leviers</strong> pour devenir le salarié qui maîtrise l'IA mieux que les autres dans son équipe.
          Sans jargon, sans coder, sans formation de six mois.
        </p>
```

Après :
```
        <p class="hero-subtitle">
          Tu sens que l'IA arrive sur ton métier. Tu as raison. Il y aura des gagnants et des perdants — et ça ne se jouera pas sur qui code le mieux, mais sur qui a compris à temps ce qui changeait dans son travail.
          C'est ce que tu trouves ici : <strong>des signaux clairs</strong>, une fois par semaine, pour passer de subir l'IA à garder le contrôle.
        </p>
```

- [ ] **Step 5 : Vérifier par grep**

Run :
```bash
grep -n "salariés\|maîtriser l'IA\|le salarié qui" app/pages/index.vue
```
Expected : aucun résultat (output vide).

Run :
```bash
grep -n "professionnels\|rester pertinents" app/pages/index.vue
```
Expected : au moins 3 lignes (5, 14, 53).

- [ ] **Step 6 : Commit**

```bash
git add app/pages/index.vue
git commit -m "refactor(positioning): nouvelle tagline pro + subtitle réécrit sur la home"
```

---

## Task 2 : App schema descriptions (app/app.vue)

**Files:**
- Modify: `app/app.vue:20` (Organization description)
- Modify: `app/app.vue:34` (WebSite description)

- [ ] **Step 1 : Remplacer la description Organization (ligne 20)**

Avant :
```
      description: 'Le repère des salariés qui veulent piloter l\'IA dans leur métier. Articles hebdomadaires, diagnostic IA par métier, et formations approfondies (bientôt) pour en sortir gagnants.',
```

Après :
```
      description: 'Le repère des professionnels qui veulent piloter l\'IA dans leur métier. Articles hebdomadaires, diagnostic IA par métier, et formations approfondies (bientôt) pour en sortir gagnants.',
```

- [ ] **Step 2 : Remplacer la description WebSite (ligne 34)**

Avant :
```
      description: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter. Un nouvel article chaque semaine pour les salariés non-tech, un diagnostic IA par métier.',
```

Après :
```
      description: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter. Un nouvel article chaque semaine pour les professionnels non-tech, un diagnostic IA par métier.',
```

- [ ] **Step 3 : Vérifier par grep**

Run :
```bash
grep -n "salariés" app/app.vue
```
Expected : aucun résultat.

- [ ] **Step 4 : Commit**

```bash
git add app/app.vue
git commit -m "refactor(positioning): schema descriptions salariés → professionnels"
```

---

## Task 3 : Meta descriptions des pages secondaires

**Files:**
- Modify: `app/pages/frequence.vue:5`
- Modify: `app/pages/rapports/index.vue:5`
- Modify: `app/pages/outils/index.vue:5`

- [ ] **Step 1 : `app/pages/frequence.vue` ligne 5**

Avant :
```
  description: 'Un nouvel article chaque semaine pour les salariés qui veulent maîtriser l\'IA dans leur métier. Gratuit, sans jargon, sans spam. 5 minutes de lecture.',
```

Après :
```
  description: 'Un nouvel article chaque semaine pour les professionnels qui veulent piloter l\'IA dans leur métier. Gratuit, sans jargon, sans spam. 5 minutes de lecture.',
```

- [ ] **Step 2 : `app/pages/rapports/index.vue` ligne 5**

Avant :
```
  description: 'La veille hebdo des salariés qui veulent piloter l\'IA dans leur métier : soft skills, comprendre l\'IA, cas pratiques. Sans jargon, sans coder.',
```

Après :
```
  description: 'La veille hebdo des professionnels qui veulent piloter l\'IA dans leur métier : soft skills, comprendre l\'IA, cas pratiques. Sans jargon, sans coder.',
```

- [ ] **Step 3 : `app/pages/outils/index.vue` ligne 5**

Avant :
```
  description: 'Tests, calculateurs, cheatsheets pour les salariés non-tech qui veulent piloter l\'IA dans leur métier. Gratuit, sans inscription, résultats privés.',
```

Après :
```
  description: 'Tests, calculateurs, cheatsheets pour les professionnels non-tech qui veulent piloter l\'IA dans leur métier. Gratuit, sans inscription, résultats privés.',
```

- [ ] **Step 4 : Vérifier par grep**

Run :
```bash
grep -n "salariés" app/pages/frequence.vue app/pages/rapports/index.vue app/pages/outils/index.vue
```
Expected : aucun résultat.

- [ ] **Step 5 : Commit**

```bash
git add app/pages/frequence.vue app/pages/rapports/index.vue app/pages/outils/index.vue
git commit -m "refactor(positioning): meta descriptions frequence/rapports/outils"
```

---

## Task 4 : Page identité (4 spots)

**Files:**
- Modify: `app/pages/identite.vue:5` (meta description)
- Modify: `app/pages/identite.vue:26` (founder description schema)
- Modify: `app/pages/identite.vue:133` (intro)
- Modify: `app/pages/identite.vue:217` (mission)

- [ ] **Step 1 : Meta description (ligne 5)**

Avant :
```
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et l\'immobilier. Le parcours de Mathieu Rerat et l\'esprit derrière Survivant-IA : aider les salariés à piloter l\'IA dans leur métier.',
```

Après :
```
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et l\'immobilier. Le parcours de Mathieu Rerat et l\'esprit derrière Survivant-IA : aider les professionnels à piloter l\'IA dans leur métier.',
```

- [ ] **Step 2 : Founder description (ligne 26)**

Avant :
```
          description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les salariés à piloter l\'IA dans leur métier.',
```

Après :
```
          description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les professionnels à piloter l\'IA dans leur métier.',
```

- [ ] **Step 3 : Intro (ligne 133)**

Avant :
```
        <p>Ce site existe pour les salariés qui voient l'IA arriver sans savoir comment se positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais aimé avoir et éviter les erreurs que j'ai faites.</p>
```

Après :
```
        <p>Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais aimé avoir et éviter les erreurs que j'ai faites.</p>
```

- [ ] **Step 4 : Mission (ligne 217)**

Avant :
```
        <p>Aider les salariés à <em>piloter l'IA</em> dans leur métier <em>avant</em> de la subir.</p>
```

Après :
```
        <p>Aider les professionnels à <em>piloter l'IA</em> dans leur métier <em>avant</em> de la subir.</p>
```

- [ ] **Step 5 : Vérifier par grep**

Run :
```bash
grep -n "salariés\|salarié" app/pages/identite.vue
```
Expected : aucun résultat.

- [ ] **Step 6 : Commit**

```bash
git add app/pages/identite.vue
git commit -m "refactor(positioning): page identité salariés → professionnels (meta, schema, intro, mission)"
```

---

## Task 5 : HomeSkillsList — intro + cards 02/03/04 (humanizer)

**Files:**
- Modify: `app/components/HomeSkillsList.vue:16` (card 02 body)
- Modify: `app/components/HomeSkillsList.vue:23` (card 03 body)
- Modify: `app/components/HomeSkillsList.vue:30` (card 04 body)
- Modify: `app/components/HomeSkillsList.vue:42-44` (intro paragraph)

- [ ] **Step 1 : Card 02 body (ligne 16)**

Avant :
```javascript
    body: "Désamorcer un conflit, motiver une équipe, comprendre ce qu'un client veut vraiment derrière ses mots. Aucun modèle de langage ne fait ça. La confiance se construit humain à humain.",
```

Après :
```javascript
    body: "Désamorcer un conflit, motiver une équipe, comprendre ce qu'un client veut vraiment derrière ses mots. Aucun modèle ne fait ça. La confiance ne se délègue pas à un modèle.",
```

- [ ] **Step 2 : Card 03 body (ligne 23)**

Avant :
```javascript
    body: "L'IA optimise. Elle ne raisonne pas en éthique, en contexte politique, en arbitrages d'équipe. Quand le contexte est ambigu, c'est l'humain qui tranche, et c'est lui qu'on paie.",
```

Après :
```javascript
    body: "L'IA optimise. Elle ne raisonne pas en éthique, ni en contexte politique. Quand le contexte est ambigu, c'est l'humain qui tranche, et c'est lui qu'on paie.",
```

- [ ] **Step 3 : Card 04 body (ligne 30)**

Avant :
```javascript
    body: "Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. Communiquer engage un corps, un timing, une responsabilité : c'est ça que personne ne délègue à un modèle.",
```

Après :
```javascript
    body: "Une IA rédige. Elle ne défend pas un budget devant un comité, ne porte pas une mauvaise nouvelle à une équipe, ne convainc pas un sceptique en face-à-face. Communiquer engage un corps et un risque. Ça, personne ne le délègue à un modèle.",
```

- [ ] **Step 4 : Intro paragraph (lignes 42-44)**

Avant :
```vue
      <p class="skills-intro">
        Quatre axes de travail concrets. Ce que les modèles de langage ne savent pas faire. Et ne sauront pas faire de sitôt. Ce que <strong>personne ne va déléguer à un modèle</strong>.
      </p>
```

Après :
```vue
      <p class="skills-intro">
        Quatre compétences que <strong>personne ne déléguera à un modèle</strong>. Quatre axes concrets pour devenir indispensable, pas remplaçable — sur lesquels tu peux travailler dès maintenant.
      </p>
```

- [ ] **Step 5 : Vérifier par grep**

Run :
```bash
grep -n "humain à humain\|en arbitrages d'équipe\|un corps, un timing" app/components/HomeSkillsList.vue
```
Expected : aucun résultat.

- [ ] **Step 6 : Commit**

```bash
git add app/components/HomeSkillsList.vue
git commit -m "refactor(positioning): section III humanizer pass + intro orientée action"
```

---

## Task 6 : HomeFaq — Q2/Q3/Q4/Q5/Q6 micro-edits

**Files:**
- Modify: `app/components/HomeFaq.vue` array `faqs` (lignes 3-36)

Cinq questions reçoivent des changements (Q1, Q7, Q8 inchangées).

- [ ] **Step 1 : Q2 — alléger la question (ligne 9)**

Avant :
```javascript
    q: "Quelles sont les compétences à développer face à l'IA ?",
```

Après :
```javascript
    q: "Quelles compétences développer face à l'IA ?",
```

- [ ] **Step 2 : Q3 — `si` → `quand` (ligne 13)**

Avant :
```javascript
    q: "Faut-il se former à l'IA même si on n'est pas dans la tech ?",
```

Après :
```javascript
    q: "Faut-il se former à l'IA même quand on n'est pas dans la tech ?",
```

- [ ] **Step 3 : Q4 — réponse, mot final (ligne 18)**

Avant :
```javascript
    a: "En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir le salarié qui sait.",
```

Après :
```javascript
    a: "En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir le pro qui sait.",
```

Note : la **question** Q4 (« Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ? », ligne 17) reste **inchangée** pour préserver le keyword brand.

- [ ] **Step 4 : Q5 — virgule (ligne 21)**

Avant :
```javascript
    q: "C'est quoi « prendre le virage de l'IA » concrètement ?",
```

Après :
```javascript
    q: "C'est quoi « prendre le virage de l'IA », concrètement ?",
```

- [ ] **Step 5 : Q6 — `remplacé` → `transformé` (ligne 25)**

Avant :
```javascript
    q: "Mon métier va-t-il vraiment être remplacé par l'IA ?",
```

Après :
```javascript
    q: "Mon métier va-t-il vraiment être transformé par l'IA ?",
```

Note : la **réponse** Q6 reste inchangée — elle parle déjà de transformation partielle, c'est cohérent.

- [ ] **Step 6 : Vérifier par grep**

Run :
```bash
grep -n "Quelles sont les compétences\|même si on n'est pas\|le salarié qui sait\|» concrètement\|être remplacé par l'IA ?" app/components/HomeFaq.vue
```
Expected : aucun résultat.

Run :
```bash
grep -n "Comment survivre à l'IA au travail\|Combien de temps me reste-t-il" app/components/HomeFaq.vue
```
Expected : 2 lignes (Q4 et Q7 conservées).

- [ ] **Step 7 : Commit**

```bash
git add app/components/HomeFaq.vue
git commit -m "refactor(positioning): FAQ micro-edits + mot \"salarié\" remplacé dans réponse Q4"
```

---

## Task 7 : Charte éditoriale articles (doc opérationnel)

**Files:**
- Modify: `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md:73`
- Modify: `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md:144`

- [ ] **Step 1 : Ligne 73**

Avant :
```
Problème salarié réel → galère sans la bonne méthode → pas-à-pas concret avec exemples → garde-fous (« attention à »).
```

Après :
```
Problème pro réel → galère sans la bonne méthode → pas-à-pas concret avec exemples → garde-fous (« attention à »).
```

- [ ] **Step 2 : Ligne 144**

Avant :
```
- **Cible** : salarié non-tech en poste — éviter `professionnels`, `gens`, `dirigeants`
```

Après :
```
- **Cible** : professionnel non-tech (salarié, indé, freelance, cadre, petit dirigeant) — préférer `professionnel` ou `pro` ; éviter `gens`, `utilisateurs`
```

Note : ligne 265 (extrait d'article cité « simple valideur ») reste inchangée — modifier dégraderait la cohérence avec l'article publié `content/rapports/2026-05-07-demence-numerique-simple-valideur.md`.

- [ ] **Step 3 : Vérifier par grep**

Run :
```bash
grep -n "Problème salarié\|Cible.*salarié non-tech en poste" docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md
```
Expected : aucun résultat.

- [ ] **Step 4 : Commit**

```bash
git add docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md
git commit -m "docs(charte): cible élargie aux professionnels (pivot 2026-05-19)"
```

---

## Task 8 : Vérifications globales + smoke test

**Files:**
- Aucune modif. Pure vérification.

- [ ] **Step 1 : Grep global — aucune mention positioning « salarié » restante**

Run :
```bash
grep -rn "salariés\|salarié" app/components/ app/pages/ app/app.vue 2>/dev/null | grep -v "metier-content.ts" | grep -v "// "
```
Expected : aucun résultat (les seules occurrences restantes doivent être dans `app/data/metier-content.ts` qui est factuel et hors scope).

- [ ] **Step 2 : Grep — confirmer présence de « professionnels » partout où attendu**

Run :
```bash
grep -rn "professionnels" app/ | grep -v node_modules
```
Expected : au minimum 11 lignes (index.vue x3, app.vue x2, frequence/rapports/outils/identite.vue, HomeSkillsList).

- [ ] **Step 3 : Build local pour vérifier qu'on ne casse rien**

Run :
```bash
npm run build
```
Expected : build success, aucune erreur TypeScript ou Vue.

- [ ] **Step 4 : Smoke test visuel — dev server**

Run :
```bash
npm run dev
```

Ouvrir `http://localhost:3000` et vérifier visuellement :

1. **Home (`/`)** :
   - H1 inchangé : « Survivre à l'IA au travail, c'est apprendre à la piloter »
   - Tagline géante : « Le repère des professionnels qui veulent rester pertinents face à l'IA *pour en sortir gagnants.* » (l'italic accent sur la queue)
   - Subtitle : version « Il y aura des gagnants et des perdants… »
   - Section III : intro « Quatre compétences que personne ne déléguera… », cards 02/03/04 avec les nouveaux wordings
   - Section V FAQ : 8 questions, ouvrir Q4 pour vérifier « le pro qui sait » à la fin de la réponse, ouvrir Q5/Q6 pour les autres edits
2. **`/identite`** : intro « Ce site existe pour les professionnels… », mission « Aider les professionnels à *piloter l'IA*… »
3. **`/frequence`, `/rapports`, `/outils`** : pages chargent normalement (les meta ne sont pas visibles à l'œil mais l'absence d'erreur console suffit)

- [ ] **Step 5 : Smoke test OG (optionnel, à faire après déploiement)**

Après push en prod, vérifier via LinkedIn Post Inspector que l'image OG de `https://survivant-ia.ch/` reflète bien le nouveau titre « Le repère des professionnels qui veulent rester pertinents face à l'IA ».

URL Inspector : `https://www.linkedin.com/post-inspector/`

- [ ] **Step 6 : Pas de commit (tâche de vérification)**

---

## Task 9 : Post-implémentation — reminders

Aucune modif code/contenu. Liste de rappels à exécuter après le déploiement.

- [ ] **Step 1 : Demande de réindexation Google Search Console**

Aller sur `https://search.google.com/search-console/`, project `survivant-ia.ch`, et soumettre pour réindexation :
- `https://survivant-ia.ch/`
- `https://survivant-ia.ch/frequence`
- `https://survivant-ia.ch/rapports`
- `https://survivant-ia.ch/outils`
- `https://survivant-ia.ch/identite`

- [ ] **Step 2 : Mise à jour mémoire Claude (`~/.claude/projects/-Users-mathieu-Documents-survivor/memory/`)**

Actions :
1. Créer `project_positioning_professionnels.md` qui pointe vers ce spec et résume le pivot 2026-05-19
2. Mettre à jour `project_charte_editoriale_articles.md` : cible n'est plus « salarié non-tech en poste » mais « professionnel non-tech (salarié inclus, + indé/freelance/cadre/petit dirigeant) »
3. Vérifier si `project_survivant_ia_seo_positioning.md` mentionne « salariés » comme cible — si oui, le mettre à jour

Demander à Claude (cette session ou future) : *« mets à jour la mémoire pour refléter le pivot positioning professionnels du 2026-05-19, spec dans docs/superpowers/specs/ »*

- [ ] **Step 3 : Pas de commit (rappels post-déploiement)**

---

## Self-Review (checklist auteur)

**Spec coverage :**
- §2 slogan canonique → Task 1 ✓
- §3 Hero (H1/tagline/subtitle) → Task 1 ✓
- §4 Section III (intro + cards 02/03/04) → Task 5 ✓
- §5 Section V FAQ (Q2/Q3/Q4 réponse/Q5/Q6) → Task 6 ✓
- §6 Metadata/OG/schema (9 lignes sur 6 fichiers) → Tasks 1, 2, 3, 4 ✓
- §7 Page identité (corps + mission) → Task 4 ✓
- §8 Charte éditoriale → Task 7 ✓
- §9 Ajustements de voix futurs → documenté dans le spec, pas une tâche code ✓
- §10 Hors scope → respecté (Task 8 step 1 exclut `metier-content.ts`) ✓
- §12 Liste d'implémentation → Tasks 1-7 couvrent les 9 étapes ✓
- §13 Post-implémentation → Task 9 ✓

**Placeholder scan :** aucun TBD, TODO, "implement later". Chaque step contient l'exact avant/après. ✓

**Type consistency :** N/A (pas de code TS/JS nouveau). Les chaînes citées sont cohérentes entre tasks (la tagline canonique apparaît à l'identique dans Task 1 step 3 et Task 1 step 2). ✓
