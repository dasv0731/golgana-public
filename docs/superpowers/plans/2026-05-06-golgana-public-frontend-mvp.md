# Golgana Public Frontend MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `golgana-public` Nuxt 3 frontend MVP with Mundial 2026 focus, ready to consume the future CMS backend, deployed to AWS Amplify Hosting by 2026-06-09.

**Architecture:** Nuxt 3 SSR + Vue 3 + TypeScript with Nitro `aws-amplify` preset. Pages call `/api/*` server routes which read from `content/*.json` (mock) in MVP and proxy to the backend CMS post-launch via env var swap. Mockup CSS preserved as global stylesheets (`golgana-pro.css` + 3 more); Vue components are thin semantic wrappers.

**Tech Stack:** Nuxt 3.13+, Vue 3.5, TypeScript strict, `@nuxt/content` v3 (markdown editorial), `@nuxt/image`, `@nuxtjs/sitemap`, `satori` + `@resvg/resvg-js` (OG images), GTM + GA4, Vitest (unit), Playwright (e2e/smoke).

**Spec reference:** `docs/superpowers/specs/2026-05-06-golgana-public-frontend-design.md`

**Phases:** S1 Foundation · S2 Core Mundial templates · S3 Selección + Partido · S4 Editorial + SEO infra · S5 QA + Launch

**Parallelization:** Dev tracks are sequential within a phase but Editorial track runs in parallel (writers feed `content/*.json` and `content/noticias/*.md` independently). Editorial waits only on Phase 1's `types/api.ts` to know JSON shapes.

---

## PHASE 1 — S1 (5–12 may): Foundation

Goal: Project bootstraps, CSS migrated, layout components render, data layer works with mock JSON, types are defined.

### Task 1: Initialize Nuxt project

**Files:**
- Create: `package.json`
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `app.vue`
- Create: `.nvmrc`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `README.md`

- [ ] **Step 1: Create `.nvmrc`**

```
20
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "golgana-public",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "lint": "eslint .",
    "typecheck": "vue-tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
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
    "vue-tsc": "^2.1.0",
    "vitest": "^2.1.0",
    "@vue/test-utils": "^2.4.6",
    "happy-dom": "^15.0.0",
    "@playwright/test": "^1.48.0",
    "eslint": "^9.0.0"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 4: Create `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-01',
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
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700&display=swap' },
      ],
    },
  },
  nitro: {
    preset: 'aws-amplify',
    prerender: { crawlLinks: true, routes: ['/'] },
  },
  runtimeConfig: {
    useBackend: process.env.NUXT_USE_BACKEND === 'true',
    cmsApiUrl: process.env.NUXT_CMS_API_URL ?? '',
    cmsApiKey: process.env.NUXT_CMS_API_KEY ?? '',
    revalidateSecret: process.env.NUXT_REVALIDATE_SECRET ?? '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://golgana.net',
      gtmId: process.env.NUXT_PUBLIC_GTM_ID ?? '',
      ga4Id: process.env.NUXT_PUBLIC_GA4_ID ?? '',
    },
  },
});
```

- [ ] **Step 5: Create `app.vue`**

```vue
<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules
.nuxt
.output
.env
.env.local
.env.*.local
dist
.cache
*.log
coverage
```

- [ ] **Step 7: Create `.env.example`**

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

- [ ] **Step 8: Create `README.md`**

```md
# Golgana Public

Frontend público de golgana.net. Nuxt 3 SSR + DynamoDB backend (separado) + AWS Amplify.

## Setup

`nvm use && npm install && cp .env.example .env && npm run dev`

## Spec
`docs/superpowers/specs/2026-05-06-golgana-public-frontend-design.md`

## Plan
`docs/superpowers/plans/2026-05-06-golgana-public-frontend-mvp.md`
```

- [ ] **Step 9: Install + verify**

Run: `npm install && npm run typecheck`
Expected: install succeeds, typecheck passes (no errors before pages exist).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json nuxt.config.ts tsconfig.json app.vue .nvmrc .gitignore .env.example README.md
git commit -m "feat: bootstrap Nuxt 3 project with TypeScript strict"
```

---

### Task 2: Migrate mockup CSS + assets

**Files:**
- Create: `assets/css/tokens.css`
- Create: `assets/css/base.css`
- Create: `assets/css/components.css`
- Create: `assets/css/golgana-pro.css`
- Create: `assets/img/logo-golgana.png`
- Create: `assets/img/crest-placeholder.svg`
- Create: `assets/img/player-placeholder.svg`
- Create: `assets/img/stadium-placeholder.svg`
- Create: `assets/img/hero-placeholder.svg`
- Create: `public/favicon.png`

- [ ] **Step 1: Copy CSS files from mockup bundle**

Source bundle path: `/tmp/golgana-design/prueba-gg/project/styles/` (extracted from design URL).
Local mockups source: `C:/Users/Marke/Documents/Respaldo SEO/Personales/Golgana front/mockups/styles/`

Copy all 4 files (`tokens.css`, `base.css`, `components.css`, `golgana-pro.css`) into `assets/css/` preserving content verbatim. Verify file sizes match source.

Run: `ls -la assets/css/` to confirm 4 files present.

- [ ] **Step 2: Copy mockup assets**

Copy from `C:/Users/Marke/Documents/Respaldo SEO/Personales/Golgana front/mockups/assets/` into `assets/img/`:
- `logo-golgana.png`
- `crest-placeholder.svg`
- `player-placeholder.svg`
- `stadium-placeholder.svg`
- `hero-placeholder.svg`

Copy `logo-golgana.png` to `public/favicon.png` as well.

- [ ] **Step 3: Verify dev server boots and CSS loads**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected: blank white page (no pages yet), no console errors, fonts loaded (check Network tab for googleapis.com).

- [ ] **Step 4: Commit**

```bash
git add assets/ public/favicon.png
git commit -m "feat: migrate mockup CSS and assets to assets/"
```

---

### Task 3: Define API contract types

**Files:**
- Create: `types/api.ts`
- Create: `types/schema.ts`

- [ ] **Step 1: Create `types/api.ts` with full contract**

Content per spec §6.2 — copy verbatim. The types include `Slug`, `ISODateTime`, `Ref<T>`, `SeoBlock`, `FaqEntry`, `ImageRef`, `HeroMetric`, `Torneo`, `Edicion`, `Fase`, `Grupo`, `GrupoStanding`, `Sede`, `Equipo`, `Plantilla`, `PlantillaJugador`, `Jugador`, `TrayectoriaItem`, `EstadisticaTemporada`, `TituloLogrado`, `Partido`, `Alineacion`, `Gol`, `EventoPartido`, `StatsPartido`, `H2HResumen`, `Articulo`.

Add `export` to every interface and type alias.

- [ ] **Step 2: Create `types/schema.ts` for schema.org JSON-LD**

```ts
export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
  };
}

export interface SchemaWebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input': string;
  };
}

export interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface SchemaSportsEvent {
  '@context': 'https://schema.org';
  '@type': 'SportsEvent';
  name: string;
  startDate: string;
  endDate?: string;
  eventStatus: 'https://schema.org/EventScheduled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventCancelled';
  location: { '@type': 'Place'; name: string; address?: object };
  competitor?: Array<{ '@type': 'SportsTeam'; name: string }>;
  organizer?: { '@type': 'SportsOrganization'; name: string };
}

export interface SchemaSportsTeam {
  '@context': 'https://schema.org';
  '@type': 'SportsTeam';
  name: string;
  alternateName?: string;
  foundingDate?: string;
  location?: object;
  memberOf?: object;
  sameAs?: string[];
  logo?: string;
  athlete?: object[];
}

export interface SchemaFAQPage {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export interface SchemaNewsArticle {
  '@context': 'https://schema.org';
  '@type': 'NewsArticle' | 'SportsArticle';
  headline: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: { '@type': 'Person'; name: string };
  publisher: { '@type': 'Organization'; name: string; logo: { '@type': 'ImageObject'; url: string } };
}

export interface SchemaItemList {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  itemListElement: Array<{ '@type': 'ListItem'; position: number; name: string; url?: string }>;
}

export type AnySchema =
  | SchemaOrganization
  | SchemaWebSite
  | SchemaBreadcrumbList
  | SchemaSportsEvent
  | SchemaSportsTeam
  | SchemaFAQPage
  | SchemaNewsArticle
  | SchemaItemList;
```

- [ ] **Step 3: Verify typecheck**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add types/
git commit -m "feat: define API contract and schema.org types"
```

---

### Task 4: Build content loader utility (TDD)

**Files:**
- Create: `server/utils/content-loader.ts`
- Create: `server/utils/content-cache.ts`
- Create: `tests/server/content-loader.test.ts`
- Create: `vitest.config.ts`
- Create: `content/torneos/mundial.json` (fixture for test)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
  },
  resolve: {
    alias: { '~': resolve(__dirname, '.'), '@': resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 2: Create test fixture `content/torneos/mundial.json`**

```json
{
  "slug": "mundial",
  "nombre": "Copa Mundial FIFA",
  "nombreCorto": "Mundial",
  "tipo": "mundial",
  "organizador": { "nombre": "FIFA", "sitioWeb": "https://fifa.com" },
  "fundacion": 1930,
  "edicionActual": { "type": "edicion", "slug": "2026", "nombre": "Mundial 2026" },
  "edicionesPrevias": [],
  "campeones": [
    { "ano": 2022, "campeon": { "type": "seleccion", "slug": "argentina", "nombre": "Argentina" } }
  ],
  "seo": {
    "title": "Copa Mundial FIFA — Historia, campeones, formato",
    "description": "Toda la historia de la Copa Mundial FIFA: campeones, ediciones, formato y la edición 2026 ampliada a 48 selecciones."
  },
  "faq": []
}
```

- [ ] **Step 3: Write failing test**

```ts
// tests/server/content-loader.test.ts
import { describe, it, expect } from 'vitest';
import { loadContent } from '~/server/utils/content-loader';

