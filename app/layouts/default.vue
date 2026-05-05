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
   de la URL bar iOS Safari. On compense la hauteur ici, en incluant
   le safe-area-inset-top (zone du notch sur iPhone à notch / Dynamic
   Island) puisque le header s'étend jusqu'en haut du viewport. */
@media (max-width: 640px) {
  .main-content {
    padding-top: calc(96px + env(safe-area-inset-top, 0));
  }
}
</style>
