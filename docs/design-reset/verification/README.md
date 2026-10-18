# Reproduce the review

No QA packages were added to the application. This machine already has Playwright and axe in `/tmp/otabek-browser-qa/node_modules`, plus a provisioned Chromium headless shell.

```bash
# Start after a successful production build; intentionally no backend access.
SUPABASE_URL= SUPABASE_PUBLISHABLE_KEY= SUPABASE_SERVICE_ROLE_KEY= TURNSTILE_SECRET_KEY= npm start -- --hostname 127.0.0.1 --port 3010

# Run sequentially, with one browser at a time.
NODE_PATH=/tmp/otabek-browser-qa/node_modules PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/review-other-side.cjs
NODE_PATH=/tmp/otabek-browser-qa/node_modules PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/profile-other-side.cjs
NODE_PATH=/tmp/otabek-browser-qa/node_modules PLAYWRIGHT_CHROMIUM_PATH=/home/otabek/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/record-other-side.cjs
```

Use `PORTFOLIO_URL`, `NODE_PATH` and `PLAYWRIGHT_CHROMIUM_PATH` for equivalent local tooling elsewhere. Read the JSON/log evidence, not only this checklist. Feature-fixture checks only intercept local browser requests; they never claim real submission, moderation or MFA verification.

Supplemental captures and probes (same environment variables):

```bash
node scripts/capture-other-side-extras.cjs
node scripts/check-other-side-contact.cjs
node scripts/check-other-side-lifecycle.cjs
```

The last probe verifies native navigation and rapid clicks; its registry result is explicitly `unknown` when the compiled runtime does not expose ScrollTrigger. Use `RECORD_ONLY_MOBILE=1` with the recording script to resume only the phone clip after the three desktop clips exist.