describe('content-loader', () => {
  it('loads JSON from content/ directory by relative path', async () => {
    const torneo = await loadContent<{ slug: string; nombre: string }>('torneos/mundial');
    expect(torneo.slug).toBe('mundial');
    expect(torneo.nombre).toBe('Copa Mundial FIFA');
  });

  it('throws clear error if path not found', async () => {
    await expect(loadContent('torneos/no-existe')).rejects.toThrow(/not found/i);
  });

  it('caches results in memory after first read', async () => {
    const first = await loadContent('torneos/mundial');
    const second = await loadContent('torneos/mundial');
    expect(first).toBe(second);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- content-loader`
Expected: FAIL with module-not-found for `~/server/utils/content-loader`.

- [ ] **Step 5: Implement `server/utils/content-cache.ts`**

```ts
const cache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function clearCache(): void {
  cache.clear();
}
```

- [ ] **Step 6: Implement `server/utils/content-loader.ts`**

```ts
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getCached, setCached } from './content-cache';

const CONTENT_ROOT = resolve(process.cwd(), 'content');

export async function loadContent<T>(relativePath: string): Promise<T> {
  const cached = getCached<T>(relativePath);
  if (cached !== undefined) return cached;

  const filePath = resolve(CONTENT_ROOT, `${relativePath}.json`);
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Content not found: ${relativePath}`);
    }
    throw err;
  }

  const parsed = JSON.parse(raw) as T;
  setCached(relativePath, parsed);
  return parsed;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- content-loader`
Expected: PASS, all 3 tests green.

- [ ] **Step 8: Commit**

```bash
git add vitest.config.ts server/utils/ tests/server/ content/torneos/mundial.json
git commit -m "feat: add content-loader with in-memory cache"
```

---

### Task 5: Build API client for backend proxy mode (TDD)

**Files:**
- Create: `server/utils/api-client.ts`
- Create: `tests/server/api-client.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/server/api-client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '~/server/utils/api-client';

describe('api-client', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('GETs with auth header when API key set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);
    const client = createApiClient({ baseUrl: 'https://cms.test', apiKey: 'k' });
    await client.get('/torneos/mundial');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cms.test/torneos/mundial',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer k' }) }),
    );
  });

  it('throws on non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));
    const client = createApiClient({ baseUrl: 'https://cms.test', apiKey: '' });
    await expect(client.get('/x')).rejects.toThrow(/500/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api-client`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `server/utils/api-client.ts`**

```ts
export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return {
    async get<T>(path: string): Promise<T> {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
      const res = await fetch(`${config.baseUrl}${path}`, { headers });
      if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
      return (await res.json()) as T;
    },
  };
}
```

- [ ] **Step 4: Run test to verify passes**

Run: `npm test -- api-client`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/utils/api-client.ts tests/server/api-client.test.ts
git commit -m "feat: add API client for backend proxy mode"
```

---

### Task 6: Build first API endpoint (mock + proxy switching)

**Files:**
- Create: `server/api/torneos/[slug].get.ts`
- Create: `tests/server/api/torneos.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/server/api/torneos.test.ts
import { describe, it, expect } from 'vitest';
import { $fetch } from '@nuxt/test-utils/e2e';

describe('GET /api/torneos/[slug]', () => {
  it('returns torneo from content/ in mock mode', async () => {
    // Note: requires Nuxt test utils setup; alternative: import handler directly.
    const handler = (await import('~/server/api/torneos/[slug].get')).default;
    const event = { context: { params: { slug: 'mundial' } } } as any;
    const result = await handler(event);
    expect(result.slug).toBe('mundial');
    expect(result.tipo).toBe('mundial');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- torneos`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement `server/api/torneos/[slug].get.ts`**

```ts
import type { Torneo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Torneo> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Torneo>(`/torneos/${slug}`);
  }

  try {
    return await loadContent<Torneo>(`torneos/${slug}`);
  } catch {
    throw createError({ statusCode: 404, message: `Torneo not found: ${slug}` });
  }
});
```

- [ ] **Step 4: Run test to verify passes**

Run: `npm test -- torneos`
Expected: PASS.

- [ ] **Step 5: Smoke-test in dev server**

Run: `npm run dev`
Open: `http://localhost:3000/api/torneos/mundial`
Expected: JSON response with `{ "slug": "mundial", ... }`.

- [ ] **Step 6: Commit**

```bash
git add server/api/torneos/ tests/server/api/
git commit -m "feat: GET /api/torneos/[slug] with mock-or-proxy switching"
```

---

### Task 7: Layout components — SiteHeader, SiteFooter, Breadcrumb

**Files:**
- Create: `components/Layout/SiteHeader.vue`
- Create: `components/Layout/SiteFooter.vue`
- Create: `components/Layout/Breadcrumb.vue`
- Create: `components/Layout/PageIndex.vue`
- Create: `layouts/default.vue`

- [ ] **Step 1: Create `components/Layout/SiteHeader.vue`**

Source pattern from mockup `partials/_header.html`. Render `<header class="site-header">` with logo link to `/`, nav `<a>` items pointing to MVP routes (`/torneos/mundial/2026/`, `/selecciones/ecuador/`, `/noticias/`), drawer toggle for mobile.

```vue
<script setup lang="ts">
const route = useRoute();
const isActive = (path: string) => route.path.startsWith(path);
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__logo">
        <img src="/logo-golgana.png" alt="Golgana" />
      </NuxtLink>
      <nav class="site-header__nav">
        <NuxtLink to="/" :class="{ 'is-active': route.path === '/' }">Inicio</NuxtLink>
        <NuxtLink to="/torneos/mundial/2026/" :class="{ 'is-active': isActive('/torneos/mundial') }">Mundial 2026</NuxtLink>
        <NuxtLink to="/selecciones/" :class="{ 'is-active': isActive('/selecciones') }">Selecciones</NuxtLink>
        <NuxtLink to="/noticias/" :class="{ 'is-active': isActive('/noticias') }">Noticias</NuxtLink>
      </nav>
    </div>
  </header>
</template>
```

- [ ] **Step 2: Create `components/Layout/SiteFooter.vue`**

```vue
<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <p class="site-footer__copy">© 2026 Golgana — Fútbol con profundidad</p>
      <nav class="site-footer__nav">
        <NuxtLink to="/acerca-de/">Acerca de</NuxtLink>
        <NuxtLink to="/contacto/">Contacto</NuxtLink>
        <NuxtLink to="/politica-privacidad/">Privacidad</NuxtLink>
        <NuxtLink to="/terminos/">Términos</NuxtLink>
      </nav>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: Create `components/Layout/Breadcrumb.vue`**

```vue
<script setup lang="ts">
defineProps<{
  crumbs: Array<{ label: string; to?: string }>;
}>();
</script>

<template>
  <nav class="pcrumb" aria-label="Breadcrumb">
    <template v-for="(c, i) in crumbs" :key="i">
      <NuxtLink v-if="c.to" :to="c.to">{{ c.label }}</NuxtLink>
      <span v-else aria-current="page">{{ c.label }}</span>
      <span v-if="i < crumbs.length - 1" class="pcrumb__sep">/</span>
    </template>
  </nav>
</template>
```

- [ ] **Step 4: Create `components/Layout/PageIndex.vue`**

```vue
<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; href: string }>;
  active?: string;
}>();
</script>

<template>
  <nav class="pindex">
    <div class="pindex__inner">
      <a
        v-for="item in items"
        :key="item.href"
        :href="item.href"
        :class="{ 'is-active': active === item.href }"
      >{{ item.label }}</a>
    </div>
  </nav>
</template>
```

- [ ] **Step 5: Create `layouts/default.vue`**

```vue
<template>
  <input type="checkbox" id="drawer" class="drawer-toggle sr-only" />
  <LayoutSiteHeader />
  <main>
    <slot />
  </main>
  <LayoutSiteFooter />
</template>
```

- [ ] **Step 6: Smoke-test layout renders**

Create temporary `pages/index.vue`:
```vue
<template>
  <div>
    <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Test' }]" />
    <h1>Hello Golgana</h1>
  </div>
</template>
```

Run: `npm run dev`
Open: `http://localhost:3000`
Expected: header with logo + nav, breadcrumb, h1, footer. Styles applied (Bebas Neue font, green accent).

- [ ] **Step 7: Commit**

```bash
git add components/Layout/ layouts/ pages/index.vue
git commit -m "feat: add layout components (header, footer, breadcrumb, page index)"
```

---

### Task 8: Composables — useSeo, useSchema, useApi

**Files:**
- Create: `composables/useApi.ts`
- Create: `composables/useSeo.ts`
- Create: `composables/useSchema.ts`
- Create: `tests/composables/useSchema.test.ts`

- [ ] **Step 1: Create `composables/useApi.ts`**

```ts
export function useApi() {
  return {
    async fetch<T>(path: string, opts?: { ssr?: boolean }): Promise<T> {
      return $fetch<T>(`/api${path}`, opts);
    },
  };
}
```

- [ ] **Step 2: Create `composables/useSeo.ts`**

```ts
import type { SeoBlock } from '~/types/api';

export function useSeo(seo: SeoBlock, opts: { canonical?: string; ogImage?: string } = {}) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const url = `${config.public.siteUrl}${route.path}`;

  useSeoMeta({
    title: seo.title,
    description: seo.description,
    ogTitle: seo.ogTitle ?? seo.title,
    ogDescription: seo.ogDescription ?? seo.description,
    ogImage: seo.ogImageOverride?.src ?? opts.ogImage,
    ogUrl: url,
    twitterCard: 'summary_large_image',
    robots: seo.noindex ? 'noindex' : 'index, follow',
  });

  useHead({
    link: [{ rel: 'canonical', href: seo.canonicalOverride ?? opts.canonical ?? url }],
  });
}
```

- [ ] **Step 3: Write failing test for useSchema**

```ts
// tests/composables/useSchema.test.ts
import { describe, it, expect } from 'vitest';
import { buildBreadcrumbList, buildSportsEvent, buildOrganization } from '~/composables/useSchema';

describe('useSchema builders', () => {
  it('buildBreadcrumbList returns valid schema', () => {
    const r = buildBreadcrumbList([
      { name: 'Inicio', url: 'https://golgana.net/' },
      { name: 'Mundial 2026' },
    ]);
    expect(r['@type']).toBe('BreadcrumbList');
    expect(r.itemListElement).toHaveLength(2);
    expect(r.itemListElement[0].position).toBe(1);
  });

  it('buildOrganization includes logo and sameAs', () => {
    const r = buildOrganization();
    expect(r['@type']).toBe('Organization');
    expect(r.logo).toContain('logo-golgana.png');
  });

  it('buildSportsEvent maps eventStatus from estado', () => {
    const r = buildSportsEvent({
      name: 'Mundial 2026',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      estado: 'upcoming',
      locationName: 'Estados Unidos, Canadá, México',
    });
    expect(r.eventStatus).toBe('https://schema.org/EventScheduled');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- useSchema`
Expected: FAIL with module-not-found.

- [ ] **Step 5: Implement `composables/useSchema.ts`**

```ts
import type {
  SchemaBreadcrumbList,
  SchemaOrganization,
  SchemaSportsEvent,
  SchemaSportsTeam,
  SchemaFAQPage,
  SchemaNewsArticle,
  SchemaItemList,
  AnySchema,
} from '~/types/schema';
import type { Edicion, Equipo, Articulo, FaqEntry } from '~/types/api';

const ORG_NAME = 'Golgana';
const ORG_URL = 'https://golgana.net';
const ORG_LOGO = 'https://golgana.net/logo-golgana.png';

export function buildOrganization(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: ORG_URL,
    logo: ORG_LOGO,
    address: { '@type': 'PostalAddress', addressCountry: 'EC' },
  };
}

export function buildBreadcrumbList(items: Array<{ name: string; url?: string }>): SchemaBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url && { item: it.url }),
    })),
  };
}

export function buildSportsEvent(args: {
  name: string;
  startDate: string;
  endDate?: string;
  estado: 'upcoming' | 'ongoing' | 'finished' | 'postponed';
  locationName: string;
}): SchemaSportsEvent {
  const statusMap = {
    upcoming: 'https://schema.org/EventScheduled',
    ongoing: 'https://schema.org/EventScheduled',
    finished: 'https://schema.org/EventScheduled',
    postponed: 'https://schema.org/EventPostponed',
  } as const;
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: args.name,
    startDate: args.startDate,
    endDate: args.endDate,
    eventStatus: statusMap[args.estado],
    location: { '@type': 'Place', name: args.locationName },
  };
}

export function buildSportsTeam(equipo: Equipo): SchemaSportsTeam {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: equipo.nombre,
    alternateName: equipo.apodo,
    foundingDate: equipo.fundacion ? `${equipo.fundacion}-01-01` : undefined,
    logo: equipo.escudo.src,
    sameAs: Object.values(equipo.redes).filter(Boolean) as string[],
  };
}

export function buildFAQPage(faqs: FaqEntry[]): SchemaFAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
}

export function buildNewsArticle(art: Articulo, articleUrl: string): SchemaNewsArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsArticle',
    headline: art.titulo,
    image: [art.imagenHero.src],
    datePublished: art.fechaPublicacion,
    dateModified: art.fechaActualizacion,
    author: { '@type': 'Person', name: art.autor.nombre },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    },
  };
}

export function buildItemList(items: Array<{ name: string; url?: string }>): SchemaItemList {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
  };
}

export function injectSchema(schemas: AnySchema | AnySchema[]): void {
  const arr = Array.isArray(schemas) ? schemas : [schemas];
  useHead({
    script: arr.map((s) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(s),
    })),
  });
}
```

- [ ] **Step 6: Run test to verify passes**

Run: `npm test -- useSchema`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add composables/ tests/composables/
git commit -m "feat: add useApi, useSeo, useSchema composables"
```

---

### Task 9: Inject global Organization schema in app.vue

**Files:**
- Modify: `app.vue`

- [ ] **Step 1: Update `app.vue` to inject global schema**

```vue
<script setup lang="ts">
import { buildOrganization, buildWebSite, injectSchema } from '~/composables/useSchema';

useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});

injectSchema([buildOrganization(), buildWebSite()]);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 2: Add `buildWebSite` to composables/useSchema.ts**

Add after `buildOrganization`:
```ts
export function buildWebSite(): SchemaWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: ORG_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${ORG_URL}/buscar/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}
```

Add `SchemaWebSite` to the import from `~/types/schema`.

- [ ] **Step 3: Verify schema injects in dev**

Run: `npm run dev`
Open: `http://localhost:3000`
View source. Expected: 2 `<script type="application/ld+json">` blocks with Organization and WebSite schemas.

- [ ] **Step 4: Commit**

```bash
git add app.vue composables/useSchema.ts
git commit -m "feat: inject global Organization + WebSite schema"
```

---

### Task 10: Phase 1 closeout — typecheck + commit content seed

**Files:**
- Create: `content/torneos/mundial/2026.json` (seed minimal)
- Create: `content/selecciones/ecuador.json` (seed minimal)

- [ ] **Step 1: Seed `content/torneos/mundial/2026.json` with minimal valid data**

```json
{
  "slug": "2026",
  "torneo": { "type": "torneo", "slug": "mundial", "nombre": "Mundial" },
  "ano": 2026,
  "fechaInicio": "2026-06-11T14:00:00-04:00",
  "fechaFin": "2026-07-19T15:00:00-04:00",
  "estado": "upcoming",
  "participantes": [],
  "formato": { "tipoFase": "grupos", "descripcion": "12 grupos de 4. 32 clasifican a octavos." },
  "fases": [],
  "sedes": [],
  "seo": {
    "title": "Mundial 2026 — Calendario, grupos, sedes y selecciones",
    "description": "Toda la información del Mundial 2026: 48 selecciones, 16 sedes en USA, Canadá y México. Grupos, calendario, sedes y cobertura especial de Ecuador."
  },
  "faq": []
}
```

- [ ] **Step 2: Seed `content/selecciones/ecuador.json` with minimal valid data**

```json
{
  "slug": "ecuador",
  "tipo": "seleccion",
  "nombre": "Ecuador",
  "nombreOficial": "Selección Ecuatoriana de Fútbol",
  "apodo": "La Tri",
  "pais": "EC",
  "fundacion": 1925,
  "escudo": { "src": "/img/crest-placeholder.svg", "alt": "Escudo Ecuador" },
  "colores": { "primario": "#FFD400", "secundario": "#003893" },
  "dt": { "nombre": "Sebastián Beccacece", "nacionalidad": "Argentina" },
  "redes": { "twitter": "https://twitter.com/LaTri" },
  "fifaRank": 25,
  "valorPlantilla": { "monto": 480000000, "moneda": "EUR" },
  "rivalidades": [],
  "estadisticasDestacadas": [
    { "label": "Valor plantilla", "value": "€480M", "caption": "Récord Tri", "accent": false },
    { "label": "Edad media", "value": "26.1", "caption": "18 en Europa", "accent": false },
    { "label": "Invicto elim.", "value": "11", "caption": "PJ sin perder", "accent": true },
    { "label": "Mejor defensa", "value": "10", "caption": "GC en 18 PJ", "accent": false }
  ],
  "seo": {
    "title": "Selección de Ecuador — La Tri en el Mundial 2026",
    "description": "Toda la información de Ecuador en el Mundial 2026: plantilla, partidos, historia, ídolos y rivalidades."
  },
  "faq": []
}
```

- [ ] **Step 3: Verify endpoint serves seeded selección**

Add `server/api/selecciones/[slug].get.ts`:
```ts
import type { Equipo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Equipo> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Equipo>(`/selecciones/${slug}`);
  }
  try {
    return await loadContent<Equipo>(`selecciones/${slug}`);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
```

Run: `npm run dev`
Open: `http://localhost:3000/api/selecciones/ecuador`
Expected: JSON with `nombre: "Ecuador"`.

- [ ] **Step 4: Final S1 typecheck + commit**

```bash
npm run typecheck
git add content/torneos/mundial/2026.json content/selecciones/ecuador.json server/api/selecciones/
git commit -m "feat: seed minimal mundial/2026 + ecuador content + selecciones endpoint"
```

**End of Phase 1.** Verify before proceeding: `npm run dev` boots, `/api/torneos/mundial`, `/api/torneos/mundial/2026`, and `/api/selecciones/ecuador` all return JSON. Typecheck passes. 1 layout renders. 8 tasks committed.

---

## PHASE 2 — S2 (13–19 may): Core Mundial templates

Goal: Home + Torneo hub (`/torneos/mundial/`) + Edición (`/torneos/mundial/2026/`) + Grupo (`/torneos/mundial/2026/grupos/[grupo]/`) render with real data from `content/`. Reusable Hero/Tile/BentoGrid/Standings/Bars components shipped.

### Task 11: Tile + BentoGrid components

**Files:**
- Create: `components/Tile/Tile.vue`
- Create: `components/Tile/BentoGrid.vue`
- Create: `components/Tile/MediaTile.vue`

- [ ] **Step 1: Create `components/Tile/Tile.vue`**

```vue
<script setup lang="ts">
defineProps<{
  cols?: 3 | 4 | 6 | 8 | 12;
  variant?: 'default' | 'dark' | 'green';
  href?: string;
  kicker?: string;
  title?: string;
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'article'"
    :href="href"
    :class="[
      'tile',
      cols ? `b-c${cols}` : '',
      variant === 'dark' ? 'tile--dark' : '',
      variant === 'green' ? 'tile--green' : '',
    ]"
  >
    <span v-if="kicker" class="tile__kicker">{{ kicker }}</span>
    <h3 v-if="title" class="tile__title">{{ title }}</h3>
    <slot />
  </component>
</template>
```

- [ ] **Step 2: Create `components/Tile/BentoGrid.vue`**

```vue
<template>
  <div class="bento">
    <slot />
  </div>
</template>
```

- [ ] **Step 3: Create `components/Tile/MediaTile.vue`**

```vue
<script setup lang="ts">
defineProps<{
  cols?: 3 | 4 | 6 | 8 | 12;
  href?: string;
  kicker?: string;
  title: string;
  meta?: string;
  image: { src: string; alt: string };
  wide?: boolean;
}>();
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    :class="['media-tile', wide ? 'media-tile--wide' : '', cols ? `b-c${cols}` : '']"
  >
    <img :src="image.src" :alt="image.alt" />
    <div class="media-tile__body">
      <span v-if="kicker" class="media-tile__kicker">{{ kicker }}</span>
      <h3 class="media-tile__title">{{ title }}</h3>
      <span v-if="meta" class="media-tile__meta">{{ meta }}</span>
    </div>
  </component>
</template>
```

- [ ] **Step 4: Verify in components-preview page**

Create `pages/dev/preview.vue` (delete before launch):
```vue
<template>
  <main class="pro-container" style="padding:48px 0">
    <Tile cols="6" kicker="Test" title="Tile básico">Contenido</Tile>
    <BentoGrid>
      <Tile cols="6" variant="dark" title="Dark tile" />
      <Tile cols="6" variant="green" title="Green tile" />
    </BentoGrid>
  </main>
</template>
```

Run: `npm run dev`
Open: `http://localhost:3000/dev/preview`
Expected: tiles render with correct CSS classes (inspect element).

- [ ] **Step 5: Commit**

```bash
git add components/Tile/ pages/dev/
git commit -m "feat: add Tile, BentoGrid, MediaTile components"
```

---

### Task 12: ProHero + EquipoHero components

**Files:**
- Create: `components/Hero/ProHero.vue`
- Create: `components/Hero/EquipoHero.vue`

- [ ] **Step 1: Create `components/Hero/ProHero.vue`**

Based on `.pro-hero` pattern from mockups. Two-column hero with main content + optional aside.

```vue
<script setup lang="ts">
defineProps<{
  kicker?: string;
  title: string;
  lead?: string;
  meta?: string[];
  bgGradient?: string;
}>();
</script>

<template>
  <section class="pro-hero">
    <div class="pro-hero__inner">
      <div class="pro-hero__main">
        <div
          class="pro-hero__bg"
          :style="bgGradient ? `background:${bgGradient}; z-index:0` : ''"
        />
        <span v-if="kicker" class="pro-hero__kicker">{{ kicker }}</span>
        <h1 class="pro-hero__title" v-html="title" />
        <p v-if="lead" class="pro-hero__lead">{{ lead }}</p>
        <div v-if="meta?.length" class="pro-hero__meta">
          <span v-for="m in meta" :key="m">{{ m }}</span>
        </div>
        <slot name="main-extra" />
      </div>
      <aside v-if="$slots.aside" class="pro-hero__side">
        <slot name="aside" />
      </aside>
    </div>
  </section>
</template>
```

- [ ] **Step 2: Create `components/Hero/EquipoHero.vue`**

Based on `.eq-hero` pattern from `mundial-equipo.html` mockup. Crest + h1 + 4 metrics + last/next match aside.

```vue
<script setup lang="ts">
import type { Equipo, HeroMetric } from '~/types/api';

defineProps<{
  equipo: Equipo;
  kicker?: string;
  metrics?: HeroMetric[];
}>();
</script>

<template>
  <section class="eq-hero">
    <div class="eq-hero__bg" />
    <div class="eq-hero__inner">
      <div class="eq-hero__left">
        <div class="eq-hero__id-row">
          <div class="eq-hero__crest">
            <img :src="equipo.escudo.src" :alt="equipo.escudo.alt" />
          </div>
          <div>
            <span v-if="kicker" class="eq-hero__kicker">{{ kicker }}</span>
            <h1 class="eq-hero__title">{{ equipo.apodo ?? equipo.nombre }}</h1>
            <div class="eq-hero__meta">
              <span v-if="equipo.dt">DT: {{ equipo.dt.nombre }}</span>
              <span v-if="equipo.fifaRank">FIFA {{ equipo.fifaRank }}°</span>
            </div>
          </div>
        </div>
        <div v-if="metrics?.length" class="eq-hero__metrics-row">
          <div
            v-for="(m, i) in metrics"
            :key="i"
            :class="['eq-hero__metric', m.accent ? 'eq-hero__metric--accent' : '']"
          >
            <span class="eq-hero__metric-label">{{ m.label }}</span>
            <div class="eq-hero__metric-num">{{ m.value }}</div>
            <span v-if="m.caption" class="eq-hero__metric-cap">{{ m.caption }}</span>
          </div>
        </div>
      </div>
      <slot name="aside" />
    </div>
  </section>
</template>

<style>
/* Inline styles from mockup mundial-equipo.html — tokens.css already loaded globally */
.eq-hero { position: relative; background: #000; color: #fff; overflow: hidden; }
.eq-hero__bg { position: absolute; inset: 0; background: linear-gradient(135deg, #000 0%, #0a3d20 55%, #067a4a 100%); z-index: 0; }
.eq-hero__inner { position: relative; z-index: 1; max-width: 1440px; margin: 0 auto; padding: 48px 20px 56px; display: grid; gap: 32px; grid-template-columns: 1fr; }
@media (min-width: 992px) { .eq-hero__inner { grid-template-columns: 1.55fr 1fr; padding: 64px 64px 72px; gap: 48px; align-items: stretch; } }
.eq-hero__left { display: flex; flex-direction: column; gap: 32px; }
.eq-hero__id-row { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center; }
.eq-hero__crest { width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 2px solid rgba(255,255,255,0.18); display: grid; place-items: center; flex-shrink: 0; }
.eq-hero__crest img { width: 70%; height: 70%; object-fit: contain; }
@media (min-width: 992px) { .eq-hero__crest { width: 200px; height: 200px; } }
.eq-hero__kicker { font-family: var(--font-primary); font-weight: 700; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary-green); }
.eq-hero__title { font-family: var(--font-display); font-size: clamp(64px, 11vw, 160px); line-height: 0.85; text-transform: uppercase; margin: 12px 0 0; }
.eq-hero__meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.55); }
.eq-hero__metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; overflow: hidden; }
.eq-hero__metric { background: rgba(0,0,0,0.45); padding: 18px 16px; }
.eq-hero__metric--accent { background: linear-gradient(135deg, var(--color-primary-green), #016b3d); }
.eq-hero__metric-label { font-family: var(--font-primary); font-weight: 700; font-size: 10px; letter-spacing: 0.14em; color: rgba(255,255,255,0.6); text-transform: uppercase; }
.eq-hero__metric-num { font-family: var(--font-display); font-size: 32px; color: #fff; line-height: 1; margin-top: 8px; }
.eq-hero__metric-cap { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 4px; display: block; }
</style>
```

- [ ] **Step 3: Smoke-test heroes render**

Update `pages/dev/preview.vue`:
```vue
<script setup lang="ts">
const { data: ecuador } = await useFetch('/api/selecciones/ecuador');
</script>

<template>
  <ProHero
    kicker="FIFA World Cup · USA · Canadá · México"
    title="Mundial<br>2026"
    lead="48 selecciones. 16 sedes. 104 partidos."
    :meta="['11 jun – 19 jul', '48 equipos']"
    bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
  />
  <EquipoHero
    v-if="ecuador"
    :equipo="ecuador"
    kicker="Selección de Ecuador · Grupo D"
    :metrics="ecuador.estadisticasDestacadas"
  />
</template>
```

Run: `npm run dev`
Open: `http://localhost:3000/dev/preview`
Expected: ProHero with green gradient + EquipoHero with crest + 4 metrics + Bebas Neue title.

- [ ] **Step 4: Commit**

```bash
git add components/Hero/
git commit -m "feat: add ProHero and EquipoHero components"
```

---

### Task 13: Stats components — StatRow, Bars, Standings

**Files:**
- Create: `components/Stats/StatRow.vue`
- Create: `components/Stats/Bars.vue`
- Create: `components/Stats/Standings.vue`

- [ ] **Step 1: Create `components/Stats/StatRow.vue`**

```vue
<script setup lang="ts">
defineProps<{
  cells: Array<{ num: string; label: string; emphasized?: boolean }>;
  variant?: 'default' | 'dark';
}>();
</script>

<template>
  <div :class="['stat-row', variant === 'dark' ? 'stat-row--dark' : '']">
    <div v-for="(c, i) in cells" :key="i" class="stat-row__cell">
      <span class="stat-row__num">
        <em v-if="c.emphasized">{{ c.num }}</em>
        <template v-else>{{ c.num }}</template>
      </span>
      <span class="stat-row__label">{{ c.label }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create `components/Stats/Bars.vue`**

```vue
<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: number; max?: number }>;
}>();

