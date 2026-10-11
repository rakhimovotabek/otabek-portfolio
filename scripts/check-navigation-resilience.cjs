/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser tooling. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"reads":false,"submissions":false,"siteKey":null}',
      }),
    );
    await p.goto(base + "/links", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(800);
    await p
      .locator('.desktop-nav a[href="/about"]')
      .evaluate((el) => el.click());
    const state = await p.locator(".route-cover").getAttribute("data-state");
    assert.equal(
      state,
      "covering",
      "Preference change did not exercise early cover",
    );
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForURL(base + "/about");
    await p.waitForFunction(
      () => document.querySelector(".route-cover").dataset.state === "idle",
    );
    assert.equal(await p.locator(".pin-spacer").count(), 0);
    assert.equal(await p.locator("h1").innerText(), "Otabek Rakhimov");
    const rows = [];
    for (const width of [960, 820, 700]) {
      await p.setViewportSize({ width, height: 900 });
      for (const href of ["/", "/about"]) {
        await p.goto(base + href, { waitUntil: "domcontentloaded" });
        await p.evaluate(() => document.fonts.ready);
        rows.push({
          width,
          href,
          ...(await p.evaluate(() => ({
            brand: document.querySelector(".wordmark").getBoundingClientRect()
              .x,
            nav: document.querySelector(".desktop-nav").getBoundingClientRect()
              .x,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
          }))),
        });
      }
      const pair = rows.filter((r) => r.width === width);
      assert.equal(pair[0].brand, pair[1].brand);
      assert.equal(pair[0].nav, pair[1].nav);
      assert.ok(pair.every((r) => !r.overflow));
    }
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.goto(base + "/work", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(600);
    await p.locator('.desktop-nav a[href="/gallery"]').click();
    await p.waitForURL(base + "/gallery");
    await p.waitForFunction(
      () => document.querySelector(".route-cover").dataset.state === "idle",
    );
    await p.goBack({ waitUntil: "domcontentloaded" });
    await p.waitForURL(base + "/work");
    await p.waitForFunction(
      () => document.querySelector(".route-cover").dataset.state === "idle",
    );
    fs.writeFileSync(
      "docs/preview/motion/navigation-resilience.json",
      JSON.stringify(
        {
          midCoverReducedMotionCompletesNavigation: true,
          normalMotionAndHistoryAfterPreferenceReset: true,
          intermediateWidths: rows,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: in-flight preference change, preference reset/history, 960/820/700px shared navigation.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
