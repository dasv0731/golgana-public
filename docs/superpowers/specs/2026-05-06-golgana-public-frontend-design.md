# Golgana Public Frontend — Design Spec

**Fecha**: 2026-05-06
**Dominio**: `golgana.net`
**Repo**: `golgana-public`
**Stack**: Nuxt 3 SSR + Vue 3 + TypeScript · DynamoDB (backend separado) · AWS Amplify Hosting
**Scope cubierto**: Frontend MVP enfocado en Mundial 2026, listo para consumir backend CMS cuando esté disponible
**Lanzamiento target**: 2026-06-09 (2 días antes del kickoff del Mundial)

---

## 0. Resumen ejecutivo

Golgana lanza su frontend público (`golgana-public`) con foco 100% en el **Mundial 2026** como torneo central. La spec original de SEO (2026-04-23) sigue vigente como referencia maestra; este documento define la implementación frontend del MVP Mundial-first y posterga LigaPro/clubes a Fase 2 post-Mundial.

**Decisiones clave**
- **URL strategy**: Mundial entra al árbol existente bajo `/torneos/mundial/2026/...` (page authority en URLs estables; reusable para 2030/2034). Selecciones nuevas top-level `/selecciones/<slug>/`.
- **Data layer**: el front sólo habla con `/api/*` (server routes Nuxt). En MVP, esos endpoints leen JSON/markdown checked-in. Cuando el backend CMS esté listo, los mismos endpoints proxy-pasan al CMS sin cambios en `pages/*.vue`.
- **Mockup migration**: CSS global preservado (`golgana-pro.css` + 3 más) + componentes Vue delgados como wrappers semánticos. Fidelidad pixel-perfect, velocidad de implementación.
- **Stack**: Nuxt 3 + Nitro `aws-amplify` preset, `@nuxt/content` solo para markdown editorial (`/noticias/*`, `/temas/*`), GTM + GA4, OG images dinámicas con `satori`.

**Postergado a Fase 2 (post-Mundial, julio+)**: LigaPro Serie A/B, Copa Ecuador, 7 clubes Premium, jugadores individuales Premium (~40), integración CMS real, Image Handler producción.

---

## 1. Decisiones de scope (aprobadas durante brainstorming 2026-05-06)

| Dimensión | Decisión |
|---|---|
| Foco MVP | Mundial 2026 (Ecuadorian football secundario, posterga a Fase 2) |
| URL Mundial | `/torneos/mundial/<año>/...` — siguiendo patrón existente de `liga-pro-serie-a/temporada-<año>/` |
| Slug edición Mundial | Año plano (`2026`), no `temporada-2026` ni `edicion-2026` |
| Slug edición LigaPro | Mantiene `temporada-<año>/` (estándar fútbol club) |
| Selecciones | Top-level `/selecciones/<slug>/` con template propio (mismas 8 sub-rutas que club, distinto contenido) |
| Estadio en Selección | Sí mantiene `/estadio/` (con adaptación: principal habitual + secundarios rotativos) |
| Cuerpo técnico Selección | Sección dentro de `/plantilla/`, no URL propia |
| Data layer | Server routes Nuxt como abstracción; mock con JSON/markdown en MVP, proxy al CMS futuro vía env var |
| Markdown editorial | `@nuxt/content` v3 sólo para `/noticias/*` y `/temas/*` |
| Mockup migration | Opción A: CSS global preservado + Vue components delgados (no scoped, no rewrite) |
| Backend stack | DynamoDB + Amplify (separado, en paralelo) |
| Hosting | AWS Amplify Hosting con preset Nitro `aws-amplify` |
| Analytics | GTM + GA4 (con cookie consent gate) |
| OG images | `satori` + `@resvg/resvg-js` en Lambda (sin headless Chrome) |
| Bots IA | Permitidos (GPTBot, Google-Extended, ClaudeBot, PerplexityBot, etc.) |
| Idioma MVP | `es-EC` único; arquitectura Nuxt i18n preparada para inglés en Fase 3 |
| Lanzamiento target | 2026-06-09 (2 días antes del Mundial 2026-06-11) |

---

## 2. URL Tree completo

### 2.1 Mundial (nuevo) y torneos existentes

```
/torneos/                                  — hub directorio (existente, sin cambios)
/torneos/mundial/                          — torneo evergreen (todas las ediciones, historia, palmarés)
/torneos/mundial/2026/                     — edición actual
/torneos/mundial/2026/grupos/              — listado 12 grupos
/torneos/mundial/2026/grupos/<grupo>/      — grupo individual (tabla + 6 partidos)
/torneos/mundial/2026/grupos/<grupo>/<partido>/ — partido fase de grupos
/torneos/mundial/2026/calendario/          — fixture completo (104 partidos)
/torneos/mundial/2026/goleadores/          — top scorers
/torneos/mundial/2026/octavos/             — 16 partidos de octavos
/torneos/mundial/2026/octavos/<partido>/   — partido knockout
/torneos/mundial/2026/cuartos/             — 8 partidos
/torneos/mundial/2026/cuartos/<partido>/
/torneos/mundial/2026/semifinales/
/torneos/mundial/2026/semifinales/<partido>/
/torneos/mundial/2026/final/               — la final
/torneos/mundial/2026/sedes/               — 16 estadios
/torneos/mundial/campeones/                — palmarés histórico

/torneos/liga-pro-serie-a/...              — Fase 2 post-Mundial (template ya en spec original)
/torneos/copa-ecuador/...                  — Fase 2
/torneos/liga-pro-serie-b/...              — Fase 2
```

### 2.2 Selecciones (nuevo top-level)

```
/selecciones/                              — hub directorio
/selecciones/<slug>/                       — hub selección (Ecuador, Inglaterra, etc.)
/selecciones/<slug>/plantilla/             — convocatoria 26 al Mundial
/selecciones/<slug>/partidos/              — próximos + últimos (Mundial + eliminatorias + amistosos)
/selecciones/<slug>/historia/              — long-form
/selecciones/<slug>/titulos/               — Copa América, mejores Mundiales, etc.
/selecciones/<slug>/idolos/                — hall of fame
/selecciones/<slug>/clasicos/              — rivalidades (Brasil, Colombia, Perú para Ecuador)
/selecciones/<slug>/estadio/               — estadio principal habitual + secundarios rotativos
```

