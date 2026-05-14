# Charte de voix Survivant-IA

Document vivant. Référence quotidienne pour toute production écrite : site, articles, newsletter La Fréquence, vidéo, social. Les specs datés (`docs/superpowers/specs/2026-05-04-pivot-editorial-design.md`, `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md`) restent comme archives. Cette charte agrège et tranche.

Mise à jour quand une règle se précise ou qu'un nouveau pattern apparaît. Pas de date globale : chaque section vaut ce qu'elle dit aujourd'hui.

---

## 1. Position éditoriale

La voix Survivant-IA est **transformative**, pas défensive : "apprendre à piloter l'IA" plutôt que "ne pas se faire remplacer". Le contrat avec le lecteur, c'est un signal pratique chaque semaine, gratuit, avec des formations annoncées comme produit à venir.

L'autorité ne vient pas d'un titre, elle vient des cicatrices. Le narrateur est **Mathieu le Survivant de l'IA** (référence Ken le Survivant), pas un consultant ni un coach. Lucide, sec, parfois autodérision, jamais inspirationnel.

---

## 2. Vocabulaire

### 2.1 Mots imposés (verbe et lexique de marque)

| Terme | Usage |
|---|---|
| `piloter` | verbe d'action principal, partout |
| `leviers` | utilisé hero, FAQ |
| `signal pratique` | défini dans le manifeste |
| `diagnostic IA` | nom du scanner |
| `La Fréquence` | nom de la newsletter |

### 2.2 Mots bannis

| Terme | Pourquoi |
|---|---|
| `méthode` | n'est pas vendue à ce stade. Remplacer par `leviers`, `signal pratique` |
| `chevaucher`, `chevaucher la vague` | retirés du lexique au pivot 2026-05-04 |
| `mardi` (ou autre jour de publication) | jamais mentionné |
| AI vocabulary EN → FR | `crucial`, `pivot/pivotal` (sauf au sens technique de pivot produit), `landscape`/`paysage` (au sens figuré), `testament`/`témoignage` (au sens "preuve de"), `delve`/`plonger dans`, `foster`/`favoriser`, `vibrant`, `intricate`, `showcase`, `tapestry`, `enduring` |

Pour les emojis, voir §3.4. Pour le `//` comme préfixe de kicker, voir §6.

---

## 3. Construction de phrase

### 3.1 Négation française complète

Toujours `je ne suis pas`, jamais `je suis pas`. Voix lente, assumée, écrite. Pas de TikTok-parlé. La négation complète est un marqueur d'autorité posée, pas un détail de registre.

Référence mémoire : `feedback_french_negation.md`.

### 3.2 Casse

- **Concepts coined** en minuscules : `simple valideur`, pas `Simple Valideur`. Pas de capitales façon LinkedIn-influenceur sur les concepts inventés.
- **Headings** : capitale au début de phrase uniquement. Jamais Title Case Sur Tous Les Mots.

Référence mémoire : `feedback_casse_minuscules_concepts.md`.

### 3.3 Ponctuation

- **Em-dash `—` interdit**. Remplacer par `:` (définition, conséquence) ou `,` (incise). Convention française naturelle, pas un tic anglo-saxon.
- **Tirets simples `-`** : OK pour les listes et les composés français (`l'auto-formation`).
- **Guillemets français** `« »` dans la copy publiée. Les `"..."` droits sont OK dans le markdown interne et le code.
- Pas de ponctuation accumulée (`!!!`, `?!`, `...!`).

### 3.4 Emphase visuelle

- **Gras** : utilisé pour les concepts coined définis pour la première fois et pour les en-têtes de cellule de tableau. Pas pour souligner chaque deuxième phrase, pas pour faire passer un point qui devrait tenir tout seul.
- **Italique** : pour les citations courtes, les titres d'œuvres, l'auto-référence rhétorique (`le mot juste, c'est *piloter*`).
- **Emojis : interdits** dans `.vue`, `.ts`, `.md`, copy publiée. Affordances visuelles via typo et animations CSS, jamais 🎙 🔒 ✅. Grep avant commit.

