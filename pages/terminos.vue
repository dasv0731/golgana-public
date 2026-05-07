<script setup lang="ts">
useSeo({
  title: 'Términos y Condiciones — Golgana',
  description: 'Términos de uso del sitio Golgana.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Términos' }]" />
    </div>
    <ProHero kicker="Legal" title="Términos y Condiciones" />
    <article class="pro-section pro-container" style="max-width:720px">
      <p style="margin-top:16px">Última actualización: mayo 2026.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Uso del sitio</h2>
      <p style="margin-top:16px">Golgana ofrece contenido editorial de fútbol con fines informativos. El uso del sitio implica aceptación de estos términos.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Propiedad intelectual</h2>
      <p style="margin-top:16px">El contenido editorial es propiedad de Golgana. No se permite la reproducción sin atribución y enlace a la fuente.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Limitación de responsabilidad</h2>
      <p style="margin-top:16px">El contenido se presenta de buena fe. Datos de mercado son estimados y se citan fuentes cuando aplica. Golgana no se hace responsable de decisiones tomadas en base a la información publicada.</p>
    </article>
  </div>
</template>
