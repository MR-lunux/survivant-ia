# Vidéo manifeste Remotion — V1 "Le Survivant"

**Date** : 2026-05-03
**Statut** : Spec validée — prête pour plan d'implémentation
**Périmètre** : nouveau sous-dossier `video/` à la racine du repo (projet Remotion isolé), modifications mineures sur `.gitignore` et `vercel.json`. Aucun impact sur le site Nuxt existant.

---

## 1. Contexte & objectif

Survivant-IA dispose d'un site (survivant-ia.ch) et d'un compte Instagram (`@survivant.ia`) actuellement **vide**. La présence sur les réseaux sociaux ne produit aucun trafic ni notoriété. Cette spec décrit la première vidéo d'une stratégie de contenu social, conçue pour être produite avec **Remotion** (motion graphics codés en React) en complément de la stack Nuxt/Vue du site.

**Objectif unique de cette V1** : produire une vidéo manifeste de 30 secondes, format vertical 9:16 (avec dérivé 4:5 pour LinkedIn), qui :

1. Présente le site Survivant-IA et ce qu'il fait (scanner d'obsolescence IA + newsletter La Fréquence).
2. Expose ce qui le différencie (gratuit, hebdomadaire, brutaliste, anti-bootcamp).
3. Pousse vers `survivant-ia.ch` (CTA primaire — pas Instagram tant que le profil est vide).

**Métaobjectif technique** : valider la stack Remotion + IA comme pipeline de production vidéo pour Survivant. Si la V1 livre, on industrialise (skill dédié, multi-format natif, plus de vidéos).

**Hypothèses validées en brainstorming** :
- Format unique 9:16 pour V1, dérivé 4:5 LinkedIn via safe-zone (option 2 du choix multi-format).
- Une seule vidéo "tout-en-un" plutôt que 2-3 vidéos plus ciblées.
- Angle persona "Le Survivant" — hook : « Je ne suis pas un coach IA. Je suis le Survivant. »
- 100% motion graphics (pas de tournage face caméra) pour V1.
- Voix-off enregistrée par Mathieu (Shure MV7+).
- Musique générée via Strudel (`renatoworks/strudel-claude`) pour cohérence DA "tout est codé".
- CTA = `survivant-ia.ch` (le site), pas le compte Instagram vide.

---

## 2. Architecture & setup technique

### Structure du repo après V1

```
survivor/
├── app/                  # Nuxt (inchangé)
├── content/
├── public/
├── package.json          # Nuxt deps
├── nuxt.config.ts
├── vercel.json           # modif : ignore video/
├── .gitignore            # modif : ajoute video/node_modules, video/out, video/.cache
└── video/                # NOUVEAU — projet Remotion isolé
    ├── package.json      # deps React + Remotion (séparé du root)
    ├── remotion.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── src/
    │   ├── Root.tsx              # déclare les compositions
    │   ├── theme.ts              # palette + fonts (dupliqués depuis le site)
    │   ├── compositions/
    │   │   └── Manifeste.tsx     # la composition principale
    │   ├── beats/
    │   │   ├── Beat1Hook.tsx
    │   │   ├── Beat2Constat.tsx
    │   │   ├── Beat3Scanner.tsx
    │   │   ├── Beat4Unique.tsx
    │   │   └── Beat5CTA.tsx
    │   ├── components/
    │   │   ├── KickerLabel.tsx   # carré vert qui spin
    │   │   ├── BrandFrame.tsx    # frame template (kicker + safe-zone)
    │   │   └── Strikethrough.tsx # ligne barrée animée
    │   ├── animations/
    │   │   ├── slamIn.ts         # spring helper pour type qui slam
    │   │   ├── typeIn.ts         # type-in lettre par lettre / mot par mot
    │   │   └── glitchFlash.ts    # flash 1-frame inversé
    │   └── captions.ts           # transcription voix-off + timings
    ├── assets/
    │   ├── audio/
    │   │   ├── voiceover.wav     # MV7+ source — IGNORÉ (~30 Mo)
    │   │   ├── voiceover.mp3     # encodée pour le render — committed
    │   │   └── music.mp3         # exporté depuis Strudel — committed
    │   └── sfx/
    │       ├── keyboard-type.mp3
    │       ├── woosh.mp3
    │       ├── glitch-flash.mp3
    │       ├── scan-loop.mp3
    │       ├── thud-stamp.mp3
    │       └── tone-final.mp3
    └── out/                      # ignoré par git
        ├── manifeste-9-16-v1.mp4
        └── manifeste-4-5-v1.mp4
```

