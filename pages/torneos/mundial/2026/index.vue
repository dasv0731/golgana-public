<script setup lang="ts">
import type { Edicion, Grupo } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, buildFAQPage, injectSchema } from '~/composables/useSchema';
import { flagCode } from '~/utils/flag-codes';

const [{ data: edicion }, { data: grupos }] = await Promise.all([
  useFetch<Edicion>('/api/torneos/mundial/2026'),
  useFetch<Grupo[]>('/api/torneos/mundial/2026/grupos'),
]);
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

// Banderas: usar `flagCode(slug)` desde ~/utils/flag-codes.ts
// y renderizar con <TeamFlag>.

// Grupos ordenados; resaltar el del país anfitrión narrativo (Ecuador)
const gruposOrdenados = computed(() => (grupos.value ?? []).slice().sort((a, b) => a.letra.localeCompare(b.letra)));
const esGrupoTri = (g: Grupo) => g.selecciones.some((s) => s.slug === 'ecuador');

// Tagline por grupo (mock — por ahora ninguno excepto los con narrativa)
const grupoTag = (g: Grupo): string => {
  if (esGrupoTri(g)) return ` · Ecuador`;
  if (g.letra === 'A') return ' · México';
  return '';
};

// Hero stat tiles
const heroStats = [
  { num: '48',   label: 'Selecciones',         accent: true },
  { num: '5.5M', label: 'Boletos vendidos',    accent: false },
  { num: '$11B', label: 'Impacto económico',   accent: false },
  { num: '3.6M', label: 'Aforo total',         accent: false },
];

// Inauguración
const inauguracion = {
  fecha: '11 jun', hora: '14:00', etiqueta: '11 JUN · J1',
  local:    { slug: 'mexico',     name: 'México',    rol: 'LOCAL'   },
  visita:   { slug: 'sudafrica',  name: 'Sudáfrica', rol: 'VISITA'  },
  sede: 'Estadio Azteca · CDMX · 87.000',
  href: '/torneos/mundial/2026/grupos/grupo-a/mexico-vs-sudafrica-j1/',
};
const proximoTri = {
  etiqueta: '14 JUN · GRUPO E',
  local:  { slug: 'costa-de-marfil', name: 'Costa de Marfil', rol: 'LOCAL' },
  visita: { slug: 'ecuador',         name: 'Ecuador',         rol: 'J1'    },
  hora: '18:00',
  sede: 'Lincoln Financial Field · Philadelphia',
  href: '/torneos/mundial/2026/grupos/grupo-e/costa-de-marfil-vs-ecuador-j1/',
};

// Countdown reactivo (cliente)
const kickoff = computed(() => new Date(edicion.value!.fechaInicio).getTime());
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

// Fixture destacado (mock)
const fixtureDestacado = [
  { variant: 'dark' as const,  cols: 6, kicker: 'Inauguración · 11 jun · 14:00',   sede: 'Estadio Azteca · CDMX',          grupo: 'Grupo A', local: { slug: 'mexico',          name: 'México' },         visita: { slug: 'sudafrica',       name: 'Sudáfrica' },     jornada: 'J1', href: '/torneos/mundial/2026/grupos/grupo-a/mexico-vs-sudafrica-j1/' },
  { variant: 'green' as const, cols: 6, kicker: 'Debut Tri · 14 jun · 18:00 ET',   sede: 'Lincoln Financial Field · Philly', grupo: 'Grupo E', local: { slug: 'costa-de-marfil', name: 'Costa de Marfil' }, visita: { slug: 'ecuador',         name: 'Ecuador' },        jornada: 'J1', href: '/torneos/mundial/2026/grupos/grupo-e/costa-de-marfil-vs-ecuador-j1/' },
  { variant: 'plain' as const, cols: 4, kicker: '16 jun · Kansas City',            hora: '20:00', local: { slug: 'argentina',        name: 'Argentina' },     visita: { slug: 'argelia',         name: 'Argelia' },     href: '/torneos/mundial/2026/grupos/grupo-j/argentina-vs-argelia-j1/' },
  { variant: 'plain' as const, cols: 4, kicker: '15 jun · Atlanta',                hora: '11:00', local: { slug: 'espana',           name: 'España' },        visita: { slug: 'cabo-verde',      name: 'Cabo Verde' },  href: '/torneos/mundial/2026/grupos/grupo-h/espana-vs-cabo-verde-j1/' },
  { variant: 'plain' as const, cols: 4, kicker: '13 jun · Nueva Jersey',           hora: '17:00', local: { slug: 'brasil',           name: 'Brasil' },        visita: { slug: 'marruecos',       name: 'Marruecos' },   href: '/torneos/mundial/2026/grupos/grupo-c/brasil-vs-marruecos-j1/' },
];

