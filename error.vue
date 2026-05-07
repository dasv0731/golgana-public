<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

useSeoMeta({
  title: props.error.statusCode === 404 ? 'Página no encontrada' : 'Error',
  robots: 'noindex, nofollow',
});
</script>

<template>
  <div>
    <SiteHeader />
    <main>
      <ProHero
        :kicker="String(error.statusCode ?? 'Error')"
        :title="error.statusCode === 404 ? 'No encontramos lo que buscas' : 'Algo salió mal'"
        :lead="error.statusCode === 404 ? 'La página que buscas no existe o se movió.' : 'Inténtalo en unos minutos.'"
      />
      <section class="pro-section pro-container">
        <BentoGrid>
          <Tile :cols="6" kicker="Volver" title="Inicio" href="/" />
          <Tile :cols="6" kicker="Mundial 2026" title="Edición actual" href="/torneos/mundial/2026/" />
        </BentoGrid>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
