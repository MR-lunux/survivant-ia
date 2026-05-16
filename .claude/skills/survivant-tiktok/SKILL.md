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

- **Persona Mathieu le Survivant** (référence Ken le Survivant), pas seulement Mathieu Rerat
- **Pas d'invention factuelle** sur durées, lieux, chiffres, parcours bio — doit être sourcé (page identité / mémoire) ou neutre
- **Cluster 2 action** pour le fond et le CTA : "apprendre à survivre", "prendre le virage", "ne pas se faire remplacer". Jamais cluster peur seul.
- **Pas de "méthode"** comme mot — "formation" autorisé comme produit futur
- **Casse minuscule** sur concepts coinés : "simple valideur", pas "Simple Valideur"
- **Pas d'emoji** dans caption TikTok ni dans le texte à l'écran
- **Domaine** : `survivant-ia.ch` uniquement, jamais .com / .fr / autre

### Adaptations parlé/vidéo

- **Full negation** : règle par défaut "je ne suis pas" sur hooks, phrases-clés, punch lines (signature voix). Dérogation tolérée vers "je suis pas" uniquement dans le fil de l'oral rapide si la version full sonne forcée — le skill doit l'expliciter ligne par ligne quand il déroge.
- **Texte à l'écran TikTok** : CAPS autorisé pour un **mot seul d'impact** (ex: « VALIDER »). Phrase entière = casse normale. Jamais de styling LinkedIn-influenceur (gras tous les 3 mots, etc.).
- **V2 Editorial Dark** : reste visuelle dans le site et le carousel. En vidéo, on garde la **patte ton** (sobriété, autorité posée, anti-hype) mais on n'impose pas la palette menthe `#6CE3B5` dans la vidéo elle-même. Le menthe revient en caption-CTA / overlay survivant-ia.ch en fin de vidéo (cohérence brand).
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
Pas un hook texte — un hook visuel. Plan source (écran, objet) → coupe nette → plan visage parlant.
Ex (description) : 1s sur écran de saisie comptable, coupe sèche, plan visage : « regarde bien cet écran. tu le verras plus jamais. »

### 7. listicle
Nombre + délai + cible. Promet une structure dénombrable.
Ex : « 5 métiers qui n'existeront plus en 2027. le tien y est, sans le savoir. »

### 8. dialogue-en-tête
Démarrer en plein milieu d'une phrase, comme une suite. Casse le 4ème mur.
Ex : « …et c'est ce moment-là que je me suis dit : alors c'est ça, être comptable en 2026. »

## Process

a. Lire l'asset source si fourni (chemin fichier) ; sinon demander la thèse à l'utilisateur
b. Extraire la **phrase-cliff** (l'asset central qu'on garde mot pour mot)
c. Générer **5 hooks** taggés framework. Le skill choisit les 5 frameworks les plus pertinents pour la thèse parmi les 8 disponibles, et justifie le choix en 1 ligne en tête de section ("frameworks retenus : … parce que …")
d. Pour chaque hook : **corps 20-30s** (3-5 phrases), **punch** (phrase de fin), **CTA** (cluster action + domaine)
e. **Découpage shot-by-shot** : plan (cadre visage / cadre objet / écran), mouvement, texte à l'écran, durée approximative
f. Auto-check voix : pour chaque ligne, valider full negation, pas d'emoji, pas de "méthode", pas d'invention factuelle. Lister les dérogations explicites. Voir `## Auto-check voix`.

## Output template

````markdown
## Thèse + phrase-cliff

**Thèse :** [une phrase, le fond]
**Phrase-cliff :** [la formulation à garder mot pour mot]
**Frameworks retenus :** [5 noms parmi les 8] — parce que [1 ligne de justif]

---

## Hook 1 — [framework]

**Hook :** [1-2 phrases, < 3 secondes parlées]
**Corps (20-30s) :** [3-5 phrases]
**Punch :** [phrase de fin]
**CTA :** [cluster action + survivant-ia.ch ou "La Fréquence"]
**Shot-by-shot :**
- 0:00–0:02 — [plan, mouvement, texte à l'écran]
- 0:02–0:08 — …
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

## Reco

Hook **N** ([framework]) est le plus aligné — voix + retention probable — parce que [2-3 lignes].
````

## Auto-check voix

Pour chaque hook généré, vérifier ligne par ligne :

1. **Full negation** — "je ne suis pas" par défaut. Dérogation "je suis pas" tolérée uniquement si la version full sonne forcée à l'oral rapide. Si dérogation : l'écrire dans `Voice check` avec la raison.
2. **Pas d'emoji** — ni dans le script parlé (logique), ni dans la caption suggérée, ni dans le texte à l'écran.
3. **Casse minuscule sur concepts coinés** — "simple valideur", pas "Simple Valideur". CAPS autorisé uniquement pour un mot seul d'impact à l'écran (ex: « VALIDER »).
4. **Pas de "méthode"** — utiliser "formation" si besoin de désigner un produit futur.
5. **Pas d'invention factuelle** — durées, lieux, chiffres, bio Mathieu : sourcés ou neutres. En cas de doute, neutraliser.
6. **Domaine** — `survivant-ia.ch`, jamais .com/.fr.
7. **Cluster 2 action** — CTA dans le champ lexical "apprendre à survivre / prendre le virage / ne pas se faire remplacer". Pas cluster peur seul.
8. **Persona** — "Mathieu le Survivant" si Mathieu est nommé.

Si un invariant casse et ne peut pas se corriger en gardant le sens, **flagger explicitement** dans le `Voice check` plutôt que de masquer.
