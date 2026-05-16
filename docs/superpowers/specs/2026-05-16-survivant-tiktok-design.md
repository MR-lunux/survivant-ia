# Survivant-TikTok — skill d'écriture + sub-agent de veille trends

**Date :** 2026-05-16
**Scope :** projet (`/Users/mathieu/Documents/survivor/.claude/`)
**Statut :** spec validée, prêt pour plan d'implémentation

## Contexte

Mathieu a besoin d'un assistant dédié pour produire des scripts TikTok à partir d'un asset source (article `.fr`, carousel LinkedIn, thèse en tête). Le besoin réel : décliner un même fond sur TikTok avec un hook qui retient au-delà de 2 secondes, **dans la voix Survivant-IA**, sans tomber dans le format TikTok-bro générique.

Le repo `coreyhaines31/marketingskills` (Agent Skills format) est techniquement compatible mais trop B2B SaaS / conversion pour usage direct. On pioche éventuellement quelques frameworks (`video`, `social`, `marketing-psychology`) comme références internes, mais on n'installe rien brut.

## Périmètre

Deux artefacts indépendants, non chaînés automatiquement :

1. **Skill `survivant-tiktok`** — écriture (hook + script + découpage)
2. **Sub-agent `tiktok-trends`** — veille (trends format/son/structure, dispatchable à la demande)

Hors-scope :
- Production vidéo / Remotion (le workflow FaceCam existe déjà)
- Autres canaux (LinkedIn, Instagram, newsletter) — viendront après si validation
- Génération de captions Instagram, hashtags multi-canal

## Stratégie de fond (décision validée)

**Principe directeur :** "same idea, different expression". On garde la thèse + la phrase-cliff de l'asset source, on **change la grammaire** pour TikTok. Pas de copier-coller du carousel ou de l'article tel quel.

**Hub & spoke :** article `.fr` = hub. Vidéo TikTok = spoke qui ramène vers hub (CTA → survivant-ia.ch ou newsletter "La Fréquence").

## Voix Survivant-IA en parlé (codifiée dans le skill)

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

## Skill `survivant-tiktok`

**Chemin :** `.claude/skills/survivant-tiktok/SKILL.md`

### Trigger (frontmatter `description`)

Invoqué quand l'utilisateur :
- demande "script tiktok", "hook tiktok", "réécrire en tiktok", "tiktok depuis [asset]"
- veut décliner un asset existant (article, carousel) en vidéo courte
- demande des variantes de hook sur une thèse donnée

### Contenu du skill

Sections, dans cet ordre :

1. **Voix parlée Survivant-IA** — section inline avec invariants + adaptations ci-dessus. Pas de lecture de fichier externe.

2. **Bibliothèque de frameworks de hook** — 8 patterns, chacun avec micro-définition + exemple Survivant-IA :
   - *contrarian* — renverser l'idée reçue
   - *stakes* — délai/conséquence chiffré ("18 mois")
   - *call-out direct* — nommer l'audience cible ("comptables.")
   - *faux-consensus brisé* — "tout le monde te dit X, c'est faux"
   - *curiosity gap* — la phrase qui appelle la suivante
   - *pattern interrupt visuel* — plan source + coupe nette + plan visage
   - *listicle* — "5 métiers qui n'existeront plus dans 24 mois"
   - *dialogue-en-tête* — démarrer en plein milieu d'une phrase, comme une suite

3. **Process** — séquence fixe :
   a. Lire l'asset source si fourni (chemin fichier) ; sinon demander la thèse à l'utilisateur
   b. Extraire la **phrase-cliff** (l'asset central qu'on garde mot pour mot)
   c. Générer **5 hooks** taggés framework. Le skill choisit les 5 frameworks les plus pertinents pour la thèse parmi les 8 disponibles, et justifie le choix en 1 ligne en tête de section ("frameworks retenus : … parce que …")
   d. Pour chaque hook : **corps 20-30s** (3-5 phrases), **punch** (phrase de fin), **CTA** (cluster action + domaine)
   e. **Découpage shot-by-shot** : plan (cadre visage / cadre objet / écran), mouvement, texte à l'écran, durée approximative
   f. Auto-check voix : pour chaque ligne, valider full negation, pas d'emoji, pas de "méthode", pas d'invention factuelle. Lister les dérogations explicites.

