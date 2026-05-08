<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, injectSchema } from '~/composables/useSchema';
import { flagCode } from '~/utils/flag-codes';

const route = useRoute();
const partidoSlug = route.params.partido as string;
const grupoSlug = route.params.grupo as string;
const { data: partido } = await useFetch<Partido>(`/api/partidos/${partidoSlug}`);
if (!partido.value) throw createError({ statusCode: 404 });

const titleByState: Record<string, string> = {
  scheduled: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Previa`,
  playing: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — En juego`,
  finished: partido.value.marcador
    ? `${partido.value.local.nombre} ${partido.value.marcador.local}-${partido.value.marcador.visitante} ${partido.value.visitante.nombre} — Crónica`
    : `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Crónica`,
  postponed: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Aplazado`,
};
const estadoLabel: Record<Partido['estado'], string> = {
  scheduled: 'Programado',
  playing: 'En juego',
  finished: 'Finalizado',
  postponed: 'Aplazado',
};
const estadoMap: Record<Partido['estado'], 'upcoming' | 'ongoing' | 'finished' | 'postponed'> = {
  scheduled: 'upcoming',
  playing: 'ongoing',
  finished: 'finished',
  postponed: 'postponed',
};

useSeo({
  title: `${titleByState[partido.value.estado]} | Mundial 2026`,
  description:
    partido.value.previa?.texto.replace(/<[^>]+>/g, '').slice(0, 160) ??
    `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} en el Mundial 2026.`,
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    {
      name: `Grupo ${grupoSlug.replace('grupo-', '').toUpperCase()}`,
      url: `${config.public.siteUrl}/torneos/mundial/2026/grupos/${grupoSlug}/`,
    },
    { name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}` },
  ]),
  buildSportsEvent({
    name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}`,
    startDate: partido.value.fecha,
    estado: estadoMap[partido.value.estado],
    locationName: partido.value.sede.nombre,
  }),
]);

// Banderas: usar flagCode(slug) → <TeamFlag>.

const fifaRank: Record<string, string> = {
  ecuador: '25° FIFA · Conmebol',
  uzbekistan: '58° FIFA · AFC · Debut',
  inglaterra: '4° FIFA · UEFA',
  'costa-de-marfil': '42° FIFA · CAF',
};

// Estado helpers
const isFinished  = computed(() => partido.value!.estado === 'finished');
const isScheduled = computed(() => partido.value!.estado === 'scheduled' || partido.value!.estado === 'postponed');
const winner = computed<'local' | 'visitante' | 'draw' | null>(() => {
  if (!isFinished.value || !partido.value!.marcador) return null;
  const { local, visitante } = partido.value!.marcador;
  if (local > visitante) return 'local';
  if (visitante > local) return 'visitante';
  return 'draw';
});

// Fecha formateada
const fechaPartido = computed(() => new Date(partido.value!.fecha));
const horaET = computed(() => fechaPartido.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' }));
const fechaCorta = computed(() => fechaPartido.value.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', timeZone: 'America/New_York' }));
const fechaLarga = computed(() => fechaPartido.value.toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'America/New_York' }));
const diaSemana  = computed(() => fechaPartido.value.toLocaleDateString('es-EC', { weekday: 'long', timeZone: 'America/New_York' }).replace(/^./, (c) => c.toUpperCase()));
const horaEC     = computed(() => fechaPartido.value.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Guayaquil' }));

// Countdown reactivo (solo cliente, solo si scheduled)
const now = ref(Date.now());
let timer: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  if (isScheduled.value) timer = setInterval(() => { now.value = Date.now(); }, 1000);
});
onBeforeUnmount(() => { if (timer) clearInterval(timer); });
const cd = computed(() => {
  const diff = Math.max(0, fechaPartido.value.getTime() - now.value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    d: pad(Math.floor(diff / 86_400_000)),
    h: pad(Math.floor((diff % 86_400_000) / 3_600_000)),
    m: pad(Math.floor((diff % 3_600_000) / 60_000)),
    s: pad(Math.floor((diff % 60_000) / 1_000)),
  };
});

// ----- SCHEDULED MOCKS -----
const aSeguir = {
  vs: 'Caicedo vs Yakhshiboev',
  texto: 'El duelo en el círculo central definirá quién impone ritmo. Si Yakhshiboev consigue salir limpio de la presión, Uzbekistán puede sostener el empate.',
};
const pronostico = {
  ganaLocal: 62, empate: 24, ganaVisita: 14,
  cuotas: { local: 1.55, empate: 3.80, visita: 6.50 },
  marcadores: [
    { label: '2-0 Ecuador', val: 18 }, { label: '1-0 Ecuador', val: 16 },
    { label: '2-1 Ecuador', val: 13 }, { label: '3-0 Ecuador', val: 10 },
    { label: '1-1', val: 11 },         { label: '0-0', val: 7 },
  ],
  xg: { local: 2.1, visita: 0.8, total: 2.9, btts: 38 },
};

type Resultado = 'G' | 'E' | 'P';
const formaLocal = {
  resumen: '3G 1E 1P',
  resultados: ['G', 'G', 'E', 'G', 'P'] as Resultado[],
  partidos: [
    { fecha: '28 mar', rival: 'vs 🇲🇽 México',     comp: 'Amistoso', res: '1-0 G', tag: 'G' as Resultado },
    { fecha: '22 mar', rival: 'vs 🇨🇱 Chile',       comp: 'Elim.',     res: '2-1 G', tag: 'G' as Resultado },
    { fecha: '16 nov', rival: '@ 🇨🇴 Colombia',     comp: 'Elim.',     res: '0-0 E', tag: 'E' as Resultado },
    { fecha: '11 nov', rival: 'vs 🇧🇴 Bolivia',     comp: 'Elim.',     res: '3-0 G', tag: 'G' as Resultado },
    { fecha: '15 oct', rival: '@ 🇻🇪 Venezuela',    comp: 'Elim.',     res: '1-2 P', tag: 'P' as Resultado },
  ],
  totales: { gf: 7, gc: 3, pts: 10 },
};
const formaVisita = {
  resumen: '2G 1E 2P',
  resultados: ['G', 'P', 'G', 'E', 'P'] as Resultado[],
  partidos: [
    { fecha: '26 mar', rival: 'vs 🇰🇬 Kirguistán',  comp: 'Amistoso', res: '2-0 G', tag: 'G' as Resultado },
    { fecha: '22 mar', rival: '@ 🇮🇷 Irán',          comp: 'Elim.',     res: '0-2 P', tag: 'P' as Resultado },
    { fecha: '19 nov', rival: 'vs 🇶🇦 Catar',        comp: 'Elim.',     res: '1-0 G', tag: 'G' as Resultado },
    { fecha: '14 nov', rival: '@ 🇦🇪 Emiratos',      comp: 'Elim.',     res: '1-1 E', tag: 'E' as Resultado },
    { fecha: '15 oct', rival: 'vs 🇰🇷 Corea Sur',    comp: 'Elim.',     res: '0-1 P', tag: 'P' as Resultado },
  ],
  totales: { gf: 4, gc: 4, pts: 7 },
};
const formaColor: Record<Resultado, string> = { G: 'var(--color-primary-green)', E: '#9ca3af', P: '#dc2626' };
const formaResColor: Record<Resultado, string> = { G: 'var(--color-primary-green)', E: '#9ca3af', P: '#dc2626' };

// H2H
const tieneH2H = computed(() => (partido.value!.h2h?.totalEnfrentamientos ?? 0) > 0);
const h2hMock = {
  totalEnfrentamientos: 3, victoriasLocal: 2, empates: 1, victoriasVisitante: 0,
  ultimosResultados: [
    { fecha: 'oct 2024', torneo: 'Amistoso', sede: 'Doha',     marcador: 'Ecuador 2 — 0 Uzbekistán',  ganador: 'L' as 'L' | 'D' | 'V' },
    { fecha: 'mar 2018', torneo: 'Amistoso', sede: 'Tashkent', marcador: 'Uzbekistán 1 — 1 Ecuador',  ganador: 'D' as 'L' | 'D' | 'V' },
    { fecha: 'ago 2010', torneo: 'Amistoso', sede: 'Quito',    marcador: 'Ecuador 3 — 1 Uzbekistán',  ganador: 'L' as 'L' | 'D' | 'V' },
  ],
};
const h2hData = computed(() => tieneH2H.value ? {
  totalEnfrentamientos: partido.value!.h2h!.totalEnfrentamientos,
  victoriasLocal: partido.value!.h2h!.victoriasLocal,
  empates: partido.value!.h2h!.empates,
  victoriasVisitante: partido.value!.h2h!.victoriasVisitante,
  ultimosResultados: h2hMock.ultimosResultados,
} : h2hMock);
const h2hPctLocal = computed(() => Math.round((h2hData.value.victoriasLocal / (h2hData.value.totalEnfrentamientos || 1)) * 100));
const h2hPctEmp   = computed(() => Math.round((h2hData.value.empates / (h2hData.value.totalEnfrentamientos || 1)) * 100));
const h2hPctVis   = computed(() => 100 - h2hPctLocal.value - h2hPctEmp.value);

const audiencia = { total: 12480, local: 71, empate: 18, visita: 11 };

// XI grids
type XIRow = { num: number; name: string; cap?: boolean };
const xiLocal = computed<XIRow[][]>(() => {
  const t = partido.value!.alineaciones?.local.titulares ?? [];
  const por = t.filter((p) => p.posicion === 'POR');
  const def = t.filter((p) => p.posicion === 'DEF');
  const med = t.filter((p) => p.posicion === 'MED');
  const del = t.filter((p) => p.posicion === 'DEL');
  const ancla = med.find((p) => p.capitan) ?? med[0];
  const ofensivos = med.filter((p) => p !== ancla);
  return [del.map(p2row), ofensivos.map(p2row), ancla ? [p2row(ancla)] : [], def.map(p2row), por.map(p2row)].filter((r) => r.length);
});
const xiVisita = computed<XIRow[][]>(() => {
  const t = partido.value!.alineaciones?.visitante.titulares ?? [];
  const por = t.filter((p) => p.posicion === 'POR');
  const def = t.filter((p) => p.posicion === 'DEF');
  const med = t.filter((p) => p.posicion === 'MED');
  const del = t.filter((p) => p.posicion === 'DEL');
  return [del.map(p2row), med.map(p2row), def.map(p2row), por.map(p2row)].filter((r) => r.length);
});
function p2row(p: { dorsal?: number; jugador: { nombre: string }; capitan?: boolean }): XIRow {
  return { num: p.dorsal ?? 0, name: p.jugador.nombre, cap: p.capitan };
}

// ----- FINISHED MOCKS -----
// Goleadores: usa partido.goleadores si existe; fallback a mock
const goleadoresLocal = computed(() => {
  const reales = (partido.value!.goleadores ?? []).filter((g) => g.equipo.slug === partido.value!.local.slug);
  if (reales.length) return reales.map((g) => ({ minuto: `${g.minuto}'`, texto: `${g.jugador.nombre}${g.tipo === 'penal' ? ' (pen.)' : ''}${g.asistente ? ` · asist. ${g.asistente.nombre}` : ''}` }));
  return [
    { minuto: "23'", texto: 'K. Páez · asist. Plata' },
    { minuto: "67'", texto: 'E. Valencia (pen.)' },
  ];
});
const goleadoresVisita = computed(() => {
  const reales = (partido.value!.goleadores ?? []).filter((g) => g.equipo.slug === partido.value!.visitante.slug);
  if (reales.length) return reales.map((g) => ({ minuto: `${g.minuto}'`, texto: `${g.jugador.nombre}${g.tipo === 'penal' ? ' (pen.)' : ''}${g.asistente ? ` · asist. ${g.asistente.nombre}` : ''}` }));
  return [{ minuto: "82'", texto: 'E. Shomurodov · asist. Erkinov' }];
});

