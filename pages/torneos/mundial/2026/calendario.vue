<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: partidos } = await useFetch<Partido[]>('/api/torneos/mundial/2026/calendario');

useSeo({
  title: 'Calendario Mundial 2026 — 104 partidos',
  description: 'Calendario completo del Mundial 2026: fechas, horarios, sedes y selecciones de los 104 partidos.',
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Calendario' },
  ]),
  buildItemList((partidos.value ?? []).map((p) => ({
    name: `${p.local.nombre} vs ${p.visitante.nombre}`,
    url: `${config.public.siteUrl}/torneos/mundial/2026/grupos/${p.grupo?.slug ?? 'na'}/${p.slug}/`,
  }))),
]);
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Calendario' }]" />
    </div>
    <ProHero kicker="104 partidos · 39 días" title="Calendario" lead="11 jun – 19 jul · 16 sedes en 3 países." />
    <section class="pro-section pro-container">
      <BentoGrid v-if="partidos?.length">
        <MatchCard v-for="p in partidos" :key="p.slug" :partido="p" :cols="6" />
      </BentoGrid>
      <p v-else>Calendario en construcción. La próxima jornada se publica conforme se confirman fechas y sedes.</p>
    </section>
  </div>
</template>
