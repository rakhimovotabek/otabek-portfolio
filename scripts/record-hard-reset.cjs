/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3005';
const out = path.resolve('docs/design-research/reset/recordings');
const raw = '/tmp/otabek-browser-qa/raw-reset';
const clips = [];
const only = process.env.RECORD_ONLY;
const duration = file => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());
async function ready(page) { await page.evaluate(() => document.fonts.ready); await page.waitForFunction(() => document.querySelector('.route-cover')?.dataset.state === 'idle'); await page.waitForTimeout(650); }
(async () => {
  fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(raw, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    for (const route of ['work', 'gallery'].filter(route => !only || only === route)) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: raw, size: { width: 910, height: 512 } } });
      const page = await context.newPage(); await page.goto(`${base}/${route}`); await ready(page);
      await page.waitForFunction(() => document.querySelector('[data-signature]').className.includes('enhanced'));
      await page.waitForFunction(() => [...document.querySelectorAll('[data-signature] img')].every(i => i.complete)); await page.waitForTimeout(2000);
      const seconds = route === 'work' ? 18 : 16;
      const samples = await page.evaluate(async seconds => {
        const h = document.querySelector('[data-signature]') || document.querySelector('[data-study-plate]'); const top = h.getBoundingClientRect().top + scrollY;
        const range = Math.max(600, h.offsetHeight - (h.querySelector('[data-stage]')?.offsetHeight || 0)); scrollTo({ top, behavior: 'instant' });
        const start = performance.now(); const samples=[]; let sampleAt=0;
        while (performance.now() - start < seconds * 1000) {
          await new Promise(requestAnimationFrame); const elapsed = performance.now() - start;
          const p = seconds === 18 ? (elapsed < 1500 ? 0 : elapsed < 7500 ? (elapsed - 1500) / 6000 : elapsed < 9500 ? 1 : elapsed < 15500 ? 1 - (elapsed - 9500) / 6000 : 0) : (elapsed < 1000 ? 0 : elapsed < 7500 ? (elapsed - 1000) / 6500 : elapsed < 8500 ? 1 : elapsed < 15000 ? 1 - (elapsed - 8500) / 6500 : 0);
          scrollTo({ top: top + range * p, behavior: 'instant' });
          if(elapsed>=sampleAt){samples.push({timeMs:Math.round(elapsed),desired:p,observed:h.dataset.progress});sampleAt+=1000;}
        }
        return samples;
      }, seconds);
      fs.writeFileSync(`${out}/${route}-progress.json`,JSON.stringify(samples,null,2));
      const video = page.video(); await context.close();
      fs.copyFileSync(await video.path(), `${out}/${route}-scroll.webm`);
      clips.push({ name: `${route}-scroll.webm`, viewport: '1366x768', recording: '910x512', interactionDurationSeconds: seconds, durationSeconds: duration(`${out}/${route}-scroll.webm`), playbackSpeed: 1, input: 'native scrollTo, forward and reverse on a browser clock with endpoint holds; complete browser capture including loading/warmup' });
    }
    for (const width of (!only || only === 'albums' ? [1366, 390] : [])) {
      const context = await browser.newContext({ viewport: { width, height: width === 1366 ? 768 : 844 }, hasTouch: width === 390, recordVideo: { dir: raw, size: width === 1366 ? { width: 910, height: 512 } : { width: 390, height: 844 } } });
      const page = await context.newPage(); await page.goto(`${base}/gallery`); await ready(page); await page.waitForFunction(()=>[...document.querySelectorAll('[data-gallery-aperture] img')].every(i=>i.complete)); const start = Date.now();
      await page.waitForTimeout(700); await page.locator('[data-gallery-aperture] button').first().click(); await page.locator('.album-dialog[open]').waitFor(); await page.waitForTimeout(1200);
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1200); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(1200);
      await page.keyboard.press('Escape'); await page.locator('.album-dialog').waitFor({ state: 'hidden' }); await page.waitForTimeout(700);
      const remaining = 12000 - (Date.now() - start); if (remaining > 0) await page.waitForTimeout(remaining);
      const video = page.video(); await context.close();
      fs.copyFileSync(await video.path(), `${out}/${width}-album.webm`);
      clips.push({ name: `${width}-album.webm`, viewport: `${width}x${width === 1366 ? 768 : 844}`, recording: width === 1366 ? '910x512' : '390x844', interactionDurationSeconds: 12, durationSeconds: duration(`${out}/${width}-album.webm`), playbackSpeed: 1, input: 'print → aperture-to-print growth → right/left arrows → Escape → original print; complete browser capture including loading/warmup' });
    }
  } finally { await browser.close(); }
  const prior = only && fs.existsSync(`${out}/clips.json`) ? JSON.parse(fs.readFileSync(`${out}/clips.json`, 'utf8')) : [];
  fs.writeFileSync(`${out}/clips.json`, JSON.stringify([...prior.filter(clip => !clips.some(next => next.name === clip.name)), ...clips], null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
