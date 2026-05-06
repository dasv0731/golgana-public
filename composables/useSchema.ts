import type {
  SchemaBreadcrumbList,
  SchemaOrganization,
  SchemaWebSite,
  SchemaSportsEvent,
  SchemaSportsTeam,
  SchemaFAQPage,
  SchemaNewsArticle,
  SchemaItemList,
  AnySchema,
} from '~/types/schema';
import type { Equipo, Articulo, FaqEntry } from '~/types/api';

const ORG_NAME = 'Golgana';

function getOrgUrls() {
  const url =
    (typeof useRuntimeConfig === 'function' ? useRuntimeConfig()?.public?.siteUrl : undefined) ??
    'https://golgana.net';
  return {
    url,
    logo: `${url}/logo-golgana.png`,
  };
}

export function buildOrganization(): SchemaOrganization {
  const { url, logo } = getOrgUrls();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url,
    logo,
    address: { '@type': 'PostalAddress', addressCountry: 'EC' },
  };
}

export function buildWebSite(): SchemaWebSite {
  const { url } = getOrgUrls();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}/buscar/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbList(items: Array<{ name: string; url?: string }>): SchemaBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.url && { item: it.url }),
    })),
  };
}

export function buildSportsEvent(args: {
  name: string;
  startDate: string;
  endDate?: string;
  estado: 'upcoming' | 'ongoing' | 'finished' | 'postponed';
  locationName: string;
}): SchemaSportsEvent {
  const statusMap = {
    upcoming: 'https://schema.org/EventScheduled',
    ongoing: 'https://schema.org/EventScheduled',
    finished: 'https://schema.org/EventScheduled',
    postponed: 'https://schema.org/EventPostponed',
  } as const;
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: args.name,
    startDate: args.startDate,
    endDate: args.endDate,
    eventStatus: statusMap[args.estado],
    location: { '@type': 'Place', name: args.locationName },
  };
}

export function buildSportsTeam(equipo: Equipo): SchemaSportsTeam {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: equipo.nombre,
    alternateName: equipo.apodo,
    foundingDate: equipo.fundacion ? `${equipo.fundacion}-01-01` : undefined,
    logo: equipo.escudo.src,
    sameAs: Object.values(equipo.redes).filter(Boolean) as string[],
  };
}

export function buildFAQPage(faqs: FaqEntry[]): SchemaFAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
}

export function buildNewsArticle(art: Articulo, _articleUrl: string): SchemaNewsArticle {
  const { logo } = getOrgUrls();
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsArticle',
    headline: art.titulo,
    image: [art.imagenHero.src],
    datePublished: art.fechaPublicacion,
    dateModified: art.fechaActualizacion,
    author: { '@type': 'Person', name: art.autor.nombre },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      logo: { '@type': 'ImageObject', url: logo },
    },
  };
}

export function buildItemList(items: Array<{ name: string; url?: string }>): SchemaItemList {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
  };
}

export function injectSchema(schemas: AnySchema | AnySchema[]): void {
  const arr = Array.isArray(schemas) ? schemas : [schemas];
  useHead({
    script: arr.map((s) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(s),
    })),
  });
}
