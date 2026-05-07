import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import type { Equipo } from '~/types/api';

export default defineEventHandler(async (): Promise<Equipo[]> => {
  const dir = resolve(process.cwd(), 'content/selecciones');
  const entries = await readdir(dir, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => e.name.replace('.json', ''));
  return Promise.all(slugs.map((s) => loadContent<Equipo>(`selecciones/${s}`)));
});
