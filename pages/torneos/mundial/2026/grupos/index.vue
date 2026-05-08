<script setup lang="ts">
import type { Edicion, Grupo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';
import { flagCode } from '~/utils/flag-codes';

const [{ data: edicion }, { data: grupos }] = await Promise.all([
  useFetch<Edicion>('/api/torneos/mundial/2026'),
  useFetch<Grupo[]>('/api/torneos/mundial/2026/grupos'),
]);

useSeo({
  title: 'Grupos · Mundial 2026 — Tabla, fixture y selecciones de las 12 llaves',
  description: 'Los 12 grupos del Mundial 2026 con sus 48 selecciones, tabla pre-torneo, fixture destacado y análisis editorial.',
});

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial', url: config.public.siteUrl + '/torneos/mundial/' },
    { name: '2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Grupos' },
  ]),
);

// Banderas: <TeamFlag :flag-code="flagCode(slug)" />

const gruposOrdenados = computed(() => (grupos.value ?? []).slice().sort((a, b) => a.letra.localeCompare(b.letra)));
const esGrupoTri = (g: Grupo) => g.selecciones.some((s) => s.slug === 'ecuador');
const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

// Sede + fixture chips por grupo (mock — luego al CMS o derivar de partidos)
type GrupoMeta = { sede: string; fixture: Array<{ txt: string; highlight?: boolean }> };
const grupoMetaMap: Record<string, GrupoMeta> = {
  A: { sede: 'Azteca · CDMX', fixture: [{ txt: '11/6 MEX–MAR' }, { txt: '16/6 CAN–IRN' }, { txt: '21/6 finales J3' }] },
  B: { sede: 'SoFi · LA',     fixture: [{ txt: '13/6 ESP–SEN' }, { txt: '18/6 CRC–KSA' }, { txt: '23/6 finales J3' }] },
  C: { sede: 'Mercedes-Benz · ATL', fixture: [{ txt: '12/6 USA–JPN' }, { txt: '17/6 DEN–COD' }, { txt: '23/6 finales J3' }] },
  D: { sede: 'La Tri', fixture: [{ txt: '12/6 ECU–UZB', highlight: true }, { txt: '14/6 ENG–CIV' }, { txt: '18/6 ENG–ECU' }] },
  E: { sede: 'MetLife · NJ',  fixture: [{ txt: '13/6 FRA–COL' }, { txt: '17/6 ALG–NZL' }, { txt: '22/6 finales J3' }] },
  F: { sede: 'MetLife · NJ',  fixture: [{ txt: '12/6 ARG–SUI' }, { txt: '16/6 EGY–PAN' }, { txt: '22/6 finales J3' }] },
  G: { sede: 'BMO · Toronto', fixture: [{ txt: '14/6 GER–KOR' }, { txt: '17/6 SVK–CUW' }, { txt: '23/6 finales J3' }] },
  H: { sede: 'Akron · GDL',   fixture: [{ txt: '14/6 BRA–CMR' }, { txt: '18/6 CHI–JOR' }, { txt: '23/6 finales J3' }] },
  I: { sede: 'SoFi · LA',     fixture: [{ txt: '15/6 POR–RSA' }, { txt: '19/6 MEX–QAT' }, { txt: '24/6 finales J3' }] },
  J: { sede: 'Lumen · Seattle', fixture: [{ txt: '15/6 BEL–URU' }, { txt: '19/6 TUN–HAI' }, { txt: '24/6 finales J3' }] },
  K: { sede: 'Hard Rock · Miami', fixture: [{ txt: '16/6 NED–NGA' }, { txt: '20/6 AUS–PAR' }, { txt: '25/6 finales J3' }] },
  L: { sede: 'Gillette · Boston', fixture: [{ txt: '16/6 ITA–CRO' }, { txt: '20/6 GHA–CPV' }, { txt: '25/6 finales J3' }] },
};
const grupoMeta = (letra: string) => grupoMetaMap[letra] ?? { sede: '—', fixture: [] };