### 2.3 Equipos club (Fase 2 post-Mundial)

```
/equipos/<slug>/...                        — sin cambios respecto a spec original
```

### 2.4 Jugadores y editorial (compartido club + selección)

```
/jugadores/<slug>/                         — único perfil (cubre club + selección)
/jugadores/<slug>/trayectoria/
/jugadores/<slug>/estadisticas/
/jugadores/<slug>/titulos/

/noticias/                                 — index editorial
/noticias/<slug>/                          — artículo individual

/temas/                                    — tag index
/temas/<slug>/                             — tema/cluster (incluye `/temas/seleccion-ecuatoriana/` como cluster editorial complementario)
```

### 2.5 Institucionales

```
/                                          — Home
/acerca-de/
/contacto/
/politica-privacidad/
/terminos/
```

### 2.6 Reglas de URL

1. Slug torneo evergreen estable, año-independiente: `mundial`, `liga-pro-serie-a`.
2. Mundial usa año plano (`2026`); LigaPro usa `temporada-<año>` (cada tipo competición su unidad temporal).
3. Slugs en minúsculas, sin tildes ni ñ (`moises-caicedo`, `cote-ivoire` → `costa-de-marfil`).
4. Trailing slash consistente. Nuxt redirect 301 desde sin-slash.
5. Apex sin www (`golgana.net`); 301 de `www.*` al apex.
6. Una URL canónica por partido. Estados (`scheduled`/`playing`/`finished`) mutan title/meta/schema, no URL.
7. Breadcrumbs obligatorios en todos los templates con `BreadcrumbList` schema.

---

## 3. Templates y mapeo a Vue pages

### 3.1 Templates MVP (8 + institucionales)

| # | Template | URL | Prioridad SEO | Schema.org principal |
|---|---|---|---|---|
| 1 | Home | `/` | Alta | `Organization`, `WebSite`, `ItemList` |
| 2 | Torneo hub | `/torneos/mundial/` | Muy alta (evergreen) | `SportsOrganization`, `BreadcrumbList`, `FAQPage` |
| 3 | Edición | `/torneos/mundial/2026/` | **Muy alta** ("mundial 2026") | `SportsEvent` (startDate/endDate), `BreadcrumbList`, `FAQPage` |
| 4 | Grupo | `/torneos/mundial/2026/grupos/[grupo]/` | Alta | `SportsEvent` + `ItemList` partidos |
| 5 | Calendario | `/torneos/mundial/2026/calendario/` | Alta | `ItemList` de `SportsEvent` |
| 6 | Selección | `/selecciones/[slug]/` y 8 sub-páginas | Muy alta | `SportsTeam` + sub-schemas por sub-página |
| 7 | Partido | `/torneos/mundial/2026/.../<partido>/` | Muy alta | `SportsEvent` con `eventStatus` mutante |
| 8 | Artículo + Tag | `/noticias/[slug]/` y `/temas/[slug]/` | Alta | `NewsArticle`/`SportsArticle`, `CollectionPage` |

**Plus institucionales** (E-E-A-T crítico): Acerca de, Contacto, Política de privacidad, Términos. Hubs directorios `/torneos/`, `/selecciones/`, `/jugadores/`, `/noticias/`, `/temas/` con bloques compactos.

**Sub-páginas selección — paralelismo con club**

| Sub-página | Equipo club (Fase 2) | Selección (MVP) |
|---|---|---|
| Hub | `/equipos/<slug>/` | `/selecciones/<slug>/` |
| Plantilla | ~25 jugadores + altas/bajas | Convocatoria 26 al Mundial + cuerpo técnico embebido |
| Partidos | LigaPro + copas | Mundial + eliminatorias + amistosos, agrupados por torneo |
| Historia | ✅ | ✅ |
| Títulos | Liga, copas | Copa América, eliminatorias, mejores Mundiales |
| Ídolos | Hall club | Hall selección (Spencer, Ulises, A. Valencia para Ecuador) |
| Clásicos | Astillero, Capital | Brasil, Colombia, Perú |
| Estadio | Único | Principal habitual + secundarios rotativos |

### 3.2 Niveles de profundidad por entidad

**Selecciones (48 totales en MVP)**
- **Premium (1)**: 🇪🇨 Ecuador — todas las sub-páginas con contenido completo.
- **Estándar (3)**: Inglaterra, Costa de Marfil, Uzbekistán (Grupo D) — hub + plantilla + partidos.
- **Básicas (44)**: resto del Mundial — hub stub generado desde JSON con escudo, FIFA rank, DT, plantilla preliminar.

**Partidos (~104 totales en MVP)**
- **Premium (3)**: Ecuador J1-J3 — previa larga + alineación probable + h2h + datos viz.
- **Estándar (~21)**: resto Grupo D + partidos clave (inauguración, Argentina-Suiza, etc.) — ficha técnica + previa breve.
- **Básicos (~80)**: stub generado desde JSON (fecha + sede + equipos + schema completo para SEO).

### 3.3 Páginas Vue (estructura `pages/` final)

```
pages/
├── index.vue                                              — Home
├── torneos/
│   ├── index.vue                                          — /torneos/ hub
│   └── mundial/
│       ├── index.vue                                      — /torneos/mundial/
│       ├── 2026/
│       │   ├── index.vue                                  — edición
│       │   ├── grupos/
│       │   │   ├── index.vue
│       │   │   └── [grupo]/
│       │   │       ├── index.vue
│       │   │       └── [partido].vue
│       │   ├── calendario.vue
│       │   ├── goleadores.vue
│       │   ├── sedes.vue
│       │   ├── octavos/
│       │   │   ├── index.vue
│       │   │   └── [partido].vue
│       │   ├── cuartos/{...}
│       │   ├── semifinales/{...}
│       │   └── final/
│       │       ├── index.vue
│       │       └── [partido].vue
│       └── campeones.vue
├── selecciones/
│   ├── index.vue
│   └── [slug]/
│       ├── index.vue
│       ├── plantilla.vue
│       ├── partidos.vue
│       ├── historia.vue
│       ├── titulos.vue
│       ├── idolos.vue
│       ├── clasicos.vue
│       └── estadio.vue
├── jugadores/
│   ├── index.vue
│   └── [slug]/
│       ├── index.vue
│       ├── trayectoria.vue
│       ├── estadisticas.vue
│       └── titulos.vue
├── noticias/
│   ├── index.vue
│   └── [slug].vue
├── temas/
│   ├── index.vue
│   └── [slug].vue
├── acerca-de.vue
├── contacto.vue
├── politica-privacidad.vue
└── terminos.vue
```

