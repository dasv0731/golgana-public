/**
 * Quick pre-launch sanity check.
 * Hits production-target URLs and reports status.
 *
 * Usage: BASE=https://golgana.net npx tsx scripts/pre-launch-check.ts
 *        BASE=http://localhost:3000 npx tsx scripts/pre-launch-check.ts
 */

const BASE = process.env.BASE ?? 'http://localhost:3000';

const URLS = [
  '/',
  '/torneos/',
  '/torneos/mundial/',
  '/torneos/mundial/2026/',
  '/torneos/mundial/2026/calendario/',
  '/torneos/mundial/2026/sedes/',
  '/torneos/mundial/2026/grupos/',
  '/torneos/mundial/2026/grupos/grupo-d/',
  '/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/',
  '/selecciones/',
  '/selecciones/ecuador/',
  '/selecciones/ecuador/plantilla/',
  '/selecciones/ecuador/historia/',
  '/selecciones/ecuador/idolos/',
  '/jugadores/',
  '/jugadores/moises-caicedo/',
  '/noticias/',
  '/temas/',
  '/temas/mundial-2026/',
  '/acerca-de/',
  '/contacto/',
  '/politica-privacidad/',
  '/terminos/',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/api/og/edicion/mundial-2026.png',
];

const REDIRECTS = [
  { from: '/torneos/mundial/2026', to: '/torneos/mundial/2026/' },
];

async function main() {
  console.log(`Pre-launch check against ${BASE}\n`);
  let failed = 0;

  console.log('=== URL status ===');
  for (const u of URLS) {
    try {
      const res = await fetch(`${BASE}${u}`, { redirect: 'manual' });
      const status = res.status;
      if (status >= 200 && status < 300) {
        console.log(`[OK] ${status} ${u}`);
      } else {
        console.log(`[FAIL] ${status} ${u}`);
        failed++;
      }
    } catch (err) {
      console.log(`[FAIL] error ${u}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log('\n=== Redirects ===');
  for (const r of REDIRECTS) {
    try {
      const res = await fetch(`${BASE}${r.from}`, { redirect: 'manual' });
      const loc = res.headers.get('location') ?? '';
      const ok = res.status === 301 && loc.endsWith(r.to);
      console.log(`[${ok ? 'OK' : 'FAIL'}] ${res.status} ${r.from} -> ${loc}`);
      if (!ok) failed++;
    } catch (err) {
      console.log(`[FAIL] error ${r.from}: ${(err as Error).message}`);
      failed++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total URLs checked: ${URLS.length + REDIRECTS.length}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
