import { loadContent } from '~/server/utils/content-loader';
import type { Edicion } from '~/types/api';

export default defineEventHandler(async (event) => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });
  const ed = await loadContent<Edicion>(`torneos/mundial/${edicion}`);
  return ed.sedes ?? [];
});