Référence mémoire : `feedback_no_emojis_da.md`.

---

## 4. Anti-patterns AI

Règles tirées du skill `humanizer` (basé sur Wikipedia "Signs of AI writing"), curées pour le français et la voix Survivant. Les trois nuances en bas de section sont importantes : certains patterns sont des signatures Survivant, pas des tics.

### 4.1 Inflation et habillage

À bannir :

- **Inflation de significance** : `un témoignage durable de`, `un moment pivot dans l'évolution de`, `souligne l'importance de`, `marque un tournant`. Dire la chose, pas son importance supposée.
- **Langage promotionnel** : `niché au cœur de`, `révolutionnaire`, `incontournable`, `vibrant`. Aplatir.
- **Analyses superficielles en -ant / -issant** : `soulignant…, reflétant…, illustrant…`. Soit dire la chose franchement, soit citer une source. Pas d'ornement participe-présent.
- **Tropes d'autorité persuasive** : `au fond`, `la vraie question, c'est`, `fondamentalement`, `ce qui compte vraiment`. Ces phrases prétendent couper le bruit, en pratique elles l'ajoutent.
- **Signposting** : `voyons ensemble`, `plongeons dans`, `voici ce qu'il faut savoir`, `sans plus attendre`. Commencer par le contenu directement.
- **Conclusions positives génériques** : `l'avenir s'annonce radieux`, `un grand pas dans la bonne direction`, `de belles perspectives`. Conclure par un fait, un chiffre, ou une question concrète.

### 4.2 Vague et flou

À bannir :

- **Attributions floues** : `les experts pensent`, `certains analystes considèrent`, `des observateurs ont noté`. Nommer la source ou couper l'affirmation.
- **Disclaimers de cutoff** : `selon les informations disponibles`, `dans la limite de ce qui est publié`. Trouver la source ou retirer la phrase.
- **Excès de prudence** : `pourrait potentiellement peut-être`. Choisir un seul modal.
- **Phrases de remplissage** : `dans le but de` → `pour` ; `du fait que` → `parce que` ; `à ce stade` → `maintenant` ; `dans le cas où` → `si` ; `il est important de noter que les données montrent que` → `les données montrent que`.

### 4.3 Tics structurels

À bannir, sauf nuances ci-dessous :

- **Synonymie qui tourne** : `le protagoniste… le personnage principal… la figure centrale… le héros…`. Répéter le bon mot.
- **Fausses étendues** : `du Big Bang à la matière noire`. Lister les sujets directement.
- **Voix passive sans acteur** : `aucune configuration n'est requise` → `tu n'as pas besoin de configurer`. Nommer l'acteur quand ça clarifie.

À nuancer (signatures Survivant) :

- **Parallélisme négatif** :
  - Banni quand c'est un ornement en queue de phrase : `les options viennent de la sélection, pas de devinette`.
  - **Autorisé** en série tactique courte (≤ 3 termes, asyndète assumée, rythme posé). Exemple validé du spec pivot : *« Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est un signal pratique. »* Trois temps, négations qui posent ce que ce n'est pas avant ce que c'est. C'est une signature voix, pas un tic.
- **Règle de trois** :
  - Bannie quand c'est faux-exhaustif rhétorique : `innovation, inspiration, et insights`.
  - **Autorisée** en énumération tactique numérotée : *« (1) maîtriser ce que l'IA fait mal, (2) utiliser l'IA comme copilote, (3) renforcer ton relationnel. »* Le numéro rend l'intention claire : c'est un inventaire, pas une triade ornementale.

### 4.4 Sycophant et chatbot

À bannir intégralement :

- `Excellente question`, `Bien sûr`, `Tout à fait`, `Vous avez parfaitement raison`, `c'est un excellent point`.
- `J'espère que cela aide`, `N'hésite pas à me dire si`, `Voici un aperçu`.
- Tout artefact de turn-taking IA : `Voici ma réponse :`, `Pour répondre à ta question :`.

