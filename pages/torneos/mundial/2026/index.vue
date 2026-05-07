<script setup lang="ts">
import type { Edicion } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, buildFAQPage, injectSchema } from '~/composables/useSchema';

const { data: edicion } = await useFetch<Edicion>('/api/torneos/mundial/2026');
if (!edicion.value) throw createError({ statusCode: 404 });

useSeo(edicion.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial', url: config.public.siteUrl + '/torneos/mundial/' },
    { name: '2026' },
  ]),
  buildSportsEvent({
    name: 'Mundial 2026',
    startDate: edicion.value.fechaInicio,
    endDate: edicion.value.fechaFin,
    estado: edicion.value.estado,
    locationName: 'Estados Unidos, Canadá, México',
  }),
  buildFAQPage(edicion.value.faq),
]);
</script>

<template>
  <div v-if="edicion">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Torneos', to: '/torneos/' },
          { label: 'Mundial', to: '/torneos/mundial/' },
          { label: '2026' },
        ]"
      />
    </div>

    <ProHero
      kicker="FIFA World Cup · USA · Canadá · México"
      title="Mundial<br>2026"
      :lead="edicion.formato.descripcion"
      :meta="['11 jun – 19 jul', '48 equipos', '16 sedes', '104 partidos']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    />

    <PageIndex
      :items="[
        { label: 'Grupos', href: '#grupos' },
        { label: 'Calendario', href: '#calendario' },
        { label: 'Sedes', href: '#sedes' },
        { label: 'La Tri', href: '#tri' },
      ]"
    />

    <section id="grupos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Fase de grupos · 12 grupos · 4 equipos</span>
          <h2 class="pro-sec-head__title">El sorteo en 12 grupos</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/grupos/grupo-d/" class="pro-sec-head__cta">Ver Grupo D →</NuxtLink>
      </div>
      <p>Los 12 grupos se publicarán en breve. Mientras tanto, conoce el grupo de Ecuador.</p>
    </section>

    <section id="calendario" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">104 partidos · 39 días</span>
          <h2 class="pro-sec-head__title">Calendario</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/calendario/" class="pro-sec-head__cta">Ver completo →</NuxtLink>
      </div>
      <p>Inauguración: 11 junio · Final: 19 julio.</p>
    </section>

    <section id="sedes" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">16 sedes · 3 países</span>
          <h2 class="pro-sec-head__title">Estadios y ciudades</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/sedes/" class="pro-sec-head__cta">Ver todas →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile
          v-for="s in edicion.sedes?.slice(0, 6) ?? []"
          :key="s.slug"
          :cols="4"
          :kicker="s.pais"
          :title="s.nombre"
        >
          <p style="margin-top:8px;color:var(--color-text-muted)">{{ s.ciudad }} · {{ s.capacidad.toLocaleString() }}</p>
        </Tile>
      </BentoGrid>
    </section>

    <section id="tri" class="pro-section pro-container" style="background:#0a0a0a;border-radius:24px;padding:32px 24px">
      <div class="pro-sec-head" style="border-color:rgba(255,255,255,0.15)">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura especial</span>
          <h2 class="pro-sec-head__title" style="color:#fff">Ecuador en el Mundial</h2>
        </div>
        <NuxtLink to="/selecciones/ecuador/" class="pro-sec-head__cta" style="color:#fff">Ficha completa →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile :cols="6" variant="dark" kicker="Grupo D · 4° Mundial" title="La Tri busca octavos">
          <p style="margin-top:8px;color:rgba(255,255,255,0.7)">Beccacece arma una selección con base de Mundial sub-20 2019.</p>
        </Tile>
        <Tile :cols="3" variant="green" kicker="Debut" title="12 jun">
          <p style="margin-top:8px;color:rgba(255,255,255,0.85)">vs Uzbekistán · Atlanta</p>
        </Tile>
        <Tile :cols="3" variant="dark" kicker="Probabilidad octavos" title="68%">
          <p style="margin-top:8px;color:rgba(255,255,255,0.7)">Modelo Golgana</p>
        </Tile>
      </BentoGrid>
    </section>
  </div>
</template>
