/* eslint-disable @typescript-eslint/no-require-imports -- Optional external Playwright tooling. */
// Real Chromium comparison with the owner's standalone prototype; no hosted writes.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const app = process.env.PORTFOLIO_URL || "http://127.0.0.1:3003";
const prototype =
  process.env.PROTOTYPE_URL ||
  "http://127.0.0.1:4173/otabek_reference_hero_demo.html";
const output = path.resolve(
  process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/reference-hero",
);
const views = [
  ["desktop", 1440, 900],
  ["laptop", 1366, 900],
  ["mobile", 390, 844],
  ["narrow-mobile", 360, 800],
];
const results = [];
const instant = async (page, y) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
const overflow = async (page) =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal overflow",
  );
const capture = async (page, file) =>
  page.screenshot({
    path: path.join(output, file + ".png"),
    style: ".nextjs-toast-errors-parent,[data-nextjs-toast]{display:none}",
  });
const journey = async (page, enhanced) =>
  page.evaluate((isApp) => {
    const section = document.querySelector(
      isApp ? "[data-hero-journey]" : ".hero-journey",
    );
    const stage = document.querySelector(
      isApp ? "[data-hero-stage]" : ".stage",
    );
    return {
      top: section.getBoundingClientRect().top + scrollY,
      range: section.offsetHeight - stage.offsetHeight,
    };
  }, enhanced);
