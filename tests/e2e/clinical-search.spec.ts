import { test, expect } from '@playwright/test';

async function createCase(page: import('@playwright/test').Page, values: { alias: string; species: 'Perro' | 'Gato'; weight: string; asa: string }) {
  await page.getByLabel('Alias opcional').fill(values.alias);
  await page.getByRole('combobox', { name: 'Especie', exact: true }).selectOption(values.species);
  await page.getByLabel('Peso (kg)').fill(values.weight);
  await page.getByRole('combobox', { name: 'ASA', exact: true }).selectOption(values.asa);
  await page.getByRole('button', { name: 'Crear y activar caso' }).click();
}

async function calculatePropofol(page: import('@playwright/test').Page) {
  await page.goto('/calculadoras/dose?medicamento=propofol');
  await page.getByLabel('Indicación', { exact: true }).fill('Prueba matemática sintética');
  await page.getByLabel('Vía', { exact: true }).fill('TEST');
  await page.getByLabel('Dosis seleccionada', { exact: true }).fill('0.1');
  await page.getByRole('combobox', { name: 'Unidad', exact: true }).selectOption('mg/kg');
  await page.getByRole('combobox', { name: 'Origen de la concentración', exact: true }).selectOption('manual');
  await page.getByLabel('Concentración', { exact: true }).fill('0.2');
  await page.getByRole('combobox', { name: 'Unidad de concentración', exact: true }).selectOption('mg/mL');
  await page.getByLabel(/He verificado que/).check();
  await page.getByLabel(/Confirmo el uso profesional/).check();
  await page.getByRole('button', { name: 'Calcular cantidad y volumen' }).click();
}

test('buscador global: teclado, acentos, errores, vacío y ficha', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const input = page.getByRole('searchbox', { name: 'Buscar en Exacta7', exact: true });
  await input.fill('propfol');
  await expect(page.getByText('Correspondencia aproximada · comprueba el nombre').first()).toBeVisible();
  await input.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/medicamentos\/propofol$/);
  for (const title of ['Datos del medicamento', 'Presentaciones', 'Recomendaciones publicadas', 'Calculadoras relacionadas', 'Fuentes']) await expect(page.getByRole('heading', { name: new RegExp(`^${title}$`, 'i') })).toBeVisible();
  await input.fill('sin coincidencia 123456'); await expect(page.getByText('No encontramos coincidencias')).toBeVisible();
  await input.fill('infusion'); await expect(page.getByRole('link', { name: /Infusión continua · CRI/ }).first()).toBeVisible();
  await input.press('Escape'); await expect(page.getByText('No encontramos coincidencias')).not.toBeVisible();
});

test('los filtros de la portada cambian los resultados destacados', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'CALCULADORAS', exact: true }).click();
  await expect(page.getByRole('link', { name: /Dosis y volumen/ }).first()).toBeVisible();
  await page.getByRole('button', { name: 'REFERENCIAS', exact: true }).click();
  await expect(page.getByRole('link', { name: /AEMPS/ }).first()).toBeVisible();
});

test('casos activos aíslan peso, concentración y resultados por case_id', async ({ page }) => {
  await page.goto('/paciente?new=1');
  await createCase(page, { alias: 'Toby', species: 'Perro', weight: '18.4', asa: 'II' });
  await calculatePropofol(page);
  await expect(page.locator('.numeric-result')).toContainText('9.2');
  await expect(page.getByText('Calculado para: Toby · Perro · 18.4 kg · ASA II')).toBeVisible();

  await page.goto('/paciente?new=1');
  await page.getByRole('button', { name: '＋ Nuevo paciente' }).click();
  await createCase(page, { alias: 'Luna', species: 'Gato', weight: '4.7', asa: 'III' });
  await page.goto('/calculadoras/dose?medicamento=propofol');
  await expect(page.getByText('Paciente activo: Luna · Gato · 4.7 kg · ASA III')).toBeVisible();
  await expect(page.getByLabel('Dosis seleccionada', { exact: true })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Origen de la concentración', exact: true })).toHaveValue('');
  await expect(page.locator('.numeric-result')).toHaveCount(0);

  await page.locator('details.case-switcher summary').click();
  await page.getByRole('button', { name: /Toby/ }).click();
  await expect(page.getByText('Ahora trabajando con: Toby · 18.4 kg')).toBeVisible();
  await page.goto('/calculadoras/dose?medicamento=propofol');
  await expect(page.getByText('Paciente activo: Toby · Perro · 18.4 kg · ASA II')).toBeVisible();
  await expect(page.locator('.numeric-result')).toContainText('9.2');
  await expect(page.getByLabel('Concentración', { exact: true })).toHaveValue('0.2');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('finalizar elimina el caso y refresh conserva solo el caso restante', async ({ page }) => {
  await page.goto('/paciente?new=1');
  await createCase(page, { alias: 'Toby', species: 'Perro', weight: '18.4', asa: 'II' });
  await page.getByRole('button', { name: '＋ Nuevo paciente' }).click();
  await createCase(page, { alias: 'Luna', species: 'Gato', weight: '4.7', asa: 'III' });
  await page.getByRole('button', { name: 'Finalizar caso' }).click();
  await expect(page.getByRole('dialog', { name: '¿Finalizar este caso?' })).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Finalizar caso' }).click();
  await expect(page.getByText('Luna', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.case-row strong')).toHaveText('🐕 Toby');
  await expect(page.getByText('Luna', { exact: true })).toHaveCount(0);
});

test('caso expirado exige revisión y reactivación', async ({ page }) => {
  const old = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();
  await page.goto('/');
  await page.evaluate(({ old }) => localStorage.setItem('exacta7.active-cases.v1', JSON.stringify({ version: 1, active_case_id: 'expired', cases: [{ case: { case_id: 'expired', alias: 'Caso antiguo', species: 'Perro', weight: '18.4', asa: 'II', created_at: old, last_activity_at: old, status: 'ACTIVE' }, tools: {}, calculations: [] }] })), { old });
  await page.goto('/calculadoras/dose?medicamento=propofol');
  await expect(page.getByText('Crear un caso antes de calcular')).toBeVisible();
  await page.goto('/paciente');
  await expect(page.locator('.case-row')).toContainText('EXPIRED');
  await page.getByRole('button', { name: 'Revisar y reactivar' }).click();
  await expect(page.locator('.case-row')).toContainText('Caso antiguo');
  await expect(page.locator('.case-row')).toContainText('ACTIVE');
});

test('footer incluye crédito dofollow de Dentro Marketing', async ({ page }) => {
  await page.goto('/');
  const credit = page.getByRole('link', { name: 'Dentro Marketing', exact: true });
  await expect(credit).toHaveAttribute('href', 'https://dentromarketing.es');
  await expect(credit).toHaveAttribute('rel', 'noopener');
  expect((await credit.getAttribute('rel')) ?? '').not.toMatch(/nofollow|sponsored|ugc/);
});