// Tabla mostrada: si hay datos en grupo.tabla los usa; si no, arma una tabla pre-torneo en orden de selecciones (todos en 0)
const tablaGrupo = (g: Grupo) => {
  if (g.tabla && g.tabla.length) {
    return g.tabla.map((row) => ({
      pos: row.posicion, slug: row.seleccion.slug, nombre: row.seleccion.nombre,
      pj: row.pj, dg: (row.dg >= 0 ? '+' : '') + row.dg, pts: row.pts,
    }));
  }
  return g.selecciones.map((s, i) => ({
    pos: i + 1, slug: s.slug, nombre: s.nombre, pj: 0, dg: '+0', pts: 0,
  }));
};

// Hero stats
const heroStats = [
  { num: '12',  label: 'Grupos',      accent: true },
  { num: '48',  label: 'Selecciones', accent: false },
  { num: '17d', label: 'Duración',    accent: false },
  { num: '32',  label: 'A 16avos',    accent: false },
];

// Inauguración
const inauguracion = {
  fecha: '11 jun', hora: '14:00 ET',
  local:  { slug: 'mexico',    name: 'México' },
  visita: { slug: 'marruecos', name: 'Marruecos' },
  sede: 'Azteca · CDMX',
  href: '/torneos/mundial/2026/grupos/grupo-a/mexico-vs-marruecos-j1/',
};

// Countdown reactivo
const kickoff = computed(() => edicion.value ? new Date(edicion.value.fechaInicio).getTime() : 0);
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => { timer = setInterval(() => { now.value = Date.now(); }, 1000); });
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
const cd = computed(() => {
  const diff = Math.max(0, kickoff.value - now.value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d: pad(Math.floor(diff / 86_400_000)),
    h: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    m: pad(Math.floor((diff % 3_600_000) / 60_000)),
    s: pad(Math.floor((diff % 60_000) / 1_000)),
  };
});

// Contexto / cómo funciona
const contexto = [
  { kicker: '12 grupos de 4', num: '3',     caption: 'Partidos de fase de grupos por selección. Mismo formato que 1998–2022.', variant: 'default' as const },
  { kicker: 'Clasifican',     num: '32',    caption: '1° y 2° de cada grupo + los 8 mejores terceros pasan a Dieciseisavos.', variant: 'default' as const },
  { kicker: 'Nueva fase',     num: '16avos', caption: 'Por primera vez en la historia. Antes el knockout empezaba en octavos.', variant: 'green' as const },
];

// Imperdibles
const imperdibles = [
  { variant: 'dark'  as const, cols: 6, kicker: 'Inauguración · 11 jun · 14:00', sede: 'Azteca · Grupo A',  local: { slug: 'mexico',     name: 'México' },     visita: { slug: 'marruecos',       name: 'Marruecos' },                  href: '/torneos/mundial/2026/grupos/grupo-a/mexico-vs-marruecos-j1/' },
  { variant: 'green' as const, cols: 6, kicker: 'Debut Tri · 12 jun · 19:00',     sede: 'Atlanta · Grupo D', local: { slug: 'ecuador',    name: 'Ecuador' },    visita: { slug: 'uzbekistan',      name: 'Uzbekistán' },                 href: '/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/' },
  { variant: 'plain' as const, cols: 4, kicker: '12 jun · MetLife',               local: { slug: 'argentina',  name: 'Argentina' }, visita: { slug: 'suiza',           name: 'Suiza' },                      href: '#' },
  { variant: 'plain' as const, cols: 4, kicker: '13 jun · Filadelfia',            local: { slug: 'espana',     name: 'España' },    visita: { slug: 'senegal',         name: 'Senegal' },                    href: '#' },
  { variant: 'plain' as const, cols: 4, kicker: '18 jun · Houston · J2',          local: { slug: 'inglaterra', name: 'Inglaterra' }, visita: { slug: 'ecuador',        name: 'Ecuador', highlight: true },  href: '/torneos/mundial/2026/grupos/grupo-d/inglaterra-vs-ecuador-j2/' },
  { variant: 'plain' as const, cols: 4, kicker: '14 jun · Toronto',               local: { slug: 'brasil',     name: 'Brasil' },   visita: { slug: 'camerun',         name: 'Camerún' },                    href: '#' },
];

