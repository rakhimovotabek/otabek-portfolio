/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser verification. */
const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("fs");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const results = [];
  try {
    for (const width of [1366, 390]) {
      const context = await b.newContext({
        viewport: { width, height: width === 1366 ? 768 : 844 },
      });
      const p = await context.newPage();
      await p.goto(
        (process.env.PORTFOLIO_URL || "http://127.0.0.1:3010") + "/guestbook",
      );
      await p.waitForSelector("[data-od-ready=true]");
      await p.locator("#visitor-notes").scrollIntoViewIfNeeded();
      await p.screenshot({
        path: `docs/design-reset/after/${width}-guestbook-sheet.png`,
      });
      const trigger = p.locator(".nav-correspondence button");
      await trigger.click();
      await p.locator(".contact-dialog[open]").waitFor();
      await p.waitForFunction(() =>
        document
          .querySelector(".contact-dialog .preview-status")
          ?.textContent.includes("Nothing will be sent"),
      );
      await p.screenshot({
        path: `docs/design-reset/after/${width}-contact.png`,
      });
      const axe = await new AxeBuilder({ page: p }).analyze();
      results.push({
        width,
        violations: axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.failureSummary),
        })),
      });
      await p.keyboard.press("Escape");
      assert.equal(
        await trigger.evaluate((e) => e === document.activeElement),
        true,
      );
      await context.close();
    }
    assert.equal(results.flatMap((r) => r.violations).length, 0);
  } finally {
    fs.writeFileSync(
      "docs/design-reset/verification/contact.json",
      JSON.stringify(results, null, 2),
    );
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