---

## 4. Estructura del repo

```
golgana-public/
├── app.vue                          ← root layout (Organization schema, header, footer)
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── amplify.yml                      ← build spec Amplify Hosting
├── .nvmrc                           ← Node 20 LTS
├── .env.example
├── README.md
│
├── assets/css/                      ← CSS global de mockups (preservado tal cual)
│   ├── tokens.css
│   ├── base.css
│   ├── components.css
│   └── golgana-pro.css
├── assets/fonts/                    ← Bebas Neue + Montserrat self-hosted (WOFF2)
├── assets/img/                      ← logo, placeholders SVG
│
├── components/                      ← Vue components delgados (wrappers semánticos)
│   ├── Layout/
│   │   ├── SiteHeader.vue
│   │   ├── SiteFooter.vue
│   │   ├── Breadcrumb.vue           (.pcrumb)
│   │   ├── PageIndex.vue            (.pindex sticky nav)
│   │   └── CookieBanner.vue
│   ├── Hero/
│   │   ├── ProHero.vue              (.pro-hero — torneo, grupo)
│   │   ├── EquipoHero.vue           (.eq-hero — selección)
│   │   └── PlayerHero.vue
│   ├── Tile/
│   │   ├── Tile.vue                 (.tile + variantes)
│   │   ├── MediaTile.vue            (.media-tile)
│   │   └── BentoGrid.vue            (.bento)
│   ├── Match/
│   │   ├── MatchCard.vue            (.pmatch)
│   │   └── MatchHero.vue            (variantes scheduled/playing/finished)
│   ├── Stats/
│   │   ├── StatRow.vue              (.stat-row)
│   │   ├── Bars.vue                 (.bars + .bar)
│   │   ├── H2H.vue                  (.h2h)
│   │   └── Standings.vue            (.ptable)
│   ├── Pitch/
│   │   ├── Pitch.vue                (.pitch — cancha 11v11)
│   │   └── PitchPlayer.vue          (.pp)
│   ├── DataViz/
│   │   ├── Heatmap.vue              (.heatmap)
│   │   └── Timeline.vue             (.tl)
│   └── Editorial/
│       ├── EditorialCard.vue        (.ed-card)
│       └── ArticleBody.vue          (markdown rendering con prose styles)
│
├── composables/
│   ├── useSchema.ts                 ← schema.org helper (Organization, SportsEvent, etc.)
│   ├── useSeo.ts                    ← meta + OG + canonical
│   ├── useHreflang.ts               ← preparado para inglés Fase 3
│   └── useApi.ts                    ← wrapper $fetch con baseURL `/api`
│
├── pages/                           ← (estructura definida en §3.3)
│
├── server/
│   ├── api/                         ← contrato API (mock → proxy)
│   │   ├── torneos/
│   │   │   ├── [slug].get.ts
│   │   │   └── mundial/
│   │   │       ├── [edicion].get.ts
│   │   │       ├── [edicion]/grupos.get.ts
│   │   │       ├── [edicion]/grupos/[slug].get.ts
│   │   │       ├── [edicion]/calendario.get.ts
│   │   │       ├── [edicion]/goleadores.get.ts
│   │   │       └── [edicion]/sedes.get.ts
│   │   ├── selecciones/
│   │   │   ├── index.get.ts
│   │   │   ├── [slug].get.ts
│   │   │   └── [slug]/
│   │   │       ├── plantilla.get.ts
│   │   │       ├── partidos.get.ts
│   │   │       ├── historia.get.ts
│   │   │       ├── titulos.get.ts
│   │   │       ├── idolos.get.ts
│   │   │       ├── clasicos.get.ts
│   │   │       └── estadio.get.ts
│   │   ├── partidos/[slug].get.ts
│   │   ├── jugadores/[slug].get.ts
│   │   ├── articulos/index.get.ts
│   │   ├── articulos/[slug].get.ts
│   │   ├── temas/[slug].get.ts
│   │   └── og/[type]/[slug].png.ts  ← OG image generator (satori)
│   ├── routes/api/
│   │   └── revalidate.post.ts       ← webhook on-demand revalidation
│   ├── middleware/
│   │   ├── redirects.ts             ← www → apex, sin-slash → con-slash
│   │   └── security.ts              ← HSTS, CSP, etc.
│   └── utils/
│       ├── content-loader.ts        ← lee content/*.json
│       ├── content-cache.ts         ← in-memory cache invalidable
│       └── api-client.ts            ← $fetch al backend (cuando NUXT_USE_BACKEND=true)
│
├── content/                         ← fixtures + markdown editorial
│   ├── torneos/
│   │   ├── mundial.json
│   │   └── mundial/
│   │       ├── 2026.json
│   │       ├── grupos/grupo-a.json ... grupo-l.json
│   │       └── partidos/<slug>.json
│   ├── selecciones/
│   │   ├── ecuador.json (Premium, completo)
│   │   ├── inglaterra.json (Estándar)
│   │   ├── costa-de-marfil.json (Estándar)
│   │   ├── uzbekistan.json (Estándar)
│   │   └── ...44 stubs básicos generados desde fixture FIFA
│   ├── jugadores/
│   │   ├── moises-caicedo.json
│   │   └── ...30 jugadores Ecuador
│   └── noticias/                    ← markdown via @nuxt/content
│       └── 2026-MM-DD-<slug>.md
│
├── types/
│   ├── api.ts                       ← contrato API (Torneo, Edicion, Grupo, etc.)
│   └── schema.ts                    ← types de schema.org
│
├── public/
│   ├── favicon.png
│   ├── logo-golgana.png
│   ├── robots.txt
│   └── llms.txt
│
└── docs/
    └── superpowers/specs/
        └── 2026-05-06-golgana-public-frontend-design.md   (este archivo)
```