const seek = async (page, progress, enhanced = true) => {
  const bounds = await journey(page, enhanced);
  await instant(page, bounds.top + bounds.range * progress);
  await page.waitForTimeout(enhanced ? 650 : 100);
};
const boxes = async (page, enhanced) =>
  page.locator(enhanced ? "[data-world]" : ".world").evaluateAll((nodes) =>
    nodes.map((node) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );
async function open(page, url, enhanced) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  if (enhanced) await page.locator(".hero-journey.is-enhanced").waitFor();
  await page.waitForTimeout(1800);
}
async function phase(page, value) {
  assert.equal(
    await page.locator("[data-hero-journey]").getAttribute("data-hero-phase"),
    value,
  );
  const expected = value === "opening";
  assert.equal(
    await page.locator("[data-hero-worlds]").evaluate((el) => el.inert),
    !expected,
  );
  assert.equal(
    await page.locator("[data-hero-focus]").evaluate((el) => el.inert),
    value !== "focus",
  );
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    for (const [label, width, height] of views) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: "no-preference",
        isMobile: width < 800,
        hasTouch: width < 800,
      });
      context.setDefaultTimeout(20000);
      const reference = await context.newPage();
      await open(reference, prototype, false);
      const originalBoxes = await boxes(reference, false);
      for (const [state, progress] of [
        ["opening", 0],
        ["focus", 0.56],
        ["wipe", 0.9],
      ]) {
        await seek(reference, progress, false);
        await capture(reference, `prototype-${label}-${state}`);
      }
      await reference.locator(".editorial").evaluate((el) =>
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await capture(reference, `prototype-${label}-editorial`);
      await reference.close();
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await open(page, app, true);
      await phase(page, "opening");
      const updatedBoxes = await boxes(page, true);
      assert.equal(updatedBoxes.length, 4);
      const deviations = updatedBoxes.map((box, i) =>
        Object.fromEntries(
          Object.keys(box).map((key) => [
            key,
            Math.round(Math.abs(box[key] - originalBoxes[i][key])),
          ]),
        ),
      );
      assert.ok(
        deviations.every((box) =>
          Object.values(box).every((delta) => delta <= 18),
        ),
        `World geometry differs from prototype: ${JSON.stringify(deviations)}`,
      );
      const name = await page.locator("#hero-heading").boundingBox();
      assert.ok(name.x >= 0 && name.x + name.width <= width + 1);
      await capture(page, `website-${label}-opening`);
      await seek(page, 0.56);
      await phase(page, "focus");
      await capture(page, `website-${label}-focus`);
      assert.ok(
        await page.locator('[data-hero-focus] a[href="#sat-chi"]').isVisible(),
      );
      const scrollPosition = await page.evaluate(() => scrollY);
      await page
        .getByRole("button", { name: "Message me", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await dialog.evaluate((el) => el.contains(document.activeElement)),
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await dialog.count(), 0);
      assert.equal(await page.evaluate(() => scrollY), scrollPosition);
      assert.ok(
        await page
          .getByRole("button", { name: "Message me", exact: true })
          .evaluate((el) => el === document.activeElement),
      );
      await seek(page, 0.9);
      await phase(page, "transition");
      const wipe = await page.locator("[data-hero-wipe]").boundingBox();
      assert.ok(
        wipe.y < height * 0.15 && wipe.y + wipe.height >= height,
        `Diagonal paper wipe is off-screen: ${JSON.stringify(wipe)}`,
      );
      await capture(page, `website-${label}-wipe`);
      // Scrub in both directions, including jumps that skip intermediate frames.
      for (const progress of [0.56, 0.15, 0, 0.97, 0.4, 0]) {
        await seek(page, progress);
        assert.ok(
          Math.abs((await page.locator("[data-hero-stage]").boundingBox()).y) <=
            2,
        );
        await overflow(page);
      }
      await phase(page, "opening");
      const focusTarget = page.locator("[data-hero-focus] a");
      await seek(page, 0.56);
      await focusTarget.focus();
      await seek(page, 0.9);
      assert.ok(
        await page
          .locator(".reference-navigation .wordmark")
          .evaluate((el) => el === document.activeElement),
        "Covered control kept focus",
      );
      await seek(page, 0.56);
      await focusTarget.click({ noWaitAfter: true });
      await page.waitForFunction(
        () =>
          location.hash === "#sat-chi" &&
          !document.querySelector("#sat-chi").inert,
      );
      await overflow(page);
      // Native anchors remain functional through both sticky scenes and the Vault.
      await instant(page, 0);
      await page.waitForTimeout(650);
      await page
        .locator('[data-world="writings"]')
        .click({ noWaitAfter: true });
      await page.waitForFunction(
        () =>
          location.hash === "#writing" &&
          Math.abs(
            document.querySelector("#writing").getBoundingClientRect().top,
          ) < 120,
      );
      await instant(page, 0);
      await page.waitForTimeout(650);
      if (width < 800) {
        await page.getByLabel("Toggle navigation").click();
        await page
          .locator('.mobile-menu a[href="#about"]')
          .click({ noWaitAfter: true });
        assert.equal(
          await page.locator(".mobile-menu").evaluate((el) => el.open),
          false,
        );
      } else
        await page
          .locator('.desktop-nav a[href="#about"]')
          .click({ noWaitAfter: true });
      await page.waitForFunction(
        () =>
          location.hash === "#about" &&
          Math.abs(
            document.querySelector("#about").getBoundingClientRect().top,
          ) < 120,
      );
      await page.locator("#about").evaluate((el) =>
        window.scrollTo({
          top: el.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        }),
      );
      await page.waitForTimeout(650);
      await capture(page, `website-${label}-editorial`);
      await overflow(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await instant(page, 0);
      await page.waitForTimeout(450);
      assert.equal(await page.locator(".hero-journey.is-enhanced").count(), 0);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      assert.equal(
        await page.locator("[data-hero-worlds]").evaluate((el) => el.inert),
        false,
      );
      assert.ok(
        (await page.locator("[data-hero-journey]").boundingBox()).height <=
          height + 1,
      );
      await capture(page, `website-${label}-reduced`);
      assert.deepEqual(errors, []);
      results.push({
        label,
        width,
        height,
        originalBoxes,
        updatedBoxes,
        deviations,
        forwardReverse: true,
        fastJumps: true,
        diagonalWipe: true,
        anchors: true,
        focusRescue: true,
        dialog: true,
        reducedMotion: true,
        overflow: false,
        errors,
      });
      await context.close();
      console.log("PASS", label);
    }
    const noJS = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await noJS.newPage();
    await page.goto(app, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("[data-world]").count(), 4);
    assert.ok(
      (await page.locator("[data-hero-journey]").boundingBox()).height <= 845,
    );
    await page.getByLabel("Toggle navigation").click();
    await page
      .locator('.mobile-menu a[href="#about"]')
      .click({ noWaitAfter: true });
    await page.waitForURL(/#about$/);
    await overflow(page);
    await capture(page, "website-mobile-no-js-editorial");
    await noJS.close();
    results.push({
      noJavaScript:
        "four visible worlds, compact opening, native navigation and editorial content passed",
    });
    fs.writeFileSync(
      path.join(output, "hero-browser-results.json"),
      JSON.stringify(results, null, 2),
    );
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
