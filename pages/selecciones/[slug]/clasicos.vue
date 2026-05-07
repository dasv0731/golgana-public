<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

interface Clasico {
  rival: string;
  tipo: string;
  ultimo: string;
  [key: string]: string | number;
}
interface ClasicosContent {
  titulo: string;
  lead: string;
  clasicos: Clasico[];
  seo: { title: string; description: string };
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: clasicos }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<ClasicosContent>(`/api/selecciones/${slug}/clasicos`),
]);

if (!equipo.value || !clasicos.value) throw createError({ statusCode: 404 });

useSeo(clasicos.value.seo);

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Clásicos' },
  ]),
);

function h2hLine(c: Clasico): string {
  // Find the three h2h_* fields (own, rival, empate) and produce a compact summary
  const ec = typeof c.h2h_ec === 'number' ? c.h2h_ec : 0;
  const e = typeof c.h2h_e === 'number' ? c.h2h_e : 0;
  // rival win count is whichever h2h_* key is not _ec or _e
  const rivalKey = Object.keys(c).find((k) => k.startsWith('h2h_') && k !== 'h2h_ec' && k !== 'h2h_e');
  const rivalWins = rivalKey ? Number(c[rivalKey]) : 0;
  return `G${ec} · E${e} · P${rivalWins}`;
}
</script>

<template>
  <div v-if="equipo && clasicos">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Clásicos' },
        ]"
      />
    </div>

    <ProHero :kicker="equipo.nombre" :title="clasicos.titulo" :lead="clasicos.lead" />

    <section v-if="clasicos.clasicos?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Rivalidades</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="c in clasicos.clasicos"
          :key="c.rival"
          :cols="6"
          :kicker="c.tipo"
          :title="`vs ${c.rival}`"
        >
          <p style="margin-top:8px;opacity:.85"><strong>H2H:</strong> {{ h2hLine(c) }}</p>
          <p style="margin-top:6px;opacity:.75"><strong>Último:</strong> {{ c.ultimo }}</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
