# Cookies + Google Analytics 4 — bannière de consentement et update RGPD

**Date :** 2026-05-16
**Scope :** site Survivant-IA (`/Users/mathieu/Documents/survivor`)
**Statut :** spec validée, prêt pour plan d'implémentation

## Contexte

Mesure ID GA4 reçue : `G-KTGGEP09JY`. Objectif déclaré : préparer Google Ads / attribution et brancher l'écosystème Google (Search Console, etc.). Décision corollaire prise dans le même mouvement : sortir PostHog du mode cookieless actuel pour activer **session recordings + heatmaps + persistance** sous consentement explicite.

Ce pivot invalide la promesse actuelle de `/confidentialite` (« aucun cookie déposé », « DNT respecté automatiquement »). La bannière de consentement devient le filtre central et la politique de confidentialité doit refléter la nouvelle réalité.

Pattern de référence : `operom-website` (3 fichiers Cookie* + page `/cookies`). On adapte à la DA V2 Editorial Dark de Survivant-IA et on corrige les biais operom (qui groupait PostHog dans "analytics" sans distinguer cookieless vs full mode).

## Décisions stratégiques validées

| Question | Décision |
|---|---|
| Pourquoi GA4 en plus de PostHog | Préparer Google Ads / attribution + connectivité écosystème Google |
| Granularité bannière | 3 boutons (Accepter / Refuser / Personnaliser), **1 toggle** « Analytics » groupant GA4 + PostHog |
| Comportement au refus | **Google Consent Mode v2** (GA4 reste actif en mode `denied`, envoie cookieless pings) + **PostHog cookieless fallback** (mode actuel préservé pour les refuseurs) |
| Position bannière | Slide-up bas, non-bloquant, avec SVG cookie menthe dessiné (pas d'emoji) |
| Réouverture | Lien footer « Gérer mes cookies » + page `/cookies` dédiée (pas de bouton flottant) |
| Durée du consentement | 13 mois (recommandation CNIL, conforme LPD suisse) |

## Architecture & fichiers

### Nouveaux fichiers

- `app/composables/useConsent.ts` — source unique de vérité. Lit/écrit `localStorage['cookie-consent']` ({ analytics, timestamp, version }), gère l'expiration 13 mois, expose `state.analytics` (`'pending' | 'granted' | 'denied'`), `state.needsChoice`, `accept()`, `refuse()`, `openModal()`.

- `app/components/CookieBanner.vue` — bandeau slide-up bas + modal personnalisation. Affiché tant que `state.needsChoice`. Écoute l'événement `window.dispatchEvent(new CustomEvent('open-cookie-settings'))` pour rouvrir la modal (pattern operom).

- `app/plugins/gtag.client.ts` — charge `gtag.js` avec `G-KTGGEP09JY`. Pose **toujours** `gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 })` **avant** `gtag('config', ...)`. Puis lit `useConsent.state.analytics` : si `granted`, appelle immédiatement `gtag('consent', 'update', { ... granted })` dans la foulée (avant les 500ms d'attente, donc pas de hit denied envoyé). Watcher sur les changements ultérieurs.

- `app/pages/cookies.vue` — page détail RGPD (noms cookies, durées, éditeurs, transferts hors UE) avec bouton « Gérer mes cookies » qui dispatch l'événement de réouverture.

### Fichiers modifiés

- `app/plugins/posthog.client.ts` — l'init lit `useConsent.state.analytics` de manière synchrone (le composable lit localStorage au mount). Si `granted` (consentement valide et non expiré) : init en mode complet (`persistence: 'localStorage+cookie'`, `disable_session_recording: false`). Sinon : init en mode cookieless (`persistence: 'memory'`, `disable_session_recording: true`, comportement actuel préservé). Dans les deux cas, un watcher écoute les changements ultérieurs de `state.analytics` pour appeler `$posthog.set_config({ ... })` + `$posthog.startSessionRecording()` ou `stopSessionRecording()`.

- `app/pages/confidentialite.vue` — supprime la mention « aucun cookie n'est déposé », réécrit la section Mesure d'audience, ajoute la section Google Analytics 4, met à jour Sous-traitants (Brevo + PostHog + Google), ajoute l'indicateur `cookie-consent` dans la section localStorage, date « mai 2026 ». Diff ~30 lignes, pas de refactor.

- `app/components/AppFooter.vue` — ajout du lien « Gérer mes cookies » entre « Politique de confidentialité » et « Mentions légales ». Même styling que les liens légaux existants. Clic = `window.dispatchEvent(new CustomEvent('open-cookie-settings'))`.

- `nuxt.config.ts` — ajout de `gtagId: process.env.NUXT_PUBLIC_GTAG_ID` dans `runtimeConfig.public`.

- `.env.example` et `.env` — ajout de `NUXT_PUBLIC_GTAG_ID=G-KTGGEP09JY`.

### Décision tooling

**Pas de module `nuxt-gtag`.** Plugin manuel dans le même style que `posthog.client.ts`. Raison : ajouter une dépendance pour ~15 lignes de chargement script + Consent Mode v2 n'est pas justifié, et un plugin manuel donne un contrôle direct sur l'ordre `consent default` → `config` qui est critique.

### Hors-scope cette spec

- Le scanner localStorage `hasUnlockedScanner` est conservé tel quel (first-party essentiel, déjà documenté dans `/confidentialite`).
- Newsletter Brevo : inchangée (cookie technique sur soumission de formulaire seulement, base légale = exécution du service).
- Google Search Console linkage : se fait côté GA4 admin une fois le `_ga` cookie posé pour Mathieu, hors-scope code.

## Flow de consentement (state machine)

État stocké :

```ts
type ConsentState = {
  analytics: boolean
  timestamp: number       // Date.now() au moment du choix
  version: 1              // permet de re-déclencher la bannière si on change la liste des traceurs
}
```

`useConsent.state.needsChoice` est `true` si :
- pas de localStorage `cookie-consent`, OU
- `timestamp` > 13 mois, OU
- `version` ne correspond pas à la version courante.

### Cas 1 — premier visiteur (pas de localStorage)

1. Page charge. `useConsent.state.analytics = 'pending'`, `needsChoice = true`.
2. `gtag.client.ts` charge gtag.js. Exécute `gtag('consent', 'default', { ...all denied, wait_for_update: 500 })` **avant** `gtag('config', 'G-KTGGEP09JY')`. GA4 envoie des cookieless pings en mode Consent Mode v2.
3. `posthog.client.ts` charge en mode cookieless (état actuel inchangé).
4. `CookieBanner` apparaît en slide-up.

### Cas 2 — clic « Accepter »

1. `useConsent.accept()` → écrit localStorage `{ analytics: true, timestamp: Date.now(), version: 1 }`.
2. Watcher gtag → `gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' })`. GA4 commence à déposer `_ga` et `_ga_KTGGEP09JY`.
3. Watcher PostHog → `set_config({ persistence: 'localStorage+cookie', disable_persistence: false, disable_session_recording: false })` + `startSessionRecording()`. Cookies `ph_*` déposés, replays + heatmaps actifs.
4. Bannière sort en slide-down 350ms.

### Cas 3 — clic « Refuser »

1. `useConsent.refuse()` → écrit localStorage `{ analytics: false, timestamp: Date.now(), version: 1 }`.
2. gtag reste en `denied` → continue les cookieless pings (utile pour Google Ads modeling futur).
3. PostHog reste en cookieless (mode actuel) → mesure d'audience anonyme préservée, pas de session recording, pas de cookie déposé.
4. Bannière sort.

### Cas 4 — clic « Personnaliser »

1. La modal s'ouvre par-dessus le bandeau (overlay sombre + carte centrée).
2. Toggle unique « Mesure d'audience et replays » (groupe GA4 + PostHog), pré-coché selon état courant (par défaut `false` au premier passage).
3. Clic « Enregistrer mes choix » → applique l'état comme Accept (toggle on) ou Refuse (toggle off).
4. Clic « Annuler » ou overlay → ferme la modal sans changer d'état (le bandeau reste si pas de choix initial).

### Cas 5 — visiteur de retour avec consentement valide non-expiré

- `useConsent` lit localStorage au mount des plugins. Si `analytics: true`, les plugins gtag et PostHog initialisent directement en mode complet (pas de passage par denied/cookieless). Pas de bannière. Pas de double init.

### Cas 6 — consentement expiré (>13 mois)

- `needsChoice = true`. Identique au cas 1 : on repart en `denied` jusqu'au nouveau choix. **Pas d'auto-renouvellement** de l'ancien choix.

### Cas 7 — réouverture via footer ou page `/cookies`

- Clic sur lien « Gérer mes cookies » → `window.dispatchEvent(new CustomEvent('open-cookie-settings'))`. La modal s'ouvre, toggle pré-coché selon état courant.
- Si l'user passe de `granted` à `denied` : `gtag('consent', 'update', { analytics_storage: 'denied', ... })` + `$posthog.stopSessionRecording()` + `set_config({ disable_persistence: true })`. Les cookies déjà déposés ne sont pas effacés (limitation technique, à documenter dans `/cookies`) mais aucun nouveau n'est posé.

### Cas 8 — DNT activé

- PostHog garde `respect_dnt: true` (config actuelle). GA4 ne respecte pas DNT nativement — documenté dans `/cookies`.
- Le DNT n'auto-rejette pas le consentement : l'utilisateur DNT voit quand même la bannière, son choix prime.

### Edge cases & erreurs

- **localStorage bloqué** (private browsing) : `useConsent` retombe sur état en mémoire pour la session. Bannière apparaît à chaque visite. Pas de crash.
- **gtag bloqué** (adblocker) : `window.gtag` undefined, watcher no-op. Pas de crash.
- **PostHog bloqué** : plugin retourne `null` (déjà géré dans `posthog.client.ts:14`).
- **Race condition gtag** : `wait_for_update: 500` ms protège contre l'envoi du premier hit en denied avant la lecture du localStorage pour les visiteurs de retour. Le watcher synchrone côté plugin est largement sous ce seuil en pratique.

## UX & DA (V2 Editorial Dark)

### Bannière slide-up bas

- Position `fixed bottom: 0`, pleine largeur, z-index au-dessus du contenu et sous les modals.
- Fond `var(--color-bg-elevated)` à 95% opacité + `backdrop-filter: blur(12px)`.
- Liseré supérieur 1px en menthe `#6CE3B5`.
- Padding `1.25rem 1.5rem`. Grille 2 colonnes desktop, empilée vertical mobile (<768px).
- Animation : `transform: translateY(100%) → 0`, durée 350ms, easing `cubic-bezier(.2, .8, .2, 1)`.

**Colonne gauche**
- SVG cookie menthe (32px) inline.
- `<KickerLabel>POLITIQUE COOKIES</KickerLabel>` (composant existant).
- Phrase : *« Ce site utilise des cookies pour mesurer l'audience et améliorer l'expérience. »* + lien `Détails` (souligné, menthe) vers `/cookies`.
- Typo Inter 0.85rem, couleur `var(--color-muted)`.

**Colonne droite — 3 boutons (gauche → droite)**
- **Refuser** : outline neutre, `border: 1px var(--color-border)`, texte `var(--color-muted)`. Hover : texte → `var(--color-text)`.
- **Personnaliser** : outline menthe, `border: 1px #6CE3B5`, texte `#6CE3B5`. Hover : fond menthe 8% alpha.
- **Accepter** : fill menthe, `background: #6CE3B5`, texte noir, `font-weight: 500`. Hover : luminosité +5%.
- Padding identique `0.6rem 1.25rem`, border-radius cohérent avec les autres CTA (à confirmer en lisant un composant existant).

**Mobile (<768px)** : boutons empilés pleine largeur. Ordre Refuser / Personnaliser / Accepter (de haut en bas = du moins au plus engageant, le primaire reste accessible au pouce).

### SVG cookie menthe (inline)

Style **outline** cohérent V2 Editorial :
- Cercle externe : `stroke: #6CE3B5`, `stroke-width: 1.5px`, `fill: transparent`.
- 3 pépites : petits cercles fillés `#6CE3B5` à 60% opacity, positions asymétriques.
- Légère encoche sur le bord (cookie croqué, référence visuelle subtile).
- Hover bannière : rotation `+4deg` 400ms (micro-affordance, pas un gimmick).
- Inline dans `CookieBanner.vue`, pas d'asset externe ni de dépendance Icon.

### Modal personnalisation

- Overlay `rgba(0, 0, 0, .7)` + `backdrop-blur(4px)`. Clic overlay = fermer (équivalent Annuler).
- Carte centrée, `max-width: 540px`, `padding: 2rem`, fond `var(--color-bg-elevated)`, `border: 1px var(--color-border)`, border-radius cohérent.

**Header**
- `<KickerLabel>PRÉFÉRENCES COOKIES</KickerLabel>`
- `<h2>` « Vos préférences cookies » — Inter 1.25rem, `var(--color-text)`.
- Bouton fermer (X) SVG inline 16px en haut-droite, `var(--color-muted)`, hover menthe.
- Sub-texte : *« Vous gardez le contrôle. Vos choix s'appliquent immédiatement et peuvent être modifiés à tout moment. »*

**Toggle 1 — Cookies essentiels (désactivé)**
- Toggle visuel "on" grisé/disabled, label « Toujours actifs » à droite.
- Texte : *« Nécessaires au fonctionnement du site : mémorisation de vos choix cookies, indicateur scanner. Aucune donnée comportementale. »*

**Toggle 2 — Mesure d'audience et replays (interactif)**
- Track 36×20px, fond `var(--color-border)` quand off, `#6CE3B5` quand on. Curseur cercle blanc, transition 200ms.
- Pré-coché selon `useConsent.state.analytics`.
- Texte : *« Google Analytics 4 (mesure d'audience, attribution Google Ads) et PostHog (parcours, enregistrements de sessions, heatmaps). Données pseudonymisées. Hébergement : Europe pour PostHog, États-Unis pour Google (transferts encadrés par clauses contractuelles types). »*
- Lien : *« Détail complet sur la page Cookies → »* vers `/cookies`.

**Footer modal**
- Bouton « Annuler » (outline neutre, gauche).
- Bouton « Enregistrer mes choix » (fill menthe, droite).

### Footer du site

Lien texte « **Gérer mes cookies** » inséré entre « Politique de confidentialité » et « Mentions légales ». Même styling que les autres liens légaux. Clic = dispatch `open-cookie-settings`.

### Page `/cookies`

Reprend le langage visuel de `/confidentialite` (KickerLabel + h1 + sections `.policy-section`). Exception éditoriale : un mot du h1 en Playfair italic accent menthe (cohérent avec l'usage Playfair italic d'emphase sur les pages éditoriales).

Structure :
1. **Header** : `<KickerLabel>POLITIQUE COOKIES</KickerLabel>` + `<h1>` *« Cookies et traceurs »* (italique Playfair sur « traceurs »).
2. **Qu'est-ce qu'un cookie** — 2 phrases sobres.
3. **Cookies essentiels** — bloc factuel :
   - `cookie-consent` (localStorage, permanent jusqu'à action utilisateur ou 13 mois, éditeur Survivant-IA).
   - `hasUnlockedScanner` (localStorage, permanent jusqu'à effacement manuel, éditeur Survivant-IA).
4. **Mesure d'audience** — deux sous-blocs :
   - **Google Analytics 4** : noms `_ga` / `_ga_KTGGEP09JY`, durée 13 mois (re-consentement), éditeur Google LLC, transfert États-Unis encadré par SCC, données collectées (pages, durée, source, anonymisées), note « ne respecte pas Do Not Track nativement ».
   - **PostHog** : cookies `ph_*`, durée 1 an, éditeur PostHog Inc., hébergement Francfort (UE), données collectées (clics, parcours, enregistrements de sessions, heatmaps), note « respecte Do Not Track ».
5. **Cookies marketing** — *« Aucun cookie marketing n'est actuellement utilisé sur ce site. »*
6. **Gérer mes préférences** — gros bouton fill menthe « Gérer mes cookies » dispatch événement.
7. **Vos droits (RGPD + LPD)** — réutilise la liste de `/confidentialite`.
8. **Contact** — `mathieu@survivant-ia.ch`.

### Voix & copy

- Ton neutre, factuel, posé. Pas de marketing-speak, pas de tutoiement enjôleur, pas d'emoji, pas de « méthode », pas de mots hype.
- Le copy fonctionnel/légal n'applique pas la règle « full negation » (qui est réservée à la voix éditoriale de la marque).
- Domaine cité partout : `survivant-ia.ch`.

## Mises à jour `/confidentialite`

L'ancienne page promet « aucun cookie » et « DNT respecté automatiquement » → faux dès le déploiement. Edits ciblés, structure préservée.

### Section « Données collectées » — élargir

- Newsletter Brevo : email, prénom (inchangé).
- Mesure d'audience (sous consentement) : pages visitées, durée, source de trafic, interactions, parcours, enregistrements de session, IP anonymisée côté GA4.
- Stockage technique local : indicateur consentement, indicateur scanner.
- Note explicite : GA4 et PostHog **ne traitent jamais** l'email ni le prénom de la newsletter (séparation stricte).

### Section « Mesure d'audience anonyme » — renommer et réécrire

Renommée **« Mesure d'audience »** (plus « anonyme »). Nouveau contenu (texte cible) :

> Pour comprendre comment le site est utilisé et l'améliorer, nous utilisons deux outils sous votre consentement explicite (bannière à la première visite, modifiable via « Gérer mes cookies » dans le footer ou la page Cookies) :
>
> - **PostHog** (hébergé dans l'Union européenne, à Francfort) : mesure de trafic, analyse de parcours, heatmaps, enregistrements de sessions. Conservation 1 an.
> - **Google Analytics 4** (Google LLC, États-Unis) : mesure d'audience, attribution des sources, préparation d'éventuelles campagnes Google Ads. Transfert hors UE encadré par les clauses contractuelles types (SCC) approuvées par la Commission européenne. IP anonymisée. Conservation 14 mois.
>
> **Si vous refusez** : Google Analytics 4 fonctionne en mode anonymisé sans cookie (Google Consent Mode v2, signaux agrégés pour modélisation) ; PostHog repasse en mode anonyme sans cookie ni enregistrement de session.
>
> Le détail de chaque cookie (nom, durée, finalité) est disponible sur la [page Cookies](/cookies).

### Section « Stockage local (localStorage) » — ajouter sous-section

Ajout d'une sous-section « Indicateur consentement cookies » :

> Lorsque vous validez vos préférences cookies, nous stockons votre choix dans le `localStorage` sous la clé `cookie-consent` (`{ analytics: true/false, timestamp, version }`). Cette donnée ne quitte jamais votre navigateur et est renouvelée tous les 13 mois conformément à la recommandation CNIL.

La sous-section « Indicateur technique du scanner » reste inchangée.

### Section « Sous-traitant » — élargir

Avant : Brevo seul. Après : citer les 3 (Brevo, PostHog Inc., Google LLC) avec liens vers leurs politiques respectives et renvoi vers `/cookies` pour le détail des cookies.

### Date de mise à jour

`Dernière mise à jour : mai 2026`.

### Sections inchangées

- Responsable du traitement
- Finalité (newsletter)
- Durée de conservation (newsletter)
- Vos droits
- Désabonnement
- `useSeoMeta` (garde `robots: 'noindex, follow'`)

## Variables d'environnement

```bash
NUXT_PUBLIC_GTAG_ID=G-KTGGEP09JY
```

À ajouter dans :
- `.env.example` (commit)
- `.env` (local, déjà gitignored)
- Vercel : variable d'environnement de production

Le mesure ID est public (visible dans le HTML de toute page après chargement), donc pas un secret au sens strict, mais on garde le pattern `NUXT_PUBLIC_*` pour cohérence avec `NUXT_PUBLIC_POSTHOG_KEY`.

## Critères de succès

- En navigation privée fraîche, la bannière apparaît au premier chargement.
- Clic « Refuser » : aucun cookie `_ga*` ni `ph_*` n'est déposé ; GA4 DebugView montre des « cookieless pings » ; PostHog continue à envoyer des events anonymes (vérification dans le dashboard PostHog).
- Clic « Accepter » : cookies `_ga`, `_ga_KTGGEP09JY`, `ph_*` déposés ; session recording démarre côté PostHog ; GA4 DebugView passe en mode normal.
- Footer affiche « Gérer mes cookies ». Clic ouvre la modal. Changement de préférence applique immédiatement (passage granted → denied stoppe le session recording).
- Page `/cookies` accessible, listant `_ga`, `_ga_KTGGEP09JY`, `ph_*`, `cookie-consent`, `hasUnlockedScanner`.
- Page `/confidentialite` ne mentionne plus « aucun cookie déposé », date « mai 2026 », section Mesure d'audience à jour.
- Manipulation manuelle du timestamp dans localStorage (> 13 mois) → bannière réapparaît au reload.
- Pas d'erreur console quand un adblocker bloque gtag ou PostHog.
- Aucun emoji dans les fichiers `.vue` créés ou modifiés (vérification `grep` avant commit, cohérent feedback DA).

## Hors-scope

- Création d'événements GA4 custom (au-delà du pageview par défaut) — viendra si nécessaire pour Google Ads.
- Migration des dashboards PostHog vers le mode identified — les events resteront anonymes au sens utilisateur (pas de `posthog.identify()` automatique), seul le session recording sera lié à un session-id PostHog.
- Pixel Meta / LinkedIn — pas encore au programme, mais le `version: 1` du localStorage permettra de re-déclencher la bannière le jour où on les ajoute.
- Effacement rétroactif des cookies déjà déposés lors du downgrade granted → denied — limitation technique standard, documentée dans `/cookies`.

## Étapes suivantes

1. Spec validée par Mathieu.
2. Plan d'implémentation via skill `writing-plans` — sortie : tâches discrètes pour chaque fichier (composable, plugin gtag, plugin PostHog patch, composant CookieBanner, page /cookies, footer, /confidentialite update, env vars, vérif Vercel).
3. Test manuel en navigation privée + adblocker + iPhone réel avant déploiement.
4. Update mémoire `reference_posthog.md` : PostHog n'est plus cookieless par défaut depuis cette spec.