### Setup commands (à exécuter une seule fois)

```bash
# Depuis la racine du repo Survivant
npx create-video@latest video        # template Blank + TailwindCSS
cd video
npx skills add remotion-dev/skills   # installe les Remotion Skills officielles
```

### Stack du sous-projet `video/`

- **Remotion 4.x** (React 18+) — moteur de composition.
- **TailwindCSS** — utility CSS.
- **TypeScript strict** — typing complet sur compositions et props.
- **Fonts** : Space Mono (400/700) + Inter (700/800/900) chargées via `@remotion/google-fonts`.
- **Audio** : `<Audio>` de `remotion` pour voix-off, musique, SFX.

### Isolation Vue/React

Aucun partage de code entre le site Nuxt et le projet Remotion sur cette V1. La duplication est volontaire et acceptée :

- `video/src/theme.ts` re-déclare manuellement la palette du site (`#0D0D0D`, `#00FF41`, `#FFA630`, `#FF3E3E`, `#5BC0EB`, `#3DDC84`).
- `video/src/components/KickerLabel.tsx` réimplémente en React le pattern Vue de `app/components/KickerLabel.vue` (carré vert qui spin, `kicker-spin 8s linear infinite`).

Si plus tard on multiplie les vidéos, on extraira ces tokens dans un module partagé via npm/pnpm workspaces (cf. Section 6).

### Modifications repo principal

`.gitignore` (ajouter en bas) :
```
# Remotion sub-project
video/node_modules
video/out
video/.cache
video/.remotion
video/assets/audio/*.wav
```

Les `.wav` sources (voix-off MV7+) ne sont pas commitées (10-30 Mo par take). Les `.mp3` encodés (voiceover, music, SFX) le sont — ils sont les inputs reproductibles du render et sont petits (~1-5 Mo total).

`vercel.json` : **aucune modification nécessaire**. Le `buildCommand` (`npm run build` / Nuxt) ne touche pas le sous-dossier `video/` ; Vercel ignore naturellement le projet Remotion. À surveiller : si un jour Vercel scan le repo entier pour les deps, on ajoutera un `ignoreCommand` ou un `.vercelignore` pour exclure `video/`.

---

## 3. Composition — découpage des 5 beats

La vidéo manifeste fait **30 secondes** à **30 fps**, soit **900 frames** au total. Elle est découpée en 5 `<Sequence>` Remotion, chacune représentant un beat narratif.

### Beat 1 — Hook (0:00 → 0:03, frames 0-90)

**Voix-off** : « Je ne suis pas un coach IA. Je suis le Survivant. »

**Visuel peak (0:02)** : KickerLabel "SURVIVANT-IA" en haut, big type centré : "JE NE SUIS PAS UN ~~COACH IA~~. JE SUIS LE SURVIVANT." (avec "COACH IA" barré en rouge, "LE SURVIVANT" en accent green).

**Animations** :
- KickerLabel slam-in (spring overshoot) à frame 0.
- "JE NE SUIS PAS" type-in lettre par lettre (frames 0-30).
- "UN COACH IA" apparait + barre rouge qui le strike à frame 45 (woosh SFX synchronisé).
- "JE SUIS LE SURVIVANT." slam vert + flash blanc 1 frame à frame 75.

### Beat 2 — Le constat (0:03 → 0:09, frames 90-270)

**Voix-off** : « D'ici 2030, 40 % des métiers vont muter ou disparaître. Le tien aussi, peut-être. »

**Visuel peak (0:06)** : KickerLabel "LE CONSTAT". Big number "40%" centré en danger red, sous-titre "DES MÉTIERS VONT MUTER D'ICI 2030".

