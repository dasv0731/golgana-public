<script setup lang="ts">
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryCollection('noticias').path(`/noticias/${slug}`).first(),
);

if (!article.value) throw createError({ statusCode: 404 });

useSeo({
  title: article.value.titulo,
  description: article.value.lead,
});

const config = useRuntimeConfig();

injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Noticias', url: config.public.siteUrl + '/noticias/' },
    { name: article.value.titulo },
  ]),
);
</script>

<template>
  <div v-if="article">
    <div class="pro-container">
      <Breadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Noticias', to: '/noticias/' },
        { label: article.titulo },
      ]" />
    </div>

    <article class="pro-section pro-container">
      <header style="margin-bottom:32px;max-width:720px;margin-left:auto;margin-right:auto">
        <span class="pro-hero__kicker">{{ article.kicker }}</span>
        <h1 style="font-family:var(--font-display);font-size:48px;line-height:1.1;margin:12px 0">{{ article.titulo }}</h1>
        <p style="font-size:18px;color:var(--color-text-muted)">{{ article.lead }}</p>
        <div style="margin-top:16px;font-size:13px;color:var(--color-text-muted)">
          {{ article.autor.nombre }} · {{ new Date(article.fechaPublicacion).toLocaleDateString('es-EC') }}
        </div>
      </header>
      <img v-if="article.imagenHero" :src="article.imagenHero.src" :alt="article.imagenHero.alt" style="width:100%;max-width:1200px;display:block;margin:0 auto;border-radius:14px;margin-bottom:32px" />
      <ArticleBody>
        <ContentRenderer :value="article" />
      </ArticleBody>
    </article>
  </div>
</template>