// Editorial (mock)
const editorial = {
  destacadas: [
    { kicker: 'Análisis Grupo D · 8 min',   title: 'Por qué Ecuador es 2° favorito en su grupo', meta: '2 may · Por D. Granda',   img: '/img/news-placeholder.svg' },
    { kicker: 'Reportaje Grupo F · 12 min', title: 'Argentina, la defensora que se reinventa',   meta: '28 abr · Por A. Mejía',   img: '/img/hero-placeholder.svg' },
    { kicker: 'Opinión Grupo A · 5 min',    title: 'México abre el Mundial: ¿presión o impulso?', meta: '25 abr · Por R. Estrada', img: '/img/stadium-placeholder.svg' },
  ],
  largas: [
    { kicker: 'Datos · 4 min',         title: 'Los 8 mejores terceros: cómo se decide en 2026',  body: 'Con 12 grupos, ocho selecciones que terminen 3° pasan a 16avos. Las claves del desempate y los antecedentes en torneos de 24 equipos.' },
    { kicker: 'Power ranking · 6 min', title: 'Los 48 ordenados: del candidato al cenicero',      body: 'Francia, Brasil y España en el podio. Ecuador en el #14, mejor que cualquier sudamericano salvo los grandes. Cabo Verde, Curazao y Haití cierran la lista.' },
  ],
  cortas: [
    { kicker: 'Grupo H', title: 'Brasil sin Vinicius: el plan B de Dorival' },
    { kicker: 'Grupo E', title: 'Colombia regresa con James de capitán' },
    { kicker: 'Grupo I', title: 'El sorteo que dejó a México B contra Portugal' },
  ],
};
</script>