// Favoritos
const cuotas = [
  { num: '+450', slug: 'francia',   label: 'Francia' },
  { num: '+500', slug: 'brasil',    label: 'Brasil' },
  { num: '+550', slug: 'espana',    label: 'España' },
  { num: '+650', slug: 'argentina', label: 'Argentina' },
];
const probCampeon = [
  { slug: 'francia',    team: 'Francia',     val: 18 },
  { slug: 'brasil',     team: 'Brasil',      val: 16 },
  { slug: 'espana',     team: 'España',      val: 14 },
  { slug: 'argentina',  team: 'Argentina',   val: 12 },
  { slug: 'alemania',   team: 'Alemania',    val: 9 },
  { slug: 'inglaterra', team: 'Inglaterra',  val: 8 },
  { slug: 'portugal',   team: 'Portugal',    val: 6 },
  { slug: 'ecuador',    team: 'Ecuador',     val: 3 },
];
const sorpresa = {
  team: 'Marruecos', cuota: '+2200',
  texto: 'Semifinalista en 2022. Llegan con el mismo bloque y un Hakimi en su pico.',
};

// Sedes destacadas (toma 6 del JSON; primera = MetLife wide, segunda = Azteca, resto b-c3)
const sedesDestacadas = computed(() => {
  const todas = edicion.value!.sedes ?? [];
  const wanted = ['metlife-stadium', 'estadio-azteca', 'sofi-stadium', 'mercedes-benz-stadium', 'bmo-field', 'estadio-akron'];
  return wanted.map((slug) => todas.find((s) => s.slug === slug)).filter((s): s is NonNullable<typeof s> => Boolean(s));
});

// La Tri
const triDebut = {
  fecha: '14 jun', sub: 'vs Costa de Marfil · Philadelphia · 18:00 ET',
};
const triProb = '68%';

// Cobertura editorial (mock)
const cobertura = {
  destacadas: [
    { kicker: 'Análisis · 8 min',  title: 'Cómo Beccacece blindó el centro del campo',           meta: '2 de mayo · Por D. Granda', img: '/img/news-placeholder.svg' },
    { kicker: 'Reportaje · 12 min', title: 'Atlanta, la sede que adoptó a la Tri',               meta: '28 abr · Por A. Mejía',     img: '/img/hero-placeholder.svg' },
    { kicker: 'Opinión · 5 min',    title: 'Por qué Alemania no es invencible en el Grupo E',    meta: '25 abr · Por R. Estrada',   img: '/img/stadium-placeholder.svg' },
  ],
  largas: [
    { kicker: 'Crónica · 6 min', title: 'Páez vs Bellingham: el duelo de los 10 que define el grupo', body: 'Dos enganches modernos, dos generaciones, una misma franja. Cómo se preparan ambos para el cara a cara del 18 de junio.' },
    { kicker: 'Datos · 4 min',   title: 'Las 5 cifras que explican por qué Ecuador es favorito en su grupo', body: 'Mejor defensa de eliminatorias, 11 invictos, edad promedio 26.1 — el dossier completo.' },
  ],
  cortas: [
    { kicker: 'Histórico', title: 'El día que Ecuador venció a Inglaterra (2006)' },
    { kicker: 'Mercado',   title: 'Caicedo, el más caro del Mundial: €90M' },
    { kicker: 'Logística', title: 'Guía del hincha: cómo llegar a Atlanta' },
  ],
};

