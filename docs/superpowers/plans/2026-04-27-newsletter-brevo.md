# Newsletter Brevo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre le formulaire d'inscription newsletter fonctionnel — collecte prénom + email, ajout dans Brevo, welcome email personnalisé automatique.

**Architecture:** Formulaire Vue natif → endpoint Nuxt server `/api/subscribe` → Brevo Contacts API. Brevo stocke les contacts et déclenche le welcome email via automation. Zéro DB locale.

**Tech Stack:** Nuxt 4, Vue 3, Brevo API v3, TypeScript

---

## Fichiers touchés

| Action | Fichier | Rôle |
|---|---|---|
| Créer | `server/api/subscribe.post.ts` | Endpoint POST : valide input, appelle Brevo API |
| Modifier | `app/components/NewsletterForm.vue` | Formulaire fonctionnel : prénom + email + checkbox + états UI |
| Créer | `app/pages/confidentialite.vue` | Page politique de confidentialité |
| Modifier | `nuxt.config.ts` | Ajouter `runtimeConfig` pour clés Brevo privées |
| Créer | `.env` | Variables locales (jamais committé) |

---

## Task 1 — Brevo : configuration du compte (étapes manuelles)

Ces étapes se font dans l'interface Brevo. Aucun code à écrire.

- [ ] **Créer un compte Brevo** sur brevo.com (plan gratuit — 300 emails/jour)

- [ ] **Créer une liste de contacts**
  - Contacts → Listes → Créer une liste
  - Nom : `Newsletter Survivant de l'IA`
  - Noter l'ID de la liste (visible dans l'URL : `.../lists/[ID]/...`)

- [ ] **Créer l'attribut de contact PRENOM**
  - Contacts → Attributs des contacts → Ajouter un attribut
  - Nom : `PRENOM`, Type : Texte

- [ ] **Générer une clé API**
  - Profil → Clés API → Générer une nouvelle clé
  - Nom : `survivant-ia-website`
  - Copier la clé immédiatement (elle n'est affichée qu'une fois)

- [ ] **Vérifier le domaine expéditeur**
  - Paramètres → Expéditeurs & IP → Domaines → Ajouter un domaine
  - Entrer `survivant-ia.ch`
  - Brevo affiche les records DNS à configurer (SPF, DKIM) — garder cet écran ouvert pour la Task 7

---

## Task 2 — Variables d'environnement + runtimeConfig

**Fichiers :**
- Créer : `.env`
- Modifier : `nuxt.config.ts`

- [ ] **Vérifier que `.env` est dans `.gitignore`**

```bash
grep ".env" .gitignore
```

Si absent, ajouter `.env` à `.gitignore` avant de continuer.

- [ ] **Créer `.env` à la racine du projet**

```bash
# .env
NUXT_BREVO_API_KEY=ta-clé-api-brevo-ici
NUXT_BREVO_LIST_ID=ton-id-de-liste-ici
```

Remplacer les valeurs par celles copiées à la Task 1.

- [ ] **Ajouter `runtimeConfig` dans `nuxt.config.ts`**

Ouvrir `nuxt.config.ts`. Ajouter la clé `runtimeConfig` dans `defineNuxtConfig` :

```typescript
runtimeConfig: {
  brevoApiKey: '',
  brevoListId: '',
},
```

Ces valeurs sont automatiquement lues depuis `NUXT_BREVO_API_KEY` et `NUXT_BREVO_LIST_ID` au runtime (convention Nuxt : `NUXT_` + camelCase → SCREAMING_SNAKE). Elles ne sont jamais exposées côté client.

- [ ] **Committer**

```bash
git add nuxt.config.ts .gitignore
git commit -m "config: add Brevo runtimeConfig"
```

Ne pas committer `.env`.

---

## Task 3 — Endpoint serveur `/api/subscribe`

**Fichiers :**
- Créer : `server/api/subscribe.post.ts`

- [ ] **Créer `server/api/subscribe.post.ts`**

