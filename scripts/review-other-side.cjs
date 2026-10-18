/* eslint-disable @typescript-eslint/no-require-imports -- Optional external Playwright QA, no application dependency. */
const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3010";
const root = path.resolve("docs/design-reset");
const report = {
  build: "production",
  base,
  checks: [],
  routes: [],
  scenes: [],
  axe: [],
  errors: [],
  failedRequests: [],
  limitations: [
    "No authenticated owner/MFA session or live submission.",
    "No real touch device.",
    "Gallery awaits personal photos; Journal awaits owner writing.",
  ],
};
function check(name, details) {
  report.checks.push({ name, details, passed: true });
  console.log("PASS", name);
}
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [1366, 390]) {
      const context = await b.newContext({
        viewport: { width, height: width === 1366 ? 768 : 844 },
        hasTouch: width === 390,
      });
      const p = await context.newPage();
      p.on("pageerror", (e) => report.errors.push({ width, error: e.message }));
      p.on("requestfailed", (r) => {
        if (!r.failure()?.errorText.includes("ERR_ABORTED"))
          report.failedRequests.push({
            width,
            url: r.url(),
            error: r.failure(),
          });
      });
      async function ready() {
        await p.waitForSelector("[data-od-ready=true]");
        await p.evaluate(() => document.fonts.ready);
        await p.waitForFunction(() =>
          [...document.images]
            .filter((i) => i.loading === "eager")
            .every((i) => i.complete),
        );
      }
      async function go(route) {
        const response = await p.goto(base + route, {
          waitUntil: "domcontentloaded",
        });
        assert.equal(response.status(), 200);
        await ready();
      }
      async function snap(name) {
        await p.screenshot({ path: `${root}/after/${width}-${name}.png` });
      }
      for (const route of [
        "/",
        "/work",
        "/gallery",
        "/about",
        "/journal",
        "/links",
        "/guestbook",
      ]) {
        await go(route);
        assert.equal(await p.locator("main h1").count(), 1);
        const overflow = await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        );
        assert.equal(overflow, false, `${width}${route} overflow`);
        report.routes.push({
          width,
          route,
          overflow,
          h1: await p.locator("h1").innerText(),
        });
        await snap((route.slice(1) || "home") + "-opening");
        const targets = await p
          .locator("a,button,summary")
          .evaluateAll((elements) =>
            elements
              .map((el) => {
                const r = el.getBoundingClientRect();
                return {
                  label: (el.getAttribute("aria-label") || el.textContent)
                    .trim()
                    .slice(0, 80),
                  width: r.width,
                  height: r.height,
                  visible:
                    r.width > 0 &&
                    r.height > 0 &&
                    r.top < innerHeight &&
                    r.bottom > 0 &&
                    !el.closest("[inert]") &&
                    getComputedStyle(el).visibility !== "hidden",
                };
              })
              .filter((t) => t.visible && Math.min(t.width, t.height) < 44),
          );
        report.routes[report.routes.length - 1].smallTargets = targets;

        if (width === 1366) {
          const results = await new AxeBuilder({ page: p }).analyze();
          report.axe.push({
            width,
            route,
            violations: results.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          });
          for (const scene of await p.locator("[data-od-scene]").all()) {
            const kind = await scene.getAttribute("data-od-scene");
            const frames = [];
            for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
              await scene.evaluate((el, f) => {
                const range = el.offsetHeight - innerHeight + 88;
                scrollTo({
                  top:
                    scrollY + el.getBoundingClientRect().top - 88 + range * f,
                  behavior: "instant",
                });
              }, progress);
              await p.waitForTimeout(80);
              const name = `${width}-${kind}-${progress * 100}`;
              await p.screenshot({ path: `${root}/motion/${name}.png` });
              frames.push({
                progress,
                y: await p.evaluate(() => scrollY),
                transform: await scene
                  .locator(
                    kind === "home"
                      ? ".od-portal"
                      : kind === "sat"
                        ? ".od-answer-sheet"
                        : kind === "law"
                          ? ".od-folio-page"
                          : ".od-gallery-aperture",
                  )
                  .evaluate((e) => getComputedStyle(e).transform),
              });
            }
            await scene.evaluate((el) =>
              scrollTo({
                top: scrollY + el.getBoundingClientRect().top - 88,
                behavior: "instant",
              }),
            );
            await p.waitForTimeout(80);
            const reversed = await scene
              .locator(
                kind === "home"
                  ? ".od-portal"
                  : kind === "sat"
                    ? ".od-answer-sheet"
                    : kind === "law"
                      ? ".od-folio-page"
                      : ".od-gallery-aperture",
              )
              .evaluate((e) => getComputedStyle(e).transform);
            const numbers = (value) =>
              value.match(/-?\d*\.?\d+/g)?.map(Number) || [];
            const initialMatrix = numbers(frames[0].transform),
              reversedMatrix = numbers(reversed);
            assert.equal(initialMatrix.length, reversedMatrix.length);
            assert.ok(
              initialMatrix.every(
                (v, i) => Math.abs(v - reversedMatrix[i]) < 0.001,
              ),
              "Reverse state must return within transform serialization precision",
            );
            report.scenes.push({ kind, frames, reversed });
          }
        }
        if (route === "/gallery") {
          await p.locator("#gallery-collections").evaluate((e) =>
            scrollTo({
              top: scrollY + e.getBoundingClientRect().top - 100,
              behavior: "instant",
            }),
          );
          await snap("gallery-table");
          await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
          await p.waitForTimeout(100);
          const opener = p.locator("[data-gallery-aperture] button");
          await opener.focus();
          await p.keyboard.press("Enter");
          await p.locator(".album-dialog[open]").waitFor();
          await p.waitForTimeout(850);
          await snap("gallery-viewer");
          const modalAxe = await new AxeBuilder({ page: p }).analyze();
          report.axe.push({
            width,
            route: "/gallery#viewer",
            violations: modalAxe.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          });

          const firstCaption = await p
            .locator(".album-dialog [role=status]")
            .innerText();
          await p.keyboard.press("ArrowRight");
          await p.waitForTimeout(600);
          assert.notEqual(
            await p.locator(".album-dialog [role=status]").innerText(),
            firstCaption,
          );
          if (width === 390) {
            await p.locator(".album-viewer-image").dispatchEvent("touchstart", {
              touches: [{ identifier: 0, clientX: 260 }],
            });
            await p.locator(".album-viewer-image").dispatchEvent("touchend", {
              changedTouches: [{ identifier: 0, clientX: 90 }],
            });
            await p.waitForTimeout(600);
          }
          await p.keyboard.press("Tab");
          assert.equal(
            await p.evaluate(
              () => document.activeElement.closest("dialog") !== null,
            ),
            true,
          );
          await p.keyboard.press("Escape");
          await p.waitForFunction(
            () => !document.querySelector(".album-dialog").open,
          );
          assert.equal(
            await opener.evaluate((e) => e === document.activeElement),
            true,
          );
          check(`viewer keyboard, Escape, focus return ${width}`, {
            touchSwipe: width === 390,
          });
          await p
            .locator(
              'a[href="/gallery?category=photography#gallery-collections"]',
            )
            .click();
          await p.waitForURL(
            "**/gallery?category=photography#gallery-collections",
          );
          await p
            .getByRole("heading", { name: "A place for the real thing." })
            .waitFor();
          check(`Gallery empty category ${width}`);
        }
        if (route === "/work") {
          await p.locator("#work-directory").evaluate((e) =>
            scrollTo({
              top: scrollY + e.getBoundingClientRect().top - 100,
              behavior: "instant",
            }),
          );
          await snap("work-index");
          await p
            .locator('a[href="/work?category=physical#work-directory"]')
            .click();
          await p.waitForURL("**/work?category=physical#work-directory");
          await p
            .getByText("No works in this category have been published yet.")
            .waitFor();
          check(`Work URL filter ${width}`);
        }
        if (width === 390) {
          const axe = await new AxeBuilder({ page: p }).analyze();
          report.axe.push({
            width,
            route,
            violations: axe.violations.map((v) => ({
              id: v.id,
              impact: v.impact,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          });
        }
      }
      // Width matrix uses two representative public surfaces, one page at a time.
      for (const testedWidth of width === 1366
        ? [320, 360, 768, 1024, 1440]
        : []) {
        await p.setViewportSize({ width: testedWidth, height: 900 });
        for (const route of ["/", "/work", "/gallery"]) {
          await go(route);
          assert.equal(
            await p.evaluate(
              () => document.documentElement.scrollWidth > innerWidth + 1,
            ),
            false,
          );
          report.routes.push({ width: testedWidth, route, overflow: false });
        }
      }
      await context.close();
    }
    const c = await b.newContext({ viewport: { width: 1366, height: 768 } });
    const p = await c.newPage();
    const slugs = [
      "sat-chi",
      "huquq-test",
      "sme-financial-assistant",
      "telegram-media-downloader",
      "ielts-progress-tracker",
    ];
    for (const slug of slugs) {
      await p.goto(`${base}/work/${slug}`);
      await p.waitForSelector(`[data-project-id="${slug}"]`);
      assert.equal(await p.locator(`[data-work-id="${slug}"]`).count(), 1);
      check("canonical project comment " + slug);
    }
    await p.goto(base + "/admin");
    await p.waitForURL("**/admin/login");
    check("Unauthenticated admin redirects to login");
    // Browser-only availability fixture exercises editable project context without posting.
    await p.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          reads: false,
          submissions: true,
          siteKey: "browser-fixture",
        }),
      }),
    );
    await p.route("https://challenges.cloudflare.com/**", (r) => r.abort());
    let submissions = 0;
    await p.route("**/api/contact", (r) => {
      submissions++;
      return r.abort();
    });
    await p.goto(base + "/work");
    await p.waitForSelector("[data-od-ready=true]");
    const collaborate = p
      .getByRole("button", { name: "Collaborate on this project" })
      .first();
    await collaborate.click();
    await p.locator(".contact-dialog[open]").waitFor();
    const field = p.locator(".contact-dialog textarea");
    await field.waitFor({ state: "visible" });
    await p.waitForFunction(
      () => !document.querySelector(".contact-dialog textarea").disabled,
    );
    assert.match(await field.inputValue(), /sat-chi/);
    await field.fill("Browser-only editable draft; never submitted.");
    assert.match(await field.inputValue(), /editable draft/);
    await p.keyboard.press("Escape");
    assert.equal(submissions, 0);
    check("Editable SAT collaboration context", { fixture: true, posts: 0 });
    // Empty, failed reads and unavailable submissions remain honest.
    await p.unroute("**/api/community/config");
    await p.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"reads":true,"submissions":false,"siteKey":null}',
      }),
    );
    await p.route("**/api/comments?*", (r) =>
      r.fulfill({
        status: 500,
        contentType: "application/json",
        body: '{"error":"temporarily_unavailable"}',
      }),
    );
    await p.goto(base + "/guestbook");
    await p.getByRole("button", { name: "Retry loading comments" }).waitFor();
    check("Failed comments show retry");
    await p.unroute("**/api/comments?*");
    await p.route("**/api/comments?*", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"items":[],"nextCursor":null}',
      }),
    );
    await p.reload();
    await p.waitForFunction(() =>
      document
        .querySelector(".preview-status")
        ?.textContent.includes("Nothing will be sent"),
    );
    assert.equal(
      await p.locator("form fieldset").evaluate((el) => el.disabled),
      true,
    );
    check("Empty comments and unavailable submissions");
    await p.unroute("**/api/community/config");
    await p.unroute("**/api/comments?*");
    await p.goto(base + "/work");
    await p.waitForSelector("[data-od-ready=true]");
    const lifecycle = [];
    for (const route of [
      "/gallery",
      "/about",
      "/work",
      "/journal",
      "/gallery",
      "/work",
    ]) {
      await p.locator(`.desktop-nav a[href="${route}"]`).click();
      await p.waitForURL(base + route);
      await p.waitForSelector("[data-od-ready=true]");
      const triggers = await p.evaluate(
        () =>
          window.gsap?.core.globals().ScrollTrigger?.getAll().length ?? null,
      );
      lifecycle.push({ route, triggers });
      if (triggers !== null)
        assert.equal(
          triggers,
          route === "/work" ? 2 : route === "/journal" ? 0 : 1,
        );
    }
    await p.goBack();
    await p.waitForURL(base + "/gallery");
    await p.waitForSelector("[data-od-ready=true]");
    check("Native route changes, Back and scoped cleanup", lifecycle);
    report.lifecycle = lifecycle;
    await p.goto(base + "/");
    await p.waitForSelector("[data-od-ready=true]");
    await p.evaluate(() => scrollTo({ top: 600, behavior: "instant" }));
    await p.emulateMedia({ reducedMotion: "reduce" });
    await p.waitForFunction(
      () =>
        document.querySelectorAll(".od-motion-ready").length === 0 &&
        document.querySelectorAll("[inert]").length === 0,
    );
    check(
      "Live reduced-motion switch restores ordinary flow and focusable content",
    );
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.waitForSelector(".od-motion-ready");
    await p.setViewportSize({ width: 390, height: 844 });
    await p.waitForFunction(
      () =>
        document.querySelectorAll(".od-motion-ready").length === 0 &&
        document.querySelectorAll("[inert]").length === 0,
    );
    check("Desktop to mobile resize tears down pinning and inert state");
    await c.close();
    const delayed = await b.newContext({
      viewport: { width: 390, height: 844 },
    });
    const delayPage = await delayed.newPage();
    await delayPage.route("**/images/other-side/**", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await r.continue();
    });
    await delayPage.goto(base + "/gallery", { waitUntil: "domcontentloaded" });
    const beforeImage = await delayPage
      .locator("[data-gallery-aperture] .media-window")
      .boundingBox();
    await delayPage.waitForFunction(() =>
      [...document.images]
        .filter((i) => i.loading === "eager")
        .every((i) => i.complete),
    );
    const afterImage = await delayPage
      .locator("[data-gallery-aperture] .media-window")
      .boundingBox();
    assert.ok(
      Math.abs(beforeImage.width - afterImage.width) < 0.5 &&
        Math.abs(beforeImage.height - afterImage.height) < 0.5,
    );
    check("Delayed gallery images preserve intrinsic frame dimensions", {
      beforeImage,
      afterImage,
    });
    await delayPage.goto(base + "/gallery/site-studies#study-contour");
    await delayPage.locator("#study-contour").waitFor();
    check("Direct album deep link");
    await delayed.close();
    for (const mode of ["reduced", "nojs"]) {
      const c = await b.newContext({
        viewport: { width: 1366, height: 768 },
        reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
        javaScriptEnabled: mode !== "nojs",
      });
      const p = await c.newPage();
      for (const route of ["/", "/work", "/gallery"]) {
        await p.goto(base + route);
        await p.evaluate(() => document.fonts.ready);
        assert.equal(await p.locator("main h1").count(), 1);
        assert.equal(await p.locator(".od-motion-ready").count(), 0);
        await p.screenshot({
          path: `${root}/verification/${mode}-${route.slice(1) || "home"}.png`,
        });
        if (route === "/work")
          assert.equal(
            (await p.locator('a[href="/work/sat-chi"]').count()) > 0,
            true,
          );
        check(mode + " readable " + route);
      }
      await c.close();
    }
    assert.equal(report.errors.length, 0, JSON.stringify(report.errors));
    assert.equal(
      report.axe.flatMap((r) => r.violations).length,
      0,
      "Accessibility findings need review",
    );
  } finally {
    fs.writeFileSync(
      `${root}/verification/browser.json`,
      JSON.stringify(report, null, 2),
    );
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
