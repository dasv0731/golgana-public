<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, buildSportsTeam, injectSchema } from '~/composables/useSchema';
import { flagCode } from '~/utils/flag-codes';

interface PartidoBase {
  fecha: string;
  fechaCorta: string;
  hora: string;
  rival: string;
  rivalSlug: string;
  competicion: string;
  sede: string;
  href: string;
  esLocal: boolean;
}
type ProximoPartido = PartidoBase & { estado: string };
type UltimoPartido  = PartidoBase & { resultado: string; marcadorLocal: number | null; marcadorVisitante: number | null };
interface PartidosResp {
  proximos: ProximoPartido[];
  ultimos: UltimoPartido[];
  fixture: ProximoPartido[];
}

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: partidos }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<PartidosResp>(`/api/selecciones/${slug}/partidos`),
]);
if (!equipo.value) throw createError({ statusCode: 404 });

useSeo(equipo.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre },
  ]),
  buildSportsTeam(equipo.value),
]);

// Hero — derivado del endpoint /api/selecciones/<slug>/partidos
const ultimo = computed(() => partidos.value?.ultimos?.[0] ?? null);
const proximo = computed(() => partidos.value?.proximos?.[0] ?? null);

// Fixture — todos los partidos Mundial 2026 del equipo
const fixture = computed(() => partidos.value?.fixture ?? []);

// Marca el partido más cercano (próximo) como variante "green" en la grilla
const proximoSlug = computed(() => proximo.value?.href ?? '');

const racha = [
  { r: 'G' }, { r: 'G' }, { r: 'E' }, { r: 'G' }, { r: 'P' },
  { r: 'G' }, { r: 'G' }, { r: 'E' }, { r: 'G' }, { r: 'G' },
] as const;

type XIRow = Array<{ num: number; name: string; cap?: boolean }>;
const xi: { rows: XIRow[]; padding?: string[] } = {
  rows: [
    [{ num: 14, name: 'Plata' }, { num: 9, name: 'E. Valencia' }, { num: 19, name: 'J. Sarmiento' }],
    [{ num: 23, name: 'M. Sarmiento' }, { num: 10, name: 'Páez' }, { num: 22, name: 'Caicedo (C)', cap: true }],
    [{ num: 7, name: 'Estupiñán' }, { num: 3, name: 'Hincapié' }, { num: 4, name: 'Pacho' }, { num: 17, name: 'Preciado' }],
    [{ num: 1, name: 'Galíndez' }],
  ],
  padding: ['', '0 14%', '', ''],
};

const stats = [
  { label: 'Posesión', val: '54%', width: 54 },
  { label: 'PPDA (presión)', val: '9.2', width: 78 },
  { label: 'Recuperaciones campo rival', val: '7.1', width: 71 },
  { label: 'xG por partido', val: '1.8', width: 63 },
];

const plantillaDestacada = [
  { num: 1, pos: 'POR', name: 'Galíndez' },
  { num: 4, pos: 'DEF', name: 'Pacho' },
  { num: 3, pos: 'DEF', name: 'Hincapié' },
  { num: 7, pos: 'DEF', name: 'Estupiñán' },
  { num: 17, pos: 'DEF', name: 'Preciado' },
  { num: 22, pos: 'CAP · MED', name: 'Caicedo', highlight: true, href: `/jugadores/moises-caicedo/` },
  { num: 23, pos: 'MED', name: 'M. Sarmiento' },
  { num: 10, pos: 'MED', name: 'Páez' },
  { num: 8,  pos: 'MED', name: 'Franco' },
  { num: 9,  pos: 'DEL', name: 'E. Valencia' },
  { num: 14, pos: 'DEL', name: 'Plata' },
  { num: 19, pos: 'DEL', name: 'J. Sarmiento' },
];