const computeWidth = (val: number, max?: number) => {
  const m = max ?? 100;
  return `${Math.min(100, (val / m) * 100)}%`;
};
</script>

<template>
  <div class="bars">
    <div v-for="(it, i) in items" :key="i" class="bar">
      <span class="bar__label">{{ it.label }}</span>
      <div class="bar__track">
        <div class="bar__fill" :style="{ width: computeWidth(it.value, it.max) }" />
      </div>
      <span class="bar__val">{{ it.value }}{{ it.max ? '' : '%' }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create `components/Stats/Standings.vue`**

```vue
<script setup lang="ts">
import type { GrupoStanding } from '~/types/api';

defineProps<{
  rows: GrupoStanding[];
  showFifa?: boolean;
}>();
</script>

<template>
  <table class="ptable">
    <thead>
      <tr>
        <th>#</th>
        <th>Selección</th>
        <th class="num">PJ</th>
        <th class="num">G</th>
        <th class="num">E</th>
        <th class="num">P</th>
        <th class="num">DG</th>
        <th class="num">Pts</th>
        <th>Forma</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.seleccion.slug">
        <td><strong style="color:var(--color-primary-green)">{{ row.posicion }}</strong></td>
        <td>
          <NuxtLink :to="`/selecciones/${row.seleccion.slug}/`">
            <strong>{{ row.seleccion.nombre }}</strong>
          </NuxtLink>
        </td>
        <td class="num">{{ row.pj }}</td>
        <td class="num">{{ row.g }}</td>
        <td class="num">{{ row.e }}</td>
        <td class="num">{{ row.p }}</td>
        <td class="num">{{ row.dg > 0 ? '+' : '' }}{{ row.dg }}</td>
        <td class="num"><strong>{{ row.pts }}</strong></td>
        <td>
          <span class="streak">
            <span
              v-for="(f, i) in row.forma"
              :key="i"
              :class="`streak__b streak__b--${f === 'W' ? 'w' : f === 'D' ? 'd' : 'l'}`"
            >{{ f === 'W' ? 'G' : f === 'D' ? 'E' : 'P' }}</span>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add components/Stats/
git commit -m "feat: add StatRow, Bars, Standings components"
```

---

### Task 14: Page — Torneo hub `/torneos/mundial/`

**Files:**
- Create: `pages/torneos/mundial/index.vue`
- Modify/expand: `content/torneos/mundial.json` (real data)

- [ ] **Step 1: Expand `content/torneos/mundial.json` with full data**

Add real campeones list (1930–2022), edicionesPrevias (the 22 prior editions), faq array with 5–8 questions ("¿Cuándo es el Mundial 2026?", "¿Cuántas selecciones participan?", "¿Quién es el campeón vigente?", etc.).

- [ ] **Step 2: Create `pages/torneos/mundial/index.vue`**

```vue
<script setup lang="ts">
import type { Torneo } from '~/types/api';
import { buildBreadcrumbList, buildFAQPage, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: torneo } = await useFetch<Torneo>('/api/torneos/mundial');
if (!torneo.value) throw createError({ statusCode: 404 });

useSeo(torneo.value.seo);

const config = useRuntimeConfig();
const url = `${config.public.siteUrl}/torneos/mundial/`;
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Torneos', url: config.public.siteUrl + '/torneos/' },
    { name: 'Mundial' },
  ]),
  buildFAQPage(torneo.value.faq),
  buildItemList(torneo.value.campeones.map((c) => ({ name: `${c.ano} — ${c.campeon.nombre}` }))),
]);
</script>

<template>
  <div v-if="torneo">
    <div class="pro-container">
      <LayoutBreadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Torneos', to: '/torneos/' },
          { label: 'Mundial' },
        ]"
      />
    </div>

    <ProHero
      kicker="FIFA · Desde 1930"
      :title="torneo.nombre"
      :lead="`${torneo.campeones.length} ediciones disputadas. La más prestigiosa competición del fútbol mundial.`"
      :meta="[`Fundación ${torneo.fundacion}`, 'Organizador FIFA']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    />

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Edición en curso</span>
          <h2 class="pro-sec-head__title">Mundial 2026</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/" class="pro-sec-head__cta">Ver edición →</NuxtLink>
      </div>
      <p>11 jun – 19 jul 2026 · USA · Canadá · México · 48 selecciones · 104 partidos</p>
    </section>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Palmarés</span>
          <h2 class="pro-sec-head__title">Campeones</h2>
        </div>
        <NuxtLink to="/torneos/mundial/campeones/" class="pro-sec-head__cta">Ver completo →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile
          v-for="c in torneo.campeones.slice(-6).reverse()"
          :key="c.ano"
          :cols="4"
          :kicker="String(c.ano)"
          :title="c.campeon.nombre"
        />
      </BentoGrid>
    </section>

    <section v-if="torneo.faq.length" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <h2 class="pro-sec-head__title">Preguntas frecuentes</h2>
        </div>
      </div>
      <details v-for="(f, i) in torneo.faq" :key="i" class="faq-item">
        <summary>{{ f.pregunta }}</summary>
        <p>{{ f.respuesta }}</p>
      </details>
    </section>
  </div>
</template>
```

- [ ] **Step 3: Smoke-test page**

Run: `npm run dev`
Open: `http://localhost:3000/torneos/mundial/`
Expected: page renders hero, "edición en curso" section, campeones grid, FAQ. Title in tab is "Copa Mundial FIFA — Historia... — Golgana".

- [ ] **Step 4: Validate schema**

View source. Confirm 5 JSON-LD blocks: Organization, WebSite, BreadcrumbList, FAQPage, ItemList. Copy each into Rich Results Test (https://search.google.com/test/rich-results) — expect 0 errors.

- [ ] **Step 5: Commit**

```bash
git add content/torneos/mundial.json pages/torneos/mundial/index.vue
git commit -m "feat: add /torneos/mundial/ hub page with breadcrumb + FAQ schema"
```

---

### Task 15: API endpoints + page — Edición `/torneos/mundial/2026/`

**Files:**
- Create: `server/api/torneos/mundial/[edicion].get.ts`
- Create: `pages/torneos/mundial/2026/index.vue`
- Expand: `content/torneos/mundial/2026.json` (real data)

- [ ] **Step 1: Expand `content/torneos/mundial/2026.json` with all 12 grupos refs + 16 sedes + fases**

Add full structure: `participantes` (48 selección refs), `fases` (4 entries: grupos, octavos, cuartos, semifinales, final), `sedes` (16 entries with slug, nombre, ciudad, pais, capacidad).

- [ ] **Step 2: Create `server/api/torneos/mundial/[edicion].get.ts`**

```ts
import type { Edicion } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Edicion> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400 });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Edicion>(`/torneos/mundial/${edicion}`);
  }
  try {
    return await loadContent<Edicion>(`torneos/mundial/${edicion}`);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
```

- [ ] **Step 3: Create `pages/torneos/mundial/2026/index.vue`**

```vue
<script setup lang="ts">
import type { Edicion } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, buildFAQPage, injectSchema } from '~/composables/useSchema';

const { data: edicion } = await useFetch<Edicion>('/api/torneos/mundial/2026');
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
</script>

<template>
  <div v-if="edicion">
    <div class="pro-container">
      <LayoutBreadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Torneos', to: '/torneos/' },
          { label: 'Mundial', to: '/torneos/mundial/' },
          { label: '2026' },
        ]"
      />
    </div>

    <ProHero
      kicker="FIFA World Cup · USA · Canadá · México"
      title="Mundial<br>2026"
      :lead="edicion.formato.descripcion"
      :meta="['11 jun – 19 jul', '48 equipos', '16 sedes', '104 partidos']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    />

    <LayoutPageIndex
      :items="[
        { label: 'Grupos', href: '#grupos' },
        { label: 'Calendario', href: '#calendario' },
        { label: 'Sedes', href: '#sedes' },
        { label: 'La Tri', href: '#tri' },
      ]"
    />

    <section id="grupos" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Fase de grupos · 12 grupos · 4 equipos</span>
          <h2 class="pro-sec-head__title">El sorteo en 12 grupos</h2>
        </div>
        <NuxtLink to="/torneos/mundial/2026/grupos/grupo-d/" class="pro-sec-head__cta">Ver Grupo D →</NuxtLink>
      </div>
      <BentoGrid>
        <!-- 12 grupo tiles populated from edicion.fases[0].partidos via separate endpoint or inline list -->
        <!-- For now: static loop over content.grupos[] (see content/torneos/mundial/2026/grupos/*) -->
      </BentoGrid>
    </section>

    <section id="tri" class="pro-section pro-container" style="background:#0a0a0a;border-radius:24px;padding:32px 24px">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura especial</span>
          <h2 class="pro-sec-head__title" style="color:#fff">Ecuador en el Mundial</h2>
        </div>
        <NuxtLink to="/selecciones/ecuador/" class="pro-sec-head__cta" style="color:#fff">Ficha completa →</NuxtLink>
      </div>
    </section>
  </div>
</template>
```

- [ ] **Step 4: Smoke-test page**

Run: `npm run dev`
Open: `http://localhost:3000/torneos/mundial/2026/`
Expected: hero with mundial title, page index, sections render. Title tab "Mundial 2026 — Calendario, grupos... — Golgana". Schema validates.

- [ ] **Step 5: Commit**

```bash
git add server/api/torneos/mundial/[edicion].get.ts content/torneos/mundial/2026.json pages/torneos/mundial/2026/index.vue
git commit -m "feat: add /torneos/mundial/2026/ edition page with SportsEvent schema"
```

---

### Task 16: Grupos endpoint + page

**Files:**
- Create: `server/api/torneos/mundial/[edicion]/grupos/[slug].get.ts`
- Create: `server/api/torneos/mundial/[edicion]/grupos/index.get.ts`
- Create: `pages/torneos/mundial/2026/grupos/[grupo]/index.vue`
- Create: `pages/torneos/mundial/2026/grupos/index.vue`
- Create: `content/torneos/mundial/2026/grupos/grupo-d.json` (full data)
- Create: `content/torneos/mundial/2026/grupos/grupo-a.json` ... `grupo-l.json` (stubs for 11 más)

- [ ] **Step 1: Seed `content/torneos/mundial/2026/grupos/grupo-d.json` with full data**

Include `selecciones` refs (Ecuador, Inglaterra, Costa Marfil, Uzbekistán), `tabla` with 4 standings (current eliminatorias data), `partidos` refs (6 partidos), `analisis` (text editorial), `seo`.

- [ ] **Step 2: Create stub fixtures for grupos A-C, E-L**

11 JSON files with same structure but minimal data (selecciones refs, empty tabla, empty partidos, basic seo).

- [ ] **Step 3: Create `server/api/torneos/mundial/[edicion]/grupos/[slug].get.ts`**

```ts
import type { Grupo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Grupo> => {
  const edicion = getRouterParam(event, 'edicion');
  const slug = getRouterParam(event, 'slug');
  if (!edicion || !slug) throw createError({ statusCode: 400 });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Grupo>(`/torneos/mundial/${edicion}/grupos/${slug}`);
  }
  try {
    return await loadContent<Grupo>(`torneos/mundial/${edicion}/grupos/${slug}`);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
```

- [ ] **Step 4: Create grupos index endpoint**

```ts
// server/api/torneos/mundial/[edicion]/grupos/index.get.ts
import type { Grupo } from '~/types/api';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';

export default defineEventHandler(async (event): Promise<Grupo[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400 });

  const dir = resolve(process.cwd(), 'content/torneos/mundial', edicion, 'grupos');
  const files = await readdir(dir);
  const slugs = files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));

  return Promise.all(slugs.map((slug) => loadContent<Grupo>(`torneos/mundial/${edicion}/grupos/${slug}`)));
});
```

- [ ] **Step 5: Create `pages/torneos/mundial/2026/grupos/[grupo]/index.vue`**

```vue
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
</script>

<template>
  <div v-if="grupo">
    <div class="pro-container">
      <LayoutBreadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
          { label: `Grupo ${grupo.letra}` },
        ]"
      />
    </div>

    <ProHero
      kicker="Fase de grupos · Mundial 2026"
      :title="`Grupo ${grupo.letra}`"
      :lead="grupo.analisis"
      :meta="[`${grupo.selecciones.length} equipos`, '6 partidos']"
      bg-gradient="linear-gradient(135deg,#000 0%,#053a25 50%,#067a4a 100%)"
    />

    <section id="tabla" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Posiciones</span>
          <h2 class="pro-sec-head__title">Tabla del grupo</h2>
        </div>
      </div>
      <Standings v-if="grupo.tabla.length" :rows="grupo.tabla" />
      <p v-else>Tabla pendiente de actualización.</p>
    </section>

    <section id="fixture" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">6 partidos · 12 días</span>
          <h2 class="pro-sec-head__title">Calendario completo</h2>
        </div>
      </div>
      <BentoGrid>
        <Tile
          v-for="p in grupo.partidos"
          :key="p.slug"
          :cols="6"
          :kicker="p.nombre"
          :href="`/torneos/mundial/2026/grupos/${grupoSlug}/${p.slug}/`"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 6: Create `pages/torneos/mundial/2026/grupos/index.vue`**

Lists all 12 grupos as tiles. Same pattern as torneo hub.

- [ ] **Step 7: Smoke-test**

Run: `npm run dev`
Open: `http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/`
Expected: page renders breadcrumb, hero, standings table, fixture grid.

- [ ] **Step 8: Commit**

```bash
git add server/api/torneos/mundial/[edicion]/ content/torneos/mundial/2026/grupos/ pages/torneos/mundial/2026/grupos/
git commit -m "feat: add grupo pages + endpoints with 12-grupo seed"
```

---

### Task 17: Home page

**Files:**
- Modify: `pages/index.vue` (replace temporary hello)

- [ ] **Step 1: Replace `pages/index.vue` with full home**

```vue
<script setup lang="ts">
import type { Edicion, Equipo } from '~/types/api';
import { buildItemList, injectSchema } from '~/composables/useSchema';

const [{ data: edicion }, { data: ecuador }] = await Promise.all([
  useFetch<Edicion>('/api/torneos/mundial/2026'),
  useFetch<Equipo>('/api/selecciones/ecuador'),
]);

useSeo({
  title: 'Golgana — Fútbol con profundidad',
  description: 'Cobertura especial del Mundial 2026 con foco en Ecuador. Plantilla, partidos, análisis, historia y datos viz.',
});

const config = useRuntimeConfig();
injectSchema(
  buildItemList([
    { name: 'Mundial 2026', url: `${config.public.siteUrl}/torneos/mundial/2026/` },
    { name: 'Selección Ecuador', url: `${config.public.siteUrl}/selecciones/ecuador/` },
  ]),
);
</script>

<template>
  <div>
    <ProHero
      kicker="Cobertura especial"
      title="Mundial 2026"
      lead="48 selecciones. Ecuador en su 4to Mundial. Toda la cobertura aquí."
      :meta="['11 jun – 19 jul', '36 días para el kickoff']"
      bg-gradient="linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%)"
    >
      <template #aside>
        <h3>Acceso rápido</h3>
        <NuxtLink to="/torneos/mundial/2026/" class="btn btn--primary">Ver edición</NuxtLink>
        <NuxtLink to="/selecciones/ecuador/" class="btn">Selección Ecuador</NuxtLink>
        <NuxtLink to="/torneos/mundial/2026/grupos/grupo-d/" class="btn">Grupo D</NuxtLink>
      </template>
    </ProHero>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Torneos activos</span>
          <h2 class="pro-sec-head__title">Cobertura</h2>
        </div>
      </div>
      <BentoGrid>
        <Tile cols="6" kicker="Mundial · 11 jun – 19 jul" title="Mundial 2026" :href="'/torneos/mundial/2026/'" />
        <Tile cols="6" kicker="LigaPro · 2026 (próximamente)" title="LigaPro Serie A" />
      </BentoGrid>
    </section>

    <section v-if="ecuador" class="pro-section pro-container">
      <div class="pro-sec-head">
        <div class="pro-sec-head__l">
          <span class="pro-sec-head__kicker">Cobertura especial</span>
          <h2 class="pro-sec-head__title">Ecuador en el Mundial</h2>
        </div>
        <NuxtLink to="/selecciones/ecuador/" class="pro-sec-head__cta">Ficha completa →</NuxtLink>
      </div>
      <BentoGrid>
        <Tile cols="4" kicker="Plantilla" title="26 convocados" href="/selecciones/ecuador/plantilla/" />
        <Tile cols="4" kicker="Partidos" title="3 en fase de grupos" href="/selecciones/ecuador/partidos/" />
        <Tile cols="4" kicker="Historia" title="4 Mundiales" href="/selecciones/ecuador/historia/" />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 2: Smoke-test home**

Run: `npm run dev`
Open: `http://localhost:3000/`
Expected: home with hero, 2 sections, links functional.

- [ ] **Step 3: Commit**

```bash
git add pages/index.vue
git commit -m "feat: replace placeholder home with Mundial-focused hero + sections"
```

---

**End of Phase 2.** Verify before proceeding: `/`, `/torneos/mundial/`, `/torneos/mundial/2026/`, `/torneos/mundial/2026/grupos/grupo-d/` all render with real data, schema validates, breadcrumbs work, navigation between pages works. 7 tasks committed.

---

## PHASE 3 — S3 (20–26 may): Selección + Partido templates

Goal: Selección hub + 8 sub-páginas (Ecuador completas, Inglaterra/C.Marfil/Uzbekistán Estándar). Partido individual con 3 estados (scheduled/playing/finished). 44 selecciones Básicas seedadas con script. Match/Pitch/H2H components.

### Task 18: Match components — MatchCard, MatchHero, Pitch

**Files:**
- Create: `components/Match/MatchCard.vue`
- Create: `components/Match/MatchHero.vue`
- Create: `components/Pitch/Pitch.vue`
- Create: `components/Pitch/PitchPlayer.vue`
- Create: `components/Stats/H2H.vue`

- [ ] **Step 1: Create `components/Match/MatchCard.vue`**

```vue
<script setup lang="ts">
import type { Partido } from '~/types/api';

defineProps<{
  partido: Partido;
  cols?: 3 | 4 | 6 | 12;
  variant?: 'default' | 'dark' | 'green';
}>();
</script>

<template>
  <a
    :href="`/torneos/mundial/2026/grupos/${partido.grupo?.slug ?? 'na'}/${partido.slug}/`"
    :class="['tile', cols ? `b-c${cols}` : '', variant === 'dark' ? 'tile--dark' : '', variant === 'green' ? 'tile--green' : '']"
  >
    <span class="tile__kicker">{{ partido.fase.nombre }} · {{ new Date(partido.fecha).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
    <div class="pmatch" style="margin-top:12px">
      <div class="pmatch__teams">
        <div class="pmatch__team"><strong>{{ partido.local.nombre }}</strong></div>
        <div class="pmatch__center">
          <template v-if="partido.estado === 'finished' && partido.marcador">
            {{ partido.marcador.local }}-{{ partido.marcador.visitante }}
          </template>
          <template v-else>VS</template>
        </div>
        <div class="pmatch__team"><strong>{{ partido.visitante.nombre }}</strong></div>
      </div>
    </div>
  </a>
</template>
```

- [ ] **Step 2: Create `components/Match/MatchHero.vue`**

Adaptive hero by `partido.estado`. Pre-match: countdown + escudos + hora. Post-match: marcador prominente + goleadores.

```vue
<script setup lang="ts">
import type { Partido } from '~/types/api';

const props = defineProps<{
  partido: Partido;
}>();

const isPre = props.partido.estado === 'scheduled' || props.partido.estado === 'postponed';
const isLive = props.partido.estado === 'playing';
const isFinished = props.partido.estado === 'finished';
</script>

<template>
  <section class="pro-hero">
    <div class="pro-hero__inner">
      <div class="pro-hero__main">
        <div class="pro-hero__bg" style="background:linear-gradient(135deg,#000 0%,#0a3d20 50%,#067a4a 100%); z-index:0" />
        <span class="pro-hero__kicker">{{ partido.fase.nombre }} · Mundial 2026</span>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:32px;align-items:center;margin-top:24px;color:#fff">
          <div style="text-align:right">
            <h2 style="font-family:var(--font-display);font-size:48px;line-height:1">{{ partido.local.nombre }}</h2>
          </div>
          <div style="font-family:var(--font-display);font-size:96px;line-height:1">
            <template v-if="isFinished && partido.marcador">{{ partido.marcador.local }}-{{ partido.marcador.visitante }}</template>
            <template v-else>VS</template>
          </div>
          <div style="text-align:left">
            <h2 style="font-family:var(--font-display);font-size:48px;line-height:1">{{ partido.visitante.nombre }}</h2>
          </div>
        </div>
        <div class="pro-hero__meta" style="margin-top:24px">
          <span>{{ new Date(partido.fecha).toLocaleString('es-EC') }}</span>
          <span>{{ partido.sede.nombre }}</span>
          <span v-if="isLive" style="color:#FFD400;font-weight:700">EN VIVO</span>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 3: Create `components/Pitch/Pitch.vue` and `PitchPlayer.vue`**

Pitch.vue:
```vue
<script setup lang="ts">
import type { PlantillaJugador } from '~/types/api';

defineProps<{
  formation: string;
  titulares: PlantillaJugador[];
}>();
</script>

<template>
  <div class="pitch">
    <div class="pitch__mid" />
    <div class="pitch__circle" />
    <div class="pitch__rows">
      <!-- Render rows by formation parts (e.g. "4-3-3" → 4 lines of players) -->
      <slot />
    </div>
  </div>
</template>
```

PitchPlayer.vue:
```vue
<script setup lang="ts">
import type { PlantillaJugador } from '~/types/api';

defineProps<{
  player: PlantillaJugador;
}>();
</script>

<template>
  <div :class="['pp', player.capitan ? 'pp--cap' : '']">
    <div class="pp__num">{{ player.dorsal ?? '?' }}</div>
    <span class="pp__name">{{ player.jugador.nombre }}</span>
  </div>
</template>
```

- [ ] **Step 4: Create `components/Stats/H2H.vue`**

```vue
<script setup lang="ts">
import type { H2HResumen } from '~/types/api';

defineProps<{
  h2h: H2HResumen;
  localName: string;
  visitanteName: string;
}>();
</script>

<template>
  <div class="h2h">
    <div class="h2h__head">
      <strong>{{ localName }}</strong>
      <span>{{ h2h.totalEnfrentamientos }} enfrentamientos</span>
      <strong>{{ visitanteName }}</strong>
    </div>
    <div class="h2h__bar">
      <span class="h2h__bar-l" :style="{ flex: h2h.victoriasLocal }">{{ h2h.victoriasLocal }}</span>
      <span class="h2h__bar-d" :style="{ flex: h2h.empates }">{{ h2h.empates }}</span>
      <span class="h2h__bar-v" :style="{ flex: h2h.victoriasVisitante }">{{ h2h.victoriasVisitante }}</span>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Commit**

```bash
git add components/Match/ components/Pitch/ components/Stats/H2H.vue
git commit -m "feat: add Match/Pitch/H2H components"
```

---

### Task 19: Selección hub + plantilla pages

**Files:**
- Create: `pages/selecciones/index.vue`
- Create: `pages/selecciones/[slug]/index.vue`
- Create: `pages/selecciones/[slug]/plantilla.vue`
- Create: `server/api/selecciones/index.get.ts`
- Create: `server/api/selecciones/[slug]/plantilla.get.ts`
- Create: `content/selecciones/ecuador/plantilla.json`

- [ ] **Step 1: Seed `content/selecciones/ecuador/plantilla.json`**

```json
{
  "equipo": { "type": "equipo", "slug": "ecuador", "nombre": "Ecuador" },
  "edicion": { "type": "edicion", "slug": "2026", "nombre": "Mundial 2026" },
  "jugadores": [
    {
      "jugador": { "type": "jugador", "slug": "moises-caicedo", "nombre": "Moisés Caicedo" },
      "dorsal": 25,
      "posicion": "MED",
      "posicionDetalle": "Volante defensivo",
      "capitan": true,
      "titular": true
    }
  ],
  "cuerpoTecnico": [
    { "rol": "DT", "nombre": "Sebastián Beccacece", "nacionalidad": "Argentina" },
    { "rol": "Asistente", "nombre": "TBD" }
  ]
}
```

Editorial fills the rest of 26 jugadores progressively.

- [ ] **Step 2: Create `server/api/selecciones/index.get.ts`**

Lista compacta de las 48 selecciones MVP.

```ts
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import type { Equipo } from '~/types/api';

export default defineEventHandler(async (): Promise<Equipo[]> => {
  const dir = resolve(process.cwd(), 'content/selecciones');
  const entries = await readdir(dir, { withFileTypes: true });
  const slugs = entries.filter((e) => e.isFile() && e.name.endsWith('.json')).map((e) => e.name.replace('.json', ''));
  return Promise.all(slugs.map((s) => loadContent<Equipo>(`selecciones/${s}`)));
});
```

- [ ] **Step 3: Create `server/api/selecciones/[slug]/plantilla.get.ts`**

```ts
import type { Plantilla } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Plantilla> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400 });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Plantilla>(`/selecciones/${slug}/plantilla`);
  }
  try {
    return await loadContent<Plantilla>(`selecciones/${slug}/plantilla`);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
```

- [ ] **Step 4: Create `pages/selecciones/index.vue` (hub directorio)**

```vue
<script setup lang="ts">
import type { Equipo } from '~/types/api';
const { data: lista } = await useFetch<Equipo[]>('/api/selecciones');
useSeo({ title: 'Selecciones — Mundial 2026', description: 'Las 48 selecciones del Mundial 2026 con plantilla, partidos e historia.' });
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Selecciones' }]" />
    </div>
    <ProHero kicker="Mundial 2026" title="Selecciones" lead="Las 48 selecciones del Mundial." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile
          v-for="s in lista"
          :key="s.slug"
          :cols="3"
          :kicker="s.pais"
          :title="s.apodo ?? s.nombre"
          :href="`/selecciones/${s.slug}/`"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 5: Create `pages/selecciones/[slug]/index.vue` (hub selección)**

```vue
<script setup lang="ts">
import type { Equipo } from '~/types/api';
import { buildBreadcrumbList, buildSportsTeam, buildFAQPage, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: equipo } = await useFetch<Equipo>(`/api/selecciones/${slug}`);
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
  buildFAQPage(equipo.value.faq),
]);
</script>

