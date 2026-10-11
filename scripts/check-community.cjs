/* eslint-disable @typescript-eslint/no-require-imports -- Optional external Playwright tooling. */
// Browser integration against the isolated mock Supabase gateway on 3102.
// Real Next routes, Auth SDK and HttpOnly cookies; no hosted-DB claims.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const url = process.env.PORTFOLIO_URL || "http://localhost:3002";
const fixture = process.env.SUPABASE_FIXTURE_URL || "http://127.0.0.1:3102";
const output = path.resolve(
  process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/phase4b",
);
const results = [];
const ids = [
  "sat-chi",
  "huquq-test",
  "sme-financial-assistant",
  "telegram-media-downloader",
  "ielts-progress-tracker",
];
const challengeScript = `window.__challenges=new Map();let n=0;window.turnstile={render(el,options){const id=String(++n);const button=document.createElement('button');button.type='button';button.textContent='Verify — test fixture';button.onclick=()=>options.callback('XXXX.DUMMY.TOKEN.XXXX');el.append(button);window.__challenges.set(id,{options,el});return id;},remove(id){const item=window.__challenges.get(id);if(item)item.el.replaceChildren();window.__challenges.delete(id);}};`;
const overflow = async (page) =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
    "Horizontal overflow",
  );
const screenshot = async (page, name) =>
  page.screenshot({
    path: path.join(output, name + ".png"),
    style: ".nextjs-toast-errors-parent,[data-nextjs-toast]{display:none}",
  });
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    for (const [label, width, height] of [
      ["desktop", 1440, 1000],
      ["laptop", 1366, 900],
      ["mobile", 390, 844],
      ["narrow-mobile", 360, 800],
    ]) {
      if (
        process.env.PORTFOLIO_QA_VIEWS &&
        !process.env.PORTFOLIO_QA_VIEWS.split(",").includes(label)
      )
        continue;
      await fetch(fixture + "/__test/reset", { method: "POST", body: "{}" });
      const page = await browser.newPage({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route(
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
        (route) =>
          route.fulfill({
            contentType: "text/javascript",
            body: challengeScript,
          }),
      );
      await page.goto(url, { waitUntil: "networkidle" });
      await overflow(page);
      // Anonymous access is refused by actual Next endpoints and server-rendered page.
      assert.equal(
        (await page.request.get(url + "/api/owner/inbox")).status(),
        401,
      );
      await page
        .getByRole("button", { name: "Message me", exact: true })
        .click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await dialog
        .getByLabel("Your name", { exact: true })
        .fill("UI fixture visitor");
      await dialog.getByLabel("Your message", { exact: true }).fill("short");
      await dialog
        .getByRole("button", { name: "Verify — test fixture" })
        .click();
      await dialog
        .getByRole("button", { name: /Send private message/ })
        .click();
      assert.ok(
        await dialog
          .getByText("Please check the highlighted fields.")
          .isVisible(),
      );
      await dialog
        .getByLabel("Your message", { exact: true })
        .fill("A complete message submitted by the browser fixture.");
      // Failure must preserve the draft and never display a success.
      await page.route("**/api/contact", (route) =>
        route.fulfill({
          status: 429,
          contentType: "application/json",
          body: '{"error":"too_many_attempts"}',
        }),
      );
      await dialog
        .getByRole("button", { name: /Send private message/ })
        .click();
      await dialog.getByText(/Too many attempts/).waitFor();
      assert.equal(
        await dialog.getByLabel("Your message", { exact: true }).inputValue(),
        "A complete message submitted by the browser fixture.",
      );
      await page.unroute("**/api/contact");
      await dialog
        .getByRole("button", { name: "Verify — test fixture" })
        .click();
      // Server-only dummy Siteverify network call, then persistence in the mock gateway.
      await dialog
        .getByRole("button", { name: /Send private message/ })
        .click();
      await dialog
        .getByText(/saved to my private inbox/)
        .waitFor({ timeout: 20000 });
      await dialog
        .getByLabel("Your message", { exact: true })
        .fill("A draft preserved when the panel closes.");
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
        assert.ok(
          await page.evaluate(() =>
            document.querySelector("dialog").contains(document.activeElement),
          ),
          "Dialog focus escaped",
        );
      }
      await screenshot(page, label + "-contact-fixture");
      await overflow(page);
      await page.keyboard.press("Escape");
      assert.equal(await dialog.count(), 0);
      assert.ok(
        await page
          .getByRole("button", { name: "Message me", exact: true })
          .evaluate((el) => el === document.activeElement),
      );
      await page
        .getByRole("button", { name: "Message me", exact: true })
        .click();
      assert.equal(
        await dialog.getByLabel("Your message", { exact: true }).inputValue(),
        "A draft preserved when the panel closes.",
      );
      await page.keyboard.press("Escape");
      // Each project gets a stable target; expanded notes retain natural flow.
      for (const id of ids) {
        await page.locator(`#${id} summary`).click();
        assert.equal(
          await page
            .locator(`#${id} [data-project-id]`)
            .getAttribute("data-project-id"),
          id,
        );
        await page.locator(`#${id} summary`).click();
      }
      await page.locator("#sat-chi summary").click();
      const notes = page.locator("#sat-chi .discussion");
      await notes
        .getByLabel("Display name", { exact: true })
        .fill("Project fixture visitor");
      await notes
        .getByLabel("Your comment", { exact: true })
        .fill("A browser fixture project comment.");
      await notes
        .getByRole("button", { name: "Verify — test fixture" })
        .click();
      await notes.getByRole("button", { name: /Submit comment/ }).click();
      await notes
        .getByText("Your comment has been submitted and is awaiting approval.")
        .waitFor({ timeout: 20000 });
      assert.equal(
        await notes
          .getByText("A browser fixture project comment.", { exact: true })
          .count(),
        0,
      );
      const guestbook = page.locator("#guestbook");
      await guestbook
        .getByRole("button", { name: "Load more comments ↓", exact: true })
        .click();
      await guestbook.locator(".visitor-entry").nth(5).waitFor();
      await guestbook
        .getByLabel("Display name", { exact: true })
        .fill("Guestbook fixture visitor");
      await guestbook
        .getByLabel("Your comment", { exact: true })
        .fill("A browser fixture guestbook comment.");
      await guestbook
        .getByRole("button", { name: "Verify — test fixture" })
        .click();
      await guestbook.getByRole("button", { name: /Submit comment/ }).click();
      await guestbook
        .getByText("Your comment has been submitted and is awaiting approval.")
        .waitFor({ timeout: 20000 });
      await guestbook.scrollIntoViewIfNeeded();
      await screenshot(page, label + "-guestbook-fixture");
      await overflow(page);
      // Owner password login cannot expose private data until MFA has completed.
      await page.goto(url + "/admin", { timeout: 90000 });
      assert.ok(page.url().endsWith("/admin/login"));
      await page
        .getByLabel("Owner email", { exact: true })
        .fill("other@example.test");
      await page
        .getByLabel("Password", { exact: true })
        .fill("fixture-password");
      await page
        .getByRole("button", { name: "Sign in →", exact: true })
        .click();
      await page.getByText(/Access was not authorized/).waitFor();
      await page
        .getByLabel("Owner email", { exact: true })
        .fill("owner@example.test");
      await page
        .getByRole("button", { name: "Sign in →", exact: true })
        .click();
      await page.getByLabel("Six-digit authenticator code").waitFor();
      assert.equal(
        (await page.request.get(url + "/api/owner/inbox")).status(),
        403,
      );
      await page.getByLabel("Six-digit authenticator code").fill("000000");
      await page.getByRole("button", { name: "Unlock archive →" }).click();
      await page.getByText(/Verification expired/).waitFor();
      await page.getByLabel("Six-digit authenticator code").fill("123456");
      await page.getByRole("button", { name: "Unlock archive →" }).click();
      await page.waitForURL(url + "/admin");
      await page
        .getByRole("heading", { name: "Recent moderation", exact: true })
        .waitFor();
      await screenshot(page, label + "-admin-fixture");
      await overflow(page);
      const cookies = await page.context().cookies();
      assert.equal(
        cookies.filter((c) => c.name.startsWith("portfolio-")).length,
        2,
      );
      assert.ok(
        cookies
          .filter((c) => c.name.startsWith("portfolio-"))
          .every((c) => c.httpOnly && c.sameSite === "Strict"),
      );
      assert.equal(
        await page.evaluate(() => document.cookie.includes("portfolio-")),
        false,
      );
      assert.equal(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
        0,
      );
      await page.getByRole("button", { name: "Inbox", exact: true }).click();
      await page
        .getByRole("heading", { name: "Fixture visitor", exact: true })
        .waitFor();
      await page
        .locator(".owner-entry")
        .filter({
          has: page.getByRole("heading", {
            name: "Fixture visitor",
            exact: true,
          }),
        })
        .getByRole("button", { name: "Mark read", exact: true })
        .click();
      await page.getByText("Message marked read.", { exact: true }).waitFor();
      await page.getByLabel("Message status").selectOption("read");
      await page
        .getByRole("heading", { name: "Fixture visitor", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Mark archived", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Confirm archived", exact: true })
        .click();
      await page
        .getByText("Message marked archived.", { exact: true })
        .waitFor();
      await page.getByRole("button", { name: "Comments", exact: true }).click();
      await page
        .getByRole("heading", { name: "Fixture reader 1", exact: true })
        .waitFor();
      assert.equal(await page.locator(".owner-entry-content img").count(), 0);
      assert.equal(await page.evaluate(() => Boolean(window.injected)), false);
      await page
        .getByRole("button", { name: "Approve", exact: true })
        .first()
        .click();
      await page
        .getByRole("button", { name: "Confirm approved", exact: true })
        .click();
      await page.getByText("Comment approved.", { exact: true }).waitFor();
      await page.getByLabel("Moderation status").selectOption("approved");
      await page
        .getByRole("heading", { name: "Fixture reader 1", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Reject", exact: true })
        .first()
        .click();
      await page
        .getByRole("button", { name: "Confirm rejected", exact: true })
        .click();
      await page.getByText("Comment rejected.", { exact: true }).waitFor();
      // Public API after moderation exposes approved only; rejected fixture stays private.
      const publicPage = await (
        await page.request.get(
          url + "/api/comments?target_type=guestbook&limit=2",
        )
      ).json();
      assert.ok(
        publicPage.items.every(
          (row) => !("status" in row) && row.displayName !== "Fixture reader 1",
        ),
      );
      assert.ok(publicPage.nextCursor);
      const nextPage = await (
        await page.request.get(
          url +
            "/api/comments?target_type=guestbook&limit=2&cursor=" +
            encodeURIComponent(publicPage.nextCursor),
        )
      ).json();
      assert.ok(
        nextPage.items.every(
          (row) => !publicPage.items.some((previous) => previous.id === row.id),
        ),
      );
      await page
        .getByRole("button", { name: "Sign out ↗", exact: true })
        .click();
      await page.waitForURL(url + "/admin/login");
      assert.equal(
        (await page.context().cookies()).filter((c) =>
          c.name.startsWith("portfolio-"),
        ).length,
        0,
      );
      assert.equal(
        (await page.request.get(url + "/api/owner/overview")).status(),
        401,
      );
      await overflow(page);
      assert.deepEqual(errors, []);
      results.push({
        label,
        width,
        height,
        visitor:
          "validation, quota error, private save, draft restore, per-project target, pending comments and guestbook passed",
        owner:
          "non-owner denial, MFA gate, verification, inbox, moderation, pagination, HttpOnly cookies and logout passed",
        reducedMotion: true,
        overflow: false,
        errors,
      });
      await page.close();
      console.log("PASS", label);
    }
    // Protected first-time enrollment, plus CAPTCHA expiry and network error recovery.
    await fetch(fixture + "/__test/reset", {
      method: "POST",
      body: '{"unenrolled":true}',
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await page.goto(url + "/admin/login", { timeout: 90000 });
    await page
      .getByLabel("Owner email", { exact: true })
      .fill("owner@example.test");
    await page.getByLabel("Password", { exact: true }).fill("fixture-password");
    await page.getByRole("button", { name: "Sign in →" }).click();
    await page.getByRole("button", { name: "Set up authenticator →" }).click();
    await page.getByAltText("Authenticator enrollment QR code").waitFor();
    assert.ok(
      await page
        .getByAltText("Authenticator enrollment QR code")
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    );
    await screenshot(page, "mobile-enrollment-fixture");
    await page.getByLabel("Six-digit authenticator code").fill("123456");
    await page.getByRole("button", { name: "Unlock archive →" }).click();
    await page.waitForURL(url + "/admin");
    await page
      .getByRole("heading", { name: "Recent moderation", exact: true })
      .waitFor();
    const ownerCookies = await page.context().cookies();
    const accessCookie = ownerCookies.find(
      (cookie) => cookie.name === "portfolio-access",
    );
    const refreshCookie = ownerCookies.find(
      (cookie) => cookie.name === "portfolio-refresh",
    );
    const expiredToken = [
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url",
      ),
      Buffer.from(
        JSON.stringify({
          sub: "11111111-1111-4111-8111-111111111111",
          aal: "aal2",
          role: "authenticated",
          exp: Math.floor(Date.now() / 1000) - 60,
        }),
      ).toString("base64url"),
      Buffer.from("fixture-signature").toString("base64url"),
    ].join(".");
    let refreshRequests = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/auth/refresh")
        refreshRequests++;
    });
    await page.context().addCookies([{ ...accessCookie, value: expiredToken }]);
    await page.getByRole("button", { name: "Inbox", exact: true }).click();
    await page
      .getByRole("heading", { name: "Fixture visitor", exact: true })
      .waitFor();
    assert.equal(refreshRequests, 1);
    await page.context().addCookies([
      { ...accessCookie, value: expiredToken },
      { ...refreshCookie, value: "invalid-refresh" },
    ]);
    await page.getByRole("button", { name: "Overview", exact: true }).click();
    await page.waitForURL(url + "/admin/login");
    await page.getByLabel("Owner email", { exact: true }).waitFor();
    assert.equal(
      (await page.request.get(url + "/api/owner/overview")).status(),
      401,
    );
    await page.close();
    results.push({
      expiration:
        "expired access refreshed once; invalid refresh returned to login and removed private access",
    });
    results.push({
      enrollment: "protected TOTP setup and QR rendering passed",
    });

    const recovery = await browser.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    await recovery.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: challengeScript,
        }),
    );
    await recovery.goto(url, { waitUntil: "networkidle" });
    await recovery
      .getByRole("button", { name: "Message me", exact: true })
      .click();
    const dialog = recovery.getByRole("dialog");
    const send = dialog.getByRole("button", { name: /Send private message/ });
    assert.ok(await send.isDisabled());
    await dialog
      .getByLabel("Your name", { exact: true })
      .fill("Recovery fixture");
    await dialog
      .getByLabel("Your message", { exact: true })
      .fill("A draft retained through verification and connection failures.");
    assert.equal(
      await dialog
        .getByLabel("Your message", { exact: true })
        .getAttribute("maxlength"),
      "4000",
    );
    await dialog.getByRole("button", { name: "Verify — test fixture" }).click();
    await recovery.evaluate(() => {
      for (const entry of window.__challenges.values())
        if (entry.options.action === "contact")
          entry.options["expired-callback"]();
    });
    assert.ok(await send.isDisabled());
    await dialog.getByRole("button", { name: "Retry verification" }).click();
    await dialog.getByRole("button", { name: "Verify — test fixture" }).click();
    await recovery.route("**/api/contact", (route) => route.abort("failed"));
    await send.click();
    await dialog.getByText(/couldn’t confirm delivery/).waitFor();
    assert.ok(
      (
        await dialog.getByLabel("Your message", { exact: true }).inputValue()
      ).startsWith("A draft retained"),
    );
    await recovery.unroute("**/api/contact");
    await recovery.route("**/api/contact", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"status":"received"}',
      }),
    );
    await dialog.getByRole("button", { name: "Verify — test fixture" }).click();
    await send.click();
    await dialog.getByText(/unavailable right now/).waitFor();
    assert.equal(
      await dialog.getByText(/saved to my private inbox/).count(),
      0,
    );
    await recovery.unroute("**/api/contact");
    let submissions = 0;
    await recovery.route("**/api/contact", async (route) => {
      submissions++;
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: '{"status":"received"}',
      });
    });
    await dialog.getByRole("button", { name: "Verify — test fixture" }).click();
    await dialog.locator("form").evaluate((form) => {
      form.requestSubmit();
      form.requestSubmit();
    });
    await dialog.getByText(/saved to my private inbox/).waitFor();
    assert.equal(submissions, 1);
    await recovery.keyboard.press("Escape");
    await recovery.close();
    results.push({
      recovery:
        "CAPTCHA expiry/retry, network draft retention, unexpected acknowledgement rejection and duplicate prevention passed (explicitly mocked responses)",
    });

    // Interaction with the existing pinned exhibition: no scroll displacement.
    await fetch(fixture + "/__test/reset", { method: "POST", body: "{}" });
    const cinematic = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
    });
    await cinematic.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      (route) =>
        route.fulfill({
          contentType: "text/javascript",
          body: challengeScript,
        }),
    );
    await cinematic.goto(url, { waitUntil: "networkidle" });
    await cinematic.locator(".is-cinematic").waitFor();
    await cinematic.waitForTimeout(2200);
    await cinematic.locator(".pin-spacer").evaluate((el) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY + 800,
        behavior: "instant",
      }),
    );
    await cinematic.waitForTimeout(700);
    const y = await cinematic.evaluate(() => scrollY);
    await cinematic
      .getByRole("button", { name: "Message me", exact: true })
      .click();
    assert.equal(await cinematic.evaluate(() => scrollY), y);
    assert.equal(await cinematic.locator(".pin-spacer").count(), 1);
    await cinematic.keyboard.press("Escape");
    assert.equal(await cinematic.evaluate(() => scrollY), y);
    assert.equal(await cinematic.locator(".pin-spacer").count(), 1);
    await cinematic.locator('.project[aria-hidden="false"] summary').click();
    await cinematic.waitForTimeout(400);
    assert.equal(await cinematic.locator(".pin-spacer").count(), 0);
    assert.equal(await cinematic.locator(".project[inert]").count(), 0);
    await overflow(cinematic);
    await cinematic.close();
    results.push({
      cinematic:
        "dialog opened/closed while pinned without scroll displacement; expanded comments restored the reading layout",
    });
    fs.writeFileSync(
      path.join(output, "community-browser-results.json"),
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
