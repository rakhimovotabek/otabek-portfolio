import assert from "node:assert/strict";
import {
  submissionConfig,
  TEST_TURNSTILE_SECRETS,
} from "../src/lib/backend/config";
import { verifyTurnstile } from "../src/lib/backend/protection";

// Cloudflare's published dummy credentials, NOT portfolio secrets. No visitor
// content or IP addresses are sent. This verifies network access/test mode only.
const env = {
  NODE_ENV: "test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_dummy",
  SUPABASE_SERVICE_ROLE_KEY: "dummy-server",
  SITE_ORIGIN: "http://localhost:3001",
  TURNSTILE_HOSTNAME: "localhost",
  TURNSTILE_MODE: "test",
  BACKEND_LOCAL_IP: "true",
  RATE_LIMIT_HMAC_SECRET: "disposable-local-test-hash-secret-32-characters",
} as NodeJS.ProcessEnv;
async function main() {
  const pass = submissionConfig({
    ...env,
    TURNSTILE_SECRET_KEY: TEST_TURNSTILE_SECRETS[0],
  });
  await verifyTurnstile("XXXX.DUMMY.TOKEN.XXXX", "contact", pass);
  const fail = submissionConfig({
    ...env,
    TURNSTILE_SECRET_KEY: TEST_TURNSTILE_SECRETS[1],
  });
  await assert.rejects(
    verifyTurnstile("XXXX.DUMMY.TOKEN.XXXX", "contact", fail),
    { status: 400 },
  );
  console.log(
    "Cloudflare Siteverify: documented pass/fail test credentials verified (not production CAPTCHA).",
  );
}
main().catch(() => {
  console.error(
    "Cloudflare Siteverify test failed; check outbound HTTPS connectivity. No credentials were logged.",
  );
  process.exitCode = 1;
});
