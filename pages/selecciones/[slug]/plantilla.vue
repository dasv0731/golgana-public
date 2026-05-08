<script setup lang="ts">
import type { Equipo, Plantilla, PlantillaJugador, Posicion } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;

const [{ data: equipo }, { data: plantilla }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<Plantilla>(`/api/selecciones/${slug}/plantilla`),
]);
if (!equipo.value || !plantilla.value) throw createError({ statusCode: 404 });

useSeo({
  title: `Plantilla ${equipo.value.nombre} — Mundial 2026`,
  description: `Los 26 convocados de ${equipo.value.nombre} para el Mundial 2026: arqueros, defensas, mediocampistas, delanteros y cuerpo técnico.`,
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${equipo.value.slug}/` },
    { name: 'Plantilla' },
  ]),
]);

const flagMap: Record<string, string> = { EC: '🇪🇨', GB: '🏴', CI: '🇨🇮', UZ: '🇺🇿' };
const flag = flagMap[equipo.value.pais] ?? '⚽';

// Agrupación por posición
const ordenPos: Posicion[] = ['POR', 'DEF', 'MED', 'DEL'];
const grupos: Record<Posicion, PlantillaJugador[]> = { POR: [], DEF: [], MED: [], DEL: [] };
for (const j of plantilla.value.jugadores) grupos[j.posicion].push(j);
for (const p of ordenPos) grupos[p].sort((a, b) => (a.dorsal ?? 99) - (b.dorsal ?? 99));

const seccion = (pos: Posicion) => {
  const map = {
    POR: { kicker: 'Arqueros', titulo: 'Porteros' },
    DEF: { kicker: 'Defensas', titulo: 'Línea de fondo' },
    MED: { kicker: 'Mediocampistas', titulo: 'Medio campo' },
    DEL: { kicker: 'Delanteros', titulo: 'Ataque' },
  } as const;
  return map[pos];
};

const iniciales = (nombre: string) =>
  nombre.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase();

// Datos de plantilla — mock hasta cablear al CMS
const ligas = [
  { name: 'Premier League', n: 9, pct: 35 },
  { name: 'LigaPro',        n: 5, pct: 19 },
  { name: 'Bundesliga',     n: 4, pct: 15 },
  { name: 'Serie A IT',     n: 3, pct: 12 },
  { name: 'LaLiga',         n: 2, pct: 8 },
  { name: 'MLS / Liga MX',  n: 3, pct: 11 },
];
const edades = [
  { name: '18-22', n: 6,  pct: 23 },
  { name: '23-26', n: 11, pct: 42 },
  { name: '27-30', n: 7,  pct: 27 },
  { name: '31+',   n: 2,  pct: 8 },
];

const editorial = {
  primarias: [
    {
      kicker: 'Análisis · 5 may',
      title: 'Las sorpresas de la lista de 26: dos juveniles dentro, un veterano fuera',
      body: 'Beccacece dejó fuera a un referente y metió a dos sub-21 con minutos en Europa. La rueda de prensa post-convocatoria.',
      meta: 'Por Carlos Mosquera · 9 min', href: '#',
    },
    {
      kicker: 'Datos · 4 may',
      title: 'El mapa de la plantilla: dónde juegan los 26 convocados',
      body: 'Premier League lidera con 9, LigaPro aporta 5 y aparece la sorpresa de tres jugadores en MLS.',
      meta: 'Por Daniela Espinoza · 6 min', href: '#',
    },
  ],
  secundarias: [
    { kicker: 'Crono',      title: 'El día en que Beccacece llamó a sus 26',                       meta: '3 may · 5 min',  href: '#' },
    { kicker: 'Opinión',    title: 'Por qué dejar fuera a Sebas Méndez es una apuesta arriesgada', meta: '2 may · 7 min',  href: '#' },
    { kicker: 'Entrevista', title: 'Hernán Galíndez: "Mi segundo Mundial es un milagro"',          meta: '1 may · 11 min', href: '#' },
  ],
};
</script>

<template>
  <div v-if="equipo && plantilla">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Selecciones', to: '/selecciones/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Plantilla' },
        ]"
      />
    </div>

    <!-- HERO -->
    <section class="pl-hero">
      <div class="pl-hero__bg" />
      <div class="pl-hero__inner">
        <div class="pl-hero__top">
          <div>
            <span class="pl-hero__kicker">{{ flag }} Selección de {{ equipo.nombre }} · Mundial 2026</span>
            <h1 class="pl-hero__title">Plantilla<br>oficial</h1>
          </div>
          <div class="pl-hero__counts"><strong>{{ plantilla.jugadores.length }}</strong><span>convocados</span></div>
        </div>
        <div class="pl-hero__metrics">
          <div
            v-for="(m, i) in (equipo.estadisticasDestacadas ?? [])"
            :key="i"
            :class="['pl-m', m.accent ? 'pl-m--accent' : '']"
          >
            <span class="pl-m__lab">{{ m.label }}</span>
            <div class="pl-m__num">{{ m.value }}</div>
            <span class="pl-m__cap">{{ m.caption }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="pro-section pro-container">
      <p class="pl-lead">
        Lista definitiva entregada por {{ equipo.dt.nombre.split(' ').slice(-1)[0] }} a FIFA el 4 de junio.
        {{ grupos.POR.length }} arqueros, {{ grupos.DEF.length }} defensas,
        {{ grupos.MED.length }} mediocampistas, {{ grupos.DEL.length }} delanteros.
        18 juegan en Europa, 5 en LigaPro, 3 en Liga MX/MLS.
      </p>

      <template v-for="pos in ordenPos" :key="pos">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">{{ seccion(pos).kicker }} · {{ grupos[pos].length }}</span>
            <h2 class="pro-sec-head__title">{{ seccion(pos).titulo }}</h2>
          </div>
        </div>
        <div class="bento pl-grid">
          <a
            v-for="j in grupos[pos]"
            :key="j.jugador.slug"
            class="ptile b-c3"
            :href="`/jugadores/${j.jugador.slug}/`"
            :style="j.capitan ? 'outline:3px solid var(--color-primary-green)' : ''"
          >
            <img src="/img/player-placeholder.svg" alt="" />
            <span
              class="ptile__num"
              :style="j.capitan ? 'background:#fff;color:var(--color-primary-green)' : ''"
            >{{ j.dorsal ?? '?' }}</span>
            <div class="ptile__body">
              <span class="ptile__pos">{{ j.capitan ? 'CAP · ' : '' }}{{ j.posicion }}</span>
              <span class="ptile__name">{{ j.jugador.nombre }}</span>
            </div>
          </a>
        </div>
      </template>
    </section>

    <!-- DATOS PLANTILLA -->
    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Datos plantilla</span>
          <h2 class="pro-sec-head__title">Por liga y por edad</h2>
        </div>
      </div>
      <BentoGrid>
        <article class="tile b-c6">
          <span class="tile__kicker">Liga de origen</span>
          <div class="bars pl-bars">
            <div v-for="l in ligas" :key="l.name" class="bar">
              <span class="bar__label">{{ l.name }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: l.pct + '%' }" /></div>
              <span class="bar__val">{{ l.n }}</span>
            </div>
          </div>
        </article>
        <article class="tile tile--dark b-c6">
          <span class="tile__kicker">Edad de los convocados</span>
          <div class="bars pl-bars pl-bars--dark">
            <div v-for="e in edades" :key="e.name" class="bar">
              <span class="bar__label">{{ e.name }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: e.pct + '%' }" /></div>
              <span class="bar__val">{{ e.n }}</span>
            </div>
          </div>
        </article>
      </BentoGrid>
    </section>

    <!-- CUERPO TÉCNICO -->
    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cuerpo técnico</span>
          <h2 class="pro-sec-head__title">El staff de {{ equipo.dt.nombre.split(' ').slice(-1)[0] }}</h2>
        </div>
      </div>
      <BentoGrid>
        <article class="tile tile--green b-c6 staff-dt">
          <span class="tile__kicker staff-dt__kicker">Director técnico</span>
          <div class="staff-dt__row">
            <div class="staff-dt__av">{{ iniciales(equipo.dt.nombre) }}</div>
            <div>
              <h3 class="tile__title staff-dt__name">{{ equipo.dt.nombre }}</h3>
              <p class="staff-dt__meta">🇦🇷 {{ equipo.dt.nacionalidad }} · 53 años · Asumió ago 2024</p>
              <p class="staff-dt__bio">
                Ex Independiente y Defensa y Justicia. Discípulo de Sampaoli.
                Llevó a la Tri al 2° lugar en eliminatorias.
              </p>
            </div>
          </div>
        </article>
        <div class="b-c6 staff-grid">
          <div
            v-for="(s, i) in (plantilla.cuerpoTecnico ?? []).filter((c) => c.rol !== 'DT')"
            :key="i"
            class="staff-card"
          >
            <div class="staff-card__av">{{ iniciales(s.nombre === 'TBD' ? s.rol : s.nombre) }}</div>
            <div>
              <div class="staff-card__name">{{ s.nombre === 'TBD' ? 'Por confirmar' : s.nombre }}</div>
              <span class="staff-card__role">{{ s.rol }}</span>
            </div>
          </div>
        </div>
      </BentoGrid>
    </section>

    <!-- EDITORIAL -->
    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Editorial · Cobertura plantilla</span>
          <h2 class="pro-sec-head__title">Lo último de la lista</h2>
        </div>
        <a href="/noticias/" class="pro-sec-head__cta">Ver todo →</a>
      </div>
      <BentoGrid>
        <a
          v-for="(n, i) in editorial.primarias"
          :key="`p${i}`"
          class="ed-card b-c6"
          :href="n.href"
        >
          <div class="ed-card__img"><img src="/img/news-placeholder.svg" alt="" /></div>
          <div class="ed-card__body">
            <span class="ed-card__kicker">{{ n.kicker }}</span>
            <h3 class="ed-card__title ed-card__title--lg">{{ n.title }}</h3>
            <p class="tile__caption">{{ n.body }}</p>
            <span class="ed-card__meta">{{ n.meta }}</span>
          </div>
        </a>
        <a
          v-for="(n, i) in editorial.secundarias"
          :key="`s${i}`"
          class="ed-card b-c4"
          :href="n.href"
        >
          <div class="ed-card__img"><img src="/img/news-placeholder.svg" alt="" /></div>
          <div class="ed-card__body">
            <span class="ed-card__kicker">{{ n.kicker }}</span>
            <h3 class="ed-card__title">{{ n.title }}</h3>
            <span class="ed-card__meta">{{ n.meta }}</span>
          </div>
        </a>
      </BentoGrid>
    </section>
  </div>
</template>

<style scoped>
/* Hero */
.pl-hero { position: relative; background: #000; color: #fff; overflow: hidden; }
.pl-hero__bg {
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(135deg, #000 0%, #0a3d20 60%, #067a4a 100%);
}
.pl-hero__inner {
  position: relative; z-index: 1;
  max-width: 1440px; margin: 0 auto;
  padding: 48px 20px 56px;
  display: grid; gap: 32px;
}
@media (min-width: 992px) { .pl-hero__inner { padding: 64px; gap: 40px; } }

.pl-hero__top { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: end; }
@media (min-width: 768px) { .pl-hero__top { grid-template-columns: 1fr auto; } }

.pl-hero__kicker {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-primary-green);
  display: flex; align-items: center; gap: 8px;
}
.pl-hero__kicker::before {
  content: ""; width: 24px; height: 2px; background: var(--color-primary-green);
}
.pl-hero__title {
  font-family: var(--font-display);
  font-size: clamp(56px, 9vw, 128px);
  line-height: 0.85; text-transform: uppercase; margin: 12px 0 0;
}
.pl-hero__counts { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.pl-hero__counts strong {
  font-family: var(--font-display); font-size: 64px; line-height: 1; color: #fff;
}
.pl-hero__counts span {
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.pl-hero__metrics {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px; overflow: hidden;
}
@media (min-width: 768px) { .pl-hero__metrics { grid-template-columns: repeat(4, 1fr); } }
.pl-m {
  background: rgba(0, 0, 0, 0.45);
  padding: 24px 22px;
  display: flex; flex-direction: column; gap: 8px;
}
.pl-m--accent { background: linear-gradient(135deg, var(--color-primary-green), #016b3d); }
.pl-m__lab {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.65);
}
.pl-m--accent .pl-m__lab { color: rgba(255, 255, 255, 0.9); }
.pl-m__num {
  font-family: var(--font-display); font-size: clamp(36px, 4vw, 52px);
  line-height: 1; color: #fff;
}
.pl-m__cap { font-size: 11px; color: rgba(255, 255, 255, 0.6); line-height: 1.45; }
.pl-m--accent .pl-m__cap { color: rgba(255, 255, 255, 0.85); }

/* Lead + listado */
.pl-lead {
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.65);
  max-width: 72ch;
  margin-bottom: 40px;
  text-wrap: pretty;
}
.pl-grid { margin-bottom: 32px; }

/* Bars helpers */
.pl-bars { margin-top: 12px; }
.pl-bars--dark .bar__label { color: rgba(255, 255, 255, 0.7); }
.pl-bars--dark .bar__track { background: rgba(255, 255, 255, 0.1); }
.pl-bars--dark .bar__val   { color: #fff; }

/* Cuerpo técnico */
.staff-dt__kicker { color: #fff; opacity: 0.85; }
.staff-dt__row { display: flex; gap: 20px; align-items: center; margin-top: 12px; }
.staff-dt__av {
  width: 96px; height: 96px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: grid; place-items: center;
  color: #fff; font-family: var(--font-display); font-size: 36px;
  flex-shrink: 0;
}
.staff-dt__name { color: #fff; font-size: 32px; }
.staff-dt__meta { color: rgba(255, 255, 255, 0.85); font-size: 13px; margin-top: 6px; }
.staff-dt__bio  { color: rgba(255, 255, 255, 0.75); font-size: 12px; margin-top: 8px; line-height: 1.5; }

.staff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 480px) { .staff-grid { grid-template-columns: 1fr; } }
.staff-card {
  display: flex; gap: 14px; align-items: center;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--color-divider);
  border-radius: 12px;
}
.staff-card__av {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #0a3d20, #067a4a);
  flex-shrink: 0;
  display: grid; place-items: center;
  color: #fff; font-family: var(--font-display); font-size: 20px;
}
.staff-card__name { font-family: var(--font-display); font-size: 18px; line-height: 1.05; }
.staff-card__role {
  font-size: 11px; color: var(--color-text-muted);
  letter-spacing: 0.08em; text-transform: uppercase;
  margin-top: 4px; display: block;
}

/* Editorial — título grande para las 2 cards primarias del mock */
.ed-card__title--lg { font-size: 28px; }
</style>
