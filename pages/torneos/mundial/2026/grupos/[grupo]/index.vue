<script setup lang="ts">
import type { Grupo } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const grupoSlug = route.params.grupo as string;
const { data: grupo } = await useFetch<Grupo>(`/api/torneos/mundial/2026/grupos/${grupoSlug}`);
if (!grupo.value) throw createError({ statusCode: 404 });

useSeo(grupo.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial', url: config.public.siteUrl + '/torneos/mundial/' },
    { name: '2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: `Grupo ${grupo.value.letra}` },
  ]),
  buildItemList(grupo.value.selecciones.map((s) => ({ name: s.nombre, url: `${config.public.siteUrl}/selecciones/${s.slug}/` }))),
]);
</script>

<template>
  <div v-if="grupo">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
          { label: `Grupo ${grupo.letra}` },
        ]"
      />
    </div>

    <ProHero
      kicker="Fase de grupos · Mundial 2026"
      :title="`Grupo ${grupo.letra}`"
      :lead="grupo.analisis ?? `Tabla, fixture y selecciones del Grupo ${grupo.letra} del Mundial 2026.`"
      :meta="[`${grupo.selecciones.length} equipos`, '6 partidos']"
      bg-gradient="linear-gradient(135deg,#000 0%,#053a25 50%,#067a4a 100%)"
    />

    <section id="tabla" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Posiciones</span>
          <h2 class="pro-sec-head__title">Tabla del grupo</h2>
        </div>
      </div>
      <Standings v-if="grupo.tabla.length" :rows="grupo.tabla" />
      <p v-else>Tabla disponible una vez iniciado el torneo.</p>
    </section>

    <section id="fixture" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">{{ grupo.partidos.length || 6 }} partidos · 12 días</span>
          <h2 class="pro-sec-head__title">Calendario completo</h2>
        </div>
      </div>
      <BentoGrid v-if="grupo.partidos.length">
        <Tile
          v-for="p in grupo.partidos"
          :key="p.slug"
          :cols="6"
          :kicker="p.nombre"
        />
      </BentoGrid>
      <p v-else>Calendario por confirmar.</p>
    </section>
  </div>
</template>