Si on rédige un message conversationnel (chat support, réponse mail), garder le ton mais retirer les marqueurs sycophants.

### 4.5 Cosmétique

- Em-dashes `—` : voir §3.3.
- Title Case dans les headings : voir §3.2.
- Emojis : voir §3.4.
- Surcharge de gras : voir §3.4.
- **Listes à puces avec en-tête inline** (`**Performance :** la performance s'est améliorée`) : éviter. Soit on fait une vraie liste avec phrases complètes, soit on rédige en prose.
- **Headers fragmentés** : un titre suivi d'une phrase qui paraphrase le titre avant le vrai contenu. Le titre fait le travail tout seul.

### 4.6 Non applicable

Patterns du skill humanizer qui ne s'appliquent pas, ou pas comme tels :

- **Hyphenated word pairs** (`cross-functional`, `data-driven`) : règle anglaise, sans équivalent direct en français.
- **Copula avoidance** (`serves as`, `stands as`) : le français utilise déjà `est`, `a`, `sert à` naturellement. Vigilance seulement sur les calques EN → FR (`se positionne comme`, `incarne`, `s'impose comme`).
- **Curly quotes vs straight quotes** : remplacé par la règle guillemets français §3.3.

---

## 5. Faits et autorité

- **Pas d'invention factuelle sur Mathieu**. Durées, lieux, rôles bio doivent être sourcés (page identité, mémoire) ou rester neutres. Jamais inventer un chiffre, un titre, ou un détail biographique.
- **Chiffres et études cités** : nommer la source (Tufts 2026, McKinsey 2026, WEF 2026, etc.). Pas de `selon une étude récente`.
- **Citations** : marquer l'origine ou la retirer.

Référence mémoire : `feedback_pas_invention_factuelle.md`.

---

## 6. DA et typographie

- **V2 Editorial Dark** depuis 2026-05-03. Accent menthe `#6CE3B5` depuis 2026-05-05 (était sage `#5BA37A`).
- **Pattern signature** : Inter caps + Playfair italic en accent.
- **KickerLabel** : carré vert qui spin (glow), jamais `//` en préfixe.
- **Domaine canonique** : `survivant-ia.ch`. Jamais `.com`, `.fr`, ou autre TLD.

Références mémoire : `project_da_v2_editorial_dark.md`, `feedback_kicker_label.md`, `reference_domain.md`.

---

## 7. Persona signature

Quand on présente Mathieu en copy publique, c'est **Mathieu le Survivant de l'IA**, pas seulement `Mathieu Rerat`. Le surnom porte le positionnement.

Voix par défaut : lucide, sèche, parfois autodérision. Pas inspirationnel. Pas Linkedin-influenceur. Si une phrase pourrait être signée par un autre auteur sans rien perdre, elle est trop générique.

Référence mémoire : `project_survivant_ia_persona.md`.

---

## 8. Voice-fingerprint

Rythme de phrase, transitions favorites, tics positifs : voir `docs/voice-fingerprint.md`. Document à enrichir depuis le corpus LinkedIn quand il sera fourni. Cette section sera alors mise à jour avec un résumé en 5 lignes.

---

## 9. Archives

- `docs/superpowers/specs/2026-05-04-pivot-editorial-design.md` — décisions copy site (H1, manifeste, FAQ, mots bannis, em-dash) figées les 2026-05-04 et 2026-05-05.
- `docs/superpowers/specs/2026-05-07-charte-editoriale-articles-design.md` — process de production article (workflow brief inversé, 4 dimensions de review, format 80/20).
- Mémoire projet `~/.claude/projects/-Users-mathieu-Documents-survivor/memory/` — feedbacks atomiques et références (PostHog, domaine, Insta, etc.).

Cette charte agrège ces sources. En cas de conflit, **la charte fait foi**.
