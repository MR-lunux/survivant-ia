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
        relatedKit: z.string().optional(),
      }),
    }),
    outils: defineCollection({
      type: 'page',
      source: 'outils/*.md',
      schema: z.object({
        code: z.string(),
        kind: z.enum(['quiz', 'cheatsheet', 'video', 'fiche', 'calculator']),
        title: z.string(),
        subtitle: z.string(),
        description: z.string(),
        kicker: z.string(),
        parentArticleSlug: z.string(),
        specs: z.array(z.string()).default([]),
        calloutPitch: z.string().optional(),
        data: z.any(),
      }),
    }),
  },
})
