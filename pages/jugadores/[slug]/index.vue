<script setup lang="ts">
import type { Jugador } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: jugador } = await useFetch<Jugador>(`/api/jugadores/${slug}`);
if (!jugador.value) throw createError({ statusCode: 404 });

useSeo(jugador.value.seo);

const config = useRuntimeConfig();
injectSchema(buildBreadcrumbList([
  { name: 'Inicio', url: config.public.siteUrl + '/' },
  { name: 'Jugadores', url: config.public.siteUrl + '/jugadores/' },
  { name: jugador.value.nombre },
]));
</script>

<template>
  <div v-if="jugador">
    <div class="pro-container">
      <Breadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Jugadores', to: '/jugadores/' },
        { label: jugador.nombre },
      ]" />
    </div>

    <ProHero
      :kicker="`#${jugador.posicion} · ${jugador.nacionalidad}`"
      :title="jugador.nombre"
      :lead="jugador.nombreCompleto"
      :meta="[`Nac. ${new Date(jugador.fechaNacimiento).toLocaleDateString('es-EC')}`, jugador.altura ? `${jugador.altura} cm` : '']"
    />

    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile :cols="3" kicker="Club actual" :title="jugador.clubActual.nombre" />
        <Tile v-if="jugador.seleccion" :cols="3" kicker="Selección" :title="jugador.seleccion.nombre" />
        <Tile :cols="3" kicker="Posición" :title="jugador.posicion" />
        <Tile v-if="jugador.valorMercado" :cols="3" kicker="Valor mercado" :title="`€${(jugador.valorMercado.monto / 1000000).toFixed(0)}M`" />
      </BentoGrid>
    </section>

    <section v-if="jugador.trayectoria?.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Trayectoria</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="t in jugador.trayectoria"
          :key="t.club.slug + t.desde"
          :cols="6"
          :kicker="`${new Date(t.desde).getFullYear()}-${t.hasta ? new Date(t.hasta).getFullYear() : 'actual'}`"
          :title="t.club.nombre"
        >
          <p style="margin-top:8px;color:var(--color-text-muted)">
            <span v-if="t.partidos">{{ t.partidos }} PJ</span>
            <span v-if="t.goles" style="margin-left:8px">{{ t.goles }} gol(es)</span>
          </p>
          <p v-if="t.notas" style="margin-top:8px;font-size:14px">{{ t.notas }}</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
