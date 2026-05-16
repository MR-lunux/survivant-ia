---
name: survivant-tiktok
description: Use when the user wants to write a TikTok script in the Survivant-IA voice — derive a hook + body + CTA + shot-by-shot from a source asset (article, LinkedIn carousel) or a stated thesis. Produces 5 hook variants tagged by framework + a recommendation. Does not generate trends research (see tiktok-trends sub-agent) and does not produce other channel formats (LinkedIn post, IG carousel, newsletter).
---

# Survivant-TikTok

## When to use

- L'utilisateur demande "script tiktok", "hook tiktok", "réécrire en tiktok", "tiktok depuis [chemin]"
- L'utilisateur veut décliner un asset existant (article `content/`, carousel `docs/linkedin/`) en vidéo courte
- L'utilisateur veut des variantes de hook sur une thèse donnée

## When NOT to use

- Production vidéo Remotion / FaceCam (workflow séparé, voir `video/`)
- Autres canaux (LinkedIn post, Instagram carousel, newsletter) — pas dans ce skill
- Veille sur les trends TikTok (formats viraux, sons) — voir sub-agent `tiktok-trends`
- Recherche / scraping de sons ou formats du moment — le skill ne va pas chercher sur le web

## Voix Survivant-IA en parlé

### Invariants — jamais négociables

