# Migration `/scanner` → `/metiers` + formulaire "métier non listé"

**Date** : 2026-05-10
**Owner** : Mathieu (responsable marketing)
**Status** : Spec validée, en attente de plan d'implémentation

## Contexte

Sur la home actuelle, la section "I — Choisis ton entrée" propose 4 cartes. La carte **02 "Diagnostic flash"** pointe vers `/scanner` (page index avec recherche + FAQ). En parallèle, on vient de livrer `/metiers` — une page de browse filtrable des 196 métiers, groupés par secteur, avec recherche et liens vers les rapports `/scanner/[slug]`.

Les deux pages couvrent désormais la même intent (*"voir où mon métier en est face à l'IA"*) avec deux entrées concurrentes. Décision prise : **`/metiers` devient l'entrée unique**, `/scanner` (la landing) disparaît, mais les rapports par métier `/scanner/[slug]` sont conservés (actif SEO long-tail).

En complément, on transforme l'opportunité du *"métier non listé"* en double conversion (waitlist Brevo dédiée + opt-in newsletter La Fréquence).

## Décisions cadre

| Sujet | Décision |
|---|---|
| Suppression de `/scanner` | Index uniquement. `/scanner/[slug]` conservé. |
| Redirect | 301 `/scanner` → `/metiers` (route rule Nuxt) |
| Place de `/metiers` sur la home | 4 cartes hero : carte 02 repointée vers `/metiers` + `metiers-link-bar` allégée plus bas en rappel (option C) |
| Architecture Brevo | 2 listes — nouvelle `metier_waitlist` + opt-in checkbox newsletter par défaut coché (option B) |
| Placement formulaire `/metiers` | Permanent en bas de page, prefill depuis `searchQuery` (option A) |
| Champs formulaire | Minimal : email + métier + checkbox newsletter (option A) |

## Architecture des changements

### Suppressions

- `app/pages/scanner/index.vue` (la landing — la sémantique de cette page passe à `/metiers`)
- Carte 02 "Diagnostic flash" dans `app/pages/index.vue` (remplacée, voir ci-dessous)
- `<HomeDiagnosticTeaser />` (composant + import dans `app/pages/index.vue`)
  - Le composant `app/components/HomeDiagnosticTeaser.vue` est supprimé du repo
- L'ancien bloc `metiers-cta` en bas de `app/pages/metiers/index.vue` ("Pas trouvé ton métier ? → /scanner")

### Conservations explicites

- `app/pages/scanner/[slug].vue` — les rapports diagnostic par métier
- Tous les liens internes vers `/scanner/${slug}` (notamment `app/components/MetierCard.vue`)
- Le composable `usePosthogEvent` et le pattern Brevo existant
- L'event `metiers_browse_search` déjà en place (signal #1 pour la priorisation éditoriale)

### Modifications

**`app/pages/index.vue`** :
- Carte 02 : nouvelle copy + nouvelle icône, `to="/metiers"`, `data-attr="hero-cta-metiers"`, handler `onHomeCta('metiers')`
- Type de `onHomeCta` : `'scanner'` retiré de l'union, remplacé par `'metiers'`
- `<HomeDiagnosticTeaser />` retiré du template + de l'import script
- `metiers-link-bar` : copy reformulée (suppression du mot "Scanner")

**`app/pages/metiers/index.vue`** :
- Bloc `metiers-cta` remplacé par `<MetiersRequestForm :prefill="searchQuery" />`
- `empty-state` reformulé pour pointer vers le formulaire (toujours en dessous, prefillé)

**`nuxt.config.ts`** :
- Ajout d'une `routeRules` : `'/scanner': { redirect: { to: '/metiers', statusCode: 301 } }`
- Ajout de la variable d'env runtime `brevoMetierWaitlistListId`

### Créations