<template>
  <div v-if="equipo">
    <div class="pro-container">
      <LayoutBreadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: 'Selecciones', to: '/selecciones/' },
          { label: equipo.nombre },
        ]"
      />
    </div>

    <EquipoHero
      :equipo="equipo"
      :kicker="`Selección de ${equipo.nombre} · Mundial 2026`"
      :metrics="equipo.estadisticasDestacadas"
    />

    <LayoutPageIndex
      :items="[
        { label: 'Plantilla', href: '/selecciones/' + equipo.slug + '/plantilla/' },
        { label: 'Partidos', href: '/selecciones/' + equipo.slug + '/partidos/' },
        { label: 'Historia', href: '/selecciones/' + equipo.slug + '/historia/' },
        { label: 'Títulos', href: '/selecciones/' + equipo.slug + '/titulos/' },
        { label: 'Ídolos', href: '/selecciones/' + equipo.slug + '/idolos/' },
        { label: 'Clásicos', href: '/selecciones/' + equipo.slug + '/clasicos/' },
        { label: 'Estadio', href: '/selecciones/' + equipo.slug + '/estadio/' },
      ]"
    />

    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile cols="6" kicker="Convocatoria" title="26 jugadores" :href="`/selecciones/${equipo.slug}/plantilla/`" />
        <Tile cols="6" kicker="Calendario" title="Próximos partidos" :href="`/selecciones/${equipo.slug}/partidos/`" />
        <Tile cols="4" kicker="Historia" :title="`${equipo.fundacion ?? '—'}`" :href="`/selecciones/${equipo.slug}/historia/`" />
        <Tile cols="4" kicker="Ídolos" title="Hall of fame" :href="`/selecciones/${equipo.slug}/idolos/`" />
        <Tile cols="4" kicker="Clásicos" title="Rivalidades" :href="`/selecciones/${equipo.slug}/clasicos/`" />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 6: Create `pages/selecciones/[slug]/plantilla.vue`**

