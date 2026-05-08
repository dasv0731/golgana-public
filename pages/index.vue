<script setup lang="ts">
import type { Edicion, Equipo } from '~/types/api';
import { buildItemList, injectSchema } from '~/composables/useSchema';

const [{ data: edicion }, { data: ecuador }] = await Promise.all([
  useFetch<Edicion>('/api/torneos/mundial/2026'),
  useFetch<Equipo>('/api/selecciones/ecuador'),
]);

useSeo({
  title: 'Golgana — Fútbol con profundidad',
  description: 'Cobertura especial del Mundial 2026 con foco en Ecuador. Plantilla, partidos, análisis, historia y datos viz.',
});

const config = useRuntimeConfig();
injectSchema(
  buildItemList([
    { name: 'Mundial 2026', url: `${config.public.siteUrl}/torneos/mundial/2026/` },
    { name: 'Selección Ecuador', url: `${config.public.siteUrl}/selecciones/ecuador/` },
  ]),
);
</script>

<template>
  <div>
    <ProHero
      kicker="Cobertura especial"
      title="Mundial 2026"
      lead="48 selecciones. Ecuador en su 4to Mundial. Toda la cobertura aquí."
      :meta="['11 jun – 19 jul', '36 días para el kickoff']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    >
      <template #aside>
        <h3 style="color:#fff;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;margin:0 0 16px">Acceso rápido</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          <NuxtLink to="/torneos/mundial/2026/" class="btn btn--primary">Ver edición</NuxtLink>
          <NuxtLink to="/selecciones/ecuador/" class="btn">Selección Ecuador</NuxtLink>
          <NuxtLink to="/torneos/mundial/2026/grupos/grupo-e/" class="btn">Grupo E</NuxtLink>
        </div>
      </template>
    </ProHero>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Torneos activos</span>
          <h2 class="pro-sec-head__title">Cobertura</h2>
        </div>
      </div>
      <BentoGrid>
        <Tile :cols="6" kicker="Mundial · 11 jun – 19 jul" title="Mundial 2026" href="/torneos/mundial/2026/" />
        <Tile :cols="6" kicker="LigaPro · 2026 (próximamente)" title="LigaPro Serie A" />
      </BentoGrid>
    </section>

    <section v-if="ecuador" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura especial</span>
          <h2 class="pro-sec-head__title">Ecuador en el Mundial</h2>
        </div>
        <NuxtLink to="/selecciones/ecuador/" class="pro-sec-head__cta">Ficha completa →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile :cols="4" kicker="Plantilla" title="26 convocados" href="/selecciones/ecuador/plantilla/" />
        <Tile :cols="4" kicker="Partidos" title="3 en fase de grupos" href="/selecciones/ecuador/partidos/" />
        <Tile :cols="4" kicker="Historia" title="4 Mundiales" href="/selecciones/ecuador/historia/" />
      </BentoGrid>
    </section>
  </div>
</template>