- **Persona Mathieu le Survivant** (référence Ken le Survivant), pas seulement Mathieu Rerat. **Par défaut : persona implicite** (la voix-signature suffit, pas besoin de nommer Mathieu textuellement à chaque vidéo). **Textuel obligatoire** seulement si : vidéo de présentation / premier contact avec une nouvelle audience / la thèse repose sur le parcours de Mathieu (cas où "le Survivant" est l'argument).
- **Pas d'invention factuelle** sur durées, lieux, chiffres, parcours bio — doit être sourcé (page identité / mémoire) ou neutre
- **Cluster 2 action** pour le fond et le CTA : "apprendre à survivre", "prendre le virage", "ne pas se faire remplacer". Jamais cluster peur seul.
- **Pas de "méthode"** comme mot — "formation" autorisé comme produit futur
- **Casse minuscule** sur concepts coinés : "simple valideur", pas "Simple Valideur"
- **Pas d'emoji** dans caption TikTok ni dans le texte à l'écran
- **Domaine** : `survivant-ia.ch` uniquement, jamais .com / .fr / autre

### Adaptations parlé/vidéo

- **Full negation** : règle par défaut "je ne suis pas" sur hooks, phrases-clés, punch lines (signature voix). Dérogation tolérée vers "je suis pas" uniquement dans le fil de l'oral rapide si la version full sonne forcée — le skill doit l'expliciter ligne par ligne quand il déroge.
- **Texte à l'écran TikTok** : CAPS autorisé pour un **mot seul d'impact** (ex: « VALIDER »). Phrase entière = casse normale. Jamais de styling LinkedIn-influenceur (gras tous les 3 mots, etc.).
- **V2 Editorial Dark** : reste visuelle dans le site et le carousel. En vidéo, on garde la **patte ton** (sobriété, autorité posée, anti-hype) mais on n'impose pas la palette menthe `#6CE3B5` dans la vidéo elle-même.
- **Rythme parlé** : phrases courtes, coupes nettes, pas la prosodie d'article. Voix Survivant-IA parlée = dérivée de l'écrite, pas identique.

## Frameworks de hook (8)

### 1. contrarian
Renverse l'idée reçue. L'audience attend X, tu sors le contraire.
Ex : « ton métier de comptable ne va pas disparaître. ce qui va disparaître, c'est ta journée. »

### 2. stakes
Conséquence chiffrée + délai court. Pas de menace vague, un horizon.
Ex : « si en 2026 tu saisis encore des écritures à la main, t'as 18 mois. »

### 3. call-out direct
Nomme l'audience cible à T=0. Le viewer non concerné scroll, le ciblé reste.
Ex : « comptables. vous n'allez plus saisir d'écritures. vous allez les valider. »

### 4. faux-consensus brisé
« Tout le monde te dit X. c'est faux. » Promet la révélation.
Ex : « tout le monde te dit que l'IA va remplacer les comptables. c'est faux. mais c'est pire que ça. »

### 5. curiosity gap
La phrase qui appelle la suivante sans donner la réponse.
Ex : « il y a un seul truc qui sépare un comptable qui survit à 2027 d'un comptable qui disparaît. »

### 6. pattern interrupt visuel
Hook hybride visuel + texte. Plan source (écran, objet) → coupe nette → plan visage parlant. La phrase parlée commence **après** la coupe, sur le plan visage.
Ex (description visuelle) : 1s sur écran de saisie comptable, coupe sèche, plan visage. **Hook texte** : « regarde bien cet écran. tu le verras plus jamais. »

### 7. listicle
Nombre + délai + cible. Promet une structure dénombrable.
Ex : « 5 métiers qui n'existeront plus en 2027. le tien y est, sans le savoir. »

### 8. dialogue-en-tête
Démarrer en plein milieu d'une phrase, comme une suite. Casse le 4ème mur.
Ex : « …et c'est ce moment-là que je me suis dit : alors c'est ça, être comptable en 2026. »

## Process

a. Lire l'asset source si fourni (chemin fichier) ; sinon demander la thèse à l'utilisateur
b. Extraire la **phrase-cliff** (l'asset central qu'on garde mot pour mot)
c. Générer **5 hooks** taggés framework. Sélection guidée :
   - thèse contrarian / inversion d'idée reçue → privilégier *contrarian* + *faux-consensus brisé*
   - thèse temporellement urgente (échéance) → privilégier *stakes*
   - thèse "ce métier va changer" / call-out d'audience → privilégier *call-out direct* + *listicle*
   - thèse complexe demandant suspense → privilégier *curiosity gap* + *dialogue-en-tête*
   - thèse visuellement démontrable (objet, écran) → inclure *pattern interrupt visuel*
   - Avant de rédiger les 5 hooks, **fixer la durée cible globale** (25-45s par vidéo, sweet spot 30-35s). Le corps de chaque hook doit tenir dans cette enveloppe une fois additionné au hook lui-même et au CTA.
   
   Justifier le choix en 1 ligne en tête de section ("frameworks retenus : … parce que …").
d. Pour chaque hook : **corps 20-30s** (3-5 phrases), **punch** (phrase de fin), **CTA** (cluster action + domaine)
e. **Découpage shot-by-shot** : plan (cadre visage / cadre objet / écran), mouvement, texte à l'écran, durée approximative
f. **Auto-check voix** (voir `## Auto-check voix` ci-dessous) : pour chaque ligne, valider les 8 bloquants — **réécrire si l'un casse**. Pour la règle soft (full negation), tolérer la dérogation et la noter dans `Voice check`.
g. **Recommander un seul hook** avec 2-3 lignes de justif (voix + retention probable). Pas de top-2, pas d'ex æquo, pas de "ça dépend de ton intention".

## Output template

````markdown
## Durée cible
[total visé : 25-45s par vidéo finale, sweet spot retention. hook 2-5s + corps 18-30s + CTA 3-5s. dépasser 45s seulement si la thèse l'exige absolument.]

## Thèse + phrase-cliff

**Thèse :** [une phrase, le fond]
**Phrase-cliff :** [la formulation à garder mot pour mot]
**Frameworks retenus :** [5 noms parmi les 8] — parce que [1 ligne de justif]

---

## Hook 1 — [framework]

**Hook :** [1-2 phrases, < 3 secondes parlées]
**Corps (20-30s) :** [3-5 phrases]
**Punch :** [phrase de fin]
**CTA :** [cluster action — priorité "La Fréquence" (newsletter, conversion #1) ; survivant-ia.ch si la thèse appelle le scanner ou un article spécifique]
**Caption (sous la vidéo) :** [1-2 phrases max, restate phrase-cliff ou variation, soft CTA, pas plus de 3 hashtags, pas d'emoji. ex : "le métier ne meurt pas, la tâche si. #comptabilité #ia"]
**Shot-by-shot :** *(4-7 plans pour une vidéo 25-45s, coupes toutes les 4-7s pour tenir l'attention)*
- 0:00–0:0X — [plan, mouvement, texte à l'écran]
- 0:0X–0:1X — …
- …
**Voice check :** [full negation OK / dérogation ligne X : raison / no emoji OK / casse OK / pas d'invention OK]

---

## Hook 2 — [framework]
…

## Hook 3 — [framework]
…

## Hook 4 — [framework]
…

## Hook 5 — [framework]
…

---

## Reco (un seul hook)

*Un seul hook recommandé. Pas de top-2.*

Hook **N** ([framework]) est le plus aligné — voix + retention probable — parce que [2-3 lignes].
````

## Auto-check voix

Pour chaque hook généré, vérifier ligne par ligne. Deux niveaux :

### Bloquants — réécrire jusqu'à conformité

1. **Pas d'emoji** — ni dans le script parlé, ni dans la caption suggérée, ni dans le texte à l'écran.
2. **Casse minuscule sur concepts coinés** — "simple valideur", pas "Simple Valideur". CAPS autorisé uniquement pour un mot seul d'impact à l'écran (ex: « VALIDER »).
3. **Pas de "méthode"** — utiliser "formation" si besoin de désigner un produit futur.
4. **Pas d'invention factuelle** — durées, lieux, chiffres, bio Mathieu : sourcés ou neutres. En cas de doute, neutraliser.
5. **Caption** — 1-2 phrases max, pas d'emoji dans la caption, ≤ 3 hashtags, hashtags en minuscules. Différent du texte à l'écran (qui reste plein cadre, court, signal visuel).
6. **Domaine** — `survivant-ia.ch`, jamais .com/.fr.
7. **Cluster 2 action** — CTA dans le champ lexical "apprendre à survivre / prendre le virage / ne pas se faire remplacer". Pas cluster peur seul.
8. **Persona** — par défaut implicite (voix-signature). Si Mathieu est nommé textuellement, c'est "Mathieu le Survivant", jamais "Mathieu Rerat" seul. Si la vidéo demande explicitement une présentation (nouvelle audience / parcours-argument), persona textuel obligatoire.

Si un bloquant casse, **réécrire la ligne**. Ne pas flagger et ship.

### Soft — dérogation tolérée avec raison

9. **Full negation** — "je ne suis pas" par défaut. Dérogation "je suis pas" tolérée uniquement si la version full sonne forcée à l'oral rapide. Si dérogation : l'écrire dans `Voice check` avec la raison ligne par ligne.
