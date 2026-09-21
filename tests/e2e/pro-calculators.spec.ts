import { test, expect } from '@playwright/test';

test('visitante anónimo en /calculadoras/dilutions ve preview y aviso Pro, no puede calcular y ve CTA a /acceso y /planes', async ({ page }) => {
  await page.goto('/calculadoras/dilutions');
  await expect(page.getByRole('heading', { name: 'Diluciones', exact: true })).toBeVisible();
  const notice = page.locator('.notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('Exacta7 Pro');
  await expect(notice.getByRole('link', { name: /Acceder para calcular/ })).toHaveAttribute('href', '/acceso?next=/calculadoras/dilutions');
  await expect(notice.getByRole('link', { name: /Ver planes/ })).toHaveAttribute('href', '/planes');

  const calculateBtn = page.getByRole('button', { name: /Calcular/ });
  await expect(calculateBtn).toBeDisabled();
  await expect(page.locator('.numeric-result')).toHaveCount(0);
});

test('visitante anónimo en /calculadoras/drip-rate ve preview y aviso Pro, no puede calcular y ve CTA a /acceso y /planes', async ({ page }) => {
  await page.goto('/calculadoras/drip-rate');
  await expect(page.getByRole('heading', { name: 'Velocidad de goteo', exact: true })).toBeVisible();
  const notice = page.locator('.notice');
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('Exacta7 Pro');
  await expect(notice.getByRole('link', { name: /Acceder para calcular/ })).toHaveAttribute('href', '/acceso?next=/calculadoras/drip-rate');
  await expect(notice.getByRole('link', { name: /Ver planes/ })).toHaveAttribute('href', '/planes');

  const calculateBtn = page.getByRole('button', { name: /Calcular/ });
  await expect(calculateBtn).toBeDisabled();
  await expect(page.locator('.numeric-result')).toHaveCount(0);
});

test('calculadora Free /calculadoras/unit-converter funciona normalmente sin bloqueo', async ({ page }) => {
  await page.goto('/calculadoras/unit-converter');
  await expect(page.getByRole('heading', { name: 'Conversor de unidades', exact: true })).toBeVisible();
  await expect(page.locator('.notice')).toHaveCount(0);

  await page.getByLabel('Valor', { exact: true }).fill('5');
  await page.getByRole('combobox', { name: 'Unidad de origen', exact: true }).selectOption('mg');
  await page.getByRole('combobox', { name: 'Unidad de destino', exact: true }).selectOption('µg');
  await page.getByRole('button', { name: /Calcular/ }).click();

  await expect(page.locator('.numeric-result')).toContainText('5000 µg');
});
