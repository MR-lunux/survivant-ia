# Pre-Mortem Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a generic, reusable Claude Code skill `pre-mortem` that runs a comprehensive business pre-mortem on any project — adapts to project type, dispatches parallel research subagents, and produces both a markdown and a styled HTML deliverable.

**Architecture:** User-level skill at `~/.claude/skills/pre-mortem/` with a single `SKILL.md` entrypoint, four reference docs (scenario template, project-type metric sets, research protocol, HTML template), and one shell script for HTML rendering. The skill orchestrates: context gathering → clarifying questions → project-type classification → scenario discovery → parallel subagent research → synthesis → markdown + HTML output.

**Tech Stack:** Markdown (skill content), bash + python3 (render script), HTML/CSS (template). No external runtime dependencies beyond what comes with macOS.

---

## Important Setup Note

`~/.claude/` is **not** a git repository. The pre-mortem skill files will live in `~/.claude/skills/pre-mortem/` and are not versioned by git in this plan. Steps therefore omit `git commit` for skill files; verification is by file content + manual smoke test. The spec for this work lives in the `survivor` repo at `docs/superpowers/specs/2026-05-10-pre-mortem-skill-design.md` (already committed).

If the user later decides to version the skill, that's a follow-up (initialize a git repo at `~/.claude/skills/pre-mortem/` and push to GitHub).

---

## File Structure

Files to create (all under `~/.claude/skills/pre-mortem/`):

| Path | Responsibility |
|---|---|
| `SKILL.md` | Entrypoint: name, description, full workflow, quality gates, references |
| `references/scenario-template.md` | Locked canvas for each failure scenario |
| `references/project-types.md` | Adaptive metric sets per project type |
| `references/research-protocol.md` | Subagent prompt + required output format |
| `references/html-template.html` | Styled HTML wrapper with placeholders |
| `scripts/render-html.sh` | md → html using template (pandoc or python fallback) |
| `tests/sample-input.md` | Tiny fixture markdown for the render script test |
| `tests/sample-expected.html` | Expected output (used in render script smoke test) |

---

## Task 1: Create skill directory structure

**Files:**
- Create: `~/.claude/skills/pre-mortem/`
- Create: `~/.claude/skills/pre-mortem/references/`
- Create: `~/.claude/skills/pre-mortem/scripts/`
- Create: `~/.claude/skills/pre-mortem/tests/`

- [ ] **Step 1: Create the directories**

```bash
mkdir -p ~/.claude/skills/pre-mortem/references ~/.claude/skills/pre-mortem/scripts ~/.claude/skills/pre-mortem/tests
```

- [ ] **Step 2: Verify structure**

```bash
ls -la ~/.claude/skills/pre-mortem/
```

Expected output: three subdirectories `references/`, `scripts/`, `tests/`.

---

## Task 2: Write `references/project-types.md`

**Files:**
- Create: `~/.claude/skills/pre-mortem/references/project-types.md`

- [ ] **Step 1: Write the project-types reference**

Write this exact content to the file:

````markdown
# Project Types and Metric Sets

The skill classifies the project into one of these types and loads the corresponding metric set. Hybrid projects load a merged set.

## Classification Heuristic

Decide based on the brief / discovered context:

- **Paid SaaS / CaaS** — keyword markers: "subscription", "MRR", "monthly fee", "tier", "trial", "B2B SaaS"
- **Free newsletter** — keyword markers: "newsletter", "subscribers", "weekly send", "open rate", "free"
- **Lead magnet / funnel tool** — keyword markers: "calculator", "scanner", "diagnostic", "free tool", "lead capture", "email gate"
- **Open source** — keyword markers: "GitHub", "open source", "OSS", "library", "package", "MIT/Apache"
- **B2B service / consulting** — keyword markers: "consulting", "agency", "service", "deal", "client engagement"
- **Community** — keyword markers: "community", "Discord", "Slack", "members", "engagement", "DAU"

If multiple markers match, treat as **hybrid** and merge the relevant metric sets.

If no markers match, prompt the user to define 3–5 signal metrics (the "Custom" fallback).

## Metric Sets