// Final · 90'+x  (mock; en datos reales podría venir en cronica/eventos)
const finalText = "Final · 90'+4";
const asistencia = '68.412';

const figura = {
  nombre: 'Kendry Páez',
  rating: 8.9,
  texto: '1 gol · 1 asistencia · 4/5 regates · 92% pases. A los 18 años se llevó el partido por delante.',
};

// Eventos timeline (mock; idealmente desde partido.minutoAMinuto)
type EvType = 'gol-local' | 'gol-visita' | 'tarjeta' | 'cambio';
const eventos: Array<{ minuto: number; tipo: EvType; titulo: string; sub: string }> = [
  { minuto: 23, tipo: 'gol-local',  titulo: '⚽ <strong>K. Páez</strong> abre el marcador', sub: 'Asistencia: G. Plata · 1-0' },
  { minuto: 38, tipo: 'tarjeta',    titulo: '🟨 <strong>Akhmedov</strong> · falta táctica', sub: 'Uzbekistán' },
  { minuto: 46, tipo: 'cambio',     titulo: '🔄 Saidov sale, entra Yusupov',                sub: 'Uzbekistán · técnico' },
  { minuto: 67, tipo: 'gol-local',  titulo: '⚽ <strong>E. Valencia</strong> de penal',     sub: 'Falta sobre Sarmiento · 2-0' },
  { minuto: 82, tipo: 'gol-visita', titulo: '⚽ <strong>Shomurodov</strong> descuenta',     sub: 'Asistencia: Erkinov · 2-1' },
  { minuto: 88, tipo: 'cambio',     titulo: '🔄 Caicedo sale, entra Sarabia',               sub: 'Ecuador · cierre defensivo' },
];
const eventosBar = computed(() => eventos
  .filter((e) => e.tipo === 'gol-local' || e.tipo === 'gol-visita' || e.tipo === 'tarjeta')
  .map((e) => ({ ...e, left: Math.min(99, (e.minuto / 90) * 100) })));

// Stat compare
const statCmp = [
  { l: '58%', r: '42%', pl: 58, pr: 42, label: 'Posesión',           winnerL: true,  winnerR: false },
  { l: '14',  r: '8',   pl: 64, pr: 36, label: 'Tiros',              winnerL: true,  winnerR: false },
  { l: '6',   r: '3',   pl: 67, pr: 33, label: 'Tiros al arco',      winnerL: true,  winnerR: false },
  { l: '2.3', r: '0.8', pl: 74, pr: 26, label: 'xG · Goles esperados', winnerL: true, winnerR: false },
  { l: '7',   r: '4',   pl: 64, pr: 36, label: 'Tiros de esquina',   winnerL: true,  winnerR: false },
  { l: '11',  r: '15',  pl: 42, pr: 58, label: 'Faltas cometidas',   winnerL: false, winnerR: true  },
  { l: '87%', r: '82%', pl: 51, pr: 49, label: 'Precisión de pase',  winnerL: false, winnerR: false },
  { l: '2',   r: '4',   pl: 33, pr: 67, label: 'Tarjetas amarillas', winnerL: false, winnerR: false },
];

