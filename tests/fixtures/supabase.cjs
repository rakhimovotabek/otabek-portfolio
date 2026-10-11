/* eslint-disable @typescript-eslint/no-require-imports -- Isolated test gateway, never imported by application code. */
// Mock GoTrue/PostgREST for UI/session tests. Not a database, JWT signature or RLS test.
const http = require("node:http");
const OWNER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const FACTOR = "33333333-3333-4333-8333-333333333333";
const uid = (n) => `44444444-4444-4444-8444-${String(n).padStart(12, "0")}`;
function startFixture(port = 0) {
  let enrolled = true,
    verified = true,
    revoked = new Set(),
    limits = new Map();
  let messages, comments;
  const reset = () => {
    enrolled = true;
    verified = true;
    revoked = new Set();
    limits = new Map();
    messages = [
      {
        id: uid(1),
        name: "Fixture visitor",
        reply_contact: "reply@example.test",
        message: "A private fixture message for UI verification.",
        status: "unread",
        created_at: "2026-10-10T12:00:00.000Z",
      },
    ];
    comments = Array.from({ length: 16 }, (_, i) => ({
      id: uid(20 + i),
      target_type: i % 2 ? "project" : "guestbook",
      target_id: i % 2 ? "sat-chi" : null,
      author_name: `Fixture reader ${i + 1}`,
      content:
        i === 0
          ? '<img src=x onerror="window.injected=true">'
          : "A fixture comment for the moderation flow.",
      status: i < 2 ? "pending" : i === 2 ? "rejected" : "approved",
      created_at: `2026-10-10T12:${String(i).padStart(2, "0")}:00.000Z`,
      updated_at: `2026-10-10T12:${String(i).padStart(2, "0")}:00.000Z`,
    }));
  };
  reset();
  const token = (
    sub = OWNER,
    aal = "aal1",
    exp = Math.floor(Date.now() / 1000) + 3600,
  ) =>
    [
      Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
        "base64url",
      ),
      Buffer.from(
        JSON.stringify({
          sub,
          aal,
          exp,
          iat: Math.floor(Date.now() / 1000),
          role: "authenticated",
        }),
      ).toString("base64url"),
      Buffer.from("fixture-signature").toString("base64url"),
    ].join(".");
  const decode = (raw) => {
    try {
      return JSON.parse(Buffer.from(raw.split(".")[1], "base64url"));
    } catch {
      return {};
    }
  };
  const factors = () =>
    enrolled
      ? [
          {
            id: FACTOR,
            factor_type: "totp",
            friendly_name: "Fixture authenticator",
            status: verified ? "verified" : "unverified",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
      : [];
  const user = (sub) => ({
    id: sub,
    aud: "authenticated",
    role: "authenticated",
    email: sub === OWNER ? "owner@example.test" : "other@example.test",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: "2026-10-01T00:00:00Z",
    factors: sub === OWNER ? factors() : [],
  });
  const session = (sub, aal) => ({
    access_token: token(sub, aal),
    refresh_token: `fixture:${sub}:${aal}`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: user(sub),
  });
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1"),
      path = url.pathname;
    const raw = (req.headers.authorization || "").replace(/^Bearer /, "");
    const claims = decode(raw);
    const owner = claims.sub === OWNER && claims.aal === "aal2";
    let body = {};
    try {
      let text = "";
      for await (const chunk of req) text += chunk;
      body = text ? JSON.parse(text) : {};
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    const send = (status, data, headers = {}) => {
      res.writeHead(status, { "Content-Type": "application/json", ...headers });
      res.end(req.method === "HEAD" ? undefined : JSON.stringify(data));
    };
    if (path === "/__test/reset") {
      reset();
      if (body.unenrolled) {
        enrolled = false;
        verified = false;
      }
      return send(200, { ok: true });
    }
    if (path === "/auth/v1/token") {
      if (url.searchParams.get("grant_type") === "password") {
        if (body.password !== "fixture-password")
          return send(400, {
            msg: "Invalid login credentials",
            error_code: "invalid_credentials",
          });
        return send(
          200,
          session(body.email === "other@example.test" ? OTHER : OWNER, "aal1"),
        );
      }
      const parts = String(body.refresh_token).split(":");
      if (parts[0] !== "fixture" || revoked.has(body.refresh_token))
        return send(400, {
          msg: "Refresh token invalid",
          error_code: "refresh_token_not_found",
        });
      return send(200, session(parts[1], parts[2]));
    }
    if (path === "/auth/v1/user") {
      if (
        !claims.sub ||
        claims.exp < Date.now() / 1000 ||
        revoked.has(`fixture:${claims.sub}:${claims.aal}`)
      )
        return send(401, { msg: "Invalid JWT", error_code: "bad_jwt" });
      return send(200, user(claims.sub));
    }
    if (path === "/auth/v1/logout") {
      revoked.add(`fixture:${claims.sub}:${claims.aal}`);
      return send(200, {});
    }
    if (path === "/auth/v1/factors" && req.method === "POST") {
      if (claims.sub !== OWNER) return send(403, {});
      enrolled = true;
      verified = false;
      return send(200, {
        id: FACTOR,
        type: "totp",
        totp: {
          qr_code:
            '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><rect width="220" height="220" fill="white"/><text x="20" y="100">TEST QR</text></svg>',
          secret: "TESTONLYSETUPKEY",
          uri: "otpauth://fixture",
        },
      });
    }
    if (path === `/auth/v1/factors/${FACTOR}` && req.method === "DELETE") {
      if (verified) return send(403, {});
      enrolled = false;
      return send(200, {});
    }
    if (path === `/auth/v1/factors/${FACTOR}/challenge`)
      return send(200, {
        id: uid(100),
        type: "totp",
        expires_at: Math.floor(Date.now() / 1000) + 60,
      });
    if (path === `/auth/v1/factors/${FACTOR}/verify`) {
      if (body.code !== "123456")
        return send(422, {
          msg: "Invalid code",
          error_code: "mfa_verification_failed",
        });
      verified = true;
      return send(200, session(OWNER, "aal2"));
    }
    if (path === "/rest/v1/rpc/is_portfolio_owner_identity")
      return send(200, claims.sub === OWNER);
    if (path === "/rest/v1/rpc/is_portfolio_owner") return send(200, owner);
    if (path === "/rest/v1/rpc/consume_submission_limit") {
      const n = (limits.get(body.p_subject_hash) || 0) + 1;
      limits.set(body.p_subject_hash, n);
      return send(200, n <= 5);
    }
    if (path === "/rest/v1/contact_messages" || path === "/rest/v1/comments") {
      const isMessage = path.endsWith("contact_messages");
      const list = isMessage ? messages : comments;
      if (req.method === "POST") {
        if (raw !== "fixture-service-key") return send(403, {});
        const row = {
          ...body,
          id: uid(list.length + 200),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: isMessage ? "unread" : "pending",
        };
        list.push(row);
        return send(201, null);
      }
      if (req.method === "PATCH") {
        if (!owner) return send(403, {});
        const id = url.searchParams.get("id")?.slice(3);
        const row = list.find((row) => row.id === id);
        if (!row) return send(404, {});
        row.status = body.status;
        row.updated_at = new Date().toISOString();
        return send(200, {
          id: row.id,
          status: row.status,
          updated_at: row.updated_at,
        });
      }
      let visible = owner
        ? [...list]
        : isMessage
          ? []
          : list.filter((row) => row.status === "approved");
      for (const key of ["status", "target_type", "target_id", "id"]) {
        const value = url.searchParams.get(key);
        if (!value) continue;
        if (value.startsWith("eq."))
          visible = visible.filter((row) => row[key] === value.slice(3));
        if (value.startsWith("neq."))
          visible = visible.filter((row) => row[key] !== value.slice(4));
        if (value === "is.null")
          visible = visible.filter((row) => row[key] === null);
      }
      const order = url.searchParams.get("order") || "created_at.asc,id.asc";
      const field = order.startsWith("updated_at")
        ? "updated_at"
        : "created_at";
      const desc = order.includes("desc");
      visible.sort(
        (a, b) =>
          (desc ? -1 : 1) *
          (a[field].localeCompare(b[field]) || a.id.localeCompare(b.id)),
      );
      const or = url.searchParams.get("or");
      if (or) {
        const match = or.match(/created_at\.(gt|lt)\.([^,]+)/);
        if (match)
          visible = visible.filter((row) =>
            match[1] === "gt"
              ? row.created_at > match[2]
              : row.created_at < match[2],
          );
      }
      const total = visible.length;
      visible = visible.slice(0, Number(url.searchParams.get("limit") || 50));
      const columns = url.searchParams.get("select")?.split(",");
      if (columns && !columns.includes("*"))
        visible = visible.map((row) =>
          Object.fromEntries(
            columns.filter((key) => key in row).map((key) => [key, row[key]]),
          ),
        );
      return send(200, visible, {
        "Content-Range": `0-${Math.max(0, visible.length - 1)}/${total}`,
      });
    }
    send(404, { message: "Unknown fixture route" });
  });
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () =>
      resolve({
        server,
        url: `http://127.0.0.1:${server.address().port}`,
        token,
        reset,
        close: () => new Promise((resolve) => server.close(resolve)),
      }),
    ),
  );
}
module.exports = { startFixture, OWNER, OTHER, FACTOR };
if (require.main === module)
  startFixture(Number(process.env.FIXTURE_PORT || 3102)).then((f) => {
    console.log(`Isolated mock Supabase fixture on ${f.url}`);
    process.on("SIGTERM", () => f.server.close());
  });
