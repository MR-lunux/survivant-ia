# Générateur de processus BPMN — design

**Date :** 2026-05-23
**Slug outil :** `generateur-processus-bpmn`
**Code interne :** `generateur-processus-bpmn`
**Kind :** `app`
**Cible :** professionnels qui documentent un processus métier (consultants, chefs de projet, qualiticiens). Trafic SEO étudiant accueilli sans être adressé directement.

---

## 1. Problème & promesse

Documenter un processus métier en BPMN 2.0 dans un outil comme bpmn.io est un travail mécanique : on sait ce qu'on veut dire, on doit cliquer-glisser pendant 20 minutes pour le formaliser. Le LLM peut faire ce travail intermédiaire — extraire la structure logique depuis une description en français — si on le décharge de la partie qu'il fait mal (les coordonnées du diagramme).

**Promesse utilisateur :** *Dicte ou écris ton processus métier. L'IA te livre un diagramme BPMN 2.0 prêt à valider et à éditer dans bpmn.io.*

---

## 2. Décisions structurantes (validées en brainstorm)

| # | Décision | Choix |
|---|----------|-------|
| 1 | Périmètre BPMN | **C — full BPMN 2.0** : tasks, gateways (XOR/AND/OR inclusif), events typés (timer/message/error/terminate), lanes/pools, sous-processus (sans expansion v1) |
| 2 | Aperçu | **B — aperçu statique intégré** : SVG figé rendu via `bpmn-js` lazy-loadé côté client |
| 3 | Itération | **C — one-shot + édition manuelle dans bpmn.io** : pas de mémoire conversationnelle, l'utilisateur ajuste son texte ou ouvre le résultat dans bpmn.io |
| 4 | Dictée | **A — réutiliser l'infra Whisper** existante (du générateur d'écriture comptable), extraite en `KitVoiceInput.vue` |
| 5 | Positionnement | **B — pro pur** : copy orientée onboarding/achats/conformité, métiers `consultant`, `chef-de-projet`, `qualiticien` |
| 6 | Architecture IA | **Option 2 — IR JSON → conversion serveur** : l'IA produit un JSON structuré, `bpmn-moddle` + `bpmn-auto-layout` génèrent le XML 2.0 valide avec layout déterministe |

---

## 3. Architecture & flow

```
[KitGenerateurBpmn.vue]
   ├─ KitVoiceInput.vue (nouveau, extrait de KitGenerateurEcritureVoice)
   ├─ textarea libre (description du processus)
   └─ bouton "Générer le diagramme"
            │
            ▼
[POST /api/generateur-processus-bpmn/generate]
   ├─ 1. rate-limit IP (20/jour, namespace dédié)
   ├─ 2. sanitize + validate (longueur 20–4000 chars, anti-injection)
   ├─ 3. modération wordlist input
   ├─ 4. callInfomaniak(promptSystem, descriptionUser) → IR JSON
   │       retry 1× à temp 0.1 si JSON invalide ou shape KO
   ├─ 5. modération post-check sur labels de l'IR
   ├─ 6. ir-to-bpmn.ts : IR → bpmn-moddle → bpmn-auto-layout → XML 2.0 valide
   ├─ 7. PostHog server event (success / error typé)
   └─ retour { xml, ir, meta: { duration_ms, model, tokens, retry_used } }
            │
            ▼
[Client]
   ├─ bpmn-js viewer lazy-loadé (import dynamique au mount du preview)
   ├─ rend le XML dans un div hors-écran → viewer.saveSVG()
   ├─ injecte le SVG dans un <div v-html> (statique, pas d'interactions)
   └─ actions : Copier XML / Télécharger .bpmn / Ouvrir dans bpmn.io
```

### Unités principales (bornées, testables indépendamment)

- **`server/utils/bpmn-ir-schema.ts`** — schéma TypeScript + `isValidBpmnIR(data)` + `validateGraph(ir)`. Type guards stricts, pas Zod (cohérent avec le reste du repo).
- **`server/utils/ir-to-bpmn.ts`** — conversion IR → XML. Pure, déterministe, testable sans réseau. Pièce critique : couverture cible 100%.
- **`server/utils/bpmn-generator-chat.ts`** — wrapper Infomaniak avec system prompt + few-shot examples + retry logic.
- **`KitGenerateurBpmn.vue`** + **`KitGenerateurBpmnPreview.vue`** — UI, séparation form / aperçu.
- **`KitVoiceInput.vue`** — composant dictée extrait (duplication contrôlée depuis le comptable pour v1 ; factorisation transverse du comptable hors scope de ce projet).