<template>
  <div>
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Torneos', to: '/torneos/' },
          { label: 'Mundial', to: '/torneos/mundial/' },
          { label: '2026', to: '/torneos/mundial/2026/' },
          { label: 'Grupos' },
        ]"
      />
    </div>

    <!-- HERO -->
    <section class="pro-hero">
      <div class="pro-hero__inner">
        <div class="pro-hero__main">
          <div class="pro-hero__bg gs-hero__bg" />
          <span class="pro-hero__kicker">Fase de grupos · 12 × 4 · 72 partidos</span>
          <h1 class="pro-hero__title">Los 12<br>grupos</h1>
          <p class="pro-hero__lead">
            Por primera vez en la historia, 48 selecciones reparten en 12 grupos de cuatro.
            Pasan los dos primeros y los ocho mejores terceros — 32 al nuevo Dieciseisavos.
            Aquí seguimos cada llave en vivo.
          </p>
          <div class="pro-hero__meta">
            <span>11 jun – 27 jun · fase de grupos</span>
            <span>72 partidos</span>
            <span>32 clasifican</span>
          </div>

          <div class="gs-stats">
            <div v-for="(s, i) in heroStats" :key="i" class="gs-stat">
              <div :class="['gs-stat__num', s.accent ? 'gs-stat__num--accent' : '']">{{ s.num }}</div>
              <div class="gs-stat__lab">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <aside class="pro-hero__side gs-aside">
          <h3 class="gs-aside__h">Estado del torneo</h3>

          <div class="gs-cdown">
            <div class="gs-cdown__l">Cuenta regresiva · Inauguración</div>
            <ClientOnly>
              <div class="gs-cdown__grid">
                <div class="gs-cdown__c"><div class="gs-cdown__n">{{ cd.d }}</div><div class="gs-cdown__lab">Días</div></div>
                <div class="gs-cdown__c"><div class="gs-cdown__n">{{ cd.h }}</div><div class="gs-cdown__lab">Horas</div></div>
                <div class="gs-cdown__c"><div class="gs-cdown__n">{{ cd.m }}</div><div class="gs-cdown__lab">Min</div></div>
                <div class="gs-cdown__c"><div class="gs-cdown__n">{{ cd.s }}</div><div class="gs-cdown__lab">Seg</div></div>
              </div>
              <template #fallback>
                <div class="gs-cdown__grid">
                  <div class="gs-cdown__c"><div class="gs-cdown__n">--</div><div class="gs-cdown__lab">Días</div></div>
                  <div class="gs-cdown__c"><div class="gs-cdown__n">--</div><div class="gs-cdown__lab">Horas</div></div>
                  <div class="gs-cdown__c"><div class="gs-cdown__n">--</div><div class="gs-cdown__lab">Min</div></div>
                  <div class="gs-cdown__c"><div class="gs-cdown__n">--</div><div class="gs-cdown__lab">Seg</div></div>
                </div>
              </template>
            </ClientOnly>
            <div class="gs-cdown__sub">11 jun · Azteca · México</div>
          </div>

          <div class="gs-jump">
            <div class="gs-jump__l">Saltar al grupo</div>
            <div class="gs-jump__grid">
              <a
                v-for="l in letras"
                :key="l"
                :href="`#grupo-${l.toLowerCase()}`"
                :class="['gs-jump__a', l === 'D' ? 'gs-jump__a--active' : '']"
              >{{ l }}</a>
            </div>
          </div>

          <a :href="inauguracion.href" class="gs-next">
            <div class="gs-next__head">
              <span class="gs-next__kicker">Próximo partido</span>
              <span class="gs-next__when">{{ inauguracion.fecha.toUpperCase() }} · {{ inauguracion.hora }}</span>
            </div>
            <div class="gs-next__teams">
              <div class="gs-next__team gs-next__team--r">
                <TeamFlag :flag-code="flagCode(inauguracion.local.slug)" :name="inauguracion.local.name" :size="32" />
                <div class="gs-next__name">{{ inauguracion.local.name }}</div>
              </div>
              <div class="gs-next__vs">VS</div>
              <div class="gs-next__team gs-next__team--l">
                <TeamFlag :flag-code="flagCode(inauguracion.visita.slug)" :name="inauguracion.visita.name" :size="32" />
                <div class="gs-next__name">{{ inauguracion.visita.name }}</div>
              </div>
            </div>
            <div class="gs-next__sede">
              <span>{{ inauguracion.sede }}</span>
              <span class="gs-next__cta">Inauguración →</span>
            </div>
          </a>
        </aside>
      </div>
    </section>

    <PageIndex
      :items="[
        { label: 'Grupos', href: '#grupos' },
        { label: 'Imperdibles', href: '#destacados' },
        { label: 'Contexto', href: '#contexto' },
      ]"
    />

    <!-- CONTEXTO -->
    <section id="contexto" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cómo funciona</span>
          <h2 class="pro-sec-head__title">El nuevo formato a 48</h2>
        </div>
      </div>
      <BentoGrid>
        <article
          v-for="(c, i) in contexto"
          :key="i"
          :class="['tile', 'b-c4', c.variant === 'green' ? 'tile--green' : '']"
        >
          <span class="tile__kicker">{{ c.kicker }}</span>
          <div class="tile__big-num">{{ c.num }}</div>
          <p class="tile__caption" :class="c.variant === 'green' ? 'gs-ctx__cap--on-green' : ''">{{ c.caption }}</p>
        </article>
      </BentoGrid>
    </section>

    <!-- GRUPOS -->
    <section id="grupos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">12 llaves · 4 selecciones cada una</span>
          <h2 class="pro-sec-head__title">Tabla y fixture por grupo</h2>
        </div>
        <div class="gs-legend">
          <span><span class="gs-legend__dot" />Clasifica directo</span>
          <span class="gs-legend__sub">Última actualización: pre-torneo</span>
        </div>
      </div>

      <div class="bento" v-if="gruposOrdenados.length">
        <article
          v-for="g in gruposOrdenados"
          :key="g.slug"
          :id="`grupo-${g.letra.toLowerCase()}`"
          :class="['tile', 'group-card', 'b-c4', esGrupoTri(g) ? 'is-tri' : '']"
        >
          <div class="group-card__head">
            <h3 class="group-card__title">Grupo {{ g.letra }}</h3>
            <span :class="['group-card__meta', esGrupoTri(g) ? 'group-card__meta--tri' : '']">
              {{ grupoMeta(g.letra).sede }}
            </span>
          </div>
          <table class="gtable">
            <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>DG</th><th>Pts</th></tr></thead>
            <tbody>
              <tr
                v-for="row in tablaGrupo(g)"
                :key="row.slug"
                :class="row.pos <= 2 ? 'q' : ''"
              >
                <td>{{ row.pos }}</td>
                <td>
                  <span class="flag" style="display:inline-flex;align-items:center;gap:8px">
                    <TeamFlag :flag-code="flagCode(row.slug)" :name="row.nombre" :size="16" />
                    <NuxtLink
                      :to="`/selecciones/${row.slug}/`"
                      :class="row.slug === 'ecuador' ? 'gtable__ec' : ''"
                    >{{ row.nombre }}</NuxtLink>
                  </span>
                </td>
                <td>{{ row.pj }}</td>
                <td>{{ row.dg }}</td>
                <td class="pts">{{ row.pts }}</td>
              </tr>
            </tbody>
          </table>
          <div class="group-card__fix">
            <span
              v-for="(f, i) in grupoMeta(g.letra).fixture"
              :key="i"
              :class="f.highlight ? 'group-card__fix--hl' : ''"
            >{{ f.txt }}</span>
          </div>
          <NuxtLink :to="`/torneos/mundial/2026/grupos/${g.slug}/`" class="group-card__cta">
            Ficha grupo {{ g.letra }} <span>→</span>
          </NuxtLink>
        </article>
      </div>
      <p v-else>Los 12 grupos se publicarán en breve.</p>
    </section>

    <!-- IMPERDIBLES -->
    <section id="destacados" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Imperdibles de fase de grupos</span>
          <h2 class="pro-sec-head__title">Los 6 partidos que hay que ver</h2>
        </div>
      </div>
      <div class="bento">
        <a
          v-for="(m, i) in imperdibles"
          :key="i"
          :href="m.href"
          :class="[
            'tile',
            `b-c${m.cols}`,
            m.variant === 'dark' ? 'tile--dark' : '',
            m.variant === 'green' ? 'tile--green' : '',
          ]"
        >
          <span class="tile__kicker">{{ m.kicker }}</span>
          <div class="pmatch gs-pmatch" :class="m.variant === 'dark' || m.variant === 'green' ? 'gs-pmatch--on-dark' : ''">
            <div v-if="m.sede" class="pmatch__head">
              <span :class="m.variant === 'green' ? 'gs-sede--bright' : 'gs-sede--muted'">{{ m.sede }}</span>
            </div>
            <div class="pmatch__teams">
              <div class="pmatch__team">
                <strong style="display:inline-flex;align-items:center;gap:8px">
                  <TeamFlag :flag-code="flagCode(m.local.slug)" :name="m.local.name" :size="20" />
                  {{ m.local.name }}
                </strong>
              </div>
              <div class="pmatch__center">VS</div>
              <div class="pmatch__team">
                <strong style="display:inline-flex;align-items:center;gap:8px"
                  :class="m.visita.highlight ? 'gs-rival-hl' : ''">
                  <TeamFlag :flag-code="flagCode(m.visita.slug)" :name="m.visita.name" :size="20" />
                  {{ m.visita.name }}
                </strong>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- EDITORIAL -->
    <section id="editorial" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura editorial</span>
          <h2 class="pro-sec-head__title">Notas y análisis por grupo</h2>
        </div>
        <NuxtLink to="/noticias/" class="pro-sec-head__cta">Ver todas →</NuxtLink>
      </div>
      <div class="bento">
        <a
          v-for="(n, i) in editorial.destacadas"
          :key="`d${i}`"
          href="/noticias/"
          class="media-tile media-tile--tall b-c4"
        >
          <img :src="n.img" :alt="n.title" />
          <div class="media-tile__body">
            <span class="media-tile__kicker">{{ n.kicker }}</span>
            <h3 class="media-tile__title gs-ed__title">{{ n.title }}</h3>
            <span class="media-tile__meta">{{ n.meta }}</span>
          </div>
        </a>
        <a
          v-for="(n, i) in editorial.largas"
          :key="`l${i}`"
          href="/noticias/"
          class="tile b-c6"
        >
          <span class="tile__kicker">{{ n.kicker }}</span>
          <h3 class="tile__title">{{ n.title }}</h3>
          <p class="tile__caption gs-ed__body">{{ n.body }}</p>
        </a>
        <a
          v-for="(n, i) in editorial.cortas"
          :key="`s${i}`"
          href="/noticias/"
          class="tile tile--dark b-c4"
        >
          <span class="tile__kicker">{{ n.kicker }}</span>
          <h3 class="tile__title gs-ed__short">{{ n.title }}</h3>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gs-hero__bg {
  background: linear-gradient(135deg, #000 0%, #0a3d20 50%, #067a4a 100%);
  z-index: -1;
}

/* Hero stats */
.gs-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px; margin-top: 32px; max-width: 680px;
}
.gs-stat {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px; padding: 16px;
}
.gs-stat__num { font-family: var(--font-display); font-size: 36px; line-height: 0.9; color: #fff; }
.gs-stat__num--accent { color: var(--color-primary-green); }
.gs-stat__lab {
  font-size: 11px; color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.14em; text-transform: uppercase; margin-top: 6px;
}

/* Aside */
.gs-aside { display: flex; flex-direction: column; gap: 14px; }
.gs-aside__h { margin: 0; }

.gs-cdown {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px; padding: 16px;
}
.gs-cdown__l {
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-primary-green); margin-bottom: 10px;
}
.gs-cdown__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.gs-cdown__c {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px; padding: 12px 4px; text-align: center;
}
.gs-cdown__n { font-family: var(--font-display); font-size: 30px; line-height: 1; color: #fff; }
.gs-cdown__lab {
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6); margin-top: 4px;
}
.gs-cdown__sub {
  font-size: 11px; color: rgba(255, 255, 255, 0.55);
  margin-top: 10px; letter-spacing: 0.04em;
}

