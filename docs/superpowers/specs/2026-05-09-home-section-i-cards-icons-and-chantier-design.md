# Section I — 4 cartes d'entrée (icônes refresh + carte Chantier)

**Date** : 2026-05-09
**Scope** : home `/` — section "I. Choisis ton entrée"
**Type** : design refresh + nouvelle carte teaser + nouvelle route

## Contexte

La home affiche actuellement 3 cartes d'entrée sous le hero :

1. **01 — Newsletter** (icône soundwave ripple, animée)
2. **02 — Scanner** (icône sablier fill/empty, animée)
3. **03 — Boîte à Outils** (icône toolbox, animation `latch-pulse` glow uniquement)

Layout actuel : 01/02 côte à côte, 03 en bande wide (`qcard-wide`).

Deux problèmes à résoudre :

1. **Carte 03 sous-animée** : le verrou ne fait que pulser opacity + glow, sans vrai mouvement. Visuellement déclassée par rapport au ripple et au sablier.
2. **Pas de 4e entrée pour la pratique** : aucun signal sur la home pour les lecteurs qui voudraient passer de la lecture à un format hands-on. Souhait : tester l'appétit sans se commettre sur le format final (gratuit/payant, atelier/challenge/coaching).

## Décisions

### Layout

Grid **2×2 égal**. La classe `qcard-wide` disparaît de 03. La hiérarchie passe désormais par la copy et l'icône, pas par la taille.

```
[01 Newsletter] [02 Scanner]
[03 Outils]     [04 Chantier]
```

### Carte 04 — *Chantier* (test de désir)

Test d'appétit sur un format hands-on. Le statut "en cours de réflexion" est *assumé visuellement* via la copy (italique sage Playfair sur le kicker), pas via un badge ou une bordure spéciale. La carte conserve le même chrome que les 3 autres.

**Copy** :

| Élément | Contenu |
|---|---|
| Kicker | `04 / *en cours de réflexion*` — Inter caps + Playfair italic sage sur la partie italique (pattern signature DA V2) |
| Question | *Veux-tu **mettre les mains dans le cambouis** ?* |
| Meta | On pense à un format pour passer de la lecture à la pratique. Dis-moi ce qui t'intéresserait. |
| CTA | *Donner mon avis* → `/chantier` |

**Icône** : 3 briques rectangulaires **empilées les unes sur les autres** (la 1ère en bas, la 3e en haut), qui apparaissent en boucle dans cet ordre.

