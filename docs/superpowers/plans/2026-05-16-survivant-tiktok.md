# Survivant-TikTok Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a project-scoped Claude Code skill (`survivant-tiktok`) for writing TikTok scripts in the Survivant-IA voice, plus a separate dispatchable sub-agent (`tiktok-trends`) for weekly trends research. Validate on a real asset (the comptables generator article + carousel).

**Architecture:** Two independent markdown configuration artifacts, project-scoped to `.claude/`. The skill encodes voice + 8 hook frameworks + a fixed output template inline. The sub-agent uses WebFetch + WebSearch to produce a 1-page trends brief filtered by Survivant-IA voice compatibility. No automatic chaining between them.

**Tech Stack:** Claude Code Agent Skills (markdown + frontmatter), Claude Code sub-agents (markdown + frontmatter).

**Spec:** `docs/superpowers/specs/2026-05-16-survivant-tiktok-design.md`

---

## File Structure

**Created:**
- `.claude/skills/survivant-tiktok/SKILL.md` — the skill (voice + frameworks + process + output template, all inline)
- `.claude/agents/tiktok-trends.md` — the sub-agent (mission + process + output template + voice filter)
- `docs/marketing/trends/.gitkeep` — directory for the sub-agent's output briefs

**Modified:** none.

**Test artifacts (not committed, used for manual validation):**
- Source article: `content/outils/generateur-ecriture-comptable.md`
- Source carousel: `docs/linkedin/published/2026-05-15-dictee-comptable/post.md`

---

## Task 1: Scaffold the skill directory

**Files:**
- Create: `.claude/skills/survivant-tiktok/SKILL.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p /Users/mathieu/Documents/survivor/.claude/skills/survivant-tiktok
```

- [ ] **Step 2: Write `SKILL.md` with frontmatter + structure scaffolding**

Write the file with these top-level sections in order, leaving content for the next tasks. The frontmatter:

```yaml
---
name: survivant-tiktok
description: Use when the user wants to write a TikTok script in the Survivant-IA voice — derive a hook + body + CTA + shot-by-shot from a source asset (article, LinkedIn carousel) or a stated thesis. Produces 5 hook variants tagged by framework + a recommendation. Does not generate trends research (see tiktok-trends sub-agent) and does not produce other channel formats (LinkedIn post, IG carousel, newsletter).
---
```

Sections to scaffold (titles only, content filled in Step 3):
- `# Survivant-TikTok`
- `## When to use`
- `## When NOT to use`
- `## Voix Survivant-IA en parlé`
  - `### Invariants — jamais négociables`
  - `### Adaptations parlé/vidéo`
- `## Frameworks de hook (8)`
- `## Process`
- `## Output template`
- `## Auto-check voix`

- [ ] **Step 3: Fill the skill body — Voix section**

Under `## Voix Survivant-IA en parlé`, paste the two sub-sections **verbatim from the spec** (`docs/superpowers/specs/2026-05-16-survivant-tiktok-design.md`, section "Voix Survivant-IA en parlé (codifiée dans le skill)"). Do not paraphrase or shorten — this is the source of truth and the engineer should copy it as-is.

The "Invariants — jamais négociables" list (6 bullets) and the "Adaptations parlé/vidéo" list (4 bullets) go inline.

- [ ] **Step 4: Fill the skill body — Frameworks section**

Under `## Frameworks de hook (8)`, list the 8 patterns. For each, include:
1. **Name** (lowercased)
2. **One-line definition**
3. **One Survivant-IA-flavored example** (short, in voice, no emoji, full negation by default)

The 8 patterns:

```markdown
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
```

- [ ] **Step 5: Fill the skill body — Process section**

Under `## Process`, write the 6-step process verbatim from the spec (section "Process" of the skill, items a–f). Keep the lettering (a, b, c, d, e, f). For step f, point to the `## Auto-check voix` section.

- [ ] **Step 6: Fill the skill body — Output template section**

Under `## Output template`, paste this exact template (the skill must produce output matching it):

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

- [ ] **Step 7: Fill the skill body — Auto-check voix section**

