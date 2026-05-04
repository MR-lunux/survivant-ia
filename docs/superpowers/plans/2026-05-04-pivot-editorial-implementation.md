# Pivot éditorial Survivant-IA — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire pivoter toute la copie du site Survivant-IA d'un registre défensif (« ne pas se faire remplacer ») vers un registre transformatif (« apprendre à piloter l'IA »), introduire un bandeau de trajectoire qui pose le contrat éditorial dès la home, rééquilibrer la page Identité (autorité > persona).

**Architecture:** Modifications de copie dans 8 composants/pages Nuxt + création d'un nouveau composant `HomeMastheadTrajectoire`. Aucun changement de logique ni de schéma de données. Renumérotation cosmétique des `HomeMasthead` dans `index.vue`. Page Identité réorganisée (PARCOURS remonté avant le narratif).

**Tech Stack:** Nuxt 4, Vue 3 (Composition API + `<script setup>`), Tailwind CSS 3, Nuxt Content. Pas de framework de tests unitaires : la vérification se fait via (1) grep des mots interdits, (2) `nuxt build` (compile check), (3) revue visuelle dans le navigateur via `npm run dev`.

**Spec source:** `docs/superpowers/specs/2026-05-04-pivot-editorial-design.md`

**Hors scope:** Sous-projet 2 (Scanner v2 — algorithme `potential`, matrice 4 statuts, refonte écran de résultat) et sous-projet 3 (compteurs Rapports vides, autres clean-ups) sont planifiés séparément.

---

## Conventions appliquées dans tout le plan

Les règles suivantes (cf. spec §6) s'appliquent à **toutes** les copies modifiées par ce plan :

1. **Pas d'em-dash `—`.** Remplacer par `:` (définition) ou `,` (incise).
2. **Pas de `méthode`** dans la nouvelle copie.
3. **Pas de `chevaucher`** ni `chevaucher la vague`.
4. **Pas de `mardi`** ni autre jour de la semaine.
5. Verbes prioritaires : `piloter`, `maîtriser`, `s'en servir`, `prendre le virage`.
6. Cible : `salarié(s)` quand le contexte le permet (au lieu de `gens` / `professionnels`).
7. Tutoiement maintenu.

Une vérification globale par `grep` est exécutée à la fin (Task 11).

---

## Pré-flight — baseline & dev server

**Files:** none

- [ ] **Step 1: Baseline des mots interdits avant modifications**

Run depuis `/Users/mathieu/Documents/survivor` :
```bash
echo "=== em-dash —" && grep -rn "—" app/ --include="*.vue" --include="*.ts" | wc -l
echo "=== méthode" && grep -rni "méthode" app/ --include="*.vue" --include="*.ts" | wc -l
echo "=== chevauch" && grep -rni "chevauch" app/ --include="*.vue" --include="*.ts" | wc -l
echo "=== mardi" && grep -rni "mardi" app/ --include="*.vue" --include="*.ts" | wc -l
echo "=== variable supprimée" && grep -rni "variable supprimée" app/ --include="*.vue" --include="*.ts" | wc -l
```

Note les compteurs : ils doivent baisser à 0 (sauf em-dashes éventuellement présents dans des fichiers hors scope du pivot ; à recompter en fin de plan dans les fichiers modifiés uniquement).

- [ ] **Step 2: Démarrer le dev server (en arrière-plan)**

```bash
npm run dev
```
Attendre que Nuxt affiche `Local: http://localhost:3000`. Vérifier que la home s'ouvre sans erreur de console.

- [ ] **Step 3: Confirmer la baseline visuelle**

Ouvre `http://localhost:3000` et `http://localhost:3000/identite`. Note dans une feuille les éléments-clés (H1, baseline footer, signature manifeste). Cette baseline servira au check final.

---

## Task 1: Créer le composant `HomeMastheadTrajectoire.vue`

Strip horizontal minimaliste qui pose le contrat éditorial entre le hero et la section Manifeste. Pas de logique, pur affichage.

**Files:**
- Create: `app/components/HomeMastheadTrajectoire.vue`

- [ ] **Step 1: Créer le fichier avec le contenu suivant**

```vue
<!-- app/components/HomeMastheadTrajectoire.vue -->
<template>
  <section class="trajectoire" aria-label="Trajectoire éditoriale">
    <div class="container">
      <p class="trajectoire-line">
        <span class="trajectoire-segment">Un nouvel article chaque semaine</span>
        <span class="trajectoire-sep" aria-hidden="true">·</span>
        <span class="trajectoire-segment">Formations approfondies pour aller plus loin <span class="trajectoire-soon">(bientôt)</span></span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.trajectoire {
  border-top: 1px solid var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  padding: 1.6rem 0;
  background: var(--color-bg);
}

.trajectoire-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.6rem 1.1rem;
  margin: 0;
  font-family: var(--font-sans);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text);
  text-align: center;
}

.trajectoire-segment {
  white-space: nowrap;
}

.trajectoire-sep {
  color: var(--color-accent);
  font-weight: 400;
}

.trajectoire-soon {
  color: var(--color-muted);
  font-weight: 500;
  letter-spacing: 0.1em;
}

@media (max-width: 600px) {
  .trajectoire { padding: 1.25rem 0; }
  .trajectoire-line {
    font-size: 0.68rem;
    gap: 0.4rem 0.8rem;
  }
  .trajectoire-segment { white-space: normal; }
  .trajectoire-sep { display: none; }
}
</style>
```

- [ ] **Step 2: Vérifier la compilation**

```bash
npx nuxt prepare
```
Expected: pas d'erreur. Le composant est auto-importé par Nuxt grâce à son emplacement dans `app/components/`.

- [ ] **Step 3: Commit**

```bash
git add app/components/HomeMastheadTrajectoire.vue
git commit -m "feat(home): nouveau composant HomeMastheadTrajectoire (bandeau de contrat éditorial)"
```

---

## Task 2: Hero — H1, baseline, paragraphe, cartes, métadonnées (`pages/index.vue`)

Cinq blocs à modifier dans `app/pages/index.vue` : `useSeoMeta`, `defineOgImage`, le `<h1>`, le `<p class="hero-tagline">`, le `<p class="hero-subtitle">`, et les copies des deux cartes (eyebrow, prompt, qcard 01, qcard 02).

