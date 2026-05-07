# Charte éditoriale articles Survivant-IA — design

**Date** : 2026-05-07
**Statut** : à valider
**Scope** : workflow de production d'articles + voice-fingerprint Mathieu + premier article test publiable + retrait du bienvenue pré-pivot

---

## 1. Intention

Mettre en place le système de production éditoriale qui rend tenable la promesse home « un nouvel article chaque semaine » et qui protège la voix singulière de Mathieu contre la dérive vers le générique-IA, dans un mode où Claude rédige depuis des notes brutes (mode C ghostwriter). Sans cette charte, chaque session de rédaction repart de zéro et la voix se dilue.

À l'issue de la session, le site doit avoir : (a) une référence éditoriale durable, (b) un premier article publiable aligné sur le pivot 2026-05-04, (c) la suppression de l'article bienvenue qui contredit le H1 du hero par sa copy pré-pivot.

## 2. Trois livrables

| # | Livrable | Localisation | Statut |
|---|---|---|---|
| 1 | **Ce spec** — la charte de référence | `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` | en cours d'écriture |
| 2 | **Voice-fingerprint Mathieu** — extrait des 15 articles LinkedIn, note évolutive enrichie article après article | `docs/voice-fingerprint.md` (à créer) | à faire après validation du spec, prérequis = export ou dump des 15 articles LinkedIn par Mathieu |
| 3 | **Premier article publiable** : « Démence numérique : ne deviens pas un simple valideur » | `content/rapports/2026-05-07-demence-numerique-simple-valideur.md` | draft validé en itération 1, contenu final en §13 |

Le retrait du bienvenue pré-pivot accompagne le livrable 3 (voir §12).

## 3. Workflow brief inversé (mode C nominal)

Six étapes, conçues pour qu'un draft mal calé soit recadré **avant** rédaction et non après.

1. **Mathieu** envoie ses notes brutes — bullets, transcription voix, paragraphe en vrac, peu importe le format. Le seul prérequis est l'**ancrage personnel** (ce qu'il a vécu, lu, testé, ressenti).
2. **Claude** répond en un seul message qui propose : titre tentatif (≤ 60 caractères), **angle de différenciation** (ce qui rend cet article impossible à écrire pour un autre auteur), cluster SEO visé (existant ou nouveau, voir §9), format (court ou pilier, voir §5), archétype (voir §6). Optionnellement : sources à mobiliser, lien interne pertinent.
3. **Mathieu** valide ou corrige en 1–2 lignes (« angle OK mais pivote sur X », « cluster faux, vise Y »). C'est la décision rapide qui protège la cadence.
4. **Claude** rédige l'article complet (frontmatter + corps + meta SEO + sources si applicables), passe le self-review interne sur les 4 dimensions (§7), livre.
5. **Mathieu** review : « OK to publish » ou demandes de correction précises (citations de phrases qui clochent, faits à corriger, structure à ajuster).
6. **Boucle 4–5** si corrections — **cap 2 itérations max** (voir §10).

Le brief inversé est l'antidote à la production qui « part dans tous les sens » : si l'angle est plat à l'étape 2, on ne drafte pas — on recale.

## 4. Mode dégradé / mode A live

La réalité d'usage débordera du mode C nominal. Deux variations à anticiper :

- **Mode A live** : Mathieu envoie un draft quasi-fini au lieu de notes. Claude bascule en relecteur exigeant et applique les 4 dimensions (§7) en review, signale manquements, propose édits chirurgicaux. Pas de réécriture from scratch sans demande explicite.
- **Mode B (premier jet brut)** : draft long, désordonné, à resserrer ensemble. Claude propose une colonne vertébrale, Mathieu valide, Claude livre une v2 resserrée.

Pour les trois modes (A / B / C), les **4 dimensions de review (§7) restent identiques**. Seul le travail amont change : qui pose la matière, qui pose la structure, qui pose les phrases.

## 5. Format 80/20

