import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { AppShell } from '../components/app-shell';
import { Analytics } from '../components/analytics';
import { pricingConfig } from '../lib/pricing-config';
import './globals.css';
const siteUrl = 'https://exacta7.com';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Exacta7 · Buscador clínico y vademécum veterinario', template: '%s · Exacta7' },
  description: 'Herramienta veterinaria de apoyo a la decisión clínica: medicamentos AEMPS/CIMA Vet, calculadoras transparentes, fuentes trazables y contexto local de paciente.',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', url: siteUrl, siteName: 'Exacta7', locale: 'es_ES', title: 'Exacta7 · Apoyo a la decisión clínica veterinaria', description: 'Medicamentos veterinarios AEMPS/CIMA Vet, cálculo transparente y fuentes trazables.' },
  twitter: { card: 'summary', title: 'Exacta7 · Apoyo a la decisión clínica veterinaria', description: 'Medicamentos veterinarios AEMPS/CIMA Vet, cálculo transparente y fuentes trazables.' },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = { '@context':'https://schema.org', '@graph': [
    { '@type':'WebSite', name:'Exacta7', url:siteUrl, inLanguage:['es','en','fr'], publisher:{ '@type':'Organization', name:'Exacta7', url:siteUrl, email:'info@exacta7.com' } },
    { '@type':'WebApplication', name:'Exacta7', url:siteUrl, applicationCategory:'HealthApplication', applicationSubCategory:'Veterinary clinical decision support', operatingSystem:'Web browser', availableLanguage:['es','en','fr'], audience:{ '@type':'Audience', audienceType:'Veterinary professionals and veterinary students in Spain' }, provider:{ '@type':'Organization', name:'Exacta7', url:siteUrl }, featureList:['Consulta de medicamentos veterinarios AEMPS/CIMA Vet publicados','Calculadoras matemáticas con fórmula y unidades visibles','Fuentes y trazabilidad','Contexto de paciente temporal local'], offers:[{ '@type':'Offer', name:'Exacta7 Gratis', price:pricingConfig.free.amountCents / 100, priceCurrency:'EUR' },{ '@type':'Offer', name:'Exacta7 Pro mensual', price:pricingConfig.pro.monthly.amountCents / 100, priceCurrency:'EUR', billingDuration:'P1M' },{ '@type':'Offer', name:'Exacta7 Pro anual', price:pricingConfig.pro.yearly.amountCents / 100, priceCurrency:'EUR', billingDuration:'P1Y' }] },
  ] };
  return <html lang="es" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});` }}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}/></head><body suppressHydrationWarning><Analytics/><AppShell>{children}</AppShell></body></html>;
}

