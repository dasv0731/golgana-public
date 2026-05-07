<script setup lang="ts">
import type { Plantilla, Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: plantilla }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<Plantilla>(`/api/selecciones/${slug}/plantilla`),
]);
if (!equipo.value || !plantilla.value) throw createError({ statusCode: 404 });

useSeo({
  title: `Plantilla de ${equipo.value.nombre} — Mundial 2026`,
  description: `Convocatoria de ${equipo.value.nombre} al Mundial 2026: jugadores con dorsal, posición y club.`,
});

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Plantilla' },
  ]),
);

const grupoPosiciones = computed(() => ({
  POR: plantilla.value!.jugadores.filter((j) => j.posicion === 'POR'),
  DEF: plantilla.value!.jugadores.filter((j) => j.posicion === 'DEF'),
  MED: plantilla.value!.jugadores.filter((j) => j.posicion === 'MED'),
  DEL: plantilla.value!.jugadores.filter((j) => j.posicion === 'DEL'),
}));
</script>

<template>
  <div v-if="equipo && plantilla">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Plantilla' },
        ]"
      />
    </div>

    <ProHero
      :kicker="equipo.nombre + ' · Mundial 2026'"
      title="Plantilla"
      :lead="`${plantilla.jugadores.length} jugadores convocados.`"
    />

    <section
      v-for="(jugadores, posicion) in grupoPosiciones"
      :key="posicion"
      class="pro-section pro-container"
    >
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">{{ posicion === 'POR' ? 'Arqueros' : posicion === 'DEF' ? 'Defensas' : posicion === 'MED' ? 'Mediocampistas' : 'Delanteros' }}</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="pj in jugadores"
          :key="pj.jugador.slug"
          :cols="3"
          :kicker="`#${pj.dorsal ?? '?'} · ${pj.posicionDetalle ?? pj.posicion}`"
          :title="pj.jugador.nombre"
          :href="`/jugadores/${pj.jugador.slug}/`"
        />
      </BentoGrid>
    </section>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Cuerpo técnico</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="staff in plantilla.cuerpoTecnico"
          :key="staff.nombre"
          :cols="4"
          :kicker="staff.rol"
          :title="staff.nombre"
        />
      </BentoGrid>
    </section>
  </div>
</template>
