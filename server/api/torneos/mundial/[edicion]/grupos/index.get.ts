import type { Grupo } from '~/types/api';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';

export default defineEventHandler(async (event): Promise<Grupo[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'edicion required' });

  const dir = resolve(process.cwd(), 'content/torneos/mundial', edicion, 'grupos');
  const files = await readdir(dir);
  const slugs = files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));

  const grupos = await Promise.all(
    slugs.map((slug) => loadContent<Grupo>(`torneos/mundial/${edicion}/grupos/${slug}`)),
  );
  // Sort alphabetically by letra
  return grupos.sort((a, b) => a.letra.localeCompare(b.letra));
});