.gs-jump {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px; padding: 16px;
}
.gs-jump__l {
  font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.6); margin-bottom: 10px;
}
.gs-jump__grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.gs-jump__a {
  background: rgba(255, 255, 255, 0.08); color: #fff;
  text-align: center; padding: 10px 0;
  border-radius: 8px; text-decoration: none;
  font-family: var(--font-display); font-size: 18px;
}
.gs-jump__a--active { background: var(--color-primary-green); }

.gs-next {
  text-decoration: none; color: #fff;
  background: linear-gradient(135deg, rgba(2, 204, 116, 0.18), rgba(2, 204, 116, 0.05));
  border: 1px solid rgba(2, 204, 116, 0.5);
  border-radius: 12px; padding: 18px; display: block;
}
.gs-next__head {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.gs-next__kicker {
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--color-primary-green); font-weight: 600;
}
.gs-next__when { font-size: 11px; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.06em; }
.gs-next__teams {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 10px; align-items: center;
}
.gs-next__team { display: flex; flex-direction: column; gap: 4px; }
.gs-next__team--r { text-align: right; align-items: flex-end; }
.gs-next__team--l { text-align: left;  align-items: flex-start; }
.gs-next__flag { font-size: 26px; line-height: 0.95; }
.gs-next__name { font-family: var(--font-display); font-size: 22px; line-height: 1.05; }
.gs-next__vs {
  font-family: var(--font-display); font-size: 18px; color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px; padding: 6px 10px; line-height: 1;
}
.gs-next__sede {
  font-size: 11px; color: rgba(255, 255, 255, 0.6);
  margin-top: 12px; letter-spacing: 0.04em;
  border-top: 1px solid rgba(2, 204, 116, 0.25);
  padding-top: 10px;
  display: flex; justify-content: space-between;
}
.gs-next__cta { color: var(--color-primary-green); font-weight: 600; }

