<!-- app/components/KickerLabel.vue -->
<template>
  <span class="kicker">
    <span class="kicker-glyph" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.6em;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  color: var(--color-accent);
  text-transform: uppercase;
  line-height: 1;
}

.kicker-glyph {
  display: inline-block;
  width: 0.65em;
  height: 0.65em;
  background: var(--color-accent);
  box-shadow: 0 0 6px rgba(0, 255, 65, 0.55);
  transform-origin: center;
  will-change: transform;
  animation: kicker-spin 8s linear infinite;
  flex-shrink: 0;
}

@keyframes kicker-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .kicker-glyph { animation: none; }
}
</style>
