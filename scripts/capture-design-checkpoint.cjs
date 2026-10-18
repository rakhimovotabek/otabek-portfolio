/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3005';
const out = path.resolve('docs/design-research/after');
const states = [];
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => document.querySelector('.route-cover')?.dataset.state === 'idle');
  if (await page.locator('[data-signature]').count() && page.viewportSize().width >= 800) {
    await page.waitForFunction(() => document.querySelector('[data-signature]').className.includes('enhanced'));
  }
  await page.waitForTimeout(650);
}
async function snap(page, route, name) {
  const width = page.viewportSize().width;
  await page.screenshot({ path: `${out}/${width}-${route}-${name}.png` });
  states.push({ route, name, width, ...(await page.evaluate(() => ({
    y: scrollY, height: innerHeight, scrollHeight: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
  }))) });
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    for (const width of [1366, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 1366 ? 768 : 844 }, hasTouch: width === 390 });
      const page = await context.newPage();
      for (const route of ['home', 'work', 'gallery']) {
        await page.goto(`${base}/${route === 'home' ? '' : route}`, { waitUntil: 'domcontentloaded' });
        await ready(page);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await snap(page, route, 'opening');
        if (route === 'home') continue;
        for (const [name, p] of [['feature', .27], ['handoff', .77], ['resolved', 1]]) {
          await page.evaluate(({ route, p }) => {
            const h = document.querySelector(`[data-signature="${route}"]`) || document.querySelector('[data-study-plate]');
            const range = h.offsetHeight - (h.querySelector('[data-stage]')?.offsetHeight || 0);
            scrollTo({ top: h.getBoundingClientRect().top + scrollY + range * p, behavior: 'instant' });
          }, { route, p });
          await page.waitForTimeout(650);
          await snap(page, route, name);
        }
        await page.locator(route === 'work' ? '#work-collaboration' : '#gallery-collections').scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await snap(page, route, 'ending');
      }
      await context.close();
    }
    fs.writeFileSync(`${out}/states.json`, JSON.stringify(states, null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
