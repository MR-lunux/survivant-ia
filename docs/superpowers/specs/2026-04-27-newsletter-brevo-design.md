# Newsletter Brevo — Design Spec
**Date** : 2026-04-27
**Statut** : Approuvé

---

## Vision

Rendre le formulaire d'inscription newsletter fonctionnel : collecter les emails des visiteurs, les ajouter à Brevo, et leur envoyer automatiquement un welcome email dans la direction artistique du site.

---

## Périmètre

- Formulaire d'inscription avec checkbox de consentement
- Page Politique de confidentialité (`/confidentialite`)
- Endpoint serveur `/api/subscribe`
- Welcome email via Brevo Automation
- Configuration DNS pour la délivrabilité (SPF, DKIM, DMARC)

Hors périmètre : RSS-to-email automatique, double opt-in, système de grades.

---

## Flow complet

```
User remplit formulaire (email + checkbox)
  → POST /api/subscribe
      ├── Validation : format email + consent === true
      ├── Brevo API — POST /contacts (ajout à la liste)
      └── Réponse { ok: true } ou { error: "..." }
           → Brevo Automation déclenche le welcome email
```

Brevo est la source de vérité pour les contacts. Pas de base SQLite locale.

---

## 1. Formulaire (NewsletterForm.vue)

Le placeholder existant (actuellement disabled) devient fonctionnel.

**Champs :**
- Input email
- Checkbox : "J'accepte de recevoir la newsletter hebdomadaire et j'ai pris connaissance de la [Politique de confidentialité]"
- Bouton submit : désactivé tant que la checkbox n'est pas cochée

**États UI :**

| État | Bouton | Message |
|---|---|---|
| idle | `SÉCURISER MON POSTE` | — |
| loading | `CHIFFREMENT EN COURS...` + disabled | — |
| success | caché | `> ACCÈS ACCORDÉ. BIENVENUE DANS LA FRÉQUENCE.` (vert) |
| error | réactivé | message d'erreur en rouge (format invalide / erreur serveur) |

Le composant reçoit toujours la prop `formUrl` pour compatibilité mais elle n'est plus utilisée — le formulaire est natif.

---

## 2. Page Politique de confidentialité (`/confidentialite`)

Page simple dans le design du site. Contenu minimal légalement suffisant (RGPD + LPD suisse) :

- Responsable du traitement : Mathieu [À COMPLÉTER : nom de famille], survivant-ia.ch
- Données collectées : adresse email uniquement
- Finalité : envoi de la newsletter hebdomadaire
- Sous-traitant : Brevo (hébergé en UE)
- Durée de conservation : jusqu'au désabonnement
- Droits : accès, rectification, suppression → contact par email
- Désabonnement : lien en bas de chaque email

---

## 3. Endpoint serveur — `/server/api/subscribe.post.ts`

```typescript
// Logique
POST { email: string, consent: boolean }

1. Valider format email (regex ou validator)
2. Vérifier consent === true
3. Appeler Brevo API POST /v3/contacts :
   {
     email,
     listIds: [ID_LISTE_BREVO],
     attributes: { CONSENT: true, SOURCE: 'website' }
   }
4. Gérer les cas :
   - 201 Created → { ok: true }
   - 204 Already exists → { ok: true } (pas d'erreur pour l'utilisateur)
   - Autre → { error: "Erreur technique, réessayez." }
```

La clé API Brevo est dans `.env` : `BREVO_API_KEY=...`
Elle n'est jamais exposée côté client.

---

## 4. Welcome email — Brevo Automation

**Déclencheur** : Contact ajouté à la liste newsletter

**Délai** : immédiat

**Expéditeur** : `Mathieu — Survivant de l'IA <mathieu@survivant-ia.ch>`

**Objet** : `> ACCÈS ACCORDÉ — Bienvenue dans la Fréquence`

**Design email** : Template HTML dans l'éditeur Brevo
- Fond noir (#0a0a0a)
- Texte principal blanc/gris clair
- Accents verts (#00FF41)
- Police : Courier New (monospace système)
- Séparateurs style terminal (`────────────────`)
- Ton : direct, militaire-bienveillant, vouvoiement

**Contenu :**
1. Accroche de bienvenue dans le ton du site
2. Rappel de ce qu'ils vont recevoir (les 3 bénéfices de la page fréquence)
3. Liens principaux : site, LinkedIn, Instagram
4. Lien de désabonnement (obligatoire, géré par Brevo)

---

## 5. Configuration DNS — Délivrabilité

À configurer chez le registrar de `survivant-ia.ch` :

| Record | Type | Rôle |
|---|---|---|
| SPF | TXT | Autorise Brevo à envoyer pour le domaine |
| DKIM | TXT (CNAME) | Signature cryptographique des emails |
| DMARC | TXT | Politique si SPF/DKIM échouent |

Les valeurs exactes sont générées par Brevo dans Dashboard → Expéditeurs → Domaines.

---

## Compliance RGPD / LPD

- Consentement explicite via checkbox (opt-in actif)
- Finalité unique : newsletter hebdomadaire
- Lien vers politique de confidentialité dans le formulaire
- Lien de désabonnement dans chaque email (Brevo automatique)
- Données stockées uniquement dans Brevo (UE)

---

## Stack

| Composant | Outil |
|---|---|
| Formulaire | Vue 3 / Nuxt (existant) |
| Endpoint | Nuxt server routes (`/server/api/`) |
| Contacts + envoi | Brevo API v3 |
| Template email | Brevo Template Editor (HTML) |
| DNS | Registrar de survivant-ia.ch |
| Secrets | `.env` (BREVO_API_KEY, BREVO_LIST_ID) |
