<script setup lang="ts">
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: tema } = await useFetch<any>(`/api/temas/${slug}`);

const { data: articulos } = await useAsyncData(`tema-${slug}`, async () => {
  try {
    const all = await queryCollection('noticias').order('fechaPublicacion', 'DESC').all();
    return all.filter((a: any) => Array.isArray(a.tags) && a.tags.includes(slug));
  } catch {
    return [];
  }
});

if (!tema.value) throw createError({ statusCode: 404 });

useSeo(tema.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Temas', url: config.public.siteUrl + '/temas/' },
    { name: tema.value.nombre },
  ]),
  buildItemList((articulos.value ?? []).map((a: any) => ({ name: a.titulo, url: `${config.public.siteUrl}${a.path}` }))),
]);
</script>

<template>
  <div v-if="tema">
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Temas', to: '/temas/' }, { label: tema.nombre }]" />
    </div>
    <ProHero kicker="Tema" :title="tema.nombre" :lead="tema.descripcion" />
    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Artículos</h2>
      </div>
      <BentoGrid v-if="articulos?.length">
        <EditorialCard
          v-for="a in articulos"
          :key="a.path"
          :kicker="a.kicker"
          :title="a.titulo"
          :href="a.path"
          :image="a.imagenHero"
          :meta="`${a.autor.nombre} · ${new Date(a.fechaPublicacion).toLocaleDateString('es-EC')}`"
        />
      </BentoGrid>
      <p v-else>Sin artículos publicados sobre este tema todavía.</p>
    </section>
  </div>
</template>
