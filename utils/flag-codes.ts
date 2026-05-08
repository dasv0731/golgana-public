/**
 * Mapping `seleccion.slug` → ISO 3166-1 alpha-2 (lowercase) que consume
 * la librería `flag-icons` (clases CSS `fi fi-<iso2>`).
 *
 * Excepciones notables:
 *  - `inglaterra` → `gb-eng`, `escocia` → `gb-sct` (Home Nations, no `gb` UK).
 *  - `republica-del-congo` → `cg` (Brazzaville). `rd-congo` → `cd` (Kinshasa).
 *  - `usa` → `us`, `paises-bajos` → `nl`, `arabia-saudita` → `sa`.
 *
 * Cuando el backend exponga `equipo.flagCode` directamente, este mapping
 * se vuelve fallback.
 */
const SLUG_TO_FLAG_CODE: Record<string, string> = {
  // Sorteo real Mundial 2026 (12 grupos)
  // Grupo A
  mexico: 'mx',
  sudafrica: 'za',
  'corea-del-sur': 'kr',
  'republica-checa': 'cz',
  // Grupo B
  canada: 'ca',
  'bosnia-herzegovina': 'ba',
  catar: 'qa',
  suiza: 'ch',
  // Grupo C
  brasil: 'br',
  marruecos: 'ma',
  haiti: 'ht',
  escocia: 'gb-sct',
  // Grupo D
  usa: 'us',
  paraguay: 'py',
  australia: 'au',
  turquia: 'tr',
  // Grupo E
  alemania: 'de',
  curazao: 'cw',
  'costa-de-marfil': 'ci',
  ecuador: 'ec',
  // Grupo F
  'paises-bajos': 'nl',
  japon: 'jp',
  suecia: 'se',
  tunez: 'tn',
  // Grupo G
  belgica: 'be',
  egipto: 'eg',
  iran: 'ir',
  'nueva-zelanda': 'nz',
  // Grupo H
  espana: 'es',
  'cabo-verde': 'cv',
  'arabia-saudita': 'sa',
  uruguay: 'uy',
  // Grupo I
  francia: 'fr',
  senegal: 'sn',
  irak: 'iq',
  noruega: 'no',
  // Grupo J
  argentina: 'ar',
  argelia: 'dz',
  austria: 'at',
  jordania: 'jo',
  // Grupo K
  portugal: 'pt',
  'republica-del-congo': 'cg',
  uzbekistan: 'uz',
  colombia: 'co',
  // Grupo L
  inglaterra: 'gb-eng',
  croacia: 'hr',
  ghana: 'gh',
  panama: 'pa',

  // Otros (eliminatorias, amistosos, no clasificados)
  italia: 'it',
  chile: 'cl',
  camerun: 'cm',
  nigeria: 'ng',
  'rd-congo': 'cd',
  eslovaquia: 'sk',
  'costa-rica': 'cr',
  dinamarca: 'dk',
  bolivia: 'bo',
  venezuela: 've',
  peru: 'pe',
  kirguistan: 'kg',
  emiratos: 'ae',
};

export function flagCode(slug: string | undefined | null): string {
  if (!slug) return '';
  return SLUG_TO_FLAG_CODE[slug] ?? '';
}