// Ratings (mock)
type Rate = { num: number; name: string; pos: string; rate: number; mvp?: boolean };
const rateLocal: Rate[] = [
  { num: 10, name: 'K. Páez',       pos: 'MED', rate: 8.9, mvp: true },
  { num: 14, name: 'G. Plata',      pos: 'DEL', rate: 8.1 },
  { num: 22, name: 'M. Caicedo (C)', pos: 'MED', rate: 7.8 },
  { num: 9,  name: 'E. Valencia',   pos: 'DEL', rate: 7.6 },
  { num: 4,  name: 'W. Pacho',      pos: 'DEF', rate: 7.5 },
  { num: 3,  name: 'P. Hincapié',   pos: 'DEF', rate: 7.2 },
  { num: 7,  name: 'P. Estupiñán',  pos: 'DEF', rate: 7.0 },
  { num: 1,  name: 'H. Galíndez',   pos: 'POR', rate: 6.8 },
];
const rateVisita: Rate[] = [
  { num: 9,  name: 'E. Shomurodov', pos: 'DEL', rate: 7.7 },
  { num: 10, name: 'Erkinov',       pos: 'MED', rate: 7.1 },
  { num: 6,  name: 'Khusanov',      pos: 'MED', rate: 6.9 },
  { num: 1,  name: 'Ergashev',      pos: 'POR', rate: 6.7 },
  { num: 5,  name: 'Ismailov',      pos: 'DEF', rate: 6.4 },
  { num: 7,  name: 'Yakhshiboev',   pos: 'DEL', rate: 6.2 },
  { num: 8,  name: 'Akhmedov',      pos: 'MED', rate: 5.9 },
  { num: 3,  name: 'Saidov',        pos: 'DEF', rate: 5.7 },
];
const rateClass = (r: number, mvp?: boolean): string =>
  mvp ? 'rate-row__rate--mvp' : r >= 7.5 ? 'rate-row__rate--high' : r >= 6.5 ? 'rate-row__rate--mid' : 'rate-row__rate--low';

// Repercusión (mock)
const repercusion = {
  cita: '"Ganamos sufriendo, pero ganamos. Eso vale oro en un Mundial."',
  citaAutor: `— ${partido.value.alineaciones?.local.dt.nombre ?? 'DT local'}, conferencia post-partido`,
  tablaGrupo: [
    { pos: 1, slug: 'inglaterra',       nombre: 'Inglaterra', pts: 3 },
    { pos: 2, slug: 'ecuador',          nombre: 'Ecuador',    pts: 3 },
    { pos: 3, slug: 'costa-de-marfil',  nombre: 'C. Marfil',  pts: 0 },
    { pos: 4, slug: 'uzbekistan',       nombre: 'Uzbekistán', pts: 0 },
  ],
  proximo: { jornada: 'J2', fecha: '17 jun · 15:00 ET', local: { slug: 'inglaterra', name: 'Inglaterra' }, visita: { slug: 'ecuador', name: 'Ecuador' }, sede: 'Lincoln Financial Field · Filadelfia' },
  audienciaTV: { num: '9.2M', cap: 'Espectadores en EC · récord histórico no-Conmebol' },
  redes: { num: '+218K', cap: `Tweets con #LaTri durante el partido. Pico al gol de ${goleadoresLocal.value[0]?.texto.split(' · ')[0] ?? 'Páez'}.` },
};
</script>

