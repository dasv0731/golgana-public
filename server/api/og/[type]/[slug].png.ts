import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import { ogTorneoTemplate, ogSeleccionTemplate, ogPartidoTemplate, ogArticuloTemplate } from '~/server/utils/og-templates';

const FONTS_DIR = resolve(process.cwd(), 'assets/fonts');

let cachedFonts: { name: string; data: Buffer; weight: 400 | 700 }[] | null = null;

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
  const rawSlug = getRouterParam(event, 'slug') ?? getRouterParam(event, 'slug.png') ?? '';
  const slug = rawSlug.replace(/\.png$/, '');
  if (!type || !slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });

  const fonts = await loadFonts();

  let markup: any;
  try {
    if (type === 'torneo') {
      const t = await loadContent<any>(`torneos/${slug}`);
      markup = ogTorneoTemplate({ title: t.nombreCorto ?? t.nombre, subtitle: 'Cobertura Golgana' });
    } else if (type === 'edicion') {
      markup = ogTorneoTemplate({ title: 'Mundial 2026', subtitle: '11 jun - 19 jul · 48 selecciones' });
    } else if (type === 'seleccion') {
      const eq = await loadContent<any>(`selecciones/${slug}`);
      markup = ogSeleccionTemplate({ name: eq.apodo ?? eq.nombre, subtitle: 'Mundial 2026 · Golgana', flag: '\u{1F1EA}\u{1F1E8}' });
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
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'Invalid type' });
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err;
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Unable to load: ${type}/${slug}` });
  }

  const svg = await satori(markup, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();

  setHeader(event, 'Content-Type', 'image/png');
  setHeader(event, 'Cache-Control', 'public, max-age=86400');
  return png;
});
