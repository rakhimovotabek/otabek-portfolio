/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser tooling. */
const { chromium } = require("playwright");
const fs = require("fs");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox", "--enable-precise-memory-info"],
  });
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"reads":false,"submissions":false,"siteKey":null}',
      }),
    );
    await p.addInitScript(() => {
      window.tasks = [];
      new PerformanceObserver((list) =>
        window.tasks.push(
          ...list.getEntries().map((e) => Math.round(e.duration)),
        ),
      ).observe({ entryTypes: ["longtask"] });
    });
    await p.goto(
      (process.env.PORTFOLIO_URL || "http://127.0.0.1:3005") + "/work",
      { waitUntil: "domcontentloaded" },
    );
    await p.waitForTimeout(1300);
    const cdp = await p.context().newCDPSession(p);
    await cdp.send("HeapProfiler.collectGarbage");
    const sample = () =>
      p.evaluate(() => ({
        heapBytes: performance.memory.usedJSHeapSize,
        triggers: window.ScrollTrigger?.getAll().length,
        nodes: document.getElementById("top").querySelectorAll("*").length,
        pins: document.querySelectorAll(".pin-spacer").length,
      }));
    const before = await sample();
    const timings = [];
    const workSamples = [];
    for (const href of [
      "/gallery",
      "/work",
      "/about",
      "/work",
      "/journal",
      "/work",
    ]) {
      const t = Date.now();
      await p.locator(`.desktop-nav a[href="${href}"]`).click();
      await p.waitForURL(
        (process.env.PORTFOLIO_URL || "http://127.0.0.1:3005") + href,
      );
      await p.waitForFunction(
        () => document.querySelector(".route-cover").dataset.state === "idle",
      );
      timings.push({ href, ms: Date.now() - t });
      await p.waitForTimeout(300);
      if (href === "/work") workSamples.push(await sample());
    }
    await cdp.send("HeapProfiler.collectGarbage");
    const after = await sample();
    const longTasks = await p.evaluate(() => window.tasks);
    assert.ok(
      workSamples.every((s) => s.nodes === before.nodes && s.pins === 0),
      "DOM or pin objects accumulated",
    );
    const report = {
      environment:
        "Headless Chromium on this laptop; fixture availability disabled; one foreground tab; no FPS guarantee",
      before,
      after,
      workSamples,
      timings,
      longTasks: {
        count: longTasks.length,
        maxMs: Math.max(0, ...longTasks),
        durationsMs: longTasks,
      },
      limitations:
        "Memory includes warmed route/module caches. CDP collection does not prove absence of all leaks; no physical-phone or GPU benchmark. The bundled ScrollTrigger instance is not exposed globally, so total trigger count was not inspected.",
    };
    fs.writeFileSync(
      "docs/preview/motion/performance-sample.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
