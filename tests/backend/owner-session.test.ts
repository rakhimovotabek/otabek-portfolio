import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { performAuth } from "../../src/lib/auth/gateway";
import { createAuthHandler, cookieOptions } from "../../src/lib/auth/handlers";
import { checkOrigin } from "../../src/lib/backend/protection";
import { ownerClient } from "../../src/lib/backend/runtime";
import { ApiError } from "../../src/lib/backend/errors";
import type { Tokens } from "../../src/lib/auth/gateway";
const { startFixture, OTHER, FACTOR } = createRequire(import.meta.url)(
  "../fixtures/supabase.cjs",
);
let fixture: Awaited<ReturnType<typeof startFixture>>;
let tokens: Tokens | undefined;
const savedEnv = { ...process.env };
const origin = "http://localhost:3001";
const handler = createAuthHandler({
  cookies: {
    read: () => tokens,
    save: (value) => {
      tokens = value;
    },
    clear: () => {
      tokens = undefined;
    },
  },
  origin: checkOrigin,
  perform: performAuth,
});
const request = (body: unknown = {}, requestOrigin = origin) =>
  new Request(origin + "/api/auth/test", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: requestOrigin },
    body: JSON.stringify(body),
  });
before(async () => {
  fixture = await startFixture();
  Object.assign(process.env, {
    SUPABASE_URL: fixture.url,
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_fixture",
    SITE_ORIGIN: origin,
  });
});
after(async () => {
  process.env = savedEnv;
  await fixture.close();
});
test("owner auth rejects anonymous, invalid credentials and cross-origin requests", async () => {
  assert.equal((await handler(request(), "session")).status, 401);
  assert.equal(
    (
      await handler(
        request({ email: "owner@example.test", password: "wrong" }),
        "login",
      )
    ).status,
    401,
  );
  assert.equal(
    (await handler(request({}, "https://attacker.example"), "logout")).status,
    403,
  );
  assert.equal(
    (await handler(request({ extra: "privilege" }), "session")).status,
    400,
  );
  assert.equal((await handler(request(), "register")).status, 404);
});
test("non-owner password login is denied before MFA enrollment", async () => {
  assert.equal(
    (
      await handler(
        request({ email: "other@example.test", password: "fixture-password" }),
        "login",
      )
    ).status,
    403,
  );
  assert.equal(tokens, undefined);
  await assert.rejects(
    ownerClient(fixture.token(OTHER, "aal2")),
    (e: unknown) => e instanceof ApiError && e.status === 403,
  );
});
test("owner password login requires MFA; private reads still denied", async () => {
  const result = await handler(
    request({ email: "owner@example.test", password: "fixture-password" }),
    "login",
  );
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.equal(body.state, "mfa");
  assert.equal(body.factorId, FACTOR);
  assert.equal(JSON.stringify(body).includes("access_token"), false);
  assert.ok(tokens);
  await assert.rejects(
    ownerClient(tokens.access_token),
    (e: unknown) => e instanceof ApiError && e.status === 403,
  );
  assert.equal((await handler(request(), "enroll")).status, 409);
  assert.equal(
    (await handler(request({ factorId: FACTOR, code: "000000" }), "verify"))
      .status,
    400,
  );
  assert.equal(
    (await handler(request({ factorId: OTHER, code: "123456" }), "verify"))
      .status,
    400,
  );
});
test("MFA success authorizes owner, refresh works, logout revokes and clears", async () => {
  const result = await handler(
    request({ factorId: FACTOR, code: "123456" }),
    "verify",
  );
  assert.equal(result.status, 200);
  assert.equal((await result.json()).state, "owner");
  assert.ok(tokens);
  await ownerClient(tokens.access_token);
  assert.equal((await handler(request(), "refresh")).status, 200);
  const old = tokens!;
  const logout = await handler(request(), "logout");
  assert.equal(logout.status, 200);
  assert.equal((await logout.json()).revoked, true);
  assert.equal(tokens, undefined);
  await assert.rejects(
    ownerClient(old.access_token),
    (e: unknown) => e instanceof ApiError && e.status === 401,
  );
});
test("allowlisted first owner can enroll TOTP and must verify before access", async () => {
  fixture.reset();
  await fetch(fixture.url + "/__test/reset", {
    method: "POST",
    body: JSON.stringify({ unenrolled: true }),
  });
  assert.equal((await handler(request(), "enroll")).status, 401);
  const login = await handler(
    request({ email: "owner@example.test", password: "fixture-password" }),
    "login",
  );
  assert.equal((await login.json()).needsEnrollment, true);
  const enrollment = await handler(request(), "enroll");
  assert.equal(enrollment.status, 200);
  const body = await enrollment.json();
  assert.equal(body.factorId, FACTOR);
  assert.ok(body.qr.startsWith("<svg"));
  assert.equal(body.secret, "TESTONLYSETUPKEY");
  await assert.rejects(
    ownerClient(tokens!.access_token),
    (e: unknown) => e instanceof ApiError && e.status === 403,
  );
  assert.equal(
    (await handler(request({ factorId: FACTOR, code: "123456" }), "verify"))
      .status,
    200,
  );
});
test("cookie settings are HttpOnly, SameSite Strict and production Secure", () => {
  assert.deepEqual(cookieOptions(true), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
  assert.equal(cookieOptions(false).secure, false);
});

test("expired access refreshes safely; invalid refresh clears the browser session", async () => {
  tokens = {
    access_token: fixture.token(
      "11111111-1111-4111-8111-111111111111",
      "aal2",
      Math.floor(Date.now() / 1000) - 60,
    ),
    refresh_token: "fixture:11111111-1111-4111-8111-111111111111:aal2",
  };
  const resumed = await handler(request(), "session");
  assert.equal(resumed.status, 200);
  assert.equal((await resumed.json()).state, "owner");
  tokens = {
    access_token: fixture.token(
      "11111111-1111-4111-8111-111111111111",
      "aal2",
      Math.floor(Date.now() / 1000) - 60,
    ),
    refresh_token: "invalid-refresh",
  };
  assert.equal((await handler(request(), "session")).status, 401);
  assert.equal(tokens, undefined);
});
test("logout clears cookies and honestly reports unavailable remote revocation", async () => {
  let cleared = false;
  const failing = createAuthHandler({
    cookies: {
      read: () => ({ access_token: "fixture", refresh_token: "fixture" }),
      save: () => {},
      clear: () => {
        cleared = true;
      },
    },
    origin: checkOrigin,
    perform: async () => {
      throw new ApiError(503, "temporarily_unavailable");
    },
  });
  const response = await failing(request(), "logout");
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    state: "signed_out",
    revoked: false,
  });
  assert.equal(cleared, true);
  cleared = false;
  assert.equal(
    (await failing(request({}, "https://attacker.example"), "logout")).status,
    403,
  );
  assert.equal(cleared, false);
});

