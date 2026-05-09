<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  verdict?: string
  quadrant?: 'tiens' | 'pilotes' | 'pivotes' | 'mutes'
  risk?: number
  potential?: number
  secteurLabel?: string
}>(), {
  label: 'Mon métier',
  verdict: 'Tu mutes.',
  quadrant: 'mutes',
  risk: 0,
  potential: 0,
  secteurLabel: '',
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
    <!-- Top sage rule -->
    <div
      style="
        width: 80px;
        height: 1px;
        background-color: #6CE3B5;
        margin-bottom: 40px;
      "
    />

    <!-- Kicker -->
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
      <div style="width: 12px; height: 12px; background-color: #6CE3B5;" />
      <span
        style="
          font-family: 'Space Mono', monospace;
          font-size: 22px;
          letter-spacing: 0.22em;
          color: #6CE3B5;
          text-transform: uppercase;
        "
      >Diagnostic IA · {{ label }}</span>
    </div>

    <!-- Big italic verdict -->
    <div
      style="
        font-family: 'Playfair Display', serif;
        font-style: italic;
        font-weight: 400;
        font-size: 120px;
        line-height: 1;
        letter-spacing: -0.02em;
        color: #E8E5DD;
        text-align: center;
        margin-bottom: 40px;
      "
    >{{ verdict }}</div>

    <!-- Scores line -->
    <div style="display: flex; align-items: center; gap: 32px; margin-bottom: 32px;">
      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-family: 'Space Mono', monospace; font-size: 56px; font-weight: 700; color: #FFA630;">{{ risk }}</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #888;">/100</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 18px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; margin-left: 12px;">risque</span>
      </div>

      <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #2A2A2A;">·</span>

      <div style="display: flex; align-items: baseline; gap: 8px;">
        <span style="font-family: 'Space Mono', monospace; font-size: 56px; font-weight: 700; color: #6CE3B5;">{{ potential }}</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 28px; color: #888;">/100</span>
        <span style="font-family: 'Space Mono', monospace; font-size: 18px; letter-spacing: 0.2em; color: #888; text-transform: uppercase; margin-left: 12px;">levier IA</span>
      </div>
    </div>

    <!-- Secteur label (optional) -->
    <div
      v-if="secteurLabel"
      style="
        font-family: 'Space Mono', monospace;
        font-size: 16px;
        letter-spacing: 0.2em;
        color: #888;
        text-transform: uppercase;
        margin-bottom: 40px;
      "
    >{{ secteurLabel }}</div>

    <!-- Bottom sage rule -->
    <div
      style="
        width: 80px;
        height: 1px;
        background-color: #6CE3B5;
        margin-bottom: 40px;
      "
    />

    <!-- Foot: brand mark + URL -->
    <div style="display: flex; align-items: center; gap: 20px;">
      <svg width="40" height="40" viewBox="0 0 1053.4 1058.4">
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
