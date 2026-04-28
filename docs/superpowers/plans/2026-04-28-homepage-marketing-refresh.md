# Homepage Marketing Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 4 marketing audit fixes to the homepage — visitor-centric manifesto, meaningful stats strip, specific newsletter subtitle, and a "coming soon" signal on the articles section.

**Architecture:** Four isolated changes across 4 files. No new components, no backend changes, no data fetching changes. Each task is fully independent.

**Tech Stack:** Nuxt 4, Vue 3 SFC, scoped CSS, design tokens (`--color-accent`, `--color-muted`, `--font-mono`).

---

## File Map

| Action | Path |
|--------|------|
| Modify | `app/components/ManifestoTerminal.vue` |
| Modify | `app/components/StatsStrip.vue` |
| Modify | `app/components/NewsletterForm.vue` |
| Modify | `app/pages/index.vue` |

---

### Task 1: Rewrite ManifestoTerminal lines

**Files:**
- Modify: `app/components/ManifestoTerminal.vue` (the `LINES` array, lines 18–22)

- [ ] **Step 1: Update the LINES array**

Find in `app/components/ManifestoTerminal.vue`:
```js
const LINES = [
  "Je suis chef de projet IT. Je vois l'IA arriver. Je refuse de regarder sans agir.",
  "Ce site n'est pas là pour vous faire peur — c'est là pour vous armer. Les outils sont plus simples que vous ne le croyez. La menace est réelle mais gérable.",
  "Préparons-nous avant que ça arrive.",
]
```

Replace with:
```js
const LINES = [
  "Vous voyez l'IA arriver dans votre job. Vous ne savez pas comment vous positionner. Vous n'êtes pas seul.",
  "Ce n'est pas un cours de Python. Ce n'est pas du jargon. C'est une carte de survie pratique, une fois par semaine.",
  "Préparez-vous avant que ça arrive.",
]
```

- [ ] **Step 2: Verify the change**

Read the file and confirm the new LINES are present.

- [ ] **Step 3: Commit**

```bash
git add app/components/ManifestoTerminal.vue
git commit -m "feat(manifesto): rewrite lines to visitor-centric copy"
```

---

### Task 2: Update StatsStrip data

**Files:**
- Modify: `app/components/StatsStrip.vue` (the `stats` reactive array, lines 31–35)

- [ ] **Step 1: Update the stats array**

Find in `app/components/StatsStrip.vue`:
```js
const stats = reactive([
  { target: 1,   suffix: '',  label: 'rapport / semaine',  displayed: 0 },
  { target: 100, suffix: '%', label: 'sans jargon',         displayed: 0 },
  { target: 0,   suffix: '+', label: 'survivants inscrits', displayed: 0 },
])
```

Replace with:
```js
const stats = reactive([
  { target: 1,   suffix: '',     label: 'rapport / semaine',        displayed: 0 },
  { target: 5,   suffix: ' min', label: 'de lecture par édition',   displayed: 0 },
  { target: 100, suffix: '%',    label: 'terrain, aucun théoricien', displayed: 0 },
])
```

- [ ] **Step 2: Verify**

Read the file. Confirm "survivants inscrits" is gone and "de lecture par édition" is present.

- [ ] **Step 3: Commit**

```bash
git add app/components/StatsStrip.vue
git commit -m "feat(stats): replace subscriber count with meaningful day-1 metrics"
```

---

### Task 3: Update NewsletterForm subtitle

**Files:**
- Modify: `app/components/NewsletterForm.vue` (the `nl-subtitle` paragraph, line 13)

- [ ] **Step 1: Update the subtitle text**

Find in `app/components/NewsletterForm.vue`:
```html
<p class="nl-subtitle">
  Recevez chaque semaine mon analyse terrain pour comprendre l'IA sans jargon, et développez les soft skills qui sécuriseront votre carrière.
</p>
```

Replace with:
```html
<p class="nl-subtitle">
  Chaque semaine : 1 analyse terrain, 3 axes pratiques, 5 minutes chrono.<br>
  Rejoignez les premiers dans la zone.
</p>
```

- [ ] **Step 2: Verify**

Read the file. Confirm the new subtitle is present and the old text is gone.

- [ ] **Step 3: Commit**

```bash
git add app/components/NewsletterForm.vue
git commit -m "feat(newsletter): specific subtitle + early adopter positioning"
```

---

### Task 4: Update index.vue — add StatsStrip + articles coming-soon message

**Files:**
- Modify: `app/pages/index.vue`

This task has two sub-changes in the same file — do them together in one commit.

**Sub-change A: Insert StatsStrip between manifeste and rapports sections**

Find in the template the section structure after the manifeste:
```html
    </section>

    <SectionDivider />

    <!-- ── DERNIERS RAPPORTS ──────────────────────────── -->
```

Insert `<StatsStrip />` between the manifeste's closing `<SectionDivider />` and the rapports section:

```html
    </section>

    <SectionDivider />
    <StatsStrip />
    <SectionDivider />

    <!-- ── DERNIERS RAPPORTS ──────────────────────────── -->
```

Note: remove the existing `<SectionDivider />` between manifeste and rapports (it gets replaced by the two above). The net result is: manifeste → SectionDivider → StatsStrip → SectionDivider → rapports.

**Sub-change B: Add coming-soon message after articles grid**

Find in the template:
```html
        <div class="articles-grid">
          <ArticleCard
            v-for="(article, i) in articles"
            :key="article.path"
            :article="article"
            data-reveal
            :data-reveal-delay="i * 120"
          />
        </div>
```

Add the conditional message immediately after the closing `</div>` of `.articles-grid`:

```html
        <p
          v-if="articles && articles.length < 3"
          class="font-mono rapports-coming"
        >
          // D'AUTRES RAPPORTS EN COURS DE CHIFFREMENT...
        </p>
```

Then add to the `<style scoped>` block at the bottom of index.vue:

```css
.rapports-coming {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--color-muted);
  margin-top: 1.5rem;
  opacity: 0.6;
}
```

- [ ] **Step 1: Apply sub-change A (StatsStrip)**

Make the template change described above. Read the file first to find the exact line numbers.

- [ ] **Step 2: Apply sub-change B (coming-soon message)**

Add the `v-if` paragraph and the CSS class.

- [ ] **Step 3: Verify**

Read the file and confirm:
- `<StatsStrip />` is present between the two SectionDividers
- The `v-if="articles && articles.length < 3"` paragraph is present after `.articles-grid`
- `.rapports-coming` CSS class is in `<style scoped>`

- [ ] **Step 4: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat(homepage): add StatsStrip + articles coming-soon signal"
```
