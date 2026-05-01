# Scanner — Soft gate de conversion newsletter

**Date** : 2026-05-01
**Statut** : Spec validée — prête pour plan d'implémentation
**Périmètre** : `app/pages/scanner.vue`, nouveau composant `ScannerGate.vue`, nouveau composable `useScannerUnlock.ts`, modifications mineures sur `server/api/subscribe.post.ts`, `app/pages/confidentialite.vue`.

---

## 1. Contexte & objectif

Le scanner d'obsolescence IA (`/scanner`) est aujourd'hui **trop gratifiant** : il délivre l'analyse complète (score, horizon, statut, trajectoire, 3 actions, sources) sans contrepartie. Résultat : usage élevé, conversion newsletter quasi nulle.

L'objectif est de transformer le scanner en aimant pour la newsletter **La Fréquence** (conversion #1 du site) sans casser la promesse de service public ("score gratuit en 10 secondes"). On applique la stratégie de **rétention de la solution** :

- **Diagnostic gratuit** : SCORE / HORIZON / STATUT révélés sans friction.
- **Plan d'action verrouillé** : TRAJECTOIRE + 3 ACTIONS + SOURCES nécessitent une inscription email.

L'effet psychologique recherché : pic de tension sur le score → soulagement par l'inscription → audience qualifiée (gens conscients du problème, en recherche active).

**Hypothèses validées en brainstorming** :
- Gate **universel** sur les 4 statuts (danger / mutation / protégé / croissance), avec copy adapté par statut. Permet aussi d'apprendre (via PostHog) si la conversion varie fortement par statut.
- Position du gate : **sous les placeholders redactés** de TRAJECTOIRE et ACTIONS (le visiteur voit la "silhouette" de ce qui lui manque).
- Timing : le scan continue jusqu'à ~88% de progression avec une phase "DONNÉES CLASSIFIÉES" stylée, puis le gate apparaît.
- Post-unlock : message de confirmation `// ACCÈS ACCORDÉ`, pas de cross-sell.
- Récompense de la fidélité : flag `localStorage.hasUnlockedScanner` permet aux returning visitors de bypass le gate.

---

## 2. Architecture

### Découpage en composants

```
app/
  components/
    ScannerGate.vue              ← nouveau : encart verrouillé + mini-form
  composables/
    useScannerUnlock.ts          ← nouveau : lecture/écriture localStorage, SSR-safe
  pages/
    scanner.vue                  ← orchestre la machine d'états + animations
server/
  api/
    subscribe.post.ts            ← modif : accepte source, job_slug, job_status, honeypot
```

### Composable `useScannerUnlock()`

Source de vérité du flag de déverrouillage. Responsabilité unique : lire/écrire `localStorage.hasUnlockedScanner`, SSR-safe.

```ts
// app/composables/useScannerUnlock.ts
export function useScannerUnlock() {
  const isUnlocked = ref(false)

  onMounted(() => {
    isUnlocked.value = localStorage.getItem('hasUnlockedScanner') === 'true'
  })

  function markUnlocked() {
    isUnlocked.value = true
    localStorage.setItem('hasUnlockedScanner', 'true')
  }

  return { isUnlocked, markUnlocked }
}
```

