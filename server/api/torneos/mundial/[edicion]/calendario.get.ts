import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import type { Partido } from '~/types/api';

export default defineEventHandler(async (event): Promise<Partido[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  const dir = resolve(process.cwd(), 'content/partidos');
  let files: string[];
  try { files = await readdir(dir); }
  catch { return []; }
  const partidos = await Promise.all(
    files.filter((f) => f.endsWith('.json')).map((f) => loadContent<Partido>(`partidos/${f.replace('.json', '')}`)),
  );
  return partidos
    .filter((p) => p.edicion.slug === edicion)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
});
