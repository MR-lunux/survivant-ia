# FaceCam Motion Design — Design Spec

**Date** : 2026-05-14
**Statut** : design validé, prêt pour writing-plans
**Contexte projet** : `video/` · Remotion · Survivant-IA TikTok factory

---

## 1. Objectif

Ajouter un quatrième template Remotion dans `video/` qui prend une vidéo de Mathieu se filmant face caméra et produit un mp4 TikTok 9:16 où :

- la zone basse 50% = la face cam (recadrée intelligemment)
- la zone haute 50% = du motion design synchronisé mot-à-mot avec ce que Mathieu dit
- aucune frame n'est statique : une couche ambiant garantit le mouvement continu
- la DA suit V2 Editorial Dark (warm dark, accent menthe `#6CE3B5`, typo Inter + Playfair italic + Space Mono)
- la séparation entre les deux zones est une hairline menthe avec dégradé + pulse 4s

Claude joue le rôle de monteur/réalisateur : analyse la transcription, compose la timeline, sync les apparitions de mots et d'éléments à la frame près sur les timestamps Whisper.

## 2. Architecture

### Arborescence

```
video/
├── src/
│   ├── Root.tsx                          ← + <Composition id="FaceCam" />
│   ├── videos/
│   │   └── FaceCam.tsx                   ← NEW · composition principale
│   └── lib/
│       ├── schemas.ts                    ← + FaceCamProps, TimelineEvent zod
│       └── facecam/                      ← NEW
│           ├── crop.ts                   ← logique crop 9:16 vs 16:9
│           ├── hairline-pulse.tsx        ← séparateur menthe V3 animé
│           ├── ambient-layer.tsx         ← particules + dot drift + grain
│           └── scenes/                   ← LE KIT
│               ├── KickerOpening.tsx
│               ├── WordBeat.tsx
│               ├── BigStat.tsx
│               ├── ConceptCard.tsx
│               ├── ItalicMoment.tsx
│               ├── IconReveal.tsx
│               ├── QuoteFrame.tsx
│               ├── HairlineDivider.tsx
│               └── CloseURL.tsx
├── scripts/
│   ├── transcribe.mjs                    ← NEW · whisper.cpp wrapper
│   ├── detect-silences.mjs               ← NEW · ffmpeg silencedetect → JSON
│   ├── prepare-facecam.mjs               ← NEW · orchestre transcribe + silences
│   └── post-encode.mjs                   ← existant
├── public/
│   └── facecam-raws/                     ← tu dépose tes mp4 ici (gitignored)
└── facecam-data/                         ← timelines générées (gitignored)
    ├── episode-XX.transcript.json
    ├── episode-XX.silences.json
    └── episode-XX.timeline.json
```

### Boundaries

- `scripts/transcribe.mjs` : mp4 → transcript JSON. Connaît whisper, ne connaît pas Remotion.
- `scripts/detect-silences.mjs` : mp4 → silences JSON. Connaît ffmpeg, ne connaît pas Remotion.
- `lib/facecam/scenes/*` : chaque scène est un composant React qui reçoit `{ props, durationSec }` et se rend dans la zone haute. Aucune scène ne sait quelle autre la précède ou la suit.
- `lib/facecam/crop.ts` : pure function `(inputAspect, cropAnchor, w, h) → viewport`. Testable unitairement.
- `videos/FaceCam.tsx` : consomme `timeline.json` via `calculateMetadata`, orchestre via `<Sequence>`. Ne connaît pas comment timeline.json est généré.
- `facecam-data/episode-XX.timeline.json` : contrat entre Claude-monteur et Remotion-renderer. Single source of truth d'un montage. Replayable (copie pour créer une variante d'un même tournage).

### Gitignore additions

```
public/facecam-raws/
facecam-data/
```

Les vidéos brutes (poids) et timelines (locales par session) restent hors git. Les sources `video/src/lib/facecam/**` et `video/scripts/{transcribe,detect-silences,prepare-facecam}.mjs` sont versionnés.

## 3. Data flow

