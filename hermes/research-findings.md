# Research findings — sources & arbitrages

Synthèse de la recherche menée pendant le brainstorming 2026-06-02. **18+ sources distinctes** consultées. Document à conserver comme référence pour comprendre POURQUOI le design est ce qu'il est.

## 1. Hermes Agent (Nous Research)

### Ce que c'est
Hermes Agent, sorti février 2026 par Nous Research, licence MIT, ~135 000 stars GitHub en 3 mois. **Le framework d'agent IA self-hosted le plus adopté de 2026.**

### Capacités natives
- LLM-agnostique (Nous Portal, OpenRouter, Custom API OpenAI-compatible, local vLLM)
- Multi-platform : Telegram, Discord, Slack, WhatsApp, Signal, CLI — gateway unique
- Tools : web search, browser automation full (navigate/click/type/screenshot), vision, image gen, TTS, sandboxed code execution
- Persistent memory (`~/.hermes/`)
- 40+ skills natifs, marketplace ouvert via `agentskills.io`
- Cron scheduler intégré

### Web UI natif (important pour le coût tracking)
- Summary cards 7/30/90j : total tokens (in/out), cache hit %, coût CHF estimé, sessions
- Daily token chart + breakdown table
- Per-model breakdown (sessions, tokens, coût)
- Recent 20 sessions auto-refresh 5s, badges modèles
- Cron jobs status

### Install
`curl` one-liner, no prerequisites, Linux/macOS/WSL2. Reco realistic : 4 GB RAM minimum, 8 GB confortable + browser headless.