<template>
  <div v-if="partido">
    <div class="pro-container">
      <Breadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
          { label: `Grupo ${grupoSlug.replace('grupo-', '').toUpperCase()}`, to: `/torneos/mundial/2026/grupos/${grupoSlug}/` },
          { label: `${partido.local.nombre} vs ${partido.visitante.nombre}` },
        ]"
      />
    </div>

    <!-- ============ MATCH HERO ============ -->
    <section :class="['mh', isFinished ? 'mh--ft' : '']">
      <div class="mh__inner">
        <div class="mh__top">
          <span>{{ partido.fase.nombre.replace('Fase de grupos · ', '') }} · {{ partido.grupo?.nombre ?? '' }} · Mundial 2026</span>
          <span :class="['mh__pill', isFinished ? 'mh__pill--ft' : '']">{{ estadoLabel[partido.estado] }}</span>
          <span>{{ isFinished ? `${fechaCorta} · ${partido.sede.nombre}` : partido.sede.nombre }}</span>
        </div>

        <div class="mh__match">
          <div class="mh__team mh__team--l">
            <div :class="['mh__flag', `mh__flag--${partido.local.slug}`]" role="img" :aria-label="`Bandera de ${partido.local.nombre}`" />
            <div>
              <div class="mh__name">{{ partido.local.nombre }}</div>
              <div class="mh__role">{{ fifaRank[partido.local.slug] ?? '' }}</div>
            </div>
          </div>

          <div class="mh__center">
            <!-- Center: scheduled → hora; finished → marcador -->
            <template v-if="isFinished && partido.marcador">
              <div class="mh__score">
                <span :class="winner === 'local' ? 'winner' : 'loser'">{{ partido.marcador.local }}</span>
                <span class="sep">—</span>
                <span :class="winner === 'visitante' ? 'winner' : 'loser'">{{ partido.marcador.visitante }}</span>
              </div>
              <div class="mh__date">{{ finalText }}</div>
              <div class="mh__venue">Asistencia: {{ asistencia }} · Árbitro: {{ partido.arbitro?.nombre || 'TBD' }}</div>
            </template>
            <template v-else>
              <div class="mh__time">{{ horaET }}</div>
              <div class="mh__date">{{ fechaCorta }} · Hora ET</div>
              <div class="mh__venue">71.000 localidades · Árbitro: {{ partido.arbitro?.nombre || 'TBD' }}</div>
            </template>
          </div>

          <div class="mh__team mh__team--r">
            <div :class="['mh__flag', `mh__flag--${partido.visitante.slug}`]" role="img" :aria-label="`Bandera de ${partido.visitante.nombre}`" />
            <div>
              <div class="mh__name">{{ partido.visitante.nombre }}</div>
              <div class="mh__role">{{ fifaRank[partido.visitante.slug] ?? '' }}</div>
            </div>
          </div>
        </div>

        <ClientOnly>
          <div class="cdown" v-if="isScheduled">
            <div class="cdown__c"><div class="cdown__n">{{ cd.d }}</div><div class="cdown__l">Días</div></div>
            <div class="cdown__c"><div class="cdown__n">{{ cd.h }}</div><div class="cdown__l">Horas</div></div>
            <div class="cdown__c"><div class="cdown__n">{{ cd.m }}</div><div class="cdown__l">Min</div></div>
            <div class="cdown__c"><div class="cdown__n">{{ cd.s }}</div><div class="cdown__l">Seg</div></div>
          </div>
        </ClientOnly>
      </div>
    </section>

    <!-- SCORERS STRIP (solo finalizado) -->
    <div v-if="isFinished" class="scorers">
      <div class="scorers__c">
        <div class="scorers__l" style="display:inline-flex;align-items:center;gap:6px">
          <TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="16" />
          Goleadores
        </div>
        <div class="scorers__list scorers__list--l">
          <div v-for="(g, i) in goleadoresLocal" :key="`l${i}`"><span>{{ g.minuto }}</span> {{ g.texto }}</div>
          <div v-if="!goleadoresLocal.length" class="scorers__empty">—</div>
        </div>
      </div>
      <div class="scorers__c">
        <div class="scorers__l" style="display:inline-flex;align-items:center;gap:6px">
          <TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="16" />
          Goleadores
        </div>
        <div class="scorers__list scorers__list--v">
          <div v-for="(g, i) in goleadoresVisita" :key="`v${i}`"><span>{{ g.minuto }}</span> {{ g.texto }}</div>
          <div v-if="!goleadoresVisita.length" class="scorers__empty">—</div>
        </div>
      </div>
    </div>

    <!-- MATCH INFO STRIP (solo programado) -->
    <div v-if="isScheduled" class="minfo">
      <div class="minfo__c"><div class="minfo__l">Fecha</div><div class="minfo__v">{{ fechaLarga }}</div><div class="minfo__s">{{ diaSemana }}</div></div>
      <div class="minfo__c"><div class="minfo__l">Hora</div><div class="minfo__v">{{ horaET }} ET</div><div class="minfo__s">{{ horaEC }} hora EC</div></div>
      <div class="minfo__c"><div class="minfo__l">Estadio</div><div class="minfo__v">{{ partido.sede.nombre.split(' Stadium')[0] }}</div><div class="minfo__s">Atlanta · GA</div></div>
      <div class="minfo__c"><div class="minfo__l">Capacidad</div><div class="minfo__v">71.000</div><div class="minfo__s">Sold out</div></div>
      <div class="minfo__c"><div class="minfo__l">Árbitro</div><div class="minfo__v">{{ partido.arbitro?.nombre || 'TBD' }}</div><div class="minfo__s">{{ partido.arbitro?.nacionalidad || '—' }}</div></div>
      <div class="minfo__c"><div class="minfo__l">TV</div><div class="minfo__v">{{ partido.transmision?.[0] ?? '—' }}</div><div class="minfo__s">{{ partido.transmision?.slice(1).join(' · ') }}</div></div>
    </div>

    <PageIndex
      v-if="isFinished"
      :items="[
        { label: 'Resumen', href: '#resumen' },
        { label: 'Cronología', href: '#timeline' },
        { label: 'Estadísticas', href: '#stats' },
        { label: 'Calificaciones', href: '#ratings' },
        { label: 'Repercusión', href: '#repercusion' },
      ]"
    />
    <PageIndex
      v-else
      :items="[
        { label: 'Previa', href: '#previa' },
        { label: 'Alineaciones', href: '#xis' },
        { label: 'Pronóstico', href: '#prono' },
        { label: 'Forma', href: '#forma' },
        { label: 'Historial', href: '#h2h' },
        { label: 'Audiencia', href: '#voz' },
      ]"
    />

    <!-- ============ FINISHED BRANCH ============ -->
    <template v-if="isFinished">
      <!-- RESUMEN EDITORIAL -->
      <section id="resumen" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Crónica</span>
            <h2 class="pro-sec-head__title">El debut soñado, con susto incluido</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile b-c8">
            <span class="tile__kicker">Análisis · 4 min lectura</span>
            <h3 class="tile__title">Ecuador suma de a tres y mira a Inglaterra</h3>
            <div v-if="partido.cronica" class="prev-text" v-html="partido.cronica.texto" />
            <div v-else class="prev-text">
              <p>La Tri abrió el grupo con un triunfo que se complicó más de lo esperado. <strong>Páez</strong>, con un zurdazo desde fuera del área, rompió el cero a los 23' tras una jugada elaborada con Plata. La segunda llegó por penal después del descanso, transformado por <strong>Valencia</strong>. Cuando todo parecía resuelto, Shomurodov descontó al 82' y Uzbekistán empujó con orden hasta el final. Beccacece pidió calma desde la banca, leyó el momento y cerró la victoria.</p>
              <p style="color: var(--color-text-muted)">El próximo desafío es mayúsculo: el martes 17 de junio, en Filadelfia, Inglaterra. Una victoria allí encarrila los octavos.</p>
            </div>
          </article>
          <article class="tile tile--green b-c4">
            <span class="tile__kicker">Figura del partido</span>
            <h3 class="tile__title fig__name">{{ figura.nombre }}</h3>
            <div class="fig__rate">{{ figura.rating }}</div>
            <p class="tile__caption fig__txt">{{ figura.texto }}</p>
          </article>
        </BentoGrid>
      </section>

      <!-- TIMELINE -->
      <section id="timeline" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Cronología</span>
            <h2 class="pro-sec-head__title">Minuto a minuto</h2>
          </div>
        </div>
        <div class="match-tl">
          <div class="match-tl__bar">
            <div
              v-for="(e, i) in eventosBar"
              :key="i"
              :class="[
                'match-tl__ev',
                e.tipo === 'gol-visita' ? 'match-tl__ev--uz' : '',
                e.tipo === 'tarjeta'    ? 'match-tl__ev--card' : '',
              ]"
              :style="{ left: e.left + '%' }"
            >
              <span class="match-tl__ev__min">{{ e.minuto }}'</span>
            </div>
          </div>
          <div class="match-tl__list">
            <div
              v-for="(e, i) in eventos"
              :key="i"
              :class="[
                'match-tl__row',
                e.tipo === 'gol-visita' ? 'match-tl__row--uz' : '',
                e.tipo === 'tarjeta'    ? 'match-tl__row--card' : '',
              ]"
            >
              <div class="match-tl__row__m">{{ e.minuto }}'</div>
              <div class="match-tl__row__t">
                <span v-html="e.titulo" />
                <small>{{ e.sub }}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STATS COMPARE -->
      <section id="stats" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Estadísticas</span>
            <h2 class="pro-sec-head__title">Quién mandó el partido</h2>
          </div>
        </div>
        <div class="cmp">
          <div v-for="(s, i) in statCmp" :key="i" class="cmp__row">
            <div :class="['cmp__l', s.winnerL ? 'win' : '']">{{ s.l }}</div>
            <div class="cmp__bar">
              <div class="cmp__bar__l" :style="{ width: s.pl + '%' }" />
              <div class="cmp__bar__r" :style="{ width: s.pr + '%' }" />
            </div>
            <div :class="['cmp__r', s.winnerR ? 'win' : '']">{{ s.r }}</div>
            <div class="cmp__label">{{ s.label }}</div>
          </div>
        </div>
      </section>

      <!-- RATINGS -->
      <section id="ratings" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Notas Golgana</span>
            <h2 class="pro-sec-head__title">Calificaciones del XI titular</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="18" /> {{ partido.local.nombre }} · {{ partido.alineaciones?.local.formacion }}</span>
            <div class="rate-list">
              <div v-for="(r, i) in rateLocal" :key="i" class="rate-row">
                <span class="rate-row__n">{{ r.num }}</span>
                <span class="rate-row__name">{{ r.name }}</span>
                <span class="rate-row__pos">{{ r.pos }}</span>
                <span :class="['rate-row__rate', rateClass(r.rate, r.mvp)]">{{ r.rate.toFixed(1) }}</span>
              </div>
            </div>
          </article>
          <article class="tile b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="18" /> {{ partido.visitante.nombre }} · {{ partido.alineaciones?.visitante.formacion }}</span>
            <div class="rate-list">
              <div v-for="(r, i) in rateVisita" :key="i" class="rate-row">
                <span class="rate-row__n">{{ r.num }}</span>
                <span class="rate-row__name">{{ r.name }}</span>
                <span class="rate-row__pos">{{ r.pos }}</span>
                <span :class="['rate-row__rate', rateClass(r.rate, r.mvp)]">{{ r.rate.toFixed(1) }}</span>
              </div>
            </div>
          </article>
        </BentoGrid>
      </section>

      <!-- REPERCUSIÓN -->
      <section id="repercusion" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Repercusión</span>
            <h2 class="pro-sec-head__title">Después del pitazo</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile tile--dark b-c8">
            <span class="tile__kicker">Lo que dijo el DT</span>
            <h3 class="tile__title rep__cita">{{ repercusion.cita }}</h3>
            <p class="tile__caption rep__cita-autor">{{ repercusion.citaAutor }}</p>
          </article>

          <article class="tile tile--green b-c4">
            <span class="tile__kicker">Cómo queda el grupo</span>
            <div class="rep-table">
              <div v-for="(row, i) in repercusion.tablaGrupo" :key="i" class="rep-table__row">
                <span style="display:inline-flex;align-items:center;gap:6px">
                  <strong>{{ row.pos }}.</strong>
                  <TeamFlag :flag-code="flagCode(row.slug)" :name="row.nombre" :size="16" />
                  {{ row.nombre }}
                </span>
                <strong class="rep-table__pts">{{ row.pts }}</strong>
              </div>
            </div>
          </article>

          <article class="tile b-c4">
            <span class="tile__kicker">Próximo · {{ repercusion.proximo.jornada }}</span>
            <h3 class="tile__title rep-next__date">{{ repercusion.proximo.fecha }}</h3>
            <div class="rep-next">
              <div class="rep-next__r">
                <TeamFlag :flag-code="flagCode(repercusion.proximo.local.slug)" :name="repercusion.proximo.local.name" :size="28" />
                <strong>{{ repercusion.proximo.local.name }}</strong>
              </div>
              <div class="rep-next__vs">VS</div>
              <div class="rep-next__l">
                <TeamFlag :flag-code="flagCode(repercusion.proximo.visita.slug)" :name="repercusion.proximo.visita.name" :size="28" />
                <strong>{{ repercusion.proximo.visita.name }}</strong>
              </div>
            </div>
            <p class="tile__caption rep-next__sede">{{ repercusion.proximo.sede }}</p>
          </article>

          <article class="tile b-c4">
            <span class="tile__kicker">Audiencia</span>
            <div class="tile__big-num accent">{{ repercusion.audienciaTV.num }}</div>
            <p class="tile__caption">{{ repercusion.audienciaTV.cap }}</p>
          </article>
          <article class="tile b-c4">
            <span class="tile__kicker">Redes</span>
            <div class="tile__big-num">{{ repercusion.redes.num }}</div>
            <p class="tile__caption">{{ repercusion.redes.cap }}</p>
          </article>
        </BentoGrid>
      </section>
    </template>

    <!-- ============ SCHEDULED BRANCH ============ -->
    <template v-else>
      <!-- PREVIA -->
      <section id="previa" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Previa</span>
            <h2 class="pro-sec-head__title">Lo que está en juego</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile b-c8">
            <span class="tile__kicker">Análisis</span>
            <h3 class="tile__title">Tres puntos para encarrilar el grupo</h3>
            <div v-if="partido.previa" class="prev-text" v-html="partido.previa.texto" />
          </article>
          <article class="tile tile--green b-c4">
            <span class="tile__kicker">A seguir</span>
            <h3 class="tile__title prev-watch__title">{{ aSeguir.vs }}</h3>
            <p class="tile__caption prev-watch__txt">{{ aSeguir.texto }}</p>
          </article>
        </BentoGrid>
      </section>

      <!-- ALINEACIONES -->
      <section id="xis" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Alineaciones {{ partido.alineaciones?.local.oficial ? 'oficiales' : 'probables' }}</span>
            <h2 class="pro-sec-head__title">Los XI</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile tile--green b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="18" /> {{ partido.local.nombre }} · {{ partido.alineaciones?.local.formacion }}</span>
            <div class="xi-pitch xi-pitch--green">
              <div v-for="(row, i) in xiLocal" :key="`l${i}`" class="xi-pitch__row" :class="row.length === 1 ? 'xi-pitch__row--solo' : ''">
                <span v-for="p in row" :key="p.num + p.name" :class="['xi-pl', p.cap ? 'xi-pl--cap' : '']">{{ p.num }} {{ p.name }}{{ p.cap ? ' (C)' : '' }}</span>
              </div>
            </div>
          </article>
          <article class="tile tile--dark b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="18" /> {{ partido.visitante.nombre }} · {{ partido.alineaciones?.visitante.formacion }}</span>
            <div class="xi-pitch xi-pitch--dark">
              <div v-for="(row, i) in xiVisita" :key="`v${i}`" class="xi-pitch__row" :class="row.length === 1 ? 'xi-pitch__row--solo' : ''">
                <span v-for="p in row" :key="p.num + p.name" class="xi-pl">{{ p.num }} {{ p.name }}{{ p.cap ? ' (C)' : '' }}</span>
              </div>
            </div>
          </article>
        </BentoGrid>
      </section>

      <!-- PRONÓSTICO -->
      <section id="prono" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Modelo Golgana · 10.000 simulaciones</span>
            <h2 class="pro-sec-head__title">Pronóstico</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile b-c4">
            <span class="tile__kicker">Gana {{ partido.local.nombre }}</span>
            <div class="tile__big-num accent">{{ pronostico.ganaLocal }}%</div>
            <p class="tile__caption">Cuota mercado: {{ pronostico.cuotas.local.toFixed(2) }}</p>
          </article>
          <article class="tile tile--dark b-c4">
            <span class="tile__kicker">Empate</span>
            <div class="tile__big-num">{{ pronostico.empate }}%</div>
            <p class="tile__caption">Cuota mercado: {{ pronostico.cuotas.empate.toFixed(2) }}</p>
          </article>
          <article class="tile b-c4">
            <span class="tile__kicker">Gana {{ partido.visitante.nombre }}</span>
            <div class="tile__big-num">{{ pronostico.ganaVisita }}%</div>
            <p class="tile__caption">Cuota mercado: {{ pronostico.cuotas.visita.toFixed(2) }}</p>
          </article>

          <article class="tile b-c8">
            <span class="tile__kicker">Marcador más probable</span>
            <div class="bars prono__bars">
              <div v-for="(r, i) in pronostico.marcadores" :key="i" class="bar">
                <span class="bar__label">{{ r.label }}</span>
                <div class="bar__track"><div class="bar__fill" :style="{ width: r.val + '%' }" /></div>
                <span class="bar__val">{{ r.val }}%</span>
              </div>
            </div>
          </article>
          <article class="tile tile--green b-c4">
            <span class="tile__kicker">xG esperado</span>
            <div class="prono__xg">
              <span>{{ pronostico.xg.local }}</span>
              <span class="prono__xg-dot">·</span>
              <span>{{ pronostico.xg.visita }}</span>
            </div>
            <p class="tile__caption prono__xg-cap">Goles totales esperados: {{ pronostico.xg.total }} · BTTS {{ pronostico.xg.btts }}%</p>
          </article>
        </BentoGrid>
      </section>

      <!-- FORMA -->
      <section id="forma" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Últimos 5 partidos</span>
            <h2 class="pro-sec-head__title">Cómo vienen los equipos</h2>
          </div>
        </div>
        <BentoGrid>
          <article class="tile b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="18" /> {{ partido.local.nombre }} · {{ formaLocal.resumen }}</span>
            <div class="forma-bars">
              <span v-for="(r, i) in formaLocal.resultados" :key="i" class="forma-bar" :style="{ background: formaColor[r] }" />
            </div>
            <table class="ptable forma-table">
              <thead><tr><th>Fecha</th><th>Rival</th><th>Comp.</th><th class="num">Res</th></tr></thead>
              <tbody>
                <tr v-for="(p, i) in formaLocal.partidos" :key="i">
                  <td>{{ p.fecha }}</td><td>{{ p.rival }}</td><td>{{ p.comp }}</td>
                  <td class="num"><strong :style="{ color: formaResColor[p.tag] }">{{ p.res }}</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="forma-totals">
              <span>GF: <strong>{{ formaLocal.totales.gf }}</strong></span>
              <span>GC: <strong>{{ formaLocal.totales.gc }}</strong></span>
              <span>Pts: <strong class="forma-totals__pts">{{ formaLocal.totales.pts }}</strong></span>
            </div>
          </article>
          <article class="tile b-c6">
            <span class="tile__kicker"><TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="18" /> {{ partido.visitante.nombre }} · {{ formaVisita.resumen }}</span>
            <div class="forma-bars">
              <span v-for="(r, i) in formaVisita.resultados" :key="i" class="forma-bar" :style="{ background: formaColor[r] }" />
            </div>
            <table class="ptable forma-table">
              <thead><tr><th>Fecha</th><th>Rival</th><th>Comp.</th><th class="num">Res</th></tr></thead>
              <tbody>
                <tr v-for="(p, i) in formaVisita.partidos" :key="i">
                  <td>{{ p.fecha }}</td><td>{{ p.rival }}</td><td>{{ p.comp }}</td>
                  <td class="num"><strong :style="{ color: formaResColor[p.tag] }">{{ p.res }}</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="forma-totals">
              <span>GF: <strong>{{ formaVisita.totales.gf }}</strong></span>
              <span>GC: <strong>{{ formaVisita.totales.gc }}</strong></span>
              <span>Pts: <strong>{{ formaVisita.totales.pts }}</strong></span>
            </div>
          </article>
        </BentoGrid>
      </section>

      <!-- HISTORIAL -->
      <section id="h2h" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Historial · {{ h2hData.totalEnfrentamientos }} enfrentamientos</span>
            <h2 class="pro-sec-head__title">Cara a cara</h2>
          </div>
        </div>
        <div class="h2h-card">
          <div class="h2h-top">
            <div class="h2h-side h2h-side--ec">
              <div class="h2h-side__num">{{ h2hData.victoriasLocal }}</div>
              <div class="h2h-side__l" style="display:inline-flex;align-items:center;gap:6px;justify-content:center">
                Victorias <TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="16" />
              </div>
            </div>
            <div class="h2h-mid">
              <div class="h2h-mid__num">{{ h2hData.empates }}</div>
              <div class="h2h-mid__l">Empates</div>
            </div>
            <div class="h2h-side h2h-side--uz">
              <div class="h2h-side__num">{{ h2hData.victoriasVisitante }}</div>
              <div class="h2h-side__l" style="display:inline-flex;align-items:center;gap:6px;justify-content:center">
                Victorias <TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="16" />
              </div>
            </div>
          </div>
          <div class="h2h-bar" aria-label="Distribución de resultados históricos">
            <div v-if="h2hPctLocal" class="h2h-bar__seg h2h-bar__seg--ec" :style="{ width: h2hPctLocal + '%' }">{{ h2hPctLocal }}%</div>
            <div v-if="h2hPctEmp"   class="h2h-bar__seg h2h-bar__seg--d"  :style="{ width: h2hPctEmp + '%' }">{{ h2hPctEmp }}%</div>
            <div v-if="h2hPctVis"   class="h2h-bar__seg h2h-bar__seg--uz" :style="{ width: h2hPctVis + '%' }">{{ h2hPctVis }}%</div>
          </div>
          <table class="h2h-table">
            <thead><tr><th>Fecha</th><th>Torneo</th><th>Sede</th><th class="num">Resultado</th></tr></thead>
            <tbody>
              <tr v-for="(r, i) in h2hData.ultimosResultados" :key="i">
                <td>{{ r.fecha }}</td>
                <td>{{ r.torneo }}</td>
                <td>{{ r.sede }}</td>
                <td class="num">
                  <span :class="['winner-dot', r.ganador === 'L' ? 'winner-dot--ec' : 'winner-dot--d']" />
                  <span :class="['res', r.ganador === 'L' ? 'res--ec' : 'res--d']">{{ r.marcador }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- AUDIENCIA -->
      <section id="voz" class="pro-section pro-container">
        <div class="pro-sec-head">
          <div class="pro-sec-head__l">
            <span class="pro-sec-head__kicker">Voz de la afición · {{ audiencia.total.toLocaleString('es-EC') }} votos</span>
            <h2 class="pro-sec-head__title">¿Qué piensa la gente?</h2>
          </div>
        </div>
        <div class="pick">
          <div class="pick__inner">
            <div class="pick__h">
              <div class="pick__t">El pick más popular: <span class="pick__hl">Gana {{ partido.local.nombre }}</span></div>
              <div class="pick__sub">Encuesta abierta · cierra al pitazo inicial</div>
            </div>
            <div class="pick__row">
              <div class="pick__l"><strong><TeamFlag :flag-code="flagCode(partido.local.slug)" :name="partido.local.nombre" :size="18" /> {{ partido.local.nombre }}</strong></div>
              <div class="pick__bar"><div class="pick__bar__fill" :style="{ width: audiencia.local + '%' }" /></div>
              <div class="pick__v">{{ audiencia.local }}%</div>
            </div>
            <div class="pick__row">
              <div class="pick__l"><strong>Empate</strong></div>
              <div class="pick__bar"><div class="pick__bar__fill pick__bar__fill--d" :style="{ width: audiencia.empate + '%' }" /></div>
              <div class="pick__v">{{ audiencia.empate }}%</div>
            </div>
            <div class="pick__row">
              <div class="pick__l"><strong><TeamFlag :flag-code="flagCode(partido.visitante.slug)" :name="partido.visitante.nombre" :size="18" /> {{ partido.visitante.nombre }}</strong></div>
              <div class="pick__bar"><div class="pick__bar__fill pick__bar__fill--uz" :style="{ width: audiencia.visita + '%' }" /></div>
              <div class="pick__v">{{ audiencia.visita }}%</div>
            </div>
          </div>
        </div>
        <div class="pcta">
          <div>
            <div class="pcta__t">¿Cuál es tu pronóstico?</div>
            <div class="pcta__s">Suma tu voz a los {{ audiencia.total.toLocaleString('es-EC') }} hinchas que ya votaron</div>
          </div>
          <a href="#" class="pcta__b">Hacer mi pick</a>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
/* Match Hero */
.mh { position: relative; color: #fff; background: #000; overflow: hidden; }
.mh::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background:
    radial-gradient(60% 80% at 22% 50%, rgba(2, 204, 116, 0.5), transparent 60%),
    radial-gradient(60% 80% at 78% 50%, rgba(30, 181, 58, 0.35), transparent 60%);
}
.mh--ft::before {
  background:
    radial-gradient(60% 80% at 22% 50%, rgba(2, 204, 116, 0.55), transparent 60%),
    radial-gradient(60% 80% at 78% 50%, rgba(107, 114, 128, 0.25), transparent 60%);
}
.mh__inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: 48px 24px 56px; }
.mh__top {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
  gap: 12px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7); margin-bottom: 32px;
}
.mh__pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px; color: #fff;
}
.mh__pill::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%;
  background: #02cc74; box-shadow: 0 0 0 4px rgba(2, 204, 116, 0.3);
}
.mh__pill--ft::before {
  content: "FT"; width: auto; height: auto; background: none; box-shadow: none;
  font-family: var(--font-display); font-size: 11px; color: #fde047;
}

