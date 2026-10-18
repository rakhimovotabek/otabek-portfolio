/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3005';
const out = path.resolve('docs/design-research/after/recordings');
const raw = '/tmp/otabek-browser-qa/raw-after';
const clips = [];
const duration = file => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());
async function ready(page) { await page.evaluate(() => document.fonts.ready); await page.waitForFunction(() => document.querySelector('.route-cover')?.dataset.state === 'idle'); await page.waitForTimeout(650); }
(async () => {
  fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(raw, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    for (const route of ['work', 'gallery']) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: raw, size: { width: 910, height: 512 } } });
      const created = Date.now(); const page = await context.newPage(); await page.goto(`${base}/${route}`); await ready(page);
      if (route === 'work') await page.waitForFunction(() => document.querySelector('[data-signature]').className.includes('enhanced'));
      const offset = (Date.now() - created) / 1000;
      await page.evaluate(async () => {
        const h = document.querySelector('[data-signature]') || document.querySelector('[data-study-plate]'); const top = h.getBoundingClientRect().top + scrollY;
        const range = Math.max(600, h.offsetHeight - (h.querySelector('[data-stage]')?.offsetHeight || 0)); scrollTo({ top, behavior: 'instant' });
        const start = performance.now();
        while (performance.now() - start < 16000) {
          await new Promise(requestAnimationFrame); const elapsed = performance.now() - start;
          const p = elapsed < 1000 ? 0 : elapsed < 7500 ? (elapsed - 1000) / 6500 : elapsed < 8500 ? 1 : elapsed < 15000 ? 1 - (elapsed - 8500) / 6500 : 0;
          scrollTo({ top: top + range * p, behavior: 'instant' });
        }
      });
      const video = page.video(); await context.close();
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', String(offset), '-i', await video.path(), '-t', '16', '-c:v', 'libvpx-vp9', '-threads', '1', '-crf', '36', '-b:v', '0', '-y', `${out}/${route}-scroll.webm`]);
      clips.push({ name: `${route}-scroll.webm`, viewport: '1366x768', recording: '910x512', targetDurationSeconds: 16, durationSeconds: duration(`${out}/${route}-scroll.webm`), playbackSpeed: 1, input: 'native scrollTo, forward and reverse on a 16s browser clock; warmup trimmed' });
    }
    for (const width of [1366, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 1366 ? 768 : 844 }, hasTouch: width === 390, recordVideo: { dir: raw, size: width === 1366 ? { width: 910, height: 512 } : { width: 390, height: 844 } } });
      const created = Date.now(); const page = await context.newPage(); await page.goto(`${base}/gallery`); await ready(page); const offset = (Date.now() - created) / 1000; const start = Date.now();
      await page.waitForTimeout(700); await page.locator('[data-study-plate] a[aria-label]').first().click(); await page.waitForURL('**/gallery/site-studies'); await ready(page);
      await page.locator('.view-study').first().click(); await page.locator('.album-dialog[open]').waitFor(); await page.waitForTimeout(1200);
      await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1200); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(1200);
      await page.keyboard.press('Escape'); await page.locator('.album-dialog').waitFor({ state: 'hidden' }); await page.waitForTimeout(700); await page.goBack(); await ready(page);
      const remaining = 20000 - (Date.now() - start); if (remaining > 0) await page.waitForTimeout(remaining);
      const video = page.video(); await context.close();
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', String(offset), '-i', await video.path(), '-t', '20', '-c:v', 'libvpx-vp9', '-threads', '1', '-crf', '36', '-b:v', '0', '-y', `${out}/${width}-album.webm`]);
      clips.push({ name: `${width}-album.webm`, viewport: `${width}x${width === 1366 ? 768 : 844}`, recording: width === 1366 ? '910x512' : '390x844', targetDurationSeconds: 20, durationSeconds: duration(`${out}/${width}-album.webm`), playbackSpeed: 1, input: 'collection link → viewer → right/left arrows → Escape → browser Back' });
    }
  } finally { await browser.close(); }
  fs.writeFileSync(`${out}/clips.json`, JSON.stringify(clips, null, 2));
})().catch(e => { console.error(e); process.exitCode = 1; });
