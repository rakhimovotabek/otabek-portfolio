/* eslint-disable @typescript-eslint/no-require-imports -- Read-only inspection of our compiled public preview. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3010";
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const result = {
    method:
      "Read the installed ScrollTrigger registry from this local webpack preview; no app instrumentation or backend access.",
    states: [],
  };
  try {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    await p.goto(base + "/");
    await p.waitForSelector("[data-od-ready=true]");
    async function registry() {
      return p.evaluate(() => {
        if (!window.odQARegistry) {
          let runtime;
          self.webpackChunk_N_E.push([
            ["other-side-readonly-registry-probe"],
            {},
            (r) => {
              runtime = r;
            },
          ]);
          for (const cacheEntry of Object.values(runtime?.c || {})) {
            try {
              const values = [
                cacheEntry.exports,
                ...Object.values(cacheEntry.exports || {}),
              ];
              const plugin = values.find(
                (value) =>
                  typeof value?.getAll === "function" &&
                  typeof value.refresh === "function" &&
                  typeof value.scrollerProxy === "function",
              );
              if (plugin) {
                window.odQARegistry = plugin;
                break;
              }
            } catch {}
          }
        }
        return (
          window.odQARegistry?.getAll().map((t) => ({
            kind: t.trigger?.dataset?.odScene || "trajectory",
            connected: !!t.trigger?.isConnected,
          })) ?? null
        );
      });
    }
    for (const route of [
      "/work",
      "/gallery",
      "/about",
      "/journal",
      "/work",
      "/gallery",
      "/about",
      "/journal",
      "/work",
    ]) {
      await p.locator(`.desktop-nav a[href="${route}"]`).click();
      await p.waitForURL(base + route);
      await p.waitForSelector("[data-od-ready=true]");
      const triggers = await registry();
      result.states.push({ route, triggers });
      if (triggers === null)
        result.registryStatus = "unknown: compiled registry not exposed";
      else {
        assert.equal(
          triggers.length,
          route === "/work" ? 2 : route === "/journal" ? 0 : 1,
        );
        assert.equal(
          triggers.every((t) => t.connected),
          true,
        );
      }
    }
    await p.evaluate(() => {
      document.querySelector('.desktop-nav a[href="/gallery"]').click();
      document.querySelector('.desktop-nav a[href="/about"]').click();
    });
    await p.waitForURL(base + "/about");
    await p.waitForSelector("[data-od-ready=true]");
    result.rapidNavigation = { landed: "/about", triggers: await registry() };
    if (result.rapidNavigation.triggers !== null)
      assert.equal(result.rapidNavigation.triggers.length, 1);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    fs.writeFileSync(
      "docs/design-reset/verification/lifecycle.json",
      JSON.stringify(result, null, 2),
    );
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