### Paid SaaS / CaaS

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| MRR | up | target set in brief |
| CAC | down | <€150 typical SMB SaaS |
| LTV | up | >3× CAC |
| Monthly churn | down | <5% healthy, >10% critical |
| Trial-to-paid | up | >20% healthy, <10% critical |
| Gross margin | up | >70% healthy SaaS |

### Free newsletter

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| Subscribers | up | target set in brief |
| Open rate | up | >40% great, <20% critical |
| CTR | up | >2% great, <0.5% critical |
| Unsubscribe rate | down | <0.5% per send healthy |
| Weekly net growth | up | >2% healthy |
| Referral coefficient | up | >0.3 healthy |

### Lead magnet / funnel tool

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| Tool sessions | up | target set in brief |
| Email captures | up | derived from sessions × capture rate |
| Capture rate | up | >20% great, <5% critical |
| Magnet → newsletter conversion | up | >30% healthy |
| Share rate | up | >5% healthy |

### Open source

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| GitHub stars | up | trajectory matters more than absolute |
| Active contributors | up | >5 unique/quarter healthy |
| Issues closed:opened ratio | up | >0.8 healthy |
| Downloads (npm/pip/etc.) | up | trajectory matters more |
| Median time-to-first-response on issues | down | <48h healthy |

### B2B service / consulting

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| Pipeline value | up | >3× quarterly revenue target |
| Win rate | up | >25% healthy |
| Avg deal size | up | depends on positioning |
| Sales cycle | down | <90 days SMB, varies enterprise |
| NPS | up | >40 great |
| Referral rate | up | >30% of new clients healthy |

### Community

| Metric | Healthy direction | Typical threshold |
|---|---|---|
| WAU / DAU | up | DAU/MAU >20% healthy community |
| Posts per active member | up | >1/week healthy |
| 30-day cohort retention | up | >60% healthy |
| NPS | up | >50 healthy paid community |
| Member-generated content ratio | up | >50% non-founder posts healthy |

### Custom (fallback)

If no markers match, ask the user:

> What are the 3–5 metrics that signal whether this project is winning or losing? For each, what's the healthy direction (up/down) and a rough critical threshold if you have one?

Use the user's response as the metric set.

## Hybrid Project Handling

If the project matches 2+ types (e.g., "free newsletter + lead magnet funnel"):

1. Load both metric sets.
2. Deduplicate overlapping metrics.
3. Confirm the merged set with the user before proceeding.

Example for Survivant-IA-style projects (newsletter + lead magnet):
- Subscribers, open rate, CTR, weekly net growth (newsletter)
- Tool sessions, capture rate, magnet → newsletter conversion (lead magnet)
- Drop redundant ones, present 6–8 metrics total.
````

- [ ] **Step 2: Verify file**

```bash
wc -l ~/.claude/skills/pre-mortem/references/project-types.md
head -20 ~/.claude/skills/pre-mortem/references/project-types.md
```

Expected: file has >100 lines, starts with `# Project Types and Metric Sets`.

---

## Task 3: Write `references/scenario-template.md`

**Files:**
- Create: `~/.claude/skills/pre-mortem/references/scenario-template.md`

- [ ] **Step 1: Write the scenario template reference**

Write this exact content:

````markdown
# Scenario Template

Each failure scenario in the generated pre-mortem **must** follow this exact canvas. No skipping sections, no reordering. The structure is the value: it forces concrete thinking instead of vague worries.

## Canvas

```markdown
### N. <Evocative scenario name>

#### 💀 The Failure Story
<Narrative 100–150 words at T+horizon: what concretely happened?
Use past tense. Include specific numbers (current vs target).
End on the consequence: shutdown / pivot forced / runway exhausted / etc.>

#### 🔍 Root Cause Analysis
- **<Cause name>**: <Short explanation, 1 sentence>
- **<Cause name>**: <Short explanation>
(3–5 causes, named in bold)

#### 🚨 Early Warning Indicators
- **Week X**: <metric from loaded set> <operator> <numeric threshold>
(4–6 warnings, dated by week, ordered earliest first)

#### 🛡️ Prevention Tactics
- **<Tactic name>**: <Concrete action, verifiable, not aspirational>
(3–5 actions, named in bold)

#### 🔄 Contingency Response Plan
**Trigger Point**: <metric + threshold + deadline, e.g. "<25 customers by Week 8">

- <Pivot action 1>
- <Pivot action 2>
(3–5 actions, immediate / within-1-week tactics)

#### 📚 Sources
- <Citation 1: WebSearch URL or repo path or memory file>
- <Citation 2>
(At least 1 source per scenario; ideally 1 per numeric claim)
```

