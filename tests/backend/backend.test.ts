import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import {
  databaseHandlers,
  localEnv,
  config,
  ORIGIN,
  OWNER,
  OTHER,
  request,
  roleQuery,
  setupDatabase,
} from "./fixture";
import {
  publicConfig,
  submissionConfig,
  TEST_TURNSTILE_SECRETS,
} from "../../src/lib/backend/config";
import {
  checkOrigin,
  subjectHash,
  verifyTurnstile,
} from "../../src/lib/backend/protection";
import { authorizeOwner } from "../../src/lib/backend/auth";
import { MAX_BODY_BYTES } from "../../src/lib/backend/http";
import {
  databaseClient,
  publicRepository,
  submissionRepository,
  ownerRepository,
} from "../../src/lib/backend/repository";

let db: PGlite;
let app: ReturnType<typeof databaseHandlers>;
const contact = {
  name: "Visitor",
  replyContact: "reply@example.test",
  message: "A thoughtful message.",
  turnstileToken: "dummy-token",
};
const comment = {
  displayName: "Visitor",
  message: "Thoughtful feedback",
  target: { kind: "guestbook" },
  turnstileToken: "dummy-token",
};
before(async () => {
  db = await setupDatabase();
  app = databaseHandlers(db);
});
after(async () => {
  await db?.close();
});

// These tests run serially, against the actual version-controlled SQL migration.
test("contact: valid submission persists privately with unread default", async () => {
  await app.resetLimits();
  const response = await app.handlers.submitContact(
    request("/api/contact", contact),
  );
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { status: "received" });
  const row = (
    await db.query<{ status: string; name: string; reply_contact: string }>(
      "select * from public.contact_messages",
    )
  ).rows[0];
  assert.equal(row.status, "unread");
  assert.equal(row.name, "Visitor");
  assert.equal(row.reply_contact, "reply@example.test");
});

test("contact: empty, short, overlong, honeypot and privileged fields rejected", async () => {
  const invalid = [
    { name: "" },
    { name: " " },
    { message: "" },
    { message: "short" },
    { name: "x".repeat(81) },
    { message: "x".repeat(4001) },
    { replyContact: "x".repeat(255) },
    { website: "bot-site" },
    { status: "read" },
    { id: OWNER },
    { turnstileToken: undefined },
    { turnstileToken: "" },
  ];
  for (const fields of invalid)
    assert.equal(
      (
        await app.handlers.submitContact(
          request("/api/contact", { ...contact, ...fields }),
        )
      ).status,
      400,
    );
  assert.equal(
    (await db.query("select * from public.contact_messages")).rows.length,
    1,
  );
});

