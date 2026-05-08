<script setup lang="ts">
import type { Grupo } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const grupoSlug = route.params.grupo as string;
const { data: grupo } = await useFetch<Grupo>(`/api/torneos/mundial/2026/grupos/${grupoSlug}`);
if (!grupo.value) throw createError({ statusCode: 404 });

useSeo(grupo.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial', url: config.public.siteUrl + '/torneos/mundial/' },
    { name: '2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: `Grupo ${grupo.value.letra}` },
  ]),
  buildItemList(grupo.value.selecciones.map((s) => ({ name: s.nombre, url: `${config.public.siteUrl}/selecciones/${s.slug}/` }))),
]);

// Metadatos visuales por selección (mock hasta cablear al CMS)
type SeleMeta = { flag: string; accent: string; dato: { num: string; texto: string }; prob: number };
const seleMap: Record<string, SeleMeta> = {
  ecuador:           { flag: '🇪🇨', accent: 'var(--color-primary-green)', dato: { num: '11', texto: 'invicto de local en Quito' },        prob: 68 },
  inglaterra:        { flag: '🏴',  accent: '#c8102e',                     dato: { num: '68', texto: 'goles de Kane, máximo histórico' },  prob: 88 },
  'costa-de-marfil': { flag: '🇨🇮', accent: '#ff8200',                     dato: { num: '2×', texto: 'campeón África 2023 y 2025' },       prob: 31 },
  uzbekistan:        { flag: '🇺🇿', accent: '#1eb53a',                     dato: { num: '1°', texto: 'su primer Mundial en la historia' }, prob: 13 },
};
const meta = (slug: string): SeleMeta => seleMap[slug] ?? { flag: '⚽', accent: 'var(--color-primary-green)', dato: { num: '—', texto: '' }, prob: 0 };

// Mapping forma W/D/L → letra ES y clase visual
const formaMap = { W: { letra: 'G', cls: 'streak__b--w' }, D: { letra: 'E', cls: 'streak__b--d' }, L: { letra: 'P', cls: 'streak__b--l' } } as const;

// FIFA rank mock (no está en JSON aún)
const fifaRank: Record<string, string> = { inglaterra: '4°', ecuador: '25°', 'costa-de-marfil': '42°', uzbekistan: '58°' };

// Próximo partido del grupo (mock; idealmente desde API filtrando por fecha)
const proximo = {
  jornada: 'J1 · 12 jun · 19:00 ET',
  local:  { flag: '🇪🇨', nombre: 'Ecuador' },
  visita: { flag: '🇺🇿', nombre: 'Uzbekistán' },
  sede: 'Mercedes-Benz Stadium · Atlanta',
  href: '/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/',
};

// Fixture detallado (sede + horario + variante visual)
type FixtureItem = {
  jornada: string;
  sede: string;
  hora: string;
  local: { flag: string; nombre: string };
  visita: { flag: string; nombre: string };
  href: string;
  variant: 'dark' | 'green' | 'default';
};
const fixture: FixtureItem[] = [
  { jornada: 'J1 · 12 jun · 15:00 ET · Toronto',           sede: 'BMO Field',                   hora: '16:00', local: { flag: '🏴', nombre: 'Inglaterra' },     visita: { flag: '🇨🇮', nombre: 'C. Marfil' },  href: '/torneos/mundial/2026/grupos/grupo-d/inglaterra-vs-costa-de-marfil-j1/', variant: 'dark' },
  { jornada: 'J1 · 12 jun · 19:00 ET · Atlanta',           sede: 'Mercedes-Benz Stadium',       hora: '19:00', local: { flag: '🇪🇨', nombre: 'Ecuador' },        visita: { flag: '🇺🇿', nombre: 'Uzbekistán' }, href: '/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/',          variant: 'green' },
  { jornada: 'J2 · 17 jun · Filadelfia',                   sede: 'Lincoln Financial Field',     hora: '15:00', local: { flag: '🏴', nombre: 'Inglaterra' },     visita: { flag: '🇪🇨', nombre: 'Ecuador' },     href: '#', variant: 'default' },
  { jornada: 'J2 · 18 jun · Houston',                      sede: 'NRG Stadium',                 hora: '13:00', local: { flag: '🇨🇮', nombre: 'C. Marfil' },     visita: { flag: '🇺🇿', nombre: 'Uzbekistán' }, href: '#', variant: 'default' },
  { jornada: 'J3 · 23 jun · Toronto · Simultáneo',         sede: 'BMO Field',                   hora: '15:00', local: { flag: '🇪🇨', nombre: 'Ecuador' },        visita: { flag: '🇨🇮', nombre: 'C. Marfil' },  href: '#', variant: 'default' },
  { jornada: 'J3 · 23 jun · Atlanta · Simultáneo',         sede: 'Mercedes-Benz Stadium',       hora: '15:00', local: { flag: '🏴', nombre: 'Inglaterra' },     visita: { flag: '🇺🇿', nombre: 'Uzbekistán' }, href: '#', variant: 'default' },
];

