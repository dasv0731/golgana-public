<script setup lang="ts">
import type { Equipo } from '~/types/api';
const { data: lista } = await useFetch<Equipo[]>('/api/selecciones');
useSeo({ title: 'Selecciones — Mundial 2026', description: 'Las 48 selecciones del Mundial 2026 con plantilla, partidos e historia.' });
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Selecciones' }]" />
    </div>
    <ProHero kicker="Mundial 2026" title="Selecciones" lead="Las 48 selecciones del Mundial." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile
          v-for="s in lista"
          :key="s.slug"
          :cols="3"
          :kicker="s.pais"
          :title="s.apodo ?? s.nombre"
          :href="`/selecciones/${s.slug}/`"
        />
      </BentoGrid>
    </section>
  </div>
</template>
