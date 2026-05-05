<template>
  <div class="layout">
    <ClientOnly><ParticleCanvas /></ClientOnly>
    <ScrollProgress />
    <AppHeader />
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout { min-height: 100vh; display: flex; flex-direction: column; }
.main-content { flex: 1; }

/* Sur mobile : le header passe en position: fixed pour éviter le gap
   de la URL bar iOS Safari. On compense la hauteur ici. */
@media (max-width: 640px) {
  .main-content {
    padding-top: 96px;
  }
}
</style>