test("cookie API adapter preserves GET and streaming mutation bodies", async () => {
  const { requestWithToken } = await import("../../src/lib/auth/owner-request");
  const get = requestWithToken(
    new Request(origin + "/api/owner/inbox"),
    "fixture-owner",
  );
  assert.equal(get.method, "GET");
  assert.equal(get.headers.get("authorization"), "Bearer fixture-owner");
  const input = request({ status: "approved" });
  const patch = requestWithToken(input, "fixture-owner");
  assert.equal(patch.headers.get("origin"), origin);
  assert.deepEqual(await patch.json(), { status: "approved" });
});
test("production owner login refuses insecure or noncanonical website origins", async () => {
  const { authConfig } = await import("../../src/lib/auth/gateway");
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SITE_ORIGIN: process.env.SITE_ORIGIN,
  };
  try {
    Object.assign(process.env, {
      NODE_ENV: "production",
      SUPABASE_URL: "https://supabase.example.test",
      SITE_ORIGIN: "http://localhost:3001",
    });
    assert.throws(
      () => authConfig(),
      (e: unknown) => e instanceof ApiError && e.status === 503,
    );
    process.env.SITE_ORIGIN = "https://portfolio.example/path";
    assert.throws(() => authConfig());
    process.env.SITE_ORIGIN = "https://portfolio.example";
    assert.ok(authConfig());
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
