/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA. */
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:3005';
const out = path.resolve('docs/design-research/overhaul/verification');
const report = { session: { base, build: 'production', browser: 'Chromium', workers: 1, seeded: false, liveWrites: false }, states: [], checks: [], runtime: { console: [], pageErrors: [], failed: [], badStatus: [] }, axe: [] };
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  if (await page.locator('.route-cover').count()) await page.waitForFunction(() => document.querySelector('.route-cover').dataset.state === 'idle');
  await page.waitForTimeout(400);
}
async function go(page, route) {
  assert.equal((await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' })).status(), 200, route);
  await ready(page);
}
async function progress(page, p) {
  await page.locator('[data-signature="work"]').evaluate((h, p) => scrollTo({ top: h.getBoundingClientRect().top + scrollY + (h.offsetHeight - h.querySelector('[data-stage]').offsetHeight) * p, behavior: 'instant' }), p);
  await page.waitForTimeout(650);
}
function listen(page) {
  page.on('pageerror', e => report.runtime.pageErrors.push({ route: page.url(), message: e.message }));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) report.runtime.console.push({ type: m.type(), route: page.url(), text: m.text() }); });
  page.on('requestfailed', r => report.runtime.failed.push({ url: r.url(), reason: r.failure()?.errorText }));
  page.on('response', r => { if (r.status() >= 400) report.runtime.badStatus.push({ url: r.url(), status: r.status() }); });
}
async function measure(page, label) {
  const data = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    navX: document.querySelector('.wordmark').getBoundingClientRect().x,
    mainX: document.querySelector('.inner-page')?.getBoundingClientRect().x,
    media: [...document.querySelectorAll('[data-signature="gallery"] .media-window')].map(e => ({ width: e.getBoundingClientRect().width, height: e.getBoundingClientRect().height, clipPath: getComputedStyle(e).clipPath })),
    theme: (() => { const e = document.querySelector('.inner-page'); const s = getComputedStyle(e); return { bg: s.backgroundColor, fg: s.color, gutter: s.getPropertyValue('--page-gutter').trim(), columns: s.getPropertyValue('--grid-columns').trim() }; })(),
  }));
  report.states.push({ label, width: page.viewportSize().width, ...data });
  assert.equal(data.overflow, false, `${label}: document overflow`);
  return data;
}
async function axe(page, name, include) {
  const scan = await new AxeBuilder({ page }).include(include).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  fs.writeFileSync(`${out}/axe-${name}.json`, JSON.stringify(scan));
  report.axe.push({ name, violations: scan.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), incomplete: scan.incomplete.map(v => v.id) });
  assert.equal(scan.violations.length, 0, `axe ${name}: ${scan.violations.map(v => v.id)}`);
}
async function viewer(page, width) {
  const opener = page.locator('.view-study').first();
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await page.locator('.album-dialog[open]').waitFor();
  await page.waitForTimeout(750);
  assert.equal(await page.locator('.album-dialog').evaluate(e => e.contains(document.activeElement)), true);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(650);
  assert.match(await page.locator('.album-viewer-controls p').innerText(), /Lines around an absence/);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(650);
  assert.match(await page.locator('.album-viewer-controls p').innerText(), /Open volume/);
  for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
  assert.equal(await page.locator('.album-dialog').evaluate(e => e.contains(document.activeElement)), true);
  if (width === 1366) await axe(page, 'viewer', '.album-dialog[open]');
  await page.screenshot({ path: `${out}/${width}-viewer.png` });
  await page.keyboard.press('Escape');
  await page.locator('.album-dialog').waitFor({ state: 'hidden' });
  assert.equal(await opener.evaluate(e => e === document.activeElement), true);
  await page.waitForFunction(() => document.documentElement.style.overflow === '', { timeout: 1000 });
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
  if (width === 390) {
    await opener.click(); await page.locator('.album-dialog[open]').waitFor(); await page.waitForTimeout(750);
    await page.locator('.album-viewer-image').evaluate(e => {
      e.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [new Touch({ identifier: 1, target: e, clientX: 280, clientY: 300 })] }));
      e.dispatchEvent(new TouchEvent('touchend', { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: e, clientX: 90, clientY: 300 })] }));
    });
    await page.waitForTimeout(650);
    assert.match(await page.locator('.album-viewer-controls p').innerText(), /Lines around an absence/);
    await page.keyboard.press('Escape'); await page.locator('.album-dialog').waitFor({ state: 'hidden' });
  }
  report.checks.push(`viewer ${width}: arrows, Escape, trap, focus return, scroll unlock${width === 390 ? ', synthetic swipe' : ''}`);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ['--no-sandbox'] });
  try {
    for (const width of [1366, 390, 320, 768, 1024]) {
      const context = await browser.newContext({ viewport: { width, height: width >= 800 ? 768 : 844 }, hasTouch: width < 800 });
      const page = await context.newPage(); listen(page);
      await go(page, '/work');
      if (width >= 800) {
        await page.waitForFunction(() => document.querySelector('[data-signature]').className.includes('enhanced'));
        const cta = await page.locator('[data-exhibit-copy] a').first().boundingBox();
        assert.ok(cta.y >= 0 && cta.y + cta.height <= 768, `Opening CTA ${width}: ${JSON.stringify(cta)}`);
        let initial;
        for (const p of [0, .25, .5, .75, 1, .25]) {
          await progress(page, p);
          const box = await page.locator('[data-exhibit-art]').first().boundingBox();
          if (p === .25 && !initial) initial = box;
          else if (p === .25) assert.ok(Math.abs(initial.x - box.x) < 2 && Math.abs(initial.width - box.width) < 2, 'reversible Work');
        }
        await page.locator('[data-jump]').nth(1).click();
        await page.waitForFunction(() => !document.querySelectorAll('[data-exhibit]')[1].inert);
        assert.equal(await page.locator('[data-exhibit-caption]').nth(1).evaluate(e => getComputedStyle(e).fontSize), '14px');
        if (width === 1366) await axe(page, 'work-exhibit', '.work-page');
      } else assert.equal(await page.locator('[data-signature]').evaluate(e => e.className.includes('enhanced')), false);
      await measure(page, 'work');
      assert.equal(await page.locator('[data-exhibit-art] img').count(),4);
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-exhibit-art] img')].every(i=>i.complete&&i.naturalWidth>0));
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      const contact=page.locator('.nav-correspondence button'); assert.equal(await contact.isVisible(),true);
      await contact.click(); await page.locator('.contact-dialog').waitFor({state:'visible'});
      await page.keyboard.press('Escape'); assert.equal(await contact.evaluate(e=>e===document.activeElement),true);
      assert.equal(await page.locator('.message-button').isVisible(),false);
      await page.locator('[data-work-index] details summary').first().focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('[data-work-index] details').first().evaluate(e => e.open), true);
      assert.equal(await page.locator('[data-work-index] article').count(), 5);
      if (width === 1366) {
        await page.locator('#work-collaboration').scrollIntoViewIfNeeded();
        const opener = page.locator('#work-collaboration').getByRole('button', { name: 'Collaborate on this project', exact: true });
        await opener.click(); await page.locator('.contact-dialog').waitFor({ state: 'visible' });
        assert.match(await page.locator('.contact-dialog').getByLabel('Your message', { exact: true }).inputValue(), /Project: sat-chi/);
        const field = page.locator('.contact-dialog').getByLabel('Your message', { exact: true });
        if (await field.isEnabled()) await field.fill('Project: sat-chi — review only, no submission');
        else report.checks.push('Message editing untested: preview submissions disabled; no Turnstile site key. Prefill and dialog open/close verified.');
        await page.keyboard.press('Escape'); assert.equal(await opener.evaluate(e => e === document.activeElement), true);
        await page.locator('.category-navigation a[href="/work?category=physical"]').click(); await page.waitForURL('**/work?category=physical'); await ready(page);
        await page.getByText('No works in this category have been published yet.').waitFor();
        assert.equal(await page.locator('[data-work-index] article').count(), 0);
        await go(page, '/work'); await progress(page, .27);
        await page.locator('[data-exhibit-copy] a').first().click(); await page.waitForURL('**/work/sat-chi'); await ready(page);
        await page.locator('.community-form[data-project-id="sat-chi"]').waitFor(); await page.reload(); await ready(page);
        await page.goBack(); await ready(page); assert.equal(new URL(page.url()).pathname, '/work');
      }
      await go(page, '/gallery');
      await measure(page, 'gallery');
      assert.equal(await page.locator('[data-signature="gallery"]').count(), 1);
      assert.equal(await page.locator('[data-signature="gallery"] h1').count(), 1);
      assert.equal(await page.locator('[data-gallery-aperture] a').count(), 3);
      if (width >= 800) {
        await page.waitForFunction(() => document.querySelector('[data-signature="gallery"]').className.includes('enhanced'));
        const set = async v => { await page.locator('[data-signature="gallery"]').evaluate((h,v) => scrollTo({top:h.getBoundingClientRect().top+scrollY+(h.offsetHeight-innerHeight)*v,behavior:'instant'}),v); await page.waitForTimeout(650); };
        await set(.25); const initial = await page.locator('[data-gallery-frame]').first().boundingBox();
        await set(.96);
        assert.ok(Math.abs(await page.locator('[data-gallery-surface]').evaluate(e => new DOMMatrix(getComputedStyle(e).transform).m42)) < 1, 'Gallery paper transition completes');
        for (const frame of await page.locator('[data-gallery-aperture] a').all()) {
          assert.equal(await frame.evaluate(e => { const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }),true,'Print remains directly browseable');
        }
        if (width === 1366) await axe(page, 'gallery-unfolded', '.gallery-page');
        await set(.25); const reversed = await page.locator('[data-gallery-frame]').first().boundingBox();
        assert.ok(Math.abs(initial.x-reversed.x)<2 && Math.abs(initial.width-reversed.width)<2, 'Gallery reverses');
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(650);
        const action = page.locator('[data-gallery-enter]');
        const box = await action.boundingBox(); assert.ok(box.y+box.height<=768, 'Gallery action within opening viewport');
        if (width === 1366) await axe(page, 'gallery-desktop', '.gallery-page');
      }
      if (width === 390) { await axe(page, 'gallery-mobile', '.gallery-page'); await page.getByLabel('Toggle navigation').click(); await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Work', exact: true }).waitFor({ state: 'visible' }); await page.getByLabel('Toggle navigation').click(); }
      await page.screenshot({ path: `${out}/${width}-gallery.png` });
      if ([1366, 390].includes(width)) {
        await page.locator('[data-gallery-aperture] a').first().click(); await page.waitForURL(u=>u.pathname==='/gallery/site-studies'); await ready(page);
        await viewer(page, width); await page.goBack(); await ready(page); assert.equal(new URL(page.url()).pathname, '/gallery');
      }
      report.checks.push(`Work/Gallery ${width}: reflow, source media, project index, reversible gallery, targets`);
      await context.close();
    }
    for (const mode of ['reduced', 'nojs']) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'nojs' });
      const page = await context.newPage();
      for (const route of ['work', 'gallery']) {
        await page.goto(`${base}/${route}`, { waitUntil: 'load' }); await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('[data-signature]').evaluateAll(es => es.some(e => e.className.includes('enhanced'))), false);
        if (route === 'work') { assert.equal(await page.locator('[data-exhibit]').evaluateAll(es => es.some(e => e.inert)), false); await page.locator('[data-work-index] details summary').first().click(); assert.equal(await page.locator('[data-work-index] details p').first().isVisible(), true); }
        await measure(page, `${mode}-${route}`); await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: `${out}/${mode}-${route}.png` });
      }
      if (mode === 'reduced') { await go(page, '/gallery/site-studies'); await viewer(page, 1366); }
      report.checks.push(`${mode}: readable content, links, media, native disclosures, no scroll trap`); await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } }); const page = await context.newPage(); listen(page);
    await go(page, '/'); await page.locator('.hero-journey.is-enhanced').waitFor();
    await page.evaluate(() => { const h = document.querySelector('[data-hero-journey]'); scrollTo({ top: (h.offsetHeight - h.querySelector('[data-hero-stage]').offsetHeight) * .56, behavior: 'instant' }); });
    await page.waitForTimeout(650); assert.equal(await page.locator('[data-hero-journey]').getAttribute('data-hero-phase'), 'focus');
    await page.screenshot({ path: `${out}/home-focus.png` });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); await page.locator('.desktop-nav a[href="/work"]').click(); await page.waitForURL('**/work'); await ready(page);
    const alignment = [];
    for (let i = 0; i < 15; i++) {
      const route = i % 2 ? '/work' : '/gallery'; await page.locator(`.desktop-nav a[href="${route}"]`).click(); await page.waitForURL(`**${route}`); await ready(page);
      alignment.push(await page.locator('.wordmark').evaluate(e => e.getBoundingClientRect().x));
      assert.equal(await page.locator('.pin-spacer').count(), 0);
    }
    assert.ok(Math.max(...alignment) - Math.min(...alignment) < 1, 'no accumulated header drift'); report.alignment = alignment;
    for (const route of ['/journal', '/about', '/links', '/guestbook', '/']) { await go(page, route); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); }
    for (const slug of ['sat-chi', 'huquq-test', 'sme-financial-assistant', 'telegram-media-downloader', 'ielts-progress-tracker']) assert.equal((await context.request.get(`${base}/work/${slug}`)).status(), 200);
    assert.equal((await context.request.get(`${base}/api/owner/overview`)).status(), 401);
    await go(page, '/admin'); assert.equal(await page.locator('.reference-home, [data-signature], [data-study-plate]').count(), 0);
    report.checks.push('Home hero focus; all public routes; five project URLs; 15 client route changes; owner API rejects anonymous access; admin public scene absent');
    await go(page, '/work'); await progress(page, .25);
    const client = await context.newCDPSession(page); await client.send('Performance.enable'); const before = await client.send('Performance.getMetrics');
    report.performance = await page.evaluate(async () => {
      const h = document.querySelector('[data-signature]'); const top = h.getBoundingClientRect().top + scrollY; const range = h.offsetHeight - h.querySelector('[data-stage]').offsetHeight;
      const intervals = [], tasks = []; const observer = new PerformanceObserver(l => tasks.push(...l.getEntries().map(e => e.duration)));
      observer.observe({ entryTypes: ['longtask'] }); let last = performance.now(); const start = last;
      while (performance.now() - start < 2000) { await new Promise(requestAnimationFrame); const now = performance.now(); intervals.push(now - last); last = now; scrollTo(0, top + range * (.5 - Math.cos((now - start) / 2000 * Math.PI * 2) * .25)); }
      observer.disconnect(); intervals.sort((a, b) => a - b); return { samples: intervals.length, p95Ms: intervals[Math.floor(intervals.length * .95)], maxMs: intervals.at(-1), longTasksMs: tasks, dom: document.querySelectorAll('*').length, jsHeapBytes: performance.memory?.usedJSHeapSize };
    });
    const after = await client.send('Performance.getMetrics'); const get = (m, n) => m.metrics.find(x => x.name === n)?.value;
    report.performance.taskSeconds = get(after, 'TaskDuration') - get(before, 'TaskDuration');
    report.performance.wallSeconds = get(after, 'Timestamp') - get(before, 'Timestamp');
    await context.close();
    assert.deepEqual(report.runtime.pageErrors, []); assert.deepEqual(report.runtime.console.filter(e => e.type === 'error' || e.text === 'Invalid scope'), []);
    fs.writeFileSync(`${out}/results.json`, JSON.stringify(report, null, 2)); console.log('PASS: focused design checkpoint; see docs/design-research/overhaul/verification/results.json');
  } finally { await browser.close(); }
})().catch(e => { fs.writeFileSync(`${out}/results.json`, JSON.stringify({ ...report, failure: String(e) }, null, 2)); console.error(e); process.exitCode = 1; });
