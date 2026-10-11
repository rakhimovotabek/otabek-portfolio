/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS resolves optional external QA tooling via NODE_PATH. */
/* Run with externally installed Playwright; no application dependency needed.
   PORTFOLIO_URL=http://127.0.0.1:3001 PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome
   NODE_PATH=/path/to/node_modules node scripts/check-motion.cjs */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const output = path.resolve("docs/preview/phase3");
const url = process.env.PORTFOLIO_URL || "http://127.0.0.1:3001";
const ids = [
  "sat-chi",
  "huquq-test",
  "sme-financial-assistant",
  "telegram-media-downloader",
  "ielts-progress-tracker",
];
const results = [];
const shotStyle = ".skip-link:not(:focus){visibility:hidden}";
const sleep = (page, ms = 600) => page.waitForTimeout(ms);
const scroll = async (page, y, ms = 600) => {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    y,
  );
  await sleep(page, ms);
};
const section = (page, selector) =>
  page
    .locator(selector)
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
const overflow = async (page) =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal overflow",
  );
const snapshot = async (page, name) =>
  page.screenshot({ path: path.join(output, name + ".png"), style: shotStyle });
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
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      assert.equal(
        (await page.goto(url, { waitUntil: "networkidle" })).status(),
        200,
      );
      await sleep(page, 1700);
      await overflow(page);
      assert.equal(await page.locator("h1").innerText(), "default.");
      assert.equal(
        await page
          .locator(".wordmark-reveal")
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
        await page
          .locator("h1")
          .evaluate((el) =>
            Math.round(
              el.getBoundingClientRect().top +
                parseFloat(getComputedStyle(el).paddingTop),
            ),
          ),
      );
      await snapshot(page, `${name}-hero`);
      const pinned = width >= 1100;
      assert.equal(await page.locator(".is-cinematic").count(), pinned ? 1 : 0);
      if (pinned) {
        const start = (await section(page, ".pin-spacer")) - height * 0.09;
        for (let i = 0; i < 5; i++) {
          await scroll(page, start + (height * 4.5 * (i + 0.28)) / 5);
          assert.equal(
            await page
              .locator(".vault-motion")
              .getAttribute("data-active-project"),
            ids[i],
          );
          assert.equal(await page.locator(".project[inert]").count(), 4);
          assert.equal(
            await page.locator('.project[aria-hidden="false"]').count(),
            1,
          );
          assert.ok(
            await page
              .locator("#" + ids[i])
              .evaluate(
                (el) =>
                  getComputedStyle(el).visibility === "visible" &&
                  parseFloat(getComputedStyle(el).opacity) > 0.99,
              ),
          );
          const rect = await page.locator("#" + ids[i]).boundingBox();
          assert.ok(
            rect.y >= -1 && rect.y + rect.height <= height + 1,
            JSON.stringify(rect),
          );
          await overflow(page);
          if (name === "desktop")
            await snapshot(page, `desktop-vault-${i + 1}`);
        }
        // Fast skipping and reverse scrolling must leave an interactive, visible scene.
        for (const i of [0, 4, 2, 1, 0]) {
          await scroll(page, start + (height * 4.5 * (i + 0.28)) / 5);
          assert.equal(
            await page
              .locator(".vault-motion")
              .getAttribute("data-active-project"),
            ids[i],
          );
        }
        // Slow handoff: combined visible panel opacity never drops to a blank frame.
        for (let n = 0; n <= 12; n++) {
          await scroll(
            page,
            start + (height * 4.5 * (0.55 + n * 0.05)) / 5,
            70,
          );
          const visible = await page
            .locator(".project")
            .evaluateAll((els) =>
              els.reduce(
                (sum, el) => sum + Number(getComputedStyle(el).opacity),
                0,
              ),
            );
          assert.ok(visible > 0.4, "Blank Vault transition");
        }
        await page
          .getByRole("link", { name: "Show Huquq Test", exact: true })
          .click();
        await sleep(page);
        assert.equal(
          await page
            .locator(".vault-motion")
            .getAttribute("data-active-project"),
          "huquq-test",
        );
        await page
          .getByRole("link", { name: "Show SAT’chi", exact: true })
          .click();
        await sleep(page);
        // Focused panel gets safe focus handoff when it leaves.
        await page.locator("#sat-chi summary").focus();
        await scroll(page, start + (height * 4.5 * 2.28) / 5);
        assert.ok(
          await page.evaluate(() => !document.activeElement.closest("[inert]")),
        );
        await page
          .getByRole("link", { name: "Show SAT’chi", exact: true })
          .click();
        await sleep(page);
        await page.locator("#sat-chi summary").click();
        await sleep(page);
        assert.equal(await page.locator(".pin-spacer").count(), 0);
        assert.equal(await page.locator(".project[inert]").count(), 0);
        assert.ok(await page.locator("#sat-chi-comment-name").isDisabled());
        assert.ok(
          await page
            .locator("#sat-chi summary")
            .evaluate((el) => el === document.activeElement),
        );
      } else {
        for (const id of ids) {
          await scroll(page, (await section(page, "#" + id)) - height * 0.15);
          await overflow(page);
          assert.ok(await page.locator("#" + id).isVisible());
        }
        for (const id of [...ids].reverse()) {
          await scroll(page, (await section(page, "#" + id)) - height * 0.4);
          await overflow(page);
        }
        await page.locator("#sat-chi summary").click();
        assert.ok(await page.locator("#sat-chi-comment-name").isDisabled());
        await scroll(page, 0);
        await page.locator(".mobile-menu summary").click();
        await page
          .getByRole("navigation", { name: "Mobile navigation" })
          .getByRole("link", { name: "The Vault" })
          .click();
        await sleep(page, 1000);
        assert.equal(
          await page.locator(".mobile-menu").getAttribute("open"),
          null,
        );
        assert.ok(Math.abs((await page.locator("#work").boundingBox()).y) < 50);
      }
      for (const [label, selector] of [
        ["about", "#about"],
        ["quests", "#side-quests"],
        ["achievements", "#achievements"],
        ["guestbook", "#guestbook"],
        ["contact", "#contact"],
      ]) {
        await scroll(page, await section(page, selector));
        await overflow(page);
        await snapshot(page, `${name}-${label}`);
      }
      await page.getByRole("button", { name: "Message me" }).click();
      assert.ok(await page.getByRole("dialog").isVisible());
      assert.ok(
        await page
          .getByRole("dialog")
          .getByLabel("Your message", { exact: true })
          .isDisabled(),
      );
      await sleep(page, 300);
      await snapshot(page, `${name}-dialog`);
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(
          () =>
            document.activeElement === document.body ||
            document.querySelector("dialog").contains(document.activeElement),
        ),
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
      assert.ok(
        await page
          .getByRole("button", { name: "Message me" })
          .evaluate((el) => el === document.activeElement),
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await sleep(page);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      assert.equal(await page.locator(".project[inert]").count(), 0);
      assert.equal(
        await page.locator(".hero-art").evaluate((el) => el.style.transform),
        "",
      );
      assert.equal(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).scrollBehavior,
        ),
        "auto",
      );
      assert.ok(
        await page
          .locator(".project")
          .evaluateAll((els) =>
            els.every(
              (el) =>
                getComputedStyle(el).visibility === "visible" &&
                getComputedStyle(el).opacity === "1",
            ),
          ),
      );
      await scroll(page, 0);
      await overflow(page);
      await snapshot(page, `${name}-reduced`);
      assert.deepEqual(errors, []);
      results.push({
        name,
        width,
        height,
        pinning: pinned ? "passed" : "absent as intended",
        scrolling: "slow/fast/reverse passed",
        anchors: "passed",
        dialog: "passed",
        notes: "disabled",
        reducedMotion: "passed",
        overflow: false,
        errors,
      });
      await page.close();
      console.log("PASS", name);
    }
    // Fresh reduced-motion render and no-JavaScript layouts are independent of animation init.
    for (const javaScriptEnabled of [true, false]) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        javaScriptEnabled,
        reducedMotion: "reduce",
      });
      await page.goto(url, { waitUntil: "load" });
      await sleep(page, 600);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      assert.equal(await page.locator(".project[inert]").count(), 0);
      assert.ok(await page.locator("h1").isVisible());
      await overflow(page);
      await page.close();
    }
    // Resize and preference changes exercise context teardown/recreation repeatedly.
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: "networkidle" });
    await sleep(page, 1600);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Performance.enable");
    const metric = async () =>
      Object.fromEntries(
        (await cdp.send("Performance.getMetrics")).metrics.map((m) => [
          m.name,
          m.value,
        ]),
      );
    await cdp.send("HeapProfiler.collectGarbage");
    const before = await metric();
    for (let n = 0; n < 5; n++) {
      await page.setViewportSize({ width: 390, height: 844 });
      await sleep(page, 500);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      await overflow(page);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await sleep(page, 500);
      assert.equal(await page.locator(".pin-spacer").count(), 1);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await sleep(page, 250);
      assert.equal(await page.locator(".project[inert]").count(), 0);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await sleep(page, 500);
      assert.equal(await page.locator(".pin-spacer").count(), 1);
    }
    await sleep(page, 1700);
    await cdp.send("HeapProfiler.collectGarbage");
    const after = await metric();
    const performance = await page.evaluate(async () => {
      const longTasks = [];
      const observer = new PerformanceObserver((list) =>
        list.getEntries().forEach((e) => longTasks.push(e.duration)),
      );
      observer.observe({ type: "longtask", buffered: false });
      const frames = [];
      let last = performance.now();
      const start = scrollY;
      let n = 0;
      await new Promise((resolve) => {
        const frame = (time) => {
          frames.push(time - last);
          last = time;
          window.scrollTo({ top: start + n * 24, behavior: "instant" });
          if (++n < 180) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      observer.disconnect();
      frames.shift();
      frames.sort((a, b) => a - b);
      return {
        sampledFrames: frames.length,
        medianFrameMs: frames[Math.floor(frames.length * 0.5)],
        p95FrameMs: frames[Math.floor(frames.length * 0.95)],
        longTasksOver50ms: longTasks.length,
        maxLongTaskMs: Math.max(0, ...longTasks),
      };
    });
    assert.deepEqual(errors, []);
    results.push({
      lifecycle: "5 resize/preference cycles passed, exactly one pin",
      heapBytes: { before: before.JSHeapUsedSize, after: after.JSHeapUsedSize },
      nodes: { before: before.Nodes, after: after.Nodes },
      listeners: {
        before: before.JSEventListeners,
        after: after.JSEventListeners,
      },
      performance,
      errors,
    });
    await page.close();
    fs.writeFileSync(
      path.join(output, "browser-results.json"),
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
