# Pre-Mortem Skill — Design Spec

**Date:** 2026-05-10
**Author:** Mathieu (via brainstorming session)
**Status:** Draft, awaiting review

## Goal

Build a generic, reusable Claude Code skill that runs a comprehensive **business pre-mortem** on any project (paid SaaS, free newsletter, lead magnet, open source, B2B service, community, etc.) — imagining the project failed at T+6 months and working backward to identify catastrophic failure scenarios, early warning indicators, prevention tactics, and contingency response plans.

The skill must produce a dense, defensible, sourced markdown document plus a styled HTML version, suitable for strategic review.

## Non-Goals

- Code/engineering pre-mortem (boshu2/agentops already covers that domain)
- PRD-style "Tigers / Paper Tigers / Elephants" classification (phuryn covers that)
- Project-specific embedded context (e.g., Survivant-IA presets) — the skill is generic; project context is passed in or discovered

## Reference Material

Methodology inspired by the artifact at `https://claude.ai/public/artifacts/9016442d-c8e2-4476-8f46-402bc4b817a6` (AI entrepreneurship community pre-mortem). Adapted to be project-type-agnostic.

## Skill Location

User-level skill, available across all projects:

```
~/.claude/skills/pre-mortem/
├── SKILL.md                        # entrypoint, contains workflow + framework
├── references/
│   ├── scenario-template.md        # exact canvas for each failure scenario
│   ├── project-types.md            # adaptive metric sets per project type
│   ├── research-protocol.md        # how subagents conduct research
│   └── html-template.html          # styled HTML wrapper template
└── scripts/
    └── render-html.sh              # md → html via template
```

## Workflow

When invoked (via `Skill` tool or `/pre-mortem` command):

### Step 1 — Context gathering

- If a brief is provided as argument, parse it as the `Original Strategic Request` block (company context, launch details, assumptions, analysis requirements).
- If no brief, explore the current repository:
  - `CLAUDE.md`, `AGENTS.md`, `README.md`
  - `docs/`, `package.json` (or equivalent manifest)
  - Recent 20 commits via `git log --oneline -20`
  - User auto-memory at `~/.claude/projects/<slug>/memory/MEMORY.md` and referenced files
- Build an initial brief from gathered context.

### Step 2 — Clarifying questions

If the brief is missing any of the following critical inputs, ask 3–5 targeted multiple-choice questions, one at a time, to fill the gaps:

- Business model (paid SaaS / free newsletter / lead magnet / open source / B2B service / community / other)
- Target audience and persona
- Timeline horizon (default: 6 months from launch)
- Core success metric (what does "winning" look like?)
- Runway / resource constraint (financial, time, team size)

Skip if all critical inputs are already present.

### Step 3 — Project-type classification

Determine project type and load the corresponding metric set from `references/project-types.md`:

| Type | Primary metrics |
|---|---|
| Paid SaaS / CaaS | MRR, CAC, LTV, churn, trial-to-paid, gross margin |
| Free newsletter | Subscribers, open rate, CTR, unsubscribe rate, growth rate, referral coefficient |
| Lead magnet → funnel | Tool sessions, email captures, capture rate, magnet→newsletter conversion, share rate |
| Open source | Stars, contributors, issues closed/opened ratio, downloads, time-to-first-response |
| B2B service | Pipeline, win rate, avg deal size, sales cycle, NPS, referral rate |
| Community | DAU/WAU, post-per-member, retention cohort, NPS, member-generated content ratio |
| Custom | Skill asks user to define 3–5 signal metrics |

Hybrid projects (e.g., Survivant-IA = newsletter + lead magnet) load a merged metric set.

### Step 4 — Scenario discovery

- Brainstorm 8–10 candidate failure modes by category: acquisition, retention, monetization, competition, operational/burnout, market timing, brand/trust, regulatory.
- Rank by `severity × likelihood`.
- Keep top 5 by default. Allow 3–7 based on project complexity (skill judges).

### Step 5 — Parallel research

Dispatch one subagent per scenario via the `dispatching-parallel-agents` skill. Each subagent:

