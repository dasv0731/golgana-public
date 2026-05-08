export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
  ssr: true,
  // @nuxt/content desactivado en deploy (sqlite3 native module no compatible
  // con AWS Lambda runtime). Las páginas /noticias y /temas/[slug] están
  // stubbeadas hasta migrarlas al backend AppSync.
  modules: ['@nuxt/image', '@nuxtjs/sitemap'],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  routeRules: {
    '/':                                                  { isr: 3600 },
    '/torneos/':                                          { isr: 86400 },
    '/torneos/mundial/':                                  { prerender: true },
    '/torneos/mundial/2026/':                             { isr: 1800 },
    '/torneos/mundial/2026/grupos/**':                    { isr: 600 },
    '/torneos/mundial/2026/calendario':                   { isr: 1800 },
    '/torneos/mundial/2026/goleadores':                   { isr: 1800 },
    '/torneos/mundial/2026/sedes':                        { prerender: true },
    '/torneos/mundial/2026/octavos/**':                   { isr: 600 },
    '/torneos/mundial/2026/cuartos/**':                   { isr: 600 },
    '/torneos/mundial/2026/semifinales/**':               { isr: 600 },
    '/torneos/mundial/2026/final/**':                     { isr: 600 },
    '/torneos/mundial/campeones':                         { prerender: true },
    '/selecciones/':                                      { isr: 86400 },
    '/selecciones/**':                                    { isr: 1800 },
    '/jugadores/**':                                      { isr: 3600 },
    '/noticias/':                                         { isr: 600 },
    '/noticias/**':                                       { prerender: true },
    '/temas/**':                                          { isr: 3600 },
    '/acerca-de':                                         { prerender: true },
    '/contacto':                                          { prerender: true },
    '/politica-privacidad':                               { prerender: true },
    '/terminos':                                          { prerender: true },
  },
  sitemap: {
    // hostname is read from runtimeConfig.public.siteUrl by @nuxtjs/sitemap v7
    defaults: { changefreq: 'weekly', priority: 0.7 },
    exclude: ['/api/**', '/dev/**'],
    // Note: dynamic URLs are sourced via the @nuxtjs/sitemap module's runtime hook
    // For build-time URL injection, see server/utils/sitemap-urls.ts and the sources config
    sources: ['/api/__sitemap__/urls'],
  },
  typescript: { strict: true },
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
    '~/assets/css/golgana-pro.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'es-EC' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },
  nitro: {
    preset: 'aws-amplify',
    prerender: { crawlLinks: true, routes: ['/'] },
  },
  runtimeConfig: {
    useBackend: process.env.NUXT_USE_BACKEND === 'true',
    cmsApiUrl: process.env.NUXT_CMS_API_URL ?? '',
    cmsApiKey: process.env.NUXT_CMS_API_KEY ?? '',
    appsyncUrl: process.env.NUXT_APPSYNC_URL ?? '',
    appsyncApiKey: process.env.NUXT_APPSYNC_API_KEY ?? '',
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET ?? '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://golgana.net',
      gtmId: process.env.NUXT_PUBLIC_GTM_ID ?? '',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID ?? '',
    },
  },
});