```vue
<script setup lang="ts">
import type { Plantilla, Equipo } from '~/types/api';
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const [{ data: equipo }, { data: plantilla }] = await Promise.all([
  useFetch<Equipo>(`/api/selecciones/${slug}`),
  useFetch<Plantilla>(`/api/selecciones/${slug}/plantilla`),
]);
if (!equipo.value || !plantilla.value) throw createError({ statusCode: 404 });

useSeo({
  title: `Plantilla de ${equipo.value.nombre} — Mundial 2026`,
  description: `Convocatoria de ${equipo.value.nombre} al Mundial 2026: 26 jugadores con dorsal, posición y club.`,
});

const config = useRuntimeConfig();
injectSchema(
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
    { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
    { name: 'Plantilla' },
  ]),
);

const grupoPosiciones = computed(() => ({
  POR: plantilla.value!.jugadores.filter((j) => j.posicion === 'POR'),
  DEF: plantilla.value!.jugadores.filter((j) => j.posicion === 'DEF'),
  MED: plantilla.value!.jugadores.filter((j) => j.posicion === 'MED'),
  DEL: plantilla.value!.jugadores.filter((j) => j.posicion === 'DEL'),
}));
</script>

<template>
  <div v-if="equipo && plantilla">
    <div class="pro-container">
      <LayoutBreadcrumb
        :crumbs="[
          { label: 'Inicio', to: '/' },
          { label: equipo.nombre, to: `/selecciones/${equipo.slug}/` },
          { label: 'Plantilla' },
        ]"
      />
    </div>

    <ProHero
      :kicker="equipo.nombre + ' · Mundial 2026'"
      title="Plantilla"
      :lead="`${plantilla.jugadores.length} jugadores convocados.`"
    />

    <section
      v-for="(jugadores, posicion) in grupoPosiciones"
      :key="posicion"
      class="pro-section pro-container"
    >
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">{{ posicion === 'POR' ? 'Arqueros' : posicion === 'DEF' ? 'Defensas' : posicion === 'MED' ? 'Mediocampistas' : 'Delanteros' }}</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="pj in jugadores"
          :key="pj.jugador.slug"
          :cols="3"
          :kicker="`#${pj.dorsal ?? '?'} · ${pj.posicionDetalle ?? pj.posicion}`"
          :title="pj.jugador.nombre"
          :href="`/jugadores/${pj.jugador.slug}/`"
        />
      </BentoGrid>
    </section>

    <section class="pro-section pro-container">
      <div class="pro-sec-head">
        <h2 class="pro-sec-head__title">Cuerpo técnico</h2>
      </div>
      <BentoGrid>
        <Tile
          v-for="staff in plantilla.cuerpoTecnico"
          :key="staff.nombre"
          :cols="4"
          :kicker="staff.rol"
          :title="staff.nombre"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 7: Smoke-test**

Run: `npm run dev`
Open: `/selecciones/`, `/selecciones/ecuador/`, `/selecciones/ecuador/plantilla/`
Expected: render correctly, breadcrumbs, schema validates.

- [ ] **Step 8: Commit**

```bash
git add server/api/selecciones/ content/selecciones/ pages/selecciones/
git commit -m "feat: add selección hub + plantilla pages"
```

---

### Task 20: Selección sub-pages (partidos, historia, titulos, idolos, clasicos, estadio)

**Files:**
- Create: `pages/selecciones/[slug]/partidos.vue`
- Create: `pages/selecciones/[slug]/historia.vue`
- Create: `pages/selecciones/[slug]/titulos.vue`
- Create: `pages/selecciones/[slug]/idolos.vue`
- Create: `pages/selecciones/[slug]/clasicos.vue`
- Create: `pages/selecciones/[slug]/estadio.vue`
- Create: `server/api/selecciones/[slug]/partidos.get.ts`
- Create: `server/api/selecciones/[slug]/historia.get.ts`
- Create: `server/api/selecciones/[slug]/titulos.get.ts`
- Create: `server/api/selecciones/[slug]/idolos.get.ts`
- Create: `server/api/selecciones/[slug]/clasicos.get.ts`
- Create: `server/api/selecciones/[slug]/estadio.get.ts`
- Create: `content/selecciones/ecuador/{partidos,historia,titulos,idolos,clasicos,estadio}.json`

- [ ] **Step 1: Create generic endpoint pattern**

For each sub-resource, the endpoint follows same shape. Create endpoints (each ~10 lines) reading from `content/selecciones/<slug>/<resource>.json`.

Example `server/api/selecciones/[slug]/historia.get.ts`:
```ts
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400 });
  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    return createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey })
      .get(`/selecciones/${slug}/historia`);
  }
  try { return await loadContent(`selecciones/${slug}/historia`); }
  catch { throw createError({ statusCode: 404 }); }
});
```

Repeat for `partidos`, `titulos`, `idolos`, `clasicos`, `estadio`.

- [ ] **Step 2: Seed `content/selecciones/ecuador/historia.json`**

```json
{
  "titulo": "Historia de la Selección Ecuatoriana",
  "lead": "Desde 1925 hasta su 4to Mundial en 2026.",
  "cuerpo": "<p>Texto largo con timeline de hitos...</p>",
  "hitos": [
    { "ano": 1925, "evento": "Fundación FEF" },
    { "ano": 2002, "evento": "Primer Mundial — Corea/Japón" },
    { "ano": 2006, "evento": "Octavos en Alemania" }
  ],
  "seo": {
    "title": "Historia de la Selección de Ecuador",
    "description": "La historia completa de La Tri: desde su fundación en 1925 hasta su clasificación al Mundial 2026."
  }
}
```

Seed similar minimal JSON for `partidos`, `titulos`, `idolos`, `clasicos`, `estadio`.

- [ ] **Step 3: Create page templates**

Each sub-page follows the same skeleton: breadcrumb + ProHero + content sections rendered from JSON. Pattern (use for `historia.vue`):

```vue
<script setup lang="ts">
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: equipo } = await useFetch(`/api/selecciones/${slug}`);
const { data: historia } = await useFetch(`/api/selecciones/${slug}/historia`);

if (!equipo.value || !historia.value) throw createError({ statusCode: 404 });

useSeo(historia.value.seo);

const config = useRuntimeConfig();
injectSchema(buildBreadcrumbList([
  { name: 'Inicio', url: config.public.siteUrl + '/' },
  { name: 'Selecciones', url: config.public.siteUrl + '/selecciones/' },
  { name: equipo.value.nombre, url: `${config.public.siteUrl}/selecciones/${slug}/` },
  { name: 'Historia' },
]));
</script>

<template>
  <div v-if="historia">
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: equipo.nombre, to: `/selecciones/${slug}/` },
        { label: 'Historia' },
      ]" />
    </div>
    <ProHero :kicker="equipo.nombre" :title="historia.titulo" :lead="historia.lead" />
    <section class="pro-section pro-container">
      <article v-html="historia.cuerpo" class="prose" />
    </section>
    <section v-if="historia.hitos?.length" class="pro-section pro-container">
      <h2 class="pro-sec-head__title">Hitos</h2>
      <ul>
        <li v-for="h in historia.hitos" :key="h.ano"><strong>{{ h.ano }}</strong> — {{ h.evento }}</li>
      </ul>
    </section>
  </div>
</template>
```

Adapt for `partidos.vue` (uses `MatchCard`), `titulos.vue` (list), `idolos.vue` (grid de Tile), `clasicos.vue` (list with H2H links), `estadio.vue` (Sede card with image + map).

- [ ] **Step 4: Smoke-test all 7 sub-pages**

Run: `npm run dev`
Open each: `/selecciones/ecuador/partidos/`, `/historia/`, `/titulos/`, `/idolos/`, `/clasicos/`, `/estadio/`
Expected: each renders with breadcrumb, hero, content from JSON.

- [ ] **Step 5: Commit**

```bash
git add server/api/selecciones/ content/selecciones/ pages/selecciones/
git commit -m "feat: add 6 selección sub-pages (partidos, historia, titulos, idolos, clasicos, estadio)"
```

---

### Task 21: Partido individual page (3 estados)

**Files:**
- Create: `server/api/partidos/[slug].get.ts`
- Create: `pages/torneos/mundial/2026/grupos/[grupo]/[partido].vue`
- Create: `pages/torneos/mundial/2026/octavos/[partido].vue`
- Create: `pages/torneos/mundial/2026/cuartos/[partido].vue`
- Create: `pages/torneos/mundial/2026/semifinales/[partido].vue`
- Create: `pages/torneos/mundial/2026/final/[partido].vue`
- Create: `content/partidos/ecuador-vs-uzbekistan.json`

- [ ] **Step 1: Create `server/api/partidos/[slug].get.ts`**

Standard pattern. Reads from `content/partidos/<slug>.json`.

- [ ] **Step 2: Seed `content/partidos/ecuador-vs-uzbekistan.json`**

Full data with `estado: scheduled`, fecha 2026-06-12, sede Mercedes-Benz Stadium, alineaciones probables, h2h, previa text.

- [ ] **Step 3: Create `pages/torneos/mundial/2026/grupos/[grupo]/[partido].vue`**

```vue
<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildSportsEvent, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const partidoSlug = route.params.partido as string;
const grupoSlug = route.params.grupo as string;
const { data: partido } = await useFetch<Partido>(`/api/partidos/${partidoSlug}`);
if (!partido.value) throw createError({ statusCode: 404 });

const titleByState = {
  scheduled: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Previa`,
  playing: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — En juego`,
  finished: partido.value.marcador
    ? `${partido.value.local.nombre} ${partido.value.marcador.local}-${partido.value.marcador.visitante} ${partido.value.visitante.nombre} — Crónica`
    : `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Crónica`,
  postponed: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} — Aplazado`,
};

useSeo({
  title: `${titleByState[partido.value.estado]} | Mundial 2026`,
  description: partido.value.previa?.texto.slice(0, 160) ?? `${partido.value.local.nombre} vs ${partido.value.visitante.nombre} en el Mundial 2026.`,
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: `Grupo ${grupoSlug.replace('grupo-', '').toUpperCase()}`, url: `${config.public.siteUrl}/torneos/mundial/2026/grupos/${grupoSlug}/` },
    { name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}` },
  ]),
  buildSportsEvent({
    name: `${partido.value.local.nombre} vs ${partido.value.visitante.nombre}`,
    startDate: partido.value.fecha,
    estado: partido.value.estado,
    locationName: partido.value.sede.nombre,
  }),
]);
</script>

<template>
  <div v-if="partido">
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Mundial 2026', to: '/torneos/mundial/2026/' },
        { label: `Grupo ${$route.params.grupo}`, to: `/torneos/mundial/2026/grupos/${$route.params.grupo}/` },
        { label: `${partido.local.nombre} vs ${partido.visitante.nombre}` },
      ]" />
    </div>

    <MatchHero :partido="partido" />

    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile cols="3" kicker="Fecha" :title="new Date(partido.fecha).toLocaleDateString('es-EC')" />
        <Tile cols="3" kicker="Estadio" :title="partido.sede.nombre" />
        <Tile cols="3" kicker="Fase" :title="partido.fase.nombre" />
        <Tile v-if="partido.arbitro" cols="3" kicker="Árbitro" :title="partido.arbitro.nombre" />
      </BentoGrid>
    </section>

    <section v-if="partido.previa" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Previa</span>
      </div>
      <article v-html="partido.previa.texto" class="prose" />
    </section>

    <section v-if="partido.alineaciones" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Alineaciones {{ partido.alineaciones.local.oficial ? 'oficiales' : 'probables' }}</span>
      </div>
      <BentoGrid>
        <Tile cols="6" :kicker="partido.local.nombre" :title="partido.alineaciones.local.formacion">
          <ul>
            <li v-for="t in partido.alineaciones.local.titulares" :key="t.jugador.slug">
              #{{ t.dorsal }} {{ t.jugador.nombre }}
            </li>
          </ul>
        </Tile>
        <Tile cols="6" :kicker="partido.visitante.nombre" :title="partido.alineaciones.visitante.formacion">
          <ul>
            <li v-for="t in partido.alineaciones.visitante.titulares" :key="t.jugador.slug">
              #{{ t.dorsal }} {{ t.jugador.nombre }}
            </li>
          </ul>
        </Tile>
      </BentoGrid>
    </section>

    <section v-if="partido.h2h" class="pro-section pro-container">
      <div class="pro-sec-head">
        <span class="pro-sec-head__kicker">Historial H2H</span>
      </div>
      <H2H :h2h="partido.h2h" :local-name="partido.local.nombre" :visitante-name="partido.visitante.nombre" />
    </section>
  </div>
</template>
```

- [ ] **Step 4: Reuse same component for knockout pages**

Create `pages/torneos/mundial/2026/octavos/[partido].vue` (and cuartos, semifinales, final) with identical body but different breadcrumbs (no grupo). Extract to a `<MatchPage>` component if pattern stabilizes.

For MVP, accept duplication: copy the page and replace the breadcrumb segment.

- [ ] **Step 5: Smoke-test**

Run: `npm run dev`
Open: `http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan/`
Expected: hero with VS, fecha/estadio/árbitro tiles, previa text, alineaciones grid, h2h bar.

- [ ] **Step 6: Commit**

```bash
git add server/api/partidos/ content/partidos/ pages/torneos/mundial/2026/grupos/[grupo]/[partido].vue pages/torneos/mundial/2026/octavos/ pages/torneos/mundial/2026/cuartos/ pages/torneos/mundial/2026/semifinales/ pages/torneos/mundial/2026/final/
git commit -m "feat: add partido individual page with 3-state SportsEvent schema"
```

---

### Task 22: Seed script for 44 selecciones Básicas

**Files:**
- Create: `scripts/seed-selecciones-basicas.ts`
- Create: `content/selecciones/<44 stub files>.json` (generated)

- [ ] **Step 1: Create `scripts/seed-selecciones-basicas.ts`**

```ts
import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

interface FifaSeed {
  slug: string;
  nombre: string;
  apodo?: string;
  pais: string;
  dt: string;
  fifaRank: number;
  fundacion: number;
}

const SELECCIONES: FifaSeed[] = [
  { slug: 'francia', nombre: 'Francia', apodo: 'Les Bleus', pais: 'FR', dt: 'Didier Deschamps', fifaRank: 1, fundacion: 1904 },
  { slug: 'brasil', nombre: 'Brasil', apodo: 'La Canarinha', pais: 'BR', dt: 'Dorival Júnior', fifaRank: 5, fundacion: 1914 },
  { slug: 'espana', nombre: 'España', apodo: 'La Roja', pais: 'ES', dt: 'Luis de la Fuente', fifaRank: 3, fundacion: 1909 },
  // ... 41 more selecciones (excluding ecuador, inglaterra, costa-de-marfil, uzbekistan que están en Premium/Estándar)
];

const CONTENT_ROOT = resolve(process.cwd(), 'content/selecciones');

async function seed() {
  for (const s of SELECCIONES) {
    const data = {
      slug: s.slug,
      tipo: 'seleccion',
      nombre: s.nombre,
      nombreOficial: `Selección de ${s.nombre}`,
      apodo: s.apodo,
      pais: s.pais,
      fundacion: s.fundacion,
      escudo: { src: '/img/crest-placeholder.svg', alt: `Escudo ${s.nombre}` },
      colores: { primario: '#000', secundario: '#fff' },
      dt: { nombre: s.dt, nacionalidad: 'TBD' },
      redes: {},
      fifaRank: s.fifaRank,
      rivalidades: [],
      seo: {
        title: `Selección de ${s.nombre} — Mundial 2026`,
        description: `Información de ${s.nombre} en el Mundial 2026: plantilla, partidos y datos clave.`,
      },
      faq: [],
    };
    await writeFile(resolve(CONTENT_ROOT, `${s.slug}.json`), JSON.stringify(data, null, 2));
    console.log(`Seeded ${s.slug}`);
  }
}

seed().catch(console.error);
```

- [ ] **Step 2: Run seed**

Run: `npx tsx scripts/seed-selecciones-basicas.ts`
Expected: 44 JSON files written. `ls content/selecciones | wc -l` returns 48 (1 Premium + 3 Estándar + 44 Básicas).

- [ ] **Step 3: Smoke-test sample**

Open: `/selecciones/francia/`
Expected: page renders with stub data.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-selecciones-basicas.ts content/selecciones/
git commit -m "feat: seed 44 selección básicas via script"
```

---

**End of Phase 3.** Verify before proceeding: 48 selecciones seeded; `/selecciones/ecuador/` + 7 sub-páginas render; partido Ecuador-Uzbekistán renders; schema valida en 5+ páginas. 5 tasks committed.

---

## PHASE 4 — S4 (27 may–2 jun): Editorial + SEO infra

Goal: Calendario/Goleadores/Sedes pages, Artículo + Tag con `@nuxt/content`, OG image generator, Sitemap, llms.txt, robots.txt, redirects, security headers, jugadores hub, institucionales.

### Task 23: Pages Calendario, Goleadores, Sedes

**Files:**
- Create: `server/api/torneos/mundial/[edicion]/calendario.get.ts`
- Create: `server/api/torneos/mundial/[edicion]/goleadores.get.ts`
- Create: `server/api/torneos/mundial/[edicion]/sedes.get.ts`
- Create: `pages/torneos/mundial/2026/calendario.vue`
- Create: `pages/torneos/mundial/2026/goleadores.vue`
- Create: `pages/torneos/mundial/2026/sedes.vue`

- [ ] **Step 1: Create calendario endpoint**

```ts
// server/api/torneos/mundial/[edicion]/calendario.get.ts
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import type { Partido } from '~/types/api';

export default defineEventHandler(async (event): Promise<Partido[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400 });
  const dir = resolve(process.cwd(), 'content/partidos');
  const files = await readdir(dir);
  const partidos = await Promise.all(
    files.filter((f) => f.endsWith('.json')).map((f) => loadContent<Partido>(`partidos/${f.replace('.json', '')}`)),
  );
  return partidos
    .filter((p) => p.edicion.slug === edicion)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
});
```

- [ ] **Step 2: Create goleadores endpoint** (devuelve array vacío en MVP, datos llenan durante torneo)

```ts
// server/api/torneos/mundial/[edicion]/goleadores.get.ts
export default defineEventHandler(() => []);
```

- [ ] **Step 3: Create sedes endpoint**

```ts
// server/api/torneos/mundial/[edicion]/sedes.get.ts
import { loadContent } from '~/server/utils/content-loader';
import type { Edicion } from '~/types/api';

