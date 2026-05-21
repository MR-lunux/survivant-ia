# Brief article — "Comment écrire un prompt qui améliore tes réponses"

- **Date** : 2026-05-21
- **Statut** : brief validé, draft à produire (à reviewer avant publication)
- **Workflow** : brief inversé mode C (charte éditoriale Survivant-IA 2026-05-07, étape 2 validée)
- **Sous-projet** : A — article pilier du programme prompting Survivant-IA (s'adosse à l'outil `/outils/ameliorer-son-prompt` livré 2026-05-19)

---

## Les 7 dimensions du brief (étape 2 validée)

| Dimension | Valeur |
|---|---|
| **Titre** | Comment écrire un prompt qui améliore tes réponses |
| **Slug** | `2026-05-21-comment-ecrire-prompt-ameliore-reponses` |
| **Description** | À écrire au draft, ~150 caractères, doit annoncer le bénéfice "tes réponses changent" + faire le pont vers l'outil |
| **Cluster SEO** | Cluster 2 — Action (colonne vertébrale) |
| **Format** | Pilier (1800-2200 mots, lecture ~9 min) |
| **Archétype** | A+C hybride (REX cognitif → tactique) |
| **Kicker OG** | `LECTURE LONGUE · 9 MIN` |

### Angle de différenciation

L'article ne raconte pas "comment fonctionne un LLM" (sujet saturé). Il raconte **pourquoi un savant qui sait tout n'arrive pas à marcher seul** — la métaphore signature de Mathieu pour le mécanisme LLM — et comment lui filer une grille de 6 boutons pour qu'il avance droit. Le pivot : le LLM ne devine pas, il complète des patterns. Donc plus tu poses le pattern, plus la réponse est bonne.

**Test différenciation** (charte §7.2) : ChatGPT pourrait-il écrire ça à un autre auteur ? Non, parce que (1) la métaphore "savant qui marche mal" est l'invention Mathieu, (2) le REX cognitif (au début c'est nul → lecture+test sur plusieurs mois → cristallisation du pattern) est très spécifique à son trajet, (3) la chute opérationnelle vers l'outil `/outils/ameliorer-son-prompt` ancre la tactique dans un produit qu'il a lui-même construit.

### Crochet de différenciation par défaut

Ancrage dans le vécu Mathieu (REX cognitif : lecture analytique itérative + test sur plusieurs mois) + métaphore signature "savant qui sait tout mais qui marche mal".

---

## Structure type (canevas A+C hybride, charte §6.3)

| Section | Mots cible | Fonction |
|---|---|---|
| **Hook** (2 phrases) | 50-80 | Situation banale "ChatGPT répond nul" → identité du fautif est ailleurs |
| **REX cognitif** | 200-300 | Le récit : au début c'est nul, lecture, test, observation du pattern |
| **La métaphore** | 100-150 | "Un savant qui sait tout mais qui marche mal" — image marquante posée |
| **Mécanisme** | 300-500 | Vulgarisation next-token + attention contextuelle, sans jargon |
| **Grille des 6 boutons** | 100-150 | Pourquoi 6 et pas autre, médiane des sources sérieuses |
| **6 boutons détaillés** | 480-720 | Pour chacun : rôle dans la grille + pourquoi ça marche + court exemple |
| **Close + lien outil** | 100-150 | Pilotage : *"tu peux retenir les 6 boutons. Ou tu peux laisser l'outil les appliquer à ton prompt brut en 3 secondes."* |

**Cible totale** : 1800-2200 mots ✓

---

## Sources externes

3 sources cœur + 1 optionnelle pour les curieux :

- **Anthropic — Prompt engineering best practices** : `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices`
- **Google — Prompt design strategies (Gemini API)** : `https://ai.google.dev/gemini-api/docs/prompting-strategies`
- **Karpathy — Intro to LLMs (YouTube 2024)** : vulgarisation référence du mécanisme next-token, pour les lecteurs qui veulent creuser
- *(optionnel)* **Vaswani et al. (2017) — Attention is all you need** : paper fondateur de l'architecture transformer, à mentionner en bas pour les curieux

L'équilibre Anthropic + Google = les deux fournisseurs frontier les plus utilisés, crédible sans biais. Karpathy = vulgarisation accessible. Vaswani = saut technique pour qui veut, hors lecture obligatoire.

---

## Lien interne principal

- **`/outils/ameliorer-son-prompt`** — chute de l'article, après la grille des 6 boutons. *"Tu peux retenir les 6 boutons. Ou tu peux laisser l'outil les appliquer à ton prompt brut en 3 secondes."*
- *(optionnel)* `/identite` — en filigrane si on évoque le contexte Mathieu DHIT en début d'article

---

## Voix Survivant — points de vigilance pour cet article

Renvoi à `docs/charte-voix.md` + mémoire DA. Spécifiques à surveiller ici :

- **Taboos absolus** : `méthode`, `chevaucher`, `mardi`, em-dashes `—` (utiliser `:` ou `,`)
- **Tutoiement** systématique
- **Négation pleine** : « je ne suis pas », jamais « je suis pas »
- **Casse minuscule** sur concepts coined : écrire "savant qui marche mal", "6 boutons", "next-token" — pas en CamelCase ou caps
- **Pas d'invention factuelle** : durée, lecture, contexte chiffré, tout doit être vérifiable ou neutre
- **Voix lucide-sec** : pas inspirationnel, pas "rejoins les 5% qui maîtrisent". Le lecteur n'est pas un champion, il est dans le tas, comme l'auteur l'était au début
- **Mathieu = "le Survivant de l'IA"**, pas "Mathieu Rerat" seul
- **Domaine** : `survivant-ia.ch`

---

## Localisation des fichiers

- **Brief-spec** (ce document) : `docs/superpowers/specs/2026-05-21-article-comment-ecrire-prompt-design.md`
- **Draft** (à produire) : `docs/drafts/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md` — **PAS** dans `content/rapports/` tant que Mathieu n'a pas donné explicitement le feu vert
- **Publication finale** (après feu vert) : `content/rapports/2026-05-21-comment-ecrire-prompt-ameliore-reponses.md`

---

## Critères de validation du brief (avant rédaction)

- [x] Titre verrouillé (≤ 60 caractères, voix tutoiement, annonce le bénéfice "améliore tes réponses")
- [x] Angle de différenciation explicite (métaphore + REX cognitif spécifique Mathieu)
- [x] Cluster SEO ancré (Cluster 2 Action)
- [x] Format dimensionné (pilier 1800-2200 mots)
- [x] Archétype confirmé (A+C hybride)
- [x] Sources externes listées et équilibrées (Anthropic + Google + Karpathy)
- [x] Lien interne principal identifié (`/outils/ameliorer-son-prompt`)
- [x] Voix Survivant : points de vigilance listés
- [x] Localisation fichiers : draft dans `docs/drafts/`, pas dans `content/rapports/`

---

## Hors scope de ce brief

- **Articles courts satellites** qui pointeront vers ce pilier ("5 erreurs de prompt", "Le rôle change tout", etc.) — production future, pas dans cette session.
- **OG image personnalisée** — possible v2, le kicker par défaut suffit pour V1.
- **Mise à jour du SEO clusters map** (`docs/seo-clusters-map.md`) au moment de la publication — étape post-publication, hors brief de rédaction.