## Quality Rules

- **No empty sections.** If a section can't be filled, the scenario isn't ready.
- **Every numeric threshold must be sourced** — either WebSearch benchmark, repo data, or explicit user input. Never invent numbers.
- **Early warnings must reference the loaded metric set.** No invented metrics.
- **Failure stories must be concrete.** "We failed" is not a story. "By Month 3, only 12 of 100 target customers, conversion at 2% vs assumed 15%, shutdown" is a story.
- **Prevention ≠ Contingency.** Prevention happens before warnings trigger. Contingency happens after.

## Naming Examples

Good scenario names (evocative, specific):
- "Customer Acquisition Death Spiral"
- "Newsletter Open Rate Free-Fall"
- "Founder Burnout & Quality Degradation"
- "Pricing Model Collapse"

Bad names (vague, generic):
- "Marketing Problems"
- "Things Go Wrong"
- "Risk #3"
````

- [ ] **Step 2: Verify file**

```bash
grep -c "^####" ~/.claude/skills/pre-mortem/references/scenario-template.md
```

Expected: at least 6 (one per canonical section: Failure Story, Root Cause, Early Warning, Prevention, Contingency, Sources, plus quality rules subsections).

---

## Task 4: Write `references/research-protocol.md`

**Files:**
- Create: `~/.claude/skills/pre-mortem/references/research-protocol.md`

- [ ] **Step 1: Write the research protocol reference**

Write this exact content:

````markdown
# Research Protocol for Subagents

When the skill reaches Step 5 (Parallel research), it dispatches one subagent per failure scenario. This file defines the exact prompt and expected output.

## Subagent Dispatch

Use the `dispatching-parallel-agents` skill. Send all subagents in a single message (one per scenario) for parallelism.

Each subagent uses the `general-purpose` agent type unless the scenario has an obvious specialist match (e.g., SEO scenario → could use a SEO-auditor agent if available).

## Prompt Template

Send each subagent this prompt, with placeholders filled in:

````
You are researching one failure scenario for a pre-mortem analysis.

## Project Context
<Insert the gathered project context: business model, audience, timeline, success metric, runway, key assumptions>

## Loaded Metric Set
<Insert the metric set selected in Step 3, with healthy directions and thresholds>

## Your Scenario
**Name**: <Scenario name from Step 4>
**Hypothesis**: <One-paragraph hypothesis: how this scenario could play out>

## Your Mission
Produce a complete scenario analysis following the canvas in `~/.claude/skills/pre-mortem/references/scenario-template.md`. Specifically:

1. **Failure story** (100–150 words, T+<horizon>): write a concrete past-tense narrative with specific numbers.
2. **Root cause analysis** (3–5 named causes).
3. **Early warning indicators** (4–6, each in the form `Week X: <metric> <operator> <threshold>` using ONLY metrics from the loaded set).
4. **Prevention tactics** (3–5 verifiable actions, not aspirations).
5. **Contingency response plan** (1 trigger point with numeric threshold + deadline, then 3–5 pivot actions).
6. **Sources** (cite at least 1 source per numeric claim).

## Required Research Steps
1. **WebSearch** for benchmarks relevant to this scenario (CAC ranges, churn ranges, conversion ranges, etc., scoped to the project type and audience). Cite at least 2 URLs.
2. **Grep the current repo** for files / commits / configs that touch this scenario. Cite paths.
3. **Read auto-memory** at `~/.claude/projects/<slug>/memory/MEMORY.md` and any project_*.md / feedback_*.md / reference_*.md files relevant to the scenario.
4. **Quantify uncertainty**: if a benchmark is unreliable or contested, flag it explicitly.

## Output Format
Return the complete scenario in the canvas format from `scenario-template.md`. No preamble, no postscript. Start directly with `### N. <Scenario name>`.

