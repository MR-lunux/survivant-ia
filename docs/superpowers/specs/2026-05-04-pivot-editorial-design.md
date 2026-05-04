# Pivot éditorial Survivant-IA — design (sous-projet 1)

**Date** : 2026-05-04
**Statut** : design validé, prêt pour `writing-plans`
**Scope** : sous-projet 1 sur 3 du repositionnement global (cf. section "Hors scope")

---

## 1. Intention

Faire passer la copy du site de défensif (« ne pas se faire remplacer ») à transformatif (« apprendre à piloter l'IA »), tout en posant dès maintenant le contrat avec le visiteur : **un nouvel article chaque semaine** (gratuit) **+ des formations approfondies à venir** (payantes).

Logique narrative à incarner sur la home :

```
PEUR (le diagnostic révèle le risque)
  → RECADRAGE (compétences IA-proof : voici ce qui ne s'automatise pas)
    → MÉTHODE (production éditoriale hebdomadaire = preuve)
      → ACCOMPAGNEMENT (newsletter gratuite, formations à venir)
```

## 2. Cible

Le **salarié non-tech, en poste**, qui sent l'IA arriver sur son métier et veut devenir celui qui maîtrise l'IA mieux que les autres dans son équipe, sans devenir développeur. Pas le freelance, pas le dirigeant, pas le tech.

## 3. Décisions structurantes

| Décision | Choix retenu |
|---|---|
| H1 du hero | `SURVIVRE À L'IA AU TRAVAIL, C'EST APPRENDRE À LA PILOTER` |
| Sous-titre / baseline | `Le repère des salariés qui veulent maîtriser l'IA pour en sortir gagnants.` |
| Verbe d'action principal | `piloter` (partout) — `chevaucher la vague` retiré du lexique |
| Mot banni | `méthode` (n'est pas vendue à ce stade) — remplacé par `leviers` (hero), `signal pratique` (manifeste) |
| Modèle éditorial | `newsletter` reste mot-porte CTA, mais le message de valeur partout est `un nouvel article chaque semaine` |
| Jour de publication | jamais mentionné ("mardi" supprimé partout) |
| Ordre home | Option narrative : Hero → Bandeau trajectoire → Manifeste → Diagnostic IA → Compétences IA-proof → Rapports → FAQ → Newsletter |
| Scanner copy | Reformulation neutre A3 : "diagnostic IA" sans annoncer "risque + potentiel" (cette feature appartient au sous-projet 2) |
| Page Identité | Incluse dans ce sous-projet (rééquilibrage autorité > persona) |
| Titre Mathieu | `Deputy Head of IT` partout (signature manifeste + page Identité) |
| Style typo | em-dashes `—` remplacés par `:` (définition) ou `,` (incise) — convention française naturelle, pas tirets simples |

## 4. Architecture

### 4.1 Composants impactés

| Fichier | Type | Nature |
|---|---|---|
| `app/pages/index.vue` | edit | H1, sous-titre, paragraphe intro, copy des 2 cartes, insertion du bandeau, renumérotation des HomeMasthead |
| `app/components/HomeMastheadTrajectoire.vue` | **new** | Strip minimaliste sous le hero |
| `app/components/HomeManifesteEditorial.vue` | edit | Paragraphe + signature |
| `app/components/HomeDiagnosticTeaser.vue` | edit | Titre + sous-titre + CTA |
| `app/components/HomeFaq.vue` | edit | H2 + 5 réponses sur 8 réécrites (Q1, Q4, Q6, Q7, Q8) ; Q2/Q3/Q5 inchangées |
| `app/components/RapportsBookshelf.vue` | edit | Titre uniquement (compteur conditionnel = sous-projet 3) |
| `app/components/NewsletterForm.vue` | edit | H2 + sous-titre |
| `app/components/AppFooter.vue` | edit | Baseline |
| `app/pages/identite.vue` | edit | Métadonnées, sous-titre identité, réorganisation, premier paragraphe, bloc Mission, paragraphe clôture |
| `app/components/HomeSkillsList.vue` | unchanged | Aucune modif — le numéro romain qui le précède (`HomeMasthead`) est dans `index.vue` |

### 4.2 Ordre final de la home

L'ordre physique des sections **ne change pas** par rapport à aujourd'hui. Deux changements seulement :
1. **Insertion** du bandeau de trajectoire entre le hero et la section Manifeste.
2. **Renumérotation** romaine pour cohérence visuelle (suppression du saut II → IV actuel) : Compétences IA-proof passe de `IV` à `III`, Rapports de `V` à `IV`, FAQ de `VI` à `V`.

```
Hero (H1 + sous-titre + paragraphe intro + 2 cartes "Choisis ton entrée")
🆕 Bandeau de trajectoire
 II — Manifeste                          (inchangé)
      Diagnostic IA                      (inchangé, pas de num romain)
III — Compétences IA-proof               (était IV)
 IV — Rapports de Survie                 (était V)
  V — Questions fréquentes               (était VI)
NewsletterForm                           (inchangé)
```

La renumérotation se fait dans `app/pages/index.vue` au niveau des prop `num` des `<HomeMasthead>`. Aucun composant en aval n'a besoin d'être modifié à cause de la renumérotation.

## 5. Copies finales par section

### 5.1 Hero (`pages/index.vue`)

**H1** :
```
SURVIVRE À L'IA AU TRAVAIL, C'EST APPRENDRE À LA PILOTER
```

**Sous-titre / baseline** :
> Le repère des salariés qui veulent maîtriser l'IA pour en sortir gagnants.

**Paragraphe intro** :
> Tu sens que l'IA arrive sur ton métier. Tu as raison, et c'est ta meilleure opportunité depuis dix ans. Voici les leviers pour devenir le salarié qui maîtrise l'IA mieux que les autres dans son équipe. Sans jargon, sans coder, sans formation de six mois.

**Question d'amorce des cartes** : « Par où veux-tu commencer ? »

**Carte 01 — Newsletter** :
- Titre : « Veux-tu prendre une longueur d'avance ? »
- Description : « La Fréquence : un nouvel article chaque semaine, 5 minutes de lecture, dans ta boîte. »
- CTA : `Rejoindre la Fréquence (gratuit)`

**Carte 02 — Scanner** (formulation neutre A3) :
- Titre : « Veux-tu cartographier l'IA dans ton métier ? »
- Description : « Le Scanner : diagnostic IA en 10 secondes. Gratuit. »
- CTA : `Tester mon métier`

### 5.2 Bandeau de trajectoire (nouveau composant `HomeMastheadTrajectoire.vue`)

Strip horizontal minimaliste positionné entre le hero et la section II — Manifeste.

**Specs visuelles** :
- Sage rule (1px) en top et bottom
- Hauteur ~80px
- Texte centré, Inter caps, letter-spacing 0.1em
- Pas de CTA (engagement contractuel, pas point de conversion)

**Texte** :
```
UN NOUVEL ARTICLE CHAQUE SEMAINE · FORMATIONS APPROFONDIES POUR ALLER PLUS LOIN (BIENTÔT)
```

### 5.3 Section II — Manifeste (`HomeManifesteEditorial.vue`)

**Suptitre + sous-titre** : inchangés (« II — Manifeste » / « Pour qui écrit la Fréquence »).

**Paragraphe** :
> Tu vois l'IA arriver dans ton job. Tu ne sais pas comment te positionner. Tu n'es pas seul. Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est un signal pratique pour t'en servir avant les autres, une fois par semaine. Pose ton avantage maintenant, pendant que c'est encore ouvert.

**Signature** :
> Mathieu, Deputy Head of IT · 9 ans en transformation digitale · Fondateur de Survivant-IA

### 5.4 Section Diagnostic IA (`HomeDiagnosticTeaser.vue`)

**Suptitre** : `DIAGNOSTIC IA` (inchangé)

**Titre** : *Maîtriser l'IA au travail commence par un diagnostic.*

**Sous-titre** : *Scanne ton métier : diagnostic IA en 10 secondes.*

**CTA** : `▶ Lancer le diagnostic`

Champs SUJET / RISQUE / HORIZON / STATUT : **inchangés** dans le cadre de ce sous-projet (refonte = sous-projet 2).

### 5.5 Section III — Compétences IA-proof (`HomeSkillsList.vue`)

**Aucune modification de copy.** Section déjà alignée sur la promesse positive du nouveau positionnement.

**Changement** : numéro romain seul (`IV` → `III`), modifié dans `index.vue` au niveau du `<HomeMasthead num="…">`. La section reste à la même position physique (juste après Diagnostic IA), et incarne le mouvement narratif PEUR → RECADRAGE.

### 5.6 Section IV — Rapports de Survie (`RapportsBookshelf.vue`)

**Titre** : *La veille hebdo pour passer de subir l'IA à la piloter.*

**Compteur conditionnel** ("0 rapports disponibles" à masquer) : **hors scope ici**, traité en sous-projet 3.

### 5.7 Section V — FAQ (`HomeFaq.vue`)

**H2** : *Questions fréquentes sur l'IA au travail.*
(Au lieu de « Questions fréquentes sur le remplacement par l'IA. ».)

**Réponses réécrites** :

**Q1 — Comment ne pas se faire remplacer par l'IA dans son métier ?** *(question inchangée pour le SEO)*
> Trois leviers concrets : (1) maîtriser ce que l'IA fait mal, la précision du langage, le contexte humain, le jugement ; (2) utiliser l'IA comme un copilote pour automatiser ce qui te ralentit ; (3) renforcer ton relationnel, ta stratégie et ton jugement éthique, c'est là que ta valeur devient irremplaçable. Bref : tu ne luttes pas contre l'IA, tu apprends à t'en servir mieux que les autres.

**Q4 — Comment survivre à l'IA au travail quand on n'a pas de compétences techniques ?** *(question inchangée)*
> En devenant indispensable sur ce que l'IA ne fait pas : décider en contexte ambigu, motiver une équipe, négocier, comprendre ce que veut vraiment un client. La technique se rattrape, la posture humaine non. Survivant-IA t'aide à structurer cette posture, à intégrer l'IA dans ton workflow, et à devenir le salarié qui sait.

**Q6 — Mon métier va-t-il vraiment être remplacé par l'IA ?** *(question inchangée)*
> Probablement pas en entier. Mais certaines tâches le seront, et certaines deviendront au contraire beaucoup plus précieuses (celles où tu pilotes l'IA au lieu de la subir). Lance le diagnostic Survivant-IA : il croise les rapports 2026 (Tufts, McKinsey, WEF) pour estimer l'impact de l'IA sur ton métier en 10 secondes.

**Q7 — Combien de temps me reste-t-il avant que l'IA remplace mon métier ?** *(question inchangée)*
> Variable selon le métier : 2-3 ans pour les tâches répétitives et déjà numérisées (saisie, traduction basique, rédaction standard) ; 5-10 ans pour les tâches d'analyse et de coordination ; quasi jamais pour les tâches qui combinent jugement humain, relation et contexte. Le diagnostic te donne une estimation par métier. Plus tu prends le virage tôt, plus tu deviens celui qui pilote l'IA dans ton équipe, au lieu de la subir.

**Q8 — C'est quoi la Fréquence Survivant-IA ?** *(question inchangée)*
> Une newsletter hebdomadaire gratuite : un nouvel article par semaine, 5 minutes de lecture, sans jargon. Concret, terrain, pas de théorie. Et bientôt : des formations approfondies pour ceux qui veulent aller plus loin.

**Q2, Q3, Q5** : **inchangées**. Déjà alignées sur le pivot transformatif (compétences à développer / se former sans tech / prendre le virage).

### 5.8 NewsletterForm bas de page (`NewsletterForm.vue`)

**Suptitre** : `La Fréquence` (inchangé)
**H2** : *Reste un cran devant. Un nouvel article chaque semaine.*
**Sous-titre** :
> Cinq minutes de lecture, sans hype, sans funnel, sans sponsor. Que des outils et signaux que j'utilise vraiment. Formations approfondies pour ceux qui veulent aller plus loin (bientôt).

**CTA** : `Rejoindre →` (inchangé)
**Mention RGPD** : inchangée

### 5.9 Footer (`AppFooter.vue`)

**Baseline** :
```
L'IA ARRIVE. APPRENDS À LA PILOTER.
```

**Mentions de pied** : inchangées (`© 2026 · TRANSMISSION CHIFFRÉE · /rss.xml disponible`).

### 5.10 Page Identité (`pages/identite.vue`)

#### Métadonnées

| Champ | Avant | Après |
|---|---|---|
| `title` | `Mathieu Rérat : Qui est derrière Survivant-IA` | `Mathieu Rerat : Qui pilote Survivant-IA` |
| `description` | `De PwC à Deputy Head of IT, en passant par Nestlé et la PropTech. Le parcours de Mathieu Rérat et l'esprit anti-obsolescence derrière Survivant-IA.` | `De PwC à Deputy Head of IT, en passant par Nestlé et l'immobilier. Le parcours de Mathieu Rerat et l'esprit derrière Survivant-IA : aider les salariés à piloter l'IA dans leur métier.` |
| `ogTitle` | `Mathieu Rérat - Identité du Survivant-IA` | `Mathieu Rerat : Identité du Survivant-IA` |
| `ogDescription` | `Le parcours et l'esprit derrière Survivant-IA. Concret, sans théorie.` | inchangé |
| `twitterTitle` | idem ogTitle | idem ogTitle |
| `twitterDescription` | `Le parcours derrière Survivant-IA - anti-obsolescence pour les pros.` | `Le parcours derrière Survivant-IA : piloter l'IA dans son métier.` |

#### Bandeau identité (en-tête de page)

**Titre** : `Mathieu` + accent : *le Survivant de l'IA* (inchangé)

**Sous-titre mono** :
- Avant : `DEPUTY HEAD OF IT · SURVIVANT EN COURS`
- Après : `DEPUTY HEAD OF IT · HEC LAUSANNE · 9 ANS EN TRANSFORMATION DIGITALE`

#### Réorganisation du flux

**Ordre actuel** :
1. Bandeau identité
2. Texte narratif (4 paragraphes)
3. Bloc MISSION
4. Paragraphe persona ("Je ne suis pas l'expert IA ultime…")
5. Section PARCOURS (4 cartes)
6. CTA Rejoindre

**Ordre proposé** :
1. Bandeau identité
2. **Section PARCOURS remontée** (4 cartes)
3. Texte narratif (3 paragraphes : autorité → lucidité IA → raison du site)
4. Bloc MISSION
5. Paragraphe persona (clôture)
6. CTA Rejoindre

#### Premier paragraphe narratif (réécrit pour autorité)

**Avant** :
> Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information (HEC Lausanne), puis PwC en audit IT, Nestlé comme Business Analyst, immopac où je suis passé de consultant à Head of Office Romandie, et aujourd'hui Deputy Head of IT chez Solutions & Funds. Des environnements différents, un fil rouge : être l'interface entre les gens, les process, et les outils.

**Après** :
> Master en systèmes d'information à HEC Lausanne. PwC en audit IT, puis Nestlé comme Business Analyst. 9 ans chez Immopac à piloter la transformation digitale d'un secteur traditionnel, l'immobilier, en passant de consultant à Head of Office Romandie. Aujourd'hui Deputy Head of IT chez Solutions & Funds. J'ai vu de l'intérieur ce qui marche et ce qui plante dans les rollouts d'outils, dans des organisations qui n'ont rien de tech.

#### Deuxième et troisième paragraphes (lucidité IA + raison du site)

Conservés tels quels, em-dashes remplacés :
> Quand l'IA s'est invitée dans mon quotidien, j'ai plongé. Claude, ChatGPT, automatisations, code... Je lis les articles, j'écoute les podcasts, je teste. Pendant un moment, j'ai cru que plus j'en utilisais, mieux je travaillais.

> Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite, beaucoup, mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a pas rendu anti-IA. Il m'a rendu **lucide**.

> Ce site existe pour les salariés qui voient l'IA arriver sans savoir comment se positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais aimé avoir et éviter les erreurs que j'ai faites.

(Modif notable : « professionnels » → « salariés » pour resserrer la cible cohérente avec le brief.)

#### Bloc MISSION

**Avant** :
> Aider les gens à se préparer *avant* que l'IA ne prenne leur job, pas à pleurer *après*.

**Après** :
> Aider les salariés à piloter l'IA dans leur métier *avant* de la subir.

#### Paragraphe persona de clôture

> Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous, avec quelques cartes en main, et les cicatrices pour prouver que j'y suis déjà passé.

(Em-dash remplacé par virgule.)

#### Schema JSON-LD

Mettre à jour `description` du `Person` :
- Avant : `Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les professionnels à se former à l'IA pour ne pas se faire remplacer.`
- Après : `Fondateur de Survivant-IA. Ex-PwC, Nestlé, Immopac. Aide les salariés à piloter l'IA dans leur métier.`

## 6. Conventions et règles éditoriales

À appliquer partout dans les fichiers modifiés :

1. **Em-dashes `—` interdits** (tic d'IA). Remplacer par :
   - `:` quand introduit une définition ("La Fréquence : un nouvel article…")
   - `,` quand marque une incise ("Tu as raison, et c'est…")
2. **`méthode`** : interdit dans toute copie de ce sous-projet
3. **`chevaucher`, `chevaucher la vague`** : interdits
4. **`mardi`** : interdit (jour de publication jamais mentionné)
5. **Verbes d'action prioritaires** : `piloter`, `maîtriser`, `s'en servir`, `prendre le virage`
6. **Cible explicitée** : préférer `salarié(s)` à `professionnel(s)` ou `gens` quand le contexte le permet
7. **Tutoiement** : maintenu partout (déjà la convention)

## 7. Hors scope (rappel)

Traités en sous-projets séparés, brainstormés indépendamment :

**Sous-projet 2 — Scanner v2** :
- Algorithme du score `potential` (0-100) à ajouter aux 30+ jobs
- Matrice 4 statuts gradués combinant `risk × potential`
- Refonte écran de résultat (constat → plan d'action 3 étapes : apaiser, valeur gratuite, rampe newsletter/formations)
- Articles à linker depuis l'écran de résultat (dépend de la production de Rapports)

**Sous-projet 3 — Hygiène** :
- Conditional rendering des compteurs Rapports (masquer si vide)

## 8. Ce qui ne change pas

- Identité visuelle complète (typographie, couleurs, mise en page)
- Univers sémantique de marque : Fréquence, Scanner, Rapports de Survie, Volumes, transmission chiffrée, RSS
- Numérotation romaine des sections (renumérotée selon le nouvel ordre : II, III, IV, V)
- Tutoiement partout
- Mécanique du scanner (ajout du 2e score = sous-projet 2)
- 4 sous-sections "Compétences IA-proof"
- Newsletter format hebdo (le jour disparaît, le rythme reste)
- Schema FAQPage JSON-LD (regénéré automatiquement à partir du nouveau contenu)

## 9. Critères de validation

Le sous-projet 1 sera considéré comme livré quand :

- [ ] Le mot `méthode` n'apparaît plus dans aucun fichier modifié
- [ ] Le mot `chevaucher` n'apparaît plus dans aucun fichier modifié
- [ ] Le mot `mardi` n'apparaît plus dans aucun fichier modifié
- [ ] Aucun em-dash `—` dans les copies modifiées
- [ ] L'ordre de la home suit Hero → Bandeau trajectoire → Manifeste → Diagnostic IA → IA-proof → Rapports → FAQ → Newsletter
- [ ] Les `<HomeMasthead>` portent les numéros II, III, IV, V (sans saut)
- [ ] Le composant `HomeMastheadTrajectoire.vue` est créé et inséré
- [ ] Le H1 du hero est exactement `SURVIVRE À L'IA AU TRAVAIL, C'EST APPRENDRE À LA PILOTER`
- [ ] Le footer baseline est exactement `L'IA ARRIVE. APPRENDS À LA PILOTER.`
- [ ] La section PARCOURS de la page Identité est positionnée avant le texte narratif
- [ ] La signature manifeste mentionne `Deputy Head of IT`
- [ ] Aucune régression visuelle (screenshots avant/après cohérents sur le DA Editorial Dark sage)