```
[1] Tournage           → episode-XX.mp4 (9:16 ou 16:9)
                         déposé dans public/facecam-raws/

[2] npm run facecam:prepare -- episode-XX
        ↓
    transcribe.mjs           → facecam-data/episode-XX.transcript.json
                               (mots + timestamps Whisper word-level)
        ↓
    detect-silences.mjs      → facecam-data/episode-XX.silences.json
                               (liste {start, end, durationSec})

[3] Claude reçoit le brief "voici episode-XX"
        ↓
    Lit transcript.json + silences.json
    Propose la liste de cuts (Mathieu valide ou retire au cas par cas)
    Génère facecam-data/episode-XX.timeline.json

[4] npm run dev → Studio sur composition FaceCam
    calculateMetadata charge timeline.json, règle la durée dynamiquement
    Preview live, ajustement de props à la volée si besoin

[5] npm run render:facecam -- episode-XX
        ↓
    Render Remotion → post-encode ffmpeg → out/facecam-XX.mp4
    (audio source conservé, silences cuts appliqués via ffmpeg filter)
```

## 4. Layout visuel

### Canvas

- Format : 1080×1920, 30fps (hérité `VIDEO` dans `theme.ts`)
- Safe area : hérite de `SAFE_AREA` existant

### Split

- 50/50 strict horizontal
- Zone haute : `y ∈ [0, 960]` → motion design
- Zone basse : `y ∈ [960, 1920]` → face cam recadrée
- Le split est figé pour le MVP. Le split dynamique (D des variantes brainstormées) est un candidat v2.

### Hairline V3 — séparateur menthe

Positionnée à `y = 960`, hauteur 1px.

- **Couleur de base** : `#6CE3B5` (accent menthe, token `COLORS.accent`)
- **Dégradé horizontal** : alpha 0.15 (extrémités gauche/droite, 0-15% et 85-100%) ↔ 1.0 (centre, 15-85%)
- **Glow** : box-shadow `0 0 8px rgba(108, 227, 181, 0.4)`
- **Pulse** : alpha générale oscille entre 0.6 et 1.0 sur un cycle de 4s (sinus, easing `Easing.bezier(0.4, 0, 0.6, 1)` = ease-in-out)

Implémenté dans `lib/facecam/hairline-pulse.tsx`. C'est l'élément signature qui rappelle la couleur du site.

### Face cam zone

Reçoit un `<Video src=… style={{ objectFit: 'cover', transform: crop }} />` calculé par `crop.ts`.

**Crop logic** :

| inputAspect | Source dims | Cropwindow | cropAnchor par défaut |
|---|---|---|---|
| `9:16` | 1080×1920 | 1080×960 | `"top"` (extrait moitié haute du source) |
| `16:9` | 1920×1080 | 1080×960 | `"center"` (carré centré horizontalement, scale-fit vertical) |

`cropAnchor` accepte : `"top"`, `"center"`, `"bottom"`, ou `{ y: number }` (fraction 0-1). Mathieu ajuste en formulaire Studio si le visage tombe mal.

## 5. Input pipeline

### Whisper local

- Outil : whisper.cpp (cloné dans `~/.local/whisper.cpp` ou détecté via PATH)
- Modèle : `large-v3` français (téléchargement une fois ~3 Go)
- Audio extrait du mp4 via ffmpeg en WAV mono 16kHz
- Flags : `--word-thold 0.5 --output-json-full` pour timestamps mot-à-mot
- Output : `transcript.json` au format :
  ```json
  {
    "language": "fr",
    "words": [
      {"word": "je", "start": 0.42, "end": 0.51},
      {"word": "perdais", "start": 0.51, "end": 0.84}
    ]
  }
  ```
- Premier run : `npm run setup:whisper` installe whisper.cpp + télécharge le modèle. Documenté dans README.

### Silence detection

- ffmpeg filter `silencedetect`, seuil `-50dB`, durée minimale `0.5s`
- Output `silences.json` :
  ```json
  {
    "totalDurationSec": 47.3,
    "silences": [
      {"start": 4.2, "end": 5.1, "durationSec": 0.9},
      {"start": 18.6, "end": 19.3, "durationSec": 0.7}
    ]
  }
  ```