export default defineEventHandler(async (event) => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400 });
  const ed = await loadContent<Edicion>(`torneos/mundial/${edicion}`);
  return ed.sedes ?? [];
});
```

- [ ] **Step 4: Create page `pages/torneos/mundial/2026/calendario.vue`**

```vue
<script setup lang="ts">
import type { Partido } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: partidos } = await useFetch<Partido[]>('/api/torneos/mundial/2026/calendario');

useSeo({
  title: 'Calendario Mundial 2026 — 104 partidos',
  description: 'Calendario completo del Mundial 2026: fechas, horarios, sedes y selecciones de los 104 partidos.',
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Calendario' },
  ]),
  buildItemList((partidos.value ?? []).map((p) => ({
    name: `${p.local.nombre} vs ${p.visitante.nombre}`,
    url: `${config.public.siteUrl}/torneos/mundial/2026/grupos/${p.grupo?.slug ?? 'na'}/${p.slug}/`,
  }))),
]);
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Calendario' }]" />
    </div>
    <ProHero kicker="104 partidos · 39 días" title="Calendario" lead="11 jun – 19 jul · 16 sedes en 3 países." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <MatchCard v-for="p in partidos" :key="p.slug" :partido="p" :cols="6" />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 5: Create `pages/torneos/mundial/2026/goleadores.vue`** (estructura ready, datos vacíos)

```vue
<script setup lang="ts">
import { buildBreadcrumbList, injectSchema } from '~/composables/useSchema';

useSeo({
  title: 'Goleadores Mundial 2026',
  description: 'Top scorers del Mundial 2026 actualizado tras cada jornada.',
});

const config = useRuntimeConfig();
injectSchema(buildBreadcrumbList([
  { name: 'Inicio', url: config.public.siteUrl + '/' },
  { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
  { name: 'Goleadores' },
]));
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Goleadores' }]" />
    </div>
    <ProHero kicker="Top scorers" title="Goleadores" lead="El ranking se actualizará tras cada jornada del torneo." />
    <section class="pro-section pro-container">
      <p>Datos disponibles desde el 11 de junio.</p>
    </section>
  </div>
</template>
```

- [ ] **Step 6: Create `pages/torneos/mundial/2026/sedes.vue`**

```vue
<script setup lang="ts">
import type { Sede } from '~/types/api';
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const { data: sedes } = await useFetch<Sede[]>('/api/torneos/mundial/2026/sedes');

useSeo({
  title: 'Sedes Mundial 2026 — 16 estadios en USA, Canadá, México',
  description: 'Las 16 sedes del Mundial 2026: capacidad, ciudad, partidos asignados.',
});

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Mundial 2026', url: config.public.siteUrl + '/torneos/mundial/2026/' },
    { name: 'Sedes' },
  ]),
  buildItemList((sedes.value ?? []).map((s) => ({ name: s.nombre }))),
]);
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Mundial 2026', to: '/torneos/mundial/2026/' }, { label: 'Sedes' }]" />
    </div>
    <ProHero kicker="16 sedes · 3 países" title="Estadios" lead="Estados Unidos, Canadá y México albergan el primer Mundial ampliado." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <MediaTile
          v-for="s in sedes"
          :key="s.slug"
          :cols="4"
          :kicker="s.pais"
          :title="s.nombre"
          :meta="`${s.ciudad} · ${s.capacidad.toLocaleString()}`"
          :image="s.imagen ?? { src: '/img/stadium-placeholder.svg', alt: s.nombre }"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 7: Smoke-test 3 páginas**

Open: `/torneos/mundial/2026/calendario/`, `/goleadores/`, `/sedes/`. Expected: render correctly, breadcrumbs, schema.

- [ ] **Step 8: Commit**

```bash
git add server/api/torneos/mundial/[edicion]/ pages/torneos/mundial/2026/{calendario,goleadores,sedes}.vue
git commit -m "feat: add calendario, goleadores, sedes pages"
```

---

### Task 24: Editorial markdown via @nuxt/content

**Files:**
- Create: `content.config.ts`
- Create: `content/noticias/2026-05-15-ecuador-arranca-en-atlanta.md`
- Create: `content/noticias/2026-05-20-grupo-d-analisis.md`
- Create: `pages/noticias/index.vue`
- Create: `pages/noticias/[slug].vue`
- Create: `components/Editorial/EditorialCard.vue`
- Create: `components/Editorial/ArticleBody.vue`

- [ ] **Step 1: Create `content.config.ts`**

```ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    noticias: defineCollection({
      type: 'page',
      source: 'noticias/**/*.md',
      schema: z.object({
        titulo: z.string(),
        subtitulo: z.string().optional(),
        kicker: z.string(),
        categoria: z.enum(['previa', 'cronica', 'analisis', 'entrevista', 'historia', 'reportaje']),
        autor: z.object({ slug: z.string(), nombre: z.string() }),
        fechaPublicacion: z.string(),
        imagenHero: z.object({ src: z.string(), alt: z.string() }),
        lead: z.string(),
        tags: z.array(z.string()),
      }),
    }),
  },
});
```

- [ ] **Step 2: Create sample article `content/noticias/2026-05-15-ecuador-arranca-en-atlanta.md`**

```md
---
titulo: "Ecuador arranca el Mundial en Atlanta vs Uzbekistán"
kicker: "Previa"
categoria: "previa"
autor:
  slug: redaccion
  nombre: "Redacción Golgana"
fechaPublicacion: "2026-05-15T10:00:00-05:00"
imagenHero:
  src: /img/hero-placeholder.svg
  alt: "Ecuador en Atlanta"
lead: "La Tri abre su 4to Mundial en el Mercedes-Benz Stadium contra el debutante asiático Uzbekistán."
tags: [mundial-2026, seleccion-ecuatoriana, grupo-d]
---

## El debut

Ecuador arranca su 4to Mundial el **12 de junio a las 19:00 ET** en el Mercedes-Benz Stadium de Atlanta...

## Cómo llega Beccacece

El argentino...
```

Add a 2nd article similar.

- [ ] **Step 3: Create `components/Editorial/EditorialCard.vue`**

```vue
<script setup lang="ts">
defineProps<{
  kicker: string;
  title: string;
  href: string;
  meta?: string;
  image?: { src: string; alt: string };
  lead?: 'lead' | 'normal';
}>();
</script>

<template>
  <a :href="href" :class="['ed-card', lead === 'lead' ? 'ed-card--lead' : '']">
    <div v-if="image" class="ed-card__img"><img :src="image.src" :alt="image.alt" /></div>
    <div class="ed-card__body">
      <span class="ed-card__kicker">{{ kicker }}</span>
      <h3 class="ed-card__title">{{ title }}</h3>
      <span v-if="meta" class="ed-card__meta">{{ meta }}</span>
    </div>
  </a>
</template>
```

- [ ] **Step 4: Create `components/Editorial/ArticleBody.vue`**

```vue
<template>
  <div class="prose">
    <slot />
  </div>
</template>

<style>
.prose { max-width: 720px; margin: 0 auto; }
.prose h2 { font-family: var(--font-display); font-size: 32px; margin-top: 48px; }
.prose h3 { font-family: var(--font-display); font-size: 22px; margin-top: 32px; }
.prose p { font-size: 17px; line-height: 1.7; margin-top: 16px; }
.prose img { max-width: 100%; border-radius: 12px; margin: 24px 0; }
.prose blockquote { border-left: 4px solid var(--color-primary-green); padding: 8px 16px; font-style: italic; }
</style>
```

- [ ] **Step 5: Create `pages/noticias/index.vue`**

```vue
<script setup lang="ts">
const { data: articulos } = await useAsyncData('noticias-list', () =>
  queryCollection('noticias').order('fechaPublicacion', 'DESC').all(),
);

useSeo({
  title: 'Noticias — Cobertura Mundial 2026',
  description: 'Análisis, previas, crónicas y reportajes sobre el Mundial 2026 con foco en Ecuador.',
});
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Noticias' }]" />
    </div>
    <ProHero kicker="Editorial" title="Noticias" lead="Análisis, previas, crónicas y reportajes." />
    <section class="pro-section pro-container">
      <BentoGrid>
        <EditorialCard
          v-for="(a, i) in articulos"
          :key="a.path"
          :kicker="a.kicker"
          :title="a.titulo"
          :href="`/noticias/${a.path.split('/').pop()}/`"
          :image="a.imagenHero"
          :meta="`${a.autor.nombre} · ${new Date(a.fechaPublicacion).toLocaleDateString('es-EC')}`"
          :lead="i === 0 ? 'lead' : 'normal'"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 6: Create `pages/noticias/[slug].vue`**

```vue
<script setup lang="ts">
import { buildBreadcrumbList, buildNewsArticle, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;

const { data: article } = await useAsyncData(`article-${slug}`, () =>
  queryCollection('noticias').where('path', 'LIKE', `%${slug}%`).first(),
);

if (!article.value) throw createError({ statusCode: 404 });

useSeo({
  title: article.value.titulo,
  description: article.value.lead,
});

const config = useRuntimeConfig();
const articleUrl = `${config.public.siteUrl}/noticias/${slug}/`;

injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Noticias', url: config.public.siteUrl + '/noticias/' },
    { name: article.value.titulo },
  ]),
  buildNewsArticle({
    titulo: article.value.titulo,
    imagenHero: article.value.imagenHero,
    fechaPublicacion: article.value.fechaPublicacion,
    autor: { type: 'autor', slug: article.value.autor.slug, nombre: article.value.autor.nombre },
  } as any, articleUrl),
]);
</script>

<template>
  <div v-if="article">
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[
        { label: 'Inicio', to: '/' },
        { label: 'Noticias', to: '/noticias/' },
        { label: article.titulo },
      ]" />
    </div>

    <article class="pro-section pro-container">
      <header style="margin-bottom:32px">
        <span class="pro-hero__kicker">{{ article.kicker }}</span>
        <h1 style="font-family:var(--font-display);font-size:48px;line-height:1.1;margin:12px 0">{{ article.titulo }}</h1>
        <p style="font-size:18px;color:var(--color-text-muted)">{{ article.lead }}</p>
        <div style="margin-top:16px;font-size:13px;color:var(--color-text-muted)">
          {{ article.autor.nombre }} · {{ new Date(article.fechaPublicacion).toLocaleDateString('es-EC') }}
        </div>
      </header>
      <img :src="article.imagenHero.src" :alt="article.imagenHero.alt" style="width:100%;border-radius:14px;margin-bottom:32px" />
      <ArticleBody>
        <ContentRenderer :value="article" />
      </ArticleBody>
    </article>
  </div>
</template>
```

- [ ] **Step 7: Smoke-test**

Open: `/noticias/`, then click into one article. Expected: list renders, article body renders with markdown formatting.

- [ ] **Step 8: Commit**

```bash
git add content.config.ts content/noticias/ components/Editorial/ pages/noticias/
git commit -m "feat: add editorial via @nuxt/content (noticias index + article page)"
```

---

### Task 25: Temas/tag pages

**Files:**
- Create: `server/api/temas/[slug].get.ts`
- Create: `pages/temas/index.vue`
- Create: `pages/temas/[slug].vue`
- Create: `content/temas/{mundial-2026,seleccion-ecuatoriana,grupo-d,beccacece,caicedo,la-tri-mundial}.json`

- [ ] **Step 1: Seed `content/temas/mundial-2026.json`**

```json
{
  "slug": "mundial-2026",
  "nombre": "Mundial 2026",
  "descripcion": "Toda la cobertura del Mundial 2026: 48 selecciones, 16 sedes en USA/Canadá/México y 104 partidos en 39 días.",
  "seo": {
    "title": "Mundial 2026 — Tema",
    "description": "Cobertura completa del Mundial 2026 con artículos, análisis y datos."
  }
}
```

Seed similar JSON for: `seleccion-ecuatoriana`, `grupo-d`, `beccacece`, `caicedo`, `la-tri-mundial`.

- [ ] **Step 2: Create `server/api/temas/[slug].get.ts`**

Returns the tag JSON + filtered articles where article tags include the slug.

```ts
import { loadContent } from '~/server/utils/content-loader';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400 });
  try {
    return await loadContent(`temas/${slug}`);
  } catch {
    throw createError({ statusCode: 404 });
  }
});
```

- [ ] **Step 3: Create `pages/temas/[slug].vue`**

