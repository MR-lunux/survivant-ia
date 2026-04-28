# Spec — Refresh marketing de la homepage

**Date :** 2026-04-28
**Objectif :** Appliquer les 4 recommandations de l'audit marketing sur la homepage pour améliorer la conversion newsletter depuis zéro abonné.

---

## Contexte

Audit DARE : score global 6.2/10, communication 4/10. Le site part de zéro abonné. Les 4 chantiers appliqués ici sont les quick-wins identifiés lors de la session de brainstorming.

---

## Chantier 1 — ManifestoTerminal : recentrer sur le visiteur

**Fichier :** `app/components/ManifestoTerminal.vue`

Le manifeste parle de Mathieu ("Je suis chef de projet IT…"), pas du visiteur. En neuromarketing, les premières secondes doivent valider *l'expérience du visiteur*, pas raconter l'auteur.

**LINES actuel :**
```js
"Je suis chef de projet IT. Je vois l'IA arriver. Je refuse de regarder sans agir.",
"Ce site n'est pas là pour vous faire peur — c'est là pour vous armer. Les outils sont plus simples que vous ne le croyez. La menace est réelle mais gérable.",
"Préparons-nous avant que ça arrive.",
```

**LINES proposé :**
```js
"Vous voyez l'IA arriver dans votre job. Vous ne savez pas comment vous positionner. Vous n'êtes pas seul.",
"Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine.",
"Préparez-vous avant que ça arrive.",
```

Aucune autre modification sur ce composant.

---

## Chantier 2 — StatsStrip : activer avec des chiffres vrais dès jour 1

**Fichiers :**
- `app/components/StatsStrip.vue` — mettre à jour les 3 stats
- `app/pages/index.vue` — insérer `<StatsStrip />` entre la section manifeste et la section rapports

**Stats actuelles :**
```js
{ target: 1,   suffix: '',  label: 'rapport / semaine',  displayed: 0 },
{ target: 100, suffix: '%', label: 'sans jargon',         displayed: 0 },
{ target: 0,   suffix: '+', label: 'survivants inscrits', displayed: 0 },
```

**Stats proposées :**
```js
{ target: 1,   suffix: '',    label: 'rapport / semaine',       displayed: 0 },
{ target: 5,   suffix: ' min', label: 'de lecture par édition', displayed: 0 },
{ target: 100, suffix: '%',   label: 'terrain, aucun théoricien', displayed: 0 },
```

Suppression du "0+ survivants inscrits" qui nuirait à la crédibilité.

**Placement dans index.vue :**
Après `</section>` du manifeste et le `<SectionDivider />` qui suit, avant la section rapports :

```html
<!-- après SectionDivider post-manifeste -->
<StatsStrip />
<!-- SectionDivider existant avant rapports -->
```

---

## Chantier 3 — NewsletterForm : sous-titre spécifique + early adopter

**Fichier :** `app/components/NewsletterForm.vue`

**Sous-titre actuel :**
> "Recevez chaque semaine mon analyse terrain pour comprendre l'IA sans jargon, et développez les soft skills qui sécuriseront votre carrière."

**Sous-titre proposé :**
> "Chaque semaine : 1 analyse terrain, 3 axes pratiques, 5 minutes chrono. Rejoignez les premiers dans la zone."

Aucune autre modification sur le formulaire.

---

## Chantier 4 — Section rapports : gérer l'état avec 1 seul article

**Fichier :** `app/pages/index.vue`

Avec un seul article publié, la grille 3 colonnes laisse 2 slots vides visuellement. Solution : afficher un message contextuel sous la grille lorsque moins de 3 rapports sont disponibles, transformant le vide en signal narratif.

Ajouter après `</div>` de `.articles-grid` :

```html
<p
  v-if="articles && articles.length < 3"
  class="font-mono rapports-coming"
>
  // D'AUTRES RAPPORTS EN COURS DE CHIFFREMENT...
</p>
```

CSS à ajouter dans `<style scoped>` de index.vue :
```css
.rapports-coming {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-top: 1.5rem;
  opacity: 0.6;
}
```

Le message disparaît automatiquement dès que 3 rapports sont publiés.

---

## Hors scope

- Logo / symbole visuel
- Témoignages / preuve sociale par les chiffres d'abonnés
- Redesign de l'ArticleCard
- Modification du layout hero
