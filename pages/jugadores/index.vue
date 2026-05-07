<script setup lang="ts">
useSeo({
  title: 'Jugadores — Cobertura Mundial 2026',
  description: 'Perfiles de jugadores ecuatorianos y figuras del Mundial 2026.',
});

const jugadores = [
  { slug: 'moises-caicedo', nombre: 'Moisés Caicedo', club: 'Chelsea', posicion: 'Volante' },
];
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Jugadores' }]" />
    </div>
    <ProHero kicker="Cobertura especial" title="Jugadores" lead="Perfiles y trayectorias." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile
          v-for="j in jugadores"
          :key="j.slug"
          :cols="4"
          :kicker="j.posicion"
          :title="j.nombre"
          :href="`/jugadores/${j.slug}/`"
        >
          <p style="margin-top:8px;color:var(--color-text-muted)">{{ j.club }}</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
