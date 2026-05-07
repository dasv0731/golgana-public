<script setup lang="ts">
useSeo({
  title: 'Contacto — Golgana',
  description: 'Cómo contactar al equipo editorial y comercial de Golgana.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]" />
    </div>
    <ProHero kicker="Contacto" title="Hablemos" lead="Para correcciones, propuestas o consultas." />
    <section class="pro-section pro-container" style="max-width:720px">
      <p style="margin-top:16px">Editorial: <a href="mailto:redaccion@golgana.net">redaccion@golgana.net</a></p>
      <p style="margin-top:8px">Comercial: <a href="mailto:contacto@golgana.net">contacto@golgana.net</a></p>
    </section>
  </div>
</template>