**Files:**
- Modify: `app/pages/index.vue:3-16` (meta) + `app/pages/index.vue:50-95` (hero markup)

- [ ] **Step 1: Mettre à jour `useSeoMeta` (lignes 3-11)**

Remplace le bloc :
```ts
useSeoMeta({
  title: 'Se former à l\'IA, ne pas se faire remplacer | Survivant-IA',
  description: '1 rapport gratuit / semaine pour ne pas te faire remplacer par l\'IA. Compétences, astuces, cas concrets, sans jargon. Bonus : scanner par métier.',
  ogTitle: 'Se former à l\'IA pour ne pas se faire remplacer - Survivant-IA',
  ogDescription: '1 rapport par semaine pour ne pas te faire remplacer par l\'IA. Gratuit, sans jargon. Et un scanner d\'obsolescence par métier.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Se former à l\'IA pour ne pas se faire remplacer',
  twitterDescription: '1 rapport par semaine pour prendre le virage de l\'IA. Gratuit, sans jargon. Survivant-IA.',
})
```

par :
```ts
useSeoMeta({
  title: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter | Survivant-IA',
  description: 'Le repère des salariés qui veulent maîtriser l\'IA pour en sortir gagnants. Un nouvel article chaque semaine, sans jargon. Bonus : diagnostic IA par métier.',
  ogTitle: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  ogDescription: 'Un nouvel article chaque semaine pour piloter l\'IA dans ton métier. Gratuit, sans jargon. Et un diagnostic IA par métier.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  twitterDescription: 'Un nouvel article chaque semaine pour piloter l\'IA dans ton métier. Gratuit, sans jargon. Survivant-IA.',
})
```

- [ ] **Step 2: Mettre à jour `defineOgImage` (lignes 13-16)**

Remplace :
```ts
defineOgImage('Default', {
  title: 'Comment ne pas se faire remplacer par l\'IA',
  kicker: '// ZONE ANTI-OBSOLESCENCE',
})
```

par :
```ts
defineOgImage('Default', {
  title: 'Survivre à l\'IA au travail, c\'est apprendre à la piloter',
  kicker: '// ZONE DE PILOTAGE',
})
```

- [ ] **Step 3: Remplacer le H1 (ligne 50)**

Remplace :
```html
<h1 class="hero-h1">Comment ne pas se faire remplacer par l'IA</h1>
```

par :
```html
<h1 class="hero-h1">Survivre à l'IA au travail, c'est apprendre à la piloter</h1>
```

⚠️ Garde le casing tel quel (les caps visuelles sont gérées par CSS si besoin ; pour l'instant le H1 est en mode discret/SEO d'après `font-size: clamp(1.05rem, 2vw, 1.35rem)`). Le H1 reste en sentence-case dans le HTML.

- [ ] **Step 4: Remplacer la baseline (`hero-tagline`, lignes 52-54)**

Remplace :
```html
<p class="hero-tagline">
  L'IA arrive. <span class="accent">Ne soyez pas une variable supprimée.</span>
</p>
```

par :
```html
<p class="hero-tagline">
  Le repère des salariés qui veulent maîtriser l'IA <span class="accent">pour en sortir gagnants.</span>
</p>
```