---

## 5. Stack y dependencias

### 5.1 `package.json` clave

```json
{
  "dependencies": {
    "nuxt": "^3.13.0",
    "vue": "^3.5.0",
    "@nuxt/content": "^3.0.0",
    "@nuxt/image": "^1.8.0",
    "@nuxtjs/sitemap": "^7.0.0",
    "satori": "^0.10.0",
    "satori-html": "^0.3.0",
    "@resvg/resvg-js": "^2.6.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vue-tsc": "^2.1.0"
  }
}
```

### 5.2 `nuxt.config.ts` clave

```ts
export default defineNuxtConfig({
  ssr: true,
  modules: ['@nuxt/content', '@nuxt/image', '@nuxtjs/sitemap'],
  typescript: { strict: true },
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/components.css',
    '~/assets/css/golgana-pro.css',
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'es-EC' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
  nitro: {
    preset: 'aws-amplify',
    prerender: { crawlLinks: true, routes: ['/'] },
  },
  routeRules: { /* ver §7.1 */ },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      gtmId: process.env.NUXT_PUBLIC_GTM_ID,
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID,
    },
    useBackend: process.env.NUXT_USE_BACKEND === 'true',
    cmsApiUrl: process.env.NUXT_CMS_API_URL,
    cmsApiKey: process.env.NUXT_CMS_API_KEY,
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET,
  },
});
```

### 5.3 Variables de entorno (`.env.example`)

```
NUXT_PUBLIC_SITE_URL=https://golgana.net
NUXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NUXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NUXT_USE_BACKEND=false
NUXT_CMS_API_URL=
NUXT_CMS_API_KEY=
NUXT_REVALIDATE_SECRET=
NUXT_IMAGE_HANDLER_URL=
```

---

## 6. Data layer y contrato API

### 6.1 Flujo de datos

```
┌────────────────────────────────────────┐
│  pages/torneos/mundial/2026/index.vue  │
│  useFetch('/api/torneos/mundial/2026') │
└──────────────┬─────────────────────────┘
               ▼
┌────────────────────────────────────────────────────┐
│  server/api/torneos/mundial/[edicion].get.ts       │
│                                                    │
│  if (config.useBackend) {                          │
│    return apiClient.get('/torneos/mundial/2026')   │  ← futuro CMS
│  }                                                 │
│  return loadContent('torneos/mundial/2026')        │  ← MVP / mock
└────────────────────────────────────────────────────┘
```

Cero cambios en `pages/*.vue` cuando llegue el backend. Sólo cambia env var `NUXT_USE_BACKEND=true` y configuración `NUXT_CMS_API_URL`.

### 6.2 Tipos del contrato (`types/api.ts`)

