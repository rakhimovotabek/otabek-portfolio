/* eslint-disable @typescript-eslint/no-require-imports -- Optional external Playwright tooling. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3003";
const loginBase = process.env.PORTFOLIO_LOGIN_QA_URL || base;
const output = path.resolve(
  process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/phase4b",
);
assert.equal(process.env.BACKEND_SMOKE_UNCONFIGURED, "true");
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const results = [];
  try {
    for (const [width, height] of [
      [1440, 1000],
      [1366, 900],
      [390, 844],
      [360, 800],
    ]) {
      const p = await b.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      assert.equal(
        (await p.goto(base, { waitUntil: "networkidle" })).status(),
        200,
      );
      await p.getByRole("button", { name: "Message me", exact: true }).click();
      assert.ok(
        await p
          .getByRole("dialog")
          .getByLabel("Your name", { exact: true })
          .isDisabled(),
      );
      await p
        .getByRole("dialog")
        .getByText(/is unavailable/)
        .waitFor();
      await p.keyboard.press("Escape");
      await p.goto(base + "/admin");
      assert.ok(p.url().endsWith("/admin/login"));
      assert.ok(
        await p.getByLabel("Owner email", { exact: true }).isDisabled(),
      );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({
        width,
        height,
        unconfiguredHomepage: 200,
        forms: "truthfully disabled",
        anonymousAdmin: "redirected to unavailable login",
        overflow: false,
        errors,
      });
      await p.close();
    }
    const p = await b.newPage({ javaScriptEnabled: false });
    await p.goto(loginBase + "/admin/login");
    assert.equal(
      await p.locator("form").first().getAttribute("method"),
      "post",
    );
    assert.ok(await p.getByLabel("Owner email", { exact: true }).isDisabled());
    results.push({
      noJavaScript:
        "owner credentials disabled; POST method prevents URL submission",
    });
    await p.close();
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      path.join(output, "unconfigured-browser-results.json"),
      JSON.stringify(results, null, 2),
    );
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