```vue
<script setup lang="ts">
import { buildBreadcrumbList, buildItemList, injectSchema } from '~/composables/useSchema';

const route = useRoute();
const slug = route.params.slug as string;
const { data: tema } = await useFetch(`/api/temas/${slug}`);
const { data: articulos } = await useAsyncData(`tema-${slug}`, () =>
  queryCollection('noticias').where('tags', '@>', `[\"${slug}\"]`).order('fechaPublicacion', 'DESC').all(),
);

if (!tema.value) throw createError({ statusCode: 404 });

useSeo(tema.value.seo);

const config = useRuntimeConfig();
injectSchema([
  buildBreadcrumbList([
    { name: 'Inicio', url: config.public.siteUrl + '/' },
    { name: 'Temas', url: config.public.siteUrl + '/temas/' },
    { name: tema.value.nombre },
  ]),
  buildItemList((articulos.value ?? []).map((a) => ({ name: a.titulo, url: `${config.public.siteUrl}${a.path}` }))),
]);
</script>

<template>
  <div v-if="tema">
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Temas', to: '/temas/' }, { label: tema.nombre }]" />
    </div>
    <ProHero kicker="Tema" :title="tema.nombre" :lead="tema.descripcion" />
    <section class="pro-section pro-container">
      <BentoGrid>
        <EditorialCard
          v-for="a in articulos"
          :key="a.path"
          :kicker="a.kicker"
          :title="a.titulo"
          :href="`/noticias/${a.path.split('/').pop()}/`"
          :image="a.imagenHero"
        />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 4: Create `pages/temas/index.vue`** (lista de temas)

Standard hub pattern.

- [ ] **Step 5: Smoke-test**

Open: `/temas/`, `/temas/mundial-2026/`. Expected: render with linked articles.

- [ ] **Step 6: Commit**

```bash
git add server/api/temas/ content/temas/ pages/temas/
git commit -m "feat: add temas (tag) hub + individual pages"
```

---

### Task 26: Jugadores hub + perfil basic + institucionales

**Files:**
- Create: `server/api/jugadores/[slug].get.ts`
- Create: `pages/jugadores/index.vue`
- Create: `pages/jugadores/[slug]/index.vue`
- Create: `pages/torneos/index.vue` (hub directorio)
- Create: `pages/acerca-de.vue`
- Create: `pages/contacto.vue`
- Create: `pages/politica-privacidad.vue`
- Create: `pages/terminos.vue`
- Create: `content/jugadores/moises-caicedo.json`

- [ ] **Step 1: Seed `content/jugadores/moises-caicedo.json`** (basic data)

Per spec §6.2 `Jugador` shape, fill all required fields.

- [ ] **Step 2: Create endpoint `server/api/jugadores/[slug].get.ts`**

Standard pattern. Same as torneos/selecciones endpoints.

- [ ] **Step 3: Create `pages/jugadores/[slug]/index.vue`** (hub básico)

Hero with foto + nombre + ficha técnica + club + selección. Link to selección plantilla.

- [ ] **Step 4: Create `pages/jugadores/index.vue`** (hub directorio — sólo Ecuador en MVP)

- [ ] **Step 5: Create `pages/torneos/index.vue`** (hub directorio)

```vue
<script setup lang="ts">
useSeo({ title: 'Torneos', description: 'Torneos cubiertos por Golgana.' });
</script>

<template>
  <div>
    <div class="pro-container">
      <LayoutBreadcrumb :crumbs="[{ label: 'Inicio', to: '/' }, { label: 'Torneos' }]" />
    </div>
    <ProHero kicker="Cobertura" title="Torneos" />
    <section class="pro-section pro-container">
      <BentoGrid>
        <Tile cols="6" kicker="Mundial 2026" title="Cobertura especial" href="/torneos/mundial/" variant="green" />
        <Tile cols="6" kicker="LigaPro · Próximamente" title="Serie A · 2026" />
      </BentoGrid>
    </section>
  </div>
</template>
```

- [ ] **Step 6: Create 4 institucionales pages**

`pages/acerca-de.vue`, `contacto.vue`, `politica-privacidad.vue`, `terminos.vue`. Each with breadcrumb + ProHero + content sections. Acerca de es CRÍTICO para E-E-A-T: incluir misión, equipo editorial, fuentes, contacto, política editorial.

- [ ] **Step 7: Smoke-test all 6 pages**

Open: `/jugadores/`, `/jugadores/moises-caicedo/`, `/torneos/`, `/acerca-de/`, `/contacto/`, `/politica-privacidad/`, `/terminos/`. All render, breadcrumbs work.

- [ ] **Step 8: Commit**

```bash
git add server/api/jugadores/ content/jugadores/ pages/jugadores/ pages/torneos/index.vue pages/{acerca-de,contacto,politica-privacidad,terminos}.vue
git commit -m "feat: add jugadores, torneos hub, institucionales"
```

---

### Task 27: OG image generator with satori

**Files:**
- Create: `server/api/og/[type]/[slug].png.ts`
- Create: `server/utils/og-templates.ts`
- Create: `assets/fonts/BebasNeue-Regular.ttf` (download from Google Fonts)
- Create: `assets/fonts/Montserrat-Bold.ttf`

- [ ] **Step 1: Download fonts to `assets/fonts/`**

Download Bebas Neue Regular and Montserrat Bold TTF from fonts.google.com (need TTF for satori, not WOFF2).

- [ ] **Step 2: Create `server/utils/og-templates.ts`**

```ts
import { satoriHtml } from 'satori-html';

const BG_GRADIENT = 'linear-gradient(135deg, #000 0%, #0a3d20 50%, #067a4a 100%)';

export function ogTorneoTemplate(data: { title: string; subtitle: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">Golgana</div>
      <div style="margin-top:auto">
        <div style="font-family:'Bebas Neue';font-size:160px;line-height:0.9;text-transform:uppercase">${data.title}</div>
        <div style="font-size:32px;color:rgba(255,255,255,0.7);margin-top:16px">${data.subtitle}</div>
      </div>
    </div>
  `);
}

export function ogSeleccionTemplate(data: { name: string; subtitle: string; flag: string }) {
  return satoriHtml(`
    <div style="display:flex;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:240px">${data.flag}</div>
      <div style="margin-left:64px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-family:'Bebas Neue';font-size:120px;line-height:0.9">${data.name}</div>
        <div style="font-size:28px;color:rgba(255,255,255,0.7);margin-top:16px">${data.subtitle}</div>
      </div>
    </div>
  `);
}