- Workflow : Claude lit ce JSON, propose une liste de cuts (par défaut tous), Mathieu retire au cas par cas s'il veut une pause dramatique.

### Cuts application

- Au render : ffmpeg `setpts` + `asetpts` synchronisés pour appliquer les cuts au mp4 source AVANT que Remotion ne le consomme. Garde le sync audio/vidéo strict.
- Le `timeline.json` raisonne sur la **timeline coupée** (durée nette), pas la timeline brute.

## 6. Pipeline opérationnel (B · preview + tweak)

1. Mathieu drop `episode-XX.mp4` dans `public/facecam-raws/`
2. `npm run facecam:prepare -- episode-XX` → transcript.json + silences.json
3. Mathieu : "Claude, voici episode-XX, à toi"
4. Claude lit les 2 JSON, propose les cuts en chat, Mathieu accepte/refuse
5. Claude génère `episode-XX.timeline.json`
6. Mathieu lance `npm run dev`, ouvre Studio sur composition FaceCam, paramètre `episode` dans le formulaire
7. Preview live : Mathieu corrige `cropAnchor`, ajuste un texte mal calé, retouche une scène
8. `npm run render:facecam -- episode-XX` → mp4 final dans `out/`

## 7. Le Kit (9 scènes MVP)

Chaque scène vit dans `lib/facecam/scenes/`. Toutes consomment l'espace `width=1080, height=960` (zone haute uniquement). Toutes acceptent `{ durationSec }` et bornent leurs animations dans ce temps.

| # | Scène | Durée typique | Quand l'utiliser | Composition technique |
|---|---|---|---|---|
| 1 | **KickerOpening** | 1.8–2.5s | Scene #1 systématique | KickerSpin top-left + 1 ligne Inter caps cream + SignatureItalic menthe |
| 2 | **WordBeat** | flex (suit la phrase) | 80% des phrases parlées | `<WordsAppear>` avec `{word, anchorSec, emphasis?}[]`. Mots syncés sur timestamps Whisper. `emphasis: true` → overshoot scale 0.95→1.05→1.0 + couleur menthe ou italique sage |
| 3 | **BigStat** | 2.5–3.5s | Chiffre marquant | Compteur 0→N (spring 1.2s damping 14) + label Inter caps dessous + caption mono au-dessus |
| 4 | **ConceptCard** | 3–4.5s | Définition / concept posé | HairlineCard avec kicker mono + 2-3 lignes Inter caps + close italique optionnel |
| 5 | **ItalicMoment** | 2–3s | Punchline / signature de réveal | Pleine zone, Playfair italique menthe 110pt, entrée spring posée, pause |
| 6 | **IconReveal** | 1.8–2.5s | Mention d'une chose tangible | Icône SVG (réutilisée du site) + label Inter caps, entrée spring + micro-rotation 3° |
| 7 | **QuoteFrame** | 3–4s | Citation source externe | Guillemets typo Playfair + corps Inter + attribution mono dim |
| 8 | **HairlineDivider** | 0.6–1s | Respiration entre 2 beats forts | `HairlineRule` animée draw gauche→droite (0.5s ease-out-expo) |
| 9 | **CloseURL** | 2–3s | Scene finale CTA | `SlamIn` `survivant-ia.ch` + footer handle mono `@survivant.ia` |

### Couche ambiant (always-on)

Composant `ambient-layer.tsx` rendu en-dessous de toutes les scènes, indépendant des `<Sequence>` :

- `ParticleBackground` 40 particules sage (existant, réutilisé)
- Accent dot top-right qui drift de ±3px en 6s (sinus)
- Pulse alpha hairline menthe (cycle 4s, cf. section 4)
- Grain (existant, opacity 0.025)

**Garantie** : à toute frame `f`, au moins un de ces éléments bouge. Pas de dead frame possible.

## 8. Directing principles (les règles du monteur)

Non-négociables quand Claude génère un `timeline.json`.

### Les 10 oui

