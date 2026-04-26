// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    rapports: defineCollection({
      type: 'page',
      source: 'rapports/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.enum(['soft-skills', 'comprendre-ia', 'cas-pratiques']),
      }),
    }),
  },
})
