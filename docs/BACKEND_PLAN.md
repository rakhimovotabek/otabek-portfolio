# Future backend plan — Phase 4 only

This is a design proposal, not a database migration or an implemented feature. No Supabase project, SDK, credentials, routes, forms, or endpoints exist in Phase 2. Disabled visual field previews exist, without submission or persistence.

## Planned records

- `inbox_messages`: UUID, name, optional reply contact, message, created_at. Owner-private only. No anonymous/browser read, list, update, or delete policy.
- `comments`: UUID, display_name, message, target_kind (`project` or `guestbook`), project_id (nullable only for guestbook), moderation_status (default `pending`), created_at, reviewed_at. A database CHECK must enforce the target relationship. Project identifiers must match central content or a later projects table.
- Public comment output includes only approved display name, text, target, identifier, and date. Moderation metadata and spam information are never public.

## Request boundary

Anonymous visitors submit through server-only handlers without registering. Validate and normalize every input on the server and apply database constraints as defense in depth. Proposed limits, to confirm during Phase 4: name 2–80 characters, optional reply contact up to 254, message 10–4000, public comment 3–2000. Reject unexpected fields and invalid project IDs. Render comments as escaped plain text; no HTML or raw markdown. Never use dangerouslySetInnerHTML for visitor content.

Verify Cloudflare Turnstile tokens server-side and check expected hostname/action. Add durable server-side rate limiting before database writes; process-local counters are insufficient for multi-instance/serverless deployments. Define per-IP and broader abuse limits, retention, trusted proxy handling, and an appropriate privacy-preserving abuse key. Reject repeated/spam payloads. Return accessible submission statuses without disclosing internals. A visitor cannot set moderation status.

## Access and moderation

Enable Supabase RLS on every table before enabling traffic. Deny anonymous reads and direct writes to the inbox. Deny anonymous comment writes; use validated server handlers. If direct public comment reads are used, enforce an approved-only SELECT policy, and expose a view/output that omits private fields. Test policies with anonymous, authenticated non-admin, and owner sessions.

The service-role credential belongs exclusively in server deployment secrets, never NEXT_PUBLIC variables, browser imports, logs, or Git. Supabase user authentication is for the owner review interface only: use a verified owner allowlist, server-side authorization on every review action, secure session cookies, and MFA. Hiding an admin link is not authorization. Provide a private inbox and approve/reject queue; publication must be an explicit owner action.

## Deployment requirements

Use a Node-compatible Next.js host such as a managed Next.js platform or Node container with HTTPS. The portfolio is a normal Next.js application; no deployment provider is configured. Phase 4 needs a Supabase project/region, migrations reviewed before application, RLS policy tests, backup/restore procedure, admin access, Turnstile site/secret keys, and durable rate-limit storage. Keep staging and production separate. Set server-side secrets in the host secret manager and keep `.env*` untracked.

Choose and verify hosting/database regions, logging, retention/deletion policy, privacy notice, spam handling and owner notification method before launch. Do not log message bodies, contact details, or tokens. Test anonymous submissions and private inbox isolation before enabling forms. No admin credentials or social/email placeholders are published now.