1. **Easing** : `Easing.bezier(0.16, 1, 0.3, 1)` (ease-out-expo) ou `spring({ damping: 14, mass: 0.5 })`. Jamais linéaire.
2. **Stagger** : 2 éléments d'une scène jamais au même frame. Offset 2-6 frames.
3. **Anticipation** sur les gros éléments : pre-move (scale 0.95) avant slam (1.02) avant settle (1.0).
4. **Persistance** : un élément reste min 0.8s après apparition. Exit fade 6-10 frames avant fin de scène.
5. **Sync syllabe** : apparition d'un mot calée sur `transcript.words[i].start * fps`, à la frame près.
6. **Variation de densité** : alterner beats denses (3 éléments + emphasis) et beats respirants (1 + ambient).
7. **Tempo contrast** : build lent (1.2s) suivi de snap (4 frames sur mot-clé).
8. **Restraint chromatique** : max 2 couleurs accentuées par scène. Menthe rare. Danger réservé warnings.
9. **Cross-dissolve** : scène N+1 entre 4-6 frames avant que N sorte. Pas de hard cut sauf intention.
10. **Frame-perfect emphasis** : mots-clés (concept coined, chiffre, italique) frappent pile sur l'attaque vocale.

### Les 7 non

| Cheap tell | Raison |
|---|---|
| Linear easing | Signature #1 du AI-generated motion |
| Drop shadows blurry | Esthétique 2010 PowerPoint |
| Springs damping <8 | Effet TikTok-cheap rebondissant |
| Glow systématique | Le glow doit rester rare pour signifier |
| 3+ couleurs accentuées par scène | Cacophonie chromatique |
| Rotations random | Toute rotation doit avoir raison sémantique |
| Toutes anims au frame 0 | Stagger violé = lecture homogène = ennui |

### Tabous éditoriaux (hérités projet)

- Aucun emoji dans la zone motion design ni dans le code (charte projet "no emojis dans code/UI Survivant-IA")
- Casse minuscules sur les concepts coined ("simple valideur", pas "Simple Valideur")
- Négation française complète ("je ne suis pas", jamais "je suis pas")
- Pas d'invention factuelle si Claude voit passer un chiffre/détail bio sans source dans la voix

## 9. Schémas zod (additions à `lib/schemas.ts`)

```ts
const TimelineEvent = z.object({
  tStart: z.number().min(0),
  tEnd: z.number().min(0),
  scene: z.enum([
    "KickerOpening", "WordBeat", "BigStat", "ConceptCard",
    "ItalicMoment", "IconReveal", "QuoteFrame",
    "HairlineDivider", "CloseURL"
  ]),
  props: z.record(z.any()),
}).refine(e => e.tEnd > e.tStart, { message: "tEnd must be > tStart" });

const FaceCamProps = z.object({
  episodeId: z.string(),
  videoSrc: z.string(),
  inputAspect: z.enum(["9:16", "16:9"]),
  cropAnchor: z.union([
    z.enum(["top", "center", "bottom"]),
    z.object({ y: z.number().min(0).max(1) }),
  ]),
  cuts: z.array(z.object({ from: z.number(), to: z.number() })),
  totalDurationSec: z.number(),
  events: z.array(TimelineEvent),
});
```

Durée composition calculée dynamiquement :

```ts
const calculateMetadata: CalculateMetadataFunction<FaceCamProps> = async ({ props }) => {
  const timeline = await loadJSON(`facecam-data/${props.episodeId}.timeline.json`);
  return {
    durationInFrames: Math.ceil(timeline.totalDurationSec * 30),
    props: timeline,
  };
};
```

## 10. Tournage — guide pratique pour Mathieu

(Détaillé dans le README au moment du build. Résumé ici.)

### Portrait 9:16 (phone selfie, recommandé MVP)

- Tête dans le **tiers haut** du cadre (pas centrée verticalement)
- Eyeline = hauteur lentille
- Épaules visibles, head-and-shoulders
- Distance bras tendu (~50 cm)
- Phone sur trépied / gorillapod / pile de livres (jamais main libre)
- Light devant légèrement haut, jamais fenêtre derrière
- Fond neutre sombre

### Horizontal 16:9 (webcam, alternatif)

