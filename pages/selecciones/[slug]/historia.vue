<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface Hito {
  ano: number;
  evento: string;
}
interface HistoriaContent {
  titulo: string;
  lead: string;
  cuerpo: string;
  hitos: Hito[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: historia }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<HistoriaContent>(`/api/selecciones/${slug}/historia`),
]);

if (!equipo.value || !historia.value) throw createError({ statusCode: 404 });

useSeo(historia.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Historia' },
  ]),
);
</script>

<template>
  <div v-if="equipo && historia">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Historia' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="historia.titulo" :lead="historia.lead" />

    <section class="pro-section pro-container">
      <article v-html="historia.cuerpo" class="prose" style="max-width:720px;margin:0 auto" />
    </section>

    <section v-if="historia.hitos?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Hitos</h2>
      </div>
      <ul style="margin-top:16px">
        <li v-for="h in historia.hitos" :key="h.ano" style="margin-bottom:8px">
          <strong>{{ h.ano }}</strong> — {{ h.evento }}
        </li>
      </ul>
    </section>
  </div>
</template>
