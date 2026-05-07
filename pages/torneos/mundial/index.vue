<script setup lang="ts">
import type { Torneo } from '~/types/api';
import { buildBreadcrumbList, buildFAQPage, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: torneo } = await useFetch<Torneo>('/api/torneos/mundial');
if (!torneo.value) throw createError({ statusCode: 404 });

useSeo(torneo.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial' },
  ]),
  buildFAQPage(torneo.value.faq),
  buildItemList(torneo.value.campeones.map((c) => ({ name: `${c.ano} — ${c.campeon.nombre}` }))),
]);
</script>

<template>
  <div v-if="torneo">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Torneos', to: '/torneos/' },
          { label: 'Mundial' },
        ]"
      />
    </div>

    <ProHero
      kicker="FIFA · Desde 1930"
      :title="torneo.nombre"
      :lead="`${torneo.campeones.length} ediciones disputadas. La más prestigiosa competición del fútbol mundial.`"
      :meta="[`Fundación ${torneo.fundacion}`, 'Organizador FIFA']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    />

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Edición en curso</span>
          <h2 class="pro-sec-head__title">Mundial 2026</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/" class="pro-sec-head__cta">Ver edición →</NuxtLink>
      </div>
      <p>11 jun – 19 jul 2026 · USA · Canadá · México · 48 selecciones · 104 partidos</p>
    </section>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Palmarés</span>
          <h2 class="pro-sec-head__title">Últimos campeones</h2>
        </div>
        <NuxtLink to="/torneos/mundial/campeones/" class="pro-sec-head__cta">Ver completo →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile
          v-for="c in torneo.campeones.slice(-6).reverse()"
          :key="c.ano"
          :cols="4"
          :kicker="String(c.ano)"
          :title="c.campeon.nombre"
        />
      </BentoGrid>
    </section>

    <section v-if="torneo.faq.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <h2 class="pro-sec-head__title">Preguntas frecuentes</h2>
        </div>
      </div>
      <details v-for="(f, i) in torneo.faq" :key="i" class="faq-item">
        <summary>{{ f.pregunta }}</summary>
        <p>{{ f.respuesta }}</p>
      </details>
    </section>
  </div>
</template>