Under `## Auto-check voix`, write the explicit checklist the skill applies to every line of every hook:

```markdown
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
```

- [ ] **Step 8: Fill the "When to use" and "When NOT to use" sections**

```markdown
## When to use

- L'utilisateur demande "script tiktok", "hook tiktok", "réécrire en tiktok", "tiktok depuis [chemin]"
- L'utilisateur veut décliner un asset existant (article `content/`, carousel `docs/linkedin/`) en vidéo courte
- L'utilisateur veut des variantes de hook sur une thèse donnée

## When NOT to use

- Production vidéo Remotion / FaceCam (workflow séparé, voir `video/`)
- Autres canaux (LinkedIn post, Instagram carousel, newsletter) — pas dans ce skill
- Veille sur les trends TikTok (formats viraux, sons) — voir sub-agent `tiktok-trends`
- Recherche / scraping de sons ou formats du moment — le skill ne va pas chercher sur le web
```

- [ ] **Step 9: Commit the skill scaffold**

```bash
cd /Users/mathieu/Documents/survivor
git add .claude/skills/survivant-tiktok/SKILL.md
git commit -m "feat(skill): add survivant-tiktok skill for tiktok script writing"
```

---

## Task 2: Validate the skill on the comptables case

**Files:**
- Read only: `content/outils/generateur-ecriture-comptable.md`
- Read only: `docs/linkedin/published/2026-05-15-dictee-comptable/post.md`
- Output: ad-hoc (printed in conversation), not committed

This is the empirical test. The skill is just a markdown file — there's no automated test framework for skills. The test is: invoke the skill on the comptables asset, inspect the output, verify each criterion below.

- [ ] **Step 1: Invoke the skill**

In a Claude Code session in this repo, type:

```
/survivant-tiktok depuis content/outils/generateur-ecriture-comptable.md
```

Or describe in natural language: "utilise le skill survivant-tiktok pour me sortir un script depuis content/outils/generateur-ecriture-comptable.md, en gardant comme contexte le carousel docs/linkedin/published/2026-05-15-dictee-comptable/post.md".

- [ ] **Step 2: Verify the output structure**

Check that the output matches the template exactly:
- A "Thèse + phrase-cliff" header section with the 3 fields (Thèse, Phrase-cliff, Frameworks retenus + justification)
- Exactly 5 hooks, each tagged with a framework name from the list of 8
- Each hook has all 5 sub-fields (Hook, Corps, Punch, CTA, Shot-by-shot, Voice check)
- A final "Reco" section identifying 1 hook of 5 with justification

If any field is missing → the skill description or process section is unclear. Edit `SKILL.md` and re-test.

- [ ] **Step 3: Verify voice compliance**

Read every hook + corps + punch + CTA aloud (or scan visually) and check:
- Zero emoji anywhere (including caption suggestions, shot-by-shot text overlays)
- Full negation respected by default ("je ne suis pas") — note any dérogation and check it's flagged in `Voice check`
- No "méthode" used as a word
- No invented fact about Mathieu (no fake number of years, no fake places, no fake clients)
- Domain mentioned (if any) is `survivant-ia.ch`
- CTA falls in cluster 2 action vocabulary
- Concepts coined are lowercase ("simple valideur", not "Simple Valideur")
- CAPS in shot-by-shot text overlays only on single-word impact (ex: "VALIDER"), not full phrases

If ≥ 2 violations → edit the `Auto-check voix` section to be more explicit, and re-test.

- [ ] **Step 4: Verify the reco is sensible**

The "Reco" must:
- Pick exactly 1 hook (not "either X or Y")
- Give a 2-3 line justification mentioning **both** voice alignment **and** retention probability
- Not contradict any invariant (if the reco's hook violates an invariant, that's a bug)

If the reco is mushy or non-committal → edit the Process section step f and the Output template's "Reco" hint.

- [ ] **Step 5: Edit and re-test until criteria pass**

Iterate on `SKILL.md` until steps 2–4 pass on the comptables case. Each fix should be a small edit (no rewrite). Re-invoke the skill after each edit in a fresh Claude Code session (the skill loads on invocation).