---

## 4. Schéma IR (Intermediate Representation)

L'IA ne produit jamais de coordonnées ni d'IDs techniques BPMN. Elle produit la **structure logique** uniquement.

```ts
interface BpmnIR {
  process_name: string                    // "Processus de validation des achats"
  lanes: Array<{                          // acteurs (= lanes BPMN dans un pool unique)
    id: string                            // slug ASCII : "demandeur", "responsable_achats"
    label: string                         // "Demandeur"
  }>
  nodes: Array<
    | { id: string; type: 'start';       lane: string; label?: string; event_type?: 'none'|'timer'|'message' }
    | { id: string; type: 'end';         lane: string; label?: string; event_type?: 'none'|'terminate'|'error'|'message' }
    | { id: string; type: 'task';        lane: string; label: string; task_type?: 'user'|'service'|'manual'|'send'|'receive' }
    | { id: string; type: 'gateway';     lane: string; gateway_type: 'exclusive'|'parallel'|'inclusive'; label?: string }
    | { id: string; type: 'event_intermediate'; lane: string; event_type: 'timer'|'message'|'error'; label?: string }
    | { id: string; type: 'subprocess';  lane: string; label: string }
  >
  flows: Array<{
    id: string
    source: string                        // id d'un node
    target: string                        // id d'un node
    condition?: string                    // libellé sur l'arc, requis si source est une gateway exclusive ou inclusive
  }>
}
```

### Décisions de design du schéma

- **Pas d'imbrication** — `subprocess` est un node, pas un container. Pas d'expansion en v1. Évite la récursion qui dégrade la fiabilité de l'IA.
- **`lanes` non vide obligatoire** — même processus mono-acteur a une lane (par défaut, `processus`). Simplifie le converter.
- **IDs lisibles** — slugs ASCII produits par l'IA (`valider_commande`), le converter les préfixe pour éviter collisions BPMN. Aide au debug.
- **Conditions sur flows obligatoires depuis gateway XOR/inclusive** — vérifié par `validateGraph(ir)`. Si absent, l'IA est invitée à mettre `oui`/`non` par défaut via le system prompt.

---

## 5. Prompt système (résumé)

- Rôle : "expert BPMN 2.0 qui structure des processus métier en JSON valide, sans inventer d'éléments absents de la description"
- Output : JSON pur conforme au schéma, **2 few-shot examples** (un simple linéaire mono-lane, un XOR + 2 lanes)
- Garde-fous explicites :
  - Acteur ambigu → lane `processus` générique
  - Décision sans branches claires → gateway exclusive + flux `oui`/`non`
  - Pas d'étape qui n'est pas dans la description
  - Description trop vague (< 2 étapes identifiables) → retourner `{ error: 'too_vague', message: '...' }`
- Validation côté serveur : `isValidBpmnIR(data)` (shape) + `validateGraph(ir)` (cohérence : flows référencent des IDs existants, XOR a ≥ 2 sorties, exactement 1 start, ≥ 1 end, pas de cycle infini, etc.)
- Retry 1× à `temperature: 0.1` si parse fail OU shape invalide OU graphe incohérent

---

## 6. Conversion IR → XML

`server/utils/ir-to-bpmn.ts` :

1. Construit l'arbre BPMN programmatiquement via `bpmn-moddle` (parser/serializer officiel bpmn.io) — **pas de string templating XML**.
2. Génère IDs BPMN-compatibles avec préfixe (`Task_`, `Gateway_`, `Event_`, etc.) à partir des IDs IR.
3. Appelle `bpmn-auto-layout` (MIT, ~50 Ko, par bpmn.io) pour produire la section `BPMNDiagram` avec coordonnées propres.
4. Sérialise via `moddle.toXML()`.

Pure, déterministe, 0 dépendance réseau. Testable offline avec des fixtures IR.

---

## 7. UI

### Layout `/outils/generateur-processus-bpmn`

