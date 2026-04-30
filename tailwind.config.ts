// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/pages/**/*.{vue,js,ts}',
    './app/layouts/**/*.{vue,js,ts}',
    './app/app.vue',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#141414',
        'surface-2': '#1A1A1A',
        text: '#E0E0E0',
        muted: '#666666',
        accent: '#00FF41',
        // Status tokens (4 levels — keep `danger` value unchanged)
        danger: '#FF3E3E',
        mutation: '#FFA630',
        protege: '#5BC0EB',
        croissance: '#3DDC84',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  corePlugins: {
    container: false,
  },
} satisfies Config