Commit each meaningful iteration:

```bash
git add .claude/skills/survivant-tiktok/SKILL.md
git commit -m "fix(skill): <what changed and why>"
```

- [ ] **Step 6: Save the validated output as a fixture (optional but recommended)**

Once the skill output passes, copy the final output to a fixture for future regression:

```bash
mkdir -p docs/marketing/scripts-tiktok
# paste the final skill output to docs/marketing/scripts-tiktok/2026-05-16-comptables-validation.md
git add docs/marketing/scripts-tiktok/2026-05-16-comptables-validation.md
git commit -m "test(skill): add comptables validation fixture for survivant-tiktok"
```

---

## Task 3: Scaffold the tiktok-trends sub-agent

**Files:**
- Create: `.claude/agents/tiktok-trends.md`
- Create: `docs/marketing/trends/.gitkeep`

- [ ] **Step 1: Create the agents directory and the empty trends dir**

```bash
mkdir -p /Users/mathieu/Documents/survivor/.claude/agents
mkdir -p /Users/mathieu/Documents/survivor/docs/marketing/trends
touch /Users/mathieu/Documents/survivor/docs/marketing/trends/.gitkeep
```

- [ ] **Step 2: Write the sub-agent file**

Write `.claude/agents/tiktok-trends.md` with this exact content:

```markdown
---
name: tiktok-trends
description: Dispatchable sub-agent for weekly TikTok trends research, filtered by Survivant-IA voice compatibility. Use when the user asks for "trends tiktok cette semaine", "veille tiktok", "qu'est-ce qui marche sur tiktok en ce moment" — optionally scoped to a theme/cluster. Produces a 1-page markdown brief saved to docs/marketing/trends/YYYY-MM-DD-tiktok-trends.md. Does not write scripts (see survivant-tiktok skill).
tools: WebFetch, WebSearch, Read, Write, Bash
---

# TikTok Trends — Survivant-IA

## Mission

Produce a short markdown brief (~1 page) listing 5 TikTok trends — formats, narrative structures, sons — that are working *right now* in the FR business/tech/career space. For each trend, give a binary verdict: **matches Survivant-IA voice / does not match**, with the reason.

## Input

- Optional: a theme / cluster / keyword (ex: "comptables", "métiers menacés IA", "se former à l'IA")
- Otherwise: general mode (business/tech/career FR)

## Process

1. **Web search**, 3–4 queries among:
   - `tiktok trends format <mois> <année> france business`
   - `tiktok creator france ia carrière <année>`
   - `tiktok viral format <année> career advice`
   - If a theme is given: `tiktok <thème> <année> france`
2. **WebFetch** top 4–6 results that look like trend roundups or creator analyses
3. From sources, identify **5 distinct trends**:
   - Formats (split-screen, react, show-don't-tell, day-in-the-life, voiceover-on-broll, etc.)
   - Narrative structures (POV X, "wait until the end", duo-réponse, listicle-on-camera)
   - Sons / songs if recurring across multiple posts
4. For each trend, capture:
   - Short name + 1-line description
   - **At least 1 URL example** (a real TikTok or a write-up — not invented)
   - Verdict **matches Survivant-IA / does not match** + reason

## Voice filter (apply to every trend)

A trend "does not match" if it requires any of:
- Emoji-driven captions or on-screen text
- TikTok-bro / hype-influencer persona ("let's gooo", "this changed my life")
- Fake-vulnerability / engagement-bait framing
- Generic "POV: I'm a [job] in 2024 💀"
- Music or format that imposes a comedic register incompatible with anti-hype posture

A trend "matches" if:
- It works with sober, anti-hype tone
- It accepts full-negation phrasing without sounding stiff
- It allows a single-speaker, head-and-shoulders frame or sober B-roll
- It respects cluster 2 action (apprendre à survivre, prendre le virage)

## Output

Save to `docs/marketing/trends/YYYY-MM-DD-tiktok-trends.md` with this structure:

\`\`\`
# TikTok trends — YYYY-MM-DD
*Theme: <theme or "general">*

## Trend 1 — <name>
**Description :** …
**Exemple :** <URL>
**Verdict Survivant-IA :** matche / matche pas — <raison>

## Trend 2 — …
…

## Trend 5 — …

## Synthèse
Les 2 trends à tester cette semaine : **<trend N>** et **<trend M>**, parce que …
\`\`\`

After writing the file, print the absolute path to the brief so the user can open it.

## Hard rules

- **Never invent a trend** — each trend must have ≥ 1 source URL that you actually fetched and that supports its existence
- **Never write a TikTok script** — that is the job of the `survivant-tiktok` skill; if the user asks for a script, redirect them
- **Always filter** — at least 1 of the 5 trends should be "matches pas" if the filter is honest; if all 5 match, double-check the filter
- **One page max** — if the brief grows past ~1 page rendered, trim
```

