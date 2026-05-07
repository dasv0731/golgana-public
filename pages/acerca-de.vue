<script setup lang="ts">
useSeo({
  title: 'Acerca de Golgana',
  description: 'Conoce a Golgana: nuestra misión, equipo editorial, fuentes y política editorial.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Acerca de' }]" />
    </div>
    <ProHero kicker="Sobre nosotros" title="Acerca de Golgana" lead="Plataforma editorial de fútbol con cobertura de profundidad." />
    <article class="pro-section pro-container" style="max-width:720px">
      <h2 class="pro-sec-head__title">Misión</h2>
      <p style="margin-top:16px">Cubrir el fútbol con la profundidad y rigor que merece. Para hinchas que quieren más que resultados: contexto, datos, historia y análisis.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Equipo editorial</h2>
      <p style="margin-top:16px">Un equipo de redactores, editores y analistas con experiencia en cobertura deportiva y datos. Cada artículo está firmado por su autor y editado antes de publicarse.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Fuentes</h2>
      <p style="margin-top:16px">Verificamos datos contra fuentes oficiales (FIFA, FEF, Ligas y federaciones), bases de datos consolidadas (Transfermarkt para valores de mercado, FBref para estadísticas de juego) y reportes de prensa especializada. Cuando una cifra es estimada, lo decimos explícitamente.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Política editorial</h2>
      <p style="margin-top:16px">No publicamos contenido patrocinado disfrazado de editorial. La cobertura de jugadores y equipos es independiente de cualquier relación comercial.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Correcciones</h2>
      <p style="margin-top:16px">Si encuentras un error, escríbenos a <a href="mailto:redaccion@golgana.net">redaccion@golgana.net</a>. Las correcciones se publican con sello de actualización en el artículo.</p>

      <h2 class="pro-sec-head__title" style="margin-top:48px">Contacto</h2>
      <p style="margin-top:16px">Para temas editoriales: <a href="mailto:redaccion@golgana.net">redaccion@golgana.net</a><br />Para temas comerciales: <a href="mailto:contacto@golgana.net">contacto@golgana.net</a></p>
    </article>
  </div>
</template>