```ts
type Slug = string;
type ISODateTime = string;

interface Ref<T extends 'torneo'|'edicion'|'seleccion'|'equipo'|'jugador'|'partido'|'grupo'|'fase'|'sede'|'tag'|'autor'> {
  type: T;
  slug: Slug;
  nombre: string;
}

interface SeoBlock {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageOverride?: ImageRef;
  canonicalOverride?: string;
  noindex?: boolean;
}

interface FaqEntry { pregunta: string; respuesta: string; }

interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurDataUrl?: string;
  credito?: string;
}

interface HeroMetric {
  label: string;
  value: string;
  caption?: string;
  accent?: boolean;
}

interface Torneo {
  slug: Slug;
  nombre: string;
  nombreCorto: string;
  tipo: 'mundial'|'liga'|'copa-nacional'|'continental';
  organizador: { nombre: string; sitioWeb?: string };
  fundacion?: number;
  edicionActual: Ref<'edicion'>;
  edicionesPrevias: Ref<'edicion'>[];
  campeones: Array<{ ano: number; campeon: Ref<'seleccion'|'equipo'>; subcampeon?: Ref<'seleccion'|'equipo'> }>;
  seo: SeoBlock;
  faq: FaqEntry[];
}

interface Edicion {
  slug: Slug;
  torneo: Ref<'torneo'>;
  ano: number;
  fechaInicio: ISODateTime;
  fechaFin: ISODateTime;
  estado: 'upcoming'|'ongoing'|'finished';
  participantes: Ref<'seleccion'|'equipo'>[];
  formato: { tipoFase: 'grupos'|'liga'|'eliminatoria'; descripcion: string };
  fases: Fase[];
  sedes?: Sede[];
  campeon?: Ref<'seleccion'|'equipo'>;
  seo: SeoBlock;
  faq: FaqEntry[];
}

interface Fase {
  slug: 'grupos'|'octavos'|'cuartos'|'semifinales'|'final'|`jornada-${number}`;
  nombre: string;
  tipo: 'grupos'|'eliminatoria'|'jornada';
  partidos: Ref<'partido'>[];
  fechaInicio: ISODateTime;
  fechaFin: ISODateTime;
}

interface Grupo {
  slug: Slug;
  edicion: Ref<'edicion'>;
  letra: 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';
  selecciones: Ref<'seleccion'>[];
  tabla: GrupoStanding[];
  partidos: Ref<'partido'>[];
  analisis?: string;
  seo: SeoBlock;
}

interface GrupoStanding {
  posicion: number;
  seleccion: Ref<'seleccion'>;
  pj: number; g: number; e: number; p: number;
  gf: number; gc: number; dg: number; pts: number;
  forma: ('W'|'D'|'L')[];
}

interface Sede {
  slug: Slug;
  nombre: string;
  ciudad: string;
  pais: 'USA'|'CAN'|'MEX';
  capacidad: number;
  imagen?: ImageRef;
  partidos: Ref<'partido'>[];
}

interface Equipo {
  slug: Slug;
  tipo: 'club'|'seleccion';
  nombre: string;
  nombreOficial: string;
  apodo?: string;
  pais: string;
  ciudad?: string;
  fundacion?: number;
  escudo: ImageRef;
  colores: { primario: string; secundario: string };
  estadio?: Ref<'sede'>;
  estadiosSecundarios?: Ref<'sede'>[];
  dt: { nombre: string; foto?: ImageRef; desde?: ISODateTime; nacionalidad: string };
  cuerpoTecnico?: Array<{ rol: string; nombre: string; nacionalidad?: string }>;
  redes: { twitter?: string; instagram?: string; facebook?: string; web?: string };
  fifaRank?: number;
  valorPlantilla?: { monto: number; moneda: 'EUR'|'USD' };
  rivalidades: Ref<'equipo'>[];
  estadisticasDestacadas?: HeroMetric[];
  seo: SeoBlock;
  faq: FaqEntry[];
}

interface Plantilla {
  equipo: Ref<'equipo'>;
  edicion?: Ref<'edicion'>;
  jugadores: PlantillaJugador[];
  cuerpoTecnico: Equipo['cuerpoTecnico'];
  altas?: Array<{ jugador: Ref<'jugador'>; desde: string; tipo: 'fichaje'|'cesion'|'subida-cantera' }>;
  bajas?: Array<{ jugador: Ref<'jugador'>; hacia: string; tipo: string }>;
}

interface PlantillaJugador {
  jugador: Ref<'jugador'>;
  dorsal?: number;
  posicion: 'POR'|'DEF'|'MED'|'DEL';
  posicionDetalle?: string;
  capitan?: boolean;
  titular?: boolean;
  estado?: 'disponible'|'lesionado'|'suspendido';
}

interface Jugador {
  slug: Slug;
  nombre: string;
  nombreCompleto: string;
  apodo?: string;
  fechaNacimiento: string;
  nacionalidad: string;
  altura?: number;
  peso?: number;
  pieDominante?: 'izquierdo'|'derecho'|'ambidiestro';
  posicion: 'POR'|'DEF'|'MED'|'DEL';
  clubActual: Ref<'equipo'>;
  seleccion?: Ref<'equipo'>;
  trayectoria: TrayectoriaItem[];
  estadisticas?: EstadisticaTemporada[];
  titulos?: TituloLogrado[];
  valorMercado?: { monto: number; moneda: string; fecha: string; fuente?: string };
  redes: Equipo['redes'];
  retirado?: boolean;
  seo: SeoBlock;
  faq: FaqEntry[];
}

interface TrayectoriaItem {
  club: Ref<'equipo'>;
  desde: string;
  hasta?: string;
  tipo: 'cantera'|'profesional'|'cesion';
  partidos?: number;
  goles?: number;
  titulos?: string[];
  notas?: string;
}

interface EstadisticaTemporada {
  temporada: string;
  competicion: Ref<'torneo'>;
  equipo: Ref<'equipo'>;
  pj: number;
  goles: number;
  asistencias: number;
  amarillas?: number;
  rojas?: number;
}

interface TituloLogrado {
  competicion: Ref<'torneo'>;
  ano: number;
  equipo: Ref<'equipo'>;
  rolFinal?: 'titular'|'suplente'|'no-convocado';
}

interface Partido {
  slug: Slug;
  edicion: Ref<'edicion'>;
  fase: { tipo: Fase['tipo']; slug: string; nombre: string };
  grupo?: Ref<'grupo'>;
  local: Ref<'equipo'>;
  visitante: Ref<'equipo'>;
  fecha: ISODateTime;
  zonaHoraria: string;
  sede: Ref<'sede'>;
  estado: 'scheduled'|'playing'|'finished'|'postponed';
  marcador?: { local: number; visitante: number };
  goleadores?: Gol[];
  alineaciones?: { local: Alineacion; visitante: Alineacion };
  arbitro?: { nombre: string; nacionalidad: string };
  transmision?: string[];
  previa?: { texto: string; autor: Ref<'autor'>; fecha: ISODateTime };
  cronica?: { texto: string; autor: Ref<'autor'>; fecha: ISODateTime };
  minutoAMinuto?: EventoPartido[];
  estadisticas?: { local: StatsPartido; visitante: StatsPartido };
  h2h?: H2HResumen;
  imagenes?: ImageRef[];
  seo: SeoBlock;
}

interface Alineacion {
  formacion: string;                    // '4-3-3'
  titulares: PlantillaJugador[];
  suplentes: PlantillaJugador[];
  dt: { nombre: string };
  oficial: boolean;
}

interface Gol {
  minuto: number;
  jugador: Ref<'jugador'>;
  equipo: Ref<'equipo'>;
  tipo: 'gol'|'penal'|'autogol'|'tiro-libre';
  asistente?: Ref<'jugador'>;
}

interface EventoPartido {
  minuto: number;
  tipo: 'gol'|'amarilla'|'roja'|'cambio'|'lesion'|'falta-clave'|'inicio-tiempo'|'fin-tiempo';
  equipo?: Ref<'equipo'>;
  jugador?: Ref<'jugador'>;
  detalle?: string;
}

interface StatsPartido {
  posesion?: number;
  remates?: number;
  rematesArco?: number;
  faltas?: number;
  cornersAfavor?: number;
  amarillas?: number;
  rojas?: number;
  pasesCompletos?: number;
  pasesIntentados?: number;
}

interface H2HResumen {
  totalEnfrentamientos: number;
  victoriasLocal: number;
  empates: number;
  victoriasVisitante: number;
  ultimosResultados: Array<{ fecha: string; competicion: string; resultado: string }>;
}

interface Articulo {
  slug: Slug;
  titulo: string;
  subtitulo?: string;
  kicker: string;
  categoria: 'previa'|'cronica'|'analisis'|'entrevista'|'historia'|'reportaje';
  autor: Ref<'autor'>;
  fechaPublicacion: ISODateTime;
  fechaActualizacion?: ISODateTime;
  imagenHero: ImageRef;
  lead: string;
  cuerpo: string;                       // markdown
  tags: Ref<'tag'>[];
  entidadesMencionadas: Ref<'torneo'|'edicion'|'seleccion'|'equipo'|'jugador'|'partido'>[];
  tiempoLectura: number;
  seo: SeoBlock;
}
```

### 6.3 Endpoints REST

