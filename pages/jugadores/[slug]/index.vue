<script setup lang="ts">
import type { Equipo, Jugador, Plantilla } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const jugSlug = route.params.slug as string;

const { data: jugador } = await useFetch<Jugador>(`/api/jugadores/${jugSlug}`);
if (!jugador.value) throw createError({ statusCode: 404 });

// Selección + plantilla son opcionales: solo se piden si el jugador tiene selección asociada.
const seleSlug = jugador.value.seleccion?.slug ?? null;
const { data: equipo }    = seleSlug ? await useFetch<Equipo>(`/api/selecciones/${seleSlug}`) : { data: ref<Equipo | null>(null) };
const { data: plantilla } = seleSlug ? await useFetch<Plantilla>(`/api/selecciones/${seleSlug}/plantilla`) : { data: ref<Plantilla | null>(null) };

useSeo(jugador.value.seo);

const config = useRuntimeConfig();
injectSchema(buildBreadcrumbList([
  { name: 'Inicio', url: config.public.siteUrl + '/' },
  { name: 'Jugadores', url: config.public.siteUrl + '/jugadores/' },
  { name: jugador.value.nombre },
]));

// Datos cruzados desde la plantilla (si existe)
const ficha = plantilla.value?.jugadores.find((p) => p.jugador.slug === jugSlug);
const dorsal = ficha?.dorsal ?? null;
const posicionDetalle = ficha?.posicionDetalle ?? jugador.value.posicion;
const esCapitan = ficha?.capitan ?? false;

// Helpers
const flagMap: Record<string, string> = { EC: '🇪🇨', GB: '🏴', CI: '🇨🇮', UZ: '🇺🇿', AR: '🇦🇷' };
const flag = (equipo.value && flagMap[equipo.value.pais]) || '⚽';
const pieMap: Record<string, string> = { izquierdo: 'Izquierdo', derecho: 'Derecho', ambidiestro: 'Ambidiestro' };
const pieLabel = pieMap[jugador.value.pieDominante ?? 'derecho'];
const valor = jugador.value.valorMercado ? `€${(jugador.value.valorMercado.monto / 1_000_000).toFixed(0)}M` : '—';

// Mocks específicos del Mundial (luego al CMS)
const tempStats = [
  { num: '38', label: 'Partidos jugados' },
  { num: '3.420', label: 'Minutos' },
  { num: '3', label: 'Goles · 5 asistencias' },
  { num: '91%', label: 'Precisión pases' },
];

const rolChips = [
  { txt: 'Pivote único', cls: 'pchip pchip--green' },
  { txt: 'Capitán',       cls: 'pchip pchip--green' },
  { txt: 'Salida primera línea', cls: 'pchip' },
  { txt: 'Cobertura defensiva',  cls: 'pchip' },
  { txt: 'Largo a banda',        cls: 'pchip pchip--out' },
];

const mundial2022 = {
  pj: 3,
  minutos: '270\'',
  rating: '7.2',
  texto: 'Titular en los 3 partidos. A los 21 años fue de los mejores mediocampistas defensivos del torneo.',
};

const heatmapBlobs = [
  { w: 26, h: 30, top: 38, left: 37, op: 0.85 },
  { w: 20, h: 24, top: 28, left: 28, op: 0.55 },
  { w: 18, h: 22, top: 52, left: 56, op: 0.45 },
  { w: 14, h: 18, top: 46, left: 16, op: 0.35 },
];

const percentiles = [
  { label: 'Recuperaciones',    val: 99 },
  { label: 'Tackles ganados',   val: 94 },
  { label: 'Intercepciones',    val: 88 },
  { label: 'Duelos ganados',    val: 84 },
  { label: 'Pases progresivos', val: 71 },
  { label: 'Pases completados', val: 78 },
  { label: 'Distancia recorrida', val: 91 },
  { label: 'Conducciones',      val: 62 },
  { label: 'Goles xG',          val: 34 },
  { label: 'Asistencias xA',    val: 48 },
];

// Notas curatoriales por club (mock; el JSON solo tiene `notas` cortas)
const trayectoriaNotas: Record<string, { titulo?: string; texto: string; trofeo?: string }> = {
  'independiente-del-valle': { titulo: 'Cantera + pro', texto: 'Formación en las juveniles del Rayado del Valle y debut profesional. 28 partidos en Serie A antes del traspaso a Brighton.', trofeo: '🏆 Copa Sudamericana 2019 (cantera)' },
  beerschot: { texto: 'Cesión de 5 meses para adaptación al fútbol europeo. 7 partidos en la Jupiler Pro League belga.' },
  brighton:  { texto: 'Explosión bajo De Zerbi en la temporada 22/23. Fichaje récord al Chelsea en agosto 2023 por £115M.' },
  chelsea:   { texto: 'Contrato hasta 2031. Volante titular y uno de los líderes del proyecto de Maresca. Capitán alterno.', trofeo: '🏆 Conference League 2024/25' },
};