test("HTTP body byte cap, invalid JSON/UTF-8 and media type enforced", async () => {
  const base = {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN },
  };
  assert.equal(
    (
      await app.handlers.submitContact(
        new Request(`${ORIGIN}/api/contact`, {
          ...base,
          body: "x".repeat(MAX_BODY_BYTES + 1),
        }),
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await app.handlers.submitContact(
        new Request(`${ORIGIN}/api/contact`, {
          ...base,
          headers: {
            ...base.headers,
            "Content-Length": String(MAX_BODY_BYTES + 1),
          },
          body: "{}",
        }),
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await app.handlers.submitContact(
        new Request(`${ORIGIN}/api/contact`, { ...base, body: "{broken" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.handlers.submitContact(
        new Request(`${ORIGIN}/api/contact`, {
          ...base,
          body: new Uint8Array([0xff]),
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.handlers.submitContact(
        new Request(`${ORIGIN}/api/contact`, {
          method: "POST",
          body: JSON.stringify(contact),
        }),
      )
    ).status,
    415,
  );
});

test("CAPTCHA failure prevents inserts and consumes persistent quota", async () => {
  await app.resetLimits();
  app.setCaptcha(false);
  assert.equal(
    (await app.handlers.submitContact(request("/api/contact", contact))).status,
    400,
  );
  assert.equal(
    (await db.query("select * from public.contact_messages")).rows.length,
    1,
  );
  assert.equal(
    (await db.query("select * from private.submission_limits")).rows.length,
    3,
  );
  app.setCaptcha(true);
});

test("Turnstile real mode validates hostname/action, rejects replay failure and fails closed on outage", async () => {
  const real = { ...config, mode: "real" as const };
  const fake =
    (payload: unknown, status = 200): typeof fetch =>
    async () =>
      new Response(JSON.stringify(payload), { status });
  await verifyTurnstile(
    "token",
    "contact",
    real,
    fake({ success: true, hostname: "localhost", action: "contact" }),
  );
  for (const payload of [
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { success: true },
    { success: true, hostname: "attacker.test", action: "contact" },
    { success: true, hostname: "localhost", action: "comment" },
  ]) {
    await assert.rejects(
      verifyTurnstile("token", "contact", real, fake(payload)),
      { status: 400 },
    );
  }
  await assert.rejects(
    verifyTurnstile("token", "contact", real, fake({}, 500)),
    { status: 503 },
  );
  await assert.rejects(
    verifyTurnstile("token", "contact", real, fake("invalid-shape")),
    { status: 503 },
  );
  await assert.rejects(
    verifyTurnstile("token", "contact", real, async () => {
      throw new Error("network secret");
    }),
    { status: 503 },
  );
});

test("rate limit is shared by contacts/comments and enforced by the database", async () => {
  await app.resetLimits();
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await app.handlers.submitComment(request("/api/comments", comment)))
        .status,
      201,
    );
  const denied = await app.handlers.submitContact(
    request("/api/contact", contact),
  );
  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get("Retry-After"), "3600");
  const hashes = (
    await db.query<{ bucket_key: string }>(
      "select bucket_key from private.submission_limits",
    )
  ).rows;
  assert.ok(hashes.every((row) => !row.bucket_key.includes("127.0.0.1")));
  await db.exec(
    "update private.submission_limits set expires_at = now() - interval '1 second'",
  );
  assert.equal(
    (await app.handlers.submitComment(request("/api/comments", comment)))
      .status,
    201,
  );
  await db.exec(
    "update private.submission_limits set expires_at = now() - interval '1 second'",
  );
  await roleQuery(
    db,
    "service_role",
    "select public.purge_submission_limits()",
  );
  assert.equal(
    (await db.query("select * from private.submission_limits")).rows.length,
    0,
  );
});

test("daily and global quotas cannot be bypassed by resetting a process", async () => {
  await app.resetLimits();
  const hash = "a".repeat(64);
  for (let hour = 0; hour < 4; hour++) {
    for (let i = 0; i < 5; i++)
      assert.equal(
        (
          await roleQuery<{ ok: boolean }>(
            db,
            "service_role",
            "select public.consume_submission_limit($1) as ok",
            [hash],
          )
        )[0].ok,
        true,
      );
    await db.exec(
      "delete from private.submission_limits where bucket_key like '%hour%'",
    );
  }
  assert.equal(
    (
      await roleQuery<{ ok: boolean }>(
        db,
        "service_role",
        "select public.consume_submission_limit($1) as ok",
        [hash],
      )
    )[0].ok,
    false,
  );
  await app.resetLimits();
  for (let i = 0; i < 200; i++)
    assert.equal(
      (
        await roleQuery<{ ok: boolean }>(
          db,
          "service_role",
          "select public.consume_submission_limit($1) as ok",
          [i.toString(16).padStart(64, "0")],
        )
      )[0].ok,
      true,
    );
  assert.equal(
    (
      await roleQuery<{ ok: boolean }>(
        db,
        "service_role",
        "select public.consume_submission_limit($1) as ok",
        ["b".repeat(64)],
      )
    )[0].ok,
    false,
  );
});

test("comments default to pending for valid guestbook and project targets", async () => {
  await app.resetLimits();
  for (const target of [
    { kind: "guestbook" },
    { kind: "project", projectId: "sat-chi" },
  ]) {
    const response = await app.handlers.submitComment(
      request("/api/comments", { ...comment, target }),
    );
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { status: "pending" });
  }
  for (const patch of [
    { target: { kind: "project", projectId: "invented" } },
    { status: "approved" },
    { message: "" },
    { displayName: "" },
    { message: "x".repeat(2001) },
    { target: { kind: "guestbook", projectId: "sat-chi" } },
    { website: "spam" },
  ])
    assert.equal(
      (
        await app.handlers.submitComment(
          request("/api/comments", { ...comment, ...patch }),
        )
      ).status,
      400,
    );
  const rows = (
    await db.query<{ status: string }>("select status from public.comments")
  ).rows;
  assert.ok(rows.length > 0 && rows.every((row) => row.status === "pending"));
  const publicResponse = await app.handlers.approvedComments(
    request("/api/comments?target_type=guestbook"),
  );
  assert.deepEqual(await publicResponse.json(), {
    items: [],
    nextCursor: null,
  });
});

test("private endpoints reject anonymous, invalid, non-owner, and non-MFA identities", async () => {
  for (const token of [undefined, "invalid", "nonowner", "owner-aal1"]) {
    const expected = token === "nonowner" || token === "owner-aal1" ? 403 : 401;
    assert.equal(
      (await app.handlers.inbox(request("/api/owner/inbox", undefined, token)))
        .status,
      expected,
    );
    assert.equal(
      (
        await app.handlers.pendingComments(
          request("/api/owner/comments", undefined, token),
        )
      ).status,
      expected,
    );
    assert.equal(
      (
        await app.handlers.moderateComment(
          request(
            "/api/owner/comments/x",
            { status: "approved" },
            token,
            "PATCH",
          ),
          OWNER,
        )
      ).status,
      expected,
    );
    assert.equal(
      (
        await app.handlers.updateMessage(
          request("/api/owner/inbox/x", { status: "read" }, token, "PATCH"),
          OWNER,
        )
      ).status,
      expected,
    );
  }
});

test("owner can read pending, approve/reject comments, and update inbox statuses", async () => {
  const pending = await app.handlers.pendingComments(
    request("/api/owner/comments?limit=50", undefined, "owner"),
  );
  assert.equal(pending.status, 200);
  const rows = (await pending.json()).items;
  assert.ok(rows.length >= 2);
  assert.equal(
    (
      await app.handlers.moderateComment(
        request(
          "/api/owner/comments/x",
          { status: "approved" },
          "owner",
          "PATCH",
        ),
        rows[0].id,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await app.handlers.moderateComment(
        request(
          "/api/owner/comments/x",
          { status: "rejected" },
          "owner",
          "PATCH",
        ),
        rows[1].id,
      )
    ).status,
    200,
  );
  const inbox = await app.handlers.inbox(
    request("/api/owner/inbox", undefined, "owner"),
  );
  const message = (await inbox.json()).items[0];
  assert.equal(
    (
      await app.handlers.updateMessage(
        request("/api/owner/inbox/x", { status: "read" }, "owner", "PATCH"),
        message.id,
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await db.query<{ status: string }>(
        "select status from public.contact_messages where id=$1",
        [message.id],
      )
    ).rows[0].status,
    "read",
  );
  assert.equal(
    (
      await app.handlers.updateMessage(
        request(
          "/api/owner/inbox/x",
          { status: "archived", name: "forged" },
          "owner",
          "PATCH",
        ),
        message.id,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.handlers.moderateComment(
        request(
          "/api/owner/comments/x",
          { status: "pending" },
          "owner",
          "PATCH",
        ),
        rows[0].id,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.handlers.updateMessage(
        request("/api/owner/inbox/x", { status: "read" }, "owner", "PATCH"),
        "not-uuid",
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.handlers.updateMessage(
        request("/api/owner/inbox/x", { status: "read" }, "owner", "PATCH"),
        OTHER,
      )
    ).status,
    404,
  );
});

test("approved-only public projection, stable cursor pagination, and safe text output", async () => {
  await db.query(
    "insert into public.comments(target_type,author_name,content,status,created_at) values ('guestbook','Writer',$1,'approved','2026-01-01'),('guestbook','Writer','Second approved','approved','2026-01-01'),('guestbook','Writer','Pending private','pending','2025-01-01'),('guestbook','Writer','Rejected private','rejected','2025-01-01')",
    ["<script>alert('x')</script>"],
  );
  const first = await app.handlers.approvedComments(
    request("/api/comments?target_type=guestbook&limit=1"),
  );
  assert.equal(first.headers.get("X-Content-Type-Options"), "nosniff");
  const raw = await first.text();
  assert.ok(!raw.includes("<script>"));
  const one = JSON.parse(raw);
  assert.equal(one.items.length, 1);
  assert.ok(one.nextCursor);
  assert.equal(one.items[0].status, undefined);
  assert.equal(one.items[0].updated_at, undefined);
  const two = await (
    await app.handlers.approvedComments(
      request(
        `/api/comments?target_type=guestbook&limit=1&cursor=${one.nextCursor}`,
      ),
    )
  ).json();
  assert.equal(two.items.length, 1);
  assert.notEqual(one.items[0].id, two.items[0].id);
  const all = await (
    await app.handlers.approvedComments(
      request("/api/comments?target_type=guestbook&limit=50"),
    )
  ).json();
  assert.ok(
    all.items.every(
      (row: { message: string }) =>
        !["Pending private", "Rejected private"].includes(row.message),
    ),
  );
  for (const query of [
    "target_type=bad",
    "target_type=project&target_id=bad",
    "target_type=guestbook&target_id=sat-chi",
    "target_type=guestbook&limit=51",
    "target_type=guestbook&cursor=bad",
  ])
    assert.equal(
      (await app.handlers.approvedComments(request(`/api/comments?${query}`)))
        .status,
      400,
    );
});

test("RLS/grants: anonymous clients cannot access inbox, private tables, pending fields, or write", async () => {
  for (const sql of [
    "select * from public.contact_messages",
    "insert into public.contact_messages(name,message) values ('Bot','Spam message long')",
    "update public.contact_messages set status='read'",
    "delete from public.contact_messages",
    "insert into public.comments(target_type,author_name,content) values ('guestbook','Bot','Spam')",
    "update public.comments set status='approved'",
    "delete from public.comments",
    "select status from public.comments",
    "select updated_at from public.comments",
    "select * from private.portfolio_owners",
    "select * from private.submission_limits",
    "select public.is_portfolio_owner()",
    `select public.consume_submission_limit('${"a".repeat(64)}')`,
  ])
    await assert.rejects(roleQuery(db, "anon", sql), /permission denied/);
  const publicRows = await roleQuery<{ content: string }>(
    db,
    "anon",
    "select content from public.comments",
  );
  const approved = (
    await db.query<{ content: string }>(
      "select content from public.comments where status='approved'",
    )
  ).rows;
  assert.deepEqual(
    publicRows.map((row) => row.content).sort(),
    approved.map((row) => row.content).sort(),
  );
});

test("RLS/grants: authenticated non-owners and AAL1 owners see no private rows", async () => {
  for (const claims of [
    { sub: OTHER, aal: "aal2" },
    { sub: OWNER, aal: "aal1" },
  ]) {
    assert.equal(
      (
        await roleQuery(
          db,
          "authenticated",
          "select * from public.contact_messages",
          [],
          claims,
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await roleQuery(
          db,
          "authenticated",
          "select * from public.comments",
          [],
          claims,
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await roleQuery(
          db,
          "authenticated",
          "update public.comments set status='approved' returning id",
          [],
          claims,
        )
      ).length,
      0,
    );
    await assert.rejects(
      roleQuery(
        db,
        "authenticated",
        "select * from private.portfolio_owners",
        [],
        claims,
      ),
      /permission denied/,
    );
  }
  const claims = { sub: OWNER, aal: "aal2" };
  await assert.rejects(
    roleQuery(
      db,
      "authenticated",
      "update public.comments set content='Forged'",
      [],
      claims,
    ),
    /permission denied/,
  );
  await assert.rejects(
    roleQuery(
      db,
      "authenticated",
      "delete from public.contact_messages",
      [],
      claims,
    ),
    /permission denied/,
  );
  await assert.rejects(
    roleQuery(
      db,
      "authenticated",
      "insert into public.comments(target_type,author_name,content) values ('guestbook','Owner','Content')",
      [],
      claims,
    ),
    /permission denied/,
  );
});

test("database constraints and server credential column restrictions", async () => {
  for (const sql of [
    "insert into public.comments(target_type,author_name,content,status) values ('guestbook','Bot','Spam','approved')",
    "insert into public.contact_messages(name,message,status) values ('Bot','Spam message long','read')",
    "select * from public.contact_messages",
    "select * from public.comments",
    "select * from private.portfolio_owners",
  ])
    await assert.rejects(
      roleQuery(db, "service_role", sql),
      /permission denied/,
    );
  for (const sql of [
    "insert into public.comments(target_type,target_id,author_name,content) values ('project','invented','Visitor','Comment')",
    "insert into public.comments(target_type,target_id,author_name,content) values ('guestbook','sat-chi','Visitor','Comment')",
    "insert into public.comments(target_type,author_name,content) values ('project','Visitor','Comment')",
    "insert into public.contact_messages(name,message) values ('','short')",
  ])
    await assert.rejects(roleQuery(db, "service_role", sql), /violates/);
});

test("configuration fails closed; origins/IP hashes cannot fall back to forwarded client headers", async () => {
  for (const field of [
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TURNSTILE_SECRET_KEY",
    "RATE_LIMIT_HMAC_SECRET",
    "SITE_ORIGIN",
  ])
    await assert.rejects(
      async () => submissionConfig({ ...localEnv, [field]: undefined }),
      { status: 503 },
    );
  assert.throws(
    () => submissionConfig({ ...localEnv, NODE_ENV: "production" }),
    { status: 503 },
  );
  assert.throws(
    () => submissionConfig({ ...localEnv, TURNSTILE_MODE: "real" }),
    { status: 503 },
  );
  for (const secret of TEST_TURNSTILE_SECRETS)
    assert.throws(
      () =>
        submissionConfig({
          ...localEnv,
          NODE_ENV: "production",
          TURNSTILE_SECRET_KEY: secret,
        }),
      { status: 503 },
    );
  assert.throws(
    () =>
      publicConfig({
        ...localEnv,
        SUPABASE_PUBLISHABLE_KEY: "sb_secret_wrong",
      }),
    { status: 503 },
  );
  assert.throws(
    () =>
      publicConfig({
        ...localEnv,
        SUPABASE_PUBLISHABLE_KEY: `x.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.x`,
      }),
    { status: 503 },
  );
  assert.throws(
    () => checkOrigin(new Request(`${ORIGIN}/api/contact`), true, ORIGIN),
    { status: 403 },
  );
  assert.throws(
    () =>
      checkOrigin(
        new Request(`${ORIGIN}/api/contact`, {
          headers: { Origin: "http://attacker.test" },
        }),
        true,
        ORIGIN,
      ),
    { status: 403 },
  );
  const trusted = {
    ...config,
    ipHeader: "cf-connecting-ip" as const,
    localIp: false,
  };
  assert.throws(
    () =>
      subjectHash(
        new Request(ORIGIN, { headers: { "x-forwarded-for": "127.0.0.1" } }),
        trusted,
      ),
    { status: 503 },
  );
  assert.throws(
    () =>
      subjectHash(
        new Request(ORIGIN, {
          headers: { "cf-connecting-ip": "1.2.3.4,5.6.7.8" },
        }),
        trusted,
      ),
    { status: 503 },
  );
  const hash = (ip: string) =>
    subjectHash(
      new Request(ORIGIN, { headers: { "cf-connecting-ip": ip } }),
      trusted,
    );
  assert.equal(hash("127.0.0.1"), hash("::ffff:127.0.0.1"));
  assert.equal(hash("2001:db8::1"), hash("2001:0db8:0:0:0:0:0:1"));
  assert.match(hash("127.0.0.1"), /^[0-9a-f]{64}$/);
});

test("owner verifier uses network-verified identity and hides backend errors", async () => {
  let checked = false;
  await assert.rejects(
    authorizeOwner("token", {
      getUser: async () => ({ data: { user: null }, error: { status: 401 } }),
      isOwner: async () => {
        checked = true;
        return { data: true, error: null };
      },
    }),
    { status: 401 },
  );
  assert.equal(checked, false);
  await assert.rejects(
    authorizeOwner("token", {
      getUser: async () => ({ data: { user: null }, error: { status: 500 } }),
      isOwner: async () => ({ data: true, error: null }),
    }),
    { status: 503 },
  );
  await assert.rejects(
    authorizeOwner("token", {
      getUser: async () => ({ data: { user: { id: OWNER } }, error: null }),
      isOwner: async () => ({
        data: true,
        error: new Error("secret internal"),
      }),
    }),
    { status: 503 },
  );
});

test("production Supabase DAL requests enforce projections, minimal inserts and owner JWTs", async () => {
  const calls: {
    url: URL;
    method: string;
    body: unknown;
    authorization: string | null;
  }[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    calls.push({
      url,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      authorization: new Headers(init?.headers).get("authorization"),
    });
    return new Response(init?.method === "POST" ? null : JSON.stringify([]), {
      status: init?.method === "POST" ? 201 : 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    const client = databaseClient("https://example.supabase.co", "public-key");
    await publicRepository(client).comments(
      { kind: "project", projectId: "sat-chi" },
      { limit: 20, descending: false },
    );
    assert.equal(
      calls[0].url.searchParams.get("select"),
      "id,target_type,target_id,author_name,content,created_at",
    );
    assert.equal(calls[0].url.searchParams.get("target_id"), "eq.sat-chi");
    assert.equal(calls[0].url.searchParams.get("limit"), "21");
    assert.ok(!calls[0].url.searchParams.has("status"));
    const repo = submissionRepository(
      databaseClient("https://example.supabase.co", "server-key"),
    );
    await repo.contact({ ...contact, website: "" });
    assert.deepEqual(calls[1].body, {
      name: contact.name,
      reply_contact: contact.replyContact,
      message: contact.message,
    });
    await repo.comment({
      ...comment,
      target: { kind: "guestbook" },
      website: "",
    });
    assert.deepEqual(calls[2].body, {
      target_type: "guestbook",
      target_id: null,
      author_name: comment.displayName,
      content: comment.message,
    });
    await ownerRepository(
      databaseClient(
        "https://example.supabase.co",
        "public-key",
        "verified-owner-token",
      ),
    ).pending({ limit: 20, descending: false });
    assert.equal(calls[3].authorization, "Bearer verified-owner-token");
    assert.equal(calls[3].url.searchParams.get("status"), "eq.pending");
  } finally {
    globalThis.fetch = original;
  }
});

test("body stream timeouts and incremental size limits prevent unbounded reads", async () => {
  const oversized = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_BODY_BYTES));
      controller.enqueue(new Uint8Array(1));
      controller.close();
    },
  });
  const streamed = new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: oversized,
    duplex: "half",
  } as RequestInit);
  assert.equal((await app.handlers.submitContact(streamed)).status, 413);
  let cancelled = false;
  const stuck = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const slow = new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: stuck,
    duplex: "half",
  } as RequestInit);
  assert.equal((await app.handlers.submitContact(slow)).status, 408);
  assert.equal(cancelled, true);
});

test("public submissions and owner mutations reject foreign origins", async () => {
  const foreign = request("/api/contact", contact);
  foreign.headers.set("Origin", "https://attacker.test");
  assert.equal((await app.handlers.submitContact(foreign)).status, 403);
  const patch = request(
    "/api/owner/inbox/x",
    { status: "read" },
    "owner",
    "PATCH",
  );
  patch.headers.set("Origin", "https://attacker.test");
  assert.equal((await app.handlers.updateMessage(patch, OWNER)).status, 403);
});

test("API errors hide internal details and never report a failed insert as success", async () => {
  const { createHandlers } = await import("../../src/lib/backend/handlers");
  const { handlers } = await import("../../src/lib/backend/runtime");
  // With no configured backend, the actual runtime still rejects anonymous owners.
  assert.equal((await handlers.inbox(request("/api/owner/inbox"))).status, 401);
  const broken = createHandlers({
    origin() {},
    async protect() {},
    submissions() {
      throw new Error("private-key-and-database-details");
    },
    publicComments() {
      throw new Error("private-query");
    },
    async owner() {
      throw new Error("private-auth");
    },
  });
  for (const response of [
    await broken.submitContact(request("/api/contact", contact)),
    await broken.approvedComments(
      request("/api/comments?target_type=guestbook"),
    ),
  ]) {
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: "temporarily_unavailable",
    });
  }
});

test("production accepts complete real configuration but blocks test secrets, insecure origins and local IP fallback", () => {
  const production = {
    ...localEnv,
    NODE_ENV: "production",
    SUPABASE_URL: "https://example.supabase.co",
    SITE_ORIGIN: "https://portfolio.example",
    TURNSTILE_HOSTNAME: "portfolio.example",
    TURNSTILE_SECRET_KEY: "real-widget-secret-test-fixture",
    TURNSTILE_MODE: "real",
    TRUSTED_IP_HEADER: "x-nf-client-connection-ip",
    BACKEND_LOCAL_IP: "true",
  } as NodeJS.ProcessEnv;
  assert.equal(submissionConfig(production).localIp, false);
  for (const secret of TEST_TURNSTILE_SECRETS) {
    for (const mode of ["real", "test"])
      assert.throws(
        () =>
          submissionConfig({
            ...production,
            TURNSTILE_SECRET_KEY: secret,
            TURNSTILE_MODE: mode,
          }),
        { status: 503 },
      );
  }
  assert.throws(
    () => submissionConfig({ ...production, TRUSTED_IP_HEADER: undefined }),
    { status: 503 },
  );
  assert.throws(
    () =>
      submissionConfig({
        ...production,
        SITE_ORIGIN: "http://portfolio.example",
      }),
    { status: 503 },
  );
  assert.throws(
    () =>
      submissionConfig({ ...production, TURNSTILE_HOSTNAME: "wrong.example" }),
    { status: 503 },
  );
});

test("migration project IDs match the central portfolio configuration", async () => {
  const { projects } = await import("../../src/data/portfolio");
  const rows = (
    await db.query<{ id: string }>(
      "select id from public.portfolio_projects order by id",
    )
  ).rows;
  assert.deepEqual(
    rows.map((row) => row.id),
    projects.map((project) => project.id).sort(),
  );
});

test("public configuration rejects owner/user JWTs and accepts only supported public key types", () => {
  const jwt = (role: string) =>
    `header.${Buffer.from(JSON.stringify({ role, sub: OWNER, aal: "aal2" })).toString("base64url")}.signature`;
  for (const key of [
    jwt("authenticated"),
    jwt("service_role"),
    jwt("other"),
    "opaque-unverified-key",
    "sb_secret_wrong",
  ])
    assert.throws(
      () => publicConfig({ ...localEnv, SUPABASE_PUBLISHABLE_KEY: key }),
      { status: 503 },
    );
  assert.equal(
    publicConfig({ ...localEnv, SUPABASE_PUBLISHABLE_KEY: jwt("anon") }).key,
    jwt("anon"),
  );
  assert.equal(publicConfig(localEnv).key, localEnv.SUPABASE_PUBLISHABLE_KEY);
});

test("pre-MFA identity RPC grants no private access and remains unavailable to anon", async () => {
  const owner = await roleQuery<{ identity: boolean; private_access: boolean }>(
    db,
    "authenticated",
    "select public.is_portfolio_owner_identity() as identity, public.is_portfolio_owner() as private_access",
    [],
    { sub: OWNER, aal: "aal1" },
  );
  assert.equal(owner[0].identity, true);
  assert.equal(owner[0].private_access, false);
  const other = await roleQuery<{ identity: boolean }>(
    db,
    "authenticated",
    "select public.is_portfolio_owner_identity() as identity",
    [],
    { sub: OTHER, aal: "aal2" },
  );
  assert.equal(other[0].identity, false);
  await assert.rejects(
    roleQuery(db, "anon", "select public.is_portfolio_owner_identity()"),
  );
});
test("owner overview and status-filtered lists require MFA authorization", async () => {
  for (const token of [undefined, "nonowner", "owner-aal1"]) {
    const headers = new Headers(
      token ? { Authorization: `Bearer ${token}` } : {},
    );
    const response = await app.handlers.overview(
      new Request(ORIGIN + "/api/owner/overview", { headers }),
    );
    assert.equal(response.status, token ? 403 : 401);
  }
  const headers = { Authorization: "Bearer owner" };
  const response = await app.handlers.overview(
    new Request(ORIGIN + "/api/owner/overview", { headers }),
  );
  assert.equal(response.status, 200);
  const summary = await response.json();
  assert.equal(typeof summary.unread, "number");
  assert.ok(Array.isArray(summary.recent));
  const approved = await app.handlers.pendingComments(
    new Request(ORIGIN + "/api/owner/comments?status=approved", { headers }),
  );
  assert.equal(approved.status, 200);
  assert.ok(
    (await approved.json()).items.every(
      (row: { status: string }) => row.status === "approved",
    ),
  );
  assert.equal(
    (
      await app.handlers.pendingComments(
        new Request(ORIGIN + "/api/owner/comments?status=invalid", { headers }),
      )
    ).status,
    400,
  );
});