```
GET  /api/torneos/[slug]                                   → Torneo
GET  /api/torneos/mundial/[edicion]                        → Edicion + summary
GET  /api/torneos/mundial/[edicion]/grupos                 → Grupo[]
GET  /api/torneos/mundial/[edicion]/grupos/[slug]          → Grupo
GET  /api/torneos/mundial/[edicion]/calendario             → Partido[] (lite)
GET  /api/torneos/mundial/[edicion]/goleadores             → Goleador[]
GET  /api/torneos/mundial/[edicion]/sedes                  → Sede[]
GET  /api/torneos/[slug]/campeones                         → ItemCampeon[]
GET  /api/selecciones                                      → Equipo[] (tipo=seleccion, lite)
GET  /api/selecciones/[slug]                               → Equipo
GET  /api/selecciones/[slug]/plantilla                     → Plantilla
GET  /api/selecciones/[slug]/partidos                      → Partido[]
GET  /api/selecciones/[slug]/historia                      → ContenidoLargo
GET  /api/selecciones/[slug]/titulos                       → Titulo[]
GET  /api/selecciones/[slug]/idolos                        → Idolo[]
GET  /api/selecciones/[slug]/clasicos                      → Clasico[]
GET  /api/selecciones/[slug]/estadio                       → Sede[]
GET  /api/jugadores/[slug]                                 → Jugador
GET  /api/partidos/[slug]                                  → Partido
GET  /api/articulos                                        → Articulo[] (paginado)
GET  /api/articulos/[slug]                                 → Articulo
GET  /api/temas/[slug]                                     → Tag + Articulo[]
GET  /api/og/[type]/[slug].png                             → OG image dinámica
POST /api/revalidate?path=...&secret=...                   → on-demand revalidation
```

### 6.4 Cache strategy en API layer

- **Mock mode (file-system)**: cache en memoria invalidada en hot reload (`@/server/utils/content-cache.ts`).
- **Backend mode**: cada `server/api/*.get.ts` setea cache headers (`setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')`) configurables por endpoint según volatilidad:
  - Partido en vivo: 30s
  - Tabla de grupo durante torneo: 5min
  - Selección hub: 30min
  - Torneo evergreen: 1h
  - Artículos editoriales: 24h hasta on-demand-revalidate

### 6.5 Markdown editorial via `@nuxt/content`

- Frontmatter declara campos del `Articulo`: titulo, autor, categoria, tags, hero, lead, fecha, entidadesMencionadas.
- Cuerpo markdown estándar + componentes Vue embebidos (`<EnEsteArticulo>`, `<Bars>`, etc.).
- Acceso vía `queryCollection('noticias').find(...)`.
- Cuando llegue el CMS, los artículos pueden migrar a JSON (cuerpo como markdown string) y `/api/articulos` los sirve sin cambios en `/noticias/[slug].vue`.

---

## 7. Rendering, SEO y deployment

### 7.1 Rendering por template (`routeRules`)

```ts
routeRules: {
  '/':                                                  { isr: 3600 },
  '/torneos/':                                          { isr: 86400 },
  '/torneos/mundial/':                                  { prerender: true },
  '/torneos/mundial/2026/':                             { isr: 1800 },
  '/torneos/mundial/2026/grupos/**':                    { isr: 600 },
  '/torneos/mundial/2026/calendario':                   { isr: 1800 },
  '/torneos/mundial/2026/goleadores':                   { isr: 1800 },
  '/torneos/mundial/2026/sedes':                        { prerender: true },
  '/torneos/mundial/2026/octavos/**':                   { isr: 600 },
  '/torneos/mundial/2026/cuartos/**':                   { isr: 600 },
  '/torneos/mundial/2026/semifinales/**':               { isr: 600 },
  '/torneos/mundial/2026/final/**':                     { isr: 600 },
  '/torneos/mundial/campeones':                         { prerender: true },
  '/selecciones/':                                      { isr: 86400 },
  '/selecciones/**':                                    { isr: 1800 },
  '/jugadores/**':                                      { isr: 3600 },
  '/noticias/':                                         { isr: 600 },
  '/noticias/**':                                       { prerender: true },
  '/temas/**':                                          { isr: 3600 },
  '/acerca-de':                                         { prerender: true },
  '/contacto':                                          { prerender: true },
  '/politica-privacidad':                               { prerender: true },
  '/terminos':                                          { prerender: true },
}
```

**Partido individual con estado mutante**: webhook `POST /api/revalidate?path=/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan&secret=...` invalida la URL cuando cambia `matchStatus` en CMS. En MVP, manual via curl o admin UI futura.

### 7.2 Sitemap (`@nuxtjs/sitemap`)

Sitemap index `/sitemap.xml` apunta a sub-sitemaps:
- `sitemap-mundial.xml` — Mundial hub + 2026 + grupos + sedes + partidos
- `sitemap-selecciones.xml` — 48 selecciones
- `sitemap-jugadores.xml` — preliminar ~30 (Ecuador), crece post-launch
- `sitemap-noticias.xml` — news sitemap separado con `<news:news>` para Google News
- `sitemap-temas.xml`
- `sitemap-pages.xml` — institucionales + hubs

Auto-generado desde `/api/*` listings. Excluye `/api/`, páginas con `noindex`, OG images.

Priority + changefreq:
- `/torneos/mundial/2026/` → 1.0, daily
- `/selecciones/ecuador/` → 0.9, weekly
- `/torneos/mundial/2026/grupos/grupo-d/` → 0.9, daily
- Partidos Premium → 0.9, daily durante torneo
- Selecciones Estándar → 0.7, weekly
- Selecciones Básicas → 0.5, monthly
- Artículos → 0.7, monthly tras publicación

### 7.3 Schema.org

Composable `useSchema()` con generators tipados:
- `organization()` — global en `app.vue`
- `webSite({ searchAction: true })` — home
- `sportsEvent(edicion|partido)` — edición Mundial + cada partido
- `sportsTeam(equipo)` — selección/club
- `sportsPerson(jugador)` — Fase 1.5
- `breadcrumbList(crumbs)` — todos los templates con breadcrumb
- `faqPage(faqs)` — donde aplique
- `newsArticle(articulo)` / `sportsArticle(articulo)`
- `itemList(items, type)` — listas (campeones, partidos, equipos)
- `place(sede)` — estadios

