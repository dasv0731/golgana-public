import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    // Empty placeholder — actual `noticias` collection will be added in Task 24
    noticias: defineCollection({
      type: 'page',
      source: 'noticias/**/*.md',
      schema: z.object({
        titulo: z.string().optional(),
        kicker: z.string().optional(),
        fechaPublicacion: z.string().optional(),
      }),
    }),
  },
});
