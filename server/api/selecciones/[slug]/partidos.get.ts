/**
 * GET /api/selecciones/<slug>/partidos
 *
 * Devuelve próximos, últimos y fixture (Mundial 2026) del equipo, derivados
 * de la lista global de partidos (DynamoDB vía AppSync · REST · JSON local).
 * El template `pages/selecciones/[slug]/index.vue` lo consume para el hero
 * y la sección Fixture; la página `pages/selecciones/[slug]/partidos.vue`
 * consume `proximos[]`/`ultimos[]` para el listado completo.
 *
 * Criterio:
 *  - Próximo: estado ∈ {scheduled, live, postponed} y fecha > now (ASC).
 *  - Último: estado === 'finished' y fecha ≤ now (DESC).
 *  - Fixture: los 3 (o más) partidos del equipo en la edición Mundial 2026,
 *    en orden cronológico ASC.
 */
import type { Partido } from '~/types/api';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';
import { createApiClient } from '~/server/utils/api-client';
import { loadDirContent } from '~/server/utils/content-loader';

interface PartidoBase {
  fecha: string;          // ISO con offset
  fechaCorta: string;     // "14 jun"
  hora: string;           // "18:00"
  rival: string;
  rivalSlug: string;
  competicion: string;    // "J1 Mundial" | "Amistoso" | etc.
  sede: string;           // "Lincoln Financial Field · Philadelphia"
  href: string;
  esLocal: boolean;
}
type ProximoPartido = PartidoBase & { estado: string };
type UltimoPartido  = PartidoBase & {
  resultado: string;
  marcadorLocal: number | null;
  marcadorVisitante: number | null;
};

interface PartidosContent {
  titulo: string;
  lead: string;
  proximos: ProximoPartido[];
  ultimos: UltimoPartido[];
  fixture: ProximoPartido[];
  seo: { title: string; description: string };
}

const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtFechaCorta(iso: string): string {
  // Parse desde la parte literal del ISO ("2026-06-16T...") para mantener
  // la fecha local del partido sin desplazamiento por TZ del servidor.
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso.slice(0, 10);
  const month = parseInt(m[2], 10) - 1;
  return `${parseInt(m[3], 10)} ${MES_CORTO[month] ?? m[2]}`;
}

function fmtHora(iso: string): string {
  // Extrae HH:MM del ISO con offset (ej. "2026-06-14T18:00:00-04:00" → "18:00").
  const m = iso.match(/T(\d{2}:\d{2})/);
  return m ? m[1] : '';
}

function competicionDe(p: Partido): string {
  if (p.fase?.tipo === 'grupos') {
    const m = p.fase.nombre?.match(/J\d+/);
    return m ? `${m[0]} Mundial` : 'Mundial 2026';
  }
  return p.fase?.nombre ?? 'Amistoso';
}

function hrefDe(p: Partido): string {
  if (p.grupo?.slug && p.edicion?.slug) {
    return `/torneos/mundial/${p.edicion.slug}/grupos/${p.grupo.slug}/${p.slug}/`;
  }
  return `/partidos/${p.slug}/`;
}

function sedeDe(p: Partido): string {
  if (!p.sede) return '';
  const ciudad = p.sede.slug
    ?.split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return ciudad ? `${p.sede.nombre} · ${ciudad}` : p.sede.nombre;
}

function toBase(p: Partido, equipoSlug: string): PartidoBase {
  const esLocal = p.local.slug === equipoSlug;
  const rival = esLocal ? p.visitante : p.local;
  return {
    fecha: p.fecha,
    fechaCorta: fmtFechaCorta(p.fecha),
    hora: fmtHora(p.fecha),
    rival: rival.nombre,
    rivalSlug: rival.slug,
    competicion: competicionDe(p),
    sede: sedeDe(p),
    href: hrefDe(p),
    esLocal,
  };
}

function toUltimo(p: Partido, equipoSlug: string): UltimoPartido {
  const base = toBase(p, equipoSlug);
  const m = p.marcador;
  const local = m?.local ?? null;
  const visitante = m?.visitante ?? null;
  let resultado = '—';
  if (local !== null && visitante !== null) {
    resultado = base.esLocal ? `${local}-${visitante}` : `${visitante}-${local}`;
  }
  return { ...base, resultado, marcadorLocal: local, marcadorVisitante: visitante };
}

async function loadAllPartidos(config: ReturnType<typeof useRuntimeConfig>): Promise<Partido[]> {
  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ partidos: { slug: string; data: Partido }[] }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q { partidos { slug data } }',
      {},
    );
    return (r.partidos ?? []).map((row) => row.data);
  }
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Partido[]>(`/partidos`);
  }
  return loadDirContent<Partido>('partidos');
}

export default defineEventHandler(async (event): Promise<PartidosContent> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();
  const all = await loadAllPartidos(config);

  const ofTeam = all
    .filter((p) => p.local?.slug === slug || p.visitante?.slug === slug)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const now = Date.now();
  const proximos: ProximoPartido[] = [];
  const ultimos: UltimoPartido[] = [];
  const fixture: ProximoPartido[] = [];

  for (const p of ofTeam) {
    const t = new Date(p.fecha).getTime();
    const isFinished = p.estado === 'finished';
    const isFuture = t > now;

    if (isFinished && !isFuture) {
      ultimos.push(toUltimo(p, slug));
    } else if (isFinished && isFuture) {
      // raro — finished con fecha futura. Tratar como último.
      ultimos.push(toUltimo(p, slug));
    } else {
      const base = toBase(p, slug);
      const item: ProximoPartido = { ...base, estado: p.estado ?? 'scheduled' };
      proximos.push(item);
    }

    // Fixture: incluye TODOS los partidos del Mundial 2026 (estado independiente).
    if (p.edicion?.slug === '2026') {
      const base = toBase(p, slug);
      fixture.push({ ...base, estado: p.estado ?? 'scheduled' });
    }
  }

  // ultimos en orden DESC (más reciente primero)
  ultimos.reverse();

  const totalMundial = fixture.length;
  const lead = totalMundial > 0
    ? `${totalMundial} partidos confirmados en la fase de grupos del Mundial 2026.`
    : `Calendario aún por confirmar.`;

  return {
    titulo: 'Calendario · Mundial 2026',
    lead,
    proximos,
    ultimos,
    fixture,
    seo: {
      title: `Partidos de ${slug} — Mundial 2026`,
      description: `Calendario, próximos rivales y resultados de ${slug} en el Mundial 2026.`,
    },
  };
});
