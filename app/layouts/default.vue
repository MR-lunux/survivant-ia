<template>
  <div class="layout">
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
</style>