## Constraints
- Word budget: ~600 words total for the scenario block.
- No invented metrics. No invented numbers. Every threshold must be sourced.
- No vague prevention tactics ("be careful", "monitor closely") — only verifiable actions.
````

## Aggregation

After all subagents return:

1. Verify each scenario has all 6 sections filled.
2. If a section is empty, re-dispatch that subagent with stricter instructions.
3. Concatenate scenarios in severity order (highest first) into the final document.

## Cost Awareness

5 parallel subagents × WebSearch × repo greps is expensive (often 3–5× the cost of a single-agent run). The skill description must communicate this so users opt in knowingly.
````

- [ ] **Step 2: Verify file**

```bash
grep -c "^##" ~/.claude/skills/pre-mortem/references/research-protocol.md
```

Expected: at least 5 top-level sections.

---

## Task 5: Write `references/html-template.html`

**Files:**
- Create: `~/.claude/skills/pre-mortem/references/html-template.html`

- [ ] **Step 1: Write the HTML template**

Write this exact content (template uses `{{TITLE}}` and `{{CONTENT}}` placeholders that the render script substitutes):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{TITLE}}</title>
<style>
  :root {
    --bg: #1a1816;
    --bg-card: #211e1b;
    --bg-tile: #28241f;
    --border: #3a352f;
    --text: #e8e3dc;
    --text-dim: #a39b91;
    --accent: #5BA37A;
    --warn: #d49b54;
    --critical: #c5614f;
    --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif;
    line-height: 1.6;
    font-size: 16px;
  }
  .container {
    max-width: 880px;
    margin: 0 auto;
    padding: 60px 40px;
  }
  h1 {
    font-family: var(--serif);
    font-style: italic;
    font-weight: 400;
    font-size: 2.4rem;
    line-height: 1.15;
    margin: 0 0 0.5em;
    color: var(--text);
  }
  h2 {
    font-family: var(--serif);
    font-style: italic;
    font-weight: 400;
    font-size: 1.6rem;
    margin: 2.4em 0 0.8em;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.4em;
  }
  h3 {
    font-size: 1.2rem;
    margin: 2em 0 0.6em;
    color: var(--text);
    background: var(--bg-card);
    padding: 14px 18px;
    border-left: 3px solid var(--critical);
    border-radius: 2px;
  }
  h4 {
    font-size: 0.95rem;
    margin: 1.5em 0 0.5em;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }
  p { margin: 0.6em 0; }
  ul, ol { margin: 0.6em 0; padding-left: 1.4em; }
  li { margin: 0.3em 0; }
  strong { color: var(--text); font-weight: 600; }
  em { color: var(--text-dim); }
  code {
    font-family: var(--mono);
    background: var(--bg-tile);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
    color: var(--accent);
  }
  pre {
    background: var(--bg-tile);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 16px;
    overflow-x: auto;
    font-family: var(--mono);
    font-size: 0.88rem;
  }
  pre code { background: transparent; padding: 0; color: var(--text); }
  blockquote {
    border-left: 3px solid var(--accent);
    margin: 1em 0;
    padding: 0.4em 1em;
    color: var(--text-dim);
    font-style: italic;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 0.92rem;
  }
  th, td {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background: var(--bg-card);
    color: var(--text-dim);
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
  }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2em 0;
  }
  a { color: var(--accent); text-decoration: none; border-bottom: 1px dotted var(--accent); }
  a:hover { border-bottom-style: solid; }
  .meta {
    color: var(--text-dim);
    font-size: 0.85rem;
    margin-bottom: 2em;
    font-family: var(--mono);
  }
  @media (max-width: 640px) {
    .container { padding: 32px 20px; }
    h1 { font-size: 1.8rem; }
    h2 { font-size: 1.3rem; }
  }
</style>
</head>
<body>
  <div class="container">
{{CONTENT}}
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify file**

```bash
grep -c "{{TITLE}}\|{{CONTENT}}" ~/.claude/skills/pre-mortem/references/html-template.html
```

Expected: 2 (one of each placeholder).

---

## Task 6: Write `tests/sample-input.md` (test fixture)

**Files:**
- Create: `~/.claude/skills/pre-mortem/tests/sample-input.md`

- [ ] **Step 1: Write a tiny markdown fixture**

