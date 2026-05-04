<!-- app/components/RapportsBookshelf.vue -->
<script setup lang="ts">
interface CategoryConfig {
  slug: string
  vol: string
  nameAccent: string
  nameRest: string
  desc: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'soft-skills',
    vol: 'I',
    nameAccent: 'Soft',
    nameRest: 'Skills',
    desc: 'Les compétences que l\'IA n\'a pas. Ce qui te rend irremplaçable face aux modèles.',
  },
  {
    slug: 'comprendre-ia',
    vol: 'II',
    nameAccent: 'Comprendre',
    nameRest: 'l\'IA',
    desc: 'Ce qu\'elle fait, comment, et où ça te touche directement dans ton métier.',
  },
  {
    slug: 'cas-pratiques',
    vol: 'III',
    nameAccent: 'Cas',
    nameRest: 'pratiques',
    desc: 'Des outils testés sur le terrain. Pas des promesses - des workflows qui marchent.',
  },
]

const { data: allArticles } = await useAsyncData('rapports-bookshelf', () =>
  queryCollection('rapports').order('date', 'DESC').all()
)

const articlesByCategory = computed(() => {
  const grouped: Record<string, any[]> = {}
  for (const cat of CATEGORIES) {
    grouped[cat.slug] = (allArticles.value ?? [])
      .filter((a: any) => a.category === cat.slug)
      .slice(0, 4)
  }
  return grouped
})

const totals = computed(() => {
  const t: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    t[cat.slug] = (allArticles.value ?? []).filter((a: any) => a.category === cat.slug).length
  }
  return t
})

const totalCount = computed(() => Object.values(totals.value).reduce((s, n) => s + n, 0))

function formatDate(date: string | Date): string {
  const d = new Date(date)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(2)
  return `${dd}.${mm}.${yy}`
}

const rows = ref<HTMLDetailsElement[]>([])

function onToggle(openedRow: HTMLDetailsElement) {
  if (openedRow.open) {
    rows.value.forEach(r => { if (r !== openedRow) r.open = false })
  }
}
</script>

<template>
  <section class="rapports" aria-labelledby="rapports-heading">
    <div class="rapports-head" data-reveal>
      <h2 id="rapports-heading" class="rapports-title">
        La veille hebdo <em>pour passer de subir l'IA à la piloter</em>.
      </h2>
      <span class="rapports-meta">3 sections · {{ totalCount }} éditions</span>
    </div>

    <div class="rapports-bookshelf" data-reveal data-reveal-delay="1">
      <details
        v-for="cat in CATEGORIES"
        :key="cat.slug"
        ref="rows"
        class="rb-row"
        :data-attr="`bookshelf-${cat.slug}`"
        @toggle="onToggle($event.target as HTMLDetailsElement)"
      >
        <summary class="rb-summary">
          <div class="megaNum">{{ cat.vol }}</div>
          <div class="info">
            <span class="tagline">Volume · {{ cat.vol }}</span>
            <span class="name"><em>{{ cat.nameAccent }}</em> {{ cat.nameRest }}</span>
            <span class="desc">{{ cat.desc }}</span>
            <span class="count">
              <b>{{ totals[cat.slug] }}</b> rapports disponibles<span class="chevron">›</span>
            </span>
          </div>
        </summary>

        <ul class="rb-branch">
          <li
            v-for="art in articlesByCategory[cat.slug]"
            :key="art.path"
            class="rb-branch-item"
          >
            <span class="b-date">{{ formatDate(art.date) }}</span>
            <NuxtLink :to="art.path" class="b-title" :data-attr="`bookshelf-art-${art.path}`">{{ art.title }}</NuxtLink>
          </li>
          <li class="rb-branch-item see-all">
            <NuxtLink :to="`/rapports?cat=${cat.slug}`" class="b-title">
              Voir les {{ totals[cat.slug] }} rapports en {{ cat.nameAccent }} {{ cat.nameRest }} →
            </NuxtLink>
          </li>
        </ul>
      </details>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ──────────────────────────────────── */
.rapports {
  padding: 2rem 0 3rem;
}

/* ── Head ─────────────────────────────────────── */
.rapports-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1.5rem;
  border-bottom: 1px solid var(--color-rule);
  padding-bottom: 1.25rem;
}
.rapports-title {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-size: 1.6rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.005em;
  color: var(--color-text);
  line-height: 1.25;
  max-width: 32ch;
}
.rapports-title em {
  font-style: italic;
  color: var(--color-muted);
  font-weight: 400;
}
.rapports-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--color-muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* ── Bookshelf ────────────────────────────────── */
.rapports-bookshelf {
  border-top: 1px solid var(--color-accent);
  border-bottom: 1px solid var(--color-accent);
}
.rb-row {
  border-bottom: 1px solid var(--color-rule);
  transition: background 0.25s ease;
}
.rb-row:last-of-type { border-bottom: none; }
.rb-row:hover  { background: rgba(91, 163, 122, 0.03); }
.rb-row[open]  { background: rgba(91, 163, 122, 0.05); }