- `server/api/metiers/request.post.ts` — endpoint Brevo (voir flux ci-dessous)
- `app/components/MetiersRequestForm.vue` — formulaire client
- Variable d'env `BREVO_METIER_WAITLIST_LIST_ID` à provisionner (création de la liste côté Brevo admin = action manuelle hors PR)

## Flux de données

### Côté client — `MetiersRequestForm.vue`

**Props** :
- `prefill: string` — valeur initiale du champ `metier` (passée depuis `searchQuery` du parent)

**Champs visibles** :
- `metier` (text, required, valeur initiale = prop `prefill`, max 200 chars côté UI)
- `email` (email, required)
- `subscribeNewsletter` (checkbox, default `true`) — label : *"Je veux aussi recevoir La Fréquence (1 email/semaine, désinscription en 1 clic)"*

**Champ honeypot caché** :
- `website` (input texte, `tabindex="-1"`, `autocomplete="off"`, hors flux visuel via CSS — pattern existant cohérent)

**États** :
- `idle` → `submitting` → `success` (terminal, pas de retour) | `error` (retour à `idle` après affichage)
- Validation client : email regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`, `metier.trim() !== ''`

**Requête** :
- `POST /api/metiers/request` avec body `{ email, metier, subscribeNewsletter, website }`

**Tracking PostHog** :
- `metiers_request_form_focused` — première interaction (focus) sur n'importe quel champ, 1× par session
- `metiers_request_submitted` `{ metier, subscribed_newsletter, prefilled_from_search }`
  - `prefilled_from_search = (prop prefill !== '' && metier === prop prefill)` au moment du submit
- `metiers_request_succeeded` `{ metier, subscribed_newsletter }`
- `metiers_request_failed` `{ metier, reason }` — `reason` ∈ `'rate_limit' | 'validation' | 'server_error' | 'network'`

### Côté serveur — `server/api/metiers/request.post.ts`

Clone du pattern `server/api/chantier/interest.post.ts`, avec différences explicitées.

**Étapes** :
1. Lecture config : `brevoApiKey`, `brevoMetierWaitlistListId`, `brevoListId` (newsletter principale). Si `brevoApiKey` ou `brevoMetierWaitlistListId` manquant → 500.
2. Lecture body : `{ email, metier, subscribeNewsletter, website }`
3. Honeypot : si `website` non vide → `return { ok: true }` silencieux (pas d'appel Brevo, pas de comptage rate-limit)
4. Rate-limit : 3 requêtes / IP / heure (Map en mémoire — même implé que `chantier/interest`)
5. Validation : email regex, `metier` après `stripHtml(slice(0, 200))` non vide. Sinon 400.
6. **Appel Brevo #1 (waitlist, toujours)** :
   ```
   POST https://api.brevo.com/v3/contacts
   {
     email,
     listIds: [Number(brevoMetierWaitlistListId)],
     attributes: { SOURCE: 'metier_request', REQUESTED_JOB: <metier> },
     updateEnabled: true
   }
   ```
   - 201 → continuer
   - 400 + `code: 'duplicate_parameter'` → continuer (succès silencieux)
   - autre → 500 (l'utilisateur voit une erreur, sa demande n'est pas enregistrée)
7. **Appel Brevo #2 (newsletter, conditionnel)** : si `subscribeNewsletter === true`
   ```
   POST https://api.brevo.com/v3/contacts
   {
     email,
     listIds: [Number(brevoListId)],
     attributes: { SOURCE: 'metier_request' },
     updateEnabled: true
   }
   ```
   - 201 → succès
   - 400 + `code: 'duplicate_parameter'` → succès silencieux
   - autre → on log côté serveur (`console.error`) et on renvoie `{ ok: true }` quand même. La waitlist (#1) est l'engagement principal ; on ne fait pas échouer le flow utilisateur sur la newsletter.
8. Retour : `{ ok: true }`

**Pourquoi `updateEnabled: true` (vs `false` dans `chantier`)** : un même utilisateur peut légitimement revenir demander un autre métier. On accepte que `REQUESTED_JOB` soit écrasé côté Brevo — l'historique complet est tenu côté PostHog (`metiers_request_submitted`).

## Copy & ton

Brand voice Survivant-IA — sobre, full negation, 1ère personne (Mathieu en personne), casse minuscules sur les concepts coined, pas de "FORMULAIRE" en majuscules, pas de "Merci !" gratuit.

### Home — carte 02 (remplace "Diagnostic flash")

```
02 / Diagnostic par métier
[icône loupe-sur-grille]
Veux-tu voir où ton métier en est face à l'IA ?
196 métiers analysés. Cherche le tien dans la liste.
[CTA] Trouver mon métier
```

**Icône** : nouvelle SVG "loupe sur grille" — viewBox 56×56, stroke 2px, classe cohérente avec le set existant (cf. `ic-soundwave`, `ic-toolbox`, `ic-bricks`). Le sablier `ic-hourglass` actuel ne sert plus la promesse (browse vs flash).

### Home — `metiers-link-bar` reformulée

- **Avant** : *"Parcourir les métiers couverts par le Scanner (196) →"*
- **Après** : *"Parcourir les 196 métiers analysés →"*

### `/metiers` — empty-state (0 résultat de recherche)

- **Avant** : *"Aucun métier trouvé pour 'X'."*
- **Après** : *"Aucun métier trouvé pour 'X'. Demande-le ci-dessous, je l'analyse."*

### `/metiers` — formulaire (toujours visible en bas de page)

```
Ton métier n'est pas dans la liste ?

