/* eslint-disable @typescript-eslint/no-require-imports */
/* Optional external Playwright runner; no browser package is bundled with the app. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const url = process.env.PORTFOLIO_URL || "http://localhost:3001";
const output = process.env.PORTFOLIO_QA_OUTPUT || "/tmp/portfolio-archive-qa";
const style = "nextjs-portal { display:none !important; }";
const results = [];
const sleep = (page, ms = 650) => page.waitForTimeout(ms);
const overflow = async (page) =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal overflow",
  );
async function move(page, selector, offset = 0) {
  await page.evaluate(
    ({ selector, offset }) => {
      const el = document.querySelector(selector);
      scrollTo({
        top: el.getBoundingClientRect().top + scrollY + offset,
        behavior: "instant",
      });
    },
    { selector, offset },
  );
  await sleep(page);
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    for (const [name, width, height] of [
      ["desktop", 1440, 1000],
      ["laptop", 1366, 900],
      ["mobile", 390, 844],
      ["narrow-mobile", 360, 800],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "no-preference",
      });
      page.setDefaultNavigationTimeout(120000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      assert.equal(
        (await page.goto(url, { waitUntil: "networkidle" })).status(),
        200,
      );
      await page.evaluate(() => document.fonts.ready);
      await sleep(page, 1800);
      await overflow(page);
      assert.equal(await page.locator("h1").innerText(), "default.");
      const signature = await page.locator(".wordmark-reveal").boundingBox();
      assert.ok(
        signature.x + signature.width <= width + 1,
        "Opening signature is clipped",
      );
      if (width < 700) {
        const caption = await page
          .locator(".hero-art figcaption")
          .boundingBox();
        assert.ok(
          caption.y + caption.height < signature.y,
          "Hero caption overlaps signature",
        );
      }
      await page.screenshot({
        path: path.join(output, name + "-hero.png"),
        style,
      });
      for (const section of [
        "about",
        "archive",
        "writing",
        "sketchbook",
        "side-quests",
        "achievements",
        "guestbook",
        "contact",
      ]) {
        await move(page, "#" + section, Math.min(height * 0.16, 120));
        await overflow(page);
        await page.screenshot({
          path: path.join(output, `${name}-${section}.png`),
          style,
        });
      }
      // Traversal in reverse and fast jumps preserve the complete page.
      for (const section of ["writing", "about", "contact", "archive"]) {
        await move(page, "#" + section);
        await overflow(page);
      }
      const archive = page.locator(".archive-browser");
      assert.equal(await archive.locator(".archive-entry").count(), 6);
      await page.getByRole("button", { name: "Words", exact: true }).click();
      assert.equal(await archive.locator(".archive-entry").count(), 3);
      assert.equal(
        await page
          .getByRole("button", { name: "Words", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.getByRole("button", { name: "Images", exact: true }).click();
      assert.equal(await archive.locator(".archive-entry").count(), 3);
      const summary = page.locator("#archive-open-volume summary");
      await summary.focus();
      await page.keyboard.press("Enter");
      assert.equal(
        await page.locator("#archive-open-volume").getAttribute("open"),
        "",
      );
      assert.ok(
        await page
          .locator("#archive-open-volume .archive-entry-body")
          .isVisible(),
      );
      assert.ok(
        await page
          .locator("#archive-open-volume .media-frame figcaption")
          .innerText()
          .then((t) => t.includes("Original site artwork")),
      );
      await sleep(page);
      await overflow(page);
      await page.getByRole("button", { name: "All", exact: true }).click();
      assert.equal(await archive.locator(".archive-entry").count(), 6);
      await move(page, "#contact");
      const contact = page.getByRole("button", {
        name: "Write a private note",
        exact: true,
      });
      await contact.click();
      assert.ok(await page.locator("dialog[open]").isVisible());
      assert.equal(
        await page.evaluate(() => document.documentElement.style.overflow),
        "hidden",
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog[open]").count(), 0);
      assert.ok(
        await contact.evaluate((el) => document.activeElement === el),
        "Footer contact focus not restored",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await sleep(page);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      assert.equal(await page.locator(".project[inert]").count(), 0);
      for (const section of ["about", "writing", "sketchbook"]) {
        await move(page, "#" + section);
        assert.ok(await page.locator("#" + section + " h2").isVisible());
        await overflow(page);
      }
      assert.ok(
        await page
          .locator(".media-image")
          .evaluateAll((els) =>
            els.every((el) => getComputedStyle(el).transform === "none"),
          ),
      );
      assert.deepEqual(errors, []);
      results.push({
        name,
        width,
        height,
        filters: "passed",
        nativeDisclosure: "passed",
        footerDialogFocus: "passed",
        reducedMotion: "passed",
        overflow: false,
        errors,
      });
      await page.close();
      console.log(name + " archive checks passed");
    }
    const nojs = await browser.newPage({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: false,
    });
    await nojs.goto(url, { waitUntil: "load", timeout: 120000 });
    assert.equal(await nojs.locator(".archive-entry").count(), 6);
    assert.ok(
      await nojs
        .getByRole("button", { name: "Words", exact: true })
        .isDisabled(),
    );
    await nojs.locator("#archive-first-note summary").click();
    assert.ok(
      await nojs.locator("#archive-first-note .archive-entry-body").isVisible(),
    );
    assert.equal(await nojs.locator(".pin-spacer").count(), 0);
    await overflow(nojs);
    await nojs.screenshot({
      path: path.join(output, "no-js-archive.png"),
      style,
    });
    results.push({
      noJavaScript:
        "all entries readable, native disclosures work, filters truthfully disabled",
    });
    await nojs.close();
    fs.writeFileSync(
      path.join(output, "archive-browser-results.json"),
      JSON.stringify(results, null, 2) + "\n",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