/* Contexto */
.gs-ctx__cap--on-green { color: rgba(255, 255, 255, 0.85); }

/* Grupos · group-card */
.gs-legend {
  display: flex; gap: 20px; flex-wrap: wrap;
  font-size: 12px; color: var(--color-text-muted);
  align-items: center;
}
.gs-legend__dot {
  display: inline-block; width: 6px; height: 6px;
  border-radius: 50%; background: var(--color-primary-green);
  margin-right: 6px; vertical-align: middle;
}
.gs-legend__sub { color: var(--color-text-muted); }

.group-card { display: flex; flex-direction: column; gap: 14px; }
.group-card__head {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 12px; border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;
}
.group-card__title { font-family: var(--font-display); font-size: 32px; line-height: 1; letter-spacing: 0.04em; }
.group-card__meta {
  font-size: 11px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--color-text-muted);
}
.group-card__meta--tri { color: var(--color-primary-green); font-weight: 600; }
.group-card__fix {
  display: flex; flex-wrap: wrap; gap: 6px;
  font-size: 11px; color: var(--color-text-muted);
}
.group-card__fix span {
  background: rgba(0, 0, 0, 0.04);
  padding: 4px 8px; border-radius: 6px; letter-spacing: 0.04em;
}
.group-card__fix--hl {
  background: rgba(2, 204, 116, 0.15) !important;
  color: var(--color-primary-green) !important; font-weight: 600;
}
.group-card__cta {
  font-size: 12px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--color-primary-green);
  font-weight: 600; text-decoration: none;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 10px;
  display: flex; justify-content: space-between; align-items: center;
}
.group-card.is-tri {
  background: linear-gradient(160deg, rgba(2, 204, 116, 0.06), transparent 60%);
  border-color: rgba(2, 204, 116, 0.35);
}
.group-card.is-tri .group-card__title { color: var(--color-primary-green); }

