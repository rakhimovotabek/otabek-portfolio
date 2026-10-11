/* eslint-disable @typescript-eslint/no-require-imports -- External Playwright via NODE_PATH. */
/* Run against next dev to exercise React Strict Mode and final reveal states. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    assert.equal(
      (
        await p.goto(process.env.PORTFOLIO_URL || "http://127.0.0.1:3001", {
          waitUntil: "networkidle",
          timeout: 120000,
        })
      ).status(),
      200,
    );
    await p.waitForTimeout(1800);
    assert.equal(await p.locator(".pin-spacer").count(), 1);
    const selectors = [
      "#about-heading",
      "#work-heading",
      "#side-quests-heading",
      "#achievements-heading",
      "#contact-heading",
      ".quest",
      ".milestone-number",
    ];
    for (const selector of selectors) {
      for (const el of await p.locator(selector).all()) {
        const y = await el.evaluate(
          (e) => e.getBoundingClientRect().top + scrollY - innerHeight * 0.3,
        );
        await p.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
        await p.waitForTimeout(650);
        const clip = await el.evaluate((e) => getComputedStyle(e).clipPath);
        assert.ok(
          clip === "none" || clip === "inset(0%)" || clip === "inset(0px)",
          selector +
            ": " +
            clip +
            " " +
            JSON.stringify(
              await el.evaluate((e) => ({
                scrollY,
                top: e.getBoundingClientRect().top,
                rect: e.getBoundingClientRect().toJSON(),
              })),
            ),
        );
      }
    }
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForTimeout(500);
    assert.equal(await p.locator(".pin-spacer").count(), 0);
    assert.ok(
      await p
        .locator(".project")
        .evaluateAll((els) =>
          els.every(
            (el) => !el.inert && getComputedStyle(el).visibility === "visible",
          ),
        ),
    );
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.waitForTimeout(1500);
    assert.equal(await p.locator(".pin-spacer").count(), 1);
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.keyboard.press("Tab");
    assert.ok(
      await p
        .locator(".skip-link")
        .evaluate((el) => el === document.activeElement),
    );
    await p.keyboard.press("Enter");
    assert.ok(
      await p.locator("#main").evaluate((el) => el === document.activeElement),
    );
    assert.deepEqual(errors, []);
    const r = {
      mode: "Next.js development / React Strict Mode",
      onePin: "passed",
      reducedMotionRebuild: "passed",
      sectionFinalStates: "passed",
      keyboardSkipLink: "passed",
      errors,
    };
    fs.writeFileSync(
      "docs/preview/phase3/dev-results.json",
      JSON.stringify(r, null, 2),
    );
    console.log(r);
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