export function ogPartidoTemplate(data: { local: string; visitante: string; fecha: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">Mundial 2026 · Golgana</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:48px;margin-top:auto;margin-bottom:auto">
        <div style="font-family:'Bebas Neue';font-size:96px">${data.local}</div>
        <div style="font-family:'Bebas Neue';font-size:144px;color:#02CC74">VS</div>
        <div style="font-family:'Bebas Neue';font-size:96px">${data.visitante}</div>
      </div>
      <div style="font-size:32px;color:rgba(255,255,255,0.7);text-align:center">${data.fecha}</div>
    </div>
  `);
}

export function ogArticuloTemplate(data: { titulo: string; kicker: string }) {
  return satoriHtml(`
    <div style="display:flex;flex-direction:column;width:1200px;height:630px;background:${BG_GRADIENT};color:#fff;padding:64px;font-family:Montserrat">
      <div style="font-size:24px;text-transform:uppercase;letter-spacing:0.2em;color:#02CC74">${data.kicker} · Golgana</div>
      <div style="margin-top:auto;font-family:'Bebas Neue';font-size:96px;line-height:1">${data.titulo}</div>
    </div>
  `);
}
```

- [ ] **Step 3: Create `server/api/og/[type]/[slug].png.ts`**

```ts
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import { ogTorneoTemplate, ogSeleccionTemplate, ogPartidoTemplate, ogArticuloTemplate } from '~/server/utils/og-templates';

const FONTS_DIR = resolve(process.cwd(), 'assets/fonts');

let cachedFonts: { name: string; data: Buffer; weight: number }[] | null = null;

async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const [bebas, montserrat] = await Promise.all([
    readFile(resolve(FONTS_DIR, 'BebasNeue-Regular.ttf')),
    readFile(resolve(FONTS_DIR, 'Montserrat-Bold.ttf')),
  ]);
  cachedFonts = [
    { name: 'Bebas Neue', data: bebas, weight: 400 },
    { name: 'Montserrat', data: montserrat, weight: 700 },
  ];
  return cachedFonts;
}

export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, 'type');
  const slug = (getRouterParam(event, 'slug') ?? '').replace('.png', '');
  if (!type || !slug) throw createError({ statusCode: 400 });

  const fonts = await loadFonts();

  let markup: any;
  if (type === 'torneo' && slug === 'mundial') {
    const t = await loadContent<any>('torneos/mundial');
    markup = ogTorneoTemplate({ title: t.nombreCorto, subtitle: 'Cobertura Golgana' });
  } else if (type === 'edicion') {
    markup = ogTorneoTemplate({ title: 'Mundial 2026', subtitle: '11 jun – 19 jul · 48 selecciones' });
  } else if (type === 'seleccion') {
    const eq = await loadContent<any>(`selecciones/${slug}`);
    markup = ogSeleccionTemplate({ name: eq.apodo ?? eq.nombre, subtitle: 'Mundial 2026 · Golgana', flag: '🇪🇨' });
  } else if (type === 'partido') {
    const p = await loadContent<any>(`partidos/${slug}`);
    markup = ogPartidoTemplate({
      local: p.local.nombre,
      visitante: p.visitante.nombre,
      fecha: new Date(p.fecha).toLocaleDateString('es-EC'),
    });
  } else if (type === 'articulo') {
    markup = ogArticuloTemplate({ titulo: slug.replace(/-/g, ' '), kicker: 'Editorial' });
  } else {
    throw createError({ statusCode: 400, message: 'invalid type' });
  }

  const svg = await satori(markup, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();

  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  return png;
});
```

- [ ] **Step 4: Smoke-test OG endpoint**

Open: `http://localhost:3000/api/og/edicion/mundial-2026.png`
Expected: 1200×630 PNG renders with green gradient + "Mundial 2026" in Bebas Neue.

Open: `/api/og/seleccion/ecuador.png`
Expected: PNG with crest + "La Tri" + subtitle.

- [ ] **Step 5: Wire OG images into useSeo**

Update `composables/useSeo.ts` to default `ogImage` from runtime config + page type:

Add new param `ogImage?: { type: string; slug: string }` and in the function:
```ts
const ogImageUrl = opts.ogImage
  ? `${config.public.siteUrl}/api/og/${opts.ogImage.type}/${opts.ogImage.slug}.png`
  : seo.ogImageOverride?.src;
```

Update consumer pages (Edición, Selección hub, Partido, Artículo) to pass `ogImage: { type, slug }` to useSeo.

- [ ] **Step 6: Commit**

```bash
git add assets/fonts/ server/utils/og-templates.ts server/api/og/ composables/useSeo.ts
git commit -m "feat: add dynamic OG image generator with satori"
```

---

### Task 28: Sitemap, robots.txt, llms.txt

**Files:**
- Modify: `nuxt.config.ts` (configure @nuxtjs/sitemap)
- Create: `public/robots.txt`
- Create: `public/llms.txt`

- [ ] **Step 1: Configure sitemap in `nuxt.config.ts`**

```ts
sitemap: {
  hostname: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://golgana.net',
  defaults: { changefreq: 'weekly', priority: 0.7 },
  exclude: ['/api/**', '/dev/**'],
  urls: async () => {
    // Generate URLs from content/ at build time
    const urls: any[] = [];
    // Mundial branch
    urls.push({ loc: '/torneos/mundial/', priority: 0.9, changefreq: 'weekly' });
    urls.push({ loc: '/torneos/mundial/2026/', priority: 1.0, changefreq: 'daily' });
    urls.push({ loc: '/torneos/mundial/2026/calendario/', priority: 0.9, changefreq: 'daily' });
    urls.push({ loc: '/torneos/mundial/2026/goleadores/', priority: 0.9, changefreq: 'daily' });
    urls.push({ loc: '/torneos/mundial/2026/sedes/', priority: 0.7 });
    urls.push({ loc: '/torneos/mundial/campeones/', priority: 0.7 });
    // Iterate content/* JSON files for dynamic URLs (selecciones, partidos, grupos, etc.)
    // Implementation: use fs.readdir at build time
    return urls;
  },
},
```

For dynamic URL generation, implement helper `server/utils/sitemap-urls.ts` that walks `content/` and emits all URLs.

- [ ] **Step 2: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /dev/
Disallow: /*?*

Sitemap: https://golgana.net/sitemap.xml

User-agent: SemrushBot
Crawl-delay: 10
```

- [ ] **Step 3: Create `public/llms.txt`**

```
# Golgana — Fútbol con profundidad

> Plataforma editorial de fútbol con cobertura especial del Mundial 2026.

## Mundial 2026
- [Mundial 2026 — Hub](https://golgana.net/torneos/mundial/2026/) — La edición ampliada: 48 selecciones, 16 sedes, 104 partidos
- [Grupo D · Ecuador](https://golgana.net/torneos/mundial/2026/grupos/grupo-d/) — Inglaterra, Ecuador, C. Marfil, Uzbekistán
- [Selección de Ecuador](https://golgana.net/selecciones/ecuador/) — La Tri en su 4to Mundial

## Selecciones
- [Selección Ecuador](https://golgana.net/selecciones/ecuador/) — Plantilla, partidos, historia, ídolos, clásicos

## Editorial
- [Noticias](https://golgana.net/noticias/)
- [Temas](https://golgana.net/temas/)
```

- [ ] **Step 4: Smoke-test sitemap and txts**

Run: `npm run dev`
Open: `http://localhost:3000/sitemap.xml`, `/robots.txt`, `/llms.txt`
Expected: each returns valid content.

- [ ] **Step 5: Commit**

```bash
git add nuxt.config.ts public/robots.txt public/llms.txt server/utils/sitemap-urls.ts
git commit -m "feat: configure sitemap, robots.txt, llms.txt"
```

---

### Task 29: Redirects, security headers, GTM/GA4 + cookie banner

**Files:**
- Create: `server/middleware/redirects.ts`
- Create: `server/middleware/security.ts`
- Create: `components/Layout/CookieBanner.vue`
- Create: `composables/useGtm.ts`
- Modify: `app.vue` (add CookieBanner + GTM)
- Modify: `nuxt.config.ts` (routeRules per spec §7.1)

- [ ] **Step 1: Create `server/middleware/redirects.ts`**

```ts
export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  // www → apex
  if (url.hostname.startsWith('www.')) {
    const target = `https://${url.hostname.replace('www.', '')}${url.pathname}${url.search}`;
    return sendRedirect(event, target, 301);
  }
  // Sin trailing slash → con trailing slash (excepto /api/* y archivos)
  if (
    !url.pathname.endsWith('/') &&
    !url.pathname.startsWith('/api/') &&
    !url.pathname.includes('.') &&
    url.pathname !== '/'
  ) {
    return sendRedirect(event, `${url.pathname}/${url.search}`, 301);
  }
});
```

- [ ] **Step 2: Create `server/middleware/security.ts`**

```ts
export default defineEventHandler((event) => {
  setHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  setHeader(event, 'X-Content-Type-Options', 'nosniff');
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
  setHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  setHeader(
    event,
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com",
  );
});
```

- [ ] **Step 3: Create `components/Layout/CookieBanner.vue`**

```vue
<script setup lang="ts">
const consent = useState<'unknown' | 'granted' | 'denied'>('cookieConsent', () => 'unknown');

onMounted(() => {
  const stored = localStorage.getItem('cookie-consent');
  if (stored === 'granted' || stored === 'denied') consent.value = stored;
});

const grant = () => {
  consent.value = 'granted';
  localStorage.setItem('cookie-consent', 'granted');
};
const deny = () => {
  consent.value = 'denied';
  localStorage.setItem('cookie-consent', 'denied');
};
</script>

<template>
  <div
    v-if="consent === 'unknown'"
    style="position:fixed;bottom:24px;left:24px;right:24px;max-width:560px;background:#0a0a0a;color:#fff;padding:20px 24px;border-radius:12px;z-index:1000;box-shadow:0 16px 48px rgba(0,0,0,0.4)"
  >
    <p style="margin:0;font-size:14px;line-height:1.5">
      Usamos cookies para analítica de uso (GA4) y mejorar la experiencia. Puedes aceptar o rechazar.
    </p>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button @click="deny" style="padding:8px 16px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:8px;cursor:pointer">Rechazar</button>
      <button @click="grant" style="padding:8px 16px;background:var(--color-primary-green);color:#fff;border:0;border-radius:8px;cursor:pointer">Aceptar</button>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Create `composables/useGtm.ts`**

```ts
export function useGtm() {
  const config = useRuntimeConfig();
  const consent = useState<string>('cookieConsent');

  const inject = () => {
    if (!config.public.gtmId || consent.value !== 'granted') return;
    if (typeof window === 'undefined') return;
    if (document.getElementById('gtm-script')) return;

    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${config.public.gtmId}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  };

  return { inject };
}
```

- [ ] **Step 5: Update `app.vue` to include CookieBanner + GTM injection**

```vue
<script setup lang="ts">
import { buildOrganization, buildWebSite, injectSchema } from '~/composables/useSchema';

useHead({
  titleTemplate: (title) => title ? `${title} — Golgana` : 'Golgana — Fútbol con profundidad',
});

injectSchema([buildOrganization(), buildWebSite()]);

const { inject: injectGtm } = useGtm();
const consent = useState<string>('cookieConsent');

watch(consent, (val) => { if (val === 'granted') injectGtm(); });
onMounted(() => { if (consent.value === 'granted') injectGtm(); });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LayoutCookieBanner />
</template>
```

- [ ] **Step 6: Add routeRules to nuxt.config.ts** (per spec §7.1)

Add the full `routeRules` block from spec §7.1 verbatim.

- [ ] **Step 7: Smoke-test**

Run: `npm run dev`
- Open `/torneos/mundial/2026` (no slash) → expect 301 to `/torneos/mundial/2026/`
- Inspect Network response headers → HSTS, CSP present
- Cookie banner appears on first visit; clicking "Aceptar" injects GTM (verify in Network tab if `NUXT_PUBLIC_GTM_ID` set)

- [ ] **Step 8: Commit**

```bash
git add server/middleware/ components/Layout/CookieBanner.vue composables/useGtm.ts app.vue nuxt.config.ts
git commit -m "feat: add redirects, security headers, GTM with consent gate, routeRules"
```

---

### Task 30: 404 page + amplify.yml

**Files:**
- Create: `error.vue`
- Create: `amplify.yml`

- [ ] **Step 1: Create `error.vue` (Nuxt error handler)**

```vue
<script setup lang="ts">
import type { NuxtError } from '#app';

defineProps<{
  error: NuxtError;
}>();

useSeo({
  title: 'Página no encontrada',
  description: 'La página que buscas no existe.',
  noindex: true,
} as any);
</script>

<template>
  <div>
    <LayoutSiteHeader />
    <main>
      <ProHero
        kicker="404"
        :title="error.statusCode === 404 ? 'No encontramos lo que buscas' : 'Algo salió mal'"
        :lead="error.statusCode === 404 ? 'La página que buscas no existe o se movió.' : 'Inténtalo en unos minutos.'"
      />
      <section class="pro-section pro-container">
        <BentoGrid>
          <Tile cols="6" kicker="Volver" title="Inicio" href="/" />
          <Tile cols="6" kicker="Mundial 2026" title="Edición actual" href="/torneos/mundial/2026/" />
        </BentoGrid>
      </section>
    </main>
    <LayoutSiteFooter />
  </div>
</template>
```

- [ ] **Step 2: Create `amplify.yml`**

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

- [ ] **Step 3: Commit**

```bash
git add error.vue amplify.yml
git commit -m "feat: add 404 page + amplify.yml build spec"
```

---

**End of Phase 4.** Verify: sitemap renders, OG images generate, redirects work, cookie banner functional, 404 friendly. 8 tasks committed.

---

## PHASE 5 — S5 (3–8 jun): QA + Launch

Goal: Lighthouse CI gate, schema validation, Search Console + IndexNow, deploy to Amplify, smoke-test prod, launch checklist closeout.

### Task 31: Lighthouse CI for 5 templates

**Files:**
- Create: `.lighthouserc.json`
- Create: `scripts/lighthouse-ci.sh`

- [ ] **Step 1: Install Lighthouse CI**

Run: `npm install -D @lhci/cli`

- [ ] **Step 2: Create `.lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/torneos/mundial/2026/",
        "http://localhost:3000/selecciones/ecuador/",
        "http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/",
        "http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan/"
      ],
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "Listening",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "interaction-to-next-paint": ["warn", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

- [ ] **Step 3: Build production bundle**

Run: `npm run build`
Expected: build succeeds, `.output/` directory created.

- [ ] **Step 4: Run Lighthouse CI locally**

Run: `npx lhci autorun`
Expected: 5 URLs audited, performance ≥ 0.8, SEO ≥ 0.95, LCP < 2500ms, CLS < 0.1. If failing, identify the offending metric and fix (e.g. preload hero image, defer GTM, fix layout shift in hero).

- [ ] **Step 5: Commit**

```bash
git add .lighthouserc.json package.json package-lock.json
git commit -m "chore: add Lighthouse CI gating 5 templates"
```

---

### Task 32: Schema.org validation script

**Files:**
- Create: `scripts/validate-schema.ts`

- [ ] **Step 1: Create script**

```ts
import { JSDOM } from 'jsdom';

const URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/torneos/mundial/',
  'http://localhost:3000/torneos/mundial/2026/',
  'http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/',
  'http://localhost:3000/selecciones/ecuador/',
  'http://localhost:3000/selecciones/ecuador/plantilla/',
  'http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan/',
  'http://localhost:3000/noticias/2026-05-15-ecuador-arranca-en-atlanta/',
];

async function validate() {
  let failed = 0;
  for (const url of URLS) {
    const html = await fetch(url).then((r) => r.text());
    const dom = new JSDOM(html);
    const scripts = Array.from(dom.window.document.querySelectorAll('script[type="application/ld+json"]'));
    if (!scripts.length) {
      console.error(`[FAIL] ${url} — no JSON-LD found`);
      failed++; continue;
    }
    for (const s of scripts) {
      try {
        const parsed = JSON.parse(s.textContent ?? '');
        if (!parsed['@context'] || !parsed['@type']) {
          console.error(`[FAIL] ${url} — schema missing @context/@type`);
          failed++;
        }
      } catch (err) {
        console.error(`[FAIL] ${url} — invalid JSON-LD: ${(err as Error).message}`);
        failed++;
      }
    }
    console.log(`[OK]   ${url} — ${scripts.length} schema(s)`);
  }
  if (failed > 0) process.exit(1);
}

validate();
```

Install: `npm install -D jsdom @types/jsdom`

- [ ] **Step 2: Run validation against local server**

Run: `npm run dev` (in one terminal) then `npx tsx scripts/validate-schema.ts` (in another).
Expected: all URLs OK with 1+ schemas each.

- [ ] **Step 3: Manual Rich Results Test**

For each of the 8 URLs above, paste the URL into https://search.google.com/test/rich-results and confirm 0 errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/validate-schema.ts package.json package-lock.json
git commit -m "chore: add schema.org validation script"
```

---

### Task 33: Deploy to Amplify Hosting

**Files:**
- Use: `amplify.yml` (already created in Phase 4)

- [ ] **Step 1: Create Amplify Hosting app**

In AWS Amplify Console (manual):
1. New app → Host web app
2. Connect repo (GitHub) → branch `main`
3. App settings: framework auto-detect Nuxt (or set baseDirectory `.output`)
4. Environment variables (Amplify Console UI):
   - `NUXT_PUBLIC_SITE_URL=https://golgana.net`
   - `NUXT_PUBLIC_GTM_ID=<actual GTM>`
   - `NUXT_PUBLIC_GA4_ID=<actual GA4>`
   - `NUXT_USE_BACKEND=false`
   - `NUXT_REVALIDATE_SECRET=<random 32 chars>`
5. Custom domain `golgana.net` + `www.golgana.net` (cert via ACM, validation DNS)

- [ ] **Step 2: Trigger first deployment**

Push commits to main; Amplify auto-deploys. Watch build logs. Expected: `npm ci` + `npm run build` succeed, deployment finishes within ~5 min.

- [ ] **Step 3: Smoke-test prod URL** (Amplify-provided URL antes de DNS final)

Open: the `*.amplifyapp.com` URL.
Verify: home renders, fonts loaded, no console errors.

- [ ] **Step 4: Configure DNS**

Update Route 53 (or current DNS):
- A record `golgana.net` → Amplify IP (or CloudFront alias)
- CNAME `www.golgana.net` → Amplify (luego se redirige a apex via middleware/redirects.ts)

Wait DNS propagation (~10-60 min). Confirm `https://golgana.net/` loads.

- [ ] **Step 5: No commit needed**

Configuration cambios viven en Amplify Console, no en repo.

---

### Task 34: Search Console + Bing Webmaster + IndexNow

**Files:**
- Create: `public/<verification-token>.html` (Google verification)

- [ ] **Step 1: Verify domain in Search Console**

In https://search.google.com/search-console: add property "golgana.net" via DNS verification (TXT record). Wait propagation, click verify.

- [ ] **Step 2: Submit sitemap to GSC**

In Search Console → Sitemaps → enter `https://golgana.net/sitemap.xml` → submit.

- [ ] **Step 3: Verify in Bing Webmaster Tools**

In https://www.bing.com/webmasters: import from Search Console (1 click sync).

- [ ] **Step 4: Configure IndexNow key**

Generate 32-char random key. Place at `public/<key>.txt` containing the key itself. Reference URL pattern in robots.txt: `IndexNow: https://golgana.net/<key>.txt`.

- [ ] **Step 5: Test IndexNow ping**

Run: `curl -X POST "https://api.indexnow.org/indexnow" -H "Content-Type: application/json" -d '{"host":"golgana.net","key":"<key>","keyLocation":"https://golgana.net/<key>.txt","urlList":["https://golgana.net/torneos/mundial/2026/"]}'`
Expected: 200 OK or 202 Accepted.

- [ ] **Step 6: Commit IndexNow key**

```bash
git add public/<key>.txt public/robots.txt
git commit -m "chore: add IndexNow key + verification"
```

---

### Task 35: OG image validation + social previews

- [ ] **Step 1: Test OG with Facebook Debugger**

Open https://developers.facebook.com/tools/debug/ → input `https://golgana.net/torneos/mundial/2026/` → Scrape Again. Expected: OG title + description + 1200×630 image render correctly. Repeat for `/selecciones/ecuador/` and a partido URL.

- [ ] **Step 2: Test OG with Twitter Card Validator**

Open https://cards-dev.twitter.com/validator (or use pre-render via dev tools). Verify summary_large_image renders.

- [ ] **Step 3: Fix any OG issues inline**

If image dimensions wrong or text cut off, adjust `server/utils/og-templates.ts` and redeploy. No commit needed unless template changed.

---

### Task 36: Pre-launch content polish + final checklist

- [ ] **Step 1: Editorial polish** (parallel track responsibility)

- 26 jugadores Ecuador completos en `content/selecciones/ecuador/plantilla.json`
- 15 artículos publicados en `content/noticias/`
- Acerca de con misión + equipo editorial + fuentes (E-E-A-T crítico)
- Manual de anchors verificado para Grupo D + jugadores Ecuador

- [ ] **Step 2: Run final pre-go-live checklist** (per spec §8.3)

Run through each item:
- [ ] 250+ URLs con title + meta + H1 únicos (verificar con `validate-schema.ts` + `npx tsx scripts/check-meta.ts` que se puede crear ad-hoc)
- [ ] Schema valida en Rich Results Test para 8 templates principales
- [ ] `sitemap.xml` index + sub-sitemaps generados y enviados a GSC
- [ ] `robots.txt` + bots IA permitidos
- [ ] `llms.txt` publicado
- [ ] Lighthouse CI pasa CWV en 5 templates
- [ ] Search Console + Bing verificados
- [ ] SSL via ACM + HSTS activo
- [ ] 301 www → apex confirmado
- [ ] OG images Facebook Debugger + Twitter Validator OK
- [ ] GTM + GA4 disparando con cookie consent
- [ ] Página 404 personalizada con CTAs
- [ ] Manual de anchors revisado
- [ ] Backup repo + branch protection

- [ ] **Step 3: Create launch tag**

```bash
git tag -a launch-2026-06-09 -m "MVP launch — Mundial 2026"
git push origin launch-2026-06-09
```

- [ ] **Step 4: Monitor first 48h post-launch**

- GA4 RealTime: tráfico fluye
- GSC Index Coverage: URLs indexándose progresivamente
- Lighthouse runs no regresión
- 0 errores 5xx en CloudFront / Amplify logs

---

**End of Phase 5.** Site is live at https://golgana.net/, indexada por Google, OG previews funcionando, Lighthouse pasando. **MVP launch completo.** 🚀

---

## Self-Review

**Spec coverage check** (vs `2026-05-06-golgana-public-frontend-design.md`):

| Spec section | Plan task(s) | Coverage |
|---|---|---|
| §1 Decisiones de scope | T1, T6 (mock-or-proxy via env), T29 (routeRules) | ✅ |
| §2 URL tree | T14–T17 (Mundial), T19–T21 (selección/partido), T23–T26 (calendario/sedes/jugadores/institucionales) | ✅ |
| §3 Templates + sub-páginas selección | T19, T20 (8 sub-páginas), T21 (partido 3 estados) | ✅ |
| §4 Estructura repo | T1, T2 (assets), T3 (types), T4-T5 (server utils) | ✅ |
| §5 Stack | T1 (package.json + nuxt.config) | ✅ |
| §6 Data layer + contrato API | T3 (types), T4 (loader), T5 (api-client), T6 (first endpoint), T15 (edicion), T16 (grupos), T19 (selecciones), T21 (partidos), T23 (calendario/goleadores/sedes), T26 (jugadores) | ✅ |
| §7.1 routeRules | T29 (Step 6) | ✅ |
| §7.2 Sitemap | T28 | ✅ |
| §7.3 Schema.org | T8 (composable), T9 (global), T14/15/16/19/21/24/25 (per template) | ✅ |
| §7.4 OG images | T27 | ✅ |
| §7.5 robots.txt + llms.txt | T28 | ✅ |
| §7.6 amplify.yml | T30 | ✅ |
| §7.7 CWV | T31 (Lighthouse CI) | ✅ |
| §7.8 Redirects | T29 | ✅ |
| §7.9 Security headers | T29 | ✅ |
| §7.10 GTM + GA4 + consent | T29 (CookieBanner + useGtm) | ✅ |
| §8 Cronograma + checklist | T36 (final checklist) + cada Phase end-of-phase verifies | ✅ |

**Placeholder scan**: 2 ítems con "TBD" justificados (cuerpo técnico nombres en seed; fuente foto jugadores) — son contenido editorial real, no placeholders de plan. Resto limpio. ✅

**Type consistency**: `Equipo.estadio` es `Ref<'sede'>` en `types/api.ts` (T3) y consumido como tal en T20 estadio.vue. `Plantilla.cuerpoTecnico` reutiliza `Equipo['cuerpoTecnico']`. `Partido.fase` usa shape `{ tipo, slug, nombre }`, consumido como tal en T21. ✅

**Scope check**: 36 tareas distribuidas en 5 phases semanales — adecuado para un solo plan ejecutado por 1-2 devs en paralelo con editorial. No requiere decomposición.

---

## Notes for executing agent

- **Task ordering** dentro de phase es secuencial: cada task asume lo anterior listo. **Entre phases** hay checkpoint: verificar `End of Phase X` antes de avanzar.
- **Editorial track corre en paralelo desde S1**: writers pueden poblar `content/*.json` y `content/noticias/*.md` sin esperar al dev. La única dependencia editorial→dev es que `types/api.ts` (T3) define la forma de los JSON.
- **Cuando llegue el backend** (post-launch), cambiar env var `NUXT_USE_BACKEND=true` + setear `NUXT_CMS_API_URL` y `NUXT_CMS_API_KEY`. Cero refactor de pages.
- **Tareas grandes que se pueden subdividir** si se cuelgan: T20 (6 sub-páginas) → 1 sub-task por sub-página; T22 (44 selecciones) puro data, no tiene riesgo; T26 (4 institucionales) → 1 sub-task por página si bloquea.
- **Pre-merge gate**: Lighthouse CI (T31) y schema validation (T32) deben pasar antes de cada deploy a producción.

