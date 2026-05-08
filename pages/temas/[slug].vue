<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

useSeo({
  title: 'Tema — Mundial 2026',
  description: 'Próximamente.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Temas', to: '/temas/' },
        { label: slug },
      ]" />
    </div>
    <ProHero kicker="Tema editorial" :title="slug" lead="Próximamente." />
    <section class="pro-section pro-container">
      <p style="color: var(--color-text-muted)">
        Los clusters editoriales se servirán desde el backend AppSync (`tema(slug)`)
        una vez completemos la migración de Nuxt Content.
      </p>
    </section>
  </div>
</template>
