/* eslint-disable @typescript-eslint/no-require-imports -- External optional Playwright tooling. */
// Focused route/browser checks. Submission responses and challenge are explicit fixtures.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3003";
const output = path.resolve(
  process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/universe",
);
const results = [];
const projects = [
  "sat-chi",
  "huquq-test",
  "sme-financial-assistant",
  "telegram-media-downloader",
  "ielts-progress-tracker",
];
const challenge = `const widgets=new Map();let n=0;window.turnstile={render(el,opts){const id=String(++n);const b=document.createElement('button');b.type='button';b.textContent='Verify test fixture';b.onclick=()=>opts.callback('XXXX.DUMMY.TOKEN.XXXX');el.append(b);widgets.set(id,el);return id},remove(id){widgets.get(id)?.replaceChildren();widgets.delete(id)}};`;
const overflow = async (page) =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal overflow",
  );
const screenshot = async (page, name) =>
  page.screenshot({ path: path.join(output, name + ".png") });
async function goto(page, route) {
  const response = await page.goto(base + route, {
    waitUntil: "domcontentloaded",
  });
  assert.equal(response.status(), 200, route);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await overflow(page);
  return response;
}
async function heroSeek(page, p) {
  await page.evaluate((progress) => {
    const hero = document.querySelector("[data-hero-journey]");
    const stage = document.querySelector("[data-hero-stage]");
    window.scrollTo({
      top:
        hero.getBoundingClientRect().top +
        scrollY +
        (hero.offsetHeight - stage.offsetHeight) * progress,
      behavior: "instant",
    });
  }, p);
  await page.waitForTimeout(650);
}
async function fixtures(page) {
  await page.route("**/api/community/config", (route) =>
    route.fulfill({
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
    (route) =>
      route.fulfill({ contentType: "text/javascript", body: challenge }),
  );
  await page.route("**/api/comments?*", (route) => {
    const query = new URL(route.request().url()).searchParams;
    const target =
      query.get("target_type") === "project"
        ? { kind: "project", projectId: query.get("target_id") }
        : { kind: "guestbook" };
    return route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            displayName: "Fixture reader",
            message: "An approved browser fixture comment.",
            target,
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
    args: ["--no-sandbox"],
  });
  try {
    for (const [label, width, height] of [
      ["desktop", 1440, 900],
      ["mobile", 390, 844],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "no-preference",
        hasTouch: width < 800,
        isMobile: width < 800,
      });
      page.setDefaultTimeout(20000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await fixtures(page);
      await goto(page, "/");
      await page.locator(".hero-journey.is-enhanced").waitFor();
      await page.waitForTimeout(1000);
      assert.equal(await page.locator("[data-world]").count(), 4);
      assert.equal(await page.locator("main > section").count(), 4);
      assert.equal(await page.locator(".project").count(), 2);
      assert.equal(await page.locator("#guestbook").count(), 0);
      await screenshot(page, `${label}-home`);
      await heroSeek(page, 0.56);
      assert.equal(
        await page
          .locator("[data-hero-journey]")
          .getAttribute("data-hero-phase"),
        "focus",
      );
      assert.equal(
        await page.locator("[data-hero-worlds]").evaluate((el) => el.inert),
        true,
      );
      await screenshot(page, `${label}-hero-focus`);
      await heroSeek(page, 0.9);
      assert.equal(
        await page
          .locator("[data-hero-journey]")
          .getAttribute("data-hero-phase"),
        "transition",
      );
      const wipe = await page.locator("[data-hero-wipe]").boundingBox();
      assert.ok(wipe.y < height * 0.15 && wipe.y + wipe.height >= height);
      await heroSeek(page, 0.15);
      await heroSeek(page, 0.56);
      await page
        .locator('[data-hero-focus] a[href="/work/sat-chi"]')
        .click({ noWaitAfter: true });
      await page.waitForURL(base + "/work/sat-chi");
      await page.locator('[data-work-id="sat-chi"]').waitFor();
      await page
        .getByRole("button", {
          name: "Collaborate on this project",
          exact: true,
        })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      const message = dialog.getByLabel("Your message", { exact: true });
      await message.waitFor();
      assert.match(await message.inputValue(), /SAT’chi/);
      assert.match(await message.inputValue(), /Project: sat-chi/);
      await message.fill("A visitor's existing draft.");
      await page.keyboard.press("Escape");
      const collaborate = page
        .getByRole("button", {
          name: "Collaborate on this project",
          exact: true,
        })
        .first();
      assert.ok(
        await collaborate.evaluate((el) => el === document.activeElement),
      );
      await collaborate.click();
      await page.waitForTimeout(100);
      assert.match(await message.inputValue(), /A visitor's existing draft\./);
      assert.match(await message.inputValue(), /Project: sat-chi/);
      const complete = await message.inputValue();
      await dialog
        .getByLabel("Your name", { exact: true })
        .fill("Fixture collaborator");
      await dialog
        .getByRole("button", { name: "Verify test fixture", exact: true })
        .click();
      let payload;
      await page.route("**/api/contact", (route) => {
        payload = route.request().postDataJSON();
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: '{"status":"received"}',
        });
      });
      await dialog
        .getByRole("button", { name: /Send private message/ })
        .click();
      await dialog.getByText(/saved to my private inbox/).waitFor();
      assert.equal(payload.message, complete);
      assert.equal(payload.name, "Fixture collaborator");
      assert.equal(payload.website, "");
      await screenshot(page, `${label}-collaboration-fixture`);
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await dialog.evaluate((el) => el.contains(document.activeElement)),
        );
      }
      await page.keyboard.press("Escape");
      await page.unroute("**/api/contact");
      await page.locator(".discussion .visitor-entry").waitFor();
      assert.equal(
        await page
          .locator('.community-form[data-project-id="sat-chi"]')
          .count(),
        1,
      );
      await screenshot(page, `${label}-work-detail`);
      assert.equal(
        await page.getByText("Contribute on GitHub ↗", { exact: true }).count(),
        0,
      );
      await goto(page, "/work");
      assert.equal(await page.locator(".work-index-entry").count(), 5);
      await screenshot(page, `${label}-work`);
      await page
        .getByRole("link", { name: "Physical / tangible", exact: true })
        .click({ noWaitAfter: true });
      await page.waitForURL(/category=physical/);
      await page
        .getByText("No works in this category have been published yet.")
        .waitFor();
      assert.equal(await page.locator(".work-index-entry").count(), 0);
      await goto(page, "/work?category=creative");
      assert.equal(await page.locator(".work-index-entry").count(), 0);
      await goto(page, "/work?category=digital");
      assert.equal(await page.locator(".work-index-entry").count(), 5);
      await goto(page, "/journal");
      await page
        .getByText(
          "No personal entries published yet. This page is left open for the real thing.",
        )
        .waitFor();
      await screenshot(page, `${label}-journal`);
      assert.equal(
        (await page.request.get(base + "/journal/unpublished-entry")).status(),
        404,
      );
      await goto(page, "/gallery");
      await screenshot(page, `${label}-gallery`);
      await page
        .getByRole("link", { name: "Enter the collection ↗", exact: true })
        .click({ noWaitAfter: true });
      await page.waitForURL(base + "/gallery/site-studies");
      assert.equal(await page.locator(".album-images .media-frame").count(), 3);
      await page
        .locator(".album-images .media-frame")
        .last()
        .scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await overflow(page);
      await goto(page, "/links");
      assert.equal(await page.locator(".identity-link").count(), 1);
      assert.equal(
        await page.locator(".identity-link").getAttribute("href"),
        "https://github.com/rakhimovotabek",
      );
      await screenshot(page, `${label}-links`);
      await goto(page, "/guestbook");
      await page.locator(".visitor-entry").waitFor();
      const comment = page.locator("#guestbook .community-form");
      assert.equal(await comment.getAttribute("data-target-kind"), "guestbook");
      await comment
        .getByLabel("Display name", { exact: true })
        .fill("Fixture visitor");
      await comment
        .getByLabel("Your comment", { exact: true })
        .fill("A pending browser fixture guestbook message.");
      await comment
        .getByRole("button", { name: "Verify test fixture" })
        .click();
      await page.route("**/api/comments", (route) => {
        assert.equal(route.request().postDataJSON().target.kind, "guestbook");
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: '{"status":"pending"}',
        });
      });
      await comment.getByRole("button", { name: /Submit comment/ }).click();
      await comment
        .getByText("Your comment has been submitted and is awaiting approval.")
        .waitFor();
      assert.equal(await page.locator(".visitor-entry").count(), 1);
      await screenshot(page, `${label}-guestbook-fixture`);
      await page.unroute("**/api/comments");
      await goto(page, "/about");
      assert.equal(
        await page.locator('[data-media-id^="portrait-"]').count(),
        3,
      );
      await screenshot(page, `${label}-about`);
      if (width < 800) {
        await page.getByLabel("Toggle navigation").click();
        await page
          .locator('.mobile-menu a[href="/work"]')
          .click({ noWaitAfter: true });
      } else
        await page
          .locator('.desktop-nav a[href="/work"]')
          .click({ noWaitAfter: true });
      await page.waitForURL(base + "/work");
      assert.equal(
        await page
          .locator('.reference-navigation a[aria-current="page"]')
          .first()
          .getAttribute("href"),
        "/work",
      );
      for (const id of projects.slice(1)) {
        await goto(page, "/work/" + id);
        assert.equal(
          await page
            .locator(`.community-form[data-project-id="${id}"]`)
            .count(),
          1,
        );
      }
      assert.equal(
        (await page.request.get(base + "/work/no-such-project")).status(),
        404,
      );
      assert.equal(
        (await page.request.get(base + "/gallery/no-such-album")).status(),
        404,
      );
      assert.equal(
        (await page.request.get(base + "/api/owner/inbox")).status(),
        401,
      );
      await page.goto(base + "/admin", { waitUntil: "domcontentloaded" });
      assert.ok(page.url().endsWith("/admin/login"));
      await page.getByLabel("Owner email", { exact: true }).waitFor();
      await goto(page, "/");
      await page.locator(".hero-journey.is-enhanced").waitFor();
      if (width > 1100) {
        await page.locator(".is-cinematic").waitFor();
        assert.equal(await page.locator(".pin-spacer").count(), 1);
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(300);
      assert.equal(await page.locator(".hero-journey.is-enhanced").count(), 0);
      assert.equal(await page.locator(".pin-spacer").count(), 0);
      assert.equal(
        await page.locator("[data-hero-worlds]").evaluate((el) => el.inert),
        false,
      );
      await overflow(page);
      assert.deepEqual(errors, []);
      results.push({
        label,
        width,
        height,
        homepageScenes: 5,
        heroForwardReverse: true,
        diagonalTransition: true,
        selectedWork: 2,
        workRoutes: 5,
        categoryNavigation: true,
        collaboration:
          "editable context, draft preservation, exact submission payload, native modal focus passed using mocked responses",
        journal: "honest empty state; unpublished slug 404",
        gallery: "three original site studies; no fake personal assets",
        links: "one verified public identity",
        guestbook: "pending acknowledgement and approved fixture display",
        admin: "anonymous API denial and login redirect",
        reducedMotion: true,
        overflow: false,
        errors,
      });
      await page.close();
      console.log("PASS", label);
    }
    for (const [label, width, height] of [
      ["laptop", 1366, 900],
      ["narrow-mobile", 360, 800],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      for (const route of [
        "/",
        "/work/sat-chi",
        "/journal",
        "/gallery",
        "/links",
        "/guestbook",
      ]) {
        await goto(page, route);
      }
      await screenshot(page, `${label}-guestbook`);
      results.push({
        label,
        width,
        height,
        reducedMotionRouteSpotChecks: true,
        overflow: false,
      });
      await page.close();
    }
    const noJS = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    await goto(noJS, "/work?category=physical");
    assert.equal(await noJS.locator(".work-index-entry").count(), 0);
    await noJS
      .getByRole("link", { name: "Digital", exact: true })
      .click({ noWaitAfter: true });
    await noJS.waitForURL(/category=digital/);
    assert.equal(await noJS.locator(".work-index-entry").count(), 5);
    await noJS.close();
    results.push({
      noJavaScript:
        "server-rendered category navigation and all digital entries passed",
    });
    fs.writeFileSync(
      path.join(output, "universe-browser-results.json"),
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
