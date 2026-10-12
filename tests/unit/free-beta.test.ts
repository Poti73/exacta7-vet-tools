import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { productMode, canUsePublishedCalculator, publicOffers } from '../../apps/web/lib/product-mode';
import { publishedCalculators } from '../../packages/clinical-core/src/index';

const originalMode = productMode.freeBeta;
beforeEach(() => { productMode.freeBeta = true; });
afterEach(() => { productMode.freeBeta = originalMode; });

describe('free beta release', () => {
  it('opens published Pro tools without falsifying subscription state', () => {
    expect(productMode.freeBeta).toBe(true);
    expect(canUsePublishedCalculator('pro', false)).toBe(true);
    expect(publishedCalculators.some(tool => tool.id === 'dilutions')).toBe(true);
    expect(publishedCalculators.every(tool => tool.reviewState === 'published')).toBe(true);
    expect(publishedCalculators.some(tool => tool.id === 'transfusion')).toBe(false);
  });
  it('advertises only a zero-cost beta offer to crawlers', () => {
    expect(publicOffers()).toEqual([{ '@type': 'Offer', name: 'Exacta7 · Beta gratuita', price: 0, priceCurrency: 'EUR' }]);
  });
  it('restores paid access rules and original prices when beta is turned off', () => {
    productMode.freeBeta = false;
    expect(canUsePublishedCalculator('pro', false)).toBe(false);
    expect(canUsePublishedCalculator('pro', true)).toBe(true);
    expect(canUsePublishedCalculator('free', false)).toBe(true);
    expect(publicOffers().map(offer => offer.price)).toEqual([0, 7.99, 59.99]);
  });
});
