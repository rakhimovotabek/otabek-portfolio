/* eslint-disable @typescript-eslint/no-require-imports -- Optional external browser QA. */
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3005";
const out = path.resolve("docs/preview/signature/details");
const report = {
  secondary: [],
  community: [],
  actualAvailability: null,
  errors: [],
};
const fixture = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "Fixture reader",
  message: "A browser test impression, not a real visitor submission.",
  target: { kind: "guestbook" },
  createdAt: "2026-10-11T10:00:00.000Z",
};
const challenge = `window.turnstile={render(el,o){const b=document.createElement('button');b.type='button';b.textContent='Verify fixture';b.onclick=()=>o.callback('XXXX.DUMMY.TOKEN.XXXX');el.append(b);return 'fixture'},remove(){}};`;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => report.errors.push(e.message));
    const actual = await (
      await page.request.get(base + "/api/community/config")
    ).json();
    report.actualAvailability = {
      reads: actual.reads,
      submissions: actual.submissions,
      challengeConfigured: !!actual.siteKey,
    };
    await page.route("**/api/community/config", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"reads":true,"submissions":true,"siteKey":"1x00000000000000000000AA"}',
      }),
    );
    await page.route(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
      (r) => r.fulfill({ contentType: "text/javascript", body: challenge }),
    );
    let readMode = "approved",
      hits = 0,
      post;
    await page.route("**/api/comments?*", (r) => {
      hits++;
      if (readMode === "offline") return r.abort();
      return r.fulfill({
        status: readMode === "server" ? 500 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          readMode === "server"
            ? { error: "temporarily_unavailable" }
            : readMode === "malformed"
              ? { unknown: true }
              : {
                  items: readMode === "empty" ? [] : [fixture],
                  nextCursor: null,
                },
        ),
      });
    });
    for (const route of ["journal", "links", "guestbook"]) {
      await page.goto(base + "/" + route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1200);
      if (route === "guestbook") await page.locator(".visitor-entry").waitFor();
      await page.screenshot({ path: `${out}/${route}-top.png` });
      await page.evaluate(() => scrollTo({ top: 500, behavior: "instant" }));
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/${route}-scene.png` });
      if (route === "journal") {
        const folio = page.locator(".journal-folio");
        await folio.locator("summary").focus();
        await page.keyboard.press("Enter");
        assert.equal(await folio.evaluate((el) => el.open), false);
        await page.screenshot({ path: `${out}/journal-folded.png` });
        await page.keyboard.press("Space");
        assert.equal(await folio.evaluate((el) => el.open), true);
        assert.match(
          await folio.innerText(),
          /No personal entries published yet/,
        );
      }
      if (route === "links") {
        await page.getByText("Profile address", { exact: false }).click();
        await page.getByRole("button", { name: "Copy address" }).click();
        await page.getByRole("button", { name: /Copied/ }).waitFor();
        assert.equal(
          await page.evaluate(() => navigator.clipboard.readText()),
          "https://github.com/rakhimovotabek",
        );
        assert.equal(
          await page.locator(".identity-link").getAttribute("href"),
          "https://github.com/rakhimovotabek",
        );
        await page.screenshot({ path: `${out}/links-address.png` });
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      report.secondary.push({
        route,
        keyboardFolio: route === "journal",
        actualClipboard: route === "links",
        approvedFixture: route === "guestbook",
        overflow: false,
      });
    }
    await page.route("**/api/comments", (r) => {
      post = r.request().postDataJSON();
      return r.fulfill({
        status: 201,
        contentType: "application/json",
        body: '{"status":"pending"}',
      });
    });
    await page
      .getByLabel("Display name", { exact: true })
      .fill("Fixture visitor");
    await page
      .getByLabel("Your comment", { exact: true })
      .fill(
        "A fixture submission for moderation, never sent to the live database.",
      );
    await page
      .getByRole("button", { name: "Verify fixture", exact: true })
      .click();
    await page.getByRole("button", { name: /Submit comment/ }).click();
    await page.getByText(/awaiting approval/).waitFor();
    assert.equal(post.target.kind, "guestbook");
    assert.equal(
      await page.locator(".visitor-entry").count(),
      1,
      "Pending comment is not shown as approved",
    );
    report.community.push({
      moderation: "201 fixture pending; no optimistic approved entry",
      canonicalTarget: post.target,
    });
    for (const mode of ["server", "malformed", "offline", "empty"]) {
      readMode = mode;
      const before = hits;
      await page.reload({ waitUntil: "domcontentloaded" });
      if (mode === "empty")
        await page.getByText(/The first page is still unwritten/).waitFor();
      else {
        const retry = page.getByRole("button", {
          name: "Retry loading comments",
        });
        await retry.waitFor();
        await page.screenshot({ path: `${out}/guestbook-${mode}.png` });
        readMode = "approved";
        await retry.click();
        await page.locator(".visitor-entry").waitFor();
      }
      assert.ok(hits > before, mode + " injection matched");
      report.community.push({
        mode,
        requests: hits - before,
        retryRecovered: mode !== "empty",
      });
    }
    readMode = "approved";
    await page.setViewportSize({ width: 320, height: 800 });
    for (const route of ["journal", "links", "guestbook"]) {
      await page.goto(base + "/" + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(800);
      if (route === "links")
        await page.getByText("Profile address", { exact: false }).click();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      await page.screenshot({ path: `${out}/${route}-320.png` });
    }
    assert.equal(
      (await page.request.get(base + "/api/owner/inbox")).status(),
      401,
    );
    await page.goto(base + "/admin/login", { waitUntil: "domcontentloaded" });
    assert.equal(
      await page.getByRole("button", { name: /Sign in/ }).count(),
      1,
    );
    await context.close();
    assert.deepEqual(report.errors, []);
    console.log(
      "PASS: folding folio, real clipboard copy, moderated comment fixture, failure/empty/retry states, 320px layout and anonymous admin denial.",
    );
  } finally {
    await browser.close();
    fs.writeFileSync(
      out + "/details-results.json",
      JSON.stringify(report, null, 2),
    );
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
