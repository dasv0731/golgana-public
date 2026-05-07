<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const partidoSlug = route.params.partido as string;
const grupoSlug = route.params.grupo as string;
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
  title: `${titleByState[partido.value.estado]} | Mundial 2026`,
  description:
    partido.value.previa?.texto.replace(/<[^>]+>/g, '').slice(0, 160) ??
    `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} en el Mundial 2026.`,
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    {
      name: `Grupo ${grupoSlug.replace('grupo-', '').toUpperCase()}`,
      url: `${config.public.siteUrl}/torneos/mundial/2026/grupos/${grupoSlug}/`,
    },
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
          { label: `Grupo ${$route.params.grupo}`, to: `/torneos/mundial/2026/grupos/${$route.params.grupo}/` },
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

    <section v-if="partido.alineaciones" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Alineaciones {{ partido.alineaciones.local.oficial ? 'oficiales' : 'probables' }}</span>
        <h2 class="pro-sec-head__title">XI titular</h2>
      </div>
      <BentoGrid>
        <Tile :cols="6" :kicker="partido.local.nombre" :title="partido.alineaciones.local.formacion">
          <ul style="margin-top:12px;list-style:none;padding:0">
            <li v-for="t in partido.alineaciones.local.titulares" :key="t.jugador.slug" style="padding:4px 0">
              #{{ t.dorsal }} {{ t.jugador.nombre }}<span v-if="t.capitan" style="color:#FFD400;margin-left:6px">(C)</span>
            </li>
          </ul>
        </Tile>
        <Tile :cols="6" :kicker="partido.visitante.nombre" :title="partido.alineaciones.visitante.formacion">
          <ul style="margin-top:12px;list-style:none;padding:0">
            <li v-for="t in partido.alineaciones.visitante.titulares" :key="t.jugador.slug" style="padding:4px 0">
              #{{ t.dorsal }} {{ t.jugador.nombre }}<span v-if="t.capitan" style="color:#FFD400;margin-left:6px">(C)</span>
            </li>
          </ul>
        </Tile>
      </BentoGrid>
    </section>

    <section v-if="partido.h2h && partido.h2h.totalEnfrentamientos > 0" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Historial H2H</span>
        <h2 class="pro-sec-head__title">Enfrentamientos previos</h2>
      </div>
      <H2H :h2h="partido.h2h" :local-name="partido.local.nombre" :visitante-name="partido.visitante.nombre" />
    </section>

    <section v-else-if="partido.h2h" class="pro-section pro-container">
      <p>Primer enfrentamiento entre {{ partido.local.nombre }} y {{ partido.visitante.nombre }}.</p>
    </section>
  </div>
</template>
