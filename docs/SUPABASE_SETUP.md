# Supabase setup — Phase 4B

Visitor forms and a private owner dashboard are implemented. This guide covers setup; configuration alone does not prove that migrations, RLS, MFA or a production widget work. The homepage renders without backend variables and displays safe unavailable states. Never paste credentials into chat, commit them, or include them in screenshots.

Current local checkpoint: supplied project keys are in ignored `.env.local` (mode 0600). The owner applied both migrations through the SQL Editor. The hosted public comment projection returns HTTP 200; anonymous inbox reads, moderation-column reads and the pre-MFA identity RPC are denied. Owner provisioning/MFA and production protection still require verification. The CLI account did not list the supplied project; unrelated projects were left untouched. Rotate a secret key shared in chat and update `.env.local` privately.

## 1. Create and identify your project

1. In the [Supabase dashboard](https://supabase.com/dashboard), create a dedicated portfolio project in your organization. Choose the region and database password yourself; store the password privately. Keep staging separate from production.
2. Record its project reference and URL. Verify the organization, project name, region and reference before applying anything.
3. In Auth settings, disable new user signups and anonymous Auth sign-ins. Keep email/password enabled for the manually provisioned owner. Enable TOTP enrollment and verification. This project uses anonymous HTTP submissions, not anonymous Supabase Auth accounts.
4. Keep the Data API restricted to the `public` schema. Do not expose `private` or `auth`. Do not broaden grants or add anonymous write policies to get around a failed request.

The repository contains `supabase/config.toml` for optional local Supabase development. Docker is required by the full local stack and was unavailable during this phase. The installed CLI alone is not a running database.

## 2. Apply the migrations

From the project directory:

```bash
supabase login
supabase projects list
supabase link --project-ref YOUR_VERIFIED_PROJECT_REF
supabase db push --dry-run
supabase db push
```

Review the dry run and project identity first. Enter database credentials only through the CLI's private prompt or your secret manager. Never commit them. Do not run a linked database reset.

Alternatively, execute each unapplied SQL file from `supabase/migrations/`, in filename order, in the verified project's SQL Editor as the database administrator. The Phase 4B file adds only the pre-MFA identity RPC. That migration is transactional and expects its table/function names to be unused. If using the SQL Editor, reconcile the CLI migration history before subsequently using `db push`; do not apply it twice. CLI application is preferred.

The migration creates:

- `public.contact_messages`: private name, optional reply contact and message, with unread/read/archived status.
- `public.comments`: project or guestbook feedback, pending by default; approved/rejected states are owner-controlled.
- `public.portfolio_projects`: five stable project IDs used as foreign keys. When adding a project later, update both central portfolio data and this table with a migration.
- `private.portfolio_owners`: explicit allowlist referencing `auth.users.id`.
- `private.submission_limits`: expiring hashed-IP quotas, inaccessible through the public API.

RLS is enabled on every table. `anon` receives only the approved comment projection. It has no inbox access, insert/update/delete privileges or moderation columns. Authenticated users receive private access only when `is_portfolio_owner()` verifies both an allowlisted UID and `aal2`. The service role receives only the submission columns and quota RPCs; it cannot select application inbox/comment tables or choose moderation status through their grants. Supabase's service credentials remain highly privileged elsewhere in the project and must still remain secret. RLS and table grants are both necessary; see [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 3. Provision the owner

1. Create your owner user manually in the project's Auth Users dashboard. This application account is separate from your Supabase dashboard login. Choose your own email and strong password; no application signup route exists.
2. Copy that user's actual UUID from Auth Users. In the trusted SQL Editor, allowlist it:

```sql
insert into private.portfolio_owners(user_id)
values ('REPLACE_WITH_YOUR_ACTUAL_AUTH_USER_UUID'::uuid);
```

3. Enroll a TOTP factor and obtain a verified MFA session. Owner routes require `aal2`; a password-only session receives 403 even for an allowlisted owner. Supabase dashboard-account MFA is separate from this application's Auth-user MFA.
4. Keep recovery details private. To revoke application access, delete that UUID from `private.portfolio_owners`; each API request and RLS policy rechecks membership.

Use the implemented `/admin/login` sign-in/enrollment interface described below. A trusted private Supabase SDK test client can alternatively use `auth.signInWithPassword`, `auth.mfa.enroll({ factorType: 'totp' })`, then `auth.mfa.challengeAndVerify({ factorId, code })`. For subsequent sessions, challenge an existing verified factor. Display the enrollment QR/secret privately, never in shared logs; retain the resulting access token only in that private test session. Do not publish a token or add any credentials to source code. [Supabase TOTP flow](https://supabase.com/docs/guides/auth/auth-mfa/totp).

Owner endpoints accept the browser's protected HttpOnly session cookies or `Authorization: Bearer <access token>` for trusted CLI use. The server calls [Supabase `getUser(token)`](https://supabase.com/docs/reference/javascript/auth-getuser) to verify identity over the network, then calls the owner RPC using that same JWT. Private data access also uses the owner JWT and RLS, not a service client. Client emails, decoded-but-unverified JWTs and JSON `status`/`role` fields never establish ownership. Cookie-based mutations additionally require the exact configured Origin.

## 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` privately. It is ignored by Git; only the blank example is tracked.

| Variable                         | Required for                            | Value / exposure                                                                                       |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `SUPABASE_URL`                   | All database APIs                       | Verified project URL; HTTPS in production                                                              |
| `SUPABASE_PUBLISHABLE_KEY`       | Public reads and owner requests         | Publishable key, or legacy anon key; never a secret/service-role key                                   |
| `SUPABASE_SERVICE_ROLE_KEY`      | Anonymous submissions                   | Server secret key, or legacy service-role key; never browser-exposed                                   |
| `SITE_ORIGIN`                    | Submissions and browser owner mutations | Exact origin, no path/trailing slash; HTTPS in production                                              |
| `TURNSTILE_HOSTNAME`             | Submissions                             | Exact hostname matching `SITE_ORIGIN`, without scheme/port                                             |
| `TURNSTILE_SECRET_KEY`           | Submissions                             | Secret Siteverify credential, server only                                                              |
| `TURNSTILE_MODE`                 | Submissions                             | `real` normally; explicit `test` only outside production                                               |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Phase 4B widget                         | Public site key used by the visitor widget                                                             |
| `RATE_LIMIT_HMAC_SECRET`         | Submissions                             | Independent random secret, at least 32 characters; use a secret manager to generate it                 |
| `TRUSTED_IP_HEADER`              | Production submissions                  | `x-nf-client-connection-ip` or `cf-connecting-ip`, only after verifying the hosting edge overwrites it |
| `BACKEND_LOCAL_IP`               | Optional local development              | `true` shares a loopback quota locally; ignored in production                                          |

Public-key configuration accepts only `sb_publishable_` keys or legacy JWTs declaring the `anon` role; service keys and authenticated user/owner JWTs are rejected, so a misconfigured public read cannot inherit owner privileges. The gateway still verifies the actual key. No secret uses a `NEXT_PUBLIC_` name. The SDK/configuration is initialized lazily inside server-only modules, so missing variables do not break the portfolio build. Public reads need only the URL/public key; owner requests additionally need a valid owner JWT. Missing submission configuration returns 503.

### Production Turnstile

Create a [Cloudflare Turnstile widget](https://developers.cloudflare.com/turnstile/get-started/) for the exact production hostname, copy its secret into the host's secret manager and use `TURNSTILE_MODE=real`. The browser supplies a fresh token with widget action `contact` or `comment` respectively. The server checks Siteverify success, hostname and action. It sends no raw IP to Siteverify. Failed/replayed tokens are rejected; outages fail closed. The browser widget is mounted only for available visitor forms; its expired/error callbacks clear the token and offer retry. [Server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

### Explicit local CAPTCHA test mode

Use your local or isolated staging Supabase project with `npm run dev -- --hostname 127.0.0.1 --port 3001`. Configure `SITE_ORIGIN=http://localhost:3001`, `TURNSTILE_HOSTNAME=localhost`, `BACKEND_LOCAL_IP=true`, `TURNSTILE_MODE=test` and an actual database URL/keys. Set the secret to Cloudflare's **published dummy pass key**, `1x0000000000000000000000000000000AA`. The widget's dummy site key is `1x00000000000000000000AA`; manual API tests can use `XXXX.DUMMY.TOKEN.XXXX`.

These are public test credentials, not portfolio secrets. Test mode still calls Cloudflare Siteverify and writes to the configured real database; it does not fake persistence or success. Hostname/action matching is relaxed only for this explicit mode because dummy responses differ from a real widget. Production rejects test mode and all three documented dummy secrets. [Cloudflare test credentials](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

`npm run test:turnstile` checks actual network verification using the published pass/fail dummy credentials, without a Supabase project or visitor data. It does **not** prove that your production widget is configured correctly.

## 5. Rate limiting, trusted proxies and privacy

All submission types share database-enforced windows: **5 attempts/IP/hour**, **20/IP/day**, and **200 attempts globally/hour**. Fixed-window expiry starts with the first attempt in each bucket. Failed CAPTCHA attempts consume quota; malformed input/honeypots are rejected before database access. Atomic row-locked UPSERTs coordinate across serverless instances. A denied attempt can conservatively consume an earlier global bucket. Responses use 429 and `Retry-After: 3600`; a daily/global limit can still prevent a later retry.

Only an explicitly trusted single-IP header is accepted; arbitrary `X-Forwarded-For` is never used. Before production, prove the hosting edge overwrites your chosen header and that attackers cannot bypass that edge or reach an unprotected origin. In particular, `cf-connecting-ip` requires a Cloudflare-protected origin. If the platform cannot supply a verified address, add a verified platform adapter before enabling submissions. A missing/invalid trusted address fails closed with 503.

Only HMAC-SHA256 abuse keys are stored, never raw IPs. Keys expire after at most 24 hours, are purged opportunistically, and need an hourly scheduled cleanup for idle periods. In Supabase, enable the Cron integration, then run this as a trusted administrator:

```sql
select cron.schedule(
  'portfolio-abuse-purge', '15 * * * *',
  'select public.purge_submission_limits();'
);
```

Verify the scheduled job succeeds; alternatively call the purge RPC hourly from a trusted server scheduler using its secret credential. No schedule is installed by the migration, and the application cannot purge expired rows during idle time on its own. With an hourly job, expired pseudonymous keys can remain until that job runs. Backups and platform access logs have separate retention policies. HMAC keys are pseudonymous data, not a claim of anonymity; rotating the hash secret resets per-IP quotas. IPv6 privacy-address changes and shared networks limit the precision of IP-based controls.

The application never logs visitor bodies, reply contacts, bearer/CAPTCHA tokens, raw IPs or credentials. No IP hashes are joined to individual messages. Set explicit message/comment retention and deletion policies before launch; archived messages remain stored. Rate limits and CAPTCHA reduce abuse but do not replace platform-level protection against volumetric traffic.

## 6. Test the backend

```bash
npm ci
npm run test:backend
npm run test:turnstile
npm run typecheck
npm run lint
npm run build
```

`test:backend` runs the actual migration in **PGlite (PostgreSQL WASM)**, with real roles, grants, RLS, triggers, foreign keys and quota operations. HTTP tests inject a PostgreSQL repository adapter; production SDK query shapes are tested separately with mocked HTTP. Supabase Auth identities and Siteverify responses are mocked in this suite. These tests do not validate a hosted Supabase deployment, JWT gateway or concurrent connections. They need no real secrets or Docker. The test command's `react-server` condition allows the server-only module boundary in this isolated Node test process.

After setup, use an **isolated** project/dev server to complete live checks (these create real records):

1. POST a valid contact and guestbook/project comment using the example payloads in [API documentation](BACKEND_API.md), actual origin and a valid token. Expect 201; inspect unread/pending defaults as the owner. Use fresh tokens with the real widget, or explicit local dummy mode.
2. Call the Supabase Data API using the public key: contact reads/writes and comment writes must fail. A selected public projection of comments must return approved rows only. Requests for `status`/`updated_at` must fail. Do not use `select('*')` for anonymous comments.
3. Confirm `/api/owner/*` gives 401 without a token, 403 with a verified non-owner or password-only owner token, and private records only with the allowlisted MFA token.
4. Approve one comment and reject another via PATCH. Verify only the approved comment appears publicly and that no private moderation fields appear. Change a message status with the owner token. Test paging across equal timestamps and target isolation.
5. Exceed the shared submission quota and confirm 429 from two server instances against the same database. Verify quota expiry/purge and the actual trusted-header behavior.
6. Verify production Turnstile hostname/action rejection, replay rejection and missing-config behavior. Confirm server/browser bundles contain no secrets before activating forms in Phase 4B.
7. Archive test messages and reject test comments via owner routes, or remove fixtures through the trusted SQL Editor. Owner APIs deliberately do not grant deletion.

See [Phase 4A validation](PHASE_4A_VALIDATION.md) for which checks actually ran. No hosted checks are implied by local passing tests.

## 7. Future Netlify setup

No deployment was created. A future deployment needs Node **22+** (the installed Supabase SDK requires it), normal Next.js server/route support rather than a static export, server-scoped environment secrets, production HTTPS origin, matching Turnstile hostname/site key, the reviewed database migration, allowlisted MFA owner and working scheduled quota cleanup. Keep preview/staging data separate and disable submissions until the preview's origin/CAPTCHA/trusted proxy configuration is verified. Prove Netlify's client-IP header handling before selecting it. Do not put keys in `netlify.toml`, Git, build output, frontend config or shared logs.

Phase 4B includes visitor forms, token-refresh/submission states, escaped comment rendering, owner sign-in/MFA flows and a private inbox/moderation interface. Production configuration and live acceptance remain required before launch.

## Phase 4B owner login and visitor workflow

Apply **both** versioned migrations in order. Existing Phase 4A databases need only `202610110002_owner_login_identity.sql`. New databases need `202610110001_portfolio_backend.sql` first. The second adds an authenticated-only UID membership check for the pre-MFA login/enrollment step. It grants no table access and leaves the original AAL2 owner policies unchanged. Never re-run the initial migration over existing tables. Use `supabase db push` with the correct linked project, or paste each unapplied migration into its SQL Editor as an administrator. If applying manually, keep a private record of applied versions rather than later blindly mixing CLI and manual migration histories.

A publishable/secret API key is not a project management access token or a database password. It cannot apply DDL or change Auth settings. `supabase projects list` must list the intended project before CLI setup; authenticate privately with `supabase login` if necessary. Never apply configuration to a different project just because it is already accessible.

1. Disable new user signups in Auth settings. Provision your chosen owner email/password in Authentication → Users; do not add public registration. Add the **Auth user UUID** to `private.portfolio_owners` using the allowlist SQL above. An email string is never authorization.
2. Set the URL, publishable key and exact `SITE_ORIGIN` privately. For local development use `http://localhost:3001`; production requires HTTPS. The owner login does not need the service secret or Turnstile credentials.
3. Visit `/admin/login`. Enter the provisioned owner credentials. Non-owners are rejected before MFA enrollment or any inbox access.
4. On first login, choose **Set up authenticator**, scan the protected TOTP QR with your authenticator app, and enter its six-digit code. Keep the manual setup key private. An already verified factor must be used; this application cannot replace or disable it using a password-only session. Recover a lost factor through your trusted Supabase administration account.
5. MFA verification upgrades the session to AAL2. `/admin` is checked on the server, and every API read/mutation repeats network identity verification and the UID allowlist/AAL2 check. Overview uses real counts; Recent moderation is the latest `updated_at` for currently approved/rejected comments, **not** an immutable audit trail.
6. Inbox supports unread/read/archived filters and cursor pagination. Reply contact is plain text; it is never executed as HTML or a URI. Archiving asks for confirmation. Comments supports pending/approved/rejected filters and confirms approval/rejection. Approval publishes; rejection keeps the record private. Refresh public comments to see changes.
7. Sign out revokes the current refresh session and clears HttpOnly cookies. If Supabase cannot confirm revocation, cookies are still cleared and the API reports that fact. Supabase access JWTs can remain valid until their normal expiry; configure an appropriate JWT/session lifetime in the dashboard. Do not claim instantaneous revocation of a copied JWT.

Access/refresh tokens remain in HttpOnly, SameSite Strict, path `/` cookies, Secure in production, with an eight-hour cookie lifetime renewed by session operations. They are never put in browser storage, URLs or API response bodies. Auth and cookie-based owner mutations require the exact origin, including logout/refresh. The original network-verified Bearer API remains available for trusted CLI use. Owner pages/API responses are dynamic/no-store and noindex. Expired access sessions refresh through the server once, then retry an owner request; expired/revoked refresh sessions return to sign-in. Supabase's Auth rate limits also apply to password login; monitor/configure them for server-side requests. [Supabase session guidance](https://supabase.com/docs/guides/auth/server-side/advanced-guide), [TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp).

Visitor messages never require login. Success is shown only for the expected `201` persistence acknowledgement. Pending comments are not optimistically added to the public list. Lists use UTC dates and load five approved entries at a time. A failed or ambiguous network request preserves the draft; check connectivity before retrying, since a lost response could follow a successful insert. The busy lock prevents simultaneous submissions in one mounted form, but this phase adds no cross-tab/idempotency-key deduplication.

Turnstile is rendered explicitly, removed on unmount, and refreshed after every attempted submission. Expiry, errors and timeout remove stale tokens. Production never accepts the published test credentials or missing protection. Local test mode uses the documented dummy keys while still calling real Siteverify. Restart after changing configuration; rebuild production bundles after changing `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. The feature endpoint reports safe configuration availability, not hosted health. [Widget lifecycle](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

### Isolated UI test environment

The browser fixture is outside the application and binds only to loopback. It mocks Supabase Auth/PostgREST; it does not claim hosted JWT verification or RLS. No mock submissions are used in the production app. Tests use the public dummy Turnstile verification endpoint and an explicitly simulated browser widget. See `scripts/check-community.cjs` and `tests/fixtures/supabase.cjs`; reproducible commands are in [Phase 4B validation](PHASE_4B_VALIDATION.md). `npm run test:backend` additionally executes all migrations and permission tests in real embedded PostgreSQL and exercises the Auth SDK against the test gateway.

Live acceptance still requires your hosted project: visitor → private unread inbox, pending project/guestbook comment → owner approval → public visibility, rejection privacy, non-owner and AAL1 rejection, MFA login, refresh/logout and production rate-limit/widget/proxy checks. Do this with labeled test entries and trusted owner access, never publish the private inbox or real MFA QR.
