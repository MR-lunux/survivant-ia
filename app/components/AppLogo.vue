<template>
  <component
    :is="tag ?? 'span'"
    class="logo"
    :class="`logo--${variant ?? 'mark'}`"
    role="img"
    aria-label="Survivant-IA"
  >
    <svg class="logo-mark" viewBox="0 0 1053.4 1058.4" fill="currentColor" aria-hidden="true">
      <polygon points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"/>
      <polygon points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"/>
    </svg>
    <span v-if="(variant ?? 'mark') === 'lockup'" class="logo-text">SURVIVANT-IA</span>
  </component>
</template>

<script setup lang="ts">
defineProps<{ variant?: 'mark' | 'lockup'; tag?: string }>()
</script>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  line-height: 1;
}
.logo-mark {
  width: auto;
  height: 1.6em;
  color: var(--color-accent);
  flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--color-text);
  white-space: nowrap;
}
@media (max-width: 640px) {
  .logo--lockup .logo-text { display: none; }
  .logo-mark { height: 1.4em; }
}
</style>
