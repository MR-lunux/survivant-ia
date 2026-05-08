<!-- app/pages/outils/index.vue -->
<script setup lang="ts">
const { data: kits } = await useAsyncData('all-kits', () =>
  queryCollection('outils')
    .order('id', 'ASC')
    .all()
)

const kitCount = computed(() => kits.value?.length ?? 0)
</script>

<template>
  <div class="container" style="padding-top: 4rem; padding-bottom: 6rem;">
    <Breadcrumbs :items="[{ label: 'Boîte à Outils' }]" />

    <div class="page-header">
      <KickerLabel>LA BOÎTE À OUTILS</KickerLabel>
      <h1>Des <em>instruments de poche</em><br>pour piloter l'IA dans ton métier.</h1>
      <p>Tests, calculateurs, cheatsheets, fiches pratiques. Chaque outil prolonge un article : tu lis pour comprendre, tu utilises l'outil pour appliquer. Tout est gratuit, sans inscription.</p>
    </div>

    <div class="counter-bar">
      <span class="count"><strong>{{ kitCount }}</strong> outil{{ kitCount > 1 ? 's' : '' }} disponible{{ kitCount > 1 ? 's' : '' }} · <span class="muted">+ d'autres en route</span></span>
      <span>RÉSULTATS PRIVÉS · AUCUNE COLLECTE</span>
    </div>

    <div class="kits-grid">
      <KitCard
        v-for="(kit, i) in kits ?? []"
        :key="kit.id"
        :kit="{
          id: kit.id,
          kind: kit.kind,
          title: kit.title,
          description: kit.description,
          specs: kit.specs,
          path: kit.path,
        }"
        :position="i + 1"
      />
      <KitCard variant="coming" />
    </div>

    <p class="bottom-note">
      UN OUTIL EN TÊTE QUE TU AIMERAIS TROUVER ICI ?
      <a href="mailto:mathieu@survivant-ia.ch?subject=Idée%20d'outil%20pour%20la%20Boîte">ÉCRIS-MOI →</a>
    </p>
  </div>
</template>

<style scoped>
.page-header { margin-bottom: 3.5rem; max-width: 720px; }
.page-header h1 {
  font-family: var(--font-serif); font-style: italic;
  font-weight: 400;
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  line-height: 1.1;
  margin: 1.25rem 0;
}
.page-header h1 em { color: var(--color-accent); font-style: italic; }
.page-header p {
  font-size: 1.05rem;
  color: var(--color-text-soft);
  line-height: 1.65;
  max-width: 60ch;
}
.counter-bar {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
  border-top: 1px dashed var(--color-hairline);
  border-bottom: 1px dashed var(--color-hairline);
  padding: 0.85rem 0;
  margin-bottom: 2.5rem;
  display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
}
.counter-bar .count strong { color: var(--color-accent); font-weight: 600; }
.counter-bar .muted { color: var(--color-muted-soft); }
.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1.5rem;
}
.bottom-note {
  margin-top: 5rem;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.bottom-note a { color: var(--color-accent); text-decoration: none; }
</style>
