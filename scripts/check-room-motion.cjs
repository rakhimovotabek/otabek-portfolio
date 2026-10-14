/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser tooling. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
const output = path.resolve(process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/motion");
const results = [];
const reports = [];
const errors = [];
const navigationOrigins = new Map();
const routes = [
  "/about",
  "/work",
  "/journal",
  "/gallery",
  "/links",
  "/guestbook",
];
const challenge = `window.turnstile={render(el,o){const b=document.createElement('button');b.type='button';b.textContent='Verify fixture';b.onclick=()=>o.callback('XXXX.DUMMY.TOKEN.XXXX');el.append(b);return 'fixture'},remove(){}};`;
async function idle(page) {
  await page.waitForFunction(
    () => document.querySelector(".route-cover")?.dataset.state === "idle",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
}
async function check(page, route, width) {
  const measurement = await page.evaluate(() => {
    const x = (s) => document.querySelector(s)?.getBoundingClientRect().x;
    return {
      brand: x(".wordmark"),
      heading: x(".page-heading"),
      navigation: x(".desktop-nav"),
      body: x("body"),
      main: x("#main"),
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      pins: document.querySelectorAll(".pin-spacer").length,
      dialogs: document.querySelectorAll("dialog[open]").length,
    };
  });
  assert.equal(measurement.overflow, false, route + " overflow");
  assert.equal(measurement.body, 0);
  assert.equal(measurement.main, 0);
  const expected = Math.max(16, Math.min(44, width * 0.026));
  assert.ok(Math.abs(measurement.brand - expected) < 1, route + " gutter");
  if (route === "/") navigationOrigins.set(width, measurement.navigation);
  else
    assert.ok(
      Math.abs(measurement.navigation - navigationOrigins.get(width)) < 1,
      route + " navigation alignment",
    );
  if (measurement.heading !== undefined)
    assert.ok(
      Math.abs(measurement.heading - measurement.brand) < 1,
      route + " heading alignment",
    );
  if (route !== "/") assert.equal(measurement.pins, 0, route + " leaked pin");
  results.push({ route, ...measurement });
}
async function snap(page, name) {
  if (!name.includes("wipe")) await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(output, name + ".png") });
}
async function openRoute(page, href) {
  const navigation =
    page.viewportSize().width < 800 ? ".mobile-menu" : ".desktop-nav";
  if (navigation === ".mobile-menu")
    await page.locator(".mobile-menu summary").click();
  await page.locator(`${navigation} a[href="${href}"]`).click();
  await page.waitForURL(base + href);
  await idle(page);
}
async function fixtures(page) {
  await page.route("**/api/community/config", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        reads: true,
        submissions: true,
        siteKey: "1x00000000000000000000AA",
      }),
    }),
  );
  await page.route(
    "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    (r) => r.fulfill({ contentType: "text/javascript", body: challenge }),
  );
  await page.route("**/api/comments?*", (r) => {
    const u = new URL(r.request().url());
    return r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            displayName: "Fixture reader",
            message:
              "A browser test impression, not a real visitor submission.",
            target:
              u.searchParams.get("target_type") === "project"
                ? {
                    kind: "project",
                    projectId: u.searchParams.get("target_id"),
                  }
                : { kind: "guestbook" },
            createdAt: "2026-10-11T10:00:00.000Z",
          },
        ],
        nextCursor: null,
      }),
    });
  });
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox", "--enable-precise-memory-info"],
  });
  try {
    for (const [label, width, height] of [
      ["desktop", 1440, 900],
      ["laptop", 1366, 900],
      ["mobile", 390, 844],
      ["narrow", 360, 800],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        isMobile: width < 800,
        hasTouch: width < 800,
        reducedMotion: "no-preference",
        recordVideo:
          label === "desktop"
            ? {
                dir: path.join(output, "recordings"),
                size: { width: 960, height: 600 },
              }
            : undefined,
      });
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      page.on("pageerror", (error) =>
        errors.push({ label, message: error.message }),
      );
      await fixtures(page);
      await page.addInitScript(() => {
        window.motionLongTasks = [];
        if (PerformanceObserver.supportedEntryTypes.includes("longtask"))
          new PerformanceObserver((list) =>
            window.motionLongTasks.push(
              ...list.getEntries().map((e) => Math.round(e.duration)),
            ),
          ).observe({ entryTypes: ["longtask"] });
      });
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await idle(page);
      await page.locator(".hero-journey.is-enhanced").waitFor();
      await page.waitForTimeout(1000);
      await check(page, "/", width);
      await snap(page, label + "-home");
      await page.evaluate(() => {
        const hero = document.querySelector("[data-hero-journey]");
        const stage = hero.querySelector("[data-hero-stage]");
        window.scrollTo({
          top: (hero.offsetHeight - stage.offsetHeight) * 0.56,
          behavior: "instant",
        });
      });
      await page.waitForTimeout(500);
      assert.equal(
        await page
          .locator("[data-hero-journey]")
          .getAttribute("data-hero-phase"),
        "focus",
      );
      if (label === "desktop") await snap(page, "desktop-hero-focus");
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await openRoute(page, "/about");
      await check(page, "/about", width);
      await snap(page, label + "-about");
      // A real frame during the exhibition cover, followed by its revealed page.
      if (width >= 800) {
        await page.locator('.desktop-nav a[href="/work"]').click();
        await page.waitForTimeout(130);
        await snap(page, label + "-exhibition-wipe");
        await page.waitForURL(base + "/work");
        await idle(page);
      } else await openRoute(page, "/work");
      await check(page, "/work", width);
      await snap(page, label + "-work");
      await page.locator(".work-index-art").first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(650);
      const saved = await page.evaluate(() => scrollY);
      await page.locator(".work-index-art").first().click();
      await page.waitForURL(base + "/work/sat-chi");
      await idle(page);
      await check(page, "/work/sat-chi", width);
      await page
        .getByRole("button", {
          name: "Collaborate on this project",
          exact: true,
        })
        .click();
      const contact = page.locator(".contact-dialog");
      await contact.waitFor({ state: "visible" });
      assert.match(
        await contact.getByLabel("Your message", { exact: true }).inputValue(),
        /Project: sat-chi/,
      );
      await contact
        .getByLabel("Your name", { exact: true })
        .fill("Fixture collaborator");
      await contact
        .getByRole("button", { name: "Verify fixture", exact: true })
        .click();
      let submission;
      await page.route("**/api/contact", (r) => {
        submission = r.request().postDataJSON();
        return r.fulfill({
          status: 201,
          contentType: "application/json",
          body: '{"status":"received"}',
        });
      });
      await contact
        .getByRole("button", { name: /Send private message/ })
        .click();
      await contact.getByText(/saved to my private inbox/).waitFor();
      assert.match(submission.message, /Project: sat-chi/);
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await contact.evaluate((el) => el.contains(document.activeElement)),
          "contact focus trap",
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await contact.evaluate((el) => el.open), false);
      await page.unroute("**/api/contact");
      await page.locator(".visitor-entry").waitFor();
      assert.equal(
        await page
          .locator('.community-form[data-project-id="sat-chi"]')
          .count(),
        1,
      );
      await page.goBack({ waitUntil: "domcontentloaded" });
      await page.waitForURL(base + "/work");
      await idle(page);
      const restored = await page.evaluate(() => scrollY);
      assert.ok(
        Math.abs(restored - saved) < 100,
        `Back restoration ${restored} vs ${saved}`,
      );
      await openRoute(page, "/journal");
      await check(page, "/journal", width);
      await snap(page, label + "-journal");
      await openRoute(page, "/gallery");
      await check(page, "/gallery", width);
      await snap(page, label + "-gallery");
      await page.locator(".album-preview").first().click();
      await page.waitForURL(base + "/gallery/site-studies");
      await idle(page);
      await page.getByRole("button", { name: /View Study 01/ }).click();
      const viewer = page.locator(".album-dialog");
      await viewer.waitFor({ state: "visible" });
      await snap(page, label + "-viewer");
      await page.keyboard.press("ArrowRight");
      await viewer
        .getByRole("status")
        .getByText("Study 02 / Lines around an absence")
        .waitFor();
      await page.keyboard.press("ArrowLeft");
      await viewer
        .getByRole("status")
        .getByText("Study 01 / Open volume")
        .waitFor();
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await viewer.evaluate((el) => el.contains(document.activeElement)),
          "viewer focus trap",
        );
      }
      await page.keyboard.press("Escape");
      assert.equal(await viewer.evaluate((el) => el.open), false);
      assert.match(
        await page.evaluate(() =>
          document.activeElement.getAttribute("aria-label"),
        ),
        /View Study 01/,
      );
      await openRoute(page, "/links");
      await check(page, "/links", width);
      await snap(page, label + "-links");
      await openRoute(page, "/guestbook");
      await check(page, "/guestbook", width);
      await page.locator(".visitor-entry").waitFor();
      await snap(page, label + "-guestbook-fixture");
      await page
        .getByRole("button", { name: "One last detail", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Simply Lovely", exact: true })
        .waitFor();
      await page.locator(".wordmark").click();
      await page.waitForURL(base + "/");
      await idle(page);
      await check(page, "/", width);
      assert.equal(
        await page.locator(".pin-spacer").count(),
        width >= 1100 ? 1 : 0,
      );
      await context.close();
      reports.push({
        label,
        width,
        height,
        routeSequence: true,
        alignment: true,
        backScrollRestored: Math.abs(saved - restored) < 100,
        heroPreserved: true,
        contact: "mocked verified receipt and canonical context",
        galleryViewer: true,
        errors: errors.filter((e) => e.label === label),
      });
    }
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await fixtures(page);
    page.on("pageerror", (e) =>
      errors.push({ label: "stress", message: e.message }),
    );
    await page.goto(base + "/work", { waitUntil: "domcontentloaded" });
    await idle(page);
    const before = await page.evaluate(() => ({
      heap: performance.memory?.usedJSHeapSize,
      nodes: document.getElementById("top").querySelectorAll("*").length,
    }));
    // Query routes must settle at their matching server content, not an old response.
    await page
      .getByRole("link", { name: "Physical / tangible", exact: true })
      .click();
    await page.waitForURL("**/work?category=physical");
    await idle(page);
    assert.equal(await page.locator(".work-index-entry").count(), 0);
    await page.getByRole("link", { name: "Digital", exact: true }).click();
    await page.waitForURL("**/work?category=digital");
    await idle(page);
    assert.equal(await page.locator(".work-index-entry").count(), 5);
    // Interrupted cover and cancellation back to current location.
    await page.locator('.desktop-nav a[href="/about"]').click();
    await page.waitForTimeout(40);
    await page.locator('.desktop-nav a[href="/gallery"]').click();
    await page.waitForURL(base + "/gallery");
    await idle(page);
    await page.locator('.desktop-nav a[href="/about"]').click();
    await page.waitForTimeout(40);
    await page.locator('.desktop-nav a[href="/gallery"]').click();
    await idle(page);
    assert.equal(new URL(page.url()).pathname, "/gallery");
    for (let i = 0; i < 3; i++)
      for (const href of routes) {
        await openRoute(page, href);
        await check(page, href, 1440);
      }
    await openRoute(page, "/work");
    const after = await page.evaluate(() => ({
      heap: performance.memory?.usedJSHeapSize,
      nodes: document.getElementById("top").querySelectorAll("*").length,
      longTasks: window.motionLongTasks?.slice(-20) || [],
    }));
    assert.equal(await page.locator(".route-cover").count(), 1);
    assert.equal(await page.locator(".pin-spacer").count(), 0);
    assert.equal(before.nodes, after.nodes, "DOM nodes accumulate");
    await page.reload({ waitUntil: "domcontentloaded" });
    await idle(page);
    await page.locator(".work-index-art").first().click();
    await page.waitForURL(base + "/work/sat-chi");
    await idle(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await idle(page);
    const admin = await page.request.get(base + "/api/owner/inbox");
    assert.equal(admin.status(), 401);
    await page.goto(base + "/admin", { waitUntil: "domcontentloaded" });
    await page.waitForURL("**/admin/login");
    assert.equal(
      await page.getByRole("button", { name: /Sign in/ }).count(),
      1,
    );
    reports.push({
      stress: {
        rapidNavigation: true,
        queryFilters: true,
        repeatNavigations: 18,
        nestedReload: true,
        anonymousAdminDenied: true,
        before,
        after,
      },
    });
    await page.close();
    const reduced = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await fixtures(reduced);
    await reduced.goto(base, { waitUntil: "domcontentloaded" });
    await idle(reduced);
    assert.equal(await reduced.locator(".hero-journey.is-enhanced").count(), 0);
    await openRoute(reduced, "/work");
    assert.equal(
      await reduced.locator(".route-cover").getAttribute("data-state"),
      "idle",
    );
    assert.equal(await reduced.locator(".pin-spacer").count(), 0);
    await reduced.keyboard.press("Tab");
    assert.ok(
      await reduced.evaluate(
        () => getComputedStyle(document.activeElement).outlineStyle !== "none",
      ),
    );
    await reduced.close();
    const nojs = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 360, height: 800 },
    });
    await nojs.goto(base + "/work?category=physical", {
      waitUntil: "domcontentloaded",
    });
    assert.equal(await nojs.locator(".work-index-entry").count(), 0);
    await nojs.getByRole("link", { name: "Digital", exact: true }).click();
    assert.equal(await nojs.locator(".work-index-entry").count(), 5);
    await nojs.close();
    assert.equal(errors.length, 0, JSON.stringify(errors));
    fs.writeFileSync(
      path.join(output, "room-motion-results.json"),
      JSON.stringify(
        {
          reports,
          measurements: results,
          reducedMotion: true,
          noJavaScript: true,
          errors,
        },
        null,
        2,
      ),
    );
    console.log(
      "PASS: alignment, transitions, history, interrupts, gallery, community fixtures, admin denial, reduced motion and no-JS.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
