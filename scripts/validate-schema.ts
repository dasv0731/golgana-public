import { JSDOM } from 'jsdom';

const URLS = [
  'http://localhost:3000/',
  'http://localhost:3000/torneos/mundial/',
  'http://localhost:3000/torneos/mundial/2026/',
  'http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/',
  'http://localhost:3000/selecciones/ecuador/',
  'http://localhost:3000/selecciones/ecuador/plantilla/',
  'http://localhost:3000/torneos/mundial/2026/grupos/grupo-d/ecuador-vs-uzbekistan-j1/',
  'http://localhost:3000/noticias/',
];

interface SchemaCheck {
  url: string;
  count: number;
  types: string[];
  errors: string[];
}

async function validateUrl(url: string): Promise<SchemaCheck> {
  const result: SchemaCheck = { url, count: 0, types: [], errors: [] };
  let html: string;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      result.errors.push(`HTTP ${res.status}`);
      return result;
    }
    html = await res.text();
  } catch (err) {
    result.errors.push(`Fetch failed: ${(err as Error).message}`);
    return result;
  }

  const dom = new JSDOM(html);
  const scripts = Array.from(dom.window.document.querySelectorAll('script[type="application/ld+json"]'));
  result.count = scripts.length;

  if (scripts.length === 0) {
    result.errors.push('No JSON-LD found');
    return result;
  }

  for (const s of scripts) {
    const text = s.textContent ?? '';
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of arr) {
        if (!item['@context']) result.errors.push(`Missing @context in: ${item['@type'] ?? 'unknown'}`);
        if (!item['@type']) result.errors.push(`Missing @type in JSON-LD block`);
        if (item['@type']) result.types.push(item['@type']);
      }
    } catch (err) {
      result.errors.push(`Invalid JSON-LD: ${(err as Error).message.slice(0, 80)}`);
    }
  }

  return result;
}

async function main() {
  console.log(`Validating schema.org JSON-LD on ${URLS.length} URLs...\n`);
  let totalErrors = 0;
  for (const url of URLS) {
    const r = await validateUrl(url);
    const status = r.errors.length === 0 ? 'OK' : 'FAIL';
    const types = r.types.length ? `[${r.types.join(', ')}]` : '';
    console.log(`[${status}] ${r.url} — ${r.count} schema(s) ${types}`);
    for (const err of r.errors) console.log(`        → ${err}`);
    totalErrors += r.errors.length;
  }
  console.log(`\nTotal errors: ${totalErrors}`);
  if (totalErrors > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