/* Mini table */
.gtable { width: 100%; border-collapse: collapse; font-size: 13px; }
.gtable th {
  font-size: 10px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-text-muted);
  font-weight: 500; text-align: right; padding: 6px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.gtable th:first-child { text-align: left; width: 24px; }
.gtable th:nth-child(2) { text-align: left; }
.gtable td {
  padding: 8px 4px; text-align: right;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-variant-numeric: tabular-nums;
}
.gtable td:first-child {
  font-family: var(--font-display); color: var(--color-text-muted);
  font-size: 14px; width: 24px;
}
.gtable td:nth-child(2) {
  text-align: left; font-weight: 500;
  display: flex; align-items: center; gap: 8px;
}
.gtable td:nth-child(2) .flag { font-size: 16px; }
.gtable td:nth-child(2) a { color: inherit; text-decoration: none; }
.gtable td:nth-child(2) a:hover { color: var(--color-primary-green); }
.gtable .pts { font-family: var(--font-display); font-size: 16px; }
.gtable tr.q td:first-child { color: var(--color-primary-green); }
.gtable tr.q td:first-child::after {
  content: ""; display: inline-block; width: 4px; height: 4px;
  border-radius: 50%; background: var(--color-primary-green);
  margin-left: 6px; vertical-align: middle;
}
.gtable tr:last-child td { border-bottom: none; }
.gtable__ec { color: var(--color-primary-green); font-weight: 600; }

/* Imperdibles */
.gs-pmatch { margin-top: 12px; }
.gs-pmatch--on-dark .pmatch__teams strong,
.gs-pmatch--on-dark .pmatch__center { color: #fff; }
.gs-sede--muted  { color: rgba(255, 255, 255, 0.7); }
.gs-sede--bright { color: rgba(255, 255, 255, 0.85); }
.gs-rival-hl { color: var(--color-primary-green); }

/* Editorial */
.gs-ed__title { font-size: 24px; }
.gs-ed__body  { margin-top: 8px; }
.gs-ed__short { color: #fff; }
</style>
