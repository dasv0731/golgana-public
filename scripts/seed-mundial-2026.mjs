#!/usr/bin/env node
/**
 * Genera content/torneos/mundial/2026/grupos/*.json (12) y
 * content/partidos/*.json (72) con el sorteo real del Mundial 2026.
 *
 * Re-ejecutable: sobreescribe los archivos. Mantiene la convención
 * existente del repo (nombres de campo, shape de refs).
 */
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GRUPOS_DIR = resolve(ROOT, 'content', 'torneos', 'mundial', '2026', 'grupos');
const PARTIDOS_DIR = resolve(ROOT, 'content', 'partidos');
mkdirSync(GRUPOS_DIR, { recursive: true });
mkdirSync(PARTIDOS_DIR, { recursive: true });

// Selecciones por grupo (sorteo real Mundial 2026)
const SEL = {
  mexico: 'México',
  sudafrica: 'Sudáfrica',
  'corea-del-sur': 'Corea del Sur',
  'republica-checa': 'Chequia',
  canada: 'Canadá',
  'bosnia-herzegovina': 'Bosnia y Herzegovina',
  catar: 'Catar',
  suiza: 'Suiza',
  brasil: 'Brasil',
  marruecos: 'Marruecos',
  haiti: 'Haití',
  escocia: 'Escocia',
  usa: 'Estados Unidos',
  paraguay: 'Paraguay',
  australia: 'Australia',
  turquia: 'Turquía',
  alemania: 'Alemania',
  curazao: 'Curazao',
  'costa-de-marfil': 'Costa de Marfil',
  ecuador: 'Ecuador',
  'paises-bajos': 'Países Bajos',
  japon: 'Japón',
  suecia: 'Suecia',
  tunez: 'Túnez',
  belgica: 'Bélgica',
  egipto: 'Egipto',
  iran: 'Irán',
  'nueva-zelanda': 'Nueva Zelanda',
  espana: 'España',
  'cabo-verde': 'Cabo Verde',
  'arabia-saudita': 'Arabia Saudita',
  uruguay: 'Uruguay',
  francia: 'Francia',
  senegal: 'Senegal',
  irak: 'Irak',
  noruega: 'Noruega',
  argentina: 'Argentina',
  argelia: 'Argelia',
  austria: 'Austria',
  jordania: 'Jordania',
  portugal: 'Portugal',
  'republica-del-congo': 'República del Congo',
  uzbekistan: 'Uzbekistán',
  colombia: 'Colombia',
  inglaterra: 'Inglaterra',
  croacia: 'Croacia',
  ghana: 'Ghana',
  panama: 'Panamá',
};

const GRUPOS = {
  a: ['mexico', 'sudafrica', 'corea-del-sur', 'republica-checa'],
  b: ['canada', 'bosnia-herzegovina', 'catar', 'suiza'],
  c: ['brasil', 'marruecos', 'haiti', 'escocia'],
  d: ['usa', 'paraguay', 'australia', 'turquia'],
  e: ['alemania', 'curazao', 'costa-de-marfil', 'ecuador'],
  f: ['paises-bajos', 'japon', 'suecia', 'tunez'],
  g: ['belgica', 'egipto', 'iran', 'nueva-zelanda'],
  h: ['espana', 'cabo-verde', 'arabia-saudita', 'uruguay'],
  i: ['francia', 'senegal', 'irak', 'noruega'],
  j: ['argentina', 'argelia', 'austria', 'jordania'],
  k: ['portugal', 'republica-del-congo', 'uzbekistan', 'colombia'],
  l: ['inglaterra', 'croacia', 'ghana', 'panama'],
};