const stadiumImg = '/img/stadium-placeholder.svg';
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

    <!-- HERO -->
    <section class="pro-hero">
      <div class="pro-hero__inner">
        <div class="pro-hero__main">
          <div class="pro-hero__bg wc-hero__bg" />
          <span class="pro-hero__kicker">FIFA World Cup · USA · Canadá · México</span>
          <h1 class="pro-hero__title">Mundial<br>2026</h1>
          <p class="pro-hero__lead">
            48 selecciones. 16 sedes. 104 partidos en 39 días. La primera Copa del Mundo de la era ampliada
            arranca el 11 de junio en el Azteca y se decide el 19 de julio en el MetLife. Ecuador es uno
            de los protagonistas.
          </p>
          <div class="pro-hero__meta">
            <span>11 jun – 19 jul</span>
            <span>48 equipos</span>
            <span>16 sedes</span>
            <span>104 partidos</span>
          </div>
          <div class="wc-stats">
            <div v-for="(s, i) in heroStats" :key="i" class="wc-stat">
              <div :class="['wc-stat__num', s.accent ? 'wc-stat__num--accent' : '']">{{ s.num }}</div>
              <div class="wc-stat__lab">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <aside class="pro-hero__side wc-aside">
          <div class="wc-cdown">
            <h3 class="wc-cdown__h">Cuenta regresiva</h3>
            <ClientOnly>
              <div class="wc-cdown__grid">
                <div class="wc-cdown__c"><div class="wc-cdown__n">{{ cd.d }}</div><div class="wc-cdown__l">Días</div></div>
                <div class="wc-cdown__c"><div class="wc-cdown__n">{{ cd.h }}</div><div class="wc-cdown__l">Horas</div></div>
                <div class="wc-cdown__c"><div class="wc-cdown__n">{{ cd.m }}</div><div class="wc-cdown__l">Min</div></div>
                <div class="wc-cdown__c"><div class="wc-cdown__n">{{ cd.s }}</div><div class="wc-cdown__l">Seg</div></div>
              </div>
              <template #fallback>
                <div class="wc-cdown__grid">
                  <div class="wc-cdown__c"><div class="wc-cdown__n">--</div><div class="wc-cdown__l">Días</div></div>
                  <div class="wc-cdown__c"><div class="wc-cdown__n">--</div><div class="wc-cdown__l">Horas</div></div>
                  <div class="wc-cdown__c"><div class="wc-cdown__n">--</div><div class="wc-cdown__l">Min</div></div>
                  <div class="wc-cdown__c"><div class="wc-cdown__n">--</div><div class="wc-cdown__l">Seg</div></div>
                </div>
              </template>
            </ClientOnly>
          </div>

          <a :href="inauguracion.href" class="wc-match">
            <div class="wc-match__head">
              <span class="wc-match__kicker">Partido inaugural</span>
              <span class="wc-match__when">{{ inauguracion.etiqueta }}</span>
            </div>
            <div class="wc-match__teams">
              <div class="wc-match__team wc-match__team--r">
                <TeamFlag :flag-code="flagCode(inauguracion.local.slug)" :name="inauguracion.local.name" :size="36" />
                <div class="wc-match__name">{{ inauguracion.local.name }}</div>
                <div class="wc-match__rol">{{ inauguracion.local.rol }}</div>
              </div>
              <div class="wc-match__hr">{{ inauguracion.hora }}</div>
              <div class="wc-match__team wc-match__team--l">
                <TeamFlag :flag-code="flagCode(inauguracion.visita.slug)" :name="inauguracion.visita.name" :size="36" />
                <div class="wc-match__name">{{ inauguracion.visita.name }}</div>
                <div class="wc-match__rol">{{ inauguracion.visita.rol }}</div>
              </div>
            </div>
            <div class="wc-match__sede">{{ inauguracion.sede }}</div>
          </a>

          <a :href="proximoTri.href" class="wc-match wc-match--accent">
            <div class="wc-match__head">
              <span class="wc-match__kicker">Próximo de la Tri</span>
              <span class="wc-match__when">{{ proximoTri.etiqueta }}</span>
            </div>
            <div class="wc-match__teams">
              <div class="wc-match__team wc-match__team--r">
                <TeamFlag :flag-code="flagCode(proximoTri.local.slug)" :name="proximoTri.local.name" :size="36" />
                <div class="wc-match__name wc-match__name--accent">{{ proximoTri.local.name }}</div>
                <div class="wc-match__rol">{{ proximoTri.local.rol }}</div>
              </div>
              <div class="wc-match__hr wc-match__hr--accent">{{ proximoTri.hora }}</div>
              <div class="wc-match__team wc-match__team--l">
                <TeamFlag :flag-code="flagCode(proximoTri.visita.slug)" :name="proximoTri.visita.name" :size="36" />
                <div class="wc-match__name">{{ proximoTri.visita.name }}</div>
                <div class="wc-match__rol">{{ proximoTri.visita.rol }}</div>
              </div>
            </div>
            <div class="wc-match__sede wc-match__sede--accent">
              <span>{{ proximoTri.sede }}</span>
              <span class="wc-match__cta">Ver previa →</span>
            </div>
          </a>
        </aside>
      </div>
    </section>

    <PageIndex
      :items="[
        { label: 'Grupos', href: '#grupos' },
        { label: 'Calendario', href: '#calendario' },
        { label: 'Favoritos', href: '#favoritos' },
        { label: 'Sedes', href: '#sedes' },
        { label: 'La Tri', href: '#tri' },
        { label: 'Cobertura', href: '#cobertura' },
      ]"
    />

    <!-- GRUPOS -->
    <section id="grupos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Fase de grupos · 12 grupos · 4 equipos</span>
          <h2 class="pro-sec-head__title">El sorteo en 12 grupos</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/grupos/grupo-e/" class="pro-sec-head__cta">Ver Grupo E →</NuxtLink>
      </div>

      <div class="bento" v-if="gruposOrdenados.length">
        <article
          v-for="g in gruposOrdenados"
          :key="g.slug"
          :class="['tile', 'b-c3', esGrupoTri(g) ? 'tile--green' : '']"
        >
          <span class="tile__kicker">Grupo {{ g.letra }}{{ grupoTag(g) }}</span>
          <ul class="plinklist">
            <li v-for="s in g.selecciones" :key="s.slug">
              <NuxtLink :to="`/selecciones/${s.slug}/`">
                <span style="display:inline-flex;align-items:center;gap:8px">
                  <TeamFlag :flag-code="flagCode(s.slug)" :name="s.nombre" :size="18" />
                  {{ s.nombre }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </article>
      </div>
      <p v-else>Los 12 grupos se publicarán en breve.</p>
    </section>

    <!-- CALENDARIO -->
    <section id="calendario" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Fixture destacado</span>
          <h2 class="pro-sec-head__title">Partidos imperdibles del arranque</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/calendario/" class="pro-sec-head__cta">Ver completo →</NuxtLink>
      </div>

      <div class="bento">
        <a
          v-for="(m, i) in fixtureDestacado"
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
          <div class="pmatch wc-pmatch" :class="m.variant === 'dark' || m.variant === 'green' ? 'wc-pmatch--on-dark' : ''">
            <div v-if="m.sede || m.grupo" class="pmatch__head">
              <span v-if="m.sede" :class="m.variant === 'green' ? 'wc-sede--bright' : 'wc-sede--muted'">{{ m.sede }}</span>
              <span v-if="m.grupo" class="wc-grupo">{{ m.grupo }}</span>
            </div>
            <div class="pmatch__teams">
              <div class="pmatch__team">
                <strong style="display:inline-flex;align-items:center;gap:8px">
                  <TeamFlag :flag-code="flagCode(m.local.slug)" :name="m.local.name" :size="20" />
                  {{ m.local.name }}
                </strong>
              </div>
              <div class="pmatch__center">VS<small>{{ m.jornada || m.hora }}</small></div>
              <div class="pmatch__team">
                <strong style="display:inline-flex;align-items:center;gap:8px">
                  <TeamFlag :flag-code="flagCode(m.visita.slug)" :name="m.visita.name" :size="20" />
                  {{ m.visita.name }}
                </strong>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>

    <!-- FAVORITOS -->
    <section id="favoritos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Favoritos según mercado</span>
          <h2 class="pro-sec-head__title">Quiénes pelean la copa</h2>
        </div>
      </div>

      <div class="stat-row wc-cuotas">
        <div v-for="(c, i) in cuotas" :key="i" class="stat-row__cell">
          <span class="stat-row__num">{{ c.num }}</span>
          <span class="stat-row__label" style="display:inline-flex;align-items:center;gap:6px;justify-content:center">
            <TeamFlag :flag-code="flagCode(c.slug)" :name="c.label" :size="16" />
            {{ c.label }}
          </span>
        </div>
      </div>

      <BentoGrid>
        <article class="tile b-c8">
          <span class="tile__kicker">Probabilidad de campeón · modelo Golgana</span>
          <h3 class="tile__title">Top 8</h3>
          <div class="bars wc-prob">
            <div v-for="(p, i) in probCampeon" :key="i" class="bar">
              <span class="bar__label" style="display:inline-flex;align-items:center;gap:8px">
                <TeamFlag :flag-code="flagCode(p.slug)" :name="p.team" :size="18" />
                {{ p.team }}
              </span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: p.val + '%' }" /></div>
              <span class="bar__val">{{ p.val }}%</span>
            </div>
          </div>
        </article>
        <article class="tile tile--green b-c4">
          <span class="tile__kicker">Sorpresa apuesta</span>
          <h3 class="tile__title wc-sorpresa__name">{{ sorpresa.team }}</h3>
          <div class="tile__big-num">{{ sorpresa.cuota }}</div>
          <p class="tile__caption">{{ sorpresa.texto }}</p>
        </article>
      </BentoGrid>
    </section>

    <!-- SEDES -->
    <section id="sedes" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">{{ edicion.sedes?.length ?? 16 }} sedes · 3 países</span>
          <h2 class="pro-sec-head__title">Estadios y ciudades</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/sedes/" class="pro-sec-head__cta">Ver todas →</NuxtLink>
      </div>

      <div class="bento" v-if="sedesDestacadas.length">
        <a
          v-for="(s, i) in sedesDestacadas"
          :key="s.slug"
          href="#"
          :class="[
            'media-tile',
            i === 0 ? 'media-tile--wide b-c8' : i === 1 ? 'b-c4' : 'b-c3',
          ]"
        >
          <img :src="stadiumImg" :alt="s.nombre" />
          <div class="media-tile__body">
            <span class="media-tile__kicker">
              {{ i === 0 ? 'Final · 19 jul' : i === 1 ? 'Inauguración · 11 jun' : s.pais }}
            </span>
            <h3 :class="['media-tile__title', i === 0 ? 'wc-sede__title--xl' : '']">{{ s.nombre }}</h3>
            <span v-if="i < 2" class="media-tile__meta">
              {{ s.ciudad }}{{ s.pais ? ' · ' + s.pais : '' }} · {{ Math.round(s.capacidad / 1000) }}K
            </span>
          </div>
        </a>
      </div>
    </section>

    <!-- LA TRI -->
    <section id="tri" class="pro-section pro-container wc-tri">
      <div class="pro-sec-head wc-tri__head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura especial</span>
          <h2 class="pro-sec-head__title wc-tri__title">Ecuador en el Mundial</h2>
        </div>
        <NuxtLink to="/selecciones/ecuador/" class="pro-sec-head__cta wc-tri__cta">Ficha completa →</NuxtLink>
      </div>

      <BentoGrid>
        <article class="tile tile--dark b-c6 wc-tri__hero">
          <span class="tile__kicker">Grupo E · 4° Mundial</span>
          <h3 class="tile__title wc-tri__hero-title">La Tri busca su segundo octavos</h3>
          <p class="tile__caption wc-tri__hero-txt">
            Beccacece arma una selección con base de Mundial sub-20 2019. Caicedo capitán, Gonzalo Plata
            referente y la dupla Estupiñán-Pacho como columna vertebral.
          </p>
          <NuxtLink to="/selecciones/ecuador/" class="btn btn--primary wc-tri__cta-btn">Ver plantilla y análisis</NuxtLink>
        </article>
        <article class="tile tile--green b-c3">
          <span class="tile__kicker">Debut</span>
          <h3 class="tile__title wc-tri__debut">{{ triDebut.fecha }}</h3>
          <p class="tile__caption">{{ triDebut.sub }}</p>
        </article>
        <article class="tile b-c3">
          <span class="tile__kicker">Probabilidad octavos</span>
          <div class="tile__big-num accent">{{ triProb }}</div>
          <p class="tile__caption">Modelo Golgana · Grupo asequible</p>
        </article>
      </BentoGrid>
    </section>

    <!-- COBERTURA EDITORIAL -->
    <section id="cobertura" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura editorial</span>
          <h2 class="pro-sec-head__title">Lo último en notas</h2>
        </div>
        <NuxtLink to="/noticias/" class="pro-sec-head__cta">Ver todas →</NuxtLink>
      </div>

      <div class="bento">
        <a
          v-for="(n, i) in cobertura.destacadas"
          :key="`d${i}`"
          href="/noticias/"
          class="media-tile media-tile--tall b-c4"
        >
          <img :src="n.img" :alt="n.title" />
          <div class="media-tile__body">
            <span class="media-tile__kicker">{{ n.kicker }}</span>
            <h3 class="media-tile__title wc-cob__title">{{ n.title }}</h3>
            <span class="media-tile__meta">{{ n.meta }}</span>
          </div>
        </a>

        <a
          v-for="(n, i) in cobertura.largas"
          :key="`l${i}`"
          href="/noticias/"
          class="tile b-c6"
        >
          <span class="tile__kicker">{{ n.kicker }}</span>
          <h3 class="tile__title">{{ n.title }}</h3>
          <p class="tile__caption wc-cob__body">{{ n.body }}</p>
        </a>

        <a
          v-for="(n, i) in cobertura.cortas"
          :key="`c${i}`"
          href="/noticias/"
          class="tile tile--dark b-c4"
        >
          <span class="tile__kicker">{{ n.kicker }}</span>
          <h3 class="tile__title wc-cob__short-title">{{ n.title }}</h3>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wc-hero__bg {
  background: linear-gradient(135deg, #000 0%, #0a3d20 50%, #067a4a 100%);
  z-index: -1;
}

/* Hero stats */
.wc-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px; margin-top: 32px; max-width: 680px;
}
.wc-stat {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px; padding: 16px;
}
.wc-stat__num {
  font-family: var(--font-display);
  font-size: 36px; line-height: 0.9; color: #fff;
}
.wc-stat__num--accent { color: var(--color-primary-green); }
.wc-stat__lab {
  font-size: 11px; color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.14em; text-transform: uppercase; margin-top: 6px;
}