const datos = [
  { num: '26.4', label: 'Edad media combinada' },
  { num: '€2.1B', label: 'Valor mercado total' },
  { num: '3',    label: 'Sedes' },
  { num: '12',   label: 'Días de grupo' },
];
</script>

<template>
  <div v-if="grupo">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
          { label: `Grupo ${grupo.letra}` },
        ]"
      />
    </div>

    <!-- HERO -->
    <section class="pro-hero">
      <div class="pro-hero__inner">
        <div class="pro-hero__main">
          <div class="pro-hero__bg gr-hero__bg" />
          <span class="pro-hero__kicker">Fase de grupos · Mundial 2026</span>
          <h1 class="pro-hero__title">Grupo {{ grupo.letra }}</h1>
          <p v-if="grupo.analisis" class="pro-hero__lead">{{ grupo.analisis }}</p>
          <div class="pro-hero__meta">
            <span>{{ grupo.selecciones.length }} equipos</span>
            <span>{{ grupo.partidos.length || 6 }} partidos</span>
            <span>3 sedes</span>
          </div>

          <div class="gr-data">
            <h3 class="gr-data__head">El dato de cada selección</h3>
            <div class="gr-data__grid">
              <div
                v-for="s in grupo.selecciones"
                :key="s.slug"
                class="gr-datum"
                :style="{ borderLeftColor: meta(s.slug).accent }"
              >
                <span class="gr-datum__num">{{ meta(s.slug).dato.num }}</span>
                <div class="gr-datum__txt">
                  <strong class="gr-datum__name">{{ meta(s.slug).flag }} {{ s.nombre }}</strong>
                  {{ meta(s.slug).dato.texto }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="pro-hero__side gr-aside">
          <div class="gr-aside__panel">
            <h3 class="gr-aside__head">Tabla del grupo</h3>
            <div class="gr-mini">
              <div
                v-for="row in grupo.tabla"
                :key="row.seleccion.slug"
                class="gr-mini__row"
                :style="{ borderLeftColor: meta(row.seleccion.slug).accent }"
              >
                <span class="gr-mini__pos">{{ row.posicion }}</span>
                <span class="gr-mini__name">
                  <span class="gr-mini__flag">{{ meta(row.seleccion.slug).flag }}</span>
                  <strong>{{ row.seleccion.nombre }}</strong>
                </span>
                <span class="gr-mini__pts">{{ row.pts }}</span>
              </div>
            </div>
            <p class="gr-mini__note">Puntos acumulados en eliminatorias</p>
          </div>

          <div class="gr-aside__next">
            <h3 class="gr-aside__head muted">Próximo partido</h3>
            <a :href="proximo.href" class="gr-next">
              <div class="gr-next__date">{{ proximo.jornada }}</div>
              <div class="gr-next__teams">
                <div class="gr-next__team gr-next__team--r">
                  <div class="gr-next__flag">{{ proximo.local.flag }}</div>
                  <strong>{{ proximo.local.nombre }}</strong>
                </div>
                <div class="gr-next__vs">VS</div>
                <div class="gr-next__team gr-next__team--l">
                  <div class="gr-next__flag">{{ proximo.visita.flag }}</div>
                  <strong>{{ proximo.visita.nombre }}</strong>
                </div>
              </div>
              <div class="gr-next__sede">{{ proximo.sede }}</div>
            </a>
          </div>
        </aside>
      </div>
    </section>

    <PageIndex
      :items="[
        { label: 'Tabla', href: '#tabla' },
        { label: 'Fixture', href: '#fixture' },
        { label: 'Análisis', href: '#analisis' },
        { label: 'Datos', href: '#datos' },
      ]"
    />

    <!-- TABLA -->
    <section id="tabla" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Posiciones · Pre-Mundial</span>
          <h2 class="pro-sec-head__title">Cómo llega cada uno</h2>
        </div>
      </div>
      <div class="bento">
        <article class="tile b-c8 gr-table">
          <table class="ptable">
            <thead>
              <tr>
                <th>#</th>
                <th>Selección</th>
                <th class="num">FIFA</th>
                <th class="num">PJ</th>
                <th class="num">G</th>
                <th class="num">E</th>
                <th class="num">P</th>
                <th>Forma</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in grupo.tabla" :key="row.seleccion.slug">
                <td>
                  <strong :class="row.posicion <= 2 ? 'gr-pos--qual' : ''">{{ row.posicion }}</strong>
                </td>
                <td><strong>{{ meta(row.seleccion.slug).flag }} {{ row.seleccion.nombre }}</strong></td>
                <td class="num">{{ fifaRank[row.seleccion.slug] ?? '—' }}</td>
                <td class="num">{{ row.pj }}</td>
                <td class="num">{{ row.g }}</td>
                <td class="num">{{ row.e }}</td>
                <td class="num">{{ row.p }}</td>
                <td>
                  <span class="streak">
                    <span
                      v-for="(f, i) in row.forma"
                      :key="i"
                      :class="['streak__b', formaMap[f].cls]"
                    >{{ formaMap[f].letra }}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </article>

        <aside class="b-c4 gr-prob">
          <article class="tile tile--green gr-prob__card">
            <span class="tile__kicker">Probabilidad clasificar</span>
            <div class="gr-prob__list">
              <div
                v-for="s in grupo.selecciones"
                :key="s.slug"
                class="gr-prob__row"
              >
                <strong>{{ meta(s.slug).flag }} {{ s.nombre }}</strong>
                <span class="gr-prob__num">{{ meta(s.slug).prob }}%</span>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </section>

    <!-- FIXTURE -->
    <section id="fixture" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">{{ grupo.partidos.length || 6 }} partidos · 12 días</span>
          <h2 class="pro-sec-head__title">Calendario completo</h2>
        </div>
      </div>
      <div class="bento">
        <a
          v-for="(m, i) in fixture"
          :key="i"
          :href="m.href"
          :class="['tile', 'b-c6', m.variant === 'dark' ? 'tile--dark' : '', m.variant === 'green' ? 'tile--green' : '']"
        >
          <span class="tile__kicker">{{ m.jornada }}</span>
          <div class="pmatch fixture-match" :class="m.variant === 'dark' || m.variant === 'green' ? 'fixture-match--on-dark' : ''">
            <div v-if="m.variant !== 'default'" class="pmatch__head">
              <span :class="m.variant === 'green' ? 'sede--bright' : 'sede--muted'">{{ m.sede }}</span>
            </div>
            <div class="pmatch__teams">
              <div class="pmatch__team"><strong>{{ m.local.flag }} {{ m.local.nombre }}</strong></div>
              <div class="pmatch__center">VS<small>{{ m.hora }}</small></div>
              <div class="pmatch__team"><strong>{{ m.visita.flag }} {{ m.visita.nombre }}</strong></div>
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- ANÁLISIS -->
    <section id="analisis" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Análisis Golgana</span>
          <h2 class="pro-sec-head__title">Las claves del grupo</h2>
        </div>
      </div>
      <div class="bento">
        <article class="tile b-c6">
          <span class="tile__kicker">Tema 1</span>
          <h3 class="tile__title">Inglaterra: el favorito que siempre tropieza</h3>
          <p class="tile__caption gr-an__txt">
            Tuchel hereda una generación con Bellingham, Saka, Foden y Kane. Sobre el papel es candidato a final, pero en cinco mundiales y dos eurocopas no ha pasado de cuartos. ¿Qué cambia?
          </p>
        </article>
        <article class="tile b-c6">
          <span class="tile__kicker">Tema 2</span>
          <h3 class="tile__title">Ecuador: la generación que ya jugó esto</h3>
          <p class="tile__caption gr-an__txt">
            11 jugadores del Mundial sub-20 2019 están en la lista. Caicedo, Plata, Pacho, Estupiñán, Sarmiento. Beccacece propone presión alta y salida desde el fondo. Es el mejor combinado tri desde 2006.
          </p>
        </article>
        <article class="tile tile--dark b-c12 gr-an__feature">
          <span class="tile__kicker">Choque clave</span>
          <h3 class="tile__title gr-an__feature-title">17 jun · Inglaterra-Ecuador define el orden de octavos</h3>
          <p class="tile__caption gr-an__feature-txt">
            Asumiendo que ambos vencen en J1, el cruce en Filadelfia decide quién sale primero. El primero del grupo evita a Brasil/Francia en octavos. Es un partido de 6 puntos.
          </p>
        </article>
      </div>
    </section>

    <!-- DATOS -->
    <section id="datos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Datos del grupo</span>
          <h2 class="pro-sec-head__title">Cifras</h2>
        </div>
      </div>
      <div class="stat-row">
        <div v-for="(d, i) in datos" :key="i" class="stat-row__cell">
          <span class="stat-row__num">{{ d.num }}</span>
          <span class="stat-row__label">{{ d.label }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Background hero */
.gr-hero__bg {
  background: linear-gradient(135deg, #000 0%, #053a25 50%, #067a4a 100%);
  z-index: -1;
}

/* "El dato de cada selección" */
.gr-data { margin-top: 32px; }
.gr-data__head {
  margin: 0 0 14px;
  font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.6);
}
.gr-data__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.gr-datum {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-left: 4px solid var(--color-primary-green);
  border-radius: 10px;
}
.gr-datum__num {
  font-family: var(--font-display);
  font-size: 40px; color: #fff; line-height: 1; flex-shrink: 0;
}
.gr-datum__txt {
  font-size: 12px; line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
}
.gr-datum__name {
  color: #fff; display: block; margin-bottom: 2px;
}

/* Aside hero */
.gr-aside { display: flex; flex-direction: column; gap: 18px; }
.gr-aside__head {
  margin: 0 0 12px;
  font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #fff;
}
.gr-aside__head.muted { color: rgba(255, 255, 255, 0.6); }

.gr-aside__panel {
  background: rgba(255, 255, 255, 0.06);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.gr-mini { display: flex; flex-direction: column; gap: 8px; }
.gr-mini__row {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  gap: 10px; align-items: center;
  padding: 12px 14px;
  background: #fff;
  border-left: 4px solid var(--color-primary-green);
  border-radius: 10px;
  color: var(--color-primary-black);
}
.gr-mini__pos { font-family: var(--font-display); font-size: 18px; color: var(--color-primary-green); }
.gr-mini__flag { margin-right: 8px; }
.gr-mini__pts {
  font-family: var(--font-display); font-size: 24px; color: var(--color-primary-black);
}
.gr-mini__note {
  margin: 10px 0 0;
  font-size: 10px; color: rgba(255, 255, 255, 0.55); letter-spacing: 0.06em;
}

.gr-aside__next { border-top: 1px solid rgba(255, 255, 255, 0.12); padding-top: 16px; }
.gr-next {
  display: block;
  padding: 14px;
  background: linear-gradient(135deg, #067a4a, #0a3d20);
  border-radius: 12px;
  color: #fff; text-decoration: none;
}
.gr-next__date {
  font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.7);
}
.gr-next__teams {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 12px; margin-top: 10px;
}
.gr-next__team { display: flex; flex-direction: column; gap: 2px; }
.gr-next__team--r { text-align: right; align-items: flex-end; }
.gr-next__team--l { text-align: left; align-items: flex-start; }
.gr-next__flag { font-size: 24px; line-height: 1; }
.gr-next__vs {
  font-family: var(--font-display); font-size: 18px; color: rgba(255, 255, 255, 0.7);
}
.gr-next__sede {
  margin-top: 10px; font-size: 10px;
  color: rgba(255, 255, 255, 0.6); letter-spacing: 0.06em;
}

/* Tabla */
.gr-table { padding: 0; }
.gr-pos--qual { color: var(--color-primary-green); }

/* Probabilidad */
.gr-prob { display: flex; flex-direction: column; gap: 12px; }
.gr-prob__card { width: 100%; }
.gr-prob__list {
  display: flex; flex-direction: column; gap: 6px;
  margin-top: 8px; color: #fff;
}
.gr-prob__row { display: flex; justify-content: space-between; align-items: center; }
.gr-prob__num { font-family: var(--font-display); font-size: 22px; }

/* Fixture */
.fixture-match { margin-top: 12px; }
.fixture-match--on-dark .pmatch__teams strong,
.fixture-match--on-dark .pmatch__center { color: #fff; }
.fixture-match--on-dark .pmatch__center small { color: rgba(255, 255, 255, 0.7); }
.sede--muted { color: rgba(255, 255, 255, 0.7); }
.sede--bright { color: rgba(255, 255, 255, 0.85); }

/* Análisis */
.gr-an__txt { margin-top: 8px; line-height: 1.6; }
.gr-an__feature-title { color: #fff; font-size: 32px; }
.gr-an__feature-txt { color: rgba(255, 255, 255, 0.7); max-width: 80ch; margin-top: 8px; }
</style>
