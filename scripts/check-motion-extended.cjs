/* eslint-disable @typescript-eslint/no-require-imports -- Optional external Playwright tooling via NODE_PATH. */
/* Extended local Chromium checks: history, touch, recording, warm lifecycle metrics. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      recordVideo: {
        dir: "/tmp/otabek-phase3-video",
        size: { width: 960, height: 666 },
      },
    });
    await context.addInitScript(() => {
      window.qaCLS = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.qaCLS += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(process.env.PORTFOLIO_URL || "http://127.0.0.1:3001", {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1700);
    const cls = await page.evaluate(() => window.qaCLS);
    await page.getByRole("link", { name: "Enter the Vault" }).click();
    await page.waitForTimeout(1600);
    assert.ok(Math.abs((await page.locator("#work").boundingBox()).y) < 50);
    await page.locator(".vault-chapters a").first().click();
    await page.waitForTimeout(400);
    for (let i = 0; i < 50; i++) {
      await page.mouse.wheel(0, 88);
      await page.waitForTimeout(80);
    }
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, -85);
      await page.waitForTimeout(80);
    }
    await page.locator(".vault-chapters a").nth(2).click();
    await page.waitForTimeout(400);
    await page.locator(".vault-chapters a").nth(3).click();
    await page.waitForTimeout(400);
    await page.goBack();
    await page.waitForTimeout(400);
    assert.equal(
      await page.locator(".vault-motion").getAttribute("data-active-project"),
      "sme-financial-assistant",
    );
    await page.getByRole("button", { name: "Read as list" }).click();
    await page.waitForTimeout(600);
    assert.equal(await page.locator(".pin-spacer").count(), 0);
    assert.equal(await page.locator(".project[inert]").count(), 0);
    assert.ok(
      await page
        .locator("#sme-financial-assistant summary")
        .evaluate((el) => el === document.activeElement),
    );
    await page.evaluate(() => {
      location.hash = "contact";
    });
    await page.waitForTimeout(1400);
    assert.ok((await page.locator("#contact").boundingBox()).y < 50);
    assert.deepEqual(errors, []);
    const video = page.video();
    await context.close();
    await video.saveAs("docs/preview/phase3/desktop-scroll.webm");
    const lifecycle = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await lifecycle.goto(process.env.PORTFOLIO_URL || "http://127.0.0.1:3001", {
      waitUntil: "networkidle",
    });
    await lifecycle.waitForTimeout(1600);
    const cdp = await lifecycle.context().newCDPSession(lifecycle);
    await cdp.send("Performance.enable");
    const stats = async () => {
      await cdp.send("HeapProfiler.collectGarbage");
      return Object.fromEntries(
        (await cdp.send("Performance.getMetrics")).metrics.map((m) => [
          m.name,
          m.value,
        ]),
      );
    };
    const counts = [];
    for (let n = 0; n < 10; n++) {
      await lifecycle.setViewportSize({ width: 390, height: 844 });
      await lifecycle.waitForTimeout(450);
      await lifecycle.setViewportSize({ width: 1440, height: 1000 });
      await lifecycle.waitForTimeout(450);
      await lifecycle.emulateMedia({ reducedMotion: "reduce" });
      await lifecycle.waitForTimeout(200);
      await lifecycle.emulateMedia({ reducedMotion: "no-preference" });
      await lifecycle.waitForTimeout(450);
      if (n === 4 || n === 9) {
        await lifecycle.waitForTimeout(1500);
        const metrics = await stats();
        counts.push({
          cycle: n + 1,
          heapBytes: metrics.JSHeapUsedSize,
          nodes: metrics.Nodes,
          listeners: metrics.JSEventListeners,
        });
      }
    }
    await lifecycle.close();
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const touch = await mobile.newPage();
    await touch.goto(process.env.PORTFOLIO_URL || "http://127.0.0.1:3001", {
      waitUntil: "networkidle",
    });
    await touch.waitForTimeout(1700);
    const input = await mobile.newCDPSession(touch);
    const swipe = async (from, to) => {
      await input.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 195, y: from }],
      });
      for (let n = 1; n <= 12; n++) {
        await input.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: 195, y: from + ((to - from) * n) / 12 }],
        });
        await touch.waitForTimeout(20);
      }
      await input.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await touch.waitForTimeout(500);
    };
    await swipe(650, 150);
    const touchScroll = await touch.evaluate(() => scrollY);
    assert.ok(touchScroll > 100);
    await swipe(200, 650);
    assert.ok((await touch.evaluate(() => scrollY)) < touchScroll);
    assert.equal(await touch.locator(".pin-spacer").count(), 0);
    await touch.setViewportSize({ width: 844, height: 390 });
    await touch.waitForTimeout(600);
    assert.equal(await touch.locator(".pin-spacer").count(), 0);
    assert.equal(
      await touch.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      ),
      false,
    );
    await mobile.close();
    const deep = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await deep.goto(
      (process.env.PORTFOLIO_URL || "http://127.0.0.1:3001") +
        "/#ielts-progress-tracker",
      { waitUntil: "networkidle" },
    );
    await deep.waitForTimeout(1700);
    assert.equal(
      await deep.locator(".vault-motion").getAttribute("data-active-project"),
      "ielts-progress-tracker",
    );
    await deep.close();
    const nojs = await browser.newPage({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: false,
    });
    await nojs.goto(process.env.PORTFOLIO_URL || "http://127.0.0.1:3001", {
      waitUntil: "load",
    });
    assert.ok(await nojs.locator("h1").isVisible());
    await nojs.locator(".mobile-menu summary").click();
    assert.ok(
      await nojs
        .getByRole("navigation", { name: "Mobile navigation" })
        .isVisible(),
    );
    await nojs.close();
    const result = {
      initialCLS: cls,
      anchors:
        "hero, chapter, back history, contact, direct project deep-link passed",
      listEscape: "passed",
      touchScrollY: touchScroll,
      orientation: "passed",
      noJavaScriptMobile: "passed",
      warmLifecycle: counts,
      errors,
      video: "desktop-scroll.webm",
    };
    fs.writeFileSync(
      "docs/preview/phase3/extra-results.json",
      JSON.stringify(result, null, 2),
    );
    console.log(result);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
