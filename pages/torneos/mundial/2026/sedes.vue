<script setup lang="ts">
import type { Sede } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: sedes } = await useFetch<Sede[]>('/api/torneos/mundial/2026/sedes');

useSeo({
  title: 'Sedes Mundial 2026 — 16 estadios en USA, Canadá, México',
  description: 'Las 16 sedes del Mundial 2026: capacidad, ciudad, partidos asignados.',
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Sedes' },
  ]),
  buildItemList((sedes.value ?? []).map((s) => ({ name: s.nombre }))),
]);
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Sedes' }]" />
    </div>
    <ProHero kicker="16 sedes · 3 países" title="Estadios" lead="Estados Unidos, Canadá y México albergan el primer Mundial ampliado." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <MediaTile
          v-for="s in sedes"
          :key="s.slug"
          :cols="4"
          :kicker="s.pais"
          :title="s.nombre"
          :meta="`${s.ciudad} · ${s.capacidad.toLocaleString()}`"
          :image="s.imagen ?? { src: '/img/stadium-placeholder.svg', alt: s.nombre }"
        />
      </BentoGrid>
    </section>
  </div>
</template>