.mh__match { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; }
.mh__team { display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center; }
.mh__team--l { align-items: flex-end; text-align: right; }
.mh__team--r { align-items: flex-start; text-align: left; }
.mh__flag {
  width: clamp(80px, 12vw, 140px); height: clamp(80px, 12vw, 140px);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  background-size: cover; background-position: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.08);
}
.mh__flag--ecuador {
  background: linear-gradient(180deg, #fde047 0% 50%, #1d4ed8 50% 75%, #dc2626 75% 100%);
}
.mh__flag--uzbekistan {
  background: linear-gradient(180deg,
    #1eb53a 0% 33%,
    #fff 33% 38%,
    #0099b5 38% 65%,
    #fff 65% 70%,
    #ce1126 70% 100%);
}
.mh__flag--inglaterra {
  background: linear-gradient(#fff 0% 100%);
  background-color: #fff;
}
.mh__flag--costa-de-marfil {
  background: linear-gradient(90deg, #ff8200 33%, #fff 33% 66%, #009e60 66%);
}
.mh__name { font-family: var(--font-display); font-size: clamp(36px, 5.5vw, 80px); line-height: 0.9; letter-spacing: 0.01em; }
.mh__role { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255, 255, 255, 0.65); }
.mh__center { display: flex; flex-direction: column; align-items: center; gap: 14px; min-width: 200px; }
.mh--ft .mh__center { gap: 10px; min-width: 240px; }
.mh__time { font-family: var(--font-display); font-size: clamp(56px, 8vw, 120px); line-height: 1; color: var(--color-primary-green); }
.mh__date { font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255, 255, 255, 0.85); text-align: center; }
.mh__venue { font-size: 12px; color: rgba(255, 255, 255, 0.6); text-align: center; max-width: 260px; }

/* Score finalizado */
.mh__score {
  font-family: var(--font-display);
  font-size: clamp(80px, 12vw, 160px);
  line-height: 1;
  display: flex; gap: 24px; align-items: baseline;
}
.mh__score .winner { color: var(--color-primary-green); }
.mh__score .loser  { color: rgba(255, 255, 255, 0.55); }
.mh__score .sep    { color: rgba(255, 255, 255, 0.3); font-size: 0.6em; }

/* Countdown */
.cdown { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 32px auto 0; max-width: 520px; }
.cdown__c {
  padding: 14px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px; text-align: center;
}
.cdown__n { font-family: var(--font-display); font-size: 36px; line-height: 1; color: #fff; }
.cdown__l { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255, 255, 255, 0.65); margin-top: 4px; }

/* Scorers strip */
.scorers {
  display: grid; grid-template-columns: 1fr 1fr;
  background: #0a0a0a; color: #fff;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.scorers__c { padding: 22px 28px; }
.scorers__c + .scorers__c { border-left: 1px solid rgba(255, 255, 255, 0.08); }
.scorers__l { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255, 255, 255, 0.55); margin-bottom: 10px; }
.scorers__list { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
.scorers__list span {
  font-family: var(--font-display); font-size: 18px;
  color: var(--color-primary-green);
  min-width: 40px; display: inline-block;
}
.scorers__list--v span { color: #9ca3af; }
.scorers__empty { color: rgba(255, 255, 255, 0.4); font-style: italic; }

/* Match info strip */
.minfo {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  background: #f5f4f0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.minfo__c { padding: 24px 20px; border-right: 1px solid rgba(0, 0, 0, 0.06); }
.minfo__c:last-child { border-right: 0; }
.minfo__l { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 6px; }
.minfo__v { font-family: var(--font-display); font-size: 22px; line-height: 1.1; color: var(--color-primary-black); }
.minfo__s { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

/* Previa / cronica text */
.prev-text { color: var(--color-text-muted); margin-top: 8px; line-height: 1.7; max-width: 75ch; }
.prev-text :deep(p) { margin: 0 0 12px; }
.prev-text :deep(p:last-child) { margin-bottom: 0; }
.prev-watch__title { color: #fff; }
.prev-watch__txt { color: rgba(255, 255, 255, 0.85); line-height: 1.6; margin-top: 8px; }

/* Figura del partido (finalizado) */
.fig__name { color: #fff; margin-top: 8px; }
.fig__rate { font-family: var(--font-display); font-size: 64px; color: #fff; line-height: 1; margin: 14px 0 4px; }
.fig__txt { color: rgba(255, 255, 255, 0.85); line-height: 1.6; }

/* XI canchas */
.xi-pitch {
  position: relative; border-radius: 12px;
  aspect-ratio: 1.3 / 1; margin-top: 12px; padding: 16px;
  color: #fff; font-family: var(--font-display); font-size: 13px;
  display: grid; gap: 8px;
}
.xi-pitch--green { background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.12)); }
.xi-pitch--dark  { background: rgba(255, 255, 255, 0.05); gap: 6px; }
.xi-pitch__row { display: flex; justify-content: space-around; align-items: center; text-align: center; gap: 8px; }
.xi-pitch__row--solo { justify-content: center; }
.xi-pl { white-space: nowrap; }
.xi-pl--cap { background: #fff; color: var(--color-primary-green); padding: 4px 10px; border-radius: 6px; }

/* Pronóstico / Forma / H2H / Pick (scheduled) */
.tile__big-num.accent { color: var(--color-primary-green); }
.prono__bars { margin-top: 12px; }
.prono__xg {
  display: flex; justify-content: space-between; color: #fff; margin-top: 12px;
  font-family: var(--font-display); font-size: 36px;
}
.prono__xg-dot { opacity: 0.6; }
.prono__xg-cap { color: rgba(255, 255, 255, 0.8); font-size: 12px; margin-top: 8px; }

.forma-bars { display: flex; gap: 6px; margin: 14px 0 18px; }
.forma-bar { flex: 1; height: 6px; border-radius: 3px; }
.forma-table { margin-top: 8px; }
.forma-totals {
  display: flex; justify-content: space-between;
  margin-top: 14px; padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px; color: var(--color-text-muted);
}
.forma-totals strong { color: var(--color-primary-black); font-family: var(--font-display); font-size: 18px; }
.forma-totals__pts { color: var(--color-primary-green) !important; }

.h2h-card { background: #fff; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; padding: 28px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04); }
.h2h-top { display: grid; grid-template-columns: 1fr auto 1fr; gap: 24px; align-items: center; margin-bottom: 24px; }
.h2h-side { text-align: center; }
.h2h-side__num { font-family: var(--font-display); font-size: clamp(56px, 7vw, 96px); line-height: 0.9; }
.h2h-side--ec .h2h-side__num { color: var(--color-primary-green); }
.h2h-side--uz .h2h-side__num { color: var(--color-text-muted); }
.h2h-side__l { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-muted); margin-top: 6px; }
.h2h-mid { text-align: center; }
.h2h-mid__num { font-family: var(--font-display); font-size: 48px; line-height: 0.9; color: #9ca3af; }
.h2h-mid__l { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-muted); margin-top: 4px; }

.h2h-bar { display: flex; height: 14px; border-radius: 999px; overflow: hidden; background: #f3f4f6; margin-bottom: 18px; }
.h2h-bar__seg { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #fff; letter-spacing: 0.06em; }
.h2h-bar__seg--ec { background: var(--color-primary-green); }
.h2h-bar__seg--d  { background: #9ca3af; }
.h2h-bar__seg--uz { background: #6b7280; }

.h2h-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
.h2h-table th { text-align: left; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-text-muted); padding: 12px 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.08); font-weight: 600; }
.h2h-table th.num, .h2h-table td.num { text-align: right; }
.h2h-table td { padding: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); font-size: 14px; }
.h2h-table tr:last-child td { border-bottom: 0; }
.h2h-table .res { font-family: var(--font-display); font-size: 18px; }
.h2h-table .res--ec { color: var(--color-primary-green); }
.h2h-table .res--d  { color: var(--color-text-muted); }
.h2h-table .winner-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
.h2h-table .winner-dot--ec { background: var(--color-primary-green); }
.h2h-table .winner-dot--d  { background: #9ca3af; }

.pick { background: #0a0a0a; color: #fff; border-radius: 16px; padding: 32px; position: relative; overflow: hidden; }
.pick::before { content: ""; position: absolute; inset: 0; background: radial-gradient(50% 60% at 50% 0%, rgba(2, 204, 116, 0.18), transparent 70%); z-index: 0; }
.pick__inner { position: relative; z-index: 1; }
.pick__h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.pick__t { font-family: var(--font-display); font-size: 32px; }
.pick__hl { color: var(--color-primary-green); }
.pick__sub { font-size: 12px; color: rgba(255, 255, 255, 0.6); letter-spacing: 0.06em; }
.pick__row { display: grid; grid-template-columns: 120px 1fr 60px; gap: 16px; align-items: center; margin-bottom: 14px; }
.pick__row:last-of-type { margin-bottom: 0; }
.pick__l { font-size: 13px; color: rgba(255, 255, 255, 0.85); }
.pick__bar { position: relative; height: 32px; background: rgba(255, 255, 255, 0.06); border-radius: 6px; overflow: hidden; }
.pick__bar__fill { position: absolute; inset: 0; border-radius: 6px; background: linear-gradient(90deg, var(--color-primary-green), #1eb53a); }
.pick__bar__fill--d  { background: linear-gradient(90deg, #6b7280, #9ca3af); }
.pick__bar__fill--uz { background: linear-gradient(90deg, #1e3a8a, #1e40af); }
.pick__v { font-family: var(--font-display); font-size: 22px; text-align: right; color: #fff; }

.pcta { background: var(--color-primary-green); color: #fff; border-radius: 16px; padding: 36px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; margin-top: 16px; }
.pcta__t { font-family: var(--font-display); font-size: 32px; line-height: 1.05; }
.pcta__s { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin-top: 4px; }
.pcta__b { padding: 14px 28px; background: #fff; color: var(--color-primary-green); font-weight: 600; border-radius: 10px; text-decoration: none; font-size: 14px; letter-spacing: 0.04em; text-transform: uppercase; }

/* ============ FINISHED-ONLY ============ */
/* Stat compare */
.cmp { background: #fff; border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; padding: 28px; }
.cmp__row {
  display: grid; grid-template-columns: 80px 1fr 80px;
  gap: 14px; align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.cmp__row:last-child { border-bottom: 0; }
.cmp__l, .cmp__r { font-family: var(--font-display); font-size: 24px; }
.cmp__l { text-align: right; }
.cmp__r { text-align: left; }
.cmp__l.win, .cmp__r.win { color: var(--color-primary-green); }
.cmp__bar { display: flex; height: 10px; background: #f3f4f6; border-radius: 999px; overflow: hidden; }
.cmp__bar__l { background: var(--color-primary-green); }
.cmp__bar__r { background: #9ca3af; margin-left: auto; }
.cmp__label {
  text-align: center; font-size: 10px; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--color-text-muted);
  grid-column: 1 / -1; margin-bottom: -4px; padding-top: 6px;
}

/* Match timeline (finalizado) — distinto al .tl global de trayectoria */
.match-tl {
  background: #fff; border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px; padding: 24px 28px;
}
.match-tl__bar {
  position: relative; height: 4px; background: #e5e7eb;
  border-radius: 999px; margin: 24px 16px 32px;
}
.match-tl__ev {
  position: absolute; top: -22px; transform: translateX(-50%);
  font-family: var(--font-display); font-size: 14px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.match-tl__ev::after {
  content: ""; width: 14px; height: 14px; border-radius: 50%;
  background: var(--color-primary-green); border: 3px solid #fff;
  box-shadow: 0 0 0 2px var(--color-primary-green);
  margin-top: 6px;
}
.match-tl__ev--uz::after { background: #6b7280; box-shadow: 0 0 0 2px #6b7280; }
.match-tl__ev--card::after { background: #fde047; box-shadow: 0 0 0 2px #ca8a04; }
.match-tl__ev__min { font-size: 11px; color: var(--color-text-muted); letter-spacing: 0.06em; }

.match-tl__list {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px; margin-top: 20px;
}
.match-tl__row {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid var(--color-primary-green);
}
.match-tl__row--uz   { border-left-color: #6b7280; }
.match-tl__row--card { border-left-color: #ca8a04; }
.match-tl__row__m { font-family: var(--font-display); font-size: 18px; color: var(--color-primary-black); min-width: 32px; }
.match-tl__row__t { font-size: 13px; line-height: 1.4; }
.match-tl__row__t small { color: var(--color-text-muted); display: block; margin-top: 2px; }

/* Ratings */
.rate-list { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.rate-row {
  display: grid; grid-template-columns: auto 1fr auto auto;
  gap: 14px; align-items: center;
  padding: 10px 14px;
  background: #fafafa; border-radius: 8px;
}
.rate-row__n { font-family: var(--font-display); font-size: 14px; color: var(--color-text-muted); min-width: 24px; }
.rate-row__name { font-size: 14px; font-weight: 500; }
.rate-row__pos { font-size: 10px; letter-spacing: 0.12em; color: var(--color-text-muted); text-transform: uppercase; }
.rate-row__rate {
  font-family: var(--font-display); font-size: 22px;
  padding: 4px 12px; border-radius: 6px;
  color: #fff; min-width: 48px; text-align: center;
}
.rate-row__rate--high { background: var(--color-primary-green); }
.rate-row__rate--mid  { background: #3b82f6; }
.rate-row__rate--low  { background: #9ca3af; }
.rate-row__rate--mvp  { background: linear-gradient(135deg, #fde047, #f59e0b); color: #7c2d12; }

/* Repercusión */
.rep__cita { color: #fff; margin-top: 6px; }
.rep__cita-autor { color: rgba(255, 255, 255, 0.7); margin-top: 14px; }

.rep-table { margin-top: 12px; color: #fff; font-size: 13px; }
.rep-table__row {
  display: flex; justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}
.rep-table__row:last-child { border-bottom: 0; }
.rep-table__pts { font-family: var(--font-display); font-size: 18px; }

.rep-next__date { margin-top: 6px; }
.rep-next {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 12px; margin-top: 14px;
}
.rep-next__r { text-align: right; }
.rep-next__l { text-align: left; }
.rep-next__flag { font-size: 24px; }
.rep-next__vs { font-family: var(--font-display); font-size: 20px; color: var(--color-text-muted); }
.rep-next__sede { margin-top: 12px; text-align: center; }

@media (max-width: 680px) {
  .mh__match { grid-template-columns: 1fr; gap: 32px; }
  .mh__team--l, .mh__team--r { align-items: center; text-align: center; }
  .scorers { grid-template-columns: 1fr; }
  .scorers__c + .scorers__c { border-left: 0; border-top: 1px solid rgba(255, 255, 255, 0.08); }
  .cmp__row { grid-template-columns: 60px 1fr 60px; gap: 8px; }
  .cmp__l, .cmp__r { font-size: 18px; }
  .h2h-top { grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .pick__row { grid-template-columns: 90px 1fr 50px; gap: 10px; }
  .pcta { grid-template-columns: 1fr; }
}
</style>
