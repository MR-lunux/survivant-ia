# Survivant-IA · Remotion video factory

Génération automatique des vidéos TikTok / Reels / Shorts pour `survivant-ia.ch`. Code en React + Remotion. Édition au formulaire (pas besoin de toucher au code pour un changement de texte).

3 templates pré-construits, alignés sur la DA V2 Editorial Dark du site et la charte éditoriale (voix Mathieu, tutoiement, taboos respectés, signature italique sage).

---

## Sommaire

1. [Installation (1 fois)](#installation-1-fois)
2. [Workflow quotidien](#workflow-quotidien)
3. [Les 3 templates](#les-3-templates)
4. [FaceCam — 4e template](#facecam--4e-template)
5. [Édition au formulaire (sans code)](#édition-au-formulaire-sans-code)
6. [Rendu et fichiers de sortie](#rendu-et-fichiers-de-sortie)
7. [Charte DA appliquée](#charte-da-appliquée)
8. [Safe zones TikTok / Reels / Shorts](#safe-zones-tiktok--reels--shorts)
9. [Architecture du code](#architecture-du-code)
10. [Tweaks fréquents (qui demandent du code)](#tweaks-fréquents-qui-demandent-du-code)
11. [Troubleshooting](#troubleshooting)
12. [Hors-scope (à faire ailleurs)](#hors-scope-à-faire-ailleurs)

---

## Installation (1 fois)

Prérequis : Node 20+ et `ffmpeg` installé sur le Mac (`brew install ffmpeg`).

```bash
cd /Users/mathieu/Documents/survivor/video
npm install
```

Au premier render, Remotion télécharge Chrome Headless (~150 Mo). C'est automatique et une seule fois.

---

## Workflow quotidien

### Pour éditer / créer une vidéo

```bash
cd /Users/mathieu/Documents/survivor/video
npm run dev
```

Ouvre `http://localhost:3000`. Tu vois 3 compositions dans la sidebar gauche : `RapportTerminal`, `Storytime`, `TestDiagnostic`.

1. Clique sur celle que tu veux éditer dans la liste à gauche.
2. **Dans le panneau à droite (pas à gauche !), scrolle jusqu'à la section "Props".** C'est ton formulaire — tous les textes, valeurs et couleurs sont là. Le panneau de droite contient typiquement, de haut en bas : Output settings, Render type, **Props**.
3. Modifie un champ → la preview centrale se met à jour instantanément.
4. Drag la timeline en bas pour vérifier que le rythme tient. Espace pour play.
5. Quand c'est bon, clique sur "Render" en haut à droite (ou en CLI : voir plus bas).

**Si tu ne vois pas le panneau de droite** : il est peut-être désactivé par défaut. Cherche un toggle / bouton dans la barre du haut de Studio (icône formulaire ou texte "Props") pour l'activer. Ou drag le séparateur vertical à droite de la preview vers la gauche pour ouvrir le panneau.

### Pour rendre les mp4 finaux

```bash
npm run render:rapport       # rend RapportTerminal
npm run render:storytime     # rend Storytime
npm run render:test          # rend TestDiagnostic
npm run render:all           # rend les 3 + lance fix:mp4 à la fin
```

Chaque commande déclenche un post-encode automatique qui transforme le mp4 brut Remotion en mp4 universellement compatible (QuickTime, TikTok, iOS, Android). Tu n'as rien à reformater.

Sortie : `out/rapport-terminal.mp4`, `out/storytime.mp4`, `out/test-diagnostic.mp4`.

> ⚠️ **Toujours utiliser le CLI, jamais le bouton "Render" de Studio pour les fichiers finaux.**
>
> Le bouton Render dans Studio bypasse le post-encode → le mp4 sort sans `+faststart`, et QuickTime refuse de l'ouvrir. Le bouton Render est OK pour des previews vite-faits, mais pour quelque chose que tu veux uploader, passe par le CLI.

### Filet de sécurité : `npm run fix:mp4`

Si un mp4 dans `out/` ne joue pas (QuickTime fait rien, écran noir, etc.), lance :

```bash
npm run fix:mp4
```

Ce script :
- Vérifie tous les mp4 dans `out/` (profil H.264 + pix_fmt + faststart)
- Ré-encode automatiquement ceux qui sont cassés ou non conformes
- Supprime les fichiers intermédiaires `_raw-*.mp4` orphelins

C'est aussi appelé automatiquement à la fin de `npm run render:all`, en filet de sécurité au cas où un step aurait échoué.

---

## Les 3 templates

Trois formats radicalement différents, chacun pensé pour tester un angle d'engagement TikTok :

### 1. RapportTerminal — 30s — Format data-driven

Hook stat-driven, gros chiffres, pivot vers 3 leviers. Idéal pour les sujets "carrière / productivité / IA-au-travail" avec un avant / après quantifié.

Structure narrative : kicker → stat 1 (chiffre négatif) → stat 2 (chiffre positif) → statement choc → pivot vers solution → 3 leviers en cards → close URL.

Article source de la V1 : *L'IA ne supprime pas des postes : elle supprime l'inefficience*.

### 2. Storytime — 45s — Format REX éditorial

Récit personnel introspectif. Mots qui apparaissent, démonstration visuelle de la perte (mots qui tombent à l'écran), reveal de concept en italique sage. Idéal pour les sujets "moi, ma douleur, ma tactique" qui appellent à l'identification.

Structure : hook → setup REX → démonstration visuelle de la perte → reveal du concept → image marquante → concept coined (signature italique) → close.

Article source : *Démence numérique : ne deviens pas un simple valideur*.

### 3. TestDiagnostic — 40s — Format quiz interactif

Faux scanner avec 3 signes diagnostiqués + tampon DETECTED rouge. Verdict 0/3, 1-2/3, 3/3 avec niveau de risque qui monte. CTA explicite à commenter son score → maximise les commentaires (signal algo TikTok fort).

Structure : hook → 3 signes en cards (chacune avec scan + DETECTED stamp) → verdict 3 paliers → CTA "ton score en commentaire".

Article source : *L'offloading cognitif : quand l'IA pense à ta place*.

---

## FaceCam — 4e template

Template 9:16 avec ta face cam en bas et le motion design en haut. La composition `FaceCam` est pilotée par un fichier `timeline.json` par épisode, généré par Claude à partir de la transcription.

### Workflow (5 étapes)

1. Tourne ton mp4 en portrait (ou horizontal) → dépose-le dans `public/facecam-raws/<episodeId>.mp4`
2. Lance la préparation : `npm run facecam:prepare -- <episodeId>` (transcription Whisper + détection silences → produit un brouillon de timeline)
3. Demande à Claude de générer ou affiner `facecam-data/<episodeId>.timeline.json` à partir de la transcription et de tes notes
4. Ouvre Studio (`npm run dev`), clique sur la composition `FaceCam` → prévisualise, ajuste `cropAnchor` si le cadrage coupe le visage
5. Rends le fichier final : `npm run render:facecam -- <episodeId>` → `out/facecam-<episodeId>.mp4`

### Guide de tournage

**Portrait 9:16 (téléphone recommandé)**

- Tête dans le tiers supérieur du cadre, regard niveau objectif
- Distance ~50 cm — assez près pour voir les expressions, pas trop pour qu'il n'y ait pas d'effet barrel
- Éclairage frontal : lumière douce devant toi, fond sombre dans ton dos (cohérence DA V2 Editorial Dark)
- Téléphone posé sur trépied — aucune instabilité tolérée (le crop ne stabilise pas)

**Horizontal 16:9 (webcam)**

- Centré, cadre tête-et-épaules, fond sombre
- Le script `apply-cuts.mjs` gère automatiquement le recadrage 16:9 → 9:16

**6 règles opérationnelles**

| # | Règle |
|---|---|
| 1 | Œil = objectif : regarde la caméra, pas l'écran |
| 2 | Distance stable : ne te penche pas en cours de tournage |
| 3 | Lumière frontale : lampe de bureau ou ring-light devant toi |
| 4 | Fond sombre : mur neutre, pas de fenêtre derrière |
| 5 | Support fixe : trépied, pas la main |
| 6 | Regard caméra sur les phrases-clés : c'est là que l'accroche se joue |

### Setup (1 fois)

Installe whisper.cpp et le modèle large-v3 FR (~3 Go) :

```bash
bash scripts/setup-whisper.sh
```

### Le kit · 9 scènes

| Scène | Usage |
|---|---|
| `KickerOpening` | Écran d'ouverture : kicker Space Mono + ligne Inter caps + signature Playfair |
| `WordBeat` | Mot unique très grand qui s'impose — pour les concepts one-word |
| `BigStat` | Gros chiffre animé 0 → valeur + caption mono + label |
| `ConceptCard` | Carte concept : titre Inter caps + explication + source |
| `ItalicMoment` | Phrase Playfair italique plein écran — les moments signature |
| `IconReveal` | Icône SVG avec entrée spring + label — pour les leviers/points |
| `QuoteFrame` | Citation encadrée par hairlines, avec attribution |
| `HairlineDivider` | Séparateur menthe 1px animé — transition entre beats |
| `CloseURL` | Écran de fermeture : domaine sage en Playfair + appel à l'action |

### Troubleshooting FaceCam

**Whisper introuvable** → relance `bash scripts/setup-whisper.sh`. Vérifie que le binaire est dans `scripts/lib/whisper.cpp/main`.

**Le crop coupe le visage** → dans `facecam-data/<episodeId>.timeline.json`, passe `cropAnchor` à `"center"` ou `"bottom"` selon la position de ta tête dans le cadre.

**Erreur de validation timeline JSON** → lis le message d'erreur zod : il indique le chemin exact du champ invalide. Vérifie notamment que `tEnd > tStart` sur chaque event et que le `scene` est bien l'un des 9 noms du kit.

**Source HEVC / format non lisible** → si ton mp4 est en HEVC (iPhone en mode "haute efficacité"), `apply-cuts.mjs` tente une conversion automatique. En cas d'échec : `ffmpeg -i in.mp4 -c:v libx264 -pix_fmt yuv420p -c:a aac out.mp4`.

---

## Édition au formulaire (sans code)

Chaque template expose un formulaire avec tous ses champs. La doc précise des champs est dans la section "Props" de Studio (descriptions visibles au hover) — voici le résumé :

### RapportTerminal

| Champ | Type | Ce que ça fait |
|---|---|---|
| `kickerLabel` | texte | Top-left, ex: `RAPPORT 003 / EFFICIENCE` |
| `stat1Label` | texte | Sous-titre du 1er gros chiffre |
| `stat1Value` | nombre 0-100 | Le 1er gros chiffre (compteur animé 0→valeur) |
| `stat1Color` | menu : `danger` / `mutation` / `accent` / `text` | Couleur du 1er chiffre |
| `stat2Label` / `stat2Value` / `stat2Color` | idem | 2e gros chiffre |
| `statementLine1` / `Line2` / `Line3` | textes | Statement choc, 3 lignes max |
| `statementLine3IsAccent` | case | Si coché, la 3e ligne sort en sage |
| `statementCaption` | texte | Petit caption mono après le statement, ex `› devine qui saute.` |
| `pivotKicker` | texte | Mini-titre avant le pivot |
| `pivotDeclarative` | texte | Déclaratif Inter caps avant la signature |
| `pivotSignature` | texte | Signature italique sage (ex `pilote.`) |
| `lever1Title` / `lever1Body` | texte / multiligne | Titre + body du levier 1. Idem 2 et 3. |
| `closePrefix` / `closeUrl` / `closeFooter` | textes | Bloc final |

### Storytime

| Champ | Type | Ce que ça fait |
|---|---|---|
| `kickerLabel` | texte | Top-left, ex: `REX / DEPUTY HEAD OF IT` |
| `hookLine1` / `hookLine2` | textes | 2 lignes Inter caps cream du hook |
| `hookSignature` | texte | Signature italique sage du hook |
| `setupKicker` | texte | Sous-titre du setup REX |
| `setupLine1` / `Line2` / `Line3` | textes | Le contexte personnel |
| `decayPrefix` | texte | Caption mono au-dessus de la démo |
| `decayWord1` / `decayWord2` | textes | 2 mots qui apparaissent puis tombent à l'écran |
| `decaySuffix` | texte | Caption mono rouge après la chute |
| `conceptKicker` | texte | Sous-titre avant le reveal |
| `conceptName` | texte | Nom du concept en italique sage (ex `l'offloading cognitif.`) |
| `conceptExplain1` / `Explain2` | textes | 2 lignes d'explication |
| `conceptSource` | texte | Citation source (ex `src · Risko & Gilbert, 2016`) |
| `imageLine1` / `Line2` | textes | L'image marquante (2 lignes principales) |
| `imageMuscle` / `imageWords` | textes | Les 2 callbacks plus petits (`les muscles.` / `les mots aussi.`) |
| `coinedDeclarative1` / `Declarative2` | textes | Déclaratif avant le concept coined |
| `coinedSignature` | texte | Le concept coined en italique sage |
| `coinedSubtitle` | texte | Sous-titre tape-machine après |
| `closeTagline` / `closeUrl` | textes | Close |

### TestDiagnostic

| Champ | Type | Ce que ça fait |
|---|---|---|
| `kickerLabel` / `riskBarLabel` | textes | Top-left + label de la barre de risque |
| `hookPrefix` | texte | Caption mono d'ouverture (ex `› scan initié`) |
| `hookDeclarative1` / `Declarative2` | textes | 2 lignes Inter caps |
| `hookSignature` | texte | Signature italique sage |
| `sign1Title` / `sign2Title` / `sign3Title` | textes | Les 3 signes (titres, peuvent contenir `\n` pour aller à la ligne) |
| `verdictLabel` | texte | Label "verdict" |
| `verdict0` / `verdict12` / `verdict3Prefix` | textes | Les 3 paliers de verdict |
| `verdict3Signature` | texte | Signature italique rouge sur le 3/3 |
| `ctaCommand` | texte | L'invite à commenter |
| `ctaSignature` | texte | Signature italique du CTA |
| `ctaUrl` | texte | URL du domaine |

### Sauvegarder une variante

Le bouton "Save" en bas du formulaire export tes valeurs en JSON. Trois options :
- **Save defaults** : tes valeurs deviennent les defaults pour les prochaines sessions
- **Copy to clipboard** : tu copies le JSON pour le coller ailleurs
- **Render with these props** : tu rends directement avec ces valeurs

Pour stocker plusieurs variantes (ex 1 par épisode), copie le JSON dans `videos-data/episode-04.json`. Pour rejouer une variante : ouvre Studio, colle le JSON dans le formulaire (ou l'importer via le menu).

---

## Rendu et fichiers de sortie

```bash
npm run render:rapport       # → out/rapport-terminal.mp4
npm run render:storytime     # → out/storytime.mp4
npm run render:test          # → out/test-diagnostic.mp4
npm run render:all           # les 3 dans la foulée
```

Chaque commande fait :
1. Render Remotion → mp4 brut intermédiaire (`_raw-*.mp4`)
2. Post-encode ffmpeg → mp4 final, profil **Constrained Baseline**, **yuv420p TV-range**, faststart, sans audio. Joue partout.
3. Suppression du brut intermédiaire

Format : 1080×1920, 30fps, taille ~1-3 Mo par vidéo (le contenu mostly dark + texte se compresse fort).

### Pourquoi ce format ?

- **H.264 Constrained Baseline** : profil le plus universellement supporté (vieux iOS, QuickTime, players embarqués, web). Le profil High par défaut de Remotion plante QuickTime.
- **yuv420p TV-range** (vs yuvj420p full-range) : seul format accepté en upload TikTok sans recompression hasardeuse.
- **faststart** : metadata en début de fichier = streaming-ready.
- **Pas d'audio** : tu ajoutes voix/musique dans ton outil son préféré après render.

---

## Charte DA appliquée

Tokens canoniques V2 Editorial Dark, alignés sur `app/assets/css/main.css` du site :

| Token | Valeur |
|---|---|
| `bg` | `#0F0F0E` (warm dark, pas pur noir) |
| `surface` | `#14140F` |
| `text` | `#E8E5DD` (cream warm) |
| `textSoft` | `#C5C2BB` |
| `muted` | `#8A8780` |
| `accent` | `#6CE3B5` (sage / mint, pas néon) |
| `accentGlow` | `rgba(108, 227, 181, 0.25)` (subtil) |
| `hairline` | `rgba(232, 229, 221, 0.10)` |
| `hairlineStrong` | `rgba(232, 229, 221, 0.25)` |
| `danger` | `#FF3E3E` |
| `mutation` | `#FFA630` |

Fonts :
- **Inter** (400/500/700/800/900) — déclaratif uppercase + body
- **Space Mono** (400/700) — kickers, captions tech, URL
- **Playfair Display** italic (400/500/700) — phrases signatures (le motif canonique du hero V2)

Pattern signature canonique : ligne déclarative en Inter caps cream **+** signature en Playfair italique sage juste en dessous. Utilisé sur tous les moments forts : reveal de concept, statement final, CTA.

Effets :
- **Particules sage en fond** (40 particules + lignes de connexion + vignette radiale). Port du `ParticleCanvas.vue` du site, déterministe pour rendu offline.
- **Grain léger** (opacity 0.025).
- **Pas de scanlines, pas de glitch RGB** — c'était la V1 brutaliste, on est sur du V2 Editorial Dark plus posé.
- **Hairlines 1px** au lieu de bordures épaisses.

Toute la palette est dans `src/lib/theme.ts`. Modifie une valeur, ça se propage partout.

---

## Safe zones TikTok / Reels / Shorts

Le contenu critique vit dans une zone qui ne sera jamais cachée par les UI plateformes :

| Côté | Marge | Pourquoi |
|---|---|---|
| Top | 240px | Status bar + parfois username overlay |
| Right | 200px | Boutons like / comment / share / save |
| Bottom | 400px | Caption + handle + nom de la musique |
| Left | 80px | Marge minimale (gestures swipe) |

Le wrapper `<SafeArea>` applique ça automatiquement. Toutes les compositions l'utilisent. Tu peux l'ajuster dans `src/lib/theme.ts` si TikTok change ses UI :

```ts
export const SAFE_AREA = {
  top: 240,
  right: 200,
  bottom: 400,
  left: 80,
} as const;
```

---

## Architecture du code

```
video/
├── README.md                           ← ce fichier
├── package.json                        ← scripts npm (render:*, dev, post-encode)
├── remotion.config.ts                  ← config render (codec, pixel format, etc.)
├── scripts/
│   └── post-encode.mjs                 ← ffmpeg conversion défensive Constrained Baseline
├── src/
│   ├── Root.tsx                        ← déclare les 3 compositions + leurs schémas
│   ├── index.css                       ← imports fonts Google
│   ├── lib/
│   │   ├── theme.ts                    ← COLORS, FONTS, VIDEO, SAFE_AREA
│   │   ├── schemas.ts                  ← ⚡ schémas zod = champs du formulaire
│   │   └── components/
│   │       ├── Background.tsx          ← BaseBg (warm dark) + Grain
│   │       ├── ParticleBackground.tsx  ← canvas particules sage + vignette
│   │       ├── KickerSpin.tsx          ← carré sage qui tourne (kicker top-left)
│   │       ├── SafeArea.tsx            ← wrapper safe-zones TikTok + TopBand
│   │       ├── Hairline.tsx            ← HairlineRule (trait 1px) + HairlineCard
│   │       ├── Signature.tsx           ← SignatureItalic (Playfair sage) + SignaturePair + SlamIn
│   │       ├── Reveal.tsx              ← fade + slide générique
│   │       ├── TypeOn.tsx              ← machine à écrire + WordsAppear
│   │       ├── GlitchText.tsx          ← flash 1-frame inversé (rare, transitions clés)
│   │       └── Footer.tsx              ← bandeau bas avec domaine sage
│   └── videos/
│       ├── RapportTerminal.tsx         ← consomme RapportTerminalProps
│       ├── Storytime.tsx               ← consomme StorytimeProps
│       └── TestDiagnostic.tsx          ← consomme TestDiagnosticProps
└── out/                                ← mp4 rendus (gitignored)
```

### Concepts Remotion

- `useCurrentFrame()` : retourne le frame actuel (0 au début, 30 à 1s @ 30fps)
- `interpolate(frame, [a,b], [from,to])` : mappe linéairement le frame
- `spring({frame, fps, config})` : anim spring (rebond physique) qui va de 0 à 1
- `<Sequence from={N} durationInFrames={M}>` : rend ses enfants pendant frames [N..N+M]

### Pattern Beat — penser en secondes (recommandé pour les nouvelles vidéos)

Pour éviter de jongler avec les frames, utilise `<BeatStack>` + `<Beat>` + helpers `Beat*`. Tu raisonnes en **secondes**, le framework convertit en frames automatiquement.

```tsx
<BeatStack>
  {/* Beat 1 = 5 secondes */}
  <Beat duration={5}>
    <BeatCaption delay={0.2} text="je perdais" size="huge" uppercase />
    <BeatCaption delay={1.6} text="mes mots." size="huge" uppercase />
    <BeatSignature delay={3.3} text="pour de vrai." />
  </Beat>

  {/* Beat 2 = 9.7 secondes — l'enchaînement est auto */}
  <Beat duration={9.7}>
    <BeatReveal delay={0.2} from="left">
      <KickerLabel>le contexte</KickerLabel>
    </BeatReveal>
    <BeatCaption delay={0.8} text="j'écris toute la journée." size="lg" />
    <BeatCaption delay={2.7} text="emails, specs..." size="sm" autoFit />
    <BeatReveal delay={5.0}><HairlineRule /></BeatReveal>
    <BeatCaption delay={5.5} text="à force..." size="sm" autoFit />
  </Beat>
</BeatStack>
```

**Helpers Beat dispo (tous prennent un `delay` en secondes) :**

| Helper | Usage |
|---|---|
| `<BeatCaption delay text size [uppercase] [autoFit]>` | texte qui apparaît mot par mot. Sizes : `huge` / `lg` / `md` / `sm` / `xs`. `autoFit` ajuste la vitesse pour que tout rentre dans le Beat. |
| `<BeatSignature delay text>` | phrase signature italique sage Playfair (entrée spring auto) |
| `<BeatReveal delay from distance>{children}` | wrapper fade + slide |
| `<BeatSlamIn delay>{children}` | entrée brutale overshoot (gros chiffres, URL) |
| `<BeatTypeOn delay text [charsPerFrame]>` | machine à écrire |
| `<BeatCounter delay durationSec value>` | chiffre qui s'anime de 0 à `value` sur `durationSec` secondes |

**Garantie :** un `delay` est toujours **relatif au début du Beat**. Tu n'as pas à savoir où le Beat se trouve dans la timeline globale.

**Auto-fit pour les captions longues :** ajoute `autoFit` à un `<BeatCaption>` long. Le framework ajuste `framesPerWord` pour que la phrase finisse 0.4s avant la fin du Beat. Plus de "elle finit avant que tous les mots soient apparus".

### Animations dispo (les helpers maison)

```tsx
// Fade + slide depuis le bas / top / left / right
<Reveal at={120} from="bottom" distance={40}>
  <h1>texte qui apparaît au frame 120</h1>
</Reveal>

// Slam plus brutal (overshoot scale 0.85→1)
<SlamIn at={120}>
  <div style={{ fontSize: 80 }}>BIG STAT</div>
</SlamIn>

// Phrase signature canonique (Playfair italique sage avec entrée auto)
<SignatureItalic text="le Survivant." at={120} fontSize={110} />

// Texte progressif type machine à écrire
<TypeOn text="› scan initié" start={5} charsPerFrame={1.4} />

// Apparition mot par mot avec léger fade
<WordsAppear text="je perdais mes mots" start={5} framesPerWord={12} />
```

---

## Tweaks fréquents (qui demandent du code)

Pour les changements qui ne passent pas par le formulaire, voici les points d'entrée.

### Allonger / raccourcir un beat

Dans `src/videos/<NomVidéo>.tsx`, trouve le `<Sequence from={X} durationInFrames={Y}>` du beat. Augmente / diminue `durationInFrames`. Pense à décaler le `from` des Sequences suivantes.

Si tu changes la durée totale de la vidéo, mets à jour aussi `durationInFrames` de la `<Composition>` correspondante dans `src/Root.tsx`.

### Changer la palette

`src/lib/theme.ts` → modifie la valeur de `COLORS.accent` (ou autre token). Ça se propage instantanément sur les 3 vidéos.

### Désactiver les particules (vidéo)

Commente `<ParticleBackground />` dans la vidéo concernée.

### Modifier la safe-zone

`src/lib/theme.ts` → modifie l'objet `SAFE_AREA`.

### Ajouter un champ au formulaire

3 lignes :
1. Ajoute le champ dans `src/lib/schemas.ts` (la prop dans le `z.object`)
2. Donne-lui une valeur par défaut dans le `*Defaults` de la même file
3. Utilise `props.tonNouveauChamp` dans le `.tsx` de la vidéo

### Ajouter un nouveau template (4e vidéo)

1. Crée `src/videos/MaNouvelleVideo.tsx` (peux dupliquer un existant)
2. Crée son schéma + ses defaults dans `src/lib/schemas.ts`
3. Enregistre-la dans `src/Root.tsx` avec `<Composition id="MaNouvelleVideo" .../>`
4. Ajoute un script dans `package.json` :
   ```json
   "render:maNouvelle": "remotion render MaNouvelleVideo out/_raw-mn.mp4 --x264-preset=medium && npm run _post -- _raw-mn.mp4 ma-nouvelle.mp4"
   ```

---

## Troubleshooting

### Le mp4 ne s'ouvre pas dans QuickTime / Aperçu / Quick Look

**Cause #1 (la plus piégeuse) : cache Quick Look macOS.** Si tu as essayé d'ouvrir le mp4 PENDANT qu'il était cassé, macOS a caché ce résultat. Même après réparation du fichier, Quick Look continue à refuser.

```bash
npm run cache:clear
# OU manuellement :
qlmanage -r cache && qlmanage -r
```

Puis re-tente d'ouvrir le fichier. C'est appelé automatiquement à la fin de `npm run render:all`.

**Cause #2 : fichier vraiment cassé.** Tu as cliqué le bouton Render de Studio (qui bypasse le post-encode), ou un `render:*` a planté en cours.

```bash
npm run fix:mp4
```

Ce script vérifie tous les mp4 dans `out/` et ré-encode ceux qui ne sont pas conformes (profil High au lieu de Constrained Baseline, faststart manquant, metadata couleur manquante dans le bitstream, fichier corrompu).

**Pour la suite** : utilise toujours `npm run render:rapport` / `storytime` / `test` (CLI), jamais le bouton Render de Studio pour les renders finaux.

### "Cannot find native binding" / rspack errors
Le `node_modules` a été contaminé par une install d'une autre archi (sandbox vs Mac). Solution :
```bash
rm -rf node_modules package-lock.json
npm install
```

### Studio ne charge pas / play fait rien
Hard-refresh le navigateur (Cmd+Shift+R). Vérifie qu'aucun `delayRender(...) timed out` n'apparaît dans le terminal du `npm run dev`.

### Les fonts ne s'affichent pas
Ouvre la console navigateur (Cmd+Option+I). Si tu vois des erreurs `googleapis.com Failed to load`, c'est que ton réseau bloque Google Fonts. Le fallback système prend le relais (ui-monospace + system-ui), donc le rendu reste lisible mais sans Playfair italique.

### Le render semble bloqué au milieu
Si le canvas (particules) crashe, le render hang. Vérifie le terminal — un message `Browser failed to load` ou un crash de chrome-headless est typique. Solution : reduce `COUNT` dans `src/lib/components/ParticleBackground.tsx` (40 par défaut).

### "concurrency higher than CPU cores"
Réduis le `--concurrency` dans le script render à un nombre ≤ tes CPU cores (4 sur un MacBook M1 standard).

### Les particules dominent et cachent le texte
Dans `src/lib/components/ParticleBackground.tsx`, baisse `ALPHA_MIN` / `ALPHA_MAX` (par ex. 0.1 / 0.35). Ou augmente `VIGNETTE_ALPHA` (assombrit les bords). Ou commente carrément `<ParticleBackground />` dans la vidéo concernée.

---

## Hors-scope (à faire ailleurs)

- **Voix off** : enregistre dans QuickTime / Logic / Audacity, pose-la sur le mp4 dans CapCut / DaVinci. Le mp4 sort muet de Remotion volontairement.
- **Musique** : idem. La piste audio se monte après render.
- **Sous-titres TikTok auto** : la plateforme le fait native sur upload. Tu n'as rien à coder.
- **Auto-publish TikTok / IG** : à faire manuellement, l'API TikTok n'est pas exposée pour les comptes perso.
- **A/B testing de hooks** : duplique une variante via "Save props" → modifie juste le hook → render. Compare manuellement les vues à 3s.

---

## Stratégie de mesure (sur 1 mois)

Pour décider quel format pousser ensuite, surveille par vidéo :

- **% retention à 3s** → qualité du hook. Sous 50% = hook à retravailler. Au-dessus de 65% = tu tiens un format.
- **% complete watch** → tient-elle 30/40/45s ?
- **Comments / shares / saves** → signal algo TikTok le plus fort. `TestDiagnostic` est conçu pour maximiser ça (CTA explicite à commenter le score).
- **CTR sur survivant-ia.ch en bio** → mesure-le côté Plausible / PostHog avec des UTM.

Plan baseline : 3 vidéos × 4 semaines = **12 publications minimum** sur 1 mois pour avoir un signal exploitable. À ce moment-là, identifie le format gagnant et demande des variantes ciblées.
