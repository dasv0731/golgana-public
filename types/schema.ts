export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs?: string[];
  address?: {
    '@type': 'PostalAddress';
    addressCountry: string;
    addressLocality?: string;
  };
}

export interface SchemaWebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input': string;
  };
}

export interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface SchemaSportsEvent {
  '@context': 'https://schema.org';
  '@type': 'SportsEvent';
  name: string;
  startDate: string;
  endDate?: string;
  eventStatus: 'https://schema.org/EventScheduled' | 'https://schema.org/EventPostponed' | 'https://schema.org/EventCancelled';
  location: { '@type': 'Place'; name: string; address?: object };
  competitor?: Array<{ '@type': 'SportsTeam'; name: string }>;
  organizer?: { '@type': 'SportsOrganization'; name: string };
}

export interface SchemaSportsTeam {
  '@context': 'https://schema.org';
  '@type': 'SportsTeam';
  name: string;
  alternateName?: string;
  foundingDate?: string;
  location?: object;
  memberOf?: object;
  sameAs?: string[];
  logo?: string;
  athlete?: object[];
}

export interface SchemaFAQPage {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export interface SchemaNewsArticle {
  '@context': 'https://schema.org';
  '@type': 'NewsArticle' | 'SportsArticle';
  headline: string;
  image: string[];
  datePublished: string;
  dateModified?: string;
  author: { '@type': 'Person'; name: string };
  publisher: { '@type': 'Organization'; name: string; logo: { '@type': 'ImageObject'; url: string } };
}

export interface SchemaItemList {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  itemListElement: Array<{ '@type': 'ListItem'; position: number; name: string; url?: string }>;
}

export type AnySchema =
  | SchemaOrganization
  | SchemaWebSite
  | SchemaBreadcrumbList
  | SchemaSportsEvent
  | SchemaSportsTeam
  | SchemaFAQPage
  | SchemaNewsArticle
  | SchemaItemList;
