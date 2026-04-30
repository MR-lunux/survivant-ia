# PostHog Integration — Design

**Date** : 2026-04-30
**Auteur** : Mathieu Rerat (brainstorm avec Claude)
**Statut** : design validé, plan d'implémentation à venir

---

## 1. Contexte & objectif

Le site `survivant-ia.ch` (Nuxt 4, déployé sur Vercel) n'a aujourd'hui **aucune mesure d'audience** : pas de Google Analytics, pas de bandeau cookies, et la politique de confidentialité affirme qu'aucune donnée hors newsletter Brevo n'est collectée.

L'objectif est de brancher **PostHog** pour répondre à trois questions de pilotage :

1. **Audience** : qui sont mes visiteurs (quels métiers les intéressent), d'où viennent-ils ?
2. **Contenu** : quels rapports valent la peine d'écrire plus ? lesquels sont lus jusqu'au bout ?
3. **Conversion** : pourquoi les gens ne s'inscrivent pas à la newsletter ? quelle page convertit le mieux ?

Le scanner d'obsolescence est le centre de gravité : il s'appuie sur un catalogue curé `app/data/jobs.ts` avec des `slug` canoniques, ce qui en fait un terrain idéal pour de la mesure propre (pas de texte libre à normaliser).

---

## 2. Décisions structurantes

| Décision | Choix | Pourquoi |
|---|---|---|
| Hébergement | PostHog Cloud **EU** (Frankfurt) | Audience FR/CH, conformité RGPD/nLPD, latence faible |
| Mode | Anonyme / cookieless | Évite le bandeau de consentement, conformité simplifiée, couvre 85% des besoins |
| Persistance | `memory` uniquement | Aucun cookie, aucun localStorage persistant |
| Session replay | Désactivé | Incompatible avec mode anonyme + non demandé |
| Reverse proxy | Activé via Nitro (`/_ph/*` → `eu.i.posthog.com`) | Bypass des ad-blockers (~25-30% du trafic sinon perdu) |
| Rétention | 13 mois | Conformité exemption CNIL pour mesure d'audience |

---

## 3. Architecture technique

### 3.1 Plugin Nuxt

Nouveau fichier : `app/plugins/posthog.client.ts`

- Plugin client-only (initialisation après mount, pas de SSR)
- Charge `posthog-js` (npm dependency à ajouter)
- Lit la clé publique depuis `runtimeConfig.public.posthogKey`
- Initialise PostHog avec la config définie en §3.2
- Capture `$pageview` à chaque navigation via `nuxtApp.$router.afterEach()`
- Expose `posthog` sur `nuxtApp.provide('posthog', ...)` pour appel depuis composants : `const { $posthog } = useNuxtApp()`

### 3.2 Configuration PostHog

```ts
posthog.init(key, {
  api_host: '/_ph',                    // reverse proxy
  ui_host: 'https://eu.posthog.com',   // pour les liens dans la UI
  persistence: 'memory',
  disable_persistence: true,
  disable_session_recording: true,
  enable_recording_console_log: false,
  capture_pageview: false,             // on le fait manuellement via router
  capture_pageleave: true,
  autocapture: true,
  capture_performance: true,           // Web Vitals
  respect_dnt: true,
  loaded: (ph) => {
    if (localStorage.getItem('ph_optout') === '1') ph.opt_out_capturing()
  },
})
```

### 3.3 Reverse proxy via Nitro

Dans `nuxt.config.ts`, ajouter :

```ts
routeRules: {
  '/_ph/static/**': { proxy: 'https://eu-assets.i.posthog.com/static/**' },
  '/_ph/**':        { proxy: 'https://eu.i.posthog.com/**' },
  // ... autres routes existantes
}
```

### 3.4 Variables d'environnement

`.env.example` à enrichir :

```
NUXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
```

`nuxt.config.ts` :

```ts
runtimeConfig: {
  brevoApiKey: '',
  brevoListId: '',
  public: {
    posthogKey: '',
  },
}
```

