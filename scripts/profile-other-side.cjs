/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser profiling; no field-performance claim. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3010";
const root = path.resolve("docs/design-reset/verification");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const results = {
    build: "production",
    recording: false,
    samples: [],
    limitations:
      "One headless Chromium tab on this laptop. RAF scheduling is not physical FPS. Local network; CPU throttle and touch are simulations. No field Web Vitals or real phone.",
  };
  try {
    for (const device of [
      { name: "desktop", width: 1366, height: 768, cpu: 1 },
      { name: "mobile-simulation", width: 390, height: 844, cpu: 4 },
    ]) {
      const c = await b.newContext({
        viewport: { width: device.width, height: device.height },
        hasTouch: device.width === 390,
      });
      await c.addInitScript(() => {
        window.odPerf = { tasks: [], lcp: [], cls: [] };
        new PerformanceObserver((l) =>
          window.odPerf.tasks.push(
            ...l.getEntries().map((e) => ({ at: e.startTime, ms: e.duration })),
          ),
        ).observe({ type: "longtask", buffered: true });
        new PerformanceObserver((l) =>
          window.odPerf.lcp.push(
            ...l.getEntries().map((e) => ({
              ms: e.startTime,
              element: e.element?.tagName,
              text: e.element?.textContent?.slice(0, 70),
            })),
          ),
        ).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) =>
          window.odPerf.cls.push(
            ...l
              .getEntries()
              .filter((e) => !e.hadRecentInput)
              .map((e) => e.value),
          ),
        ).observe({ type: "layout-shift", buffered: true });
      });
      const p = await c.newPage();
      const cdp = await c.newCDPSession(p);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: device.cpu });
      for (const route of ["/", "/work", "/gallery"]) {
        await p.goto(base + route, { waitUntil: "domcontentloaded" });
        await p.waitForSelector("[data-od-ready=true]");
        await p.waitForTimeout(400);
        const loading = await p.evaluate(() => ({
          ...window.odPerf,
          resources: performance
            .getEntriesByType("resource")
            .filter(
              (r) =>
                r.initiatorType === "script" ||
                r.name.includes(".woff") ||
                r.name.includes(".ttf"),
            )
            .map((r) => ({
              url: new URL(r.name).pathname,
              bytes: r.encodedBodySize,
            })),
        }));
        for (const scene of await p.locator("[data-od-scene]").all()) {
          const kind = await scene.getAttribute("data-od-scene");
          const metrics = await scene.evaluate(async (el) => {
            const start = scrollY + el.getBoundingClientRect().top - 88;
            const end = Math.max(
              start + 300,
              scrollY + el.getBoundingClientRect().bottom - innerHeight,
            );
            scrollTo({ top: start, behavior: "instant" });
            const since = performance.now();
            const gaps = [];
            await new Promise((resolve) => {
              let previous;
              function step(now) {
                if (previous !== undefined) gaps.push(now - previous);
                previous = now;
                const f = Math.min(1, (now - since) / 2400);
                scrollTo({
                  top: start + (end - start) * f,
                  behavior: "instant",
                });
                if (f < 1) requestAnimationFrame(step);
                else resolve();
              }
              requestAnimationFrame(step);
            });
            const sorted = [...gaps].sort((a, b) => a - b);
            return {
              frames: gaps.length,
              medianMs: sorted[Math.floor(sorted.length * 0.5)],
              p95Ms: sorted[Math.floor(sorted.length * 0.95)],
              maxMs: Math.max(...gaps),
              over34ms: gaps.filter((n) => n > 34).length,
              longTasks: window.odPerf.tasks.filter((t) => t.at >= since),
              cls: window.odPerf.cls.reduce((a, b) => a + b, 0),
            };
          });
          results.samples.push({
            device,
            route,
            scene: kind,
            loading,
            scroll: metrics,
          });
          console.log(device.name, kind, metrics);
        }
      }
      await c.close();
    }
  } finally {
    fs.writeFileSync(
      `${root}/performance.json`,
      JSON.stringify(results, null, 2),
    );
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
