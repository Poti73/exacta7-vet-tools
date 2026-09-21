import { describe, expect, it } from 'vitest';
import sitemap from '../../apps/web/app/sitemap';
import robots from '../../apps/web/app/robots';
import { breadcrumbJsonLd, publicMetadata } from '../../apps/web/lib/seo';

describe('GEO and SEO public surfaces', () => {
  it('includes every new decision surface in the sitemap', () => {
    const urls = sitemap().map(entry => entry.url);
    for (const path of ['/comparar', '/comparar/exacta7-vs-cima-vet', '/comparar/exacta7-vs-plumbs', '/comparar/exacta7-vs-vin', '/alternativas/plumbs', '/para/estudiantes-veterinaria', '/para/veterinarios', '/fuentes/actualizaciones-aemps']) {
      expect(urls).toContain(`https://exacta7.com${path}`);
    }
  });

  it('keeps private routes out of crawl directives', () => {
    const rules = robots().rules;
    expect(rules).toMatchObject({ disallow: expect.arrayContaining(['/api/', '/admin/', '/cuenta', '/paciente', '/historial', '/acceso', '/auth/']) });
  });

  it('creates stable canonical and breadcrumb structured data', () => {
    const metadata = publicMetadata('/comparar', 'Comparar herramientas veterinarias', 'Descripción verificable');
    const breadcrumbs = breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Comparar', path: '/comparar' }]);
    expect(metadata.alternates?.canonical).toBe('/comparar');
    expect(breadcrumbs).toMatchObject({ '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: 'https://exacta7.com/' }, { position: 2, item: 'https://exacta7.com/comparar' }] });
  });
});
