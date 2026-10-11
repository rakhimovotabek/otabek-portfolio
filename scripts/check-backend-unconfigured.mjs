import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Run ONLY against a local preview with no backend configuration.
const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3001";
const results = [];
async function check(route, expected, body, method = body ? "POST" : "GET") {
  const response = await fetch(`${base}${route}`, {
    method,
    ...(body
      ? {
          headers: { "Content-Type": "application/json", Origin: base },
          body: JSON.stringify(body),
        }
      : {}),
  });
  assert.equal(response.status, expected, `${method} ${route}`);
  const json = await response.json();
  assert.deepEqual(Object.keys(json), ["error"]);
  assert.ok(!JSON.stringify(json).includes("supabase"));
  results.push({ route, method, status: response.status, error: json.error });
}
async function main() {
  assert.equal(
    process.env.BACKEND_SMOKE_UNCONFIGURED,
    "true",
    "Set BACKEND_SMOKE_UNCONFIGURED=true only for an unconfigured local preview",
  );
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
  await check("/api/comments?target_type=guestbook", 503);
  await check("/api/comments?target_type=project&target_id=unknown", 400);
  await check("/api/contact", 503, {
    name: "Test visitor",
    message: "A private test message.",
    turnstileToken: "dummy",
  });
  await check("/api/contact", 400, { name: "", message: "" });
  await check("/api/contact", 413, {
    name: "Test visitor",
    message: "x".repeat(25000),
    turnstileToken: "dummy",
  });
  await check("/api/comments", 503, {
    displayName: "Test visitor",
    message: "Test feedback",
    target: { kind: "guestbook" },
    turnstileToken: "dummy",
  });
  await check("/api/owner/inbox", 401);
  await check("/api/owner/comments", 401);
  await check(
    "/api/owner/inbox/11111111-1111-4111-8111-111111111111",
    401,
    { status: "read" },
    "PATCH",
  );
  await check(
    "/api/owner/comments/11111111-1111-4111-8111-111111111111",
    401,
    { status: "approved" },
    "PATCH",
  );
  const output = path.resolve(
    process.env.PORTFOLIO_QA_OUTPUT || "docs/preview/phase4a",
  );
  await mkdir(output, { recursive: true });
  await writeFile(
    path.join(output, "api-smoke-results.json"),
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    `Unconfigured production API: ${results.length} checks passed; no records stored.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