// Sedes (slug → metadata)
const SEDES = {
  'ciudad-de-mexico':  { nombre: 'Estadio Azteca',          tz: 'America/Mexico_City',   offset: '-06:00' },
  'guadalajara':       { nombre: 'Estadio Akron',           tz: 'America/Mexico_City',   offset: '-06:00' },
  'monterrey':         { nombre: 'Estadio BBVA',            tz: 'America/Monterrey',     offset: '-06:00' },
  'toronto':           { nombre: 'BMO Field',               tz: 'America/Toronto',       offset: '-04:00' },
  'vancouver':         { nombre: 'BC Place',                tz: 'America/Vancouver',     offset: '-07:00' },
  'atlanta':           { nombre: 'Mercedes-Benz Stadium',   tz: 'America/New_York',      offset: '-04:00' },
  'boston':            { nombre: 'Gillette Stadium',        tz: 'America/New_York',      offset: '-04:00' },
  'dallas':            { nombre: 'AT&T Stadium',            tz: 'America/Chicago',       offset: '-05:00' },
  'houston':           { nombre: 'NRG Stadium',             tz: 'America/Chicago',       offset: '-05:00' },
  'kansas-city':       { nombre: 'Arrowhead Stadium',       tz: 'America/Chicago',       offset: '-05:00' },
  'los-angeles':       { nombre: 'SoFi Stadium',            tz: 'America/Los_Angeles',   offset: '-07:00' },
  'miami':             { nombre: 'Hard Rock Stadium',       tz: 'America/New_York',      offset: '-04:00' },
  'nueva-jersey':      { nombre: 'MetLife Stadium',         tz: 'America/New_York',      offset: '-04:00' },
  'philadelphia':      { nombre: 'Lincoln Financial Field', tz: 'America/New_York',      offset: '-04:00' },
  'san-francisco':     { nombre: "Levi's Stadium",          tz: 'America/Los_Angeles',   offset: '-07:00' },
  'seattle':           { nombre: 'Lumen Field',             tz: 'America/Los_Angeles',   offset: '-07:00' },
};

