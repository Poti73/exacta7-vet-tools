import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('docs/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, width, height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://127.0.0.1:3000');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `docs/screenshots/${name}.png`, fullPage: true, caret: 'initial' });
  await page.getByRole('searchbox',{name:'Buscar en Exacta7',exact:true}).fill('propofol');
  await page.screenshot({ path: `docs/screenshots/${name}-search.png`, fullPage: true, caret: 'initial' });
  await page.close();
}
await browser.close();