- Centré horizontalement (le crop carré tombe sur toi)
- Mêmes règles light + stable + fond

## 11. Erreurs et edge cases

| Cas | Détection | Comportement |
|---|---|---|
| Vidéo trop courte/longue | metadata au prepare | Warning, on continue (responsabilité éditoriale) |
| Aspect ratio non supporté | check w/h au prepare | Erreur dure, refus de continuer |
| Whisper sans parole | transcript vide | Erreur dure avec hint audibilité |
| Erreurs transcription FR | manuel | Transcript JSON éditable, Claude relit et propose corrections |
| Silence cut sur speech | seuil ffmpeg + workflow B | Mathieu retire la coupe en pipeline B |
| Crop coupe le visage | manuel | Ajustement `cropAnchor` en formulaire Studio |
| Audio drift après cuts | sync ffmpeg setpts/asetpts | Tests automatisés (cf. §12) |
| Timeline JSON cassé | zod validation au load | Erreur claire chemin du champ |
| mp4 manquant | check au calculateMetadata | Erreur dure |
| Codec source non standard (HEVC) | ffprobe au prepare | Conversion auto H.264 baseline |
| Render crash particules | hérité | Reduce concurrency / commenter ambient |

## 12. Stratégie de tests

### Unitaires (vitest, `video/src/lib/facecam/__tests__/`)

1. `crop.test.ts` — viewport correct pour matrice (inputAspect × cropAnchor × dims)
2. `timeline-schema.test.ts` — JSON valide passe, invariants violés rejetés explicitement
3. `cut-merge.test.ts` — liste cuts → segments à garder + mapping timeline

### Intégration ffmpeg

4. `silence-detect.integration.test.ts` — fixture WAV déterministe → silences == attendus ±0.05s

### Snapshot Remotion

5. Pour chacune des 9 scènes : `remotion still --frame=15 --scale=0.5` → diff PNG vs snapshot validé

### E2E manuel

6. Fixture `public/facecam-raws/_demo-10s.mp4` → `npm run facecam:demo` → mp4 final. Validation visuelle (QuickTime joue, sync audio, motion propre, cuts propres).

### Non testé (volontairement)

- Le contenu créatif de `timeline.json` (subjectif, validé Studio preview)
- La qualité Whisper (hors contrôle, manuel par épisode)

## 13. Hors-scope (candidats v2)

- **Split dynamique** (variante D des layouts) : ratio motion/face qui flex selon le beat. Powerful mais ajoute complexité d'orchestration. À tester une fois MVP rodé.
- **Auto-detect face position** : Mediapipe pour calculer `cropAnchor` automatiquement. Évite l'ajustement manuel.
- **Sous-titres burned-in** : actuellement laissés à TikTok-natif. Pourrait être généré depuis transcript.
- **Variantes A/B de timeline** : un même mp4 source, deux timelines pour A/B test du motion.
- **Mode full-auto** (variante A du pipeline) : skip preview Studio. Pour batch de plusieurs vidéos.
- **B-roll insertion** : couper la face cam à certains moments et la remplacer par une vidéo d'illustration.

## 14. Décisions de design (résumé)

| Question | Décision |
|---|---|
| Workflow | Video-first (Mathieu tourne, Claude monte) |
| Transcription | Whisper local (whisper.cpp + large-v3 FR) |
| Architecture | Kit (scènes réutilisables) + Script (timeline.json) |
| Split layout | 50/50 strict |
| Séparateur | Hairline V3 menthe : dégradé alpha + pulse 4s |
| Formats input | 9:16 portrait + 16:9 horizontal |
| Pipeline | B · preview + tweak (Studio live) |
| Silence cuts | Propose + accept default (Mathieu peut retirer) |
| Durée | Dynamique via `calculateMetadata` (suit la prise nette) |
| Audio | Voix native du mp4 conservée, cuts synchronisés |
| Kit MVP | 9 scènes + couche ambiant always-on |
| Directing | 10 règles oui + 7 règles non + tabous éditoriaux |

---

**Prochaine étape** : invocation de `superpowers:writing-plans` pour transformer ce spec en plan d'implémentation step-by-step.
