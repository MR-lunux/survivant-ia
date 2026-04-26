<template>
  <header class="app-header">
    <div class="container header-inner">
      <NuxtLink to="/" class="logo">
        <span class="logo-bracket">[</span>
        <span class="logo-text">SURVIVANT</span>
        <span class="logo-bracket">]</span>
      </NuxtLink>

      <nav v-if="!isHome" class="nav">
        <NuxtLink to="/rapports" class="nav-link">Rapports de Survie</NuxtLink>
        <NuxtLink to="/frequence" class="nav-link">La Fréquence</NuxtLink>
        <NuxtLink to="/identite" class="nav-link">Identité</NuxtLink>
      </nav>

      <div class="social-links">
        <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
          <IconLinkedIn />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">
          <IconInstagram />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">
          <IconYoutube />
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 255, 65, 0.15);
  background: rgba(13, 13, 13, 0.9);
  backdrop-filter: blur(8px);
  animation: headerSlideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes headerSlideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 2rem;
}
.logo {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-text);
  text-decoration: none;
  white-space: nowrap;
}
.logo-bracket { color: var(--color-accent); }
.nav { display: flex; gap: 2rem; }
.nav-link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-muted);
  text-decoration: none;
  position: relative;
  transition: color 0.15s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 0; height: 1px;
  background: var(--color-accent);
  transition: width 0.25s ease;
}
.nav-link:hover,
.nav-link.router-link-active { color: var(--color-accent); }
.nav-link:hover::after,
.nav-link.router-link-active::after { width: 100%; }
.social-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.social-links a {
  color: var(--color-muted);
  display: flex;
  align-items: center;
  transition: color 0.15s;
}
.social-links a:hover { color: var(--color-accent); }

@media (max-width: 640px) {
  .header-inner {
    flex-wrap: wrap;
    height: auto;
    padding: 0.75rem 0;
    gap: 0.5rem;
  }
  .nav {
    order: 3;
    width: 100%;
    gap: 1.25rem;
    padding-bottom: 0.5rem;
  }
  .nav-link { font-size: 0.65rem; }
  .social-links { display: none; }
}
</style>
