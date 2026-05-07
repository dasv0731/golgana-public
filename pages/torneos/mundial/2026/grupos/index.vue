<script setup lang="ts">
import type { Grupo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const { data: grupos } = await useFetch<Grupo[]>('/api/torneos/mundial/2026/grupos');

useSeo({
  title: 'Grupos del Mundial 2026 — 12 grupos de 4 selecciones',
  description: 'Los 12 grupos del Mundial 2026 con sus 48 selecciones participantes.',
});

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Grupos' },
  ]),
);
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
        { label: 'Grupos' },
      ]" />
    </div>
    <ProHero kicker="Fase de grupos" title="12 grupos" lead="48 selecciones repartidas en 12 grupos de 4." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile
          v-for="g in grupos"
          :key="g.slug"
          :cols="3"
          :kicker="`Grupo ${g.letra}`"
          :title="g.selecciones.map(s => s.nombre).join(' · ')"
          :href="`/torneos/mundial/2026/grupos/${g.slug}/`"
        />
      </BentoGrid>
    </section>
  </div>
</template>