/* Hero aside */
.wc-aside { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.wc-cdown { flex: 0 0 auto; }
.wc-cdown__h { margin-bottom: 12px; }
.wc-cdown__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.wc-cdown__c {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px; padding: 14px 6px; text-align: center;
}
.wc-cdown__n { font-family: var(--font-display); font-size: 32px; line-height: 1; color: #fff; }
.wc-cdown__l {
  font-size: 10px; letter-spacing: 0.14em;
  text-transform: uppercase; color: rgba(255, 255, 255, 0.65); margin-top: 4px;
}

.wc-match {
  text-decoration: none; color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px; padding: 22px 20px;
  display: flex; flex-direction: column;
  justify-content: space-between; gap: 18px;
  flex: 1 1 0; min-height: 0;
}
.wc-match--accent {
  background: linear-gradient(135deg, rgba(2, 204, 116, 0.18), rgba(2, 204, 116, 0.05));
  border-color: rgba(2, 204, 116, 0.5);
  box-shadow: inset 0 0 0 1px rgba(2, 204, 116, 0.1);
}
.wc-match__head { display: flex; align-items: center; justify-content: space-between; }
.wc-match__kicker {
  font-size: 11px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--color-primary-green); font-weight: 600;
}
.wc-match__when { font-size: 11px; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.08em; }
.wc-match__teams {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 14px; align-items: center;
}
.wc-match__team { display: flex; flex-direction: column; gap: 6px; }
.wc-match__team--r { text-align: right; align-items: flex-end; }
.wc-match__team--l { text-align: left; align-items: flex-start; }
.wc-match__flag { font-size: 32px; line-height: 0.95; }
.wc-match__name {
  font-family: var(--font-display); font-size: 26px; line-height: 1.05;
}
.wc-match__name--accent { color: var(--color-primary-green); }
.wc-match__rol {
  font-size: 10px; color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.08em;
}
.wc-match__hr {
  font-family: var(--font-display); font-size: 22px;
  color: var(--color-primary-green);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px; padding: 8px 10px; line-height: 1;
}
.wc-match__hr--accent { color: #fff; background: var(--color-primary-green); }
.wc-match__sede {
  font-size: 12px; color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.04em;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 12px;
}
.wc-match__sede--accent {
  color: rgba(255, 255, 255, 0.7);
  border-top-color: rgba(2, 204, 116, 0.25);
  display: flex; justify-content: space-between;
}
.wc-match__cta { color: var(--color-primary-green); font-weight: 600; }

/* Calendario */
.wc-pmatch { margin-top: 12px; }
.wc-pmatch--on-dark .pmatch__teams strong,
.wc-pmatch--on-dark .pmatch__center { color: #fff; }
.wc-pmatch--on-dark .pmatch__center small { color: rgba(255, 255, 255, 0.7); }
.wc-sede--muted  { color: rgba(255, 255, 255, 0.7); }
.wc-sede--bright { color: rgba(255, 255, 255, 0.85); }
.wc-grupo { color: var(--color-primary-green); }

/* Favoritos */
.wc-cuotas { margin-bottom: 16px; }
.wc-prob   { margin-top: 12px; }
.wc-sorpresa__name { color: #fff; }

/* Sedes */
.wc-sede__title--xl { font-size: 36px; }

/* La Tri (sección oscura embedded) */
.wc-tri {
  background: #0a0a0a;
  border-radius: 24px;
  padding: 32px 24px;
}
.wc-tri__head { border-color: rgba(255, 255, 255, 0.15); }
.wc-tri__title { color: #fff; }
.wc-tri__cta { color: #fff; }
.wc-tri__hero { border-color: rgba(255, 255, 255, 0.08); }
.wc-tri__hero-title { color: #fff; font-size: 36px; }
.wc-tri__hero-txt { color: rgba(255, 255, 255, 0.7); margin-top: 12px; }
.wc-tri__cta-btn { margin-top: 16px; align-self: flex-start; }
.wc-tri__debut { color: #fff; }

.tile__big-num.accent { color: var(--color-primary-green); }

/* Cobertura */
.wc-cob__title { font-size: 24px; }
.wc-cob__body  { margin-top: 8px; }
.wc-cob__short-title { color: #fff; }
</style>