```markdown
# Sample Pre-Mortem

This is a test fixture.

## Section One

- Item A
- Item B

**Bold** and *italic*.
```

- [ ] **Step 2: Verify file**

```bash
cat ~/.claude/skills/pre-mortem/tests/sample-input.md
```

Expected: file shows the fixture content above.

---

## Task 7: Write `scripts/render-html.sh`

**Files:**
- Create: `~/.claude/skills/pre-mortem/scripts/render-html.sh`

- [ ] **Step 1: Write the render script**

Write this exact content:

```bash
#!/usr/bin/env bash
# render-html.sh — convert a pre-mortem markdown to a styled HTML.
#
# Usage: render-html.sh <input.md> <output.html>
#
# Strategy: prefer pandoc (best rendering); fall back to a minimal
# python3 markdown-to-HTML converter if pandoc is unavailable.

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <input.md> <output.html>" >&2
  exit 64
fi

INPUT="$1"
OUTPUT="$2"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
TEMPLATE="${SCRIPT_DIR}/../references/html-template.html"

if [ ! -f "$INPUT" ]; then
  echo "Input not found: $INPUT" >&2
  exit 66
fi
if [ ! -f "$TEMPLATE" ]; then
  echo "Template not found: $TEMPLATE" >&2
  exit 66
fi

# Extract title from first H1 in the markdown; default to filename.
TITLE="$(grep -m1 '^# ' "$INPUT" | sed 's/^# //' || true)"
if [ -z "$TITLE" ]; then
  TITLE="$(basename "$INPUT" .md)"
fi

# Convert markdown body → HTML body fragment.
if command -v pandoc &>/dev/null; then
  BODY="$(pandoc -f markdown -t html "$INPUT")"
else
  BODY="$(python3 - "$INPUT" <<'PY'
import re, sys, html
src = open(sys.argv[1], encoding="utf-8").read()
lines = src.split("\n")
out, in_list, list_tag, in_pre, in_para = [], False, None, False, False

def close_list():
    global in_list, list_tag
    if in_list:
        out.append(f"</{list_tag}>")
        in_list = False
        list_tag = None

def close_para():
    global in_para
    if in_para:
        out.append("</p>")
        in_para = False

def inline(s):
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    return s

for line in lines:
    if line.startswith("```"):
        close_list(); close_para()
        if in_pre:
            out.append("</code></pre>"); in_pre = False
        else:
            out.append("<pre><code>"); in_pre = True
        continue
    if in_pre:
        out.append(html.escape(line))
        continue

    m = re.match(r"^(#{1,6})\s+(.*)$", line)
    if m:
        close_list(); close_para()
        n, txt = len(m.group(1)), m.group(2)
        out.append(f"<h{n}>{inline(txt)}</h{n}>")
        continue

    m = re.match(r"^(\s*)([-*])\s+(.*)$", line)
    if m:
        close_para()
        if not in_list or list_tag != "ul":
            close_list()
            out.append("<ul>"); in_list = True; list_tag = "ul"
        out.append(f"<li>{inline(m.group(3))}</li>")
        continue

    m = re.match(r"^(\s*)\d+\.\s+(.*)$", line)
    if m:
        close_para()
        if not in_list or list_tag != "ol":
            close_list()
            out.append("<ol>"); in_list = True; list_tag = "ol"
        out.append(f"<li>{inline(m.group(2))}</li>")
        continue

    if re.match(r"^\s*$", line):
        close_list(); close_para()
        continue

    if line.startswith("> "):
        close_list(); close_para()
        out.append(f"<blockquote>{inline(line[2:])}</blockquote>")
        continue

    if line.strip() == "---":
        close_list(); close_para()
        out.append("<hr>")
        continue

    if not in_para:
        close_list()
        out.append("<p>"); in_para = True
    out.append(inline(line))

close_list(); close_para()
if in_pre: out.append("</code></pre>")
print("\n".join(out))
PY
)"
fi

# Substitute into template using Python (safe for arbitrary content).
TITLE="$TITLE" BODY="$BODY" python3 - "$TEMPLATE" "$OUTPUT" <<'PY'
import os, sys
template = open(sys.argv[1], encoding="utf-8").read()
out = template.replace("{{TITLE}}", os.environ["TITLE"]).replace("{{CONTENT}}", os.environ["BODY"])
with open(sys.argv[2], "w", encoding="utf-8") as f:
    f.write(out)
