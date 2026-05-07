<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface EstadioPrincipal {
  nombre: string;
  ciudad: string;
  capacidad: number;
  altitud?: number;
  inauguracion?: number;
  descripcion: string;
}
interface EstadioSecundario {
  nombre: string;
  ciudad: string;
  capacidad: number;
  uso: string;
}
interface EstadioContent {
  titulo: string;
  lead: string;
  principal: EstadioPrincipal;
  secundarios: EstadioSecundario[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: estadio }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<EstadioContent>(`/api/selecciones/${slug}/estadio`),
]);

if (!equipo.value || !estadio.value) throw createError({ statusCode: 404 });

useSeo(estadio.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Estadio' },
  ]),
);
</script>

<template>
  <div v-if="equipo && estadio">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Estadio' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="estadio.titulo" :lead="estadio.lead" />

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Sede principal</h2>
      </div>
      <BentoGrid>
        <Tile
          :cols="12"
          variant="dark"
          :kicker="estadio.principal.ciudad"
          :title="estadio.principal.nombre"
        >
          <p style="margin-top:10px;opacity:.85">
            Capacidad: <strong>{{ estadio.principal.capacidad.toLocaleString('es-EC') }}</strong>
            <span v-if="estadio.principal.altitud"> · Altitud: <strong>{{ estadio.principal.altitud }}m</strong></span>
            <span v-if="estadio.principal.inauguracion"> · Inaugurado: <strong>{{ estadio.principal.inauguracion }}</strong></span>
          </p>
          <p style="margin-top:8px;opacity:.8">{{ estadio.principal.descripcion }}</p>
        </Tile>
      </BentoGrid>
    </section>

    <section v-if="estadio.secundarios?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Otros estadios</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="s in estadio.secundarios"
          :key="s.nombre"
          :cols="4"
          :kicker="s.ciudad"
          :title="s.nombre"
        >
          <p style="margin-top:8px;opacity:.85">Capacidad: <strong>{{ s.capacidad.toLocaleString('es-EC') }}</strong></p>
          <p style="margin-top:6px;opacity:.75">{{ s.uso }}</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