const editorial = {
  lead: {
    kicker: 'Análisis · 5 may',
    title: 'Beccacece confirma el XI: Caicedo capitán y Páez de enganche libre frente a Uzbekistán',
    body: 'El DT argentino sorprende con Páez de 10 y mantiene a Estupiñán pese a las dudas físicas. La práctica a puertas cerradas dejó pistas claras: presión alta desde el primer minuto y Plata por derecha como variante de desequilibrio.',
    meta: 'Por Carlos Mosquera · 8 min lectura',
    href: '#',
  },
  notas: [
    { kicker: 'Crónica',     title: 'Pacho responde a Inglaterra: "No le tenemos miedo a Bellingham"',  meta: '4 may · 4 min',  href: '#' },
    { kicker: 'Datos',       title: 'Por qué la Tri llega como mejor defensa de Conmebol',                meta: '3 may · 6 min',  href: '#' },
    { kicker: 'Entrevista',  title: 'Kendry Páez: "Crecí viendo Mundiales, ahora me toca jugar uno"',     meta: '2 may · 12 min', href: '#' },
    { kicker: 'Opinión',     title: '¿Hincapié o Mina como tercero detrás? El dilema de Beccacece',      meta: '1 may · 7 min',  href: '#' },
    { kicker: 'Hinchada',    title: '22.000 ecuatorianos viajan a Atlanta: el operativo de la Tri Embajadora', meta: '30 abr · 5 min', href: '#' },
  ],
};

const historia = [
  { kicker: '2002 · Corea/Japón', title: 'Debut',   caption: 'Fase de grupos · 1G 2P · Eliminado.', variant: 'default' as const },
  { kicker: '2006 · Alemania',    title: 'Octavos', caption: 'Mejor actuación · perdió 0-3 con Inglaterra.', variant: 'green' as const },
  { kicker: '2014 · Brasil',      title: 'Grupos',  caption: 'Suiza-Honduras-Francia · 4 pts · eliminado por gol diferencia.', variant: 'default' as const },
  { kicker: '2022 · Catar',       title: 'Grupos',  caption: 'Catar-Países Bajos-Senegal · 4 pts · eliminado por gol diferencia.', variant: 'default' as const },
];

// Bandera del equipo: usar flagCode(slug) → <TeamFlag>.
</script>