.rb-summary {
  list-style: none;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  align-items: stretch;
  min-height: 9rem;
}
.rb-summary::-webkit-details-marker { display: none; }

.megaNum {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(5rem, 12vw, 9rem);
  line-height: 0.85;
  color: var(--color-accent);
  letter-spacing: -0.02em;
  padding: 1.5rem 1.5rem 1.25rem;
  align-self: end;
  transition: color 0.3s ease;
}
.rb-row[open] .megaNum,
.rb-row:hover .megaNum { color: var(--color-text); }

.info {
  padding: 1.75rem 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  border-left: 1px solid var(--color-rule);
  transition: border-left-color 0.25s ease;
}
.rb-row[open] .info,
.rb-row:hover .info { border-left-color: var(--color-accent); }

.tagline {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--color-accent);
  text-transform: uppercase;
}
.name {
  font-family: var(--font-serif);
  font-variation-settings: "opsz" 144;
  font-weight: 500;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  color: var(--color-text);
  line-height: 1.05;
  letter-spacing: -0.01em;
}
.name em {
  font-style: italic;
  color: var(--color-accent);
  font-weight: 400;
}
.desc {
  font-family: var(--font-serif-body);
  font-size: 0.95rem;
  color: var(--color-muted);
  max-width: 36ch;
  line-height: 1.5;
  margin-top: 0.25rem;
}
.count {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--color-text);
  margin-top: 0.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.count b {
  color: var(--color-accent);
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 600;
  font-size: 1.35rem;
}
.chevron {
  color: var(--color-accent);
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.3rem;
  margin-left: 0.4rem;
  transition: transform 0.3s ease;
}
.rb-row[open] .chevron { transform: rotate(90deg); }

/* ── Branch reveal ───────────────────────────── */
.rb-branch {
  list-style: none;
  margin: 0;
  padding: 1.75rem 1.5rem 1.5rem 4rem;
  position: relative;
  border-top: 1px solid var(--color-rule);
}
.rb-branch::before {
  content: '';
  position: absolute;
  top: 0.85rem; bottom: 1.5rem;
  left: 1.85rem;
  width: 2px;
  background: var(--color-accent);
  transform-origin: top;
  animation: branch-line 0.5s cubic-bezier(0.65, 0, 0.35, 1);
}
@keyframes branch-line {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}

.rb-branch-item {
  position: relative;
  padding: 0.7rem 0;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 1px dashed var(--color-hairline);
  animation: item-appear 0.4s ease-out backwards;
}
.rb-branch-item:last-child { border-bottom: none; }
.rb-branch-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -2.15rem;
  width: 1.5rem;
  height: 2px;
  background: var(--color-accent);
  transform-origin: left;
  animation: arm-grow 0.3s ease-out backwards;
}
@keyframes item-appear {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes arm-grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
.rb-branch-item:nth-child(1)         { animation-delay: 0.18s; }
.rb-branch-item:nth-child(1)::before { animation-delay: 0.18s; }
.rb-branch-item:nth-child(2)         { animation-delay: 0.28s; }
.rb-branch-item:nth-child(2)::before { animation-delay: 0.28s; }
.rb-branch-item:nth-child(3)         { animation-delay: 0.38s; }
.rb-branch-item:nth-child(3)::before { animation-delay: 0.38s; }
.rb-branch-item:nth-child(4)         { animation-delay: 0.48s; }
.rb-branch-item:nth-child(4)::before { animation-delay: 0.48s; }
.rb-branch-item:nth-child(5)         { animation-delay: 0.58s; }
.rb-branch-item:nth-child(5)::before { animation-delay: 0.58s; }

.b-date {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--color-muted);
  flex-shrink: 0;
  width: 5.5rem;
}
.b-title {
  font-family: var(--font-serif-body);
  font-size: 1rem;
  color: var(--color-text);
  text-decoration: none;
  flex: 1;
  line-height: 1.4;
  transition: color 0.2s;
}
.b-title:hover { color: var(--color-accent); }

.rb-branch-item.see-all {
  margin-top: 0.85rem;
  padding-top: 1.1rem;
  border-top: 1px solid var(--color-accent);
  border-bottom: none;
}
.rb-branch-item.see-all .b-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.95rem;
  color: var(--color-accent);
}

/* ── Responsive ───────────────────────────────── */
@media (max-width: 720px) {
  .rb-summary {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .megaNum {
    font-size: 4.5rem;
    padding: 1rem 1rem 0.5rem;
    align-self: start;
  }
  .info {
    border-left: none;
    border-top: 1px solid var(--color-rule);
    padding: 1rem 1rem 1.25rem;
  }
  .rb-branch { padding-left: 3.5rem; }
  .rb-branch::before { left: 1.5rem; }
  .rb-branch-item::before { left: -2rem; }
}

@media (prefers-reduced-motion: reduce) {
  .rb-branch::before,
  .rb-branch-item,
  .rb-branch-item::before { animation: none !important; }
}
</style>
