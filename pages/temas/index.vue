<script setup lang="ts">
useSeo({
  title: 'Temas — Cobertura editorial Golgana',
  description: 'Temas y clusters editoriales: Mundial 2026, Selección Ecuatoriana, Grupo E, ídolos y análisis.',
});

const temas = [
  { slug: 'mundial-2026', nombre: 'Mundial 2026' },
  { slug: 'seleccion-ecuatoriana', nombre: 'Selección Ecuatoriana' },
  { slug: 'grupo-e', nombre: 'Grupo E' },
  { slug: 'beccacece', nombre: 'Sebastián Beccacece' },
  { slug: 'caicedo', nombre: 'Moisés Caicedo' },
  { slug: 'la-tri-mundial', nombre: 'La Tri en el Mundial' },
];
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Temas' }]" />
    </div>
    <ProHero kicker="Editorial" title="Temas" lead="Clusters de cobertura editorial." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile
          v-for="t in temas"
          :key="t.slug"
          :cols="4"
          kicker="Tema"
          :title="t.nombre"
          :href="`/temas/${t.slug}/`"
        />
      </BentoGrid>
    </section>
  </div>
</template>