// Calendario fase de grupos. Cada entry: [diaIso, hora, sedeSlug, localSlug, visitanteSlug, jornadaN]
const PARTIDOS = [
  // J1 - 11 al 17 jun
  ['2026-06-11', '14:00', 'ciudad-de-mexico',  'mexico',           'sudafrica',          1],
  ['2026-06-11', '21:00', 'guadalajara',       'corea-del-sur',    'republica-checa',    1],
  ['2026-06-12', '14:00', 'toronto',           'canada',           'bosnia-herzegovina', 1],
  ['2026-06-12', '20:00', 'los-angeles',       'usa',              'paraguay',           1],
  ['2026-06-13', '14:00', 'san-francisco',     'catar',            'suiza',              1],
  ['2026-06-13', '17:00', 'nueva-jersey',      'brasil',           'marruecos',          1],
  ['2026-06-13', '20:00', 'boston',            'haiti',            'escocia',            1],
  ['2026-06-13', '23:00', 'vancouver',         'australia',        'turquia',            1],
  ['2026-06-14', '12:00', 'houston',           'alemania',         'curazao',            1],
  ['2026-06-14', '15:00', 'dallas',            'paises-bajos',     'japon',              1],
  ['2026-06-14', '18:00', 'philadelphia',      'costa-de-marfil',  'ecuador',            1],
  ['2026-06-14', '21:00', 'monterrey',         'suecia',           'tunez',              1],
  ['2026-06-15', '11:00', 'atlanta',           'espana',           'cabo-verde',         1],
  ['2026-06-15', '14:00', 'seattle',           'belgica',          'egipto',             1],
  ['2026-06-15', '17:00', 'miami',             'arabia-saudita',   'uruguay',            1],
  ['2026-06-15', '20:00', 'los-angeles',       'iran',             'nueva-zelanda',      1],
  ['2026-06-16', '14:00', 'nueva-jersey',      'francia',          'senegal',            1],
  ['2026-06-16', '17:00', 'boston',            'irak',             'noruega',            1],
  ['2026-06-16', '20:00', 'kansas-city',       'argentina',        'argelia',            1],
  ['2026-06-16', '23:00', 'san-francisco',     'austria',          'jordania',           1],
  ['2026-06-17', '12:00', 'houston',           'portugal',         'republica-del-congo',1],
  ['2026-06-17', '15:00', 'dallas',            'inglaterra',       'croacia',            1],
  ['2026-06-17', '18:00', 'toronto',           'ghana',            'panama',             1],
  ['2026-06-17', '21:00', 'ciudad-de-mexico',  'uzbekistan',       'colombia',           1],
  // J2 - 18 al 23 jun
  ['2026-06-18', '11:00', 'atlanta',           'republica-checa',  'sudafrica',          2],
  ['2026-06-18', '14:00', 'los-angeles',       'suiza',            'bosnia-herzegovina', 2],
  ['2026-06-18', '17:00', 'vancouver',         'canada',           'catar',              2],
  ['2026-06-18', '20:00', 'guadalajara',       'mexico',           'corea-del-sur',      2],
  ['2026-06-19', '14:00', 'seattle',           'usa',              'australia',          2],
  ['2026-06-19', '17:00', 'boston',            'escocia',          'marruecos',          2],
  ['2026-06-19', '19:30', 'philadelphia',      'brasil',           'haiti',              2],
  ['2026-06-19', '22:00', 'san-francisco',     'turquia',          'paraguay',           2],
  ['2026-06-20', '12:00', 'houston',           'paises-bajos',     'suecia',             2],
  ['2026-06-20', '15:00', 'toronto',           'alemania',         'costa-de-marfil',    2],
  ['2026-06-20', '21:00', 'kansas-city',       'ecuador',          'curazao',            2],
  ['2026-06-20', '23:00', 'monterrey',         'tunez',            'japon',              2],
  ['2026-06-21', '11:00', 'atlanta',           'espana',           'arabia-saudita',     2],
  ['2026-06-21', '14:00', 'los-angeles',       'belgica',          'iran',               2],
  ['2026-06-21', '17:00', 'miami',             'uruguay',          'cabo-verde',         2],
  ['2026-06-21', '20:00', 'vancouver',         'nueva-zelanda',    'egipto',             2],
  ['2026-06-22', '12:00', 'dallas',            'argentina',        'austria',            2],
  ['2026-06-22', '16:00', 'philadelphia',      'francia',          'irak',               2],
  ['2026-06-22', '19:00', 'nueva-jersey',      'noruega',          'senegal',            2],
  ['2026-06-22', '22:00', 'san-francisco',     'jordania',         'argelia',            2],
  ['2026-06-23', '12:00', 'houston',           'portugal',         'uzbekistan',         2],
  ['2026-06-23', '15:00', 'boston',            'inglaterra',       'ghana',              2],
  ['2026-06-23', '18:00', 'toronto',           'panama',           'croacia',            2],
  ['2026-06-23', '21:00', 'guadalajara',       'colombia',         'republica-del-congo',2],
  // J3 - 24 al 27 jun (simultáneos por grupo)
  ['2026-06-24', '14:00', 'vancouver',         'suiza',            'canada',             3],
  ['2026-06-24', '14:00', 'seattle',           'bosnia-herzegovina','catar',             3],
  ['2026-06-24', '17:00', 'atlanta',           'marruecos',        'haiti',              3],
  ['2026-06-24', '17:00', 'miami',             'brasil',           'escocia',            3],
  ['2026-06-24', '20:00', 'monterrey',         'sudafrica',        'corea-del-sur',      3],
  ['2026-06-24', '20:00', 'ciudad-de-mexico',  'republica-checa',  'mexico',             3],
  ['2026-06-25', '15:00', 'philadelphia',      'curazao',          'costa-de-marfil',    3],
  ['2026-06-25', '15:00', 'nueva-jersey',      'ecuador',          'alemania',           3],
  ['2026-06-25', '18:00', 'dallas',            'japon',            'suecia',             3],
  ['2026-06-25', '18:00', 'kansas-city',       'tunez',            'paises-bajos',       3],
  ['2026-06-25', '21:00', 'san-francisco',     'paraguay',         'australia',          3],
  ['2026-06-25', '21:00', 'los-angeles',       'turquia',          'usa',                3],
  ['2026-06-26', '14:00', 'boston',            'noruega',          'francia',            3],
  ['2026-06-26', '14:00', 'toronto',           'senegal',          'irak',               3],
  ['2026-06-26', '19:00', 'houston',           'cabo-verde',       'arabia-saudita',     3],
  ['2026-06-26', '19:00', 'guadalajara',       'uruguay',          'espana',             3],
  ['2026-06-26', '22:00', 'seattle',           'egipto',           'iran',               3],
  ['2026-06-26', '22:00', 'vancouver',         'nueva-zelanda',    'belgica',            3],
  ['2026-06-27', '16:00', 'philadelphia',      'croacia',          'ghana',              3],
  ['2026-06-27', '16:00', 'nueva-jersey',      'panama',           'inglaterra',         3],
  ['2026-06-27', '18:30', 'miami',             'colombia',         'portugal',           3],
  ['2026-06-27', '18:30', 'atlanta',           'republica-del-congo','uzbekistan',       3],
  ['2026-06-27', '21:00', 'kansas-city',       'argelia',          'austria',            3],
  ['2026-06-27', '21:00', 'dallas',            'jordania',         'argentina',          3],
];

// Helpers
function selRef(slug) {
  return { type: 'seleccion', slug, nombre: SEL[slug] };
}
function equipoRef(slug) {
  return { type: 'equipo', slug, nombre: SEL[slug] };
}
function partidoSlug(local, visitante, jornada) {
  return `${local}-vs-${visitante}-j${jornada}`;
}
function grupoDeSeleccion(slug) {
  for (const [letra, sels] of Object.entries(GRUPOS)) {
    if (sels.includes(slug)) return letra;
  }
  throw new Error(`Sin grupo: ${slug}`);
}