(Le `.accent` met en italique sage la fin de la phrase, conformément au pattern brand. La virgule de l'incise est conservée naturellement.)

- [ ] **Step 5: Remplacer le paragraphe d'intro (`hero-subtitle`, lignes 56-60)**

Remplace :
```html
<p class="hero-subtitle">
  Tu sens que l'IA arrive sur ton métier. Tu as raison.
  Voici les compétences à développer pour <strong>prendre le virage</strong>, pas pour le subir.
  Soft skills, compréhension de l'IA, cas pratiques concrets, sans jargon.
</p>
```

par :
```html
<p class="hero-subtitle">
  Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité depuis dix ans.
  Voici <strong>les leviers</strong> pour devenir le salarié qui maîtrise l'IA mieux que les autres dans son équipe.
  Sans jargon, sans coder, sans formation de six mois.
</p>
```

- [ ] **Step 6: Mettre à jour le `swiss-cta-prompt` (ligne 64)**

Remplace :
```html
<p class="swiss-cta-prompt">Tu te poses laquelle de ces deux questions&nbsp;?</p>
```

par :
```html
<p class="swiss-cta-prompt">Par où veux-tu commencer&nbsp;?</p>
```

- [ ] **Step 7: Réécrire la carte 01 — Newsletter (lignes 67-80)**

Remplace tout le bloc `<NuxtLink to="#newsletter" ...>...</NuxtLink>` par :

```html
<NuxtLink to="#newsletter" class="qcard" data-attr="hero-cta-newsletter" @click="onHomeCta('newsletter')">
  <span class="qcard-num">01 / Newsletter hebdomadaire</span>
  <div class="qcard-icon">
    <svg viewBox="0 0 56 56" class="ic-soundwave" aria-hidden="true">
      <circle class="ring ring-1" cx="28" cy="28" r="4"/>
      <circle class="ring ring-2" cx="28" cy="28" r="4"/>
      <circle class="ring ring-3" cx="28" cy="28" r="4"/>
      <circle class="core" cx="28" cy="28" r="3"/>
    </svg>
  </div>
  <h3 class="qcard-question">Veux-tu prendre <strong>une longueur d'avance</strong>&nbsp;?</h3>
  <p class="qcard-meta">La Fréquence : un nouvel article chaque semaine, 5 minutes de lecture, dans ta boîte.</p>
  <span class="qcard-arrow">Rejoindre la Fréquence (gratuit)</span>
</NuxtLink>
```

(Le `<strong>` met en accent sage le bénéfice, comme pour la carte avant.)

- [ ] **Step 8: Réécrire la carte 02 — Scanner (lignes 82-94)**

Remplace tout le bloc `<NuxtLink to="/scanner" ...>...</NuxtLink>` par :

```html
<NuxtLink to="/scanner" class="qcard" data-attr="hero-cta-scanner" @click="onHomeCta('scanner')">
  <span class="qcard-num">02 / Diagnostic flash</span>
  <div class="qcard-icon">
    <svg viewBox="0 0 56 56" class="ic-hourglass" aria-hidden="true">
      <path class="frame" d="M 14 8 L 42 8 M 14 48 L 42 48 M 16 8 L 16 14 L 28 26 M 40 8 L 40 14 L 28 26 M 28 30 L 16 42 L 16 48 M 28 30 L 40 42 L 40 48"/>
      <path class="sand-top" d="M 17 10 L 39 10 L 28 26 Z"/>
      <path class="sand-bot" d="M 28 30 L 39 46 L 17 46 Z"/>
    </svg>
  </div>
  <h3 class="qcard-question">Veux-tu cartographier <strong>l'IA dans ton métier</strong>&nbsp;?</h3>
  <p class="qcard-meta">Le Scanner : diagnostic IA en 10 secondes. Gratuit.</p>
  <span class="qcard-arrow">Tester mon métier</span>
</NuxtLink>
```

⚠️ Note importante : la mention « Sans email, sans inscription » est volontairement supprimée (cf. spec §3 décision Carte 02). Elle a été remplacée par « Gratuit ».

- [ ] **Step 9: Vérifier dans le navigateur**

Recharge `http://localhost:3000`. Vérifie :
- H1 (petit, gris) : « Survivre à l'IA au travail, c'est apprendre à la piloter »
- Baseline (gros, serif) : « Le repère des salariés qui veulent maîtriser l'IA *pour en sortir gagnants.* » (italique sage sur la fin)
- Paragraphe : commence par « Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité… »
- Prompt : « Par où veux-tu commencer ? »
- Carte 01 question : « Veux-tu prendre une longueur d'avance ? »
- Carte 02 question : « Veux-tu cartographier l'IA dans ton métier ? »
- Pas d'erreur de console.

- [ ] **Step 10: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(home): pivot hero (H1 piloter, baseline gagnants, cartes Choisis ton entrée)"
```

---

## Task 3: Insertion du bandeau de trajectoire + renumérotation HomeMasthead (`pages/index.vue`)

Insère le composant `HomeMastheadTrajectoire` juste après le hero (avant `<HomeMasthead num="II">`), puis renumérote III/IV/V (suppression du saut II → IV).

**Files:**
- Modify: `app/pages/index.vue:99-138`

- [ ] **Step 1: Insérer le bandeau juste après la fermeture du hero**

Localise la ligne `</section>` qui ferme `<section class="hero">` (ligne ~98). Juste après, **avant** le commentaire `<!-- ── MASTHEAD II — MANIFESTE ─────────────── -->`, insère :

```html
    <!-- ── BANDEAU DE TRAJECTOIRE ──────────────── -->
    <HomeMastheadTrajectoire />

```

- [ ] **Step 2: Renuméroter `HomeMasthead num="IV"` → `num="III"` (Compétences IA-proof, ligne ~118)**

Remplace :
```html
<HomeMasthead num="IV" title="Compétences IA-proof" meta="Ce que les modèles ne savent pas faire" />
```

par :
```html
<HomeMasthead num="III" title="Compétences IA-proof" meta="Ce que les modèles ne savent pas faire" />
```

Mets aussi à jour le commentaire de section juste au-dessus :
```html
<!-- ── MASTHEAD III — COMPÉTENCES ───────────── -->
```

- [ ] **Step 3: Renuméroter `HomeMasthead num="V"` → `num="IV"` (Rapports, ligne ~128)**

Remplace :
```html
<HomeMasthead num="V" :title="'Rapports de Survie'" meta="MAJ hebdomadaire" />
```

par :
```html
<HomeMasthead num="IV" :title="'Rapports de Survie'" meta="MAJ hebdomadaire" />
```

Mets aussi à jour le commentaire :
```html
<!-- ── MASTHEAD IV — RAPPORTS ───────────────── -->
```

- [ ] **Step 4: Renuméroter `HomeMasthead num="VI"` → `num="V"` (FAQ, ligne ~138)**

Remplace :
```html
<HomeMasthead num="VI" title="Questions fréquentes" meta="Les réponses avant que tu ne demandes" />
```

par :
```html
<HomeMasthead num="V" title="Questions fréquentes" meta="Les réponses avant que tu ne demandes" />
```

Mets aussi à jour le commentaire :
```html
<!-- ── MASTHEAD V — FAQ ───────────────────── -->
```

- [ ] **Step 5: Vérifier l'ordre dans le navigateur**

Recharge `http://localhost:3000`. Vérifie en scrollant :
1. Hero
2. Bandeau de trajectoire (strip avec `Un nouvel article chaque semaine · Formations approfondies pour aller plus loin (bientôt)`)
3. II — Manifeste
4. Diagnostic IA (sans num)
5. III — Compétences IA-proof
6. IV — Rapports de Survie
7. V — Questions fréquentes
8. NewsletterForm

Aucun saut de numéro dans la séquence II → III → IV → V.

- [ ] **Step 6: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(home): insertion bandeau trajectoire + renumérotation Mastheads (II/III/IV/V)"
```

---

## Task 4: Manifeste — paragraphe + signature (`HomeManifesteEditorial.vue`)

Le composant a deux éléments à modifier : le `<p class="manifeste-quote">` et le `<p class="manifeste-byline">`.

**Files:**
- Modify: `app/components/HomeManifesteEditorial.vue:5-10`

- [ ] **Step 1: Remplacer le quote (lignes 5-7)**

Remplace :
```html
<p class="manifeste-quote">
  Tu vois l'IA arriver dans ton job. Tu ne sais pas comment te positionner. Tu n'es pas seul. Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine. <span class="accent">Prépare-toi avant que ça arrive.</span>
</p>
```

par :
```html
<p class="manifeste-quote">
  Tu vois l'IA arriver dans ton job. Tu ne sais pas comment te positionner. Tu n'es pas seul. Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est un signal pratique pour t'en servir avant les autres, une fois par semaine. <span class="accent">Pose ton avantage maintenant, pendant que c'est encore ouvert.</span>
</p>
```

- [ ] **Step 2: Remplacer la signature (lignes 8-10)**

Remplace :
```html
<p class="manifeste-byline">
  - <strong>Mathieu, le Survivant de l'IA</strong> · Fondateur · survivant-ia.ch
</p>
```

par :
```html
<p class="manifeste-byline">
  - <strong>Mathieu, Deputy Head of IT</strong> · 9 ans en transformation digitale · Fondateur de Survivant-IA
</p>
```

- [ ] **Step 3: Vérifier dans le navigateur**

Recharge `http://localhost:3000` et scroll jusqu'au Manifeste (section II). Vérifie :
- Le quote se termine par « *Pose ton avantage maintenant, pendant que c'est encore ouvert.* » (italique sage).
- La signature affiche « **Mathieu, Deputy Head of IT** · 9 ans en transformation digitale · Fondateur de Survivant-IA ».
- Pas d'em-dash dans le quote.

- [ ] **Step 4: Commit**

```bash
git add app/components/HomeManifesteEditorial.vue
git commit -m "feat(manifeste): pivot signal pratique + signature Deputy Head of IT"
```

---

## Task 5: Diagnostic IA — titre, sous-titre, CTA (`HomeDiagnosticTeaser.vue`)

Reformulation neutre A3 : on ne préempte pas Scanner v2. On change uniquement le verbe défensif et le wording du CTA. Les champs RISQUE/HORIZON/STATUT/SUJET et le statut redact « EN MUTATION SÉVÈRE » restent inchangés (ils seront refaits dans le sous-projet 2).

**Files:**
- Modify: `app/components/HomeDiagnosticTeaser.vue:11-12,49`

- [ ] **Step 1: Remplacer le H2 (ligne 11)**

Remplace :
```html
<h2 id="diag-heading" class="diag-h2">Survivre à l'IA au travail commence par un diagnostic</h2>
```

par :
```html
<h2 id="diag-heading" class="diag-h2">Maîtriser l'IA au travail commence par un diagnostic</h2>
```

- [ ] **Step 2: Remplacer le `diag-lead` (ligne 12)**

Remplace :
```html
<p class="diag-lead">Scanne ton métier - découvre ton score d'obsolescence en 10 secondes.</p>
```

par :
```html
<p class="diag-lead">Scanne ton métier : diagnostic IA en 10 secondes.</p>
```

- [ ] **Step 3: Remplacer le label du CTA (ligne 49)**

Remplace :
```html
<span>Tester son obsolescence</span>
```

par :
```html
<span>Lancer le diagnostic</span>
```

- [ ] **Step 4: Vérifier dans le navigateur**

Recharge la home et scroll jusqu'à la section Diagnostic IA. Vérifie :
- Titre : « Maîtriser l'IA au travail commence par un diagnostic »
- Lead : « Scanne ton métier : diagnostic IA en 10 secondes. »
- CTA (vert sage) : « ▶ LANCER LE DIAGNOSTIC »
- La carte rapport (champs RISQUE / HORIZON / STATUT) reste inchangée — c'est attendu (sous-projet 2).

- [ ] **Step 5: Commit**

```bash
git add app/components/HomeDiagnosticTeaser.vue
git commit -m "feat(diagnostic): pivot maîtriser + CTA Lancer le diagnostic (A3 neutre)"
```

---

## Task 6: Rapports de Survie — titre (`RapportsBookshelf.vue`)

Une seule ligne à changer : le H2 au-dessus de la grille de catégories.

**Files:**
- Modify: `app/components/RapportsBookshelf.vue:79-81`

- [ ] **Step 1: Remplacer le H2 (lignes 79-81)**

Remplace :
```html
<h2 id="rapports-heading" class="rapports-title">
  La veille hebdo <em>pour prendre le virage de l'IA</em>.
</h2>
```

par :
```html
<h2 id="rapports-heading" class="rapports-title">
  La veille hebdo <em>pour passer de subir l'IA à la piloter</em>.
</h2>
```

(Le `<em>` met en italique sage la promesse, comme dans la version d'origine.)

- [ ] **Step 2: Vérifier dans le navigateur**

Recharge la home et scroll jusqu'à la section IV — Rapports de Survie. Le titre doit afficher « La veille hebdo *pour passer de subir l'IA à la piloter*. »

- [ ] **Step 3: Commit**

```bash
git add app/components/RapportsBookshelf.vue
git commit -m "feat(rapports): pivot titre veille (subir → piloter)"
```

---

## Task 7: FAQ — H2 + 5 réponses réécrites (`HomeFaq.vue`)

Le H2 visible (`Questions fréquentes sur le remplacement par l'IA.`) devient `Questions fréquentes sur l'IA au travail.`. Les questions Q1-Q8 dans le tableau JS restent inchangées (SEO), mais 5 réponses (Q1, Q4, Q6, Q7, Q8) sont réécrites. Q2, Q3, Q5 restent telles quelles.

**Files:**
- Modify: `app/components/HomeFaq.vue:3-36,55-56`

- [ ] **Step 1: Remplacer la réponse Q1 (lignes 5-6)**

Localise l'objet `{ q: "Comment ne pas se faire remplacer par l'IA dans son métier ?", a: "..." }` (premier item du tableau `faqs`).

Remplace la valeur de `a` par :
```ts
a: "Trois leviers concrets : (1) maîtriser ce que l'IA fait mal, la précision du langage, le contexte humain, le jugement ; (2) utiliser l'IA comme un copilote pour automatiser ce qui te ralentit ; (3) renforcer ton relationnel, ta stratégie et ton jugement éthique, c'est là que ta valeur devient irremplaçable. Bref : tu ne luttes pas contre l'IA, tu apprends à t'en servir mieux que les autres.",
```

- [ ] **Step 2: Q2 et Q3 inchangées**

Skip Q2 (« Quelles sont les compétences à développer face à l'IA ? ») et Q3 (« Faut-il se former à l'IA même si on n'est pas dans la tech ? ») : déjà alignées sur le pivot.

- [ ] **Step 3: Remplacer la réponse Q4 (lignes 17-18)**

Localise `{ q: "Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ?", a: "..." }`.

Remplace la valeur de `a` par :
```ts
a: "En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir le salarié qui sait.",
```

- [ ] **Step 4: Q5 inchangée**

Skip Q5 (« C'est quoi "prendre le virage de l'IA" concrètement ? »).

- [ ] **Step 5: Remplacer la réponse Q6 (lignes 25-26)**

Localise `{ q: "Mon métier va-t-il vraiment être remplacé par l'IA ?", a: "..." }`.

Remplace la valeur de `a` par :
```ts
a: "Probablement pas en entier. Mais certaines tâches le seront, et certaines deviendront au contraire beaucoup plus précieuses (celles où tu pilotes l'IA au lieu de la subir). Lance le diagnostic Survivant-IA : il croise les rapports 2026 (Tufts, McKinsey, WEF) pour estimer l'impact de l'IA sur ton métier en 10 secondes.",
```

- [ ] **Step 6: Remplacer la réponse Q7 (lignes 29-30)**

Localise `{ q: "Combien de temps me reste-t-il avant que l'IA remplace mon métier ?", a: "..." }`.

Remplace la valeur de `a` par :
```ts
a: "Variable selon le métier : 2-3 ans pour les tâches répétitives et déjà numérisées (saisie, traduction basique, rédaction standard) ; 5-10 ans pour les tâches d'analyse et de coordination ; quasi jamais pour les tâches qui combinent jugement humain, relation et contexte. Le diagnostic te donne une estimation par métier. Plus tu prends le virage tôt, plus tu deviens celui qui pilote l'IA dans ton équipe, au lieu de la subir.",
```

- [ ] **Step 7: Remplacer la réponse Q8 (lignes 33-34)**

Localise `{ q: "C'est quoi la Fréquence Survivant-IA ?", a: "..." }`.

Remplace la valeur de `a` par :
```ts
a: "Une newsletter hebdomadaire gratuite : un nouvel article par semaine, 5 minutes de lecture, sans jargon. Concret, terrain, pas de théorie. Et bientôt : des formations approfondies pour ceux qui veulent aller plus loin.",
```

- [ ] **Step 8: Remplacer le H2 visible (ligne 56)**

Remplace :
```html
<h2 id="faq-heading" class="faq-h2" data-reveal>
  Questions fréquentes sur le <em>remplacement par l'IA</em>.
</h2>
```

par :
```html
<h2 id="faq-heading" class="faq-h2" data-reveal>
  Questions fréquentes sur <em>l'IA au travail</em>.
</h2>
```

- [ ] **Step 9: Vérifier dans le navigateur**

Recharge la home et scroll jusqu'à la section V — Questions fréquentes. Vérifie :
- H2 : « Questions fréquentes sur *l'IA au travail*. » (italique sage sur la fin)
- Ouvre Q1 : la réponse termine par « tu apprends à t'en servir mieux que les autres. »
- Ouvre Q8 : mention « bientôt : des formations approfondies » présente.
- Aucun em-dash visible dans les réponses.

- [ ] **Step 10: Vérifier le JSON-LD FAQPage**

Le `faqJsonLd` (ligne 38-46) est régénéré dynamiquement à partir des `faqs`. Recharge la page et vérifie via DevTools (Elements → `<head>` → script `application/ld+json`) que les nouvelles réponses apparaissent dans le JSON-LD.

- [ ] **Step 11: Commit**

```bash
git add app/components/HomeFaq.vue
git commit -m "feat(faq): pivot 5 réponses + H2 (Q1, Q4, Q6, Q7, Q8 réécrites)"
```

---

## Task 8: Newsletter form — H2 + sous-titre (`NewsletterForm.vue`)

Le `<span class="newsletter-eyebrow">La Fréquence</span>` reste inchangé. Le H2 et le `<p class="newsletter-lead">` changent.

**Files:**
- Modify: `app/components/NewsletterForm.vue:7-14`

- [ ] **Step 1: Remplacer le H2 (lignes 7-10)**

Remplace :
```html
<h2 id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
  Reste un <em>cran devant</em>.<br>
  <strong>Une lettre par semaine.</strong>
</h2>
```

par :
```html
<h2 id="newsletter-heading" class="newsletter-h2" data-reveal data-reveal-delay="1">
  Reste un <em>cran devant</em>.<br>
  <strong>Un nouvel article chaque semaine.</strong>
</h2>
```

- [ ] **Step 2: Remplacer le lead (lignes 11-14)**

Remplace :
```html
<p class="newsletter-lead" data-reveal data-reveal-delay="2">
  Cinq minutes de lecture, le mardi. Sans hype, sans funnel, sans sponsor.
  Que des outils que j'utilise vraiment.
</p>
```

par :
```html
<p class="newsletter-lead" data-reveal data-reveal-delay="2">
  Cinq minutes de lecture, sans hype, sans funnel, sans sponsor.
  Que des outils et signaux que j'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).
</p>
```

- [ ] **Step 3: Vérifier dans le navigateur**

Recharge la home et scroll tout en bas (avant le footer). Vérifie :
- Eyebrow : « La Fréquence » (inchangé)
- H2 : « Reste un *cran devant*. **Un nouvel article chaque semaine.** »
- Lead : pas de mention « le mardi », mention « (bientôt) » présente.

- [ ] **Step 4: Commit**

```bash
git add app/components/NewsletterForm.vue
git commit -m "feat(newsletter): article hebdo (sans mardi) + mention formations (bientôt)"
```

---

## Task 9: Footer — baseline (`AppFooter.vue`)

Une seule ligne.

**Files:**
- Modify: `app/components/AppFooter.vue:14`

- [ ] **Step 1: Remplacer la baseline (ligne 14)**

Remplace :
```html
<p class="footer-tagline">L'IA ARRIVE. NE SOYEZ PAS UNE VARIABLE SUPPRIMÉE.</p>
```

par :
```html
<p class="footer-tagline">L'IA ARRIVE. APPRENDS À LA PILOTER.</p>
```

- [ ] **Step 2: Vérifier dans le navigateur**

Recharge n'importe quelle page (home ou identité) et scroll jusqu'au footer. La baseline doit afficher « L'IA ARRIVE. APPRENDS À LA PILOTER. »

- [ ] **Step 3: Commit**

```bash
git add app/components/AppFooter.vue
git commit -m "feat(footer): baseline pivot piloter"
```

---

## Task 10: Page Identité — métadonnées, bandeau, réorganisation, paragraphes, mission, JSON-LD (`pages/identite.vue`)

C'est la modification la plus dense de ce plan. À faire en 7 sous-étapes.

**Files:**
- Modify: `app/pages/identite.vue:3-48` (meta + JSON-LD), `:60-156` (markup)

- [ ] **Step 1: Mettre à jour `useSeoMeta` (lignes 3-11)**

Remplace le bloc :
```ts
useSeoMeta({
  title: 'Mathieu Rérat : Qui est derrière Survivant-IA',
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et la PropTech. Le parcours de Mathieu Rérat et l\'esprit anti-obsolescence derrière Survivant-IA.',
  ogTitle: 'Mathieu Rérat - Identité du Survivant-IA',
  ogDescription: 'Le parcours et l\'esprit derrière Survivant-IA. Concret, sans théorie.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mathieu Rérat - Identité du Survivant-IA',
  twitterDescription: 'Le parcours derrière Survivant-IA - anti-obsolescence pour les pros.',
})
```

par :
```ts
useSeoMeta({
  title: 'Mathieu Rerat : Qui pilote Survivant-IA',
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et l\'immobilier. Le parcours de Mathieu Rerat et l\'esprit derrière Survivant-IA : aider les salariés à piloter l\'IA dans leur métier.',
  ogTitle: 'Mathieu Rerat : Identité du Survivant-IA',
  ogDescription: 'Le parcours et l\'esprit derrière Survivant-IA. Concret, sans théorie.',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Mathieu Rerat : Identité du Survivant-IA',
  twitterDescription: 'Le parcours derrière Survivant-IA : piloter l\'IA dans son métier.',
})
```

- [ ] **Step 2: Mettre à jour la `description` du Person dans le JSON-LD (ligne 26)**

Remplace :
```ts
description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les professionnels à se former à l\'IA pour ne pas se faire remplacer.',
```

par :
```ts
description: 'Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les salariés à piloter l\'IA dans leur métier.',
```

- [ ] **Step 3: Mettre à jour le sous-titre identité (ligne 70)**

Remplace :
```html
<span class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); letter-spacing: 0.1em;">DEPUTY HEAD OF IT · SURVIVANT EN COURS</span>
```

par :
```html
<span class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); letter-spacing: 0.1em;">DEPUTY HEAD OF IT · HEC LAUSANNE · 9 ANS EN TRANSFORMATION DIGITALE</span>
```

- [ ] **Step 4: Réorganisation — déplacer la section PARCOURS au-dessus du `.identity-text`**

Le bloc PARCOURS actuel est aux lignes 116-145 (après `.identity-text` qui se ferme ligne 114).

Coupe le bloc complet :
```html
    <!-- ── PARCOURS ─────────────────────────────────────── -->
    <div class="parcours-section">
      <p class="parcours-label"><KickerLabel>PARCOURS</KickerLabel></p>
      <div class="parcours-grid">

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">PwC</p>
          <p class="parcours-role">Audit IT</p>
          <p class="parcours-detail font-mono">Stage</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Nestlé</p>
          <p class="parcours-role">Business Analyst</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Immopac</p>
          <p class="parcours-role">Head of Office Romandie</p>
          <p class="parcours-detail font-mono">Consultant → Dev Xyrion → HO</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Solutions &amp; Funds</p>
          <p class="parcours-role">Deputy Head of IT</p>
          <p class="parcours-detail font-mono">En poste</p>
        </ScannerBorder>

      </div>
    </div>
```

Et colle-le **juste après** la fermeture de `<ScannerBorder class="identity-card">...</ScannerBorder>` (ligne ~74) et **avant** le bloc `<div class="identity-text">` (ligne ~76).

⚠️ Vérifie qu'aucune balise `<div>` n'est laissée orpheline. La structure attendue après cette étape :

```html
<ScannerBorder class="identity-card">...</ScannerBorder>

<!-- ── PARCOURS (remonté) ─────────────────────────── -->
<div class="parcours-section">
  ...
</div>

<div class="identity-text">
  <p>...</p>
  ...
</div>
```

Ajuste également le style inline qui ajoute du `margin-top: 3rem` à `.parcours-section` (ligne 189) : maintenant qu'il est en haut, ce margin reste pertinent (espacement avec la card identité au-dessus). On laisse le CSS tel quel.

- [ ] **Step 5: Réécrire le premier paragraphe narratif (lignes 77-83)**

Remplace :
```html
<p>
  Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information (HEC Lausanne),
  puis PwC en audit IT, Nestlé comme Business Analyst, immopac où je suis passé de consultant
  à Head of Office Romandie, et aujourd'hui Deputy Head of IT chez Solutions&nbsp;&amp;&nbsp;Funds.
  Des environnements différents, un fil rouge : être l'interface entre les gens, les process,
  et les outils.
</p>
```

par :
```html
<p>
  Master en systèmes d'information à HEC Lausanne. PwC en audit IT, puis Nestlé comme Business Analyst.
  9 ans chez Immopac à piloter la transformation digitale d'un secteur traditionnel, l'immobilier,
  en passant de consultant à Head of Office Romandie. Aujourd'hui Deputy Head of IT chez
  Solutions&nbsp;&amp;&nbsp;Funds. J'ai vu de l'intérieur ce qui marche et ce qui plante dans les rollouts
  d'outils, dans des organisations qui n'ont rien de tech.
</p>
```

- [ ] **Step 6: Nettoyer les em-dashes du paragraphe « Jusqu'au jour où... » (lignes 91-95)**

Remplace :
```html
<p>
  Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite,
  beaucoup - mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a
  pas rendu anti-IA. Il m'a rendu <strong class="text-accent">lucide</strong>.
</p>
```

par :
```html
<p>
  Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite,
  beaucoup, mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a
  pas rendu anti-IA. Il m'a rendu <strong class="text-accent">lucide</strong>.
</p>
```

(Le `-` était un tiret simple ASCII, on le remplace par une virgule pour cohérence éditoriale.)

- [ ] **Step 7: Modifier le paragraphe « Ce site existe... » (lignes 97-101)**

Remplace :
```html
<p>
  Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se
  positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais
  aimé avoir et éviter les erreurs que j'ai faites.
</p>
```

par :
```html
<p>
  Ce site existe pour les salariés qui voient l'IA arriver sans savoir comment se
  positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais
  aimé avoir et éviter les erreurs que j'ai faites.
</p>
```

(Seul changement : « professionnels » → « salariés », pour resserrer la cible.)

- [ ] **Step 8: Réécrire le bloc MISSION (lignes 103-108)**

Remplace :
```html
<ScannerBorder class="mission-block">
  <p style="margin-bottom: 0.75rem;"><KickerLabel>MISSION</KickerLabel></p>
  <p style="margin: 0; font-size: 1rem;">
    Aider les gens à se préparer <em>avant</em> que l'IA ne prenne leur job - pas à pleurer <em>après</em>.
  </p>
</ScannerBorder>
```

par :
```html
<ScannerBorder class="mission-block">
  <p style="margin-bottom: 0.75rem;"><KickerLabel>MISSION</KickerLabel></p>
  <p style="margin: 0; font-size: 1rem;">
    Aider les salariés à piloter l'IA dans leur métier <em>avant</em> de la subir.
  </p>
</ScannerBorder>
```

- [ ] **Step 9: Nettoyer le paragraphe persona de clôture (lignes 110-113)**

Remplace :
```html
<p>
  Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous,
  avec quelques cartes en main - et les cicatrices pour prouver que j'y suis déjà passé.
</p>
```

par :
```html
<p>
  Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous,
  avec quelques cartes en main, et les cicatrices pour prouver que j'y suis déjà passé.
</p>
```

(Changement minime : `-` ASCII → virgule.)

- [ ] **Step 10: Vérifier dans le navigateur**

Recharge `http://localhost:3000/identite`. Vérifie l'ordre :
1. Breadcrumbs + KickerLabel « IDENTITÉ DU SURVIVANT » + H1 « Qui suis-je ? » (inchangé)
2. Card identité avec sous-titre « DEPUTY HEAD OF IT · HEC LAUSANNE · 9 ANS EN TRANSFORMATION DIGITALE »
3. **Section PARCOURS (remontée)** : 4 cartes PwC / Nestlé / Immopac / Solutions & Funds
4. Texte narratif (3 paragraphes : autorité → lucidité IA → raison du site)
5. Bloc MISSION : « Aider les salariés à piloter l'IA dans leur métier *avant* de la subir. »
6. Paragraphe persona (« Je ne suis pas l'expert IA ultime… »)
7. CTA « Rejoindre la Fréquence »

Aucun em-dash, aucun « professionnel », aucune mention « anti-obsolescence ».

- [ ] **Step 11: Vérifier le JSON-LD via DevTools**

Sur `/identite`, ouvre DevTools → Elements → `<head>`. Trouve le `<script type="application/ld+json">`. Vérifie que `description` du `Person` est bien la nouvelle version (« …piloter l'IA dans leur métier. »).

- [ ] **Step 12: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): rééquilibrage autorité (PARCOURS remonté, paragraphes pivot, mission piloter)"
```

---

## Task 11: Vérification globale + build

Vérification cross-cutting que toutes les règles éditoriales sont respectées dans les fichiers touchés, puis compile check, puis revue visuelle complète.

**Files:** none (read-only checks)

- [ ] **Step 1: Vérifier qu'il ne reste plus de mots interdits dans les fichiers modifiés**

```bash
echo "=== méthode (interdit) ==="
grep -ni "méthode" \
  app/pages/index.vue \
  app/pages/identite.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/NewsletterForm.vue \
  app/components/AppFooter.vue 2>/dev/null

echo "=== chevauch (interdit) ==="
grep -ni "chevauch" \
  app/pages/index.vue \
  app/pages/identite.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/NewsletterForm.vue \
  app/components/AppFooter.vue 2>/dev/null

echo "=== mardi (interdit) ==="
grep -ni "mardi" \
  app/pages/index.vue \
  app/pages/identite.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/NewsletterForm.vue \
  app/components/AppFooter.vue 2>/dev/null

echo "=== em-dash — dans les copies user-facing (interdit) ==="
# Exclut les commentaires HTML/CSS qui contiennent des em-dashes décoratifs préexistants
# (sections `<!-- ── MASTHEAD X — TITRE ─── -->` et `/* ── X — Y ── */`) — ceux-ci sont
# du formatage technique et ne sont PAS du contenu user-facing.
grep -n "—" \
  app/pages/index.vue \
  app/pages/identite.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/NewsletterForm.vue \
  app/components/AppFooter.vue 2>/dev/null \
  | grep -v "<!--" | grep -v "/\*"

echo "=== variable supprimée (interdit) ==="
grep -ni "variable supprimée" \
  app/pages/index.vue \
  app/pages/identite.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/NewsletterForm.vue \
  app/components/AppFooter.vue 2>/dev/null
```

Expected : **toutes les sections ne renvoient AUCUNE ligne** (sortie vide après chaque header `=== xxx ===`).

Si une ligne apparaît, retourner à la tâche correspondante et corriger avant de continuer.

⚠️ **Note sur les em-dashes pré-existants dans les commentaires** : `index.vue` utilise un pattern décoratif `<!-- ── MASTHEAD X — TITRE ─── -->` autour de chaque section. Ces em-dashes sont **pré-existants** au pivot, c'est du formatage technique de code (invisible à l'utilisateur), et le projet l'utilise par convention. Le grep ci-dessus les exclut volontairement (`grep -v "<!--" | grep -v "/\*"`). Ne pas modifier ces commentaires : Task 3 met à jour les libellés des numéros romains à l'intérieur de ces commentaires en gardant le même pattern décoratif (cohérence avec le reste du fichier).

- [ ] **Step 2: Vérifier que les ancres positives sont bien présentes**

```bash
echo "=== piloter (présence attendue) ==="
grep -ni "piloter" \
  app/pages/index.vue \
  app/components/HomeMastheadTrajectoire.vue \
  app/components/HomeManifesteEditorial.vue \
  app/components/HomeDiagnosticTeaser.vue \
  app/components/HomeFaq.vue \
  app/components/RapportsBookshelf.vue \
  app/components/AppFooter.vue \
  app/pages/identite.vue 2>/dev/null | wc -l

echo "=== HomeMastheadTrajectoire utilisé (présence attendue : 1) ==="
grep -n "HomeMastheadTrajectoire" app/pages/index.vue | wc -l

echo "=== num=II (présence attendue : 1) ==="
grep -n 'num="II"' app/pages/index.vue | wc -l
echo "=== num=III (présence attendue : 1) ==="
grep -n 'num="III"' app/pages/index.vue | wc -l
echo "=== num=IV (présence attendue : 1) ==="
grep -n 'num="IV"' app/pages/index.vue | wc -l
echo "=== num=V (présence attendue : 1) ==="
grep -n 'num="V"' app/pages/index.vue | wc -l
echo "=== num=VI (doit être 0) ==="
grep -n 'num="VI"' app/pages/index.vue | wc -l
```

Expected :
- `piloter` : compteur >= 8 (il apparaît au moins 1× par fichier qui a été modifié hors `RapportsBookshelf.vue` + `HomeMastheadTrajectoire.vue` ; ajuster si compteur trop bas, mais > 5 est sain)
- `HomeMastheadTrajectoire` : 1
- `num="II"` : 1, `num="III"` : 1, `num="IV"` : 1, `num="V"` : 1
- `num="VI"` : 0

- [ ] **Step 3: Build de production**

```bash
npm run build
```

Expected : `✔ Server built` ou équivalent, pas d'erreur de compilation. Les warnings Vue/Nuxt habituels sont OK.

- [ ] **Step 4: Revue visuelle complète**

Avec le dev server (`npm run dev`) toujours actif, ouvre dans cet ordre :

1. **`http://localhost:3000`** (home, scroll complet)
   - Hero : H1 + baseline + paragraphe + 2 cartes (cf. Task 2 step 9)
   - Bandeau de trajectoire visible juste après le hero (cf. Task 3 step 5)
   - Manifeste : nouveau quote + signature Deputy Head of IT (cf. Task 4 step 3)
   - Diagnostic IA : nouveau titre + lead + CTA (cf. Task 5 step 4)
   - Compétences IA-proof : numéro `III`
   - Rapports : numéro `IV`, nouveau titre (cf. Task 6 step 2)
   - FAQ : numéro `V`, nouveau H2, ouvrir Q1+Q8 pour vérifier les réponses (cf. Task 7 step 9)
   - NewsletterForm : nouveau H2 + lead (cf. Task 8 step 3)
   - Footer : baseline « L'IA ARRIVE. APPRENDS À LA PILOTER. »

2. **`http://localhost:3000/identite`**
   - Card identité : nouveau sous-titre HEC + 9 ans
   - PARCOURS placé avant les paragraphes narratifs
   - Premier paragraphe : commence par « Master en systèmes d'information à HEC Lausanne. »
   - MISSION : « Aider les salariés à piloter l'IA dans leur métier avant de la subir. »
   - Footer baseline pivot

3. **Mobile breakpoint** (DevTools → toggle device, largeur ~375px) : vérifier que le bandeau de trajectoire passe en wrap propre, que les cartes hero passent en colonne, et que le sous-titre identité ne déborde pas.

4. **Console** (DevTools → Console) : pas d'erreur rouge, pas de warning Vue critique.

- [ ] **Step 5: Vérification finale du JSON-LD FAQPage et Person**

Sur la home (`/`) : DevTools → Elements → `<head>` → `<script type="application/ld+json">`. Confirme que les 8 `acceptedAnswer.text` reflètent les nouvelles réponses pour Q1/Q4/Q6/Q7/Q8 et conservent les anciennes pour Q2/Q3/Q5.

Sur `/identite` : confirme que le `description` du `Person` (`@type: Person`) contient « piloter l'IA dans leur métier ».

- [ ] **Step 6: Note de fin pour le user**

Fournir un récap au user :
- Liste des commits créés (10 si tout passe)
- Confirmation des 5 critères du §9 du spec (mots interdits absents, ordre home, H1 exact, footer exact, PARCOURS remonté)
- Mention que le sous-projet 2 (Scanner v2) reste à brainstormer ensuite et que la carte 02 du hero / le composant Diagnostic IA ont été reformulés en mode neutre A3 pour préparer ce sous-projet sans préempter ses décisions.

---

## Récapitulatif des fichiers modifiés

| # | Fichier | Type | Tâche |
|---|---|---|---|
| 1 | `app/components/HomeMastheadTrajectoire.vue` | **create** | 1 |
| 2 | `app/pages/index.vue` | edit | 2 + 3 |
| 3 | `app/components/HomeManifesteEditorial.vue` | edit | 4 |
| 4 | `app/components/HomeDiagnosticTeaser.vue` | edit | 5 |
| 5 | `app/components/RapportsBookshelf.vue` | edit | 6 |
| 6 | `app/components/HomeFaq.vue` | edit | 7 |
| 7 | `app/components/NewsletterForm.vue` | edit | 8 |
| 8 | `app/components/AppFooter.vue` | edit | 9 |
| 9 | `app/pages/identite.vue` | edit | 10 |

**Commits attendus** : 10 (1 préflight = pas de commit ; tâches 1 à 10 = 1 commit chacune ; tâche 11 = vérif sans commit).

## Définition du « livré »

Critères du spec §9, traduits en checkbox finale :

- [ ] `méthode`, `chevauch`, `mardi`, `—`, `variable supprimée` absents des 9 fichiers ci-dessus
- [ ] Ordre home : Hero → Bandeau trajectoire → II Manifeste → Diagnostic IA → III IA-proof → IV Rapports → V FAQ → Newsletter
- [ ] Composant `HomeMastheadTrajectoire` créé et inséré
- [ ] H1 home exactement `Survivre à l'IA au travail, c'est apprendre à la piloter`
- [ ] Footer baseline exactement `L'IA ARRIVE. APPRENDS À LA PILOTER.`
- [ ] PARCOURS positionné avant le texte narratif sur `/identite`
- [ ] Signature manifeste mentionne `Deputy Head of IT`
- [ ] `npm run build` passe sans erreur
- [ ] Pas de régression visuelle (DA Editorial Dark sage cohérent)
