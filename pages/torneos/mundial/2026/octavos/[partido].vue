<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const partidoSlug = route.params.partido as string;
const { data: partido } = await useFetch<Partido>(`/api/partidos/${partidoSlug}`);
if (!partido.value) throw createError({ statusCode: 404 });

const titleByState: Record<string, string> = {
  scheduled: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Previa`,
  playing: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — En juego`,
  finished: partido.value.marcador
    ? `${partido.value.local.nombre} ${partido.value.marcador.local}-${partido.value.marcador.visitante} ${partido.value.visitante.nombre} — Crónica`
    : `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Crónica`,
  postponed: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Aplazado`,
};

const estadoMap: Record<Partido['estado'], 'upcoming' | 'ongoing' | 'finished' | 'postponed'> = {
  scheduled: 'upcoming',
  playing: 'ongoing',
  finished: 'finished',
  postponed: 'postponed',
};

useSeo({
  title: `${titleByState[partido.value.estado]} | Mundial 2026 Octavos`,
  description:
    partido.value.previa?.texto.replace(/<[^>]+>/g, '').slice(0, 160) ??
    `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} en octavos del Mundial 2026.`,
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Octavos' },
    { name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}` },
  ]),
  buildSportsEvent({
    name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}`,
    startDate: partido.value.fecha,
    estado: estadoMap[partido.value.estado],
    locationName: partido.value.sede.nombre,
  }),
]);
</script>

<template>
  <div v-if="partido">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
          { label: 'Octavos' },
          { label: `${partido.local.nombre} vs ${partido.visitante.nombre}` },
        ]"
      />
    </div>

    <MatchHero :partido="partido" />

    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile :cols="3" kicker="Fecha" :title="new Date(partido.fecha).toLocaleDateString('es-EC')" />
        <Tile :cols="3" kicker="Estadio" :title="partido.sede.nombre" />
        <Tile :cols="3" kicker="Fase" :title="partido.fase.nombre" />
        <Tile v-if="partido.arbitro" :cols="3" kicker="Árbitro" :title="partido.arbitro.nombre" />
      </BentoGrid>
    </section>

    <section v-if="partido.previa" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Previa</span>
        <h2 class="pro-sec-head__title">El partido</h2>
      </div>
      <article v-html="partido.previa.texto" class="prose" style="max-width:720px;margin:0 auto" />
    </section>
  </div>
</template>
