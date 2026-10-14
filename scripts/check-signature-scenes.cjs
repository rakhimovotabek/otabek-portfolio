/* eslint-disable @typescript-eslint/no-require-imports -- External optional QA tooling. */
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
const out = path.resolve(
  process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/signature/after",
);
const report = {
  build: process.env.PORTFOLIO_BUILD_MODE || "production",
  scenes: [],
  responsive: [],
  accessibility: [],
  runtimeErrors: [],
};
const kinds = ["work", "gallery", "about"];
async function idle(page) {
  await page.waitForFunction(
    () => document.querySelector(".route-cover")?.dataset.state === "idle",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
}
async function progress(page, kind, value, delay = 550) {
  await page.evaluate(
    ({ kind, value }) => {
      const host = document.querySelector(`[data-signature="${kind}"]`);
      const stage = host.querySelector("[data-stage]");
      scrollTo({
        top:
          host.getBoundingClientRect().top +
          scrollY +
          (host.offsetHeight - stage.offsetHeight) * value,
        behavior: "instant",
      });
    },
    { kind, value },
  );
  await page.waitForTimeout(delay);
}
async function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        transform: el.style.transform,
      };
    };
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      art: [
        ...document.querySelectorAll(
          "[data-exhibit-art],[data-collage-frame],[data-story-frame]",
        ),
      ].map(box),
      nodes: document.querySelector("#top").querySelectorAll("*").length,
      stage: box(document.querySelector("[data-stage]")),
      pins: document.querySelectorAll(".pin-spacer").length,
      panels: [...document.querySelectorAll("[data-exhibit]")].map((el) => ({
        inert: el.inert,
        hidden: el.getAttribute("aria-hidden"),
      })),
    };
  });
}
(async () => {
  fs.mkdirSync(out + "/recordings", { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    for (const kind of kinds) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        recordVideo: {
          dir: out + "/recordings",
          size: { width: 960, height: 600 },
        },
      });
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
      page.on("pageerror", (error) =>
        report.runtimeErrors.push({ kind, message: error.message }),
      );
      assert.equal(
        (
          await page.goto(`${base}/${kind}`, { waitUntil: "domcontentloaded" })
        ).status(),
        200,
      );
      await idle(page);
      await page.waitForFunction(
        (k) =>
          document
            .querySelector(`[data-signature="${k}"]`)
            ?.className.includes("enhanced"),
        kind,
      );
      await page.screenshot({ path: `${out}/${kind}-top.png` });
      await page.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${out}/${kind}-scene.png` });
      const frames = [];
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        await progress(page, kind, p);
        const m = await measure(page);
        assert.equal(m.overflow, false, `${kind} overflow at ${p}`);
        assert.equal(
          m.pins,
          0,
          "Native sticky must not create GSAP pin spacers",
        );
        assert.equal(m.stage.height, 900, "Scene fits the viewport");
        frames.push({ progress: p, ...m });
        if (kind === "about" && p === 0.75) {
          const reveal = await page
            .locator("[data-story-chapter]")
            .nth(2)
            .evaluate((el) => ({
              clip: getComputedStyle(el).clipPath,
              opacity: getComputedStyle(el).opacity,
              inert: el.inert,
            }));
          const percentages = (reveal.clip.match(/[\d.]+%/g) || []).map(
            parseFloat,
          );
          assert.ok(
            percentages.some((value) => value > 5 && value < 95),
            "Biography mask must be partially open, rather than snapping at completion",
          );
          assert.equal(
            reveal.opacity,
            "1",
            "Mask reveal retains sharp editorial type",
          );
          assert.equal(
            reveal.inert,
            true,
            "Masked milestone link is excluded from keyboard focus until revealed",
          );
        }
        await page.screenshot({ path: `${out}/${kind}-${p * 100}.png` });
        if ([0, 0.5, 1].includes(p)) {
          const axe = await new AxeBuilder({ page })
            .include("[data-signature]")
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          fs.writeFileSync(
            `${out}/axe-${kind}-${p * 100}.json`,
            JSON.stringify(axe, null, 2),
          );
          report.accessibility.push({
            kind,
            progress: p,
            violations: axe.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
            incomplete: axe.incomplete.map((v) => ({
              id: v.id,
              targets: v.nodes.map((n) => n.target),
            })),
          });
        }
      }
      assert.ok(
        Math.abs(frames[0].art[0].x - frames[2].art[0].x) > 100 ||
          Math.abs(frames[0].art[0].width - frames[2].art[0].width) > 100,
        `${kind} must materially change composition`,
      );
      const reversed = [];
      for (const p of [0.75, 0.5, 0.25, 0]) {
        await progress(page, kind, p);
        const m = await measure(page);
        const original = frames.find((frame) => frame.progress === p);
        m.art.forEach((art, i) =>
          ["x", "y", "width", "height"].forEach((key) =>
            assert.ok(
              Math.abs(art[key] - original.art[i][key]) < 2,
              `${kind} reverse ${p} ${key}`,
            ),
          ),
        );
        reversed.push({ progress: p, ...m });
      }
      if (kind === "work") {
        await page.locator("[data-jump]").nth(1).click();
        assert.equal(
          await page
            .locator("[data-exhibit]")
            .nth(0)
            .evaluate((el) => el.inert),
          true,
        );
        assert.equal(
          await page
            .locator("[data-exhibit]")
            .nth(1)
            .evaluate((el) => el.inert),
          false,
        );
        await page.locator("[data-jump]").nth(0).click();
        const trigger = page
          .locator('[data-signature="work"]')
          .getByRole("button", {
            name: "Collaborate on this project",
            exact: true,
          });
        await trigger.click();
        await page.locator(".contact-dialog").waitFor({ state: "visible" });
        await page.keyboard.press("Escape");
        assert.equal(
          await trigger.evaluate((el) => el === document.activeElement),
          true,
          "Scene collaboration restores focus",
        );
      }
      for (const direction of [1, -1])
        for (let i = 0; i < 50; i++) {
          await progress(page, kind, direction === 1 ? i / 49 : 1 - i / 49, 25);
        }
      const video = await page.video().path();
      await context.close();
      fs.renameSync(video, `${out}/recordings/${kind}.webm`);
      fs.writeFileSync(
        `${out}/${kind}-measurements.json`,
        JSON.stringify({ frames, reversed }, null, 2),
      );
      report.scenes.push({
        kind,
        forward: true,
        reverse: true,
        substantialTransform: true,
        frames,
      });
    }
    for (const [width, height] of [
      [1024, 768],
      [390, 844],
      [320, 800],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        hasTouch: width < 800,
        isMobile: width < 800,
      });
      for (const kind of kinds) {
        await page.goto(`${base}/${kind}`, { waitUntil: "domcontentloaded" });
        await idle(page);
        const snapshot = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          enhanced: document
            .querySelector("[data-signature]")
            .className.includes("enhanced"),
        }));
        assert.equal(snapshot.overflow, false, `${kind} ${width} overflow`);
        assert.equal(snapshot.enhanced, width >= 800);
        await page.screenshot({ path: `${out}/${kind}-${width}.png` });
        if (width === 390) {
          await page.screenshot({ path: `${out}/${kind}-mobile.png` });
          await page.locator("[data-signature]").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${out}/${kind}-mobile-scene.png` });
        }
        if (width >= 800)
          for (const p of [0, 0.5, 1]) {
            await progress(page, kind, p);
            assert.equal((await measure(page)).overflow, false);
            await page.screenshot({
              path: `${out}/${kind}-${width}-${p * 100}.png`,
            });
          }
        report.responsive.push({ kind, width, height, ...snapshot });
      }
      await page.close();
    }
    for (const options of [
      { reducedMotion: "reduce" },
      { javaScriptEnabled: false },
    ]) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
        ...options,
      });
      for (const kind of kinds) {
        await page.goto(`${base}/${kind}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(600);
        assert.equal(
          await page
            .locator("[data-signature]")
            .evaluate((el) => el.className.includes("enhanced")),
          false,
        );
        assert.equal(await page.locator("[data-signature] [inert]").count(), 0);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
        await page.locator("[data-signature]").scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `${out}/${kind}-${options.javaScriptEnabled === false ? "nojs" : "reduced"}.png`,
        });
      }
      await page.close();
    }
    fs.writeFileSync(
      `${out}/signature-results.json`,
      JSON.stringify(report, null, 2),
    );
    assert.deepEqual(report.runtimeErrors, []);
    assert.deepEqual(
      report.accessibility.flatMap((scan) => scan.violations),
      [],
      "Scene WCAG violations; inspect axe JSON",
    );
    console.log(
      "PASS: five states, reverse geometry, composition changes, collaboration focus, responsive, reduced motion, no-JS and scene axe scans.",
    );
  } finally {
    await browser.close();
    fs.writeFileSync(
      `${out}/signature-results.json`,
      JSON.stringify(report, null, 2),
    );
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