| | Article court | Pilier |
|---|---|---|
| Part | ~80 % (hebdo) | ~20 % (~1 / mois) |
| Mots cible | 700–1 000 | 1 500–2 500 |
| Lecture | 4–5 min | 8–12 min |
| H2 max | 2 | libre |
| Tableaux / captures | non | possible |
| Kicker OG image | `RAPPORT DE SURVIE` | `LECTURE LONGUE · XX MIN` |
| Cluster SEO | rattachable au fil de l'eau | **ancré** sur un cluster prioritaire |
| Liens internes entrants | depuis articles courts connexes au fil du temps | systématique : 2–3 articles courts qui pointent vers le pilier |
| Sources externes | optionnelles | recommandées |

La promesse home « 5 minutes de lecture » est une promesse sur le **format dominant**. Les piliers sont signalés explicitement par le kicker `LECTURE LONGUE · XX MIN`, ce qui préserve la promesse sur les courts.

## 6. Archétypes

Trois canevas, dont un dominant.

### 6.1 REX terrain (archétype A)
Anecdote ou contexte précis (qui, quand, où, ce qui a été tenté) → le moment qui a marqué (déclic, échec, surprise) → leçon généralisable (ce que ce moment révèle au-delà du cas) → tactique copiable (ce que le lecteur fait demain matin).

Voix = première personne assumée, terrain. La force est dans la spécificité du vécu.

### 6.2 Tactique (archétype C)
Problème salarié réel → galère sans la bonne méthode → pas-à-pas concret avec exemples → garde-fous (« attention à »).

Voix = formateur pragmatique, ton direct, précision.

### 6.3 Hybride A+C — **canevas dominant recommandé**
REX qui débouche sur un tactique. Le pattern naturel Survivant : « j'ai marché dedans, j'en suis sorti, voilà la carte ».

Structure type : hook anecdote (2 phrases) → contexte du problème → mécanisme nommé (souvent avec source externe brève) → image marquante / concept coined → tactique en 3 étapes copiables → close pilotage / lien interne identité.

Les archétypes B (lecture commentée) et D (essai positionnement) du brief initial sont **hors scope par défaut**. Ils peuvent être réintégrés plus tard si la production prouve qu'on a la matière et le besoin.

## 7. Les 4 dimensions de review non-négociables

Self-check Claude avant livraison **systématique**. Si une dimension est en échec, le draft n'est pas livré : retour à l'étape 2 (recadrage) ou édit chirurgical avant remise.

### 7.1 Dimension 1 — Voix Mathieu authentique

**Test interne** : « Si je remplace "Mathieu" par n'importe quel autre auteur, la phrase tient-elle encore ? » Si oui, c'est trop générique.

**Sources de vérité de la voix** :
- `docs/voice-fingerprint.md` (livrable 2, à construire — autorité primaire une fois disponible)
- Page `app/pages/identite.vue` — la voix Mathieu telle qu'elle est figée par le pivot 2026-05-04
- Mémoire DA (`~/.claude/projects/-Users-mathieu-Documents-survivor/memory/`) : taboos, verbes prioritaires, négation pleine, tutoiement

**Anti-tells IA générique à bannir** (liste vivante, à enrichir) :
- Phrases trop équilibrées, symétries syntaxiques parfaites (« nous augmenter / nous réduire », « machine s'arrête / valeur s'arrête »)
- Conclusions qui « notent ce point important » ou résument
- Tics ChatGPT français : « il est vital de », « la science nous montre que », « la science tire la sonnette d'alarme », « découvre comment », « il convient de »
- Vouvoiement ou « nous » collectif rhétorique au lieu du « je » Mathieu ancré
- **Capitales façon influenceur LinkedIn** sur des concepts coined : Mathieu privilégie les minuscules. Écrire « simple valideur », pas « Simple Valideur ».
- **Invention factuelle sur Mathieu** : durée, lieu, rôle, contexte chiffré non sourcé. Toute donnée biographique doit être vérifiable (page identité, mémoire DA) ou à défaut formulée en neutre. Règle : **pas d'invention, jamais**.
- Listes de 3 aphorismes vagues là où l'archétype A+C demande une tactique pas-à-pas concrète
- Artefacts ChatGPT/Claude laissés en clair (« Tu as 100 % raison », blocs meta-conversation) — à détecter et retirer obligatoirement

