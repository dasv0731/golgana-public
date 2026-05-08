<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

useSeo({
  title: 'Noticia — Mundial 2026',
  description: 'Próximamente.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Noticias', to: '/noticias/' },
        { label: slug },
      ]" />
    </div>
    <ProHero kicker="Editorial · Borrador" :title="slug" lead="Próximamente." />
    <section class="pro-section pro-container">
      <p style="color: var(--color-text-muted)">
        Este artículo se cargará desde el backend AppSync una vez cableemos el módulo de noticias.
      </p>
    </section>
  </div>
</template>
