import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { createHandlers } from "../../src/lib/backend/handlers";
import { authorizeOwner } from "../../src/lib/backend/auth";
import {
  checkOrigin,
  protectSubmission,
} from "../../src/lib/backend/protection";
import {
  submissionConfig,
  TEST_TURNSTILE_SECRETS,
} from "../../src/lib/backend/config";
import type {
  OwnerRepository,
  Page,
  SubmissionRepository,
} from "../../src/lib/backend/repository";
import type {
  CommentRow,
  MessageRow,
  PublicCommentRow,
} from "../../src/lib/backend/database.types";

export const OWNER = "11111111-1111-4111-8111-111111111111";
export const OTHER = "22222222-2222-4222-8222-222222222222";
export const ORIGIN = "http://localhost:3001";
export const localEnv = {
  NODE_ENV: "test",
  SUPABASE_URL: "http://localhost:54321",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test_fixture",
  SUPABASE_SERVICE_ROLE_KEY: "test-server-key",
  SITE_ORIGIN: ORIGIN,
  TURNSTILE_HOSTNAME: "localhost",
  TURNSTILE_SECRET_KEY: TEST_TURNSTILE_SECRETS[0],
  TURNSTILE_MODE: "test",
  RATE_LIMIT_HMAC_SECRET: "local-test-hmac-secret-at-least-32-characters",
  BACKEND_LOCAL_IP: "true",
} as NodeJS.ProcessEnv;
export const config = submissionConfig(localEnv);
export async function setupDatabase() {
  const db = new PGlite();
  // Supabase's Auth/role boundary is simulated here; the migration and RLS run
  // in real PostgreSQL. This is not a live GoTrue or PostgREST integration test.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
    create function auth.uid() returns uuid language sql stable as $$ select (auth.jwt()->>'sub')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('${OWNER}'), ('${OTHER}');
    -- Model Supabase's broad table defaults so the migration must revoke them.
    alter default privileges grant all on tables to anon, authenticated, service_role;
  `);
  await db.exec(
    await readFile(
      new URL(
        "../../supabase/migrations/202610110001_portfolio_backend.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.query("insert into private.portfolio_owners(user_id) values ($1)", [
    OWNER,
  ]);
  return db;
}
export async function roleQuery<T>(
  db: PGlite,
  role: "anon" | "authenticated" | "service_role",
  sql: string,
  values: unknown[] = [],
  claims = {},
) {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(claims),
    ]);
    const result = await tx.query(sql, values);
    return JSON.parse(JSON.stringify(result.rows)) as T[];
  });
}
function ordering(page: Page, values: unknown[]) {
  let where = "";
  if (page.cursor) {
    values.push(page.cursor.createdAt, page.cursor.id);
    where = ` and (created_at,id) ${page.descending ? "<" : ">"} ($${values.length - 1}::timestamptz,$${values.length}::uuid)`;
  }
  values.push(page.limit + 1);
  return `${where} order by created_at ${page.descending ? "desc" : "asc"}, id ${page.descending ? "desc" : "asc"} limit $${values.length}`;
}
export function databaseHandlers(db: PGlite) {
  let verificationSuccess = true;
  const submissions: SubmissionRepository = {
    async contact(input) {
      await roleQuery(
        db,
        "service_role",
        "insert into public.contact_messages(name,reply_contact,message) values ($1,$2,$3)",
        [input.name, input.replyContact || null, input.message],
      );
    },
    async comment(input) {
      await roleQuery(
        db,
        "service_role",
        "insert into public.comments(target_type,target_id,author_name,content) values ($1,$2,$3,$4)",
        [
          input.target.kind,
          input.target.kind === "project" ? input.target.projectId : null,
          input.displayName,
          input.message,
        ],
      );
    },
    async consumeLimit(hash) {
      const rows = await roleQuery<{ allowed: boolean }>(
        db,
        "service_role",
        "select public.consume_submission_limit($1) as allowed",
        [hash],
      );
      return rows[0].allowed;
    },
  };
  const makeOwner = (claims: {
    sub: string;
    aal: string;
  }): OwnerRepository => ({
    async inbox(page, status) {
      const values: unknown[] = [],
        filter = status ? " and status=$1" : "";
      if (status) values.push(status);
      return roleQuery<MessageRow>(
        db,
        "authenticated",
        `select * from public.contact_messages where true${filter}${ordering(page, values)}`,
        values,
        claims,
      );
    },
    async pending(page) {
      const values: unknown[] = [];
      return roleQuery<CommentRow>(
        db,
        "authenticated",
        `select * from public.comments where status='pending'${ordering(page, values)}`,
        values,
        claims,
      );
    },
    async moderate(id, status) {
      const rows = await roleQuery<CommentRow>(
        db,
        "authenticated",
        "update public.comments set status=$1 where id=$2 returning id,status,updated_at",
        [status, id],
        claims,
      );
      if (!rows[0]) {
        const { ApiError } = await import("../../src/lib/backend/errors");
        throw new ApiError(404, "not_found");
      }
      return rows[0];
    },
    async messageStatus(id, status) {
      const rows = await roleQuery<MessageRow>(
        db,
        "authenticated",
        "update public.contact_messages set status=$1 where id=$2 returning id,status",
        [status, id],
        claims,
      );
      if (!rows[0]) {
        const { ApiError } = await import("../../src/lib/backend/errors");
        throw new ApiError(404, "not_found");
      }
      return rows[0];
    },
  });
  const handlers = createHandlers({
    submissions: () => submissions,
    publicComments: () => ({
      async comments(target, page) {
        const values: unknown[] = [target.kind];
        let filter = "target_id is null";
        if (target.kind === "project") {
          values.push(target.projectId);
          filter = "target_id=$2";
        }
        return roleQuery<PublicCommentRow>(
          db,
          "anon",
          `select id,target_type,target_id,author_name,content,created_at from public.comments where target_type=$1 and ${filter}${ordering(page, values)}`,
          values,
        );
      },
    }),
    async owner(token) {
      const claims = {
        sub: token === "nonowner" ? OTHER : OWNER,
        aal: token === "owner-aal1" ? "aal1" : "aal2",
      };
      await authorizeOwner(token, {
        async getUser() {
          return {
            data: { user: token === "invalid" ? null : { id: claims.sub } },
            error: null,
          };
        },
        async isOwner() {
          const rows = await roleQuery<{ allowed: boolean }>(
            db,
            "authenticated",
            "select public.is_portfolio_owner() as allowed",
            [],
            claims,
          );
          return { data: rows[0].allowed, error: null };
        },
      });
      return makeOwner(claims);
    },
    origin: (request, required) => checkOrigin(request, required, ORIGIN),
    protect: (request, token, action) =>
      protectSubmission(
        request,
        token,
        action,
        config,
        (hash) => submissions.consumeLimit(hash),
        async () =>
          new Response(JSON.stringify({ success: verificationSuccess })),
      ),
  });
  return {
    handlers,
    setCaptcha: (success: boolean) => {
      verificationSuccess = success;
    },
    resetLimits: () => db.exec("delete from private.submission_limits"),
  };
}
export function request(
  path: string,
  body?: unknown,
  token?: string,
  method = body ? "POST" : "GET",
) {
  return new Request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Origin: ORIGIN,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
