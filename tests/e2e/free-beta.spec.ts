import { test, expect } from '@playwright/test';
import { betaCopy } from '../../apps/web/lib/beta-copy';
import { productMode } from '../../apps/web/lib/product-mode';

test.skip(!productMode.freeBeta, 'Beta checks apply to the free release.');

for (const locale of ['es', 'en', 'fr'] as const) {
  test(`free beta page and terms are consistent (${locale})`, async ({ page }, testInfo) => {
    await page.addInitScript(value => localStorage.setItem('exacta7-locale', value), locale);
    await page.goto('/planes');
    await expect(page.getByRole('heading', { name: betaCopy[locale].title, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: betaCopy[locale].cta })).toHaveAttribute('href', '/calculadoras');
    await expect(page.locator('main')).not.toContainText(/7,99|59,99|7\.99|59\.99|Stripe/);
    await expect(page.locator('main select')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll(elements => elements.map(element => JSON.parse(element.textContent ?? '{}')));
    const offers = graphs.flatMap(graph => graph['@graph'] ?? []).flatMap(node => node.offers ?? []);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every(offer => offer.price === 0 && !offer.billingDuration)).toBe(true);
    if (locale === 'es') {
      await page.getByRole('button', { name: 'Solo necesarias', exact: true }).click();
      await expect(page.locator('.cookie-banner')).toHaveCount(0);
      await page.screenshot({ path: `docs/screenshots/free-beta-${testInfo.project.name}.png`, fullPage: true });
    }
    await page.goto('/terminos');
    await expect(page.getByRole('heading', { name: betaCopy[locale].termsTitle })).toBeVisible();
    await expect(page.locator('main')).not.toContainText(/7,99|59,99|7\.99|59\.99|Stripe/);
  });
}

test('anonymous users can calculate dilutions and drip rate and see no Pro gate', async ({ page }) => {
  await page.goto('/calculadoras/dilutions');
  await expect(page.locator('.notice')).toHaveCount(0);
  await page.getByLabel('Concentración inicial (mg/mL)', { exact: true }).fill('10');
  await page.getByLabel('Concentración final (mg/mL)', { exact: true }).fill('2');
  await page.getByLabel('Volumen final (mL)', { exact: true }).fill('50');
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  await expect(page.locator('.numeric-result')).toContainText('10 mL');
  await page.goto('/calculadoras/drip-rate');
  await page.getByLabel('Caudal (mL/h)', { exact: true }).fill('60');
  await page.getByLabel('Factor de goteo del equipo (gotas/mL)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Calcular', exact: true }).click();
  await expect(page.locator('.numeric-result')).toContainText('20');
  const pending = await page.goto('/calculadoras/transfusion');
  expect(pending?.status()).toBe(404);
});

test('direct checkout and portal calls cannot open Stripe during beta', async ({ request }) => {
  for (const endpoint of ['checkout', 'portal']) {
    const response = await request.post(`/api/billing/${endpoint}`, { data: { interval: 'monthly', customer_type: 'business' } });
    expect(response.status()).toBe(403);
    expect(await response.json()).toEqual({ error: 'billing_paused_free_beta' });
  }
});