const yyyy = (iso: string) => new Date(iso).getFullYear();
const periodo = (desde: string, hasta?: string) => `${yyyy(desde)} – ${hasta ? yyyy(hasta) : 'hoy'}`;
</script>

<template>
  <div v-if="jugador">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Jugadores', to: '/jugadores/' },
          { label: jugador.nombre },
        ]"
      />
    </div>

    <!-- HERO -->
    <section class="pro-hero">
      <div class="pro-hero__inner">
        <div class="pro-hero__main">
          <div class="pro-hero__bg jp-hero__bg" />
          <div class="jp-id">
            <div class="jp-photo">
              <img src="/img/player-placeholder.svg" :alt="jugador.nombre" />
              <span v-if="dorsal" class="jp-photo__num">{{ dorsal }}</span>
            </div>

            <div class="jp-id__col">
              <span class="jp-kicker">Perfil · {{ equipo ? `Selección ${equipo.nombre}` : 'Jugador' }}</span>
              <div>
                <h1 class="jp-name">{{ jugador.nombre }}</h1>
                <p class="jp-fullname">{{ jugador.nombreCompleto }}</p>
              </div>
              <div class="jp-chips">
                <span v-if="jugador.apodo" class="jp-chip">{{ jugador.apodo }}</span>
                <span v-if="esCapitan && equipo" class="jp-chip jp-chip--accent">Capitán de {{ equipo.apodo ?? equipo.nombre }}</span>
              </div>
              <div class="jp-grid2">
                <div class="jp-grid2__cell">
                  <span class="jp-grid2__lab">Club actual</span>
                  <div class="jp-grid2__val">{{ jugador.clubActual.nombre }}</div>
                </div>
                <div v-if="equipo" class="jp-grid2__cell">
                  <span class="jp-grid2__lab">{{ flag }} Selección</span>
                  <div class="jp-grid2__val">{{ equipo.nombre }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="pro-hero__side jp-aside">
          <span class="jp-kicker">Ficha técnica</span>
          <div class="jp-ficha">
            <div class="jp-ficha__cell jp-ficha__cell--full">
              <span class="jp-ficha__lab">Posición</span>
              <div class="jp-ficha__val jp-ficha__val--md">{{ posicionDetalle }}</div>
            </div>
            <div class="jp-ficha__cell">
              <span class="jp-ficha__lab">Dorsal</span>
              <div class="jp-ficha__val jp-ficha__val--lg">#{{ dorsal ?? '—' }}</div>
            </div>
            <div class="jp-ficha__cell">
              <span class="jp-ficha__lab">Pie</span>
              <div class="jp-ficha__val">{{ pieLabel }}</div>
            </div>
            <div class="jp-ficha__cell">
              <span class="jp-ficha__lab">Altura</span>
              <div class="jp-ficha__val">{{ jugador.altura ? (jugador.altura / 100).toFixed(2) + ' m' : '—' }}</div>
            </div>
            <div class="jp-ficha__cell">
              <span class="jp-ficha__lab">Peso</span>
              <div class="jp-ficha__val">{{ jugador.peso ? jugador.peso + ' kg' : '—' }}</div>
            </div>
            <div class="jp-ficha__cell jp-ficha__cell--accent jp-ficha__cell--full">
              <span class="jp-ficha__lab">Precio actual</span>
              <div class="jp-ficha__val jp-ficha__val--xl">{{ valor }}</div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <PageIndex
      :items="[
        { label: 'Temporada', href: '#temporada' },
        { label: 'En el Mundial', href: '#mundial' },
        { label: 'Perfil', href: '#radar' },
        { label: 'Carrera', href: '#carrera' },
      ]"
    />

    <!-- TEMPORADA -->
    <section id="temporada" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Premier League 2025/26</span>
          <h2 class="pro-sec-head__title">Cómo llega al Mundial</h2>
        </div>
      </div>
      <p class="jp-lead">
        A los {{ new Date().getFullYear() - new Date(jugador.fechaNacimiento).getFullYear() }} años llega a su segundo Mundial como capitán y motor del equipo.
        Premier League titular indiscutido en {{ jugador.clubActual.nombre }}: 38 partidos esta temporada,
        91% pases completados, líder de recuperaciones del torneo inglés.
      </p>
      <div class="stat-row jp-stats">
        <div v-for="(s, i) in tempStats" :key="i" class="stat-row__cell">
          <span class="stat-row__num">{{ s.num }}</span>
          <span class="stat-row__label">{{ s.label }}</span>
        </div>
      </div>
      <BentoGrid>
        <article class="tile b-c6">
          <span class="tile__kicker">Recuperaciones por 90'</span>
          <div class="tile__big-num jp-num--green">9.4</div>
          <p class="tile__caption">1° de la Premier League · sobre 220 mediocentros con +1500 min</p>
        </article>
        <article class="tile tile--dark b-c6">
          <span class="tile__kicker">Duelos terrestres ganados</span>
          <div class="tile__big-num">68%</div>
          <p class="tile__caption">Top 5% en Big-5 europeo · 12.1 duelos/90'</p>
        </article>
      </BentoGrid>
    </section>

    <!-- MUNDIAL -->
    <section id="mundial" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Su rol en la Tri 2026</span>
          <h2 class="pro-sec-head__title">El pulmón del 4-3-3</h2>
        </div>
      </div>
      <BentoGrid>
        <article class="tile b-c8">
          <div class="chip-row jp-chips-row">
            <span v-for="(c, i) in rolChips" :key="i" :class="c.cls">{{ c.txt }}</span>
          </div>
          <p class="jp-rol-txt">
            Beccacece lo libera de la marca al hombre y lo planta entre líneas: {{ jugador.nombre.split(' ').slice(-1)[0] }} recibe del central, gira y abre a banda.
            En defensa cubre los 30 metros que dejan Sarmiento y Páez al subir. Es el único intransferible del XI.
          </p>
        </article>

        <article class="tile tile--green b-c4">
          <span class="tile__kicker">Mundial Catar 2022</span>
          <div class="jp-w22">
            <div><span class="jp-w22__num">{{ mundial2022.pj }}</span><span class="jp-w22__lab">PJ</span></div>
            <div><span class="jp-w22__num">{{ mundial2022.minutos }}</span><span class="jp-w22__lab">Minutos</span></div>
            <div><span class="jp-w22__num">{{ mundial2022.rating }}</span><span class="jp-w22__lab">Rating WS</span></div>
          </div>
          <p class="jp-w22__txt">{{ mundial2022.texto }}</p>
        </article>

        <article class="tile tile--dark b-c12">
          <span class="tile__kicker">Heatmap conceptual · zonas de juego</span>
          <h3 class="tile__title jp-heat-title">Donde aparece {{ jugador.nombre.split(' ').slice(-1)[0] }} en cancha</h3>
          <figure class="jp-heat-fig">
            <div class="heatmap" :aria-label="`Heatmap conceptual de ${jugador.nombre}`">
              <span
                v-for="(b, i) in heatmapBlobs"
                :key="i"
                class="heatmap-blob"
                :style="{
                  width: b.w + '%', height: b.h + '%',
                  top: b.top + '%', left: b.left + '%',
                  background: `rgba(2,204,116,${b.op})`,
                }"
              />
            </div>
            <figcaption class="jp-heat-cap">Heatmap conceptual · temporada 24/25 · elaboración Golgana</figcaption>
          </figure>
        </article>
      </BentoGrid>
    </section>

    <!-- RADAR / PERCENTILES -->
    <section id="radar" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Perfil estadístico · vs mediocentros Big-5</span>
          <h2 class="pro-sec-head__title">Percentiles 2025/26</h2>
        </div>
      </div>
      <BentoGrid>
        <article class="tile b-c12">
          <div class="bars jp-bars">
            <div v-for="(p, i) in percentiles" :key="i" class="bar">
              <span class="bar__label">{{ p.label }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: p.val + '%' }" /></div>
              <span class="bar__val">{{ p.val }}</span>
            </div>
          </div>
        </article>
      </BentoGrid>
    </section>

    <!-- CARRERA / TIMELINE -->
    <section id="carrera" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Carrera profesional</span>
          <h2 class="pro-sec-head__title">De Independiente del Valle a Stamford Bridge</h2>
        </div>
        <NuxtLink :to="`/jugadores/${jugador.slug}/trayectoria/`" class="pro-sec-head__cta">Detalle completo →</NuxtLink>
      </div>
      <div class="tl" :aria-label="`Clubes en la carrera de ${jugador.nombre}`">
        <div
          v-for="(t, i) in jugador.trayectoria"
          :key="t.club.slug + t.desde"
          class="tl__item"
        >
          <div class="tl__period">{{ periodo(t.desde, t.hasta) }}</div>
          <div class="tl__club">
            <img :src="`/img/crest-placeholder.svg`" alt="" />{{ t.club.nombre }}{{ t.tipo === 'cesion' ? ' (cedido)' : '' }}
          </div>
          <div class="tl__text">
            {{ trayectoriaNotas[t.club.slug]?.texto ?? t.notas ?? '' }}
            <template v-if="t.partidos">{{ trayectoriaNotas[t.club.slug] ? '' : ` ${t.partidos} partidos${t.goles ? ` · ${t.goles} goles` : ''}.` }}</template>
          </div>
          <span v-if="trayectoriaNotas[t.club.slug]?.trofeo" class="tl__trophy">
            {{ trayectoriaNotas[t.club.slug]!.trofeo }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.jp-hero__bg {
  background: linear-gradient(135deg, #000 0%, #0a3d20 60%, #067a4a 100%);
  z-index: -1;
}

/* Identidad principal: foto + bloque de datos */
.jp-id {
  display: grid; grid-template-columns: 200px 1fr; gap: 28px;
  align-items: center; max-width: 760px;
}
@media (max-width: 640px) { .jp-id { grid-template-columns: 1fr; } }

.jp-photo {
  position: relative; aspect-ratio: 4 / 5;
  border-radius: 16px; overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.12));
}
.jp-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.jp-photo__num {
  position: absolute; top: 10px; left: 10px;
  background: #fff; color: var(--color-primary-green);
  font-family: var(--font-display); font-size: 22px;
  width: 42px; height: 42px; border-radius: 50%;
  display: grid; place-items: center; line-height: 1;
}

