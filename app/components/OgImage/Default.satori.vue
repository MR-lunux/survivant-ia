<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  titleAccent?: string
  kicker?: string
}>(), {
  title: 'Survivant-IA',
  titleAccent: '',
  kicker: '',
})
</script>

<template>
  <div
    style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background-color: #0F0F0E;
      color: #E8E5DD;
      font-family: 'Inter', sans-serif;
    "
  >
    <!-- Top rule -->
    <div
      style="
        width: 80px;
        height: 1px;
        background-color: #6CE3B5;
        margin-bottom: 56px;
      "
    />

    <!-- Title (Playfair Italic, optional accent in menthe) -->
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 400;
        font-size: 72px;
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: #E8E5DD;
        max-width: 920px;
      "
    >
      <span style="margin-right: 0.3em;">{{ title }}</span>
      <span v-if="titleAccent" style="color: #6CE3B5;">{{ titleAccent }}</span>
    </div>

    <!-- Bottom rule -->
    <div
      style="
        width: 80px;
        height: 1px;
        background-color: #6CE3B5;
        margin-top: 56px;
        margin-bottom: 40px;
      "
    />

    <!-- Foot: logo mark + URL -->
    <div
      style="
        display: flex;
        align-items: center;
        gap: 20px;
      "
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 1053.4 1058.4"
      >
        <polygon
          fill="#6CE3B5"
          points="40.7,1019.2 39.7,863.2 234.2,831.7 234.2,604.7 39.7,573.2 39.7,418.2 1014.2,640.7 1011.7,797.2 40.7,1019.2"
        />
        <polygon
          fill="#6CE3B5"
          points="1013.7,256.2 39.7,256.2 39.2,39.7 1013.7,39.2 1013.7,256.2"
        />
      </svg>
      <span
        style="
          font-family: 'Space Mono', monospace;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #C5C2BB;
          text-transform: uppercase;
        "
      >survivant-ia.ch</span>
    </div>
  </div>
</template>
