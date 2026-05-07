<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface Titulo {
  competicion: string;
  ano: number;
}
interface Actuacion {
  competicion: string;
  ano: number;
  resultado: string;
}
interface TitulosContent {
  titulo: string;
  lead: string;
  titulos: Titulo[];
  actuaciones: Actuacion[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: titulos }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<TitulosContent>(`/api/selecciones/${slug}/titulos`),
]);

if (!equipo.value || !titulos.value) throw createError({ statusCode: 404 });

useSeo(titulos.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Títulos' },
  ]),
);
</script>

<template>
  <div v-if="equipo && titulos">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Títulos' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="titulos.titulo" :lead="titulos.lead" />

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Palmarés</h2>
      </div>
      <BentoGrid v-if="titulos.titulos?.length">
        <Tile
          v-for="t in titulos.titulos"
          :key="t.competicion + t.ano"
          :cols="4"
          :kicker="String(t.ano)"
          :title="t.competicion"
        />
      </BentoGrid>
      <p v-else style="margin-top:16px;opacity:.75">Sin títulos oficiales aún.</p>
    </section>

    <section v-if="titulos.actuaciones?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Mejores actuaciones</h2>
      </div>
      <ul style="margin-top:16px">
        <li v-for="a in titulos.actuaciones" :key="a.competicion + a.ano" style="margin-bottom:8px">
          <strong>{{ a.competicion }} {{ a.ano }}</strong> — {{ a.resultado }}
        </li>
      </ul>
    </section>
  </div>
</template>