```typescript
// server/api/subscribe.post.ts
export default defineEventHandler(async (event) => {
  const { brevoApiKey, brevoListId } = useRuntimeConfig()

  const body = await readBody(event)
  const { prenom, email, consent } = body ?? {}

  if (!prenom || typeof prenom !== 'string' || prenom.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Prénom requis.' })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, message: 'Email invalide.' })
  }

  if (consent !== true) {
    throw createError({ statusCode: 400, message: 'Consentement requis.' })
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      listIds: [Number(brevoListId)],
      attributes: {
        PRENOM: prenom.trim(),
        CONSENT: true,
        SOURCE: 'website',
      },
      updateEnabled: false,
    }),
  })

  // 201 = créé avec succès
  if (res.status === 201) {
    return { ok: true }
  }

  const data = await res.json().catch(() => ({}))

  // Brevo renvoie 400 + code "duplicate_parameter" si le contact existe déjà
  // (updateEnabled: false) — silencieux pour l'utilisateur, ce n'est pas une erreur
  if (res.status === 400 && data?.code === 'duplicate_parameter') {
    return { ok: true }
  }

  const message = data?.message ?? 'Erreur technique, réessayez.'
  throw createError({ statusCode: 500, message })
})
```

- [ ] **Tester l'endpoint manuellement** (serveur dev démarré avec `npm run dev`)

Test inscription valide :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Marcel","email":"test@example.com","consent":true}'
```
Résultat attendu : `{"ok":true}`

Test email invalide :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Marcel","email":"pas-un-email","consent":true}'
```
Résultat attendu : erreur 400 `Email invalide.`

Test sans consentement :
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"prenom":"Marcel","email":"test@example.com","consent":false}'
```
Résultat attendu : erreur 400 `Consentement requis.`

Vérifier dans Brevo → Contacts que `test@example.com` apparaît avec l'attribut PRENOM = Marcel.

- [ ] **Supprimer le contact test dans Brevo** avant de continuer (Contacts → sélectionner → Supprimer).

- [ ] **Committer**

```bash
git add server/api/subscribe.post.ts
git commit -m "feat: add POST /api/subscribe endpoint"
```

---

## Task 4 — Formulaire NewsletterForm.vue

**Fichiers :**
- Modifier : `app/components/NewsletterForm.vue`

Le composant garde son canvas oscilloscope et son design. On remplace uniquement le bloc `form-placeholder` (et la logique liée à `formUrl`) par un formulaire fonctionnel.

- [ ] **Remplacer le `<template>` de `NewsletterForm.vue`**

Remplacer tout le contenu du `<template>` par :

```html
<template>
  <div class="newsletter-wrapper">
    <canvas ref="canvasEl" class="osc-canvas" aria-hidden="true" />

    <div class="newsletter-form-wrapper scanline">
      <div class="container">
        <ScannerBorder class="newsletter-inner">
          <div class="nl-header">
            <span class="nl-status font-mono"><span class="nl-dot">●</span> FRÉQUENCE ACTIVE</span>
            <h3 class="nl-title">Accès à la Fréquence — Sécurisé</h3>
            <p class="nl-subtitle">
              Recevez chaque semaine mon analyse terrain pour comprendre l'IA sans jargon, et développez les soft skills qui sécuriseront votre carrière.
            </p>
          </div>

          <form v-if="status !== 'success'" class="nl-form" @submit.prevent="submit">
            <div class="nl-fields">
              <input
                v-model="prenom"
                type="text"
                placeholder="Votre prénom"
                class="email-input"
                aria-label="Prénom"
                :disabled="status === 'loading'"
                required
              />
              <input
                v-model="email"
                type="email"
                placeholder="votre@email.com"
                class="email-input"
                aria-label="Adresse email"
                :disabled="status === 'loading'"
                required
              />
            </div>

            <label class="nl-consent">
              <input
                v-model="consent"
                type="checkbox"
                :disabled="status === 'loading'"
              />
              <span>
                J'accepte de recevoir la newsletter hebdomadaire et j'ai pris connaissance de la
                <NuxtLink to="/confidentialite" target="_blank">Politique de confidentialité</NuxtLink>.
              </span>
            </label>

            <p v-if="errorMsg" class="setup-note">{{ errorMsg }}</p>

            <button
              type="submit"
              class="btn-glitch"
              :data-text="status === 'loading' ? 'CHIFFREMENT EN COURS...' : 'SÉCURISER MON POSTE'"
              :disabled="!canSubmit"
            >
              {{ status === 'loading' ? 'CHIFFREMENT EN COURS...' : 'SÉCURISER MON POSTE' }}
            </button>
          </form>

          <div v-else class="nl-success font-mono">
            <span class="nl-dot">●</span> ACCÈS ACCORDÉ. BIENVENUE DANS LA FRÉQUENCE.
          </div>
        </ScannerBorder>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Remplacer le bloc `<script setup>` de `NewsletterForm.vue`**

