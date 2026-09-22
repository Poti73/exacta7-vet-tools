import type { Metadata } from 'next';
import { Pricing } from '../../components/pricing';
import { pricingConfig } from '../../lib/pricing-config';

// Pricing is business-critical and must not be served from a year-long static cache.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Planes y precios de Exacta7 Pro',
  description: 'Compara Exacta7 Gratis y Pro. Pro mensual: 7,99 €/mes; Pro anual: 59,99 €/año, equivalente a 5 €/mes.',
  alternates: { canonical: '/planes' },
  openGraph: { title: 'Planes y precios de Exacta7 Pro', description: 'Compara Exacta7 Gratis y Pro para elegir el nivel de apoyo adecuado para tu práctica.' },
};

const faq = [
  { question: '¿Puedo empezar gratis?', answer: 'Sí. Exacta7 Gratis incluye una cuenta, el buscador clínico, el vademécum AEMPS público y las herramientas de cálculo esenciales.' },
  { question: '¿Qué añade Exacta7 Pro?', answer: 'Pro incluye las herramientas de diluciones y goteo, registros de cálculo transparentes y soporte prioritario.' },
  { question: '¿Cuál es la diferencia entre el plan mensual y el anual?', answer: `Ambos incluyen las mismas funciones Pro. El mensual cuesta ${pricingConfig.pro.monthly.display.es}. El anual se factura una vez al año por ${pricingConfig.pro.yearly.display.es}, ${pricingConfig.pro.yearly.equivalent.es.toLowerCase()}, con un ${pricingConfig.pro.yearly.saving.es.toLowerCase()}.` },
  { question: '¿Cómo funciona la cancelación y qué ocurre con el acceso?', answer: 'Puedes cancelar en cualquier momento desde tu cuenta. La cancelación impide la siguiente renovación automática y mantienes el acceso completo a Exacta7 Pro hasta que concluya el período ya pagado.' },
];

export default function Page() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'FAQPage', mainEntity: faq.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
      { '@type': 'Service', name: 'Exacta7 Pro', url: 'https://exacta7.com/planes', offers: [{ '@type': 'Offer', name: 'Exacta7 Pro mensual', price: pricingConfig.pro.monthly.amountCents / 100, priceCurrency: 'EUR', billingDuration: 'P1M' }, { '@type': 'Offer', name: 'Exacta7 Pro anual', price: pricingConfig.pro.yearly.amountCents / 100, priceCurrency: 'EUR', billingDuration: 'P1Y' }] },
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}/><Pricing /></>;
}
