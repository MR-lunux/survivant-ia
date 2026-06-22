# Diagnostic de maturité IA — Design spec

Date: 2026-06-22

## Contexte

Nouvel outil standalone pour survivant-ia.ch. Complément du scanner d'exposition par métier : là où le scanner dit "l'IA arrive pour ton métier", le diagnostic répond "es-tu capable de la mettre en place sans te planter ?"

12 questions · 6 dimensions · 5 paliers de maturité · radar SVG en résultats.

## Architecture des fichiers

| Fichier | Action | Rôle |
|---|---|---|
| `content/outils/diagnostic-maturite-ia.md` | Créer | Métadonnées (title, specs, kicker, description) |
| `app/components/kits/KitDiagnosticMaturite.vue` | Créer | Composant complet — données + logique + radar |
| `app/data/outils-manifest.ts` | Modifier | Ajouter l'entrée manifest |
| `nuxt.config.ts` | Modifier | Ajouter `/outils/diagnostic-maturite-ia` aux routes prerender |
| `app/pages/outils/[slug].vue` | Modifier | Ajouter `v-if` pour `code === 'diagnostic-maturite-ia'` |

## Contenu MD (content/outils/diagnostic-maturite-ia.md)

Frontmatter uniquement — pas de `data`, pas de `parentArticleSlug`.

```yaml
code: diagnostic-maturite-ia
kind: app
title: Diagnostic de maturité IA
subtitle: Es-tu en état de déployer l'IA — ou prêt à la regretter ?
description: 12 questions pour mesurer ta maturité IA sur 6 dimensions. Radar visuel, palier de maturité, priorités d'action. Gratuit, sans inscription.
kicker: KIT · DIAGNOSTIC IA
specs:
  - "12 QUESTIONS"
  - "~3 MIN"
  - "6 DIMENSIONS"
  - "RÉSULTAT IMMÉDIAT"
```

Pas d'`intro` ni d'`outro` : le composant gère tout visuellement.

## Manifest (outils-manifest.ts)

```ts
{
  code: 'diagnostic-maturite-ia',
  path: '/outils/diagnostic-maturite-ia',
  title: 'Diagnostic de maturité IA',
  subtitle: "Es-tu en état de déployer l'IA — ou prêt à la regretter ?",
  kind: 'app',
  metiers: [],
}
```

## Composant KitDiagnosticMaturite.vue

### Données intégrées

Toutes les données hardcodées dans le composant (pas de props data) :

- `AXES` — 6 dimensions : Objectif, Données, Processus, Culture, Gouvernance, Direction
- `QUESTIONS` — 12 questions, 2 par dimension, 4 options (valeurs 0–3)
- `LEVELS` — 5 paliers : Angle mort (0), Velléités (26), Prêt à piloter (46), Prêt à déployer (66), Mature (86)
- `ADVICE` — texte conseil par dimension (affiché si avg < 1.5)

### Props

```ts
defineProps<{ kitId: string }>()
```

### États

```ts
type Stage = 'quiz' | 'decrypting' | 'result'
```

Pas d'étape "intro" — le header de la page kit fait déjà office d'introduction.

### Flow utilisateur

1. **Quiz** : progress bar (N/12) + eyebrow de dimension + question + 4 boutons option + bouton précédent
2. **Decrypting** : animation `// ANALYSE EN COURS` (1200 ms) — pattern identique à KitQuiz
3. **Résultats** :
   - Palier badge (code + nom) avec couleur sémantique
   - Ladder (5 barres horizontales, palier actif surligné)
   - Score global `/100`
   - Radar SVG 6 axes
   - Légende par dimension (couleur rouge/amber/vert selon score)
   - Section "Priorités" — dimensions avec avg < 1.5 seulement, texte conseil
   - Bouton "refaire le diagnostic"

### Radar SVG

Géométrie identique au JSX source : `CX=150, CY=138, R=104`, 6 axes, 4 rings de référence. Adapté pour SVG inline Vue (pas de refs DOM, calcul en `computed`).

### Design system

Toutes les couleurs utilisent les CSS vars du projet :

| JSX original | CSS var projet |
|---|---|
| `#F0A92B` (amber) | `var(--color-accent)` |
| `#15171A` (bg) | `var(--color-bg)` |
| `#1C1F23` (panel) | `var(--color-surface)` |
| `#30353B` (line) | `var(--color-rule)` |
| `#E7E3DA` (ink) | `var(--color-text)` |
| `#8A9099` (muted) | `var(--color-muted)` |
| `#C8554A` (red) | `var(--color-danger)` |
| `#6FA86B` (green) | `#6FA86B` (hardcodé — pas de var verte dans le projet) |
| Space Grotesk | `var(--font-sans)` |
| IBM Plex Mono | `var(--font-mono)` |

Pas d'emojis. Pas de CSS autonome — uniquement `<style scoped>` avec les vars.

## PostHog — événements

`kit_viewed` est déjà capturé par `[slug].vue`. Le composant capture :

| Événement | Déclencheur | Propriétés |
|---|---|---|
| `kit_diagnostic_started` | Première réponse donnée | `id` |
| `kit_diagnostic_question_answered` | Chaque réponse | `id`, `dimension`, `question_index` (1-12), `answer_value` (0-3), `answer_text`, `time_on_question` (ms) |
| `kit_diagnostic_back_clicked` | Bouton précédent | `id`, `from_question_index` |
| `kit_diagnostic_completed` | Dernière question répondue | `id`, `overall_score`, `level_code`, `level_name`, `score_objectif`, `score_donnees`, `score_processus`, `score_culture`, `score_gouvernance`, `score_direction`, `weak_dims` (array), `time_to_complete` (ms) |
| `kit_diagnostic_result_viewed` | Affichage résultats | Mêmes props que `completed` |
| `kit_diagnostic_restarted` | Bouton refaire | `id`, `previous_score`, `previous_level` |
| `kit_diagnostic_abandoned` | `beforeunload` si commencé non terminé | `id`, `last_question_index`, `answers_given` |

## Checklist intégration (d'après outils-manifest.ts)

- [ ] `content/outils/diagnostic-maturite-ia.md`
- [ ] `app/data/outils-manifest.ts` — entrée ajoutée
- [ ] `app/data/outil-ctas.ts` — pas d'override CTA nécessaire
- [ ] `app/data/outil-faqs.ts` — pas de FAQ pour v1
- [ ] `nuxt.config.ts` → `nitro.prerender.routes` — `/outils/diagnostic-maturite-ia`
- [ ] `app/pages/outils/[slug].vue` — `v-if` ajouté
- [ ] `app/components/kits/KitDiagnosticMaturite.vue` — composant créé