Demande-le. Je l'ajoute, et tu es prévenu·e
quand son diagnostic est en ligne.

[ Quel métier ?         ] (prefill depuis recherche)
[ Ton email             ]
[x] Je veux aussi recevoir La Fréquence
    (1 email/semaine, désinscription en 1 clic)

[ Demander l'analyse ]
```

### `/metiers` — état de succès (remplace le formulaire après submit)

```
Reçu. Ton métier "<metier>" est dans la file.
Je te préviens dès qu'il est en ligne.
```
Si `subscribeNewsletter === true` au submit, ajouter une seconde ligne :
```
Et bienvenue dans La Fréquence.
```

### `/metiers` — états d'erreur (inline, sous le bouton)

- Erreur 500 / réseau : *"Erreur technique, réessaie dans une minute."*
- Erreur 429 (rate-limit) : *"Trop de demandes depuis ton réseau. Réessaie dans une heure."*
- Erreur 400 (validation côté serveur, ne devrait pas arriver vu validation client mais on couvre) : *"Vérifie ton email et le nom du métier."*

## Edge cases

- **Recherche 0 résultat** → `empty-state` reformulé pointe vers le formulaire prefillé juste en dessous. Pas de double rendu.
- **Utilisateur déjà inscrit à la newsletter** demande un métier → appel #2 renvoie 400 + `duplicate_parameter` → succès silencieux côté UX.
- **Même utilisateur demande deux métiers différents** → `updateEnabled: true` côté Brevo écrase `REQUESTED_JOB` ; PostHog garde l'historique complet via les events `metiers_request_submitted`.
- **Trafic Google sur `/scanner`** → 301 vers `/metiers`. Le contexte précis du métier recherché est perdu mais l'utilisateur arrive sur la page la plus utile.
- **HomeDiagnosticTeaser supprimé** → vérifier qu'aucun import résiduel ne casse le build (`grep -rn HomeDiagnosticTeaser app/`).
- **Type `onHomeCta`** → l'union TypeScript change ; vérifier qu'aucun callsite ne passe encore `'scanner'` (sinon TS error).

## Risques marketing à surveiller (post-déploiement)

- Si la conversion newsletter via la checkbox chute drastiquement vs `/frequence` direct → "demandeurs de métier" ≠ profil cible newsletter ; revoir le default-checked.
- Si `metiers_request_submitted` < 5/semaine après 4 semaines → form visuellement-permanent inefficace ; considérer un repli sur form conditionnel sur 0-résultat.
- Si plusieurs personnes demandent le même métier non listé → signal éditorial fort. Construire un tableau PostHog "top requested jobs" (hors scope de cette PR).

## Tracking & lecture des deux signaux

| Signal | Event | Volume | Qualité de l'intent |
|---|---|---|---|
| **Recherche** (existant) | `metiers_browse_search` `{ query, results_count }` | Élevé (debouncé 600ms à partir de 3 chars) | Faible — inclut typos, abandons, curiosité |
| **Demande explicite** (nouveau) | `metiers_request_submitted` `{ metier, subscribed_newsletter, prefilled_from_search }` | Bas | Élevée — l'utilisateur a donné son email |

**Lecture croisée** :
- "boucher" haut sur #1 + bas sur #2 → curiosité passive, pas urgent.
- "boucher" haut sur les deux → priorité claire éditoriale.
- "boucher" haut sur #2 + bas sur #1 → mot-clé pas évident (peut-être un problème de moteur de recherche ou de synonymes).

## Tests

**E2E** (Playwright si dispo) :
- `/metiers` recherche "métier-bidon" → 0 résultat → form prefillé → submit avec checkbox cochée → état succès affiché, formulaire remplacé.
- Même flow avec checkbox décochée → état succès **sans** la ligne "Et bienvenue dans La Fréquence".
- Browse passif (pas de recherche) → scroll en bas → form vide → remplir → submit → succès.
- Submit avec email invalide côté client → erreur inline, pas d'appel réseau.
- 4 submits rapides depuis la même IP (mock Brevo OK) → 4ème renvoie 429, message rate-limit affiché.

**Server-side** (vitest ou pattern existant) :
- Honeypot `website` non vide → `{ ok: true }` sans appel Brevo (mocker `fetch`, vérifier 0 appel).
- Email invalide → 400.
- `metier` vide après sanitization → 400.
- Brevo #1 renvoie 201 + #2 renvoie 201 → `{ ok: true }`.
- Brevo #1 renvoie 400 dup → traité comme succès, #2 appelé.
- Brevo #1 renvoie 500 → 500, #2 **non appelé**.
- Brevo #1 OK + #2 renvoie 500 → `{ ok: true }` (waitlist sauvée), erreur loggée.
- `subscribeNewsletter: false` → seul l'appel #1 fait, #2 jamais appelé (vérifier 1 seul appel `fetch`).

**Manuel** :
- `curl -I https://localhost:3000/scanner` → `301`, `Location: /metiers`.
- Rendu mobile 375px : form lisible, inputs ≥ 44px de haut, checkbox label tappable.
- Lecteur d'écran (VoiceOver / NVDA) : labels et inputs liés (`for`/`id`), `aria-live` sur état de succès et message d'erreur.

## Hors scope

- Pas de dashboard PostHog "top requested jobs" dans cette PR (events captés, dashboard plus tard).
- Pas de page `/metiers/[slug]` (rapports restent à `/scanner/[slug]`).
- Pas de refonte de `HomeMastheadTrajectoire`, `HomeMasthead`, `HomeManifesteEditorial`, `HomeSkillsList`.
- Pas de modification du contenu éditorial des rapports `/scanner/[slug]`.
- Pas d'extraction de `?job=X` côté redirect 301 (l'ancienne URL n'utilise probablement pas ce paramètre dans le trafic réel — à vérifier dans PostHog avant de complexifier).

## Prochaines étapes

1. Création de la liste Brevo `metier_waitlist` côté admin → récupérer son ID.
2. Provisionnement de la variable d'env `BREVO_METIER_WAITLIST_LIST_ID`.
3. Plan d'implémentation détaillé (skill `superpowers:writing-plans`).