### Sources
- [Hermes Agent — site officiel](https://hermes-agent.org/)
- [Nous Research — Hermes Agent](https://hermes-agent.nousresearch.com/)
- [GitHub — NousResearch/hermes-agent](https://github.com/nousresearch/hermes-agent)
- [Hermes Agent — Web Dashboard docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/web-dashboard)
- [Hermes Agent vs n8n](https://hermes-agent.ai/vs/n8n)
- [Awesome Hermes Agent](https://github.com/0xNyk/awesome-hermes-agent)

## 2. Karpathy LLM Wiki pattern

### Le pattern (avril 2026)
3 couches strictes :
1. **Raw sources** (immuables, Git-versioned)
2. **Wiki** (atomic notes LLM-generated, cross-refs, concept maps)
3. **Schema** (`SKILL.md` / `CLAUDE.md` = mainteneur discipliné)

Opérations : **ingest** (article → 8-15 atomic notes — on cappe à 5 pour Survivant-IA), **query** (l'agent répond depuis le wiki), **lint** (santé hebdo).

### Criticisms (essentielles à comprendre)

**Hallucination contamination** (Proudfrog skeptics guide) :
> "If the LLM hallucinates a connection between two concepts, that false link now lives in your wiki. Self-checking fails because LLMs are worse at catching their own errors than at catching errors written by a different system."

→ **Notre mitigation** : cross-model audit (Mistral audite Qwen) + spot-check 3 random/sem.

**Maintenance burden > value** :
> "The consistent failure mode is that the maintenance burden eventually outweighs the value. Users capture enthusiastically, organize briefly, then drift."

Cimetière documenté :
- Evernote ($1B+ valuation, 200M users, "dying in public")
- Roam Research ($9M raised, momentum lost 2024)
- Skiff ($14M, 2M users, acquired then shut down)
- Mem.ai ($29M, "the forty-million-dollar second brain failure")
- Limitless (Meta acquisition Dec 5 2025)

→ **Notre mitigation** : exit criteria explicites, hard cap budget, wiki éphémère, bootstrap passif.

**High-stakes use cases (legal/medical/financial)** : à éviter.
→ **Notre cas** : contenu éditorial. Pas high-stakes. OK.

**Bounded inputs only** :
> "If you point the Karpathy pattern at 'everything I read on the internet', you will drown."

→ **Notre mitigation** : scope fini = articles piliers Survivant-IA, pas une veille tous azimuts.

### Sources
- [Karpathy LLM Wiki — MindStudio](https://www.mindstudio.ai/blog/what-is-llm-wiki-karpathy-knowledge-base-architecture)
- [Proudfrog — LLM Wiki skeptic's guide](https://proudfrog.com/en/insights/llm-wiki-skeptics-guide) ⭐ critique la plus utile
- [Karpathy pattern Claude — MindStudio](https://www.mindstudio.ai/blog/karpathy-llm-wiki-knowledge-base-pattern)
- [Where RAG breaks — MindStudio](https://www.mindstudio.ai/blog/karpathy-llm-wiki-pattern-knowledge-base-without-rag)
- [LLM Wiki desktop app (nashsu)](https://github.com/nashsu/llm_wiki)
- [GitHub - second-brain (Karpathy impl)](https://github.com/NicholasSpisak/second-brain)

## 3. Eliott Meunier — Atomic Thinking (FR)

Founder Atomic Thinking, Eyrolles bestseller, 15k+ personnes formées. **La référence FR du second brain.**

### Méthode (6 phases)
1. Sélection — créer son flux d'infos vs algorithmes
2. Capture — extraire l'essentiel (200p livre → 2p notes)
3. Déconstruction — notes permanentes (portable + indépendante + atomique)
4. Émergence — réseaux de notes créent nouvelles idées
5. Création — l'idée devient contenu linéaire à partager
6. Organisation — important vs urgent

### Note permanente (anatomy)
1. Metadata (MOC, source, project, tags, date)
2. Body (1 écran max, idée centrale claire)
3. References (exemples, cas, citations)
4. Links (avec explications du pourquoi)

### MOC (Maps of Content)
Organisées par **questions, thèmes, ou chronologie** — JAMAIS exhaustives. Pont entre l'atomique et le linéaire publié.

### Tools recommandés
Obsidian (stockage local, format universel markdown). Plugin **Note Refactor** pour découpage semi-automatique.

### Avis critique sur sa formation
> "Le contenu n'est pas méga innovant — prendre des notes structurées a déjà été écrit. Mais ça va droit au but, débloque vraiment."

C'est du Zettelkasten modernisé. Pertinent pour bootstrap, pas une révolution.

### Sources
- [Eliott Meunier — Atomic Thinking](https://eliottmeunier.com/atomic-thinking/)
- [Eliott Meunier — Zettelkasten Obsidian](https://eliottmeunier.com/zettelkasten/)
- [Eliott Meunier — Outils productivité](https://eliottmeunier.com/outils-productivite/)
- [Eliott Meunier — Obsidian vs Roam](https://eliottmeunier.com/obsidian-roam/)
- [Avis Waxoo](https://waxoo.fr/eliott-meunier-avis-atomic-thinking/)
- [Avis Babelio](https://www.babelio.com/livres/Meunier-Arretez-doublier-ce-que-vous-lisez-/1406326/critiques)

## 4. Collector's fallacy + Tiago Forte critiques

### Le piège (zettelkasten.de classique)
> "Knowing about something isn't knowing something. The Collector's fallacy is the belief that collecting information makes it useful."

> "We organize for storage rather than retrieval, so it becomes a black hole that consumes time without adding much value."

### Tiago Forte (Building a Second Brain) — critique principale
> "Another repackaging-the-obvious this-is-a-blog-post book. The concept has existed for a while (Commonplace books, Zettelkasten)."

→ **Notre mitigation** : organize for retrieval (RAG/embeddings ciblés au query, pas stockage organisationnel).

### Sources
- [Curtis McHale — BASB Collector's Fallacy](https://curtismchale.ca/2022/07/30/building-a-second-brain-gives-you-permission-to-fall-into-collectors-fallacy/)
- [Zettelkasten.de — Collector's Fallacy](https://zettelkasten.de/posts/collectors-fallacy/)
- [Eva Keiffenheim — BASB dangerously wrong](https://medium.com/age-of-awareness/what-most-people-get-dangerously-wrong-about-building-a-second-brain-b5393eb05e03)
- [xda — PARA/Zettelkasten abandoned](https://www.xda-developers.com/para-zettelkasten-and-other-systems-i-abandoned-within-six-months/)

## 5. AI brain fry (research Harvard 2026)

> "Researchers coined 'AI brain fry' for cognitive exhaustion distinct from traditional burnout, driven by mental demands of constantly supervising, correcting, and coordinating AI."

**Seuil critique : 3+ outils AI gérés simultanément** → fatigue mentale disproportionnée + **-40% qualité de décision**.

> "The winners will not be those who automate everything; they will be those who automate the process while protecting the personality. AI does heavy lifting, human does relationship."

→ **Notre mitigation** : 3 skills core only, ajout progressif validé sur usage.

### Sources
- [HBR — When AI leads to brain fry](https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry)
- [MindStudio — AI brain fry Harvard](https://www.mindstudio.ai/blog/what-is-ai-brain-fry-harvard-research-cognitive-exhaustion)
- [Fortune — AI is frying our brains](https://fortune.com/2026/04/26/how-ai-causes-brain-drain-cognitive-load-neuroleadership/)
- [CBS News — AI productivity burnout](https://www.cbsnews.com/news/is-ai-productivity-prompting-burnout-study-finds-new-pattern-of-ai-brain-fry/)
- [Stack Overflow — AI becoming second brain at expense of first](https://stackoverflow.blog/2026/03/19/ai-is-becoming-a-second-brain-at-the-expense-of-your-first-one/)

## 6. LinkedIn 2026 algorithm — Authenticity Score

> "LinkedIn's 2026 algorithm introduced an 'Authenticity Score' that analyzes engagement patterns to detect artificial engagement pods, automated comments, and inauthentic activity. Posts with 'Comment YES if you agree' or relying on generic AI-generated fluff are flagged and suppressed."

> "Auto-publish mode misses 50 to 70% of potential reach — engagement is just as important as publishing itself."

→ **Notre mitigation** : pas d'auto-publish. Voice-check humanizer avant chaque draft. Validation V1 systématique.

### Sources
- [LinkedIn Authenticity 2026 (LinkBoost)](https://blog.linkboost.co/linkedin-automation-best-practices-2026/)
- [LinkedIn AI content authenticity (LinkMate)](https://blog.linkmate.io/ai-generated-content-authenticity-guide-2026/)
- [LinkedIn content engine 2026 (LinkBoost)](https://blog.linkboost.co/building-linkedin-content-engine-2026/)
- [Content atomization mistakes (Fairyfox)](https://fairyfoxdigital.com/content-repurposing-mistakes/)

## 7. Obsidian plugin bloat + ecosystem

> "Going plugin crazy from day one causes the vault to become a sluggish mess. If you can't clearly explain why you need a specific plugin and how it solves a real problem, don't install it. 'Earn its keep' rule."

### Plugins matures pour second brain LLM
- **Smart Connections** : embeddings locaux, vault-wide semantic linking. Solide jusqu'à 20k+ notes
- **Copilot** : chat interface, indexing buggy sur gros vaults
- **Local LLM Hub** : function-calling vers vault (read_note, create_note, search_notes), branchable Infomaniak ✓
- **ObsidianRAG** : LangGraph + Ollama/LM Studio/OpenAI-compatible
- **MCP Obsidian servers** (Team Relay, mcpbundles) : exposent vault comme tools

→ **Notre mitigation** : Git + Templater + Smart Connections seulement. Le reste à la demande.

### Sources
- [xda — ditched half Obsidian plugins, vault better](https://www.xda-developers.com/ditched-half-obsidian-plugins-my-vault-got-better/)
- [Smart Connections vs Copilot (Code Culture)](https://codeculture.store/blogs/developer-culture/obsidian-ai-plugin-comparison-2025)
- [Obsidian Local LLM Hub](https://github.com/takeshy/obsidian-local-llm-hub)
- [ObsidianRAG](https://github.com/Vasallo94/ObsidianRAG)
- [MCP server Obsidian forum post](https://forum.obsidian.md/t/i-built-an-mcp-server-that-connects-claude-ai-directly-to-your-obsidian-vault/112454)

## 8. Content atomization

> "One major trap is republishing instead of repurposing — copying text from one channel to another rarely works. Content must be reshaped for its audience and format. Even after training AI in your tone of voice, ideal clients, and business values, it can't quite get your content 100% sounding like you, requiring refinement to add personality and stories."

→ **Notre mitigation** : 
- Sub-routine par canal (LinkedIn ≠ TikTok ≠ newsletter), pas un seul "post générique"
- Voice-fingerprint maintenu et utilisé par chaque sous-routine
- Validation V1 = Mathieu remix final si besoin (cohérent avec son `mode_redac: A` actuel)

### Sources
- [Bluetext — Content Atomization Playbook](https://bluetext.com/blog/the-content-atomization-playbook-one-idea-dozens-of-deliverables/)
- [Fairyfox — Content Repurposing Mistakes](https://fairyfoxdigital.com/content-repurposing-mistakes/)

## 9. Note-taking systems 2026 (PARA / Zettelkasten / CODE)

> "AI removes the maintenance burden that causes most people to abandon their systems. The best approach in 2026 is to choose the system that matches how you think, then use AI to handle the parts that used to make it unsustainable."

→ **Notre approche** : Karpathy LLM Wiki = "AI maintains the structure for you" — exactement la promesse.

### Sources
- [Atlas Workspace — 6 note-taking systems compared 2026](https://www.atlasworkspace.ai/blog/note-taking-systems-compared)
- [BrainFO — Zettelkasten vs PARA vs CODE](https://brainfo.ai/blog/second-brain-methods-zettelkasten-para-code/)
- [Matt Giaro — PARA in Obsidian](https://mattgiaro.com/para-obsidian/)
- [Mindly — Build Second Brain 2026 guide](https://mindly-ai.com/blog/how-to-build-a-second-brain-2026-guide)

## Sources totales consultées

≥ 22 sources distinctes. Domaines : nousresearch.com, hermes-agent.org, hermes-agent.ai, github.com, mindstudio.ai, proudfrog.com, eliottmeunier.com, waxoo.fr, babelio.com, top-avis-formations.fr, zettelkasten.de, curtismchale.ca, xda-developers.com, hbr.org, fortune.com, cbsnews.com, stackoverflow.blog, blog.linkboost.co, blog.linkmate.io, fairyfoxdigital.com, bluetext.com, atlasworkspace.ai, brainfo.ai, mattgiaro.com, mindly-ai.com, codeculture.store, forum.obsidian.md, mcpbundles.com.
