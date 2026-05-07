import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

interface FifaSeed {
  slug: string;
  nombre: string;
  apodo?: string;
  pais: string;
  dt: string;
  fifaRank: number;
  fundacion: number;
  primario?: string;
  secundario?: string;
}

const SELECCIONES: FifaSeed[] = [
  // Top tier
  { slug: 'francia', nombre: 'Francia', apodo: 'Les Bleus', pais: 'FR', dt: 'Didier Deschamps', fifaRank: 1, fundacion: 1904, primario: '#0055A4', secundario: '#FFFFFF' },
  { slug: 'brasil', nombre: 'Brasil', apodo: 'La Canarinha', pais: 'BR', dt: 'Dorival Junior', fifaRank: 5, fundacion: 1914, primario: '#FFDF00', secundario: '#009C3B' },
  { slug: 'espana', nombre: 'España', apodo: 'La Roja', pais: 'ES', dt: 'Luis de la Fuente', fifaRank: 3, fundacion: 1909, primario: '#AA151B', secundario: '#FFC400' },
  { slug: 'argentina', nombre: 'Argentina', apodo: 'La Albiceleste', pais: 'AR', dt: 'Lionel Scaloni', fifaRank: 2, fundacion: 1893, primario: '#75AADB', secundario: '#FFFFFF' },
  { slug: 'alemania', nombre: 'Alemania', apodo: 'Die Mannschaft', pais: 'DE', dt: 'Julian Nagelsmann', fifaRank: 4, fundacion: 1900, primario: '#000000', secundario: '#DD0000' },
  { slug: 'portugal', nombre: 'Portugal', apodo: 'A Selecao', pais: 'PT', dt: 'Roberto Martinez', fifaRank: 6, fundacion: 1914, primario: '#006600', secundario: '#FF0000' },
  { slug: 'paises-bajos', nombre: 'Países Bajos', apodo: 'Oranje', pais: 'NL', dt: 'Ronald Koeman', fifaRank: 7, fundacion: 1889, primario: '#FF6C00', secundario: '#21468B' },
  { slug: 'italia', nombre: 'Italia', apodo: 'Azzurri', pais: 'IT', dt: 'Luciano Spalletti', fifaRank: 8, fundacion: 1898, primario: '#0066CC', secundario: '#FFFFFF' },
  { slug: 'belgica', nombre: 'Bélgica', apodo: 'Diables Rouges', pais: 'BE', dt: 'Domenico Tedesco', fifaRank: 9, fundacion: 1895, primario: '#000000', secundario: '#FAE042' },
  { slug: 'croacia', nombre: 'Croacia', apodo: 'Vatreni', pais: 'HR', dt: 'Zlatko Dalic', fifaRank: 11, fundacion: 1912, primario: '#FF0000', secundario: '#FFFFFF' },
  // Hosts
  { slug: 'mexico', nombre: 'México', apodo: 'El Tri', pais: 'MX', dt: 'Javier Aguirre', fifaRank: 17, fundacion: 1927, primario: '#006847', secundario: '#FFFFFF' },
  { slug: 'usa', nombre: 'Estados Unidos', apodo: 'USMNT', pais: 'US', dt: 'Mauricio Pochettino', fifaRank: 16, fundacion: 1913, primario: '#0A3161', secundario: '#B22234' },
  { slug: 'canada', nombre: 'Canadá', apodo: 'Canucks', pais: 'CA', dt: 'Jesse Marsch', fifaRank: 48, fundacion: 1912, primario: '#FF0000', secundario: '#FFFFFF' },
  // Conmebol
  { slug: 'colombia', nombre: 'Colombia', apodo: 'Los Cafeteros', pais: 'CO', dt: 'Nestor Lorenzo', fifaRank: 12, fundacion: 1924, primario: '#FCD116', secundario: '#003893' },
  { slug: 'uruguay', nombre: 'Uruguay', apodo: 'La Celeste', pais: 'UY', dt: 'Marcelo Bielsa', fifaRank: 13, fundacion: 1900, primario: '#75AADB', secundario: '#000000' },
  { slug: 'paraguay', nombre: 'Paraguay', apodo: 'La Albirroja', pais: 'PY', dt: 'Gustavo Alfaro', fifaRank: 41, fundacion: 1906, primario: '#0038A8', secundario: '#D52B1E' },
  { slug: 'chile', nombre: 'Chile', apodo: 'La Roja', pais: 'CL', dt: 'Ricardo Gareca', fifaRank: 50, fundacion: 1895, primario: '#D52B1E', secundario: '#0033A0' },
  // Africa
  { slug: 'marruecos', nombre: 'Marruecos', apodo: 'Atlas Lions', pais: 'MA', dt: 'Walid Regragui', fifaRank: 14, fundacion: 1955, primario: '#C1272D', secundario: '#006233' },
  { slug: 'senegal', nombre: 'Senegal', apodo: 'Lions de la Teranga', pais: 'SN', dt: 'Aliou Cisse', fifaRank: 19, fundacion: 1960, primario: '#00853F', secundario: '#FCD116' },
  { slug: 'egipto', nombre: 'Egipto', apodo: 'Faraones', pais: 'EG', dt: 'Hossam Hassan', fifaRank: 35, fundacion: 1921, primario: '#CE1126', secundario: '#FFFFFF' },
  { slug: 'argelia', nombre: 'Argelia', apodo: 'Les Fennecs', pais: 'DZ', dt: 'Vladimir Petkovic', fifaRank: 36, fundacion: 1962, primario: '#006233', secundario: '#FFFFFF' },
  { slug: 'sudafrica', nombre: 'Sudáfrica', apodo: 'Bafana Bafana', pais: 'ZA', dt: 'Hugo Broos', fifaRank: 56, fundacion: 1991, primario: '#FFB81C', secundario: '#007749' },
  { slug: 'camerun', nombre: 'Camerún', apodo: 'Indomable Lions', pais: 'CM', dt: 'Marc Brys', fifaRank: 53, fundacion: 1960, primario: '#007A5E', secundario: '#FCD116' },
  { slug: 'nigeria', nombre: 'Nigeria', apodo: 'Super Eagles', pais: 'NG', dt: 'Augustine Eguavoen', fifaRank: 39, fundacion: 1945, primario: '#008751', secundario: '#FFFFFF' },
  { slug: 'tunez', nombre: 'Túnez', apodo: 'Aigles de Carthage', pais: 'TN', dt: 'Faouzi Benzarti', fifaRank: 49, fundacion: 1957, primario: '#E70013', secundario: '#FFFFFF' },
  { slug: 'ghana', nombre: 'Ghana', apodo: 'Black Stars', pais: 'GH', dt: 'Otto Addo', fifaRank: 73, fundacion: 1957, primario: '#FCD116', secundario: '#006B3F' },
  { slug: 'cabo-verde', nombre: 'Cabo Verde', apodo: 'Tubaroes Azuis', pais: 'CV', dt: 'Pedro Brito Bubista', fifaRank: 70, fundacion: 1982, primario: '#003893', secundario: '#FFFFFF' },
  // Asia/Oceania
  { slug: 'japon', nombre: 'Japón', apodo: 'Samurai Blue', pais: 'JP', dt: 'Hajime Moriyasu', fifaRank: 18, fundacion: 1921, primario: '#1B0096', secundario: '#FFFFFF' },
  { slug: 'corea-del-sur', nombre: 'Corea del Sur', apodo: 'Taegeuk Warriors', pais: 'KR', dt: 'Hong Myung-bo', fifaRank: 22, fundacion: 1928, primario: '#CD2E3A', secundario: '#0047A0' },
  { slug: 'australia', nombre: 'Australia', apodo: 'Socceroos', pais: 'AU', dt: 'Tony Popovic', fifaRank: 23, fundacion: 1961, primario: '#FFCD00', secundario: '#005523' },
  { slug: 'iran', nombre: 'Irán', apodo: 'Team Melli', pais: 'IR', dt: 'Amir Ghalenoei', fifaRank: 21, fundacion: 1920, primario: '#239F40', secundario: '#FFFFFF' },
  { slug: 'arabia-saudita', nombre: 'Arabia Saudita', apodo: 'Saudi Falcons', pais: 'SA', dt: 'Roberto Mancini', fifaRank: 56, fundacion: 1956, primario: '#006C35', secundario: '#FFFFFF' },
  { slug: 'catar', nombre: 'Catar', apodo: 'The Maroons', pais: 'QA', dt: 'Marquez Lopez', fifaRank: 38, fundacion: 1960, primario: '#8A1538', secundario: '#FFFFFF' },
  { slug: 'jordania', nombre: 'Jordania', apodo: 'Al Nashama', pais: 'JO', dt: 'Hussein Ammouta', fifaRank: 64, fundacion: 1949, primario: '#000000', secundario: '#CE1126' },
  { slug: 'nueva-zelanda', nombre: 'Nueva Zelanda', apodo: 'All Whites', pais: 'NZ', dt: 'Darren Bazeley', fifaRank: 102, fundacion: 1891, primario: '#FFFFFF', secundario: '#000000' },
  { slug: 'rd-congo', nombre: 'RD Congo', apodo: 'Leopards', pais: 'CD', dt: 'Sebastien Desabre', fifaRank: 60, fundacion: 1919, primario: '#007FFF', secundario: '#FFD700' },
  // Europa más
  { slug: 'inglaterra', nombre: 'Inglaterra', apodo: 'Three Lions', pais: 'GB-ENG', dt: 'Thomas Tuchel', fifaRank: 4, fundacion: 1863, primario: '#FFFFFF', secundario: '#CE1124' },
  { slug: 'suiza', nombre: 'Suiza', apodo: 'Nati', pais: 'CH', dt: 'Murat Yakin', fifaRank: 19, fundacion: 1895, primario: '#FF0000', secundario: '#FFFFFF' },
  { slug: 'eslovaquia', nombre: 'Eslovaquia', apodo: 'Sokoli', pais: 'SK', dt: 'Francesco Calzona', fifaRank: 47, fundacion: 1993, primario: '#0B4EA2', secundario: '#FFFFFF' },
  { slug: 'curazao', nombre: 'Curazao', apodo: 'Yu di Korsou', pais: 'CW', dt: 'Dick Advocaat', fifaRank: 90, fundacion: 1921, primario: '#002B7F', secundario: '#FFD23F' },
  { slug: 'panama', nombre: 'Panamá', apodo: 'La Marea Roja', pais: 'PA', dt: 'Thomas Christiansen', fifaRank: 38, fundacion: 1937, primario: '#DA121A', secundario: '#005AA7' },
  { slug: 'haiti', nombre: 'Haití', apodo: 'Les Grenadiers', pais: 'HT', dt: 'Sebastien Migne', fifaRank: 86, fundacion: 1904, primario: '#00209F', secundario: '#D21034' },
  { slug: 'costa-rica', nombre: 'Costa Rica', apodo: 'Sele', pais: 'CR', dt: 'Gustavo Alfaro', fifaRank: 47, fundacion: 1921, primario: '#002B7F', secundario: '#CE1126' },
  { slug: 'costa-de-marfil', nombre: 'Costa de Marfil', apodo: 'Les Elephants', pais: 'CI', dt: 'Emerse Fae', fifaRank: 42, fundacion: 1960, primario: '#FF8200', secundario: '#009E60' },
  { slug: 'uzbekistan', nombre: 'Uzbekistán', apodo: 'White Wolves', pais: 'UZ', dt: 'Timur Kapadze', fifaRank: 58, fundacion: 1946, primario: '#1EB53A', secundario: '#FFFFFF' },
];

const CONTENT_ROOT = resolve(process.cwd(), 'content/selecciones');

async function seed() {
  let written = 0;
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
      colores: { primario: s.primario ?? '#000000', secundario: s.secundario ?? '#FFFFFF' },
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
    const path = resolve(CONTENT_ROOT, `${s.slug}.json`);
    await writeFile(path, JSON.stringify(data, null, 2) + '\n');
    written++;
    console.log(`Seeded ${s.slug}`);
  }
  console.log(`\nTotal: ${written} selecciones written.`);
}

seed().catch((err) => { console.error(err); process.exit(1); });
