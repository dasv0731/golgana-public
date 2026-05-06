import type { SeoBlock } from '~/types/api';

export function useSeo(seo: SeoBlock, opts: { canonical?: string; ogImage?: string } = {}) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const url = `${config.public.siteUrl}${route.path}`;

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.ogTitle ?? seo.title,
    ogDescription: seo.ogDescription ?? seo.description,
    ogImage: seo.ogImageOverride?.src ?? opts.ogImage,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    robots: seo.noindex ? 'noindex' : 'index, follow',
  });

  useHead({
    link: [{ rel: 'canonical', href: seo.canonicalOverride ?? opts.canonical ?? url }],
  });
}
