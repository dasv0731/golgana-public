import { describe, it, expect } from 'vitest';
import { buildBreadcrumbList, buildSportsEvent, buildOrganization } from '~/composables/useSchema';

describe('useSchema builders', () => {
  it('buildBreadcrumbList returns valid schema', () => {
    const r = buildBreadcrumbList([
      { name: 'Inicio', url: 'https://golgana.net/' },
      { name: 'Mundial 2026' },
    ]);
    expect(r['@type']).toBe('BreadcrumbList');
    expect(r.itemListElement).toHaveLength(2);
    expect(r.itemListElement[0]?.position).toBe(1);
  });

  it('buildOrganization includes logo and address', () => {
    const r = buildOrganization();
    expect(r['@type']).toBe('Organization');
    expect(r.logo).toContain('logo-golgana.png');
    expect(r.address?.addressCountry).toBe('EC');
  });

  it('buildSportsEvent maps eventStatus from estado', () => {
    const r = buildSportsEvent({
      name: 'Mundial 2026',
      startDate: '2026-06-11',
      endDate: '2026-07-19',
      estado: 'upcoming',
      locationName: 'Estados Unidos, Canadá, México',
    });
    expect(r.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(r.location.name).toBe('Estados Unidos, Canadá, México');
  });
});
