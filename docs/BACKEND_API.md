# Backend API — Phase 4B

All routes use the Node runtime and JSON responses with `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Backend configuration is lazy; the portfolio is usable without it. See [setup](SUPABASE_SETUP.md) before connecting an external project.

## Anonymous submissions

`POST /api/contact`:

```json
{
  "name": "Visitor name",
  "replyContact": "optional reply address or contact method",
  "message": "A private message of at least ten characters.",
  "website": "",
  "turnstileToken": "FRESH_WIDGET_TOKEN_WITH_CONTACT_ACTION"
}
```

`POST /api/comments` (guestbook):

```json
{
  "displayName": "Visitor name",
  "message": "Portfolio feedback",
  "target": { "kind": "guestbook" },
  "website": "",
  "turnstileToken": "FRESH_WIDGET_TOKEN_WITH_COMMENT_ACTION"
}
```

For projects use `"target": { "kind": "project", "projectId": "sat-chi" }`. Valid IDs are `sat-chi`, `huquq-test`, `sme-financial-assistant`, `telegram-media-downloader`, `ielts-progress-tracker`. A project target must contain its ID; a guestbook target must not contain one.

Both endpoints require `Content-Type: application/json` and an exact `Origin` matching `SITE_ORIGIN`. No registration, cookies, bearer token or Supabase Auth account is required. Zod rejects unknown fields, including client-supplied status/IDs/timestamps. `website` is an optional honeypot, empty by default; any nonempty value is rejected. Blank required fields and prohibited control characters fail validation. Names are trimmed and limited to 2–80 characters, reply contact to 254, contact message to 10–4000, comment text to 3–2000. Blank optional reply contact becomes SQL NULL. JSON bodies are capped at 24 KiB while streaming, even without Content-Length; stalled reads time out after 5 seconds. Platform ingress limits are an additional boundary.

Success is returned only after persistence: contact `201 { "status": "received" }`; comment `201 { "status": "pending" }`. No message identifier, inbox details, visitor contact or moderation metadata is returned publicly. Database defaults set unread/pending. Text is stored as plain text. JSON output escapes HTML-sensitive characters; The frontend renders through text nodes/React children and never raw HTML or unsanitized Markdown. Approval does not make HTML trustworthy.

## Public comment retrieval

`GET /api/comments?target_type=guestbook&limit=20`

`GET /api/comments?target_type=project&target_id=sat-chi&limit=20`

```json
{
  "items": [
    {
      "id": "UUID",
      "displayName": "Visitor name",
      "message": "Approved plain text",
      "target": { "kind": "guestbook" },
      "createdAt": "ISO_TIMESTAMP"
    }
  ],
  "nextCursor": null
}
```

Only approved records are visible because this repository uses a public-key client subject to RLS, with explicit column selection. Anonymous users cannot select `status` or `updated_at`, and the SDK intentionally does not filter by an ungranted column. Project/guestbook filtering is mandatory. Public output matches the existing camelCase community contract. No display name is an authenticated identity.

Pagination is keyset-based: stable ascending `(created_at,id)` order, a default page of 20, maximum 50. When `nextCursor` is present, pass it as `cursor` with the same target/limit. Cursor inputs are bounded and validated UUID/ISO values before building database filters. Empty, malformed or unrelated-target cursors are not an authorization mechanism; target/RLS filtering still controls the result. No total count or private fields are exposed.

## Owner requests

Every owner route verifies Supabase identity plus the database UID allowlist and MFA (`aal2`). The browser uses HttpOnly session cookies; it never sends/stores a bearer token in JavaScript. Cookie-based mutations require an exact Origin. The original `Authorization: Bearer <verified owner access token>` path remains available to CLI clients, which can omit Origin. No cross-origin CORS permission is granted. Authorization precedes private access; the server-rendered `/admin` page also gates access.

| Method and route                              | Operation                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GET /api/owner/inbox?limit=20&status=unread` | Private inbox; optional unread/read/archived filter; descending `(created_at,id)` pagination |
| `GET /api/owner/comments?limit=20`            | Optional status: `pending`, `approved`, `rejected` (default pending); ascending `(created_at,id)` pagination |
| `PATCH /api/owner/inbox/UUID`                 | JSON `{ "status": "unread" }`, `read` or `archived`                                          |
| `PATCH /api/owner/comments/UUID`              | JSON `{ "status": "approved" }` or `rejected`                                                |

