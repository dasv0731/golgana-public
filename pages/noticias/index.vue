<script setup lang="ts">
const { data: articulos } = await useAsyncData('noticias-list', () =>
  queryCollection('noticias').order('fechaPublicacion', 'DESC').all(),
);

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
    <ProHero kicker="Editorial" title="Noticias" lead="Análisis, previas, crónicas y reportajes." />
    <section class="pro-section pro-container">
      <BentoGrid v-if="articulos?.length">
        <EditorialCard
          v-for="(a, i) in articulos"
          :key="a.path"
          :kicker="a.kicker"
          :title="a.titulo"
          :href="a.path"
          :image="a.imagenHero"
          :meta="a.autor?.nombre ? `${a.autor.nombre} · ${new Date(a.fechaPublicacion).toLocaleDateString('es-EC')}` : new Date(a.fechaPublicacion).toLocaleDateString('es-EC')"
          :lead="i === 0 ? 'lead' : 'normal'"
        />
      </BentoGrid>
      <p v-else>Sin artículos publicados todavía.</p>
    </section>
  </div>
</template>