```
H1 : Générateur de processus BPMN
Lead : "Dicte ou écris ton processus métier. L'IA te livre un diagramme
        BPMN 2.0 prêt à valider et à éditer dans bpmn.io."

[KitGenerateurBpmn.vue]
  [Textarea libre]
    └─ bouton mic intégré (KitVoiceInput.vue) : pressé → enregistre →
       transcription Whisper → texte appendé dans le textarea
  Compteur : N / 4000 caractères (rouge à > 3500)
  [ Générer le diagramme → ]

── Après génération ──
[KitGenerateurBpmnPreview.vue]
  [ SVG figé du diagramme ]
  [Copier XML] [Télécharger .bpmn] [Ouvrir dans bpmn.io ↗]
  ▾ Voir le XML brut (collapse)

(outro markdown depuis content/outils/<slug>.md)
CTA Fréquence en bas (override outil-ctas.ts si besoin)
```

### Détails composants

**`KitVoiceInput.vue`** — props : `modelValue`, `placeholder`, `apiEndpoint`, `disabled`. Emits : `update:modelValue`, `recording-state`. Encapsule MediaRecorder + upload + polling + fallback Web Speech API.

**`KitGenerateurBpmnPreview.vue`** — import dynamique `bpmn-js Viewer` au mount. Rend hors-écran, `viewer.saveSVG()`, injecte dans `<div v-html>`. Pas de zoom/pan v1. "Ouvrir dans bpmn.io" ouvre `https://demo.bpmn.io/new` + met le XML dans le presse-papier avec toast "XML copié — colle-le dans bpmn.io (Ctrl+V)". Pas de deep-link URL (non fiable au-delà de ~2 Ko).

**`KitGenerateurBpmn.vue`** — orchestrateur. State machine `idle → submitting → success | error`. 8 codes d'erreur typés avec messages distincts. Tracking PostHog client : `bpmn_generator_submit_clicked`, `xml_copied`, `xml_downloaded`, `bpmnio_opened`.

### Accessibilité & responsive