Garder tout le code canvas (WAVES, resize, draw, onMounted, onUnmounted) tel quel. Remplacer la ligne `withDefaults(defineProps...)` par la version ci-dessous (la prop `formUrl` est conservée pour compatibilité mais n'est plus utilisée), et ajouter la logique réactive avant le code canvas :

```typescript
// Remplacer la ligne withDefaults(defineProps...) par :
const props = defineProps<{ formUrl?: string }>()

// Ajouter ensuite, avant le code canvas :
const prenom  = ref('')
const email   = ref('')
const consent = ref(false)
const status  = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')

const canSubmit = computed(() =>
  prenom.value.trim().length > 0 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  consent.value &&
  status.value !== 'loading'
)

async function submit() {
  if (!canSubmit.value) return
  status.value = 'loading'
  errorMsg.value = ''

  try {
    await $fetch('/api/subscribe', {
      method: 'POST',
      body: { prenom: prenom.value.trim(), email: email.value, consent: consent.value },
    })
    status.value = 'success'
  } catch (err: any) {
    status.value = 'error'
    errorMsg.value = err?.data?.message ?? 'Erreur technique, réessayez.'
  }
}
```

- [ ] **Ajouter les styles manquants** dans `<style scoped>` (en bas du fichier, après les styles existants) :

```css
.nl-form { display: flex; flex-direction: column; gap: 1rem; }
.nl-fields { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.nl-fields .email-input { flex: 1; min-width: 180px; }

.nl-consent {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.75rem;
  color: var(--color-muted);
  cursor: pointer;
  line-height: 1.5;
}
.nl-consent input[type="checkbox"] { margin-top: 0.15rem; flex-shrink: 0; accent-color: var(--color-accent); }
.nl-consent a { color: var(--color-accent); }

.nl-success {
  font-size: 0.85rem;
  color: var(--color-accent);
  letter-spacing: 0.08em;
  padding: 0.5rem 0;
}
.nl-success .nl-dot { animation: nlBlink 1.2s step-end infinite; }
```

- [ ] **Tester dans le navigateur** (`npm run dev`)
  - Ouvrir `/frequence`
  - Vérifier que le formulaire affiche prénom + email + checkbox
  - Le bouton doit rester grisé tant que la checkbox n'est pas cochée
  - Remplir avec un vrai email de test → soumettre → vérifier `> ACCÈS ACCORDÉ`
  - Vérifier le contact dans Brevo avec PRENOM renseigné
  - Tester le message d'erreur avec un email invalide

- [ ] **Committer**

```bash
git add app/components/NewsletterForm.vue
git commit -m "feat: make NewsletterForm functional — prénom, email, consent, states"
```

---

## Task 5 — Page `/confidentialite`

**Fichiers :**
- Créer : `app/pages/confidentialite.vue`

- [ ] **Créer `app/pages/confidentialite.vue`**

```vue
<!-- app/pages/confidentialite.vue -->
<script setup lang="ts">
useSeoMeta({
  title: 'Politique de confidentialité — Survivant de l\'IA',
  description: 'Comment vos données sont collectées et utilisées par Survivant de l\'IA.',
})
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem; max-width: 65ch;">
    <span class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted);">// POLITIQUE DE CONFIDENTIALITÉ</span>
    <h1 style="margin: 0.5rem 0 2.5rem;">Politique de confidentialité</h1>

    <section class="policy-section">
      <h2>Responsable du traitement</h2>
      <p>Mathieu Rérat, <a href="https://survivant-ia.ch">survivant-ia.ch</a><br>
      Contact : <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a></p>
    </section>

    <section class="policy-section">
      <h2>Données collectées</h2>
      <p>Lors de l'inscription à la newsletter, nous collectons :</p>
      <ul>
        <li>Votre adresse email</li>
        <li>Votre prénom</li>
      </ul>
      <p>Aucune autre donnée n'est collectée.</p>
    </section>

    <section class="policy-section">
      <h2>Finalité</h2>
      <p>Ces données sont utilisées uniquement pour l'envoi de la newsletter hebdomadaire <em>Survivant de l'IA</em>. Elles ne sont ni vendues, ni partagées, ni utilisées à d'autres fins.</p>
    </section>

    <section class="policy-section">
      <h2>Sous-traitant</h2>
      <p>Les données sont traitées par <strong>Brevo</strong> (Sendinblue SAS), hébergé dans l'Union européenne, dans le respect du RGPD. <a href="https://www.brevo.com/legal/privacypolicy/" target="_blank" rel="noopener">Politique de confidentialité Brevo ↗</a></p>
    </section>

    <section class="policy-section">
      <h2>Durée de conservation</h2>
      <p>Vos données sont conservées jusqu'à votre désabonnement. Chaque email contient un lien de désabonnement en un clic.</p>
    </section>

    <section class="policy-section">
      <h2>Vos droits</h2>
      <p>Conformément au RGPD et à la loi suisse sur la protection des données (LPD), vous disposez des droits suivants :</p>
      <ul>
        <li>Droit d'accès à vos données</li>
        <li>Droit de rectification</li>
        <li>Droit à l'effacement</li>
        <li>Droit d'opposition au traitement</li>
      </ul>
      <p>Pour exercer ces droits, contactez : <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a></p>
    </section>

    <section class="policy-section">
      <h2>Désabonnement</h2>
      <p>Chaque email contient un lien de désabonnement. Vous pouvez également envoyer une demande à <a href="mailto:mathieu@survivant-ia.ch">mathieu@survivant-ia.ch</a>.</p>
    </section>

    <p class="font-mono" style="font-size: 0.65rem; color: var(--color-muted); margin-top: 3rem;">
      Dernière mise à jour : avril 2026
    </p>
  </div>
</template>

<style scoped>
.policy-section { margin-bottom: 2.5rem; }
.policy-section h2 { font-size: 1rem; margin: 0 0 0.75rem; color: var(--color-accent); }
.policy-section p, .policy-section li { font-size: 0.9rem; color: var(--color-muted); line-height: 1.7; }
.policy-section ul { padding-left: 1.5rem; margin: 0.5rem 0; }
.policy-section li { margin-bottom: 0.25rem; }
</style>
```

- [ ] **Vérifier dans le navigateur**
  - Ouvrir `/confidentialite`
  - Vérifier que la page s'affiche dans le design du site
  - Cliquer sur le lien "Politique de confidentialité" dans le formulaire → doit ouvrir la page dans un nouvel onglet

- [ ] **Committer**

```bash
git add app/pages/confidentialite.vue
git commit -m "feat: add /confidentialite page (RGPD + LPD)"
```

---

## Task 6 — Welcome email dans Brevo (étapes manuelles)

Ces étapes se font dans l'interface Brevo.

- [ ] **Créer le template email**
  - Campagnes → Templates → Créer un template
  - Choisir "Éditeur de code" (HTML brut)
  - Nom du template : `Welcome — Bienvenue dans la Fréquence`

- [ ] **Coller ce HTML dans l'éditeur Brevo**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bienvenue dans la Fréquence</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Courier New',Courier,monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#141414;border:1px solid #1f1f1f;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 0;border-bottom:1px solid #00FF41;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#00FF41;text-transform:uppercase;">// TRANSMISSION ENTRANTE</p>
              <p style="margin:8px 0 24px;font-size:11px;letter-spacing:0.1em;color:#555;">SURVIVANT-IA.CH — FRÉQUENCE ACTIVE</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#E0E0E0;letter-spacing:-0.02em;">
                Bonjour {{ contact.PRENOM }},
              </p>

              <p style="margin:0 0 16px;font-size:14px;color:#888;line-height:1.8;">
                Votre accès à la Fréquence est confirmé.
              </p>

              <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.8;">
                Chaque semaine, vous recevrez un rapport de survie dans votre boîte mail. Concret, actionnable, sans jargon. Ce que les algorithmes ne peuvent pas vous apprendre.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1f1f1f;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.1em;color:#555;">// CE QUE VOUS RECEVEZ</p>
                    <p style="margin:0 0 10px;font-size:13px;color:#E0E0E0;">▸ <strong>1 outil concret par semaine</strong></p>
                    <p style="margin:0 0 16px;font-size:12px;color:#888;">Pas de théorie. Une technique applicable dès le lendemain.</p>
                    <p style="margin:0 0 10px;font-size:13px;color:#E0E0E0;">▸ <strong>Les soft skills que l'IA ne remplacera pas</strong></p>
                    <p style="margin:0 0 16px;font-size:12px;color:#888;">Communication, gestion de l'ambiguïté, intelligence émotionnelle.</p>
                    <p style="margin:0 0 10px;font-size:13px;color:#E0E0E0;">▸ <strong>Comprendre l'IA sans en avoir peur</strong></p>
                    <p style="margin:0;font-size:12px;color:#888;">Ce qu'elle fait vraiment, ses limites, et comment vous positionner.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;color:#555;">// LIENS PRINCIPAUX</p>
              <p style="margin:0 0 8px;font-size:13px;color:#888;">→ <a href="https://survivant-ia.ch" style="color:#00FF41;text-decoration:none;">Le site</a></p>
              <p style="margin:0 0 8px;font-size:13px;color:#888;">→ <a href="https://linkedin.com/in/mathieu-rerat" style="color:#00FF41;text-decoration:none;">LinkedIn</a></p>
              <p style="margin:0 0 32px;font-size:13px;color:#888;">→ <a href="https://instagram.com/survivant_ia" style="color:#00FF41;text-decoration:none;">Instagram</a></p>

              <p style="margin:0;font-size:14px;color:#555;border-top:1px solid #1f1f1f;padding-top:24px;line-height:1.8;">
                À très vite dans la Fréquence,<br>
                <strong style="color:#E0E0E0;">Mathieu</strong><br>
                <span style="font-size:11px;letter-spacing:0.1em;color:#555;">SURVIVANT DE L'IA</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1f1f1f;">
              <p style="margin:0;font-size:10px;color:#333;letter-spacing:0.08em;">FIN DE TRANSMISSION ────────────────────</p>
              <p style="margin:8px 0 0;font-size:10px;color:#333;">
                Vous recevez cet email car vous vous êtes inscrit sur survivant-ia.ch.<br>
                <a href="{{ unsubscribe }}" style="color:#555;text-decoration:underline;">Se désabonner</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Note :** Mettre à jour les liens LinkedIn et Instagram avec les vraies URLs avant de sauvegarder.

- [ ] **Envoyer un email de test** depuis Brevo pour vérifier le rendu (bouton "Tester" dans l'éditeur)

- [ ] **Créer l'automation**
  - Automatisations → Créer une automatisation
  - Déclencheur : "Un contact est ajouté à une liste spécifique" → sélectionner la liste newsletter
  - Action : "Envoyer un email" → sélectionner le template `Welcome — Bienvenue dans la Fréquence`
  - Objet de l'email : `> ACCÈS ACCORDÉ — Bienvenue dans la Fréquence`
  - Délai : immédiat (0 min)
  - Expéditeur : `Mathieu — Survivant de l'IA` / `mathieu@survivant-ia.ch`
  - Activer l'automation

- [ ] **Tester l'automation end-to-end**
  - Utiliser le formulaire du site avec un vrai email
  - Vérifier que le welcome email arrive (vérifier aussi les spams)
  - Vérifier que `{{ contact.PRENOM }}` est bien remplacé par le prénom saisi

---

## Task 7 — DNS : délivrabilité (étapes manuelles)

Ces étapes se font chez votre registrar (là où `survivant-ia.ch` est enregistré).

Les valeurs exactes pour SPF, DKIM et DMARC sont disponibles dans Brevo → Paramètres → Expéditeurs & IP → Domaines → `survivant-ia.ch`.

- [ ] **Ajouter l'enregistrement SPF** (type TXT sur `@` ou `survivant-ia.ch`)

Brevo fournit la valeur. Ressemble à :
```
v=spf1 include:spf.sendinblue.com mx ~all
```

Si un enregistrement SPF existe déjà pour ce domaine, ne pas en créer un second — fusionner les `include:` dans le même enregistrement.

- [ ] **Ajouter l'enregistrement DKIM** (type TXT ou CNAME selon le registrar)

Brevo fournit le nom du sous-domaine (ex: `mail._domainkey`) et la valeur.

- [ ] **Ajouter l'enregistrement DMARC** (type TXT sur `_dmarc`)

```
v=DMARC1; p=none; rua=mailto:mathieu@survivant-ia.ch
```

`p=none` = mode monitoring (ne bloque rien, envoie des rapports). À durcir en `p=quarantine` après quelques semaines si tout va bien.

- [ ] **Vérifier dans Brevo** que les 3 records sont détectés (Domaines → `survivant-ia.ch` → Vérifier)

Brevo peut prendre jusqu'à 48h pour voir les changements DNS. En pratique, souvent 1-2h.

- [ ] **Tester la délivrabilité**
  - S'inscrire avec une adresse Gmail personnelle
  - Vérifier que l'email arrive en boîte principale (pas spam)
  - Optionnel : utiliser [mail-tester.com](https://www.mail-tester.com) pour un score de délivrabilité

---

## Récapitulatif des commits

```
config: add Brevo runtimeConfig
feat: add POST /api/subscribe endpoint
feat: make NewsletterForm functional — prénom, email, consent, states
feat: add /confidentialite page (RGPD + LPD)
```