- Animation : chaque brique fade-in + slide-up (translateY +6px → 0px) à sa position cible, stagger 0.5s (brique 1 → brique 2 → brique 3 du bas vers le haut), cycle ~4s ease-in-out infinite, reset entre cycles.
- Métaphore : le format "se construit". Unifie le sujet (pratique/atelier) et le statut (en chantier).
- Grammaire cohérente avec le ripple de la carte 01 (stagger d'éléments).

**Contraintes brand** :

- Pas du mot "formation" dans la copy (memory rule : Survivant-IA n'est pas une activité de formation payante).
- Pas de nom de produit fixé sur la carte. "Chantier" reste implicite (icône + URL `/chantier`).
- Casse : "en cours de réflexion" en minuscules italiques, pas en CAPS façon LinkedIn.

### Carte 03 — Boîte à Outils (icône remplacée)

L'animation `latch-pulse` (opacity + glow sur le verrou) est **supprimée**. Remplacée par un mouvement franc qui distingue 03 dans le set des 4 icônes.

**Icône** :

- Boîte actuelle conservée (rect + handle + latch — tous statiques).
- **Nouveau** : un manche d'outil (clé à molette ou marteau — à arbitrer à l'impl, voir Open questions) émerge par le haut de la boîte.
- Animation : translateY -8px → hold ~0.5s → retour à 0, cycle ~3s ease-in-out infinite.
- Le verrou redevient statique (plus de drop-shadow animée).

**Layout** : carte normale, plus de `qcard-wide`. Suppression de la règle CSS `.qcard-wide { grid-column: 1 / -1; }`.

**Cohérence du set d'icônes** :

| Carte | Type de mouvement |
|---|---|
| 01 Newsletter | radial (ripple) |
| 02 Scanner | linéaire vertical (fill/empty) |
| 03 Outils | translation verticale ponctuelle (sortie d'outil) |
| 04 Chantier | additif vertical staggered (briques) |

Chaque carte a une grammaire d'animation distincte, pas de redondance.

### Page `/chantier` (nouvelle route)

Page légère et sobre, dans la DA V2 (warm dark + sage + Playfair italic). Pas de lien depuis le header — accessible **uniquement** via le clic sur la carte 04. Indexable mais profil bas.

**Structure** :

1. **Header**
   - Titre court : *"On ouvre un chantier."* (Playfair italic sage, ton "annonce")
   - Sous-titre 1 ligne : *"Un format pour passer de la lecture à la pratique. On y réfléchit. Dis-nous ce qui t'intéresserait."*

2. **Corps — 2 paragraphes**
   - **Ce que ça pourrait être** : liste d'hypothèses ouvertes (atelier collectif live, challenge sur 2 semaines, coaching à plusieurs, format async par email…). Volontairement non-prescriptif.
   - **Ce que ça ne sera pas** : pas une formation longue, pas du jargon, format/prix non décidés. Honnêteté assumée — c'est *vraiment* en cours de réflexion.

3. **Form**
   - Champ `email` (requis)
   - Champ `interest` texte libre optionnel : *"Qu'est-ce qui t'intéresserait le plus ? (1 phrase)"*
   - Bouton : *"Je suis intéressé·e"*

4. **Confirmation** (post-submit, inline)
   - 1 ligne : *"Merci. On revient vers toi quand le chantier prend forme."*
   - Pas d'auto-redirect, pas de prompt newsletter additionnel.

**Storage du signal** :

- **Critique** : ne pas polluer la liste newsletter "La Fréquence" (memory : conversion #1, signal différent).
- Solution : tag dédié `chantier_interested` ou liste séparée dans le provider (Brevo) — à préciser à l'impl en regardant l'infra existante (`server/api/newsletter/` ou équivalent).
- Le champ `interest` (texte libre) est stocké comme propriété custom sur le contact ou dans une table dédiée.

**SEO** :

- `<title>` : "Chantier — Survivant-IA"
- Meta description : courte, honnête, ~140 chars.
- Pas de schema markup à ce stade (pas un produit défini).
- `robots` : indexable par défaut. À questionner si on préfère `noindex` initialement le temps que le format se précise (le contenu peut pivoter).

## Architecture

**Fichiers touchés** :

- `app/pages/index.vue` — markup carte 04, nouvelle SVG icône 04, SVG icône 03 modifiée, suppression de `qcard-wide` sur 03, CSS animations.
- `app/pages/chantier.vue` — nouveau fichier, page complète + form.
- `server/api/chantier/interest.post.ts` — nouvel endpoint pour stocker le signal (à harmoniser avec l'infra newsletter existante).
- Éventuellement : `app/composables/useChantierSignal.ts` si la logique form est non-triviale.

**Pas touchés** :

- Header / nav globaux (pas de lien `/chantier`).
- Sitemap : `/chantier` y figure naturellement via la conf existante (vérifier).

## Open questions (à arbitrer à l'impl)

1. **Choix de l'outil qui émerge sur la carte 03** : clé à molette vs marteau. Le marteau est aussi proposé pour la carte 04 (à éviter pour la distinction). → probablement **clé** sur 03.
2. **Provider d'email pour `/chantier`** : Brevo (existing) avec tag/liste séparée, ou simple insert DB si pas de besoin transactionnel ? À regarder selon l'infra newsletter existante.
3. **Form validation côté client** : email format basique, message d'erreur sobre si KO.
4. **Analytics** : event `chantier_intent_submit` (PostHog) avec property `has_interest_text` (bool). Pas de capture du contenu pour respecter la sobriété.

## Hors scope

- Décision finale du format atelier/challenge/coaching (c'est *justement* ce que ce test mesure).
- Pricing.
- Calendrier de lancement.
- Promotion ailleurs que sur la home (pas de bandeau, pas de mention dans la newsletter, pas de footer link). On regarde le signal natif de la home seule.

## Critères de succès

- Visuel : les 4 cartes ont chacune une animation distincte et lisible. Aucune ne paraît "déclassée".
- Brand : pas de mot "formation" dans la copy. Statut "en cours de réflexion" lisible sans badge.
- Tech : `/chantier` rend en SSR, form fonctionne, signal stocké séparément du newsletter.
- Mesure : on peut compter combien de visiteurs (a) cliquent la carte 04, (b) submit le form, (c) remplissent le champ texte libre.
