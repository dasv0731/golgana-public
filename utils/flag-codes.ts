/**
 * Mapping `seleccion.slug` → ISO 3166-1 alpha-2 (lowercase) que consume
 * la librería `flag-icons` (clases CSS `fi fi-<iso2>`).
 *
 * Excepciones notables:
 *  - `inglaterra` → `gb-eng` (England, Home Nation), no `gb` (UK).
 *  - `usa` → `us`.
 *  - `paises-bajos` → `nl`, `arabia-saudita` → `sa`, etc.
 *
 * Cuando el backend exponga `equipo.flagCode` directamente, este mapping
 * se vuelve fallback. Por ahora derivamos del slug.
 */
const SLUG_TO_FLAG_CODE: Record<string, string> = {
  // Grupo D (Mundial 2026)
  ecuador: 'ec',
  inglaterra: 'gb-eng',
  'costa-de-marfil': 'ci',
  uzbekistan: 'uz',

  // Grupo A
  mexico: 'mx',
  canada: 'ca',
  marruecos: 'ma',
  iran: 'ir',

  // Grupo B
  espana: 'es',
  senegal: 'sn',
  'costa-rica': 'cr',
  'arabia-saudita': 'sa',

  // Grupo C
  usa: 'us',
  japon: 'jp',
  dinamarca: 'dk',
  'rd-congo': 'cd',

  // Grupo E
  francia: 'fr',
  colombia: 'co',
  argelia: 'dz',
  'nueva-zelanda': 'nz',

  // Grupo F
  argentina: 'ar',
  suiza: 'ch',
  egipto: 'eg',
  panama: 'pa',

  // Grupo G
  alemania: 'de',
  'corea-del-sur': 'kr',
  eslovaquia: 'sk',
  curazao: 'cw',

  // Grupo H
  brasil: 'br',
  chile: 'cl',
  camerun: 'cm',
  jordania: 'jo',

  // Grupo I
  portugal: 'pt',
  sudafrica: 'za',
  catar: 'qa',

  // Grupo J
  belgica: 'be',
  uruguay: 'uy',
  tunez: 'tn',
  haiti: 'ht',

  // Grupo K
  'paises-bajos': 'nl',
  australia: 'au',
  nigeria: 'ng',
  paraguay: 'py',

  // Grupo L
  italia: 'it',
  croacia: 'hr',
  ghana: 'gh',
  'cabo-verde': 'cv',

  // Otros (eliminatorias, amistosos)
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