- SVG `role="img"` + `aria-label` + fallback texte (liste `<details>` des étapes générée depuis l'IR).
- Mobile : SVG en `overflow-x:auto` + indicateur "défile horizontalement".

---

## 8. Anti-abus, erreurs, observabilité

### Rate limit & modération

Strict copier-coller du pattern `ameliorer-prompt` :
- Namespace `generateur-processus-bpmn`, **20 appels / jour / IP**
- Sanitize : trim, normalisation unicode, retrait null bytes
- Validate : `20 ≤ len ≤ 4000`, blocage patterns injection prompt durs
- Modération wordlist sur input + post-check sur labels de l'IR
- Factorisation `server/utils/moderation.ts` à viser ; si trop touchy, on duplique en v1 et on factorise plus tard

### Codes d'erreur typés

| Code | Origine | Message utilisateur | UI |
|------|---------|---------------------|-----|
| `rate_limit` | rate limiter | "Tu as atteint la limite quotidienne (20/jour). Reviens demain." | bouton désactivé, header `X-RateLimit-Reset` exposé |
| `invalid_input` | validation longueur | "Décris ton processus en 20 à 4000 caractères." | focus textarea |
| `bad_input` | modération in ou out | "Ce contenu n'est pas accepté. Reformule en restant pro." | clear, pas de retry |
| `too_vague` | IA détecte description insuffisante | "Ta description est trop vague — décris au moins 2 étapes et qui les exécute." | propose un exemple |
| `bad_json` | parse IA fail 2× | "L'IA a eu un trou. Réessaie dans un instant." | bouton "Réessayer" actif |
| `ai_unreachable` | Infomaniak down | "Le service IA est temporairement indisponible." | bouton "Réessayer" actif |
| `ir_invalid` | converter rejette l'IR (graphe incohérent) | même message que `bad_json` | log serveur détaillé |
| `conversion_failed` | bpmn-auto-layout throw | "Impossible de générer le diagramme. Reformule différemment." | log serveur détaillé |

### Observabilité PostHog

Événements serveur (préfixe `bpmn_generator_api_`) :

- `success` — props : `duration_ms`, `model`, `input_tokens`, `output_tokens`, `node_count`, `lane_count`, `gateway_count`, `subprocess_count`, `retry_used: bool`
- `error` — props : `error_type` (codes ci-dessus), `duration_ms`, sous-type si applicable

Le tracking node-count / gateway-count informe les choix v1.1 (BPMN simple ou complexe en usage réel).

---

## 9. Wiring & livraison

### Checklist d'ajout d'outil

| # | Fichier | Action |
|---|---------|--------|
| 1 | `content/outils/generateur-processus-bpmn.md` | frontmatter + outro markdown pro |
| 2 | `app/data/outils-manifest.ts` | entrée `code: 'generateur-processus-bpmn'`, `kind: 'app'`, `metiers: ['consultant', 'chef-de-projet', 'qualiticien']` (à valider vs `app/data/jobs.ts`) |
| 3 | `app/data/outil-ctas.ts` | CTA Fréquence par défaut, override possible |
| 4 | `app/data/outil-faqs.ts` | 5–6 FAQs pro |
| 5 | `nuxt.config.ts` → `nitro.prerender.routes` | ajouter `/outils/generateur-processus-bpmn` |
| 6 | `app/pages/outils/[slug].vue` | wire `KitGenerateurBpmn` conditionnel sur le code |

### Nouveaux fichiers créés

**Backend**
- `server/api/generateur-processus-bpmn/generate.post.ts`
- `server/api/generateur-processus-bpmn/transcribe.post.ts`
- `server/api/generateur-processus-bpmn/transcribe-status.get.ts`
- `server/utils/bpmn-generator-chat.ts`
- `server/utils/bpmn-generator-validation.ts`
- `server/utils/bpmn-ir-schema.ts`
- `server/utils/ir-to-bpmn.ts`
- `server/utils/bpmn-generator-posthog.ts`

**Frontend**
- `app/components/KitGenerateurBpmn.vue`
- `app/components/KitGenerateurBpmnPreview.vue`
- `app/components/KitVoiceInput.vue`

**Contenu**
- `content/outils/generateur-processus-bpmn.md`

### Dépendances npm à ajouter

- `bpmn-moddle` (~150 Ko, server) — parser/serializer BPMN officiel, MIT
- `bpmn-auto-layout` (~50 Ko, server) — layout déterministe, MIT
- `bpmn-js` (~600 Ko gzip, client, lazy-loadé) — viewer SVG, MIT

Toutes maintenues par bpmn.io.

---

## 10. Tests

**Unitaires (sans réseau, sans navigateur)**
- `bpmn-ir-schema.test.ts` — chaque branche de `isValidBpmnIR` et `validateGraph` (node manquant, flow vers ID inexistant, gateway XOR mono-sortie, double start, cycle, etc.)
- `ir-to-bpmn.test.ts` — fixtures IR variées (linéaire / XOR / 2 lanes / sous-processus / event timer). Assertions : XML reparsable par `bpmn-moddle`, section `BPMNDiagram` présente, snapshot des fixtures communes.
- `bpmn-generator-validation.test.ts` — longueurs limites, injection patterns.

**Intégration (mockés)**
- `generate.post.test.ts` — mock `callBpmnGeneratorChat`. Vérifier les 8 codes d'erreur typés, la retry logic, les events PostHog émis.

**E2E (manuel v1)**
- Smoke : 3 descriptions types (simple / XOR / multi-lanes). Vérifier SVG affiché + XML s'ouvre dans bpmn.io.
- Playwright auto si la régression manuelle devient un problème.

**Couverture cible** : 100% sur `ir-to-bpmn.ts`, 80%+ sur le reste.

---

## 11. Hors scope v1 (notés pour v1.1+)

- Itération conversationnelle (édition par instruction sur le XML existant)
- Expansion des sous-processus en arborescence
- Modeler bpmn-js (édition in-tool, pas juste viewer)
- Deep-link bpmn.io fiable (passe par un service intermédiaire)
- Factorisation transverse du `KitVoiceInput` dans le comptable (PR séparée)
- Tests E2E automatisés
- Pools multiples (collaborations BPMN inter-organisations)

---

## 12. Critères de succès

- Un utilisateur pro décrit un processus de 5-10 étapes avec décision → reçoit un BPMN 2.0 valide qui s'ouvre dans bpmn.io sans erreur en < 8 secondes.
- Taux d'erreur typée `ir_invalid` + `conversion_failed` + `bad_json` < 10% des appels (mesuré via PostHog après 2 semaines).
- L'outil apparaît dans `/outils` et est taggé sur au moins 3 métiers pertinents.
- Aucune régression sur `generateur-ecriture-comptable` ni `ameliorer-son-prompt` (composant voix dupliqué proprement, pas factorisé en v1).
