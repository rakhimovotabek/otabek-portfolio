/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser evidence. */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve("docs/design-reset/motion");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3010";
async function scroll(page, from, to, ms) {
  await page.evaluate(
    async ({ from, to, ms }) => {
      scrollTo({ top: from, behavior: "instant" });
      await new Promise((resolve) => {
        const start = performance.now();
        function step(now) {
          const f = Math.min(1, (now - start) / ms);
          scrollTo({ top: from + (to - from) * f, behavior: "instant" });
          if (f < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      });
    },
    { from, to, ms },
  );
}
(async () => {
  fs.mkdirSync(root, { recursive: true });
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  const clips =
    process.env.RECORD_ONLY_MOBILE && fs.existsSync(`${root}/clips.json`)
      ? JSON.parse(fs.readFileSync(`${root}/clips.json`, "utf8"))
      : [];
  try {
    for (const route of process.env.RECORD_ONLY_MOBILE
      ? []
      : ["home", "work", "gallery"]) {
      const c = await b.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: { dir: root + "/raw", size: { width: 1280, height: 720 } },
      });
      const p = await c.newPage();
      await p.goto(base + (route === "home" ? "" : "/" + route), {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });
      await p.waitForSelector("[data-od-ready=true]");
      await p.waitForTimeout(350);
      for (const scene of await p.locator("[data-od-scene]").all()) {
        const box = await scene.evaluate((el) => ({
          start: scrollY + el.getBoundingClientRect().top - 88,
          end: scrollY + el.getBoundingClientRect().bottom - innerHeight,
        }));
        await scroll(p, Math.max(0, box.start), box.end, 4200);
        await p.waitForTimeout(350);
        await scroll(p, box.end, Math.max(0, box.start), 1700);
        await p.waitForTimeout(250);
      }
      if (route === "gallery") {
        await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await p.locator("[data-gallery-aperture] button").click();
        await p.waitForTimeout(1000);
        await p.keyboard.press("ArrowRight");
        await p.waitForTimeout(700);
        await p.keyboard.press("Escape");
        await p.waitForTimeout(600);
      }
      const video = p.video();
      await c.close();
      const target = `${root}/${route}.webm`;
      fs.renameSync(await video.path(), target);
      clips.push({
        route,
        file: target,
        viewport: "1280x720",
        includesReverse: true,
      });
      console.log(target);
    }
    const c = await b.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
      recordVideo: { dir: root + "/raw", size: { width: 390, height: 844 } },
    });
    const p = await c.newPage();
    await p.goto(base + "/gallery", {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await p.waitForSelector("[data-od-ready=true]");
    await p.waitForTimeout(300);
    await p.locator("[data-gallery-aperture] button").click();
    await p.waitForTimeout(900);
    await p.locator(".album-viewer-image").dispatchEvent("touchstart", {
      touches: [{ identifier: 0, clientX: 280 }],
    });
    await p.locator(".album-viewer-image").dispatchEvent("touchend", {
      changedTouches: [{ identifier: 0, clientX: 90 }],
    });
    await p.waitForTimeout(700);
    await p.keyboard.press("Escape");
    await p.waitForTimeout(600);
    await scroll(p, 0, 1400, 4000);
    await p.waitForTimeout(500);
    const video = p.video();
    await c.close();
    fs.renameSync(await video.path(), `${root}/mobile-gallery.webm`);
    clips.push({
      route: "gallery",
      file: "mobile-gallery.webm",
      viewport: "390x844",
      simulatedTouch: true,
    });
  } finally {
    await b.close();
    fs.writeFileSync(`${root}/clips.json`, JSON.stringify(clips, null, 2));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
