<script setup lang="ts">
const socials = {
  linkedin: '',
  instagram: '',
  youtube: '',
}
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <AppLogo variant="lockup" />
        <p class="footer-tagline">L'IA ARRIVE. APPRENDS À LA PILOTER.</p>
      </div>

      <div class="footer-links">
        <NuxtLink to="/rapports" data-attr="footer-nav-rapports">Rapports de Survie</NuxtLink>
        <NuxtLink to="/frequence" data-attr="footer-nav-frequence">Rejoindre la Fréquence</NuxtLink>
        <NuxtLink to="/identite" data-attr="footer-nav-identite">Identité du Survivant</NuxtLink>
      </div>

      <div v-if="socials.linkedin || socials.instagram || socials.youtube" class="footer-social">
        <a v-if="socials.linkedin" :href="socials.linkedin" target="_blank" rel="noopener me" aria-label="LinkedIn" data-attr="footer-social-linkedin"><IconLinkedIn /></a>
        <a v-if="socials.instagram" :href="socials.instagram" target="_blank" rel="noopener me" aria-label="Instagram" data-attr="footer-social-instagram"><IconInstagram /></a>
        <a v-if="socials.youtube" :href="socials.youtube" target="_blank" rel="noopener me" aria-label="YouTube" data-attr="footer-social-youtube"><IconYoutube /></a>
      </div>
    </div>

    <div class="container footer-bottom">
      <span class="text-muted font-mono" style="font-size: 0.7rem;">
        © {{ new Date().getFullYear() }} - TRANSMISSION CHIFFRÉE - /rss.xml disponible
      </span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 6rem;
  border-top: 1px solid var(--color-rule);
  padding: 3rem 0 2rem;
  background: var(--color-surface);
}
.footer-inner {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 3rem;
  align-items: start;
  margin-bottom: 2rem;
}
.footer-tagline {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.footer-links a {
  font-size: 0.8rem;
  font-family: var(--font-mono);
  color: var(--color-muted);
  text-decoration: none;
  transition: color 0.15s;
}
.footer-links a:hover { color: var(--color-accent); }
.footer-social {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.footer-social a {
  color: var(--color-muted);
  display: flex;
  transition: color 0.15s;
}
.footer-social a:hover { color: var(--color-accent); }
.footer-bottom { border-top: 1px solid var(--color-surface-2); padding-top: 1rem; }
</style>
