import { describe, expect, it } from 'vitest';
import { getProPrice, pricingConfig } from '../../apps/web/lib/pricing-config';

describe('pricing configuration', () => {
  it('centralises the approved public prices in cents', () => {
    expect(pricingConfig.free.amountCents).toBe(0);
    expect(pricingConfig.pro.monthly.amountCents).toBe(799);
    expect(pricingConfig.pro.yearly.amountCents).toBe(5999);
  });

  it('formats every public locale with the approved annual saving', () => {
    expect(getProPrice('monthly', 'es')).toBe('7,99 €/mes');
    expect(getProPrice('yearly', 'es')).toBe('59,99 €/año');
    expect(pricingConfig.pro.yearly.equivalent.es).toBe('Equivale a 5 €/mes');
    expect(pricingConfig.pro.yearly.saving.es).toBe('Ahorra 35,89 € al año');

    expect(getProPrice('monthly', 'en')).toBe('€7.99/month');
    expect(getProPrice('yearly', 'en')).toBe('€59.99/year');
    expect(pricingConfig.pro.yearly.equivalent.en).toBe('Equivalent to €5/month');
    expect(pricingConfig.pro.yearly.saving.en).toBe('Save €35.89/year');

    expect(getProPrice('monthly', 'fr')).toBe('7,99 €/mois');
    expect(getProPrice('yearly', 'fr')).toBe('59,99 €/an');
    expect(pricingConfig.pro.yearly.equivalent.fr).toBe('Équivaut à 5 €/mois');
    expect(pricingConfig.pro.yearly.saving.fr).toBe('Économisez 35,89 € par an');
  });

  it('does not reintroduce retired public price displays', () => {
    const publicDisplays = [
      ...Object.values(pricingConfig.pro.monthly.display),
      ...Object.values(pricingConfig.pro.yearly.display),
    ].join(' ');

    expect(publicDisplays).not.toContain('9,90');
    expect(publicDisplays).not.toContain('9.90');
    expect(publicDisplays).not.toMatch(/(^|\s)99 €\/año/);
    expect(publicDisplays).not.toMatch(/€99\/year/);
    expect(publicDisplays).not.toMatch(/(^|\s)99 €\/an/);
  });
});