Inyectado vía `useHead({ script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(schema) }] })`.

**Validación obligatoria**: cada template MVP pasa Rich Results Test antes de merge a main. Opcional CI con paquete validador.

### 7.4 OG images dinámicas

Endpoint `server/api/og/[type]/[slug].png.ts` con `satori` + `@resvg/resvg-js`:

```
/api/og/torneo/mundial.png
/api/og/edicion/mundial-2026.png
/api/og/seleccion/ecuador.png
/api/og/grupo/grupo-d.png
/api/og/partido/ecuador-vs-uzbekistan.png
/api/og/jugador/moises-caicedo.png
/api/og/articulo/<slug>.png
```

- `satori` (sin Chrome headless) genera SVG, `resvg-js` lo convierte a PNG
- Cache 24h
- Fonts Bebas Neue + Montserrat embebidas como WOFF2 buffer
- Templates: escudos + título + branding según tipo

### 7.5 robots.txt + llms.txt

`/public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /*?*

Sitemap: https://golgana.net/sitemap.xml

User-agent: SemrushBot
Crawl-delay: 10
```

Bots IA explícitamente permitidos (sin `Disallow` específico): GPTBot, Google-Extended, CCBot, ClaudeBot, PerplexityBot, ByteSpider, Applebot-Extended.

`/public/llms.txt`: descripción del sitio + índice de URLs importantes agrupadas por categoría con snippets cortos. Foco Mundial 2026.

### 7.6 Amplify Hosting (`amplify.yml`)

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - nvm use 20
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .output
        files: ['**/*']
      cache:
        paths: [node_modules/**/*]
    appRoot: .
```

Variables de entorno en Amplify Console (no commit): `NUXT_CMS_API_KEY`, `NUXT_REVALIDATE_SECRET`.

### 7.7 CWV targets

| Métrica | Target | Mecanismos |
|---|---|---|
| LCP | < 2.5s | `<NuxtImg>` con `preload` + `fetchpriority="high"` en hero. Fonts WOFF2 self-hosted con `font-display: swap` y `<link rel="preload">`. CDN CloudFront edge en US (Miami → Ecuador). |
| INP | < 200ms | JS mínimo. Tweaks panel desactivado en producción. GTM cargado tras `onMounted` y consent. Hidratación selectiva con `<ClientOnly>`. |
| CLS | < 0.1 | `width`/`height` explícitos en imágenes. Skeleton placeholders donde aplique. `font-size-adjust` para evitar FOUT. |
| TTFB | < 600ms | ISR + Edge cache CloudFront. |

Lighthouse CI en pipeline para 5 templates principales: home, torneo edición, selección Ecuador, grupo D, partido Premium.

### 7.8 Redirects (`server/middleware/redirects.ts`)

- `https://www.golgana.net/*` → `https://golgana.net/*` (301)
- Sin trailing slash → con trailing slash (301)
- Registro central editable en `server/utils/redirects-map.ts` para futuras redirecciones manuales.

### 7.9 Security headers (`server/middleware/security.ts`)

- HSTS (1 año, includeSubdomains)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictiva
- CSP acotado: Google Fonts, GTM/GA4, Image Handler, satori

### 7.10 Analytics: GTM + GA4 + cookie consent

- `<CookieBanner>` componente con consent básico (aceptar/rechazar/configurar)
- GTM se inyecta sólo tras consent vía `useHead()` con `script` async
- GTM ID y GA4 ID en runtime config public
- Pageviews automáticos por `$router.afterEach`
- Event tracking custom: clicks en CTAs hero, scroll depth en partidos Premium

---

## 8. Cronograma y entregables

### 8.1 Cronograma S1-S5 (5 may → 8 jun, 36 días)

| Semana | Dev | Editorial |
|---|---|---|
| **S1 (5-12 may)** | Setup Nuxt + Amplify + CSS migration. `types/api.ts`. Layout/Header/Footer/Breadcrumb/CookieBanner. `server/utils/content-loader.ts`. Composables base. | Brief de cobertura. Fixtures iniciales `content/torneos/mundial/2026.json`. Acerca de + institucionales. |
| **S2 (13-19 may)** | Templates Home + Torneo hub + Edición + Grupo. Componentes Hero/Tile/BentoGrid/Standings/Bars. | Contenido Grupo D + Selección Ecuador (hub + historia + ídolos + clásicos). |
| **S3 (20-26 may)** | Templates Selección + 8 sub-páginas. Template Partido (3 estados). Componentes Match/Pitch/H2H/Heatmap. | Grupos A-L estándar. Script de seed para 44 selecciones básicas desde fixture FIFA. |
| **S4 (27-2 jun)** | Calendario + Goleadores + Sedes. Templates Artículo + Tag. OG generator. Sitemap. Schema. Composables `useSchema`/`useSeo`. | Previas Mundial Ecuador (3 partidos Premium) + 10 artículos editoriales. |
| **S5 (3-8 jun)** | QA + CWV optimization + Lighthouse CI + Search Console submission. Buffer fixes. | Polish editorial. IndexNow ping. Revisión copy + manual de anchors. |
| **2026-06-09** | 🚀 **LAUNCH** | |

### 8.2 Volumen MVP (~250 URLs indexables)

