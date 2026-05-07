<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, buildSportsTeam, buildFAQPage, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: equipo } = await useFetch<Equipo>(`/api/selecciones/${slug}`);
if (!equipo.value) throw createError({ statusCode: 404 });

useSeo(equipo.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre },
  ]),
  buildSportsTeam(equipo.value),
  buildFAQPage(equipo.value.faq),
]);
</script>

<template>
  <div v-if="equipo">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Selecciones', to: '/selecciones/' },
          { label: equipo.nombre },
        ]"
      />
    </div>

    <EquipoHero
      :equipo="equipo"
      :kicker="`Selección de ${equipo.nombre} · Mundial 2026`"
      :metrics="equipo.estadisticasDestacadas"
    />

    <PageIndex
      :items="[
        { label: 'Plantilla', href: '/selecciones/' + equipo.slug + '/plantilla/' },
        { label: 'Partidos', href: '/selecciones/' + equipo.slug + '/partidos/' },
        { label: 'Historia', href: '/selecciones/' + equipo.slug + '/historia/' },
        { label: 'Títulos', href: '/selecciones/' + equipo.slug + '/titulos/' },
        { label: 'Ídolos', href: '/selecciones/' + equipo.slug + '/idolos/' },
        { label: 'Clásicos', href: '/selecciones/' + equipo.slug + '/clasicos/' },
        { label: 'Estadio', href: '/selecciones/' + equipo.slug + '/estadio/' },
      ]"
    />

    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile :cols="6" kicker="Convocatoria" title="26 jugadores" :href="`/selecciones/${equipo.slug}/plantilla/`" />
        <Tile :cols="6" kicker="Calendario" title="Próximos partidos" :href="`/selecciones/${equipo.slug}/partidos/`" />
        <Tile :cols="4" kicker="Historia" :title="`${equipo.fundacion ?? '—'}`" :href="`/selecciones/${equipo.slug}/historia/`" />
        <Tile :cols="4" kicker="Ídolos" title="Hall of fame" :href="`/selecciones/${equipo.slug}/idolos/`" />
        <Tile :cols="4" kicker="Clásicos" title="Rivalidades" :href="`/selecciones/${equipo.slug}/clasicos/`" />
      </BentoGrid>
    </section>
  </div>
</template>
