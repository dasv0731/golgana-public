<script setup lang="ts">
useSeo({
  title: 'Política de Privacidad — Golgana',
  description: 'Cómo recopilamos y usamos datos en Golgana.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Privacidad' }]" />
    </div>
    <ProHero kicker="Legal" title="Política de Privacidad" />
    <article class="pro-section pro-container" style="max-width:720px">
      <p style="margin-top:16px">Última actualización: mayo 2026.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Datos que recopilamos</h2>
      <p style="margin-top:16px">Usamos Google Analytics 4 (vía Google Tag Manager) para entender qué contenido es útil. Solo se cargan tras el consentimiento del usuario en el banner de cookies. Los datos están anonimizados y agregados.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Derechos</h2>
      <p style="margin-top:16px">Puedes rechazar cookies desde el banner. Para preguntas sobre tus datos, escríbenos a <a href="mailto:privacidad@golgana.net">privacidad@golgana.net</a>.</p>
    </article>
  </div>
</template>
