/* eslint-disable @typescript-eslint/no-require-imports -- Focused screenshot evidence. */
const { chromium } = require("playwright");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3010";
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
    for (const route of ["home", "work", "gallery"]) {
      await p.goto(base + (route === "home" ? "" : "/" + route), {
        waitUntil: "domcontentloaded",
      });
      await p.waitForSelector("[data-od-ready=true]");
      await p.evaluate(() => scrollTo({ top: 768, behavior: "instant" }));
      await p.waitForTimeout(100);
      await p.screenshot({
        path: `docs/design-reset/after/1366-${route}-mid.png`,
      });
    }
    await p.goto(base + "/about");
    await p.waitForSelector("[data-od-ready=true]");
    for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
      await p.locator("[data-od-trace]").evaluate((path, f) => {
        const element = path.parentElement;
        const top =
          scrollY + element.getBoundingClientRect().top - innerHeight * 0.7;
        const bottom =
          scrollY + element.getBoundingClientRect().bottom - innerHeight * 0.75;
        scrollTo({ top: top + (bottom - top) * f, behavior: "instant" });
      }, fraction);
      await p.waitForTimeout(100);
      await p.screenshot({
        path: `docs/design-reset/motion/1366-trajectory-${fraction * 100}.png`,
      });
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