// Determinar el grupo de cada partido y agrupar partidos por grupo
const PARTIDOS_POR_GRUPO = Object.fromEntries(Object.keys(GRUPOS).map(l => [l, []]));
for (const p of PARTIDOS) {
  const [, , , local] = p;
  const letra = grupoDeSeleccion(local);
  PARTIDOS_POR_GRUPO[letra].push(p);
}

// Generar grupos
let gruposEscritos = 0;
for (const [letra, sels] of Object.entries(GRUPOS)) {
  const ps = PARTIDOS_POR_GRUPO[letra];
  const nombres = sels.map(s => SEL[s]).join(', ');
  const data = {
    slug: `grupo-${letra}`,
    edicion: { type: 'edicion', slug: '2026', nombre: 'Mundial 2026' },
    letra: letra.toUpperCase(),
    selecciones: sels.map(selRef),
    tabla: sels.map((s, i) => ({
      posicion: i + 1,
      seleccion: selRef(s),
      pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0,
      forma: [],
    })),
    partidos: ps.map(([, , , local, visitante, jornada]) => ({
      type: 'partido',
      slug: partidoSlug(local, visitante, jornada),
      nombre: `${SEL[local]} vs ${SEL[visitante]} · J${jornada}`,
    })),
    analisis: `Grupo ${letra.toUpperCase()} del Mundial 2026: ${nombres}. La fase de grupos arranca el 11 de junio y dos selecciones por grupo avanzan a dieciseisavos.`,
    seo: {
      title: `Grupo ${letra.toUpperCase()} Mundial 2026 — ${nombres}`,
      description: `Tabla, fixture y análisis del Grupo ${letra.toUpperCase()} del Mundial 2026 con ${nombres}.`,
    },
  };
  writeFileSync(
    resolve(GRUPOS_DIR, `grupo-${letra}.json`),
    JSON.stringify(data, null, 2) + '\n',
    'utf8',
  );
  gruposEscritos++;
}

// Generar partidos
let partidosEscritos = 0;
for (const [diaIso, hora, sedeSlug, local, visitante, jornada] of PARTIDOS) {
  const sede = SEDES[sedeSlug];
  if (!sede) throw new Error(`Sede desconocida: ${sedeSlug}`);
  const letra = grupoDeSeleccion(local);
  const slug = partidoSlug(local, visitante, jornada);
  const fechaISO = `${diaIso}T${hora}:00${sede.offset}`;

  const data = {
    slug,
    edicion: { type: 'edicion', slug: '2026', nombre: 'Mundial 2026' },
    fase: { tipo: 'grupos', slug: 'grupos', nombre: `Fase de grupos · J${jornada}` },
    grupo: { type: 'grupo', slug: `grupo-${letra}`, nombre: `Grupo ${letra.toUpperCase()}` },
    local: equipoRef(local),
    visitante: equipoRef(visitante),
    fecha: fechaISO,
    zonaHoraria: sede.tz,
    sede: { type: 'sede', slug: sedeSlug, nombre: sede.nombre },
    estado: 'scheduled',
    transmision: [],
    h2h: {
      totalEnfrentamientos: 0,
      victoriasLocal: 0,
      empates: 0,
      victoriasVisitante: 0,
      ultimosResultados: [],
    },
    seo: {
      title: `${SEL[local]} vs ${SEL[visitante]} — Mundial 2026 J${jornada}`,
      description: `Previa, alineaciones, sede y horario de ${SEL[local]} vs ${SEL[visitante]} en la jornada ${jornada} del Grupo ${letra.toUpperCase()} del Mundial 2026.`,
    },
  };
  writeFileSync(
    resolve(PARTIDOS_DIR, `${slug}.json`),
    JSON.stringify(data, null, 2) + '\n',
    'utf8',
  );
  partidosEscritos++;
}

// Limpiar partidos viejos que ya no existen en el sorteo real
const VIEJOS = ['inglaterra-vs-costa-de-marfil-j1.json', 'ecuador-vs-uzbekistan-j1.json'];
for (const v of VIEJOS) {
  const p = resolve(PARTIDOS_DIR, v);
  if (existsSync(p)) {
    rmSync(p);
    console.log(`✗ borrado obsoleto: ${v}`);
  }
}

console.log(`✓ ${gruposEscritos} grupos + ${partidosEscritos} partidos generados`);
