import type { MetadataRoute } from 'next';
import { regulatoryProducts, regulatoryRelease } from '@exacta7/knowledge/regulatory';

const base = 'https://exacta7.com';
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(regulatoryRelease.release.sourceDataDate);
  const staticRoutes = ['', '/medicamentos', '/calculadoras', '/fuentes', '/sobre-exacta7', '/contacto', '/privacidad', '/cookies'];
  return [
    ...staticRoutes.map((path, index) => ({ url: `${base}${path}`, lastModified, changeFrequency: index < 2 ? 'weekly' as const : 'monthly' as const, priority: index === 0 ? 1 : index === 1 ? .9 : .6 })),
    ...regulatoryProducts.map(product => ({ url: `${base}/medicamentos/${product.slug}`, lastModified, changeFrequency: 'monthly' as const, priority: .7 })),
  ];
}
