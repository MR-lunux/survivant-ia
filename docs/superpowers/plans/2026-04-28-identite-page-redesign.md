# Identite Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `app/pages/identite.vue` to replace the thin generic intro with a trust-building transformation narrative, a professional background block, and a newsletter CTA.

**Architecture:** Single-file change — all additions stay in `identite.vue` (inline template + scoped styles). No new components needed; the existing `ScannerBorder` wrapper is reused for the parcours badges. No backend changes.

**Tech Stack:** Nuxt 4, Vue 3 SFC, Tailwind (utility classes available but page uses scoped CSS — follow that pattern), Space Mono + Inter fonts via CSS vars `--font-mono` / `--font-sans`, design tokens `--color-accent`, `--color-surface`, `--color-muted`, `--color-text`.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `app/pages/identite.vue` |

---

### Task 1: Update identity card title

**Files:**
- Modify: `app/pages/identite.vue` (line 20 — the `<span>` with the subtitle)

- [ ] **Step 1: Change the subtitle text**

In `app/pages/identite.vue`, find:
```html
<span class="font-mono" style="font-size: 0.7rem; color: var(--color-accent); letter-spacing: 0.1em;">CHEF DE PROJET IT — SURVIVANT EN COURS</span>
```
Replace with:
```html
<span class="font-mono" style="font-size: 0.7rem; color: var(--color-accent); letter-spacing: 0.1em;">DEPUTY HEAD OF IT — SURVIVANT EN COURS</span>
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`, open `http://localhost:3000/identite`.
Expected: card subtitle reads "DEPUTY HEAD OF IT — SURVIVANT EN COURS".

- [ ] **Step 3: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): update identity card subtitle"
```

---

### Task 2: Rewrite the narrative text block

**Files:**
- Modify: `app/pages/identite.vue` (the `.identity-text` div, lines 27–48)

- [ ] **Step 1: Replace the narrative paragraphs**

Remove the existing 3 paragraphs inside `.identity-text` (keep the `ScannerBorder` mission block and the last paragraph — those are handled in later tasks). Replace with 4 new paragraphs:

```html
<div class="identity-text">
  <p>
    Mon parcours n'a rien d'un parcours tech pur : économie, master en systèmes d'information,
    puis PwC en audit IT, Nestlé comme Business Analyst, Imopac où je suis passé de consultant
    à Head of Office Romandie, et aujourd'hui Deputy Head of IT chez Solutions&nbsp;&amp;&nbsp;Funds.
    Des environnements différents, un fil rouge : être l'interface entre les gens, les process,
    et les outils.
  </p>

  <p>
    Quand l'IA s'est invitée dans mon quotidien, j'ai plongé. Claude, ChatGPT, automatisations,
    code... Je lis les articles, j'écoute les podcasts, je teste. Pendant un moment, j'ai cru
    que plus j'en utilisais, mieux je travaillais.
  </p>

  <p>
    Jusqu'au jour où j'ai réalisé que je n'avais plus la notion de l'effort. Je produisais vite,
    beaucoup — mais je ne construisais plus rien. L'IA faisait, je validais. Ce signal ne m'a
    pas rendu anti-IA. Il m'a rendu <strong class="text-accent">lucide</strong>.
  </p>

  <p>
    Ce site existe pour les professionnels qui voient l'IA arriver sans savoir comment se
    positionner. Pas pour en faire des experts. Pour leur donner les cartes que j'aurais
    aimé avoir — et éviter les erreurs que j'ai faites.
  </p>

  <!-- mission block and closing paragraph follow in next tasks -->
</div>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/identite`. Expected: 4 paragraphs visible, "lucide" in green accent, no layout breakage.

- [ ] **Step 3: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): rewrite narrative — terrain, plongée, chute, mission"
```

---

### Task 3: Restore mission block + closing paragraph

**Files:**
- Modify: `app/pages/identite.vue` (inside `.identity-text`, after the 4 narrative paragraphs)

- [ ] **Step 1: Add mission block and closing line**

After the 4 narrative paragraphs (before closing `</div>`):

```html
  <ScannerBorder class="mission-block">
    <p class="font-mono" style="font-size: 0.7rem; color: var(--color-muted); margin-bottom: 0.75rem; letter-spacing: 0.1em;">// MISSION</p>
    <p style="margin: 0; font-size: 1rem;">
      Aider les gens à se préparer <em>avant</em> que l'IA ne prenne leur job — pas à pleurer <em>après</em>.
    </p>
  </ScannerBorder>

  <p>
    Je ne suis pas l'expert IA ultime. Je suis quelqu'un qui traverse la même zone que vous,
    avec quelques cartes en main — et les cicatrices pour prouver que j'y suis déjà passé.
  </p>
```

- [ ] **Step 2: Verify in browser**

Expected: mission block with scanner border corners visible, closing paragraph rendered below it.

