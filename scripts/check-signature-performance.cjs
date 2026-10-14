/* eslint-disable @typescript-eslint/no-require-imports -- Optional browser profiling. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox", "--enable-precise-memory-info"],
  });
  const report = {
    build: "production",
    viewport: "1440 × 900",
    samples: [],
    repeatNavigation: null,
    limitations:
      "One headless Chromium tab on this laptop. RAF scheduling is not a GPU FPS measurement. Cold hydration and warm scroll tasks are separated. CPU throttling approximates main-thread load, not a real low-end phone. No authenticated MFA session or field Web Vitals measurement.",
  };
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"reads":false,"submissions":false,"siteKey":null}',
      }),
    );
    await page.addInitScript(() => {
      window.qa = { shifts: [], tasks: [], paints: [] };
      new PerformanceObserver((list) =>
        window.qa.tasks.push(
          ...list
            .getEntries()
            .map((e) => ({ ms: e.duration, at: e.startTime })),
        ),
      ).observe({ type: "longtask", buffered: true });
      new PerformanceObserver((list) =>
        window.qa.shifts.push(
          ...list
            .getEntries()
            .filter((e) => !e.hadRecentInput)
            .map((e) => ({
              value: e.value,
              at: e.startTime,
              sources: e.sources.map((s) => ({
                tag: s.node?.tagName,
                className: s.node?.className,
                from: s.previousRect.toJSON(),
                to: s.currentRect.toJSON(),
              })),
            })),
        ),
      ).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) =>
        window.qa.paints.push(
          ...list
            .getEntries()
            .map((e) => ({
              ms: e.startTime,
              element: e.element?.tagName,
              text: e.element?.textContent?.slice(0, 80),
            })),
        ),
      ).observe({ type: "largest-contentful-paint", buffered: true });
    });
    const cdp = await page.context().newCDPSession(page);
    for (const cpu of [1, 4]) {
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
      for (const kind of ["work", "gallery", "about"]) {
        await page.goto(base + "/" + kind, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() =>
          document
            .querySelector("[data-signature]")
            ?.className.includes("enhanced"),
        );
        await page.waitForTimeout(1200);
        const load = await page.evaluate(() => ({ ...window.qa }));
        const motion = await page.evaluate(async () => {
          const host = document.querySelector("[data-signature]");
          const stage = host.querySelector("[data-stage]");
          const start = host.getBoundingClientRect().top + scrollY,
            travel = host.offsetHeight - stage.offsetHeight;
          const intervals = [],
            started = performance.now();
          let last = started;
          for (let i = 0; i < 120; i++) {
            const now = await new Promise(requestAnimationFrame);
            intervals.push(now - last);
            last = now;
            scrollTo({
              top: start + travel * (i <= 59 ? i / 59 : 1 - (i - 60) / 59),
              behavior: "instant",
            });
          }
          return {
            intervalsMs: intervals.slice(1),
            tasks: window.qa.tasks.filter((e) => e.at >= started),
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          };
        });
        assert.equal(motion.overflow, false);
        const sorted = [...motion.intervalsMs].sort((a, b) => a - b);
        report.samples.push({
          kind,
          cpuThrottle: cpu,
          initialLoad: load,
          scrolling: {
            p50Ms: sorted[Math.floor(sorted.length * 0.5)],
            p95Ms: sorted[Math.floor(sorted.length * 0.95)],
            maxMs: Math.max(...sorted),
            longTasks: motion.tasks,
            overflow: false,
          },
        });
      }
    }
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await page.goto(base + "/work", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() =>
      document
        .querySelector("[data-signature]")
        ?.className.includes("enhanced"),
    );
    await cdp.send("HeapProfiler.collectGarbage");
    const sample = () =>
      page.evaluate(() => ({
        nodes: document.querySelector("#top").querySelectorAll("*").length,
        heapBytes: performance.memory?.usedJSHeapSize,
        signatures: document.querySelectorAll("[data-signature]").length,
        pins: document.querySelectorAll(".pin-spacer").length,
      }));
    const before = await sample();
    for (const route of [
      "gallery",
      "about",
      "links",
      "work",
      "gallery",
      "about",
      "journal",
      "work",
    ]) {
      await page.locator(`.desktop-nav a[href="/${route}"]`).click();
      await page.waitForURL(base + "/" + route);
      await page.waitForFunction(
        () => document.querySelector(".route-cover")?.dataset.state === "idle",
      );
      await page.waitForTimeout(300);
    }
    await cdp.send("HeapProfiler.collectGarbage");
    const after = await sample();
    assert.equal(before.nodes, after.nodes);
    assert.equal(after.signatures, 1);
    assert.equal(after.pins, 0);
    report.repeatNavigation = {
      before,
      after,
      navigations: 8,
      sameDOMCount: true,
    };
    console.log(
      report.samples.map((s) => ({
        kind: s.kind,
        cpu: s.cpuThrottle,
        p95Ms: s.scrolling.p95Ms,
        longTasks: s.scrolling.longTasks.length,
        initialShiftSum: s.initialLoad.shifts.reduce((a, x) => a + x.value, 0),
      })),
      report.repeatNavigation,
    );
  } finally {
    await browser.close();
    fs.writeFileSync(
      "docs/preview/signature/performance.json",
      JSON.stringify(report, null, 2),
    );
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