PY

echo "Wrote: $OUTPUT"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x ~/.claude/skills/pre-mortem/scripts/render-html.sh
ls -l ~/.claude/skills/pre-mortem/scripts/render-html.sh
```

Expected: permissions show `-rwxr-xr-x` (or similar with `x` bits).

- [ ] **Step 3: Smoke test the script with the fixture**

```bash
~/.claude/skills/pre-mortem/scripts/render-html.sh \
  ~/.claude/skills/pre-mortem/tests/sample-input.md \
  /tmp/pre-mortem-render-test.html

echo "--- HTML head ---"
head -20 /tmp/pre-mortem-render-test.html
echo "--- HTML body excerpt ---"
grep -A1 'h1\|h2\|<li>' /tmp/pre-mortem-render-test.html | head -20
```

Expected:
- Script exits 0 with `Wrote: /tmp/pre-mortem-render-test.html`
- HTML contains `<title>Sample Pre-Mortem</title>`
- HTML contains `<h1>Sample Pre-Mortem</h1>`
- HTML contains `<h2>Section One</h2>`
- HTML contains `<li>Item A</li>` and `<li>Item B</li>`
- HTML contains `<strong>Bold</strong>` and `<em>italic</em>`

- [ ] **Step 4: If any expected element missing, fix the converter**

If pandoc was used and the output looks wrong, install via `brew install pandoc` is NOT in scope; instead, force the python fallback by setting `PATH=/tmp /bin/bash render-html.sh ...` and re-test. Patch the python converter in `render-html.sh` to fix any issue. Re-run Step 3 until all expected elements are present.

---

## Task 8: Write `tests/sample-expected.html` (snapshot)

**Files:**
- Create: `~/.claude/skills/pre-mortem/tests/sample-expected.html`

- [ ] **Step 1: Capture the current good output as a snapshot**

```bash
cp /tmp/pre-mortem-render-test.html ~/.claude/skills/pre-mortem/tests/sample-expected.html
ls -l ~/.claude/skills/pre-mortem/tests/sample-expected.html
```

Expected: file exists, non-empty.

- [ ] **Step 2: Add a regression-check command (no file, just document for the user)**

This isn't a step that creates a file — just verify the snapshot can be diff-checked later:

```bash
diff ~/.claude/skills/pre-mortem/tests/sample-expected.html /tmp/pre-mortem-render-test.html
```

Expected: no output (files identical).

---

## Task 9: Write `SKILL.md` (entrypoint)

**Files:**
- Create: `~/.claude/skills/pre-mortem/SKILL.md`

- [ ] **Step 1: Write the SKILL.md entrypoint**

Write this exact content:

````markdown
---
name: pre-mortem
description: Run a comprehensive business pre-mortem on any project (paid SaaS, free newsletter, lead magnet, open source, B2B service, community). Imagines failure at T+6 months and works backward to identify catastrophic failure scenarios, early warning indicators, prevention tactics, and contingency plans. Adapts metrics to project type. Dispatches parallel research subagents (heavy — opt in knowingly). Outputs markdown + styled HTML.
---

# Pre-Mortem Skill

> **Purpose:** Imagine the project failed at T+horizon. Work backward to identify what went wrong, with early warnings, prevention, and contingency plans grounded in real benchmarks.

## When to Use

Use when:
- Preparing a launch and you want to stress-test assumptions
- Mid-project, you suspect a slow drift toward failure and want a structured risk audit
- Investor / stakeholder asks "what could go wrong?"

Do **not** use for:
- Code-level pre-mortem of a PR or implementation plan (use `boshu2/agentops@pre-mortem` instead)
- Lightweight PRD risk classification (use `phuryn/pm-skills@pre-mortem` instead)
- Daily standup risk review (overkill)

## Cost Warning

This skill dispatches **5 parallel research subagents**, each running WebSearch + repo grep + memory reads. A single run typically costs 3–5× a normal task. Confirm with the user before launching the parallel research step.

## Workflow

### Step 1 — Context gathering

If a brief is provided as the skill argument, parse it as the strategic request (company context, launch details, assumptions, analysis requirements).

If no brief, explore the current repository:
- Read `CLAUDE.md`, `AGENTS.md`, `README.md` (if present)
- Read `docs/` index files
- Read `package.json` or equivalent manifest
- Run `git log --oneline -20`
- Read auto-memory at `~/.claude/projects/<slug>/memory/MEMORY.md` plus the files it references

Build an initial brief from gathered context.

### Step 2 — Clarifying questions

If any of these critical inputs is missing from the brief, ask 3–5 targeted multiple-choice questions, one at a time:

- Business model (paid SaaS / free newsletter / lead magnet / open source / B2B service / community / other)
- Target audience and persona
- Timeline horizon (default 6 months from launch)
- Core success metric (what does winning look like?)
- Runway / resource constraint

Skip if all critical inputs are present.

### Step 3 — Project-type classification

Read `references/project-types.md`. Classify the project, load the metric set. For hybrid projects (multiple type markers match), load the merged set and confirm with the user.

### Step 4 — Scenario discovery

Brainstorm 8–10 candidate failure modes across these categories:
- Acquisition (cannot reach target audience)
- Retention (audience comes but leaves)
- Monetization (audience stays but does not pay / convert)
- Competition (someone else captures the market)
- Operational / burnout (founder cannot sustain delivery)
- Market timing (too early / too late)
- Brand / trust (reputational hit)
- Regulatory / platform (rules change)

Rank by `severity × likelihood`. Keep top 5 by default. Allow 3–7 based on project complexity.

### Step 5 — Parallel research (heavy)

Read `references/research-protocol.md`. Dispatch one subagent per scenario in a single message via the `dispatching-parallel-agents` skill.

After all subagents return:
1. Verify each scenario has all 6 sections from `references/scenario-template.md` filled.
2. Re-dispatch any scenario with empty sections.
3. Order scenarios by severity (highest first).

### Step 6 — Synthesize

Combine outputs into one markdown document with these sections in order:

1. **Title + meta** (date, project name)
2. **Original Strategic Request** (echo the brief used)
3. **Executive Summary** (2–3 sentences, top-2 highest-risk scenarios)
4. **N Critical Failure Scenarios** (using the canvas from `references/scenario-template.md`)
5. **Weekly Success Metrics Dashboard** (the loaded metric set with target / threshold)
6. **Risk Mitigation Timeline** (4 phases: pre-launch, launch, growth, maturation; 3–5 actions each)
7. **Critical Success Factors** (4–6 factors derived from scenarios)
8. **Implementation Checklist** (week-by-week from week -4 to week 4)
9. **Sources** (deduplicated citations from all subagents)

### Step 7 — Write and render outputs

1. Determine output directory: `<cwd>/docs/pre-mortem/` (create if missing). If `<cwd>` is not a project directory, ask user for an output path.
2. Compute slug from the project name (lowercase, hyphens).
3. Write markdown to `docs/pre-mortem/YYYY-MM-DD-<slug>-pre-mortem.md`.
4. Render HTML: `~/.claude/skills/pre-mortem/scripts/render-html.sh <md-path> <html-path>` where `<html-path>` is the `.md` path with `.html` extension.
5. Report to user:
   - Path to both files
   - Top-risk scenario name
   - Recommended next action (highest-leverage prevention tactic)

## Quality Gates

Before declaring success:

- [ ] All scenarios have non-empty sources (no fabrication)
- [ ] All early warnings reference a metric from the loaded set (no invented metrics)
- [ ] All contingency triggers have a numeric threshold and a deadline
- [ ] HTML renders without errors (`render-html.sh` exits 0)
- [ ] HTML opens in a browser without broken layout (manual visual check on first run by the user)

## Reference Documents

- [references/scenario-template.md](references/scenario-template.md) — locked canvas per scenario
- [references/project-types.md](references/project-types.md) — adaptive metric sets
- [references/research-protocol.md](references/research-protocol.md) — subagent prompt
- [references/html-template.html](references/html-template.html) — HTML wrapper template
- [scripts/render-html.sh](scripts/render-html.sh) — md → html

## Future Extensions (not in v1)

- Project-specific presets (`/pre-mortem --preset=<name>`)
- Diff mode: re-run pre-mortem after 4 weeks, compare predictions to reality
- Auto-memory persistence: top-risk scenarios saved as `project_*` memories
````

- [ ] **Step 2: Verify the SKILL.md frontmatter loads**

```bash
head -5 ~/.claude/skills/pre-mortem/SKILL.md
```

Expected: starts with `---`, contains `name: pre-mortem`, contains `description:`, ends with `---`.

- [ ] **Step 3: Verify all referenced files exist**

```bash
for f in references/scenario-template.md references/project-types.md references/research-protocol.md references/html-template.html scripts/render-html.sh; do
  if [ -f "$HOME/.claude/skills/pre-mortem/$f" ]; then
    echo "OK: $f"
  else
    echo "MISSING: $f"
  fi