Owner lists return `items` and `nextCursor` using private database field names. Inbox fields: `id,name,reply_contact,message,status,created_at`. Moderation fields: `id,target_type,target_id,author_name,content,status,created_at,updated_at`. The timestamp trigger updates `updated_at` on moderation. Message PATCH returns `id,status`; comment PATCH returns `id,status,updated_at`. Owner grants allow status changes only, with no visitor-content editing, new-row insertion or deletion. Re-moderation by ID is allowed. A missing row returns 404 to an authorized owner.

## Browser session and overview endpoints

`GET /api/community/config` returns `{reads,submissions,siteKey}`: configuration availability only, no secrets or fake persistence. The site key is public; unavailable submission configuration yields null. Backend outages are still reported by the actual request.

`GET /api/owner/overview` returns `{unread,pending,approved,rejected,recent}` after AAL2 authorization. Counts are exact database values. Recent entries are up to eight currently approved/rejected records in descending `(updated_at,id)` order, projected to ID, author, target, status and timestamp. This is not an append-only audit log.

All Auth routes are POST, require JSON and exact Origin, reject unknown fields, and return no access/refresh tokens:

| Route               | Body               | Response                                                                                        |
| ------------------- | ------------------ | ----------------------------------------------------------------------------------------------- |
| `/api/auth/login`   | `{email,password}` | `{state:"mfa",factorId?,needsEnrollment?}` or `{state:"owner"}`                                 |
| `/api/auth/session` | `{}`               | Verified owner/MFA stage; can refresh expired cookies                                           |
| `/api/auth/enroll`  | `{}`               | Protected `{factorId,qr,secret}` for first-time TOTP setup only                                 |
| `/api/auth/verify`  | `{factorId,code}`  | `{state:"owner"}` only after valid TOTP and full AAL2 authorization                             |
| `/api/auth/refresh` | `{}`               | Verified owner/MFA stage with renewed HttpOnly cookies                                          |
| `/api/auth/logout`  | `{}`               | `{state:"signed_out",revoked:boolean}`; browser cookies always cleared after an allowed request |

Login/enrollment require the UID membership RPC, which is separate from private-data authorization. Owner APIs never use this weaker pre-MFA check. Invalid credentials are generic 401, invalid codes 400, existing verified factor enrollment 409 (`mfa_already_enrolled`), provider throttling 429, and unavailable configuration/provider 503. Password length is bounded to 256, email to 254, factor IDs UUID and TOTP exactly six digits. There is no signup or password-recovery API; provisioning/recovery remains trusted project administration.

## Error contract

Errors are `{ "error": "SAFE_CODE" }`; no SQL detail, user input, token, credential or stack is returned or logged.

| HTTP status | Meaning                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| 400         | `invalid_input` or `verification_failed`                                                             |
| 401         | `authentication_required` (missing/invalid verified identity)                                        |
| 403         | `owner_access_required` or `origin_not_allowed`                                                      |
| 404         | `not_found` for an authorized owner mutation                                                         |
| 408         | `request_timeout` for a stalled JSON body                                                            |
| 413         | `request_too_large`                                                                                  |
| 415         | `json_required`                                                                                      |
| 429         | `rate_limit_exceeded`, with `Retry-After: 3600`                                                      |
| 503         | `temporarily_unavailable` (missing/unsafe configuration, DB/Auth/CAPTCHA outage or unexpected error) |

The Next.js router rejects unsupported methods. Public routes have no direct browser database write access. The reusable dependencies in `src/lib/backend/handlers.ts` allow database-backed HTTP tests without coupling tests to deployed credentials. `runtime.ts` wires real Supabase clients, network identity verification and Siteverify. All production data access is server-only, per-request, with scoped JWTs and bounded outbound request timeouts.
