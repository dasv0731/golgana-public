<script setup lang="ts">
useSeo({
  title: 'Noticias — Cobertura Mundial 2026',
  description: 'Análisis, previas, crónicas y reportajes sobre el Mundial 2026 con foco en Ecuador.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Noticias' }]" />
    </div>
    <ProHero
      kicker="Editorial"
      title="Noticias"
      lead="Próximamente."
    />
    <section class="pro-section pro-container">
      <p style="color: var(--color-text-muted)">
        El listado de noticias se cableará al backend AppSync en una próxima iteración.
        Mientras tanto puedes navegar por <NuxtLink to="/torneos/mundial/2026/">Mundial 2026</NuxtLink>.
      </p>
    </section>
  </div>
</template>
