import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Priority must match @nuxtjs/sitemap's literal union (0 | 0.1 | … | 1)
type SitemapPriority = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;

export interface SitemapUrlEntry {
  loc: string;
  priority?: SitemapPriority;
  changefreq?: 'daily' | 'weekly' | 'monthly';
}

const CONTENT = resolve(process.cwd(), 'content');

async function listJson(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(resolve(CONTENT, dir), { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith('.json')).map((e) => e.name.replace('.json', ''));
  } catch {
    return [];
  }
}

export async function getDynamicSitemapUrls(): Promise<SitemapUrlEntry[]> {
  const urls: SitemapUrlEntry[] = [];

  // Mundial branch (static parts)
  urls.push({ loc: '/torneos/mundial/', priority: 0.9, changefreq: 'weekly' });
  urls.push({ loc: '/torneos/mundial/2026/', priority: 1.0, changefreq: 'daily' });
  urls.push({ loc: '/torneos/mundial/2026/calendario/', priority: 0.9, changefreq: 'daily' });
  urls.push({ loc: '/torneos/mundial/2026/goleadores/', priority: 0.9, changefreq: 'daily' });
  urls.push({ loc: '/torneos/mundial/2026/sedes/', priority: 0.7 });
  urls.push({ loc: '/torneos/mundial/2026/grupos/', priority: 0.8 });

  // Grupos
  for (const slug of await listJson('torneos/mundial/2026/grupos')) {
    urls.push({ loc: `/torneos/mundial/2026/grupos/${slug}/`, priority: 0.8, changefreq: 'daily' });
  }

  // Partidos individuales (under their grupo)
  for (const slug of await listJson('partidos')) {
    // Best-effort — assume grupo-d for ecuador-vs-uzbekistan-j1, future logic will lookup grupo
    if (slug.includes('ecuador-vs-uzbekistan')) {
      urls.push({ loc: `/torneos/mundial/2026/grupos/grupo-d/${slug}/`, priority: 0.9, changefreq: 'daily' });
    }
  }

  // Selecciones (top-level files)
  for (const slug of await listJson('selecciones')) {
    urls.push({ loc: `/selecciones/${slug}/`, priority: 0.7, changefreq: 'weekly' });
  }

  // Ecuador sub-pages
  for (const sub of ['plantilla', 'partidos', 'historia', 'titulos', 'idolos', 'clasicos', 'estadio']) {
    urls.push({ loc: `/selecciones/ecuador/${sub}/`, priority: 0.8 });
  }

  // Jugadores
  for (const slug of await listJson('jugadores')) {
    urls.push({ loc: `/jugadores/${slug}/`, priority: 0.6 });
  }

  // Temas
  for (const slug of await listJson('temas')) {
    urls.push({ loc: `/temas/${slug}/`, priority: 0.6 });
  }

  // Hubs structurales
  urls.push({ loc: '/torneos/', priority: 0.5 });
  urls.push({ loc: '/selecciones/', priority: 0.6 });
  urls.push({ loc: '/jugadores/', priority: 0.5 });
  urls.push({ loc: '/noticias/', priority: 0.7, changefreq: 'daily' });
  urls.push({ loc: '/temas/', priority: 0.5 });

  // Institucionales
  urls.push({ loc: '/acerca-de/', priority: 0.4 });
  urls.push({ loc: '/contacto/', priority: 0.3 });
  urls.push({ loc: '/politica-privacidad/', priority: 0.2 });
  urls.push({ loc: '/terminos/', priority: 0.2 });

  return urls;
}