4. **Output template** — structure markdown fixe :
   ```
   ## Thèse + phrase-cliff
   ## Hook 1 — [framework]
     Hook : …
     Corps : …
     Punch : …
     CTA : …
     Shot-by-shot : …
     Voice check : …
   ## Hook 2 — [framework]
   …
   ## Hook 5 — [framework]
   ## Reco
   Le hook X est le plus aligné voix + retention probable, parce que …
   ```

### Comportement

- Doit pouvoir prendre en input soit un chemin de fichier (article `.md`, carousel `.md`), soit une thèse en clair
- Termine toujours par une **reco** (1 hook sur 5 que le skill recommande, avec justification)
- Ne génère pas de visuel ; produit du texte + descriptions shot-by-shot uniquement
- Ne touche pas au workflow Remotion existant (production vidéo séparée)

## Sub-agent `tiktok-trends`

**Chemin :** `.claude/agents/tiktok-trends.md`
**Type :** subagent dispatchable via Task tool
**Tools autorisés :** `WebFetch`, `WebSearch`, `Read`, `Write` (pour sauvegarder un brief)

### Mission

Produire un brief de veille TikTok court (1 page markdown) sur les **formats/sons/structures qui marchent en ce moment**, filtré par compatibilité Survivant-IA.

### Input

- Optionnel : un thème / cluster / mot-clé (ex: "comptables", "métiers menacés IA")
- Sinon : mode général (trends business/tech FR)

### Process

1. Web search sur 3-4 sources :
   - Top creators FR business/tech (recherche par requête type "tiktok creator france ia 2026")
   - Recherche "tiktok trends format [mois] [année] france business"
   - Si Exolyt / TikTok Creative Center publiquement accessible, fetch
2. Recense **5 trends** : formats (split-screen, react, show-don't-tell), structures narratives (POV X, "wait until the end", duo-réponse), sons si pertinents
3. Pour chacun : description courte + 1-2 exemples URL + verdict **"matche Survivant-IA / matche pas"** avec raison (typiquement : "matche pas car ton TikTok-bro / emoji intégré / persona faux-influenceur")

### Output

Brief markdown sauvegardé dans `docs/marketing/trends/YYYY-MM-DD-tiktok-trends.md` :

```
# TikTok trends — YYYY-MM-DD
## Trend 1 — [nom]
Description : …
Exemple : URL
Verdict Survivant-IA : matche / matche pas — raison
## …
## Synthèse — 2 trends à tester cette semaine
```

### Comportement

- N'écrit jamais de script (c'est le job du skill `survivant-tiktok`)
- N'invente pas de trend non sourcé — chaque trend doit avoir au moins 1 URL exemple
- Filtre fortement par voix Survivant-IA : un trend qui demande emoji / persona-influenceur / hype → marqué "matche pas" même s'il performe

## Pas de chaînage automatique

Les deux artefacts sont **indépendants**. Workflow type :
- 1× par semaine : `Task(subagent=tiktok-trends)` → brief de veille
- À chaque vidéo : `Skill(survivant-tiktok)` avec asset source → 5 hooks + reco
- Mathieu lit la reco, décide, tourne

Pas d'orchestration auto (pas de skill "marketing-survivant" stratège pour cette V1).

## Frameworks référencés (origine)

Les 8 frameworks de hook sont tirés du consensus copywriting + court-format (Cole Schafer / Harry Dry, Justin Welsh, MrBeast retention analysis, Hormozi hooks). Pas de citations dans le skill — on intègre les patterns nommés, sans hagiographie.

## Critères de succès

- Mathieu peut produire un script TikTok prêt à tourner en < 10 minutes à partir d'un asset existant
- Le hook généré ne contient pas d'emoji, respecte full negation par défaut, et appartient à un des 8 frameworks identifiés
- La reco du skill est cohérente avec la voix Survivant-IA (testable : si la reco propose un hook qui contredit un invariant, c'est un bug)
- Le brief `tiktok-trends` filtre activement (ne valide pas un trend juste parce qu'il performe)

## Étapes suivantes

1. Spec validée par Mathieu
2. Plan d'implémentation (via skill `writing-plans`) — sortie : tasks discrètes pour créer les deux fichiers, valider sur un cas réel (vidéo comptables de demain)
3. Test en conditions réelles sur le cas "générateur d'écriture comptable" — la sortie devient le premier banc d'essai