<template>
  <div v-if="equipo">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Selecciones', to: '/selecciones/' },
          { label: equipo.nombre },
        ]"
      />
    </div>

    <!-- HERO -->
    <section class="eq-hero">
      <div class="eq-hero__bg" />
      <div class="eq-hero__inner">
        <div class="eq-hero__left">
          <div class="eq-hero__head">
            <div class="eq-hero__crest">
              <TeamFlag :flag-code="flagCode(equipo.slug)" :name="equipo.nombre" :size="120" :rounded="50" />
            </div>
            <div>
              <span class="eq-hero__kicker">Selección de {{ equipo.nombre }}</span>
              <h1 class="eq-hero__title">{{ equipo.apodo ?? equipo.nombre }}</h1>
              <div class="eq-hero__meta">
                <span>DT: {{ equipo.dt.nombre }}</span>
                <span v-if="equipo.fifaRank">FIFA {{ equipo.fifaRank }}°</span>
                <span>4° Mundial</span>
              </div>
            </div>
          </div>

          <div class="eq-hero__metrics">
            <div
              v-for="(m, i) in (equipo.estadisticasDestacadas ?? [])"
              :key="i"
              :class="['eq-hero__metric', m.accent ? 'eq-hero__metric--accent' : '']"
            >
              <span class="eq-hero__metric-label">{{ m.label }}</span>
              <div class="eq-hero__metric-num">{{ m.value }}</div>
              <span class="eq-hero__metric-cap">{{ m.caption }}</span>
            </div>
          </div>
        </div>

        <aside class="eq-hero__side">
          <div v-if="ultimo" class="eq-hero__match">
            <span class="eq-hero__metric-label muted">Último partido · {{ ultimo.competicion }}</span>
            <div class="eq-hero__match-row">
              <div class="eq-hero__match-teams" style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">
                <TeamFlag :flag-code="flagCode(equipo.slug)" :name="equipo.nombre" :size="18" />
                {{ equipo.nombre }}
                <span class="vs">vs</span>
                <TeamFlag :flag-code="flagCode(ultimo.rivalSlug)" :name="ultimo.rival" :size="18" />
                {{ ultimo.rival }}
              </div>
              <span class="eq-hero__match-score">{{ ultimo.resultado }}</span>
            </div>
            <span class="eq-hero__metric-cap">{{ ultimo.fechaCorta }} · {{ ultimo.sede }}</span>
          </div>
          <div v-else class="eq-hero__match">
            <span class="eq-hero__metric-label muted">Último partido</span>
            <p class="eq-hero__metric-cap">Sin partidos finalizados aún.</p>
          </div>

          <div v-if="proximo" class="eq-hero__match eq-hero__match--accent">
            <span class="eq-hero__metric-label">Próximo · {{ proximo.competicion }}</span>
            <div class="eq-hero__match-row">
              <div>
                <div class="eq-hero__match-teams" style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">
                  <TeamFlag :flag-code="flagCode(equipo.slug)" :name="equipo.nombre" :size="18" />
                  {{ equipo.nombre }}
                  <span class="vs vs--light">vs</span>
                  <TeamFlag :flag-code="flagCode(proximo.rivalSlug)" :name="proximo.rival" :size="18" />
                  {{ proximo.rival }}
                </div>
                <span class="eq-hero__metric-cap eq-hero__metric-cap--light">{{ proximo.sede }} · {{ proximo.hora }}</span>
              </div>
              <div class="eq-hero__match-date">{{ proximo.fechaCorta }}</div>
            </div>
            <a :href="proximo.href" class="eq-hero__match-cta">Ver previa →</a>
          </div>
          <div v-else class="eq-hero__match eq-hero__match--accent">
            <span class="eq-hero__metric-label">Próximo</span>
            <p class="eq-hero__metric-cap eq-hero__metric-cap--light">Por confirmar.</p>
          </div>
        </aside>
      </div>
    </section>

    <PageIndex
      :items="[
        { label: 'Resumen', href: '#resumen' },
        { label: 'Fixture', href: '#fixture' },
        { label: 'Estilo', href: '#estilo' },
        { label: 'Plantilla', href: '#plantilla' },
        { label: 'Noticias', href: '#noticias' },
        { label: 'Historia', href: '#historia' },
      ]"
    />

    <!-- RESUMEN -->
    <section id="resumen" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cómo llega</span>
          <h2 class="pro-sec-head__title">{{ equipo.apodo ?? equipo.nombre }} 2026 en cifras</h2>
        </div>
      </div>

      <BentoGrid>
        <article class="tile tile--green b-c4">
          <span class="tile__kicker">Eliminatorias</span>
          <div class="tile__big-num">2°</div>
          <p class="tile__caption">Conmebol · 25 pts en 18 PJ</p>
        </article>
        <article class="tile b-c4">
          <span class="tile__kicker">Goles a favor</span>
          <div class="tile__big-num accent">22</div>
          <p class="tile__caption">3° mejor ataque eliminatorias</p>
        </article>
        <article class="tile tile--dark b-c4">
          <span class="tile__kicker">Mundialistas activos</span>
          <div class="tile__big-num">14</div>
          <p class="tile__caption">Estuvieron en Qatar 2022</p>
        </article>

        <article class="tile b-c8">
          <span class="tile__kicker">Forma últimos 10 amistosos</span>
          <h3 class="tile__title">Racha sólida — 7G · 2E · 1P</h3>
          <span class="streak">
            <span
              v-for="(s, i) in racha"
              :key="i"
              :class="[
                'streak__b',
                s.r === 'G' ? 'streak__b--w' : s.r === 'E' ? 'streak__b--d' : 'streak__b--l',
              ]"
            >{{ s.r }}</span>
          </span>
          <p class="tile__caption mt-sm">
            vs México (1-0) · Brasil (1-0) · Italia (1-1) · Japón (2-1) · Portugal (1-2)
          </p>
        </article>

        <article class="tile tile--dark b-c4 pieza-clave">
          <span class="tile__kicker">Pieza clave</span>
          <div class="pc__row">
            <div class="pc__num">22</div>
            <div>
              <h3 class="tile__title pc__name">Moisés Caicedo</h3>
              <p class="pc__role">Capitán · Mediocentro · Chelsea</p>
            </div>
          </div>
          <a href="/jugadores/moises-caicedo/" class="btn btn--primary pc__cta">Ver perfil →</a>
        </article>
      </BentoGrid>
    </section>

    <!-- FIXTURE -->
    <section id="fixture" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Calendario fase de grupos</span>
          <h2 class="pro-sec-head__title">{{ fixture.length }} partidos</h2>
        </div>
        <NuxtLink
          :to="`/selecciones/${equipo.slug}/partidos/`"
          class="pro-sec-head__cta"
        >Ver calendario completo →</NuxtLink>
      </div>

      <BentoGrid v-if="fixture.length > 0">
        <a
          v-for="(p, i) in fixture"
          :key="i"
          class="tile b-c4"
          :class="p.href === proximoSlug ? 'tile--green' : ''"
          :href="p.href"
        >
          <span class="tile__kicker">{{ p.competicion }} · {{ p.fechaCorta }}</span>
          <h3 class="tile__title fixture__rival">
            <span v-if="p.esLocal">vs {{ p.rival }}</span>
            <span v-else>en casa de {{ p.rival }}</span>
          </h3>
          <p class="tile__caption">{{ p.hora }} · {{ p.sede }}</p>
          <span
            :class="p.href === proximoSlug ? 'pchip pchip--on-green' : 'pchip pchip--soft-green'"
          >
            {{ p.estado === 'finished' ? 'Finalizado' : p.estado === 'live' ? 'En vivo' : 'Programado' }}
          </span>
        </a>
      </BentoGrid>
      <p v-else class="tile__caption">Aún no hay partidos cargados para esta selección.</p>
    </section>

    <!-- ESTILO -->
    <section id="estilo" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Sistema de {{ equipo.dt.nombre.split(' ').slice(-1)[0] }}</span>
          <h2 class="pro-sec-head__title">Cómo juega {{ equipo.nombre }}</h2>
        </div>
      </div>

      <BentoGrid>
        <article class="tile b-c7 estilo__txt">
          <div class="chip-row">
            <span class="pchip pchip--green">4-3-3</span>
            <span class="pchip pchip--green">Presión alta</span>
            <span class="pchip">Salida desde el fondo</span>
            <span class="pchip">Pivote único</span>
            <span class="pchip pchip--out">Transición vertical</span>
            <span class="pchip pchip--dark">Bloque medio</span>
          </div>
          <p class="estilo__lead">
            El 4-3-3 de Beccacece se sostiene en tres pilares: Caicedo como pivote único que permite a Sarmiento e Hincapié subir,
            una línea defensiva alta con Pacho e Hincapié leyendo el offside, y dos extremos abiertos —Plata por derecha,
            Páez por izquierda— que generan superioridades. La identidad: presionar en campo rival y atacar el espacio cuando se recupera.
          </p>
          <div class="bars">
            <div v-for="(s, i) in stats" :key="i" class="bar">
              <span class="bar__label">{{ s.label }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: s.width + '%' }" /></div>
              <span class="bar__val">{{ s.val }}</span>
            </div>
          </div>
        </article>

        <article class="tile tile--dark b-c5 estilo__pitch">
          <div class="estilo__pitch-head">
            <span class="tile__kicker">XI titular probable</span>
            <span class="estilo__formation">4-3-3</span>
          </div>
          <div class="pitch">
            <span class="pitch__mid" />
            <span class="pitch__circle" />
            <div class="pitch__rows">
              <div
                v-for="(row, i) in xi.rows"
                :key="i"
                class="pitch__row"
                :style="xi.padding?.[i] ? `padding:0 ${xi.padding[i]}` : ''"
              >
                <div
                  v-for="p in row"
                  :key="p.num"
                  :class="['pp', p.cap ? 'pp--cap' : '']"
                >
                  <span class="pp__num">{{ p.num }}</span>
                  <span class="pp__name">{{ p.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </BentoGrid>
    </section>

    <!-- PLANTILLA -->
    <section id="plantilla" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">26 convocados</span>
          <h2 class="pro-sec-head__title">Plantilla oficial</h2>
        </div>
        <NuxtLink
          :to="`/selecciones/${equipo.slug}/plantilla/`"
          class="pro-sec-head__cta"
        >Ver plantilla completa →</NuxtLink>
      </div>

      <div class="chip-row plantilla__chips">
        <span class="pchip pchip--green">3 POR</span>
        <span class="pchip">9 DEF</span>
        <span class="pchip">8 MED</span>
        <span class="pchip">6 DEL</span>
      </div>

      <BentoGrid>
        <a
          v-for="p in plantillaDestacada"
          :key="p.num"
          class="ptile b-c2"
          :href="p.href ?? '#'"
          :style="p.highlight ? 'outline:3px solid var(--color-primary-green)' : ''"
        >
          <img src="/img/player-placeholder.svg" alt="" />
          <span
            class="ptile__num"
            :style="p.highlight ? 'background:var(--color-primary-green);color:#fff' : ''"
          >{{ p.num }}</span>
          <div class="ptile__body">
            <span class="ptile__pos">{{ p.pos }}</span>
            <span class="ptile__name">{{ p.name }}</span>
          </div>
        </a>
      </BentoGrid>
    </section>

    <!-- EDITORIAL -->
    <section id="noticias" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Editorial · cobertura {{ equipo.apodo ?? equipo.nombre }}</span>
          <h2 class="pro-sec-head__title">Lo último de {{ equipo.nombre }}</h2>
        </div>
        <a href="/noticias/" class="pro-sec-head__cta">Ver todo →</a>
      </div>

      <BentoGrid>
        <a class="ed-card ed-card--lead b-c8" :href="editorial.lead.href">
          <div class="ed-card__img"><img src="/img/news-placeholder.svg" alt="" /></div>
          <div class="ed-card__body">
            <span class="ed-card__kicker">{{ editorial.lead.kicker }}</span>
            <h3 class="ed-card__title">{{ editorial.lead.title }}</h3>
            <p class="tile__caption">{{ editorial.lead.body }}</p>
            <span class="ed-card__meta">{{ editorial.lead.meta }}</span>
          </div>
        </a>

        <a
          v-for="(n, i) in editorial.notas"
          :key="i"
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

    <!-- HISTORIA -->
    <section id="historia" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Mundiales anteriores</span>
          <h2 class="pro-sec-head__title">Historia mundialista</h2>
        </div>
      </div>
      <BentoGrid>
        <article
          v-for="(h, i) in historia"
          :key="i"
          class="tile b-c3"
          :class="h.variant === 'green' ? 'tile--green' : ''"
        >
          <span class="tile__kicker">{{ h.kicker }}</span>
          <h3 class="tile__title">{{ h.title }}</h3>
          <p class="tile__caption">{{ h.caption }}</p>
        </article>
      </BentoGrid>
    </section>
  </div>
</template>

<style scoped>
/* Hero específico de la página Mundial-Equipo (no global) */
.eq-hero { position: relative; background: #000; color: #fff; overflow: hidden; }
.eq-hero__bg {
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(135deg, #000 0%, #0a3d20 55%, #067a4a 100%);
}
.eq-hero__bg::after {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 212, 0, 0.18), transparent 50%);
}
.eq-hero__inner {
  position: relative; z-index: 1;
  max-width: 1440px; margin: 0 auto;
  padding: 48px 20px 56px;
  display: grid; gap: 32px; grid-template-columns: 1fr;
}
@media (min-width: 992px) {
  .eq-hero__inner {
    grid-template-columns: 1.55fr 1fr;
    padding: 64px 64px 72px;
    gap: 48px; align-items: stretch;
  }
}

.eq-hero__left { display: flex; flex-direction: column; gap: 32px; align-items: stretch; }
.eq-hero__head {
  display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center;
}
@media (max-width: 640px) { .eq-hero__head { grid-template-columns: 1fr; } }

.eq-hero__crest {
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.18);
  display: grid; place-items: center; flex-shrink: 0;
}
.eq-hero__crest span { font-size: 88px; line-height: 1; }
@media (min-width: 992px) {
  .eq-hero__crest { width: 200px; height: 200px; }
  .eq-hero__crest span { font-size: 120px; }
}

.eq-hero__kicker {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-primary-green);
  display: flex; align-items: center; gap: 8px;
}
.eq-hero__kicker::before {
  content: ""; width: 24px; height: 2px;
  background: var(--color-primary-green); display: inline-block;
}
.eq-hero__title {
  font-family: var(--font-display);
  font-size: clamp(64px, 11vw, 160px); line-height: 0.85;
  text-transform: uppercase; margin: 12px 0 0; letter-spacing: -0.01em;
}
.eq-hero__meta {
  display: flex; flex-wrap: wrap; gap: 14px; margin-top: 20px;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.55);
}
.eq-hero__meta > * + *::before {
  content: "·"; margin-right: 14px; color: var(--color-primary-green);
}