done
```

Expected: all 5 lines start with `OK:`.

---

## Task 10: Manual smoke test

**Files:** none created.

- [ ] **Step 1: List the skill directory tree**

```bash
find ~/.claude/skills/pre-mortem -type f | sort
```

Expected output (8 files):
```
/Users/mathieu/.claude/skills/pre-mortem/SKILL.md
/Users/mathieu/.claude/skills/pre-mortem/references/html-template.html
/Users/mathieu/.claude/skills/pre-mortem/references/project-types.md
/Users/mathieu/.claude/skills/pre-mortem/references/research-protocol.md
/Users/mathieu/.claude/skills/pre-mortem/references/scenario-template.md
/Users/mathieu/.claude/skills/pre-mortem/scripts/render-html.sh
/Users/mathieu/.claude/skills/pre-mortem/tests/sample-expected.html
/Users/mathieu/.claude/skills/pre-mortem/tests/sample-input.md
```

- [ ] **Step 2: Re-run the render smoke test (regression check)**

```bash
~/.claude/skills/pre-mortem/scripts/render-html.sh \
  ~/.claude/skills/pre-mortem/tests/sample-input.md \
  /tmp/pre-mortem-render-test2.html
diff ~/.claude/skills/pre-mortem/tests/sample-expected.html /tmp/pre-mortem-render-test2.html
```

Expected: script exits 0, `diff` produces no output.

- [ ] **Step 3: Verify the skill is discoverable by Claude Code**

In a new Claude Code conversation (separate session), the skill `pre-mortem` should appear in the available skills list automatically because skills under `~/.claude/skills/` are auto-discovered.

Confirm by asking the user (in the same conversation that just built the skill, or in a follow-up):
> "Open a new Claude Code session and run `/skills` (or check the available skills list). Confirm `pre-mortem` is listed."

If the skill is not listed, check the SKILL.md frontmatter format (must be valid YAML between `---` fences).

- [ ] **Step 4: Document completion**

Tell the user:
- Skill is at `~/.claude/skills/pre-mortem/`
- Smoke test passed (HTML rendering works)
- Skill is discoverable
- To use: invoke via `Skill` tool with `skill: pre-mortem` and optional `args: <brief or topic>`
- Cost warning: 5 parallel research subagents per run

---

## Self-Review Notes

Coverage check (each spec section maps to at least one task):

- ✅ Skill location → Task 1
- ✅ Workflow Step 1 (context gathering) → Task 9 (SKILL.md content)
- ✅ Workflow Step 2 (clarifying questions) → Task 9
- ✅ Workflow Step 3 (project-type classification) → Task 2 + Task 9
- ✅ Workflow Step 4 (scenario discovery) → Task 9
- ✅ Workflow Step 5 (parallel research) → Task 4 + Task 9
- ✅ Workflow Step 6 (synthesize) → Task 9
- ✅ Workflow Step 7 (write/render) → Task 7 + Task 9
- ✅ Scenario template (locked) → Task 3
- ✅ Adaptive metrics → Task 2
- ✅ HTML template aesthetic → Task 5
- ✅ Quality gates → Task 9 (in SKILL.md)
- ✅ Render script → Task 7
- ✅ Smoke test → Task 10

No placeholder steps. Every code/markdown step shows the full content. Every command has expected output. Tests are real (render script has actual fixture + snapshot).
