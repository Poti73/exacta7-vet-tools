export type SupportedLocale = 'es' | 'en' | 'fr';
export type ProInterval = 'monthly' | 'yearly';

type LocalizedText = Record<SupportedLocale, string>;

// Public presentation only. Stripe Price IDs remain server environment values.
const price = (es: string, en: string, fr: string): LocalizedText => ({ es, en, fr });

export const pricingConfig = {
  free: { amountCents: 0, display: price('0 €', '€0', '0 €') },
  pro: {
    monthly: { amountCents: 799, display: price('7,99 €/mes', '€7.99/month', '7,99 €/mois') },
    yearly: {
      amountCents: 5999,
      display: price('59,99 €/año', '€59.99/year', '59,99 €/an'),
      equivalent: price('Equivale a 5 €/mes', 'Equivalent to €5/month', 'Équivaut à 5 €/mois'),
      saving: price('Ahorra 35,89 € al año', 'Save €35.89/year', 'Économisez 35,89 € par an'),
    },
  },
  intervals: { monthly: 'monthly', yearly: 'yearly' } as const,
} as const;

export function getProPrice(interval: ProInterval, locale: SupportedLocale) {
  return pricingConfig.pro[interval].display[locale];
}
