<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface Idolo {
  nombre: string;
  era: string;
  rol: string;
  logros: string;
}
interface IdolosContent {
  titulo: string;
  lead: string;
  idolos: Idolo[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: idolos }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<IdolosContent>(`/api/selecciones/${slug}/idolos`),
]);

if (!equipo.value || !idolos.value) throw createError({ statusCode: 404 });

useSeo(idolos.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Ídolos' },
  ]),
);
</script>

<template>
  <div v-if="equipo && idolos">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Ídolos' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="idolos.titulo" :lead="idolos.lead" />

    <section v-if="idolos.idolos?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Hall of fame</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="i in idolos.idolos"
          :key="i.nombre"
          :cols="4"
          :kicker="i.era"
          :title="i.nombre"
        >
          <p style="margin-top:8px;opacity:.85"><strong>{{ i.rol }}</strong></p>
          <p style="margin-top:6px;opacity:.75">{{ i.logros }}</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
