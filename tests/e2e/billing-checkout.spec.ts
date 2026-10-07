import { test, expect } from '@playwright/test';

const labels = {
  es: { buyer: 'Compro como', monthly: 'Elegir Pro mensual', yearly: 'Elegir Pro anual', annual: 'Anual' },
  en: { buyer: 'I am buying as', monthly: 'Choose Pro monthly', yearly: 'Choose Pro annual', annual: 'Annual' },
  fr: { buyer: 'J’achète en tant que', monthly: 'Choisir Pro mensuel', yearly: 'Choisir Pro annuel', annual: 'Annuel' },
};

for (const locale of ['es', 'en', 'fr'] as const) {
  test(`Checkout requires an explicit buyer type and sends it with the chosen interval (${locale})`, async ({ page }) => {
    await page.addInitScript(value => localStorage.setItem('exacta7-locale', value), locale);
    const requests: unknown[] = [];
    await page.route('**/api/billing/checkout', async route => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'checkout_unavailable' }) });
    });
    page.on('dialog', dialog => dialog.dismiss());
    await page.goto('/planes');
    const t = labels[locale];
    const buyer = page.getByLabel(t.buyer, { exact: true });
    const monthly = page.getByRole('button', { name: t.monthly });
    await expect(monthly).toBeDisabled();
    await buyer.selectOption('business');
    await expect(monthly).toBeEnabled();
    await monthly.click();
    await expect(monthly).toBeEnabled();
    expect(requests).toEqual([{ interval: 'monthly', customer_type: 'business' }]);
    await page.getByRole('button', { name: t.annual, exact: true }).click();
    await buyer.selectOption('individual');
    const yearly = page.getByRole('button', { name: t.yearly });
    await yearly.click();
    await expect(yearly).toBeEnabled();
    expect(requests[1]).toEqual({ interval: 'yearly', customer_type: 'individual' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