### 7.2 Dimension 2 — Différenciation

**Test interne** : « ChatGPT pourrait-il écrire ça à un autre auteur sans rien changer ? » Si oui, l'angle est plat. On ne drafte pas, on retourne à l'étape 2 du workflow.

**Mécanisme dans le workflow** : la différenciation est verrouillée à **l'étape 2** (Claude propose l'angle). Si l'angle proposé est interchangeable, Mathieu doit le sentir et le corriger avant rédaction.

**Crochet de différenciation par défaut** : ancrage dans le vécu Mathieu (rôle DHIT, parcours PwC/Nestlé/Immopac, expérience d'avoir « perdu la notion de l'effort »), ou dans une lecture analytique singulière d'un signal externe.

### 7.3 Dimension 7 — Hook → tension → résolution

**Test interne** : « Si je coupe l'article à 30 %, le lecteur a-t-il déjà la valeur ? » Si non, le hook est faible.

**Règles** :
- Hook ≤ 2 phrases. Du concret (situation, geste, citation), pas une mise en bouche philosophique.
- Tension explicite : pourquoi le lecteur a un problème ou une question maintenant.
- Résolution actionnable : tactique pas-à-pas ou cadre de pensée que le lecteur applique demain matin. Pas 3 aphorismes.

### 7.4 Dimension 9 — SEO de surface

