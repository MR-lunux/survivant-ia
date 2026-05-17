# FaceCam — catalogue des scènes

Chaque scène est un composant React isolé dans `scenes/` qui se rend dans la zone haute 1080×960 du canvas TikTok. Toutes utilisent les easings `Easing.bezier(0.16, 1, 0.3, 1)` ou `spring({ damping: 14 })` pour rester DA-aligné. Couleur signature : menthe `#6CE3B5` (`COLORS.accent`).

Pour utiliser une scène, ajouter un event dans le `timeline.json` :

```json
{ "tStart": 0.0, "tEnd": 7.2, "scene": "NomScene", "props": { ... } }
```

---

## Kit standard — réutilisables, paramétrables

| Scène | Props clés | Usage type |
|---|---|---|
| **KickerOpening** | `kicker`, `line`, `signature` | Écran d'ouverture brand (top-left kicker spin + ligne Inter caps + signature italique) |
| **WordBeat** | `words: [{word, anchor, emphasis?}]`, `size: "huge"\|"lg"\|"md"` | Texte synced mot-à-mot sur Whisper. Emphasis = italique menthe Playfair |
| **BigStat** | `value: number`, `suffix`, `caption?`, `label?`, `color?` | Gros chiffre animé (compteur 0→N en spring). Pour stats marquantes |
| **ConceptCard** | `kicker`, `lines: string[]`, `closeItalic?` | Card hairline avec kicker + 2-3 lignes + close italique. Pour définitions/concepts |
| **ItalicMoment** | `text`, `fontSize?` | Punchline italique sage plein écran. Signature reveal |
| **IconReveal** | `iconSrc`, `label` | Icône SVG externe (depuis `public/`) avec entrée spring |
| **IconBurst** | `iconName`, `label?`, `color?: "accent"\|"danger"\|...`, `size?` | Icône inline avec halo + ring rotatif. 17 icônes dispo |
| **VoiceWaveBars** | `barCount?`, `caption?`, `label?` | Onde audio stylisée (N barres menthe qui pulsent) |
| **ProcessFlow** | `steps: string[]`, `emphasisLast?` | Bullets connectés par hairlines, apparaissent en séquence |
| **QuoteFrame** | `quote`, `attribution` | Citation typo Playfair guillemets + corps Inter + attribution mono |
| **HairlineDivider** | (aucune) | Trait menthe qui se draw left-to-right (transition entre 2 beats) |
| **CloseURL** | `url`, `handle?` | Écran de fermeture CTA (SlamIn URL + footer handle) |

### Icônes IconBurst disponibles

`document` · `keyboard` · `check` · `refresh` · `brain` · `microphone` · `lightning` · `trendingUp` · `trendingDown` · `ai` · `clock` · `skull` · `shield` · `chat` · `xmark` · `tomb` · `lightbulb`

Ajouter une icône : éditer `scenes/icons.ts` avec un nouveau path SVG Tabler-style (viewBox `0 0 24 24`, stroke design fill="none").

---

## Scènes narratives custom — commissionnées par épisode

Ces scènes ont été conçues pour des moments spécifiques d'un épisode. Elles sont 100% réutilisables si un futur épisode a le même beat narratif.

### `ComptableToTomb`

3-beat storytelling : clavier qui tape + lignes "écritures" qui s'accumulent → docs qui s'empilent → tout tombe + tombe rouge avec halo. Métaphore "métier aliénant qui mène à la mort". Pas de props (durée auto-scale).

### `CycleFlow`

Flèche circulaire qui fait un tour 360° complet, 4 mots positionnés aux cardinaux (12/3/6/9) apparaissent quand la pointe pointe vers eux, accélération sur le dernier mot pour révéler "c'est un cycle". Props : `steps: string[4]`, `emphasisLast?`. Pour les listes répétitives ou les "actions en boucle".

### `BrainEmptying`

Cerveau outline avec un fill menthe qui draine de haut en bas pendant la durée de la scène. Gouttes qui tombent à la base. Props : `label?`. Pour "libérer du cerveau" / "vider la charge mentale".

### `AIComparison`

Chart 2 lignes : horizontale plate "› sans IA" en cream dim, ligne menthe qui monte en flèche "AVEC IA" en accent. Les lignes se dessinent left-to-right (stroke-dasharray). Pas de props. Pour les comparaisons before/after sur l'IA.

### `ClockTicking`

Horloge analogique avec aiguilles qui avancent à un rythme réaliste (12°/s minute, 1°/s heure). Position de départ 10:10 (iconique). Props : `label?`. Pour "libérer du temps" / "le temps passe".

### `IdeaToKeyboard`

2 beats : ampoule menthe + italique "*idée.*" → bulle de chat avec header "› COMMENTAIRE" et texte "voici mon idée…" qui s'écrit caractère par caractère + curseur clignotant. Pas de props. Pour les CTA "dites-le en commentaires".

---

## Commissionner une nouvelle scène

Quand un beat de ton épisode n'est pas couvert par les scènes existantes, brief Claude avec une description narrative :

> "À 00:34, je dis 'X'. J'aimerais voir [description visuelle : un Y qui Z, finissant par W]."

Claude code une nouvelle scène en `~80-250 LOC`, l'enregistre dans `scenes/index.ts` + `SCENE_NAMES` du `schemas.ts`, et l'utilise dans la timeline. Elle devient réutilisable pour tes futurs épisodes du même thème.