Pourquoi un composable séparé : isolation testable, réutilisable ailleurs (ex. teaser conditionnel sur d'autres pages).

### Composant `<ScannerGate>`

- Props : `:job: Job`
- Émet : `@unlocked` après soumission API réussie
- Responsabilités : afficher l'encart + copy par statut, gérer le mini-form, appeler `/api/subscribe`, appeler `markUnlocked()` puis émettre l'event
- N'orchestre pas l'animation de reveal — c'est la responsabilité du parent

### Machine d'états dans `scanner.vue`

```
phase: 'idle' | 'scanning' | 'gated' | 'unlocking' | 'unlocked'
```

| État | Transition | Déclencheur |
|---|---|---|
| `idle` | → `scanning` | `selectJob()` ou `?job=` URL |
| `scanning` | → `gated` | scan terminé + `!isUnlocked` |
| `scanning` | → `unlocked` | scan terminé + `isUnlocked` (skip gate) |
| `gated` | → `unlocking` | `<ScannerGate>` émet `unlocked` |
| `unlocking` | → `unlocked` | scramble TRAJECTOIRE + ACTIONS terminé |
| n'importe lequel | → `idle` | `reset()` |

**Note** : à reset, le flag `localStorage` n'est jamais touché — seul l'état du scan est nettoyé.

---

## 3. Privacy / RGPD — mises à jour obligatoires

Le contrat actuel ("aucune inscription") devient mensonger. Quatre fichiers à mettre à jour **dans la même PR** :

| Fichier | Modification |
|---|---|
| `app/pages/scanner.vue` (useSeoMeta:10-15) | `"Gratuit, sans inscription"` → `"Score gratuit en 10 secondes. Plan d'action complet sur inscription à La Fréquence."` (description, ogDescription, twitterDescription) |
| `app/pages/scanner.vue` (FAQ Q3, ligne 67-71) | Réécriture honnête : *"Le score, l'horizon et le statut sont accessibles sans inscription. Le plan d'action complet (trajectoire + 3 axes pratiques) est réservé aux abonnés de la newsletter La Fréquence — l'inscription se fait avec votre email et votre prénom, conformément à notre politique de confidentialité."* |
| `app/pages/scanner.vue` (JSON-LD FAQPage Q3) | Même reformulation côté schema.org (sinon Google indexe la fausse promesse) |
| `app/pages/confidentialite.vue` | Ajouter un paragraphe : *"Lorsque vous déverrouillez le rapport complet du scanner via votre email, nous stockons un indicateur technique (`hasUnlockedScanner`) dans le `localStorage` de votre navigateur. Cet indicateur ne contient aucune donnée personnelle — il sert uniquement à éviter de vous redemander votre email lors de visites ultérieures. Vous pouvez le supprimer à tout moment via les paramètres de votre navigateur."* |

**Position RGPD/LPD** : le boolean `hasUnlockedScanner` (sans ID associé) est une *strict UX preference*, pas un cookie de tracking → pas de consent banner requis pour ce flag seul. Le mini-form du gate inclut le **même checkbox de consentement obligatoire** que `NewsletterForm.vue` (lien vers `/confidentialite`), ce qui couvre la collecte d'email + prénom.

---

## 4. Chorégraphie d'animation

Trois séquences, gérées par `scanner.vue` qui appelle `<ScannerGate>` au moment opportun.

### Séquence 1 — Scan jusqu'au gate (~3.5s, inchangé)

| Étape | Durée | Progress | Action |
|---|---|---|---|
| Init | 200ms | 5% | barre apparaît |
| HORIZON scramble + reveal | 500 + 180ms | 20% | redact bar → texte décrypté |
| STATUT scramble + reveal | 700 + 220ms | 40% | idem, couleur selon statut |
| RISQUE count-up | 500 + 600 + 280ms | 60% | scramble → décompte |

Aucune modification du code existant pour cette séquence. Si `isUnlocked === true`, on continue directement vers la séquence 3 (au lieu de la 2).

### Séquence 2 — Phase classifiée + révélation du gate (~1.2s, NOUVELLE)

Déclenchée si `!isUnlocked.value` :

| Étape | Durée | Progress | Action |
|---|---|---|---|
| Pulse "// CLASSIFIÉ" | 500ms | 70% | sous-titre `// CLASSIFIÉ — ACCÈS RESTREINT` fade-in au-dessus de TRAJECTOIRE |
| Shimmer one-shot | 500ms | 80% | classe `.is-shimmering` ajoutée temporairement aux `.redact-line` et aux `.action-item.is-locked` (single-pass via JS) |
| Gate fade-in | 200ms | 88% | `<ScannerGate>` apparaît avec fade + translate-y léger |

**Détails d'implémentation** :
- `phase.value = 'gated'` à la fin de l'étape 7 → le parent rend `<ScannerGate>` et émet `scanner_gate_shown`.
- La progress bar reste visible à 88% : ajouter `.report[data-state="gated"] .report-progress { opacity: 1; }` dans le scoped CSS.
- Le sous-titre "// CLASSIFIÉ" : nouveau ref `classifiedVisible: ref(false)` rendu conditionnellement, pas un nouveau composant.
- Shimmer one-shot : nouvelle classe `.is-shimmering` qui déclenche une animation single-pass de 500ms (au lieu de l'`infinite` du `redact-shimmer` actuel).

### Séquence 3 — Déverrouillage et révélation (~2.4s, NOUVELLE)

Déclenchée par `<ScannerGate>` émettant `@unlocked`. Le parent appelle `unlockAndReveal(job)` :

| Étape | Durée | Progress | Action |
|---|---|---|---|
| Gate fade-out | 250ms | 88% | `<ScannerGate>` disparaît avec fade |
| TRAJECTOIRE scramble | 700ms | 92% | placeholder remplacé par texte qui scramble caractère par caractère puis settle |
| ACTIONS reveal en cascade | 3 × 350ms | 95% | chaque action passe par scramble → texte final, délai 350ms entre chacune |
| SOURCES + result-zone | 400ms | 100% | sources cascade in (logique actuelle), result-zone fade in |

**Changements requis sur le code existant** :

1. **TRAJECTOIRE n'a actuellement pas de scramble** (juste un fade `traj-revealed`, ligne 1074-1075). Ajouter :
   - `trajText: ref('')` + `trajState: ref<DecryptState>('locked')`
   - Réutiliser la fonction `scrambleTo()` existante (ligne 176-198), aucune nouvelle helper nécessaire.

2. **ACTIONS n'ont actuellement pas de scramble texte** (juste un toggle `actionsRevealed: ref<boolean[]>`). Transformer en :
   - `actionTexts: ref<string[]>(['', '', ''])`
   - `actionStates: ref<DecryptState[]>(['locked', 'locked', 'locked'])`
   - Boucle d'appels successifs à `scrambleTo()`.

3. **Le scan "déjà déverrouillé"** (returning visitor) doit utiliser ces mêmes mécaniques pour cohérence. Donc le scramble TRAJECTOIRE/ACTIONS devient le **comportement par défaut**, pas un cas spécial post-unlock.

### Reduced motion

Helper local : `function rm(ms: number) { return reducedMotion.value ? 0 : ms }`. Toutes les durées de scramble/sleep passent à travers. Le shimmer one-shot est skippé. Le gate apparaît sans fade. La machine d'états reste identique — seules les durées passent à 0.

---

## 5. UI du gate — copy + structure visuelle

### Encart — composition top-to-bottom

```
┌──────────────────────────────────────────────────┐
│  [ CLASSIFIÉ ░░ NIVEAU 2 ]            [ icône 🔒]│
│                                                  │
│  Diagnostic confirmé : EN DANGER.               │
│  Le plan d'action reste classifié.              │
│                                                  │
│  La Fréquence te montre comment mettre ces 3    │
│  axes en pratique — une technique par semaine.  │
│                                                  │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ Ton prénom   │  │ ton@email.com          │   │
│  └──────────────┘  └────────────────────────┘   │
│                                                  │
│  ☐ J'accepte de recevoir... [Politique]         │
│                                                  │
│  [ DÉVERROUILLER LE PLAN D'ACTION ]             │
│                                                  │
│  // 7 jours pour te désinscrire en 1 clic       │
└──────────────────────────────────────────────────┘
```

### Treatment visuel

- Border `1px solid rgba(0, 255, 65, 0.4)` (légèrement plus marqué que la report card).
- Padding `1.75rem 1.5rem` (mobile : `1.25rem 1rem`).
- Background `rgba(0, 255, 65, 0.02)` (tint pour distinguer du fond du rapport).
- Badge `[ CLASSIFIÉ ░░ NIVEAU 2 ]` : reprend l'esthétique `.redact` existante (`background: #2C2C2C`, chevrons en `--color-accent`).
- Pas de canvas wave, pas de `ScannerBorder`. Volontairement minimal — contraste avec NewsletterForm.

### Copy par statut

| `job.status` | Headline | Sub-line (réutilise `ctaHook` existant, scanner.vue:277-285) |
|---|---|---|
| `danger` | **Diagnostic confirmé : EN DANGER. Le plan d'action reste classifié.** | La Fréquence te montre comment mettre ces 3 axes en pratique — une technique concrète par semaine. |
| `mutation` | **Diagnostic confirmé : EN MUTATION. Ta carte de navigation reste classifiée.** | La Fréquence t'accompagne dans cette mutation — une carte de survie par semaine, sans jargon. |
| `protege` | **Diagnostic confirmé : PROTÉGÉ. Le plan pour le rester est classifié.** | La Fréquence te permet de garder une longueur d'avance — sans devenir expert en IA. |
| `croissance` | **Diagnostic confirmé : EN CROISSANCE. Le plan pour capitaliser est classifié.** | La Fréquence te donne les outils pour capitaliser sur ta position — avant que la fenêtre ne se referme. |

**Bouton uniforme** : `DÉVERROUILLER LE PLAN D'ACTION` (4 statuts, simplifie le tracking).

**Choix éditoriaux** :
- *"Diagnostic confirmé"* fait écho au lexique du rapport déclassifié.
- Formulation passive *"reste classifié"* — ce n'est pas Mathieu qui bloque, c'est le rapport. Réduit le sentiment de manipulation.
- Bouton n'évoque pas la newsletter — l'action proposée c'est *déverrouiller*, pas *s'abonner*. La Fréquence est mentionnée dans la sub-line. Inversion de framing délibérée.
- Micro-rassurance "// 7 jours pour te désinscrire en 1 clic" en bas — réduit le drop-off au moment du clic.

### Mini-form

**Champs** (ordre tab) :
1. `prenom` (input text, required, max 100 chars après strip)
2. `email` (input email, required, regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
3. `consent` (checkbox, required, lien `<NuxtLink to="/confidentialite" target="_blank">`)
4. `website` (honeypot, position absolute -9999, tabindex -1, autocomplete off)
5. Submit button

**Validation client** identique à `NewsletterForm.vue:94-99` (à copier).

**Logique de soumission** :

```ts
async function submit() {
  if (!canSubmit.value) return
  if (website.value) return  // honeypot — silencieux

  status.value = 'loading'
  capture('scanner_gate_submitted', { job_slug, job_status })

  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: {
        prenom: prenom.value.trim(),
        email: email.value,
        consent: consent.value,
        source: 'scanner_gate',
        job_slug: props.job.slug,
        job_status: props.job.status,
      },
    })
    capture('scanner_gate_succeeded', { job_slug, job_status })
    markUnlocked()
    emit('unlocked')
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessayez.'
    capture('scanner_gate_failed', {
      job_slug, job_status,
      reason: classifyError(err),  // 'validation' | 'server' | 'network'
    })
  }
}
```

**Pas de state `'success'` côté gate** — dès l'API OK, on émet `unlocked` et le parent prend le relais (scramble). Le gate disparaît avant tout message de confirmation textuel — le succès, c'est le déverrouillage spectaculaire.

---

## 6. Tracking PostHog

Six nouveaux events. Tous portent les properties `job_slug, job_status, job_risk, job_horizon` quand pertinent.

| Event | Quand | Properties |
|---|---|---|
| `scanner_gate_shown` | entrée en `phase = 'gated'` | `job_slug, job_status, job_risk, job_horizon` |
| `scanner_gate_email_focused` | premier focus sur input email | `job_slug, job_status` |
| `scanner_gate_submitted` | clic sur submit (avant API) | `job_slug, job_status` |
| `scanner_gate_succeeded` | API renvoie OK | `job_slug, job_status` |
| `scanner_gate_failed` | erreur API | `job_slug, job_status, reason` |
| `scanner_gate_dismissed` | reset depuis state `gated` | `job_slug, job_status` |

**Funnels analysables dans PostHog** :
- Macro : `scanner_job_selected` → `scanner_scan_completed` → `scanner_gate_shown` → `scanner_gate_submitted` → `scanner_gate_succeeded`
- Segmentable par `job_status` (test a posteriori du choix gate universel : si l'écart par statut est massif, on pourra revenir vers un gate ciblé).
- `scanner_gate_dismissed` = signal d'abandon. Élevé sur danger = mauvaise copy. Élevé sur croissance = problème de fond du gate universel.

---

## 7. Backend — modifications de `subscribe.post.ts`

L'endpoint actuel est solide (rate limit, validation, strip-html, Brevo). Petites additions :

1. **Body étendu** :
   ```ts
   const { prenom, email, consent, source, job_slug, job_status, website } = body ?? {}
   ```

2. **Honeypot serveur-side** (avant rate limit pour ne pas le polluer) :
   ```ts
   if (website) return { ok: true }  // bot — silencieux, pas d'appel Brevo
   ```

3. **Whitelist source** :
   ```ts
   const allowedSources = ['website', 'scanner_gate']
   const safeSource = allowedSources.includes(source) ? source : 'website'
   ```

4. **Attributes Brevo enrichis** :
   ```ts
   attributes: {
     PRENOM: stripHtml(prenom.trim()),
     CONSENT: true,
     SOURCE: safeSource,
     ...(job_slug ? { JOB_SLUG: stripHtml(String(job_slug).slice(0, 80)) } : {}),
     ...(job_status ? { JOB_STATUS: stripHtml(String(job_status).slice(0, 30)) } : {}),
   }
   ```

Pas de nouveau setup Brevo, même liste, même API key. Le tag `SOURCE` (déjà présent) discrimine les origines.

**Rétrocompatibilité** : `NewsletterForm.vue` continue de poster sans `source` → fallback `'website'` automatique. Aucun changement requis sur ce composant.

---

## 8. Cas limites couverts

- **URL `?job=X` first visit** : pas d'animation de scan, RISQUE/HORIZON/STATUT settle en clair, gate visible immédiatement, `scanner_gate_shown` émis.
- **URL `?job=X` returning visitor (`isUnlocked`)** : tout révélé en clair direct, comportement actuel préservé.
- **Returning visitor + nouveau scan** : pas de gate, scan complet, scrambles trajectoire/actions visibles, result-zone classique avec CTA newsletter (pas la confirmation post-unlock).
- **Reset depuis `gated`** : émet `scanner_gate_dismissed`, ne touche pas le localStorage, retour à `idle`.
- **Reset pendant `unlocking`** : protégé par `currentScanId++` existant, scramble interrompu proprement.
- **SSR** : `isUnlocked = false` côté serveur, hydraté à `onMounted`. Pas de flicker car la résolution se fait avant tout rendu de gate.
- **Erreur API** : gate reste visible, message d'erreur sous le bouton, retry possible, localStorage NON marqué.
- **Email duplicate** : API renvoie `{ ok: true }` silencieusement (déjà en place ligne 80-82) → scramble se déclenche, UX identique à un succès.
- **Honeypot rempli** : silencieux côté client + serveur, pas d'appel Brevo.
- **Focus management** : focus auto sur prénom à l'apparition du gate ; focus déplacé sur le bouton de partage à la fin du scramble post-unlock. Pas de focus trap (le gate n'est pas modal).
- **Mobile (≤ 600px)** : inputs en flex column, badge sur sa propre ligne, padding réduit.

---

## 9. Validation manuelle (checklist PR)

Pas de framework de test installé — checklist à exécuter avant merge. À copier dans la description du PR.

### Parcours nominaux
- [ ] Scan complet "EN DANGER" : progress monte à 88%, "// CLASSIFIÉ" pulse, gate apparaît, focus sur prénom.
- [ ] Soumission OK : gate disparaît, TRAJECTOIRE scramble, ACTIONS scramble en cascade, sources cascade, result-zone "ACCÈS ACCORDÉ".
- [ ] localStorage `hasUnlockedScanner = "true"` après soumission OK (DevTools).
- [ ] 2e scan immédiat (autre métier) : pas de gate, scan complet jusqu'à 100%, scrambles visibles, result-zone "Rejoindre La Fréquence".

### Copy par statut
- [ ] EN DANGER, EN MUTATION, PROTÉGÉ, EN CROISSANCE : headline et sub-line corrects.

### Cas limites
- [ ] URL `?job=comptable` first visit : gate visible sans scan animé.
- [ ] URL `?job=comptable` returning visitor : tout en clair direct.
- [ ] Reset depuis gate : `scanner_gate_dismissed` envoyé.
- [ ] Email invalide : bouton disabled, pas d'appel API.
- [ ] Erreur API simulée : message d'erreur, retry possible.
- [ ] Email déjà inscrit : scramble se déclenche normalement.
- [ ] Honeypot rempli (DevTools) : pas de contact Brevo créé.
- [ ] Rate-limit (6e tentative) : 429 affiché.

### Accessibilité
- [ ] `prefers-reduced-motion` activé (DevTools → Rendering) : pas de scramble, settle direct.
- [ ] Tab order : suggestions → subject input → gate (prénom → email → consent → submit). Honeypot skippé.
- [ ] Lecteur d'écran : badge `[ CLASSIFIÉ ]` annoncé via `aria-label`. `[ ACCÈS ACCORDÉ ]` annoncé via `role="status"`.

### PostHog (Live tab)
- [ ] `scanner_gate_shown` envoyé une fois par entrée en `gated`.
- [ ] `scanner_gate_email_focused` envoyé seulement au premier focus.
- [ ] `scanner_gate_submitted` envoyé à chaque submit.
- [ ] `scanner_gate_succeeded` envoyé seulement sur 200.
- [ ] `scanner_gate_failed` envoyé avec `reason` correct.
- [ ] `scanner_gate_dismissed` envoyé seulement si reset depuis `gated`.

### SEO / privacy
- [ ] `useSeoMeta` description mise à jour (plus de "sans inscription").
- [ ] FAQ Q3 (DOM + JSON-LD) reformulée. Vérifier dans `view-source` que le JSON-LD reflète le nouveau wording.
- [ ] `/confidentialite` contient le paragraphe sur `hasUnlockedScanner`.

### Backend
- [ ] Soumission depuis scanner crée un contact Brevo avec `SOURCE = 'scanner_gate'`, `JOB_SLUG`, `JOB_STATUS`.
- [ ] Soumission depuis NewsletterForm sur `/frequence` crée un contact avec `SOURCE = 'website'` (régression check).

---

## 10. Hors scope (à traiter plus tard)

- **Tests automatisés** : pas de framework installé. À terme, vitest minimal recommandé pour `useScannerUnlock()` et la logique de validation server-side. Documenter en `// TODO` dans le code.
- **Captcha** : non implémenté volontairement (friction trop forte). Le honeypot couvre 80% des bots basiques. À réévaluer si abus constatés dans Brevo.
- **Email "jetable" (filtre mailinator etc.)** : non implémenté côté nous. Brevo a ses propres protections.
- **Confirmation par email (double opt-in)** : dépend de la config Brevo, pas du périmètre de cette PR.
- **A/B test du copy par statut** : possible plus tard via PostHog feature flags. La structure (copy par statut isolée dans une constante) facilite cette évolution.
- **Variantes de gate (gate light pour les "positifs")** : si les events `scanner_gate_dismissed` montrent un drop-off massif sur `protege`/`croissance`, on pourra revenir vers une variante. Décision data-driven, post-merge.