**Checklist** :
- Title ≤ 60 caractères (cap Google)
- Description ~150 caractères
- H1 = `title` du frontmatter (auto-généré)
- H2 lisibles, hiérarchie propre
- Cluster SEO ancré : cluster 2 (action) par défaut, ou nouveau cluster ajouté à `seo-clusters-map.md` (voir §9)
- Slug propre, lisible, ≤ 80 caractères, en kebab-case
- ≥ 1 lien interne pertinent (article connexe, page identité si on parle de Mathieu, scanner uniquement si le sujet est le diagnostic d'un métier)

**Anti-pattern SEO** : ne **pas** linker vers le scanner depuis un article qui ne porte pas sur le diagnostic métier. Promesse fausse côté lecteur.

## 8. Prérequis durs (filtre passif, rappel mémoire)

Renvoi à `~/.claude/projects/-Users-mathieu-Documents-survivor/memory/`. Ces règles ne sont pas négociables, elles ne font pas partie du review actif — elles sont appliquées passivement par Claude lors de la rédaction.

- **Taboos absolus** : `méthode`, `chevaucher`, `mardi`, em-dashes `—` (remplacer par `:` ou `,` selon contexte)
- **Verbes prioritaires** : `piloter`, `maîtriser`, `s'en servir`, `prendre le virage`
- **Tutoiement** partout — jamais de vouvoiement
- **Cible** : salarié non-tech en poste — éviter `professionnels`, `gens`, `dirigeants`
- **Domaine** : `survivant-ia.ch` (jamais `.com` / `.fr`)
- **Newsletter** = `La Fréquence` (gratuite). **Pas** « formation » comme nom commun (mémoire business model)
- **Négation pleine** : « je ne suis pas », jamais « je suis pas »
- **Mathieu** = « le Survivant de l'IA » (référence Ken le Survivant), pas seulement « Mathieu Rerat »
- **Kicker** : carré vert qui spin (glow), jamais préfixe `//`
- **Nom** : `Mathieu Rerat` (sans accent — forme canonique post-pivot, validée par les meta de `app/pages/identite.vue` et le JSON-LD `Person`)

## 9. Cluster SEO map (fait au fil de l'eau)

État actuel — un seul cluster documenté en mémoire :

- **Cluster 2 — Action (colonne vertébrale)** : « comment ne pas se faire remplacer », « se former à l'IA », « prendre le virage »

Nouveau cluster ouvert par le premier article test :

- **Cluster Autonomie cognitive** : « offloading cognitif », « démence numérique IA », « atrophie cognitive IA », « pilotage cognitif face à l'IA », « simple valideur IA »

**Mécanisme de croissance** : à chaque article qui ouvre un nouveau territoire, mettre à jour `docs/seo-clusters-map.md` (à créer au moment de la mise en place du workflow) avec le nom du cluster + 3 à 5 requêtes types + lien vers les articles qui le servent. Le map devient un outil de décision pour l'étape 2 du workflow brief inversé.

## 10. Cap d'itération

**2 itérations maximum** sur la boucle review/correction (étapes 4 et 5 du workflow). Au-delà, signal que l'angle ou le cluster du brief inversé étaient mal calés à l'étape 2 — on **ne** boucle pas indéfiniment sur le draft, on retourne à l'étape 2 pour recadrer.

Cette discipline protège la cadence hebdo. Un article qui prend 4 itérations est un article dont le cadrage initial était faux : autant repartir propre.

## 11. Premier article test — métadonnées

| Champ | Valeur |
|---|---|
| Titre | `Démence numérique : ne deviens pas un simple valideur` |
| Slug | `2026-05-07-demence-numerique-simple-valideur` |
| Catégorie | `comprendre-ia` par défaut, à valider à l'implémentation. Création d'une catégorie `pilotage-cognitif` envisageable si l'autonomie cognitive devient un cluster récurrent (impacterait `RapportsBookshelf.vue` et `categoryLabels`, voir §16). |
| Format | court (~730 mots) |
| Archétype | A+C hybride (REX terrain → tactique) |
| Cluster SEO | Autonomie cognitive (nouveau, voir §9) |
| Sources externes | Risko & Gilbert 2016, Spitzer 2012 (avec mention de la controverse) |
| Lien interne | `/identite` |
| Kicker OG | `RAPPORT DE SURVIE` (par défaut courts) |

Le contenu Markdown final validé est en **annexe §13**.

## 12. Sortie du bienvenue actuel

`content/rapports/2026-04-25-bienvenue-survivant.md` est en pré-pivot : vouvoiement, registre peur (« l'IA ne doit pas vous faire peur »), pas de mention « piloter ». Décision validée : **retrait pur** par `git rm` lors de l'implémentation. L'article « démence numérique » prend sa place en tant que premier article aligné pivot.

Conséquence : la home affichera 1 article (et non 0), les compteurs masqués (mémoire `2026-05-05`) restent masqués tant qu'on n'atteint pas le seuil de réactivation (3 sections, ou X éditions par catégorie).

## 13. Voice-fingerprint LinkedIn (livrable 2)

À produire **après** validation du spec et **après** que Mathieu ait fourni un export ou un dump de ses 15 articles LinkedIn (lien profil, copier-coller dans un dossier, export `.zip` LinkedIn natif).

**Méthode** : extraction par lecture comparative des 15 articles, en notant :
- Longueur moyenne des phrases et écart-type
- Structures rhétoriques récurrentes (anaphore, fragment, répétition contrôlée)
- Tics positifs (mots / formules qui reviennent et qui sont caractéristiques)
- Transitions favorites
- Registre émotionnel par défaut (lucide, sec, autodérision, pédagogue)
- Rapport au « je » et au « tu »
- Ouvertures et clôtures types
- Anti-tells personnels (formules à éviter parce qu'elles ne lui ressemblent pas)

**Format de sortie** : `docs/voice-fingerprint.md` — note évolutive enrichie à chaque article publié quand un trait nouveau est observé ou confirmé.

**Statut** : prérequis non bloquant pour publier le premier article (le draft a été produit en proxy sur la voix de la page identité), mais bloquant pour la production durable mode C nominal.

## 14. Apprentissages capturés du premier article (à graver dans le spec)

Le premier article a stress-testé la charte. Trois apprentissages ont émergé et sont déjà intégrés ci-dessus :

1. **Casse minuscule sur les concepts coined** — Mathieu privilégie « simple valideur » contre « Simple Valideur » façon LinkedIn-influenceur. Intégré §7.1.
2. **Pas d'invention factuelle** — Claude avait écrit « accords que je faisais depuis vingt ans » alors que la page identité documente 9 ans en transformation digitale. Règle gravée §7.1.
3. **Mode dual A/C dès le premier article** — Mathieu a envoyé un draft (mode A live) avant de basculer sur des notes brutes (mode C nominal). La charte doit explicitement couvrir les deux modes. Intégré §4.

## 15. Critères de validation du spec

- [ ] Le workflow brief inversé est rédigé en 6 étapes claires
- [ ] Les 4 dimensions de review (1, 2, 7, 9) sont détaillées avec test interne explicite
- [ ] Les anti-tells IA forment une liste vivante actionnable (pas une généralité)
- [ ] Le format 80/20 est tabulé et cible précise (mots, H2, kicker)
- [ ] L'archétype A+C dominant a un canevas concret applicable
- [ ] Le premier article est documenté avec métadonnées + contenu final en annexe
- [ ] La sortie du bienvenue est explicitée
- [ ] Le voice-fingerprint a une méthode d'extraction et un format de sortie
- [ ] Les apprentissages du premier article sont gravés (casse, invention factuelle, mode dual)
- [ ] La cap 2 itérations est explicite avec le mécanisme de retour à l'étape 2

## 16. Hors scope

À traiter en sessions ou sous-projets distincts.

- **Voice-fingerprint extraction** — exécution opérationnelle (livrable 2). Le spec décrit la méthode, l'extraction est faite plus tard.
- **Migration de catégories** — si on crée `pilotage-cognitif` pour le premier article, il faudra synchroniser `RapportsBookshelf.vue` et la map `categoryLabels`. Hors scope ici, à traiter en implémentation.
- **Réactivation des compteurs Rapports** — automatique quand le seuil est atteint (mémoire `2026-05-05`), pas d'action de spec.
- **Sous-projet 2 — Scanner v2** — toujours hors scope (mémoire pivot).
- **OG image personnalisée par article** — possible v2, hors scope ici (le kicker par défaut suffit).

## 17. Annexe — Contenu final validé du premier article

Itération 1 finale, validée par Mathieu (« yes c'est vraiment pas mal du tout »).

````markdown
---
title: "Démence numérique : ne deviens pas un simple valideur"
description: "À force de demander tout à l'IA, je perdais mes mots. Le mécanisme s'appelle l'offloading cognitif. La tactique pour reprendre le pilotage."
date: 2026-05-07
category: comprendre-ia
---

Je demandais tout à mon LLM. C'était devenu une blague entre collègues : « demande à Claude, il fait mieux que toi ». Jusqu'au jour où j'ai réalisé que mes mots disparaissaient vraiment.

Au travail, je passe mes journées à écrire : emails, specs de nouvelles fonctions, échanges avec nos prestataires IT, comptes-rendus à mon chef ou à la direction. C'est l'essentiel de mon poste de Deputy Head of IT. Et j'ai vu mon niveau de grammaire fondre. Je tâtonnais sur des accords basiques. Je cherchais le mot juste, je ne le trouvais plus, j'ouvrais Claude. L'IA rédigeait, je validais. Ce n'était pas du gain de temps. C'était une externalisation silencieuse de mon cerveau.

## Le piège a un nom : l'offloading cognitif

Edward Risko et Sam Gilbert l'ont décrit en 2016 dans *Trends in Cognitive Sciences* : le cerveau humain délègue systématiquement l'effort mental à n'importe quel outil externe disponible. Calculatrice, GPS, post-it sur l'écran, et maintenant LLM. Le résultat est mesurable. Moins d'activation neuronale dans les zones mobilisées par la tâche. Moins de mémorisation. Moins d'autonomie de raisonnement quand l'outil n'est plus là.

L'IA n'est qu'un outil de plus dans cette série. Sauf qu'elle est le premier qui peut sous-traiter ton langage entier : pas juste un calcul, pas juste une route, mais ta capacité à formuler une pensée.

Le neuroscientifique allemand Manfred Spitzer parle de **démence numérique**. Le terme est contesté, beaucoup de chercheurs le trouvent populiste. Le mécanisme qu'il décrit, lui, est moins discutable : ce qu'on n'utilise plus, on le perd. Le muscle aussi. Les mots aussi.

Et c'est exactement à ce moment que tu deviens un **simple valideur** : un salarié dont la seule compétence active est d'appuyer sur la touche Entrée. Tu ne penses plus, tu accuses réception. Si la machine s'arrête, ta valeur s'arrête avec elle. Ton patron commence à s'en apercevoir avant toi.

## Mon protocole anti-ramollissement

Depuis ce constat, j'applique une règle simple à chaque tâche d'écriture professionnelle. Trois étapes.

**1. Brouillon brut d'abord, IA après.**
Avant d'ouvrir Claude ou ChatGPT, j'écris ma première version moi-même. Mauvaise, courte, peu importe. Trois phrases qui posent l'idée. Pour un mail à un dirigeant, ça veut dire : « je veux dire X, je le justifie par Y, je propose Z ». C'est cet effort de mise en forme initiale qui maintient le muscle. L'IA passe ensuite, mais sur une base que j'ai posée seul.

**2. Une question, pas une délégation.**
Quand je sollicite l'IA, je lui demande une critique ou une variante de ma version, pas une rédaction *from scratch*. « Améliore le ton de ce mail. » « Donne-moi trois reformulations plus directes. » « Que manque-t-il dans cette synthèse ? » Je reste l'auteur, elle devient l'éditrice. La nuance est minuscule à dire, énorme à pratiquer : tu décides quoi, elle aide sur le comment.

**3. Une tâche par semaine sans IA, totale.**
Un mail sensible. Une note de synthèse. Un compte-rendu un peu engageant. Je choisis une tâche par semaine et je l'écris seul, avec mes hésitations, mes tournures un peu lourdes, mes redites. C'est inconfortable. La première fois, j'ai mis trois fois plus de temps que d'habitude. C'est exactement pour ça que je le fais : pour mesurer ce que j'avais déjà perdu.

Ce protocole tient en trois lignes. Le suivre exige une discipline réelle. Mais sans cette discipline, l'usage quotidien de l'IA produit la même atrophie qu'un membre dans un plâtre. Ce qu'on n'utilise plus, le corps le démantèle. Le cerveau ne fait pas exception.

## Piloter, c'est aussi savoir poser l'outil

Je ne dis pas qu'il faut renoncer à l'IA. Je m'en sers tous les jours, et je continuerai. Je dis qu'il faut la piloter au lieu de lui céder le pilotage. La différence est dans le réflexe : est-ce que tu commences par penser, ou est-ce que tu commences par demander ?

Maîtriser l'IA au travail, c'est aussi maîtriser le moment où on ne l'utilise pas. Sinon, tu finis simple valideur. Et un simple valideur, ça se remplace par un autre simple valideur, sauf que celui d'à côté coûte moins cher, ou ne coûte rien, parce que c'est un agent.

J'ai raconté [ailleurs comment j'ai perdu la notion de l'effort](/identite) en utilisant l'IA. Cet article est la suite pratique : la tactique pour la récupérer.

## Pour aller plus loin

- Risko, E. F., & Gilbert, S. J. (2016). *Cognitive Offloading*. Trends in Cognitive Sciences. — l'étude de référence sur la délégation systématique de l'effort mental aux outils externes.
- Spitzer, M. (2012). *Digitale Demenz*. — premier livre à théoriser le concept de démence numérique. Ouvrage controversé scientifiquement, mais utile pour situer le débat.
````