**Animations** :
- Hard cut depuis Beat 1 (pas de fade).
- Compteur "00" → "40" frame-stepped (pas smooth) sur frames 90-150.
- "%" claque en mutation orange à frame 150.
- Sous-titre type-in en stagger mot par mot.
- Au "Le tien aussi" (~frame 210), palette glisse de danger rouge → mutation orange.

### Beat 3 — Le site / scanner (0:09 → 0:17, frames 270-510)

**Voix-off** : « Sur survivant-ia.ch, tu scannes ton métier. Tu vois ce qui meurt, ce qui mute, ce qui survit. »

**Visuel peak (0:14)** : KickerLabel "SCANNER". Mock du scanner : input "→ greffier(ère)", ligne de scan verte qui descend, verdict stamp "MUTATION 58%" qui claque.

**Animations** :
- "survivant-ia.ch" type-in dans le champ (SFX clavier).
- "greffier(ère)" remplace l'URL — démo concrète (recyclage du commit `711808b`).
- Ligne de scan verte qui descend en boucle (loop, glow), audio "scanning".
- "VERDICT : MUTATION 58%" stamp à frame 420 (flash + thud SFX).
- Sous-titre "ce qui meurt / mute / survit" en pied de frame, fade-stagger.

### Beat 4 — Ce qui me rend unique (0:17 → 0:25, frames 510-750)

**Voix-off** : « Ici, il n'y a pas de bootcamp à 3000€. Pas de cours. Juste un signal clair, gratuit, chaque semaine. »

**Visuel peak (0:22)** : KickerLabel "L'UNIQUE". Liste verticale de ce qu'on n'est PAS (BOOTCAMP À 3000€, CERTIFICATIONS, COURS EN LIGNE) qui se fait barrer ligne par ligne, puis "SIGNAL CLAIR. GRATUIT. HEBDO." en accent green encadré.

**Animations** :
- Liste apparait ligne par ligne (slam-in stagger).
- Chaque ligne se fait barrer en rouge avec un swipe (woosh SFX synchronisé voix-off).
- "SIGNAL CLAIR. GRATUIT. HEBDO." apparait en vert, encadré, plus grand à frame 690.

### Beat 5 — CTA (0:25 → 0:30, frames 750-900)

**Voix-off** : « survivant-ia.ch. 5 minutes par semaine pour rester en avance. »

**Visuel peak (0:28)** : KickerLabel "PRENDS LE VIRAGE". URL "SURVIVANT-IA.CH" centrée en accent green dans un cadre qui pulse (glow breathing). Sous-titre "5 MIN / SEMAINE. POUR RESTER EN AVANCE." (avec "EN AVANCE" en vert).

**Animations** :
- URL slam-in dans son cadre vert qui pulse doucement (breathing 1.5s).
- "5 MIN / SEMAINE" type-in synchro avec la voix.
- "EN AVANCE" en vert claque (spring) au dernier mot.
- Fond gradient vert qui respire, frame finale tient 0.5s sur l'URL avant cut.
- Pas de logo final — l'URL EST le logo final.

### Langage de motion (consistant across beats)

