export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
  ssr: true,
  modules: ['@nuxt/content', '@nuxt/image', '@nuxtjs/sitemap'],
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
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET ?? '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://golgana.net',
      gtmId: process.env.NUXT_PUBLIC_GTM_ID ?? '',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID ?? '',
    },
  },
});