| Bloque | Cantidad | Profundidad |
|---|---|---|
| Home | 1 | Hero + 8 bloques con datos reales |
| Hubs estructurales (/torneos/, /selecciones/, /jugadores/, /noticias/, /temas/) | 5 | Directorios listado |
| Torneo hub `/torneos/mundial/` | 1 | Evergreen completo |
| Edición `/torneos/mundial/2026/` | 1 | 12 grupos teaser + calendario + sedes preview |
| /grupos/ index + 12 grupos | 13 | Grupo D Premium; A-C/E-L Estándar |
| Calendario / Goleadores / Sedes | 3 | Estructura + datos llenos durante torneo |
| Knockout hubs (octavos, cuartos, semifinales, final) | 4 | Listas de partidos |
| Campeones | 1 | Palmarés histórico |
| Selecciones | 48 hubs (1 Premium + 3 Estándar + 44 Básicas) | Por nivel |
| Sub-páginas selección Ecuador | 7 (no cuentan hub) | Contenido editorial completo |
| Sub-páginas selecciones Estándar | 6 (3 selecciones × 2 sub-páginas: plantilla + partidos) | Datos básicos |
| Partidos individuales | 3 Premium + 21 Estándar + 80 Básicos = 104 | Por nivel |
| Jugadores | 30 perfiles (Ecuador) | Datos básicos en MVP |
| Artículos | ≥15 | Mezcla previas + análisis + historia La Tri |
| Temas/tags | 6-8 | Mundial 2026, Selección Ecuatoriana, La Tri Mundial, Beccacece, Caicedo, Grupo D |
| Institucionales | 4 | Acerca de, Contacto, Privacidad, Términos |
| **Total aproximado** | **~250 URLs** | |

### 8.3 Checklist pre-go-live

- [ ] 250+ URLs con title + meta + H1 únicos
- [ ] Schema valida en Rich Results Test para 8 templates principales
- [ ] `sitemap.xml` index + 5 sub-sitemaps generados y enviados a GSC
- [ ] `robots.txt` configurado, bots IA permitidos
- [ ] `llms.txt` publicado en raíz
- [ ] Lighthouse CI pasa CWV en 5 templates principales
- [ ] Search Console verificado (DNS) + sub-sitemaps enviados
- [ ] Bing Webmaster Tools verificado + IndexNow key configurada
- [ ] SSL via ACM + HSTS activo
- [ ] 301 de www → apex
- [ ] OG images generándose y validándose en Facebook Debugger + Twitter Card Validator
- [ ] GTM + GA4 activos con cookie consent gate
- [ ] Página 404 personalizada con links al home
- [ ] Manual de redactor: anchors preferidos por entidad (Grupo D + jugadores Ecuador)
- [ ] Backup del repo + branch protection en main

### 8.4 Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Backend CMS no listo el día del launch | Media | El front funciona 100% con mocks. Swap post-launch sin cambios en pages. |
| Volumen editorial no alcanza 36 días | Media-Alta | Premium + Estándar prioritarios. Las 44 Básicas son data-driven (script desde JSON FIFA). |
| CWV falla en hero pesado | Baja | Mockups ya optimizados. Tweaks panel desactivado en prod. |
| GTM rompe INP | Media | Carga post-mount + consent gate. Plan B Plausible (1 día migración) si falla. |
| Tráfico Mundial supera capacidad | Baja | CloudFront edge + ISR aguanta picos. Fallback prerender forzado. |
| Cambio de fixture/sorteo Mundial | Baja | JSON `2026.json` se actualiza, redeploy = 5min. |
| Errores en tabla de grupo durante torneo | Media | Webhook revalidate + manual override con secret. |

### 8.5 Métricas de éxito post-launch

3 meses post-Mundial:
- ≥ 30k sesiones orgánicas/mes durante el Mundial (jun-jul)
- ≥ 100 keywords en top 10 Google Ecuador para queries Mundial
- ≥ 5 artículos en featured snippet o People Also Ask
- CTR promedio SERP ≥ 3%
- Bounce rate < 60% en templates partido y selección

---

## 9. Roadmap post-launch

- **Fase 2A — Julio 2026 post-Mundial**: agregar templates LigaPro Serie A/B + Copa Ecuador + 7 clubes Premium con sub-páginas + jugadores Premium (~40).
- **Fase 2B — Agosto 2026**: integrar backend CMS real (swap server/api proxies via env vars). Image Handler en producción. IndexNow webhook automático.
- **Fase 2C — Sept-Oct 2026**: jugadores Estándar (~100). Jornadas individuales LigaPro. Páginas históricas equipos club.
- **Fase 3 — 2027**: hreflang inglés (`/en/`). Entrenadores. Expansión a Copa América 2027 (template Mundial reusable).

---

## 10. Decisiones pendientes para fase de implementación

Estas no bloquean la spec; se resuelven durante el plan de implementación:

1. **Endpoint Image Handler URL**: requiere infraestructura AWS lista. MVP usa provider `ipx` por defecto.
2. **Detalle de fonts self-hosted**: WOFF2 buffers + `font-display` strategy fina. Decisión: dev S1.
3. **Cookie banner copy + categorías**: necesario antes del launch. Decisión: editorial S4.
4. **Cobertura selecciones Estándar (Inglaterra/C.Marfil/Uzbekistán)**: cuántas sub-páginas más allá de hub+plantilla+partidos. Decisión: editorial S2.
5. **Manual de anchors por entidad**: lista canónica + variantes aceptadas. Decisión: editorial S5.
6. **Estrategia de imágenes editoriales**: stock comprado vs generadas vs free Wikipedia/Wikimedia. Decisión: editorial S1.
7. **Política de comentarios y moderación**: si se activa post-Mundial. Decisión: producto Fase 2.

---

## 11. Glosario

- **ATF** (Above The Fold): contenido visible sin scroll.
- **CLS** (Cumulative Layout Shift): métrica CWV de estabilidad visual.
- **CWV** (Core Web Vitals): métricas de UX medidas por Google.
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trustworthiness.
- **H2H** (Head-to-Head): historial de enfrentamientos entre dos entidades.
- **INP** (Interaction to Next Paint): métrica CWV de responsividad.
- **ISR** (Incremental Static Regeneration): regeneración estática en intervalos.
- **LCP** (Largest Contentful Paint): tiempo al contenido principal.
- **SSG** (Static Site Generation): pre-rendering al build.
- **SSR** (Server-Side Rendering): rendering por request.
- **TTFB** (Time To First Byte): velocidad de servidor.

---

## 12. Referencias

- Spec SEO maestra: `Golgana front/2026-04-23-golgana-seo-architecture-design.md`
- Manual de marca: `Golgana front/manual-de-marca-v2.md`
- Mockups bundle: 11 HTML + `golgana-pro.css` + components (extraído del diseño compartido 2026-04-29)
- Polla Mundialista (módulo paralelo): `polla.golgana.net`, lanza 2026-05-28
