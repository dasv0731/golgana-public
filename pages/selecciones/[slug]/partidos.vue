<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface PartidoProximo {
  fecha: string;
  rival: string;
  competicion: string;
  sede: string;
}
interface PartidoUltimo {
  fecha: string;
  rival: string;
  resultado: string;
  competicion: string;
  sede: string;
}
interface PartidosContent {
  titulo: string;
  lead: string;
  proximos: PartidoProximo[];
  ultimos: PartidoUltimo[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: partidos }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<PartidosContent>(`/api/selecciones/${slug}/partidos`),
]);

if (!equipo.value || !partidos.value) throw createError({ statusCode: 404 });

useSeo(partidos.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Partidos' },
  ]),
);

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
</script>

<template>
  <div v-if="equipo && partidos">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Partidos' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="partidos.titulo" :lead="partidos.lead" />

    <section v-if="partidos.proximos?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Próximos partidos</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="p in partidos.proximos"
          :key="p.fecha + p.rival"
          :cols="4"
          :kicker="`${formatFecha(p.fecha)} · ${p.competicion}`"
          :title="`vs ${p.rival}`"
        >
          <p style="margin-top:8px;opacity:.8">{{ p.sede }}</p>
        </Tile>
      </BentoGrid>
    </section>

    <section v-if="partidos.ultimos?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Últimos resultados</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="u in partidos.ultimos"
          :key="u.fecha + u.rival"
          :cols="4"
          :kicker="`${formatFecha(u.fecha)} · ${u.competicion}`"
          :title="`vs ${u.rival}`"
        >
          <p style="margin-top:8px;opacity:.8">
            <strong>{{ u.resultado }}</strong> — {{ u.sede }}
          </p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
