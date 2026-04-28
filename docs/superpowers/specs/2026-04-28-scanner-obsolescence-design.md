# Spec — Scanner d'obsolescence IA (`/scanner`)

**Date :** 2026-04-28
**Objectif :** Créer une page outil interactive qui permet à un visiteur de saisir son métier et d'obtenir son score de risque IA, avec un CTA newsletter adapté à son profil.

---

## Contexte stratégique

Le site survivant-ia.ch démarre avec zéro abonné. Cette page-outil remplit deux rôles :
1. **Acquisition** — elle peut ranker sur des requêtes à forte intention ("mon métier va-t-il disparaître avec l'IA", "risque automatisation emploi") et être partagée sur les réseaux sociaux par des gens qui veulent montrer leur score.
2. **Conversion** — l'expérience terminal crée une immersion émotionnelle (curiosity gap + fear of loss) qui rend le CTA newsletter naturel et urgent.

La page est accessible via `/scanner`. La homepage reçoit un teaser d'entrée minimal (`→ Scanne ton métier`) pour y envoyer du trafic sans alourdir la page principale.

---

## Sources des données

Les scores sont calibrés à partir de ces publications académiques et institutionnelles :

| Source | Année | Contribution |
|--------|-------|-------------|
| MIT Project Iceberg (Acemoglu et al.) | 2025 | Taux d'exposition par occupation (programmeur 74.5%, support client 70.1%, saisie 67.1%) |
| SHRM Research | 2025 | 32% des métiers IT/math ont déjà 50%+ de tâches automatisées |
| WEF Future of Jobs Report | 2025 | Analyste marketing 53%, commercial 67% de tâches remplaçables d'ici 2030 |
| Goldman Sachs (Briggs/Kodnani) | 2023 | Par secteur : admin 46%, juridique 44%, finance 35%, nettoyage 1%, maintenance 4%, construction 6% |
| OCDE Employment Outlook | 2023 | 27% des emplois à haut risque en moyenne OCDE ; 27.4% en France |
| Oxford / Frey & Osborne | 2013 | Base historique : télémarketing 99%, saisie 99%, assureurs 98% |

Les sources sont citées en bas de la page scanner pour la crédibilité.

---

## Architecture technique

**Fichiers créés :**
- `app/pages/scanner.vue` — page principale
- `app/data/jobs.ts` — table statique (~120 métiers français)

**Structure d'un job dans la table :**
```ts
interface Job {
  slug: string       // identifiant URL-safe, ex: "comptable"
  label: string      // libellé affiché, ex: "Comptable"
  risk: number       // score 0–100 issu des études
  horizon: number    // années avant impact majeur : 2, 5 ou 10
  status: 'danger' | 'augmente' | 'resistant'
  source: string     // référence courte ex: "MIT 2025 / OCDE 2023"
}
```

**Seuils de statut :**
- `risk > 65` → `danger`
- `risk 30–65` → `augmente`
- `risk < 30` → `resistant`

**Pas de fallback** — seuls les métiers de la table sont disponibles. Si la saisie ne matche aucun résultat, l'autocomplete affiche "Aucun résultat" sans générer de score.

---

## UX Flow

### 1. Prompt initial
- Header terminal : `SURVIVANT-IA · ./SURVIVAL_CHECK.SH · V0.7.3`
- Label : `// SCANNER D'OBSOLESCENCE`
- Champ autocomplete Space Mono : *"Quel est votre métier ?"*
- Filtrage dès 2 caractères, maximum 8 suggestions affichées

### 2. Animation terminal (après sélection, ~2.5s)
Cinq lignes s'affichent séquentiellement avec curseur clignotant :
```
$ survival_check --job="[métier]"
connecting to OECD-2023 dataset .............. ok
cross-referencing McKinsey automation index ... ok
parsing job description ...................... ok
simulating LLM capability curve (2026 → 2031) . ok
✓ obsolescence risk: [X]% — [verdict court]
```
Le verdict court varie selon le statut :
- danger → `remplacement probable`
- augmente → `augmentation possible`
- resistant → `résistance confirmée`

### 3. Résultats
Trois cartes ScannerBorder affichées après l'animation :

| Carte | Contenu |
|-------|---------|
| RISQUE | `[X]%` en couleur selon seuil |
| HORIZON | `[N] ans` |
| STATUT | `EN DANGER` / `AUGMENTÉ` / `RÉSISTANT` |

Couleurs : EN DANGER → rouge `#FF3E3E` ; AUGMENTÉ et RÉSISTANT → vert `#00FF41`

### 4. Bloc message + CTA

| Statut | Message | Bouton |
|--------|---------|--------|
| EN DANGER | *"Ton métier ([X]) est dans le viseur. Les premiers qui s'adaptent survivent — les autres subissent."* | → Rejoindre la Fréquence |
| AUGMENTÉ | *"Ton métier ([X]) va changer. Ceux qui maîtrisent les outils maintenant gardent l'avantage sur leurs collègues."* | → Rejoindre la Fréquence |
| RÉSISTANT | *"L'IA ne remplace pas ton métier ([X]) — mais tes concurrents qui l'utilisent vont te dépasser si tu attends."* | → Utiliser l'IA pour s'imposer |

Les deux boutons pointent vers `/#newsletter`.

### 5. Partage
Bouton discret sous le CTA : `[ Partager mon résultat ]` — copie l'URL dans le presse-papier et affiche brièvement `[ Lien copié ! ]` (1.5s) avant de revenir à l'état initial. L'URL est mise à jour silencieusement dès l'affichage des résultats (`/scanner?job=comptable`). Quand la page est chargée avec un paramètre `?job=` valide, le résultat est pré-chargé sans animation. Si le slug `?job=` ne correspond à aucun métier de la table, le paramètre est ignoré et la page s'affiche normalement (champ vide, pas d'erreur).

---

## SEO

- **H1 fixe** : *"Scanner d'obsolescence IA — Quel est le risque pour ton métier ?"*
- **Meta title** statique : `Scanner IA — Risque automatisation par métier | Survivant-IA`
- **Meta description** statique : `Découvre en 10 secondes si ton métier est menacé par l'IA. Données MIT, OCDE, WEF. Gratuit.`
- **og:title / og:description dynamiques** via `useHead` quand `?job=` est présent :
  - og:title : `Mon risque IA : [X]% — [Métier] | Survival Check`
  - og:description : `J'ai scanné mon métier sur survivant-ia.ch. Résultat : [statut]. Et toi ?`

---

## Design

- Reprend exactement les tokens CSS existants (fond `#0D0D0D`, accent `#00FF41`, danger `#FF3E3E`)
- Composants existants réutilisés : `ScannerBorder`, Space Mono pour le terminal
- Champ autocomplete : style cohérent avec `GlitchButton` (pas de composant UI externe)
- Layout centré, `max-width: 780px`, cohérent avec `/identite`

---

## Teaser homepage

Dans `app/pages/index.vue`, ajout d'un bloc sobre entre le manifesto et le formulaire newsletter :
```
// DIAGNOSTIC IA
→ Scanne ton métier — découvre ton score d'obsolescence
[ Lancer le scan ]
```
Le bouton pointe vers `/scanner`.

---

## Hors scope

- Résultats partagés avec photo/carte générée (complexité disproportionnée)
- Comparaison de deux métiers
- Historique des scans
- Score personnalisé selon l'âge ou le niveau d'expérience
- Appel LLM pour les métiers non listés (décision délibérée : zéro coût, zéro ambiguïté)
