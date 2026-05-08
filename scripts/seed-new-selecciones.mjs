#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'content', 'selecciones');
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const selecciones = [
  {
    slug: 'republica-checa',
    nombre: 'Chequia',
    nombreOficial: 'Selección de la República Checa',
    apodo: 'Reprezentace',
    pais: 'CZ',
    fundacion: 1993,
    primario: '#11457E',
    secundario: '#D7141A',
    dt: 'Ivan Hašek',
    fifaRank: 38,
  },
  {
    slug: 'bosnia-herzegovina',
    nombre: 'Bosnia y Herzegovina',
    nombreOficial: 'Selección de Bosnia y Herzegovina',
    apodo: 'Zmajevi',
    pais: 'BA',
    fundacion: 1992,
    primario: '#002395',
    secundario: '#FECB00',
    dt: 'Sergej Barbarez',
    fifaRank: 74,
  },
  {
    slug: 'escocia',
    nombre: 'Escocia',
    nombreOficial: 'Selección de Escocia',
    apodo: 'Tartan Army',
    pais: 'GB-SCT',
    fundacion: 1873,
    primario: '#0065BD',
    secundario: '#FFFFFF',
    dt: 'Steve Clarke',
    fifaRank: 39,
  },
  {
    slug: 'turquia',
    nombre: 'Turquía',
    nombreOficial: 'Selección de Turquía',
    apodo: 'Ay Yıldızlılar',
    pais: 'TR',
    fundacion: 1923,
    primario: '#E30A17',
    secundario: '#FFFFFF',
    dt: 'Vincenzo Montella',
    fifaRank: 26,
  },
  {
    slug: 'suecia',
    nombre: 'Suecia',
    nombreOficial: 'Selección de Suecia',
    apodo: 'Blågult',
    pais: 'SE',
    fundacion: 1904,
    primario: '#005AA0',
    secundario: '#FECC00',
    dt: 'Jon Dahl Tomasson',
    fifaRank: 41,
  },
  {
    slug: 'irak',
    nombre: 'Irak',
    nombreOficial: 'Selección de Irak',
    apodo: 'Leones de Mesopotamia',
    pais: 'IQ',
    fundacion: 1948,
    primario: '#007A3D',
    secundario: '#CE1126',
    dt: 'Graham Arnold',
    fifaRank: 56,
  },
  {
    slug: 'noruega',
    nombre: 'Noruega',
    nombreOficial: 'Selección de Noruega',
    apodo: 'Drillos',
    pais: 'NO',
    fundacion: 1902,
    primario: '#BA0C2F',
    secundario: '#00205B',
    dt: 'Ståle Solbakken',
    fifaRank: 32,
  },
  {
    slug: 'austria',
    nombre: 'Austria',
    nombreOficial: 'Selección de Austria',
    apodo: 'Das Team',
    pais: 'AT',
    fundacion: 1904,
    primario: '#ED2939',
    secundario: '#FFFFFF',
    dt: 'Ralf Rangnick',
    fifaRank: 25,
  },
  {
    slug: 'republica-del-congo',
    nombre: 'República del Congo',
    nombreOficial: 'Selección de la República del Congo',
    apodo: 'Diables Rouges',
    pais: 'CG',
    fundacion: 1962,
    primario: '#009543',
    secundario: '#FBDE4A',
    dt: 'Sébastien Migné',
    fifaRank: 89,
  },
];

let written = 0;
for (const s of selecciones) {
  const data = {
    slug: s.slug,
    tipo: 'seleccion',
    nombre: s.nombre,
    nombreOficial: s.nombreOficial,
    apodo: s.apodo,
    pais: s.pais,
    fundacion: s.fundacion,
    escudo: { src: '/img/crest-placeholder.svg', alt: `Escudo ${s.nombre}` },
    colores: { primario: s.primario, secundario: s.secundario },
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
  const path = resolve(OUT_DIR, `${s.slug}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  written++;
}
console.log(`✓ ${written} selecciones escritas en ${OUT_DIR}`);
