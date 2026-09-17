import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AppShell } from '../components/app-shell';
import { Analytics } from '../components/analytics';
import './globals.css';
const siteUrl = 'https://exacta7.com';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Exacta7 · Buscador clínico y vademécum veterinario', template: '%s · Exacta7' },
  description: 'Consulta medicamentos veterinarios AEMPS, presentaciones, calculadoras y fuentes clínicas con trazabilidad.',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', url: siteUrl, siteName: 'Exacta7', locale: 'es_ES', title: 'Exacta7 · Buscador clínico y vademécum veterinario', description: 'Medicamentos veterinarios AEMPS, herramientas de cálculo y fuentes trazables.' },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = { '@context':'https://schema.org', '@type':'WebSite', name:'Exacta7', url:siteUrl, inLanguage:['es','en','fr'], publisher:{ '@type':'Organization', name:'Exacta7', url:siteUrl, email:'info@exacta7.com' } };
  return <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});` }}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}/></head><body suppressHydrationWarning><Analytics/><AppShell>{children}</AppShell></body></html>;
}