.eq-hero__metrics {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px; overflow: hidden;
}
@media (max-width: 640px) { .eq-hero__metrics { grid-template-columns: repeat(2, 1fr); } }
.eq-hero__metric {
  background: rgba(0, 0, 0, 0.45);
  padding: 18px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.eq-hero__metric--accent {
  background: linear-gradient(135deg, var(--color-primary-green), #016b3d);
}
.eq-hero__metric-label {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}
.eq-hero__metric-label.muted { color: rgba(255, 255, 255, 0.55); }
.eq-hero__metric--accent .eq-hero__metric-label { color: rgba(255, 255, 255, 0.85); }
.eq-hero__metric-num {
  font-family: var(--font-display); font-size: 32px; line-height: 1; color: #fff;
}
.eq-hero__metric-cap {
  font-size: 11px; color: rgba(255, 255, 255, 0.55); line-height: 1.4;
}
.eq-hero__metric-cap--light { color: rgba(255, 255, 255, 0.85); margin-top: 6px; display: block; }

.eq-hero__side {
  display: grid; grid-template-columns: 1fr; gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px; overflow: hidden; align-self: stretch;
}
.eq-hero__match {
  background: rgba(0, 0, 0, 0.4);
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 8px;
}
.eq-hero__match--accent {
  background: linear-gradient(135deg, var(--color-primary-green) 0%, #016b3d 100%);
  padding: 24px 22px;
}
.eq-hero__match-row {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
}
.eq-hero__match--accent .eq-hero__match-row { align-items: flex-end; }
.eq-hero__match-teams {
  color: #fff; font-family: var(--font-primary); font-weight: 600; font-size: 15px;
}
.eq-hero__match-teams .vs { color: rgba(255, 255, 255, 0.4); margin: 0 6px; }
.eq-hero__match-teams .vs--light { color: rgba(255, 255, 255, 0.55); }
.eq-hero__match-score {
  font-family: var(--font-display); font-size: 32px;
  color: var(--color-primary-green); line-height: 1;
}
.eq-hero__match-date {
  font-family: var(--font-display); font-size: 36px; color: #fff; line-height: 1;
}
.eq-hero__match-cta {
  display: inline-flex; align-self: flex-start; margin-top: 6px;
  color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; border-bottom: 2px solid #fff; padding-bottom: 2px;
}

/* Tile helpers locales (no se exportan al global) */
.tile__big-num.accent { color: var(--color-primary-green); }
.mt-sm { margin-top: 8px; }
.streak { margin-top: 8px; display: inline-flex; gap: 4px; }

.pieza-clave { border-color: rgba(255, 255, 255, 0.08); }
.pc__row { display: flex; align-items: center; gap: 16px; margin-top: 8px; }
.pc__num {
  width: 64px; height: 64px; background: rgba(255, 255, 255, 0.1);
  border-radius: 50%; display: grid; place-items: center;
  font-family: var(--font-display); font-size: 24px; color: #fff;
}
.pc__name { color: #fff; font-size: 22px; }
.pc__role { color: rgba(255, 255, 255, 0.7); font-size: 12px; }
.pc__cta { margin-top: 12px; align-self: flex-start; }

.fixture__rival { font-size: 24px; }
.tile--green .fixture__rival { color: #fff; }

.pchip--on-green { background: #fff; color: var(--color-primary-green); align-self: flex-start; margin-top: auto; }
.pchip--soft-green { background: rgba(2, 204, 116, 0.15); color: var(--color-primary-green); align-self: flex-start; margin-top: auto; }
.pchip--out { align-self: flex-start; margin-top: auto; }

.estilo__txt { display: flex; flex-direction: column; gap: 16px; }
.estilo__lead { color: var(--color-text-muted); max-width: 80ch; line-height: 1.7; }
.estilo__pitch { background: #0a0a0a; }
.estilo__pitch-head {
  display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;
}
.estilo__formation {
  font-family: var(--font-display); color: var(--color-primary-green); font-size: 18px;
}

.plantilla__chips { margin-bottom: 16px; }
</style>
