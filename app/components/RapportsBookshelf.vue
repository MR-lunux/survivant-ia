<!-- app/components/RapportsBookshelf.vue -->
<script setup lang="ts">
interface CategoryConfig {
  slug: string
  vol: string
  num: string
  name: string
  desc: string
}

const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'soft-skills',
    vol: 'I', num: '01',
    name: 'Soft Skills',
    desc: 'Les compétences que l\'IA n\'a pas. Ce qui te rend irremplaçable face aux modèles.',
  },
  {
    slug: 'comprendre-ia',
    vol: 'II', num: '02',
    name: 'Comprendre l\'IA',
    desc: 'Ce qu\'elle fait, comment, et où ça te touche directement dans ton métier.',
  },
  {
    slug: 'cas-pratiques',
    vol: 'III', num: '03',
    name: 'Cas Pratiques',
    desc: 'Des outils testés sur le terrain. Pas des promesses — des workflows qui marchent.',
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
  <section class="rapports-bookshelf">
    <div class="rb-masthead">
      <span class="rb-title">Rapports de Survie · <em>la veille hebdo pour prendre le virage de l'IA</em></span>
      <span class="rb-meta">3 SECTIONS · {{ totalCount }} ÉDITIONS · MAJ HEBDO</span>
    </div>

    <details
      v-for="(cat, i) in CATEGORIES"
      :key="cat.slug"
      ref="rows"
      class="rb-row"
      :open="false"
      :data-attr="`bookshelf-${cat.slug}`"
      @toggle="onToggle($event.target as HTMLDetailsElement)"
    >
      <summary class="rb-summary">
        <div class="megaNum">{{ cat.num }}</div>
        <div class="info">
          <span class="tagline">Vol. {{ cat.vol }} · Bibliothèque de survie</span>
          <span class="name">{{ cat.name }}</span>
          <span class="desc">{{ cat.desc }}</span>
          <span class="count">
            <b>{{ totals[cat.slug] }}</b> rapports disponibles
            <span class="chevron">›</span>
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
            ▸ Voir les {{ totals[cat.slug] }} rapports en {{ cat.name.toUpperCase() }} →
          </NuxtLink>
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.rapports-bookshelf {
  border-top: 6px solid var(--color-accent);
  border-bottom: 6px solid var(--color-accent);
}

.rb-masthead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  flex-wrap: wrap;
  gap: 1rem;
}
.rb-title {
  font-size: 0.95rem;
  font-weight: 900;
  color: var(--color-text);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.rb-title em {
  font-style: italic;
  color: var(--color-accent);
  font-weight: 700;
}
.rb-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.rb-row {
  border-bottom: 1px solid rgba(0, 255, 65, 0.3);
  background: var(--color-bg);
  transition: background 0.18s ease;
}
.rb-row:last-of-type { border-bottom: none; }
.rb-row:hover { background: rgba(0, 255, 65, 0.03); }
.rb-row[open] { background: rgba(0, 255, 65, 0.05); }

.rb-summary {
  list-style: none;
  cursor: pointer;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  min-height: 11rem;
}
.rb-summary::-webkit-details-marker { display: none; }

.megaNum {
  font-size: clamp(7rem, 18vw, 13rem);
  font-weight: 900;
  line-height: 0.82;
  color: var(--color-accent);
  letter-spacing: -0.08em;
  padding: 1.5rem 1.5rem 1.25rem;
  text-align: left;
  transition: color 0.2s ease;
  align-self: end;
}
.rb-row[open] .megaNum,
.rb-row:hover .megaNum { color: var(--color-text); }

.info {
  padding: 1.75rem 2rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  border-left: 1px solid rgba(0, 255, 65, 0.3);
  transition: border-left-color 0.2s ease;
}
.rb-row[open] .info,
.rb-row:hover .info { border-left-color: var(--color-accent); }

.tagline {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
}
.name {
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  font-weight: 900;
  color: var(--color-text);
  line-height: 0.95;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.desc {
  font-size: 0.92rem;
  color: var(--color-muted);
  max-width: 38ch;
  line-height: 1.4;
  margin-top: 0.25rem;
}
.count {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  color: var(--color-text);
  text-transform: uppercase;
  margin-top: 0.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}
.count b {
  color: var(--color-accent);
  font-weight: 900;
  font-size: 1.6rem;
  line-height: 1;
}
.chevron {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--color-accent);
  transition: transform 0.3s ease;
}
.rb-row[open] .chevron { transform: rotate(90deg); }

/* Branch reveal */
.rb-branch {
  list-style: none;
  padding: 1.75rem 1.5rem 1.5rem 4.5rem;
  position: relative;
  border-top: 1px solid rgba(0, 255, 65, 0.3);
}
.rb-branch::before {
  content: '';
  position: absolute;
  top: 0.85rem; bottom: 1.5rem;
  left: 2.25rem;
  width: 4px;
  background: var(--color-accent);
  transform-origin: top;
  animation: branch-line-grow 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
@keyframes branch-line-grow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}

.rb-branch-item {
  position: relative;
  padding: 0.7rem 0;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 1px solid rgba(0, 255, 65, 0.12);
  animation: branch-item-appear 0.35s ease-out backwards;
}
.rb-branch-item:last-child { border-bottom: none; }
.rb-branch-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -2.25rem;
  width: 1.5rem;
  height: 4px;
  background: var(--color-accent);
  transform-origin: left;
  animation: branch-arm-grow 0.3s ease-out backwards;
}
@keyframes branch-item-appear {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes branch-arm-grow {
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
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  flex-shrink: 0;
  width: 5rem;
}
.b-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  flex: 1;
  line-height: 1.35;
}
.b-title:hover { color: var(--color-accent); }

.rb-branch-item.see-all {
  border-top: 4px solid var(--color-accent);
  border-bottom: none;
  margin-top: 0.85rem;
  padding-top: 1.25rem;
}
.rb-branch-item.see-all .b-title {
  color: var(--color-accent);
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .rb-summary { grid-template-columns: 1fr; min-height: auto; }
  .megaNum {
    font-size: 5.5rem;
    padding: 1.25rem 1.25rem 0.5rem;
    align-self: start;
  }
  .info {
    border-left: none;
    border-top: 1px solid rgba(0, 255, 65, 0.3);
    padding: 1.25rem 1.25rem 1.5rem;
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