À configurer dans Vercel : `NUXT_PUBLIC_POSTHOG_KEY` (variable d'environnement publique).

### 3.5 Self-tracking exclusion

Aucune logique serveur. Mathieu pose manuellement, une fois, dans la console de son navigateur :

```js
localStorage.setItem('ph_optout', '1')
```

Le plugin lit ce flag au chargement et appelle `posthog.opt_out_capturing()`. À refaire sur chaque appareil/navigateur de Mathieu.

---

## 4. Événements

### 4.1 Capté automatiquement (pas de code)

- `$pageview` à chaque navigation (déclenché manuellement depuis le router)
- `$pageleave` (durée de la page)
- `$autocapture` sur tous les clics (boutons, liens, NuxtLink) avec texte, classe, `data-attr`, position DOM
- `$web_vitals` (LCP, FID, CLS, INP)
- `$exception` (erreurs JS, via PostHog Error Tracking)
- UTM auto-captés sur `$pageview` : `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- Referrer auto-capté : `$referring_domain`, `$referrer`

### 4.2 Événements custom — Scanner (6)

| Événement | Quand | Propriétés |
|---|---|---|
| `scanner_job_selected` | Clic sur une suggestion du dropdown OU arrivée via `?job=<slug>` | `job_slug`, `job_label`, `job_status`, `job_risk`, `job_horizon`, `source: 'suggestion' \| 'url_param'` |
| `scanner_scan_completed` | Animation de scan terminée, résultat affiché | mêmes props que ci-dessus |
| `scanner_cta_clicked` | Clic CTA final ("Rejoindre La Fréquence" / "S'inscrire") | `job_slug`, `job_status`, `cta_label` |
| `scanner_reset` | Clic "scanner un autre métier" | `previous_job_slug` |
| `scanner_search_no_results` | Query ≥3 caractères qui ne renvoie aucune suggestion (debounce 600 ms) | `query` (raw text) |
| `scanner_result_shared` | Clic sur le bouton "copier le lien" (`copyLink()` à `scanner.vue:236`) | `job_slug`, `job_status`, `risk` |

### 4.3 Événements custom — Newsletter (4)

Le formulaire est utilisé sur 3+ emplacements (homepage, `/frequence`, fin d'article). Chaque événement porte un `source_page` pour distinguer.

| Événement | Quand | Propriétés |
|---|---|---|
| `newsletter_form_focused` | 1er focus sur le champ email — émis **une seule fois par pageview** (flag local au composant remis à zéro à chaque montage) | `source_page` |
| `newsletter_signup_submitted` | Submit du formulaire | `source_page` |
| `newsletter_signup_failed` | Catch du `$fetch('/api/subscribe')` | `source_page`, `reason: 'validation' \| 'server' \| 'network'`, `error_message` |
| `newsletter_signup_succeeded` | Réponse 200 de `/api/subscribe` | `source_page` |

### 4.4 Événements custom — Articles (3)

Sur `app/pages/rapports/[...slug].vue` :

| Événement | Quand | Propriétés |
|---|---|---|
| `report_read_progress` | Paliers de scroll 25 / 50 / 75 / 100 % du `<article>` | `slug`, `category`, `depth: 25 \| 50 \| 75 \| 100` |
| `article_internal_link_clicked` | Clic sur un lien interne (vers `/rapports/*`, `/scanner`, `/frequence`) dans le corps de l'article | `from_slug`, `to_url`, `link_text` |
| `article_source_clicked` | Clic sur un lien externe (sources, citations) dans le corps | `from_slug`, `external_domain` |

> **Note technique** : le corps des articles est rendu par `<ContentRenderer>` (`@nuxt/content`), donc les `<a>` sont du HTML brut sans handlers Vue. La détection se fera via un **listener de clic délégué** posé sur le wrapper `<article>` qui inspecte `event.target.closest('a')` et route vers l'événement correspondant selon `href` (interne vs externe).

### 4.5 Événements custom — Liste rapports (1)

Sur `app/pages/rapports/index.vue` :

| Événement | Quand | Propriétés |
|---|---|---|
| `report_card_clicked` | Clic sur une carte de rapport dans la liste | `slug`, `category`, `position` (1-based) |

### 4.6 Événements custom — Homepage (1)

Sur `app/pages/index.vue` :

| Événement | Quand | Propriétés |
|---|---|---|
| `home_cta_clicked` | Clic sur les 3 CTAs principaux du home | `cta: 'scanner' \| 'rapports' \| 'newsletter'` |

### 4.7 Convention `data-attr`

Sur les éléments stratégiques (CTAs principaux, items de nav header/footer, boutons sociaux), ajouter un attribut `data-attr="..."` stable. Permet de filtrer les événements `$autocapture` par identifiant logique (et non par texte du bouton, qui peut changer).

Exemples : `data-attr="header-nav-rapports"`, `data-attr="footer-linkedin"`, `data-attr="hero-cta-scanner"`.

---

## 5. Politique de confidentialité — mise à jour

Le fichier `app/pages/confidentialite.vue` doit être mis à jour. Section actuelle "Données collectées" / "Sous-traitant" à étendre avec :

> **Mesure d'audience anonyme**
>
> Pour comprendre comment le site est utilisé et l'améliorer, nous utilisons **PostHog** (hébergé dans l'Union européenne, à Francfort) en mode strictement anonyme :
>
> - Aucun cookie n'est déposé sur votre appareil
> - Aucun identifiant persistant n'est créé
> - Les données collectées (pages visitées, clics, métiers scannés, performances techniques) sont agrégées et ne permettent pas de vous identifier
> - Conformément à l'exemption CNIL pour la mesure d'audience, ces données sont conservées 13 mois maximum
>
> Vous pouvez vous opposer à cette mesure en activant le mode "Do Not Track" de votre navigateur — nous le respectons automatiquement.
>
> Lien : [PostHog — Politique de confidentialité](https://posthog.com/privacy) ↗

**Configuration côté PostHog** (à faire manuellement dans la UI après création du projet) :
- Project Settings → Data retention : **13 mois**
- Settings → Anonymize IPs : **enabled**

---

## 6. Dashboard hebdo "Pilotage Survivant"

Un seul dashboard PostHog à créer manuellement après le branchement, nommé **"Pilotage Survivant — Hebdo"**, avec 7 tuiles dans cet ordre :

| # | Tuile | Type insight | Détails |
|---|---|---|---|
| 1 | Inscriptions newsletter / semaine | Trends, count weekly | Événement : `newsletter_signup_succeeded` |
| 2 | Conversion par page d'origine | Trends ou Funnel | `pageview` → `newsletter_signup_succeeded`, breakdown par `source_page` |
| 3 | Top 10 jobs scannés | Trends, table view, top 10 | `scanner_job_selected`, breakdown par `job_slug` |
| 4 | Top 5 articles + taux de complétion | Funnel par article | `pageview /rapports/*` → `report_read_progress` (depth=100), breakdown par `slug` |
| 5 | Mix d'acquisition | Trends, pie | Breakdown par `utm_source` (fallback `$referring_domain`) |
| 6 | Recherches scanner sans résultat | Trends, table | `scanner_search_no_results`, breakdown par `query` |
| 7 | Santé technique | Trends multi-séries | LCP p75 > 2500ms + count `$exception` |

**Rituel** : revue 5 minutes chaque lundi → identifier 1 signal à creuser dans la semaine.

---

## 7. Discipline UTM

PostHog capte automatiquement les UTM, mais c'est la responsabilité de Mathieu de **tagguer ses propres liens externes** :

- Posts LinkedIn : `?utm_source=linkedin&utm_medium=social&utm_campaign=<slug-du-post>`
- Signature email : `?utm_source=email&utm_medium=signature`
- Newsletter Brevo elle-même : `?utm_source=newsletter&utm_medium=email&utm_campaign=<edition>`
- Partenariats : `?utm_source=<partenaire>&utm_medium=referral`

Convention : `utm_source` = canal, `utm_medium` = type, `utm_campaign` = nom unique.

---

## 8. Hors scope (ce qu'on NE fait PAS)

- ❌ Bandeau de consentement / cookie banner
- ❌ Session replays
- ❌ Identification d'utilisateurs (`posthog.identify()`) — incompatible avec mode anonyme
- ❌ A/B testing / Feature Flags PostHog
- ❌ Surveys PostHog
- ❌ LLM Analytics / Product Analytics avancées
- ❌ Tracking d'animations / interactions visuelles (radar, particules)
- ❌ Tracking sur `/identite`, `/confidentialite` (autocapture suffit)
- ❌ Tracking keystroke par keystroke dans le scanner
- ❌ Migration / suppression de Google Analytics (n'est pas installé)

---

## 9. Critères de succès

L'intégration est réussie quand :

1. Une visite réelle sur survivant-ia.ch génère un `$pageview` visible dans PostHog en moins de 30 secondes.
2. Les 15 événements custom listés en §4 sont visibles dans l'event explorer après tests manuels de chaque parcours.
3. Le dashboard "Pilotage Survivant — Hebdo" est créé et lisible.
4. La politique de confidentialité est mise à jour et reflète exactement la collecte effective.
5. La rétention est configurée à 13 mois et l'anonymisation IP est active.
6. Aucun cookie PostHog n'est déposé (vérifiable dans devtools).
7. Mathieu a posé son flag `ph_optout` sur ses navigateurs principaux.
8. `?ph=debug` ou la console montre les events qui partent (mode dev).

---

## 10. Étapes ultérieures (post-implémentation)

Hors de ce spec — à considérer si le projet évolue :

- Si la newsletter prend de l'ampleur : passer en mode "complet" avec consent banner pour activer les session replays sur des parcours problématiques identifiés.
- Si plusieurs scanners se développent : refactor des events `scanner_*` vers un préfixe générique (`tool_*`).
- Si la conversion devient un vrai sujet : ajouter un funnel personnalisé multi-step (article → scanner → newsletter).
