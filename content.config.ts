import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    noticias: defineCollection({
      type: 'page',
      source: 'noticias/**/*.md',
      schema: z.object({
        titulo: z.string(),
        subtitulo: z.string().optional(),
        kicker: z.string(),
        categoria: z.enum(['previa', 'cronica', 'analisis', 'entrevista', 'historia', 'reportaje']),
        autor: z.object({ slug: z.string(), nombre: z.string() }),
        fechaPublicacion: z.string(),
        imagenHero: z.object({ src: z.string(), alt: z.string() }),
        lead: z.string(),
        tags: z.array(z.string()),
      }),
    }),
  },
});