.jp-id__col { display: flex; flex-direction: column; gap: 14px; }

.jp-kicker {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}

.jp-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 7vw, 88px);
  color: #fff; line-height: 0.92;
}
.jp-fullname { margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.7); line-height: 1.4; }

.jp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.jp-chip {
  font-size: 12px; letter-spacing: 0.06em;
  background: rgba(255, 255, 255, 0.1); color: #fff;
  padding: 7px 12px; border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.jp-chip--accent {
  background: rgba(2, 204, 116, 0.18);
  border-color: rgba(2, 204, 116, 0.4);
}

.jp-grid2 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px; overflow: hidden;
  margin-top: 4px; max-width: 420px;
}
.jp-grid2__cell { background: rgba(0, 0, 0, 0.4); padding: 12px 14px; }
.jp-grid2__lab {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.jp-grid2__val {
  color: #fff; font-family: var(--font-primary); font-weight: 600;
  font-size: 14px; margin-top: 4px;
}

/* Aside: ficha técnica */
.jp-aside { display: flex; flex-direction: column; gap: 14px; }
.jp-ficha {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px; overflow: hidden;
}
.jp-ficha__cell {
  background: rgba(0, 0, 0, 0.4);
  padding: 14px 16px;
}
.jp-ficha__cell--full { grid-column: 1 / -1; padding: 16px 18px; }
.jp-ficha__cell--accent {
  background: linear-gradient(135deg, var(--color-primary-green), #016b3d);
}
.jp-ficha__lab {
  font-family: var(--font-primary); font-weight: 700;
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}
.jp-ficha__cell--accent .jp-ficha__lab { color: rgba(255, 255, 255, 0.9); }
.jp-ficha__val {
  font-family: var(--font-display);
  font-size: 22px; color: #fff;
  margin-top: 6px; line-height: 1.1;
}
.jp-ficha__val--md { font-size: 24px; }
.jp-ficha__val--lg { font-size: 32px; line-height: 1; }
.jp-ficha__val--xl { font-size: 36px; line-height: 1; }

/* Secciones */
.jp-lead {
  font-size: 18px; line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 75ch; margin: 0 0 32px;
}
.jp-stats { margin-bottom: 24px; }
.jp-num--green { color: var(--color-primary-green); }
.jp-chips-row { margin-bottom: 16px; }
.jp-rol-txt { color: var(--color-text-muted); max-width: 80ch; line-height: 1.7; }

.jp-w22 {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 12px; margin-top: 8px; color: #fff;
}
.jp-w22__num { font-family: var(--font-display); font-size: 32px; display: block; }
.jp-w22__lab { font-size: 11px; opacity: 0.8; }
.jp-w22__txt { color: rgba(255, 255, 255, 0.85); font-size: 13px; margin-top: 12px; }

.jp-heat-title { margin-bottom: 14px; }
.jp-heat-fig { margin: 0; }
.jp-heat-cap {
  font-size: 11px; color: rgba(255, 255, 255, 0.6);
  text-align: center; margin-top: 14px;
  text-transform: uppercase; letter-spacing: 0.1em;
}

.jp-bars { margin-top: 8px; }
</style>
