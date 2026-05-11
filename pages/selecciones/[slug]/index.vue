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

// Secciones del equipo (todas opcionales en el JSON)
const resumen = computed(() => equipo.value?.resumen ?? null);
const estilo = computed(() => equipo.value?.estilo ?? null);
const plantillaDestacada = computed(() => equipo.value?.plantillaDestacada ?? []);
const editorial = computed(() => equipo.value?.editorial ?? null);
const historia = computed(() => equipo.value?.historia ?? []);

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
        ...(resumen && (resumen.metricas?.length || resumen.racha || resumen.piezaClave) ? [{ label: 'Resumen', href: '#resumen' }] : []),
        ...(fixture.length > 0 ? [{ label: 'Fixture', href: '#fixture' }] : []),
        ...(estilo ? [{ label: 'Estilo', href: '#estilo' }] : []),
        ...(plantillaDestacada.length > 0 ? [{ label: 'Plantilla', href: '#plantilla' }] : []),
        ...(editorial ? [{ label: 'Noticias', href: '#noticias' }] : []),
        ...(historia.length > 0 ? [{ label: 'Historia', href: '#historia' }] : []),
      ]"
    />

    <!-- RESUMEN -->
    <section
      v-if="resumen && (resumen.metricas?.length || resumen.racha || resumen.piezaClave)"
      id="resumen"
      class="pro-section pro-container"
    >
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cómo llega</span>
          <h2 class="pro-sec-head__title">{{ equipo.apodo ?? equipo.nombre }} 2026 en cifras</h2>
        </div>
      </div>

      <BentoGrid>
        <article
          v-for="(m, i) in (resumen.metricas ?? [])"
          :key="`m${i}`"
          class="tile b-c4"
          :class="m.tono === 'green' ? 'tile--green' : m.tono === 'dark' ? 'tile--dark' : ''"
        >
          <span class="tile__kicker">{{ m.kicker }}</span>
          <div class="tile__big-num" :class="i === 1 ? 'accent' : ''">{{ m.valor }}</div>
          <p class="tile__caption">{{ m.caption }}</p>
        </article>

        <article v-if="resumen.racha?.forma?.length" class="tile b-c8">
          <span class="tile__kicker">Forma últimos amistosos</span>
          <h3 class="tile__title">{{ resumen.racha.titulo }}</h3>
          <span class="streak">
            <span
              v-for="(r, i) in resumen.racha.forma"
              :key="i"
              :class="['streak__b', r === 'G' ? 'streak__b--w' : r === 'E' ? 'streak__b--d' : 'streak__b--l']"
            >{{ r }}</span>
          </span>
          <p v-if="resumen.racha.caption" class="tile__caption mt-sm">{{ resumen.racha.caption }}</p>
        </article>

        <article v-if="resumen.piezaClave" class="tile tile--dark b-c4 pieza-clave">
          <span class="tile__kicker">Pieza clave</span>
          <div class="pc__row">
            <div class="pc__num">{{ resumen.piezaClave.dorsal }}</div>
            <div>
              <h3 class="tile__title pc__name">{{ resumen.piezaClave.nombre }}</h3>
              <p class="pc__role">{{ resumen.piezaClave.rol }}</p>
            </div>
          </div>
          <NuxtLink
            v-if="resumen.piezaClave.jugadorSlug"
            :to="`/jugadores/${resumen.piezaClave.jugadorSlug}/`"
            class="btn btn--primary pc__cta"
          >Ver perfil →</NuxtLink>
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
    <section v-if="estilo" id="estilo" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Sistema de {{ equipo.dt.nombre.split(' ').slice(-1)[0] }}</span>
          <h2 class="pro-sec-head__title">Cómo juega {{ equipo.nombre }}</h2>
        </div>
      </div>

      <BentoGrid>
        <article class="tile b-c7 estilo__txt">
          <div v-if="estilo.chips?.length" class="chip-row">
            <span
              v-for="(c, i) in estilo.chips"
              :key="i"
              class="pchip"
              :class="c.tono === 'green' ? 'pchip--green' : c.tono === 'out' ? 'pchip--out' : c.tono === 'dark' ? 'pchip--dark' : ''"
            >{{ c.label }}</span>
          </div>
          <p v-if="estilo.lead" class="estilo__lead">{{ estilo.lead }}</p>
          <div v-if="estilo.stats?.length" class="bars">
            <div v-for="(s, i) in estilo.stats" :key="i" class="bar">
              <span class="bar__label">{{ s.label }}</span>
              <div class="bar__track"><div class="bar__fill" :style="{ width: s.width + '%' }" /></div>
              <span class="bar__val">{{ s.valor }}</span>
            </div>
          </div>
        </article>

        <article v-if="estilo.xi?.filas?.length" class="tile tile--dark b-c5 estilo__pitch">
          <div class="estilo__pitch-head">
            <span class="tile__kicker">XI titular probable</span>
            <span class="estilo__formation">{{ estilo.formacion }}</span>
          </div>
          <div class="pitch">
            <span class="pitch__mid" />
            <span class="pitch__circle" />
            <div class="pitch__rows">
              <div
                v-for="(row, i) in estilo.xi.filas"
                :key="i"
                class="pitch__row"
                :style="estilo.xi.padding?.[i] ? `padding:0 ${estilo.xi.padding[i]}` : ''"
              >
                <div
                  v-for="p in row"
                  :key="p.num"
                  :class="['pp', p.capitan ? 'pp--cap' : '']"
                >
                  <span class="pp__num">{{ p.num }}</span>
                  <span class="pp__name">{{ p.nombre }}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </BentoGrid>
    </section>

    <!-- PLANTILLA -->
    <section v-if="plantillaDestacada.length > 0" id="plantilla" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">{{ plantillaDestacada.length }} jugadores destacados</span>
          <h2 class="pro-sec-head__title">Plantilla</h2>
        </div>
        <NuxtLink
          :to="`/selecciones/${equipo.slug}/plantilla/`"
          class="pro-sec-head__cta"
        >Ver plantilla completa →</NuxtLink>
      </div>

      <BentoGrid>
        <component
          :is="p.jugadorSlug ? 'a' : 'div'"
          v-for="p in plantillaDestacada"
          :key="p.num"
          class="ptile b-c2"
          :href="p.jugadorSlug ? `/jugadores/${p.jugadorSlug}/` : null"
          :style="p.destacado ? 'outline:3px solid var(--color-primary-green)' : ''"
        >
          <img src="/img/player-placeholder.svg" alt="" />
          <span
            class="ptile__num"
            :style="p.destacado ? 'background:var(--color-primary-green);color:#fff' : ''"
          >{{ p.num }}</span>
          <div class="ptile__body">
            <span class="ptile__pos">{{ p.pos }}</span>
            <span class="ptile__name">{{ p.nombre }}</span>
          </div>
        </component>
      </BentoGrid>
    </section>

    <!-- EDITORIAL -->
    <section v-if="editorial" id="noticias" class="pro-section pro-container">
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
            <h3 class="ed-card__title">{{ editorial.lead.titulo }}</h3>
            <p class="tile__caption">{{ editorial.lead.cuerpo }}</p>
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
            <h3 class="ed-card__title">{{ n.titulo }}</h3>
            <span class="ed-card__meta">{{ n.meta }}</span>
          </div>
        </a>
      </BentoGrid>
    </section>

    <!-- HISTORIA -->
    <section v-if="historia.length > 0" id="historia" class="pro-section pro-container">
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
          :class="h.destacado ? 'tile--green' : ''"
        >
          <span class="tile__kicker">{{ h.kicker }}</span>
          <h3 class="tile__title">{{ h.titulo }}</h3>
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
