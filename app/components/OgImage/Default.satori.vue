<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  kicker?: string
}>(), {
  title: 'Survivant-IA',
  kicker: '// ZONE ANTI-OBSOLESCENCE',
})
</script>

<template>
  <div
    style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 80px; background-color: #0D0D0D; color: #E0E0E0; font-family: 'Inter', sans-serif; position: relative; overflow: hidden;"
  >
    <!-- Grid background -->
    <div
      style="position: absolute; inset: 0; background-image: linear-gradient(rgba(0,255,65,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.06) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);"
    />

    <!-- Corner brackets (top-left & top-right) -->
    <div
      style="position: absolute; top: 32px; left: 32px; width: 28px; height: 28px; border-top: 2px solid #00FF41; border-left: 2px solid #00FF41;"
    />
    <div
      style="position: absolute; top: 32px; right: 32px; width: 28px; height: 28px; border-top: 2px solid #00FF41; border-right: 2px solid #00FF41;"
    />
    <div
      style="position: absolute; bottom: 32px; left: 32px; width: 28px; height: 28px; border-bottom: 2px solid #00FF41; border-left: 2px solid #00FF41;"
    />
    <div
      style="position: absolute; bottom: 32px; right: 32px; width: 28px; height: 28px; border-bottom: 2px solid #00FF41; border-right: 2px solid #00FF41;"
    />

    <!-- Top row: status -->
    <div style="display: flex; align-items: center; gap: 16px; position: relative; z-index: 1;">
      <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #00FF41; box-shadow: 0 0 12px #00FF41;" />
      <span
        style="font-family: 'Space Mono', monospace; font-size: 22px; letter-spacing: 0.18em; color: #888888; text-transform: uppercase;"
      >TRANSMISSION EN COURS</span>
    </div>

    <!-- Middle: kicker + title -->
    <div style="display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 1; max-width: 100%;">
      <span
        style="font-family: 'Space Mono', monospace; font-size: 26px; letter-spacing: 0.18em; color: #00FF41; text-transform: uppercase;"
      >{{ kicker }}</span>
      <h1
        style="font-family: 'Space Mono', monospace; font-size: 76px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FFFFFF; margin: 0; max-width: 1000px;"
      >{{ title }}</h1>
    </div>

    <!-- Bottom: brand bar -->
    <div
      style="display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 1; padding-top: 24px; border-top: 1px solid rgba(0,255,65,0.2);"
    >
      <span
        style="font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; letter-spacing: 0.12em; color: #FFFFFF;"
      >
        <span style="color: #00FF41;">[</span> SURVIVANT-IA <span style="color: #00FF41;">]</span>
      </span>
      <span
        style="font-family: 'Space Mono', monospace; font-size: 22px; letter-spacing: 0.1em; color: #888888;"
      >survivant-ia.ch</span>
    </div>
  </div>
</template>