- **Cuts secs** entre beats (jamais de fade), avec glitch-flash 1 frame en transition.
- **Type qui slam** (spring overshoot puis settle) pour tous les big titles.
- **KickerLabel persistant** en haut à gauche, change de label par beat.
- **Palette progressive** : danger → mutation → accent green au fil de la vidéo.
- **Aucune animation smooth-cinematic** (pas de Lerp lent, pas d'ease-out lent). Tout doit "claquer".

---

## 4. Asset pipeline

### Voix-off

- **Hardware** : Shure MV7+ (USB-C, DSP intégré).
- **Format source** : `voiceover.wav` 24-bit / 48kHz, mono, gardé non-commité (déjà ignoré via `video/assets/audio/*.wav` si on l'ajoute, ou via `.gitignore` global pour les wav).
- **Format render** : `voiceover.mp3` 320kbps utilisé par Remotion.
- **Process** : Mathieu lit le script (75 mots, ~30s), 2-3 prises, on garde la meilleure. Tonalité "Survivant" : posée, présente, légèrement sombre — pas timide, pas exalté.
- **Sync** : transcription exacte avec timings frame-précis dans `video/src/captions.ts`. Pas de génération auto. 5 segments alignés sur les 5 beats.

### Musique (Strudel)

- **Tool** : `renatoworks/strudel-claude` cloné séparément à `~/Documents/strudel-claude/`, dev server tourne en parallèle.
- **Process** :
  1. Claude écrit des patches Strudel via l'API REST (`/api/code`, `/api/play`).
  2. Direction sonore : drone sub-bass minimal sur Beat 1, kick sourd qui entre Beat 2, texture glitch synchronisée au scanner Beat 3, tension qui monte Beat 4, drop sec + sub-pulse Beat 5.
  3. User enregistre le WAV depuis le browser strudel-claude.
  4. Conversion WAV → MP3 (320kbps) → `video/assets/audio/music.mp3`.
- **Niveau** : -18 dB sous la voix-off pour ne jamais la masquer.
- **Avantage** : si une durée de beat change dans Remotion, on régénère la musique en 5 minutes au lieu de re-éditer un audio.

### SFX

- **Source primaire** : Strudel pour woosh, glitch-flash, scan-loop, thud-stamp, tone-final (cohérence sonore totale).
- **Fallback** : Mixkit / Freesound (CC0) pour `keyboard-type.mp3` si Strudel ne produit pas un type-in convaincant.
- **Fichiers** : `video/assets/sfx/*.mp3`.

### Fonts

- `@remotion/google-fonts/SpaceMono` (poids 400, 700) pour KickerLabel et copy mono.
- `@remotion/google-fonts/Inter` (poids 700, 800, 900) pour les big titles uppercase.
- Preload built-in, pas de FOIT.

### Captions

- Pas de captions auto-générées par-dessus la vidéo. Le big text à l'écran EST déjà la caption visuelle (lisible 100% sans son).
- Pour LinkedIn (auto-mute par défaut), la vidéo est compréhensible muette.

---

## 5. Render & export

### Configuration Remotion

```tsx
// video/src/Root.tsx
<Composition
  id="Manifeste-9-16"
  component={Manifeste}
  durationInFrames={900}
  fps={30}
  width={1080}
  height={1920}
  defaultProps={{ format: '9:16' }}
/>

<Composition
  id="Manifeste-4-5"
  component={Manifeste}
  durationInFrames={900}
  fps={30}
  width={1080}
  height={1350}
  defaultProps={{ format: '4:5' }}
/>
```

La composition `Manifeste` reçoit une prop `format` et adapte le layout via la safe-zone : tous les éléments critiques (big titles, URL CTA, scanner mock) sont contenus dans une zone centrale 1080×1350. En 9:16, le KickerLabel et le `frame-bottom` (timestamp) peuvent vivre dans la marge top/bottom ; en 4:5, ces éléments sont condensés ou masqués selon l'espace.

### Commande de render

```bash
# Dans video/
npm run render
```

Configuré dans `video/package.json` pour rendre les deux formats :

```json
{
  "scripts": {
    "render": "remotion render Manifeste-9-16 out/manifeste-9-16-v1.mp4 --crf 18 --concurrency 8 && remotion render Manifeste-4-5 out/manifeste-4-5-v1.mp4 --crf 18 --concurrency 8"
  }
}
```

### Sortie

- **MP4 H.264** + **AAC 192kbps** (compatibilité universelle Reels/TikTok/LinkedIn).
- 9:16 : `1080×1920`, ~5-10 Mo.
- 4:5 : `1080×1350`, ~5-10 Mo.
- Performance attendue sur Mac M-series : ~30-60s de render par format.

### Convention de nommage

- `video/out/manifeste-9-16-v1.mp4`, `manifeste-9-16-v2.mp4` (à chaque révision majeure).
- Idem 4:5.
- Les MP4 ne sont **pas commités** (ignorés via `video/out/`).

### Gestion d'erreurs

- TS strict : composition fail-fast au build si props invalides.
- Audio drift / sync : ajustement du `from` de la `<Sequence>` correspondante. Pas un cas d'erreur.
- Render timeout : très rare sur 30s. Fallback : baisser `--concurrency` ou pré-rendre les frames.

### Preview workflow

- `npm run dev` ouvre Remotion Studio sur `http://localhost:3000`.
- Scrubber temporel, hot-reload sur les changements TS/CSS, switch live entre composition 9:16 et 4:5 (validation safe-zone).

---

## 6. Critères d'acceptation V1

- [ ] Hook lisible et compréhensible muet sur les 2 premières secondes (test : visionner sans son sur tel vertical).
- [ ] Voix-off synchronisée avec les frames (≤ 100ms de drift sur tout segment).
- [ ] CTA `survivant-ia.ch` lisible 1.5s minimum à la fin.
- [ ] Render 9:16 final < 10 Mo, qualité visuelle sans artefact.
- [ ] Render 4:5 final < 10 Mo, contenu critique non coupé (test safe-zone).
- [ ] KickerLabel spin animé sans saccade (vérification frame par frame autour de la jointure 8s).
- [ ] Aucun `//` dans la copy ni les visuels.
- [ ] Aucune négation tronquée (toujours "ne…pas").
- [ ] Domaine `survivant-ia.ch` partout, jamais `.com`.
- [ ] La vidéo est lisible et convaincante muette (test plateforme : LinkedIn auto-mute).

---

## 7. Future work (post-V1)

À ne PAS implémenter dans cette V1, mais documenté pour mémoire :

1. **Skill `survivant-ia-video`** — extraction des patterns une fois la V1 livrée et validée. Cible : V2 ou V3. Codifie : Brand frame réutilisable, presets de timing par template (manifeste, scanner-driven, founder-pitch), voix-off-sync helper, command de scaffold pour nouvelle vidéo, règles brand auto (négation, domaine, KickerLabel, palette).
2. **Multi-format dédié 4:5 et 1:1 (option 3 LinkedIn-natif)** — si LinkedIn génère du trafic significatif sur la V1, redesign LinkedIn-natif avec layouts repensés (pas juste safe-zone).
3. **Captions auto-générées** — pour V2 avec WhisperX (timing précis sur audio source), permet d'éditer la voix-off plus librement sans re-typer manuellement les timings.
4. **Bibliothèque de composants partagés** — si on fait 5+ vidéos, extraction d'un module `video/src/components/brand/` avec KickerLabel, Constat, ScannerMock, Strikethrough, CTA paramétrables.
5. **Workspaces npm/pnpm** — quand il y aura assez de vidéos pour justifier le partage de tokens design avec le site Nuxt (refactorisation à l'option 3 du choix de setup).
6. **Variantes additionnelles** — vidéo "scanner-driven" (Beat 3 étendu, démo plus longue d'un métier réel), vidéo "founder-pitch" 45s (storytelling).

---

## 8. Timeline de production V1 (estimation)

- Setup `video/` + Remotion Skills : ~30 min (Claude).
- Composition `Manifeste.tsx` avec 5 beats + animations + safe-zone 4:5 : ~3-4 h (Claude).
- Strudel-claude setup + composition musique synchronisée beats : ~1 h (Claude + Mathieu pour le record WAV).
- Enregistrement voix-off MV7+ : ~15 min (Mathieu).
- Sync voix + first render + ajustements : ~1-2 h (Claude + Mathieu en review).
- Render final 9:16 + 4:5 : ~5 min.

**Total** : ~1 demi-journée focus pour livrer la V1.

---

## 9. Hors-scope explicite

Ces points NE SONT PAS dans la V1 et ne doivent pas être implémentés :

- Tests automatisés (la "validation" = visionnage humain).
- CI/CD pour le rendu vidéo (Vercel ignore `video/`, on render en local).
- Upload automatique vers les plateformes (TikTok, Insta, LinkedIn) — Mathieu uploade manuellement.
- Sous-titres auto-générés (texte burnt-in dans la composition suffit).
- Variants de vidéo (scanner-driven, founder-pitch, etc. — sont en future work).
- Skill `survivant-ia-video` (future work).
- Workspaces / refactorisation du repo (future work).
- TTS de la voix-off (la voix de Mathieu est non-négociable pour le persona Survivant).
