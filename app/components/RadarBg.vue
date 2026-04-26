<!-- app/components/RadarBg.vue -->
<template>
  <div class="radar-bg" aria-hidden="true">
    <svg class="radar-rings" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice">
      <circle cx="250" cy="250" r="70"  stroke="#00FF41" stroke-width="0.5" fill="none" opacity="0.3"/>
      <circle cx="250" cy="250" r="130" stroke="#00FF41" stroke-width="0.5" fill="none" opacity="0.2"/>
      <circle cx="250" cy="250" r="190" stroke="#00FF41" stroke-width="0.5" fill="none" opacity="0.14"/>
      <circle cx="250" cy="250" r="250" stroke="#00FF41" stroke-width="0.5" fill="none" opacity="0.08"/>
      <line x1="250" y1="10"  x2="250" y2="490" stroke="#00FF41" stroke-width="0.5" opacity="0.12"/>
      <line x1="10"  y1="250" x2="490" y2="250" stroke="#00FF41" stroke-width="0.5" opacity="0.12"/>
    </svg>
    <div class="radar-sweep" />
    <div class="radar-line-wrap">
      <div class="radar-line" />
    </div>
  </div>
</template>

<style scoped>
.radar-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.radar-rings {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.radar-sweep {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from -90deg at 50% 50%,
    rgba(0, 255, 65, 0.10) 0deg,
    rgba(0, 255, 65, 0.03) 55deg,
    transparent 85deg,
    transparent 360deg
  );
  animation: radar-spin 6s linear infinite;
}
.radar-line-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: radar-spin 6s linear infinite;
}
.radar-line {
  position: absolute;
  top: 0;
  left: calc(50% - 0.5px);
  width: 1px;
  height: 50%;
  transform-origin: bottom center;
  background: linear-gradient(to top, transparent 0%, rgba(0, 255, 65, 0.6) 100%);
}
@keyframes radar-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .radar-sweep, .radar-line-wrap { animation: none; }
}
</style>