1. Receives the scenario hypothesis and project context.
2. Runs WebSearch for market benchmarks (CAC ranges, churn ranges, conversion ranges relevant to the project type).
3. Greps the repo for relevant configuration, code, or content that touches the scenario.
4. Reads relevant memory entries.
5. Returns structured output:
   - Failure story (narrative, 100–150 words, T+6 months)
   - Root cause analysis (3–5 causes)
   - Early warning indicators (4–6, dated by week, expressed in the loaded metric set)
   - Prevention tactics (3–5 concrete actions)
   - Contingency response plan (trigger point + 3–5 pivot actions)
   - Sources (citations: URLs, repo paths, memory files)

The full subagent prompt is defined in `references/research-protocol.md`.

### Step 6 — Synthesize

Combine subagent outputs into a single document:

- **Executive Summary** — bottom-line-up-front, 2–3 sentences, identify top-2 highest-risk scenarios
- **N Critical Failure Scenarios** — each rendered using `scenario-template.md`
- **Weekly Success Metrics Dashboard** — pulled from the loaded metric set, with target / threshold values inferred from research
- **Risk Mitigation Timeline** — 4 phases (pre-launch, launch, growth, maturation), each with 3–5 actions
- **Critical Success Factors** — 4–6 factors derived from the scenarios
- **Implementation Checklist** — week-by-week starting from week -4, ending at week 4

### Step 7 — Write and render outputs

- Markdown: `docs/pre-mortem/YYYY-MM-DD-<project-slug>-pre-mortem.md` (relative to current working directory; create dir if missing)
- HTML: `docs/pre-mortem/YYYY-MM-DD-<project-slug>-pre-mortem.html` via `scripts/render-html.sh` using `references/html-template.html`

If `docs/` does not exist or the user prefers a different location, prompt before writing.

Report to user:
- Path to both files
- Top-risk scenario name
- Recommended next action (e.g., implement the prevention tactic with highest leverage)

## Scenario Template (locked)

Each scenario in the markdown output follows this exact canvas:

```markdown
### N. <Evocative scenario name>

#### 💀 The Failure Story
<Narrative 100–150 words at T+horizon: what concretely happened?>

#### 🔍 Root Cause Analysis
- <Cause 1 + short explanation>
- <Cause 2 + ...>
(3–5 causes)

#### 🚨 Early Warning Indicators
- Week X: <metric from loaded set> <operator> <numeric threshold>
(4–6 warnings, dated)

#### 🛡️ Prevention Tactics
- <Concrete action, verifiable, not aspirational>
(3–5 actions)

#### 🔄 Contingency Response Plan
**Trigger Point**: <metric + threshold + deadline>
- <Pivot action 1>
- <Pivot action 2>
(3–5 actions)

#### 📚 Sources
- <Citations: WebSearch URLs, repo paths, memory files>
```

## HTML Template Aesthetic

The HTML template (`html-template.html`) replicates the artifact's presentation but in a sober tone:

- Dark warm background (slate / deep slate)
- Cards per scenario with subtle border + soft shadow
- Dashboard tiles for metrics (mono font for numbers, label below)
- Section headings with emoji prefixes matching the markdown
- Single-column responsive layout
- No external dependencies (inline CSS, no JS frameworks)

The script `render-html.sh` does a plain markdown-to-HTML conversion (via `pandoc` if available, fallback to a minimal Python converter) and wraps the result in the template.

## Quality Gates

Before declaring success:

- All 5 scenarios have non-empty sources (no scenario fabricated without grounding)
- All early warnings reference a metric from the loaded metric set (no invented metrics)
- All contingency triggers have a numeric threshold
- HTML renders without broken layout (manual visual check on first run)

## Constraints / Risks

- **Subagent cost**: 5 parallel research agents per pre-mortem is heavy. Document this in the skill description so users opt in knowingly.
- **WebSearch reliability**: benchmarks vary widely. Subagents must cite at least one source per numeric claim and flag uncertainty.
- **Project-type misclassification**: hybrid projects (Survivant-IA-style) need explicit handling in `project-types.md`. Default to "merged metric set" with the user's confirmation.
- **HTML rendering**: pandoc is not always installed. The fallback converter must handle the markdown subset the skill produces (headings, lists, bold/italic, code blocks, no tables in fallback).

## Future Extensions (not in v1)

- Project-specific presets (`/pre-mortem --preset=survivant-ia`)
- Diff mode: re-run pre-mortem after 4 weeks, compare predictions to reality
- Integration with auto-memory: persist top-risk scenarios as `project_*` memories for future sessions
