<script setup lang="ts">
useSeo({
  title: 'Torneos — Cobertura Golgana',
  description: 'Torneos cubiertos por Golgana: Mundial 2026 y LigaPro (próximamente).',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Torneos' }]" />
    </div>
    <ProHero kicker="Cobertura" title="Torneos" />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile :cols="6" kicker="Mundial 2026" title="Cobertura especial" href="/torneos/mundial/" variant="green" />
        <Tile :cols="6" kicker="LigaPro · Próximamente" title="Serie A · 2026" />
      </BentoGrid>
    </section>
  </div>
</template>
