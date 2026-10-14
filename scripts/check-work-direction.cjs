/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA tooling. */
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
const out = path.resolve("docs/preview/work-direction/after");
const report = { build: "production", states: [], accessibility: [], runtimeErrors: [], checks: [] };
const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;
async function ready(page) {
  await page.waitForFunction(() => document.querySelector(".route-cover")?.dataset.state === "idle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1100);
}
async function scroll(page, y) {
  await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
  await page.waitForTimeout(650);
}
async function progress(page, p) {
  const y = await page.locator('[data-signature="work"]').evaluate((h, p) =>
    h.getBoundingClientRect().top + scrollY + (h.offsetHeight - h.querySelector("[data-stage]").offsetHeight) * p, p);
  await scroll(page, y);
}
async function snap(page, name, width) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name} overflow`);
  await page.screenshot({ path: `${out}/${width}-${name}.png` });
  const m = await page.evaluate(() => ({
    y: scrollY,
    pins: document.querySelectorAll(".pin-spacer").length,
    panels: [...document.querySelectorAll("[data-exhibit]")].map(e => ({ inert: e.inert, hidden: e.getAttribute("aria-hidden") })),
    art: [...document.querySelectorAll("[data-exhibit-art]")].map(e => {
      const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  }));
  assert.equal(m.pins, 0);
  report.states.push({ name, width, ...m });
  return m;
}
async function axe(page, name) {
  const result = await new AxeBuilder({ page }).include(".work-page").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  fs.writeFileSync(`${out}/axe-${name}.json`, JSON.stringify(result, null, 2));
  report.accessibility.push({ name, violations: result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
  assert.equal(result.violations.length, 0, `axe ${name}`);
}
(async () => {
  fs.mkdirSync(`${out}/recordings`, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, args: ["--no-sandbox"] });
  try {
    for (const width of [1366, 390, 320, 1024]) {
      const context = await browser.newContext({ viewport: { width, height: width >= 800 ? 900 : 844 } });
      const page = await context.newPage();
      page.on("pageerror", e => report.runtimeErrors.push(e.message));
      page.on("console", message => {
        if (message.type() === "error") report.runtimeErrors.push(message.text());
      });
      assert.equal((await page.goto(`${base}/work`, { waitUntil: "domcontentloaded" })).status(), 200);
      await ready(page);
      await snap(page, "opening", width);
      await scroll(page, 600);
      await snap(page, "scroll-600", width);
      if (width >= 800) {
        await page.waitForFunction(() => document.querySelector('[data-signature="work"]').className.includes("enhanced"));
        let featured;
        for (const [name, p] of [["start", 0], ["featured", .27], ["transition", .47], ["second", .77], ["final", 1]]) {
          await progress(page, p);
          const m = await snap(page, name, width);
          if (name === "featured") { featured = m; assert.equal(m.panels[1].inert, true); }
          if (name === "second") assert.equal(m.panels[0].inert, true);
          if (width === 1366 && ["featured", "second"].includes(name)) await axe(page, name);
        }
        await progress(page, .27);
        const reverse = await snap(page, "reverse", width);
        assert.ok(Math.abs(reverse.art[0].x - featured.art[0].x) < 2);
        assert.ok(Math.abs(reverse.art[0].width - featured.art[0].width) < 2);
        await page.locator("[data-jump]").nth(1).click();
        await page.waitForFunction(() => !document.querySelectorAll('[data-exhibit]')[1].inert);
        assert.equal(await page.locator('[data-exhibit]').nth(1).evaluate(e => e.inert), false);
        await page.locator("[data-jump]").first().click();
        await page.waitForFunction(() => !document.querySelector('[data-exhibit]').inert);
        assert.equal(await page.locator('[data-exhibit]').first().evaluate(e => e.inert), false);
      } else {
        for (const [name, i] of [["featured", 0], ["second", 1]]) {
          await scroll(page, await page.locator("[data-exhibit]").nth(i).evaluate(e => e.getBoundingClientRect().top + scrollY));
          await snap(page, name, width);
        }
        assert.equal(await page.locator('[data-signature="work"]').evaluate(e => e.className.includes("enhanced")), false);
        const framesFit = await page.locator('[data-exhibit-art]').evaluateAll(frames => frames.every(frame => {
          const r = frame.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth + 1 && r.width > innerWidth * .6;
        }));
        assert.equal(framesFit, true, 'Static artwork must remain inside the page, even when its parent clips overflow');
      }
      await scroll(page, await page.locator("#work-directory").evaluate(e => e.getBoundingClientRect().top + scrollY));
      await snap(page, "archive", width);
      assert.equal(await page.locator("[data-work-index] article").count(), 5);
      if (width === 1366) {
        await axe(page, "archive");
        // Noninteractive default paragraphs versus native disclosure content.
        const old = JSON.parse(fs.readFileSync("docs/preview/work-direction/before/measurements.json"))[0];
        const descriptions = await page.locator("[data-exhibit-copy] p").allTextContents();
        report.copy = {
          originalExhibitWords: words(old.copy.slice(1, 3).join(" ")),
          newExhibitWords: words(descriptions.join(" ")),
          originalDefaultParagraphWords: words(old.copy.join(" ")),
          newDefaultParagraphWords: words(descriptions.join(" ")),
          retainedDescriptions: await page.locator("[data-work-index] details p").allTextContents(),
        };
        const notes = page.locator("[data-work-index] details").first();
        await notes.locator("summary").focus();
        await page.keyboard.press("Enter");
        assert.equal(await notes.evaluate(e => e.open), true);
        assert.equal(await notes.locator("p").isVisible(), true);
        await snap(page, "notes-open", width);
        await page.keyboard.press("Space");
        assert.equal(await notes.evaluate(e => e.open), false);
        assert.equal(await notes.locator("p").isVisible(), false);
        // Long project titles must leave clear space before the metadata column.
        const gaps = await page.locator("[data-work-index] article").evaluateAll(rows => rows.map(e => {
          const title = e.querySelector("h3 a").getBoundingClientRect();
          const discipline = e.children[2].getBoundingClientRect();
          return { title: e.querySelector("h3").innerText, gap: discipline.left - title.right };
        }));
        assert.ok(gaps.every(g => g.gap >= 8), JSON.stringify(gaps));
        report.indexGaps = gaps;
      }
      await scroll(page, await page.locator("#work-collaboration").evaluate(e => e.getBoundingClientRect().top + scrollY));
      await snap(page, "ending", width);
      if (width === 1366) {
        await axe(page, "ending");
        const button = page.locator("#work-collaboration").getByRole("button", { name: "Collaborate on this project", exact: true });
        await button.click();
        const dialog = page.locator(".contact-dialog");
        await dialog.waitFor({ state: "visible" });
        assert.match(await dialog.getByLabel("Your message", { exact: true }).inputValue(), /Project: sat-chi/);
        await page.keyboard.press("Escape");
        assert.equal(await button.evaluate(e => e === document.activeElement), true);
        assert.equal(await page.locator('#work-collaboration a').getAttribute("href"), "https://github.com/rakhimovotabek");
        // Archive categories change the index, while curated exhibits stay present.
        await page.locator('.category-navigation a[href="/work?category=physical"]').click();
        await page.waitForURL(`${base}/work?category=physical`);
        await ready(page);
        assert.equal(await page.locator("[data-work-index] article").count(), 0);
        await page.getByText("No works in this category have been published yet.").waitFor();
        await page.locator('.category-navigation a[href="/work"]').click();
        await page.waitForURL(`${base}/work`);
        await ready(page);
        const titleLink = page.locator('[data-work-index] h3 a').first();
        await titleLink.scrollIntoViewIfNeeded();
        const saved = await page.evaluate(() => scrollY);
        await titleLink.click();
        await page.waitForURL(`${base}/work/sat-chi`);
        await ready(page);
        await page.locator('.community-form[data-project-id="sat-chi"]').waitFor();
        report.projectRoutes = [];
        for (const slug of ["sat-chi", "huquq-test", "sme-financial-assistant", "telegram-media-downloader", "ielts-progress-tracker"]) {
          const response = await context.request.get(`${base}/work/${slug}`);
          assert.equal(response.status(), 200);
          report.projectRoutes.push({ slug, status: response.status() });
        }
        await page.goBack();
        await ready(page);
        const restored = await page.evaluate(() => scrollY);
        assert.ok(Math.abs(saved - restored) < 5, `history ${saved}/${restored}`);
        report.history = { saved, restored };
        await page.goto(`${base}/`);
        await ready(page);
        assert.equal(await page.locator('.reference-home').count(), 1);
        await page.locator('.hero-journey.is-enhanced').waitFor();
        await page.evaluate(() => {
          const hero = document.querySelector('[data-hero-journey]');
          const stage = hero.querySelector('[data-hero-stage]');
          scrollTo({ top: (hero.offsetHeight - stage.offsetHeight) * .56, behavior: 'instant' });
        });
        await page.waitForTimeout(650);
        assert.equal(await page.locator('[data-hero-journey]').getAttribute('data-hero-phase'), 'focus');
        await page.screenshot({ path: `${out}/homepage-focus.png` });
        await scroll(page, 0);
        await page.locator('.desktop-nav a[href="/work"]').click();
        await page.waitForURL(`${base}/work`);
        await ready(page);
        assert.equal(await page.locator('[data-signature="work"]').count(), 1);
      }
      report.checks.push({ width, overflow: false, forwardReverse: width >= 800 });
      await context.close();
    }
    for (const mode of ["reduced", "nojs"]) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: mode === "reduced" ? "reduce" : "no-preference", javaScriptEnabled: mode !== "nojs" });
      const page = await context.newPage();
      await page.goto(`${base}/work`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1300);
      assert.equal(await page.locator('[data-signature="work"]').evaluate(e => e.className.includes("enhanced")), false);
      assert.equal(await page.locator('[data-exhibit]').evaluateAll(panels => panels.some(panel => panel.inert)), false);
      assert.equal(await page.locator('[data-exhibit-art]').evaluateAll(frames => frames.every(frame => {
        const r = frame.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1;
      })), true);
      for (const target of ["[data-exhibit]", "#work-directory", "#work-collaboration"]) {
        await page.locator(target).first().scrollIntoViewIfNeeded();
        await snap(page, `${mode}-${target === "[data-exhibit]" ? "exhibit" : target.slice(1)}`, 1366);
      }
      const notes = page.locator("[data-work-index] details").first();
      await notes.locator("summary").click();
      assert.equal(await notes.locator("p").isVisible(), true);
      await context.close();
    }
    // One short forward/back recording, without recording slow axe probes.
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, recordVideo: { dir: `${out}/recordings`, size: { width: 910, height: 600 } } });
    const page = await context.newPage();
    await page.goto(`${base}/work`, { waitUntil: "domcontentloaded" });
    await ready(page);
    await progress(page, 0);
    await page.mouse.move(1000, 500);
    for (const p of [.27, .47, .77, 1, .77, .47, .27, 0]) {
      const distance = await page.locator('[data-signature="work"]').evaluate((h, p) =>
        h.getBoundingClientRect().top + (h.offsetHeight - h.querySelector('[data-stage]').offsetHeight) * p, p);
      const steps = Math.ceil(Math.abs(distance) / 70);
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, distance / steps);
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(650);
    }
    for (const target of ["#work-directory", "#work-collaboration"]) {
      await scroll(page, await page.locator(target).evaluate(e => e.getBoundingClientRect().top + scrollY));
      await page.waitForTimeout(800);
    }
    const video = page.video();
    await context.close();
    fs.renameSync(await video.path(), `${out}/recordings/work-direction.webm`);
    assert.deepEqual(report.runtimeErrors, []);
    fs.writeFileSync(`${out}/results.json`, JSON.stringify(report, null, 2));
    console.log("PASS: Work composition states, reverse, index disclosures, filters, history, collaboration, project comments mount, homepage navigation, responsive/static fallbacks and scoped axe.");
  } finally { await browser.close(); }
})().catch(e => { fs.writeFileSync(`${out}/results.json`, JSON.stringify({ ...report, failure: String(e) }, null, 2)); console.error(e); process.exitCode = 1; });