- [ ] **Step 3: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): restore mission block with updated closing line"
```

---

### Task 4: Add professional background badges

**Files:**
- Modify: `app/pages/identite.vue` (new section after `.identity-text` div, before closing `</div>` of the page container)

- [ ] **Step 1: Add the parcours section in the template**

After the closing `</div>` of `.identity-text`:

```html
    <!-- ── PARCOURS ─────────────────────────────────────── -->
    <div class="parcours-section">
      <p class="font-mono parcours-label">// PARCOURS</p>
      <div class="parcours-grid">

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">PwC</p>
          <p class="parcours-role">Audit IT</p>
          <p class="parcours-detail font-mono">Stage</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Nestlé</p>
          <p class="parcours-role">Business Analyst</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Imopac</p>
          <p class="parcours-role">Head of Office Romandie</p>
          <p class="parcours-detail font-mono">Consultant → Dev Xyrion → HO</p>
        </ScannerBorder>

        <ScannerBorder class="parcours-card">
          <p class="parcours-company">Solutions & Funds</p>
          <p class="parcours-role">Deputy Head of IT</p>
          <p class="parcours-detail font-mono">En poste</p>
        </ScannerBorder>

      </div>
    </div>
```

- [ ] **Step 2: Add scoped styles for the parcours section**

In the `<style scoped>` block, append:

```css
/* ── Parcours ─────────────────────────────────────────── */
.parcours-section { margin-top: 3rem; }
.parcours-label {
  font-size: 0.65rem; letter-spacing: 0.15em;
  color: var(--color-muted); margin-bottom: 1.25rem;
}
.parcours-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.parcours-card {
  padding: 1.25rem 1rem;
  background: var(--color-surface);
}
.parcours-company {
  font-family: var(--font-mono);
  font-size: 0.8rem; font-weight: 700;
  color: var(--color-accent);
  margin: 0 0 0.35rem;
  letter-spacing: 0.05em;
}
.parcours-role {
  font-size: 0.85rem;
  color: var(--color-text);
  margin: 0 0 0.35rem;
  line-height: 1.4;
}
.parcours-detail {
  font-size: 0.65rem;
  color: var(--color-muted);
  margin: 0;
  letter-spacing: 0.08em;
}
```

- [ ] **Step 3: Verify in browser**

Expected: 4 cards in a responsive grid, company name in green mono, role in white, detail in muted. Scanner border corners animate in on scroll. No overflow on mobile.

Check mobile (resize to 375px): cards should stack to 2 columns or 1 column depending on viewport.

- [ ] **Step 4: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): add professional background badges (parcours)"
```

---

### Task 5: Add newsletter CTA at the bottom

**Files:**
- Modify: `app/pages/identite.vue` (new section after `.parcours-section`)

- [ ] **Step 1: Add CTA section in the template**

After the closing `</div>` of `.parcours-section`:

```html
    <!-- ── CTA ──────────────────────────────────────────── -->
    <div class="identite-cta">
      <p class="font-mono" style="font-size: 0.65rem; letter-spacing: 0.15em; color: var(--color-muted); margin-bottom: 1rem;">// PROCHAINE ÉTAPE</p>
      <p class="identite-cta-text">
        Tu traverses la même zone&nbsp;?<br>
        <strong class="text-accent">Rejoins les premiers dans la Fréquence.</strong>
      </p>
      <GlitchButton label="Rejoindre la Fréquence" to="/#newsletter" />
    </div>
```

- [ ] **Step 2: Add scoped styles for the CTA**

In the `<style scoped>` block, append:

```css
/* ── CTA ──────────────────────────────────────────────── */
.identite-cta {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(0, 255, 65, 0.12);
  text-align: center;
}
.identite-cta-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-muted);
  margin-bottom: 2rem;
}
```

- [ ] **Step 3: Verify in browser**

Expected: CTA section separated by a subtle green line, text centered, GlitchButton present and clicking it navigates to `/#newsletter`.

- [ ] **Step 4: Update SEO meta description**

In the `<script setup>` block at the top of `identite.vue`, update the `description`:

```ts
useSeoMeta({
  title: 'Identité du Survivant — Mathieu le Survivant de l\'IA',
  description: 'De PwC à Deputy Head of IT, en passant par Nestlé et la PropTech — et un burnout par surutilisation de l\'IA. Voici pourquoi ce site existe.',
})
```

- [ ] **Step 5: Commit**

```bash
git add app/pages/identite.vue
git commit -m "feat(identite): add newsletter CTA section + updated SEO meta"
```

---

### Task 6: Final review pass

- [ ] **Step 1: Full page walkthrough in browser**

Open `http://localhost:3000/identite`. Read the page top to bottom as a first-time visitor.
Check:
- Card subtitle updated ✓
- 4 narrative paragraphs flow naturally ✓
- Mission block visible ✓
- Parcours grid renders correctly at desktop and mobile ✓
- CTA visible at bottom with working link ✓
- No console errors ✓

- [ ] **Step 2: Check mobile at 375px**

Open DevTools, set viewport to 375px. Verify:
- Parcours grid doesn't overflow
- CTA text doesn't clip

- [ ] **Step 3: Commit spec + plan docs**

```bash
git add docs/superpowers/
git commit -m "docs: add identite page redesign spec and implementation plan"
```
