import { pricingConfig } from './pricing-config';

// Release setting shared by server and client. Restore paid mode only after review.
export const productMode: { freeBeta: boolean } = { freeBeta: true };

export function canUsePublishedCalculator(plan: 'free' | 'pro', isPro: boolean) {
  return productMode.freeBeta || plan === 'free' || isPro;
}

export function publicOffers() {
  if (productMode.freeBeta) return [{ '@type': 'Offer', name: 'Exacta7 · Beta gratuita', price: 0, priceCurrency: 'EUR' }];
  return [
    { '@type': 'Offer', name: 'Exacta7 Gratis', price: 0, priceCurrency: 'EUR' },
    { '@type': 'Offer', name: 'Exacta7 Pro mensual', price: pricingConfig.pro.monthly.amountCents / 100, priceCurrency: 'EUR', billingDuration: 'P1M' },
    { '@type': 'Offer', name: 'Exacta7 Pro anual', price: pricingConfig.pro.yearly.amountCents / 100, priceCurrency: 'EUR', billingDuration: 'P1Y' },
  ];
}
