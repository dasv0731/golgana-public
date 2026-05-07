<script setup lang="ts">
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

useSeo({
  title: 'Goleadores Mundial 2026',
  description: 'Top scorers del Mundial 2026 actualizado tras cada jornada.',
});

const config = useRuntimeConfig();
injectSchema(buildBreadcrumbList([
  { name: 'Inicio', url: config.public.siteUrl + '/' },
  { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
  { name: 'Goleadores' },
]));
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Goleadores' }]" />
    </div>
    <ProHero kicker="Top scorers" title="Goleadores" lead="El ranking se actualizará tras cada jornada del torneo." />
    <section class="pro-section pro-container">
      <p>Datos disponibles desde el 11 de junio.</p>
    </section>
  </div>
</template>