- [ ] **Step 3: Commit the sub-agent**

```bash
cd /Users/mathieu/Documents/survivor
git add .claude/agents/tiktok-trends.md docs/marketing/trends/.gitkeep
git commit -m "feat(agent): add tiktok-trends sub-agent for weekly trends brief"
```

---

## Task 4: Validate the sub-agent

**Files:** none committed (the output of the sub-agent run is committed as the first real brief).

- [ ] **Step 1: Dispatch the sub-agent**

In a Claude Code session in this repo, dispatch it with no theme (general mode):

```
Utilise l'agent tiktok-trends en mode général pour me sortir le brief de la semaine.
```

Or with a theme:

```
Utilise l'agent tiktok-trends sur le thème "comptables".
```

- [ ] **Step 2: Verify the output**

Check that:
- A file was saved to `docs/marketing/trends/YYYY-MM-DD-tiktok-trends.md` (today's date)
- Exactly 5 trends are listed
- Each trend has a URL (verify by clicking 1-2 to confirm they exist and are relevant)
- At least 1 trend is "matche pas" with a reason
- A "Synthèse" section names 2 trends to test, with justification
- The whole brief is ≤ 1 page rendered (rough heuristic: < 60 lines)

- [ ] **Step 3: Edit the sub-agent if criteria fail**

If trends are invented (no URL) → tighten the "Hard rules" section.
If all 5 match → tighten the "Voice filter" section.
If brief is too long → add an explicit line-count budget in the "Output" section.

- [ ] **Step 4: Commit the first brief**

```bash
cd /Users/mathieu/Documents/survivor
git add docs/marketing/trends/
git commit -m "docs(marketing): first weekly tiktok-trends brief"
```

---

## Task 5: Update CLAUDE.md project memory (optional)

The skill and sub-agent should be discoverable from the project's CLAUDE.md if one exists.

- [ ] **Step 1: Check if CLAUDE.md exists at project root**

```bash
ls /Users/mathieu/Documents/survivor/CLAUDE.md 2>/dev/null
```

If it exists → step 2. If not → skip Task 5.

- [ ] **Step 2: Add a one-line reference**

Edit `CLAUDE.md`, add (in an appropriate section, e.g. "Skills & agents projet"):

```markdown
- `.claude/skills/survivant-tiktok/` — skill pour scripts TikTok dans la voix Survivant-IA (5 hooks + reco, voix parlée codifiée inline)
- `.claude/agents/tiktok-trends.md` — sub-agent pour brief hebdomadaire des trends TikTok filtrés par voix
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): reference survivant-tiktok skill and tiktok-trends agent"
```

---

## Final verification

- [ ] All 4 main tasks committed (5 if CLAUDE.md updated)
- [ ] Skill produces 5 hooks + reco on the comptables case, voice-compliant
- [ ] Sub-agent produces a 1-page brief with sourced trends + filter applied
- [ ] No emoji, no "méthode", no invented facts in any output
- [ ] `survivant-ia.ch` is the only domain referenced

## Out of scope (reminders)

- LinkedIn post writer skill — separate spec
- Instagram carousel/Reels skill — separate spec
- Newsletter teaser skill — separate spec
- Strategist "marketing-survivant" skill that orchestrates them — separate spec, after this V1 has been used 3-4× in real conditions
