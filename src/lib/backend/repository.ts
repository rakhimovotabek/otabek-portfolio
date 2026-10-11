import "server-only";
import { createClient } from "@supabase/supabase-js";
import type {
  Database,
  CommentRow,
  MessageRow,
  PublicCommentRow,
} from "./database.types";
import type {
  CommentInput,
  ContactInput,
  Cursor,
  MessageStatus,
  Moderation,
  Target,
} from "./validation";
import { ApiError, unavailable } from "./errors";

export type OwnerOverview = {
  unread: number;
  pending: number;
  approved: number;
  rejected: number;
  recent: Pick<
    CommentRow,
    "id" | "status" | "author_name" | "target_type" | "target_id" | "updated_at"
  >[];
};
export type Page = { limit: number; cursor?: Cursor; descending: boolean };
export interface SubmissionRepository {
  contact(input: ContactInput): Promise<void>;
  comment(input: CommentInput): Promise<void>;
  consumeLimit(hash: string): Promise<boolean>;
}
export interface PublicRepository {
  comments(target: Target, page: Page): Promise<PublicCommentRow[]>;
}
export interface OwnerRepository {
  inbox(page: Page, status?: MessageStatus): Promise<MessageRow[]>;
  pending(page: Page): Promise<CommentRow[]>;
  comments(page: Page, status: CommentRow["status"]): Promise<CommentRow[]>;
  overview(): Promise<OwnerOverview>;
  moderate(
    id: string,
    status: Moderation,
  ): Promise<Pick<CommentRow, "id" | "status" | "updated_at">>;
  messageStatus(
    id: string,
    status: MessageStatus,
  ): Promise<Pick<MessageRow, "id" | "status">>;
}
export function databaseClient(url: string, key: string, token?: string) {
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(8000)])
            : AbortSignal.timeout(8000),
        }),
    },
  });
}
type Client = ReturnType<typeof databaseClient>;
function ensure<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw unavailable();
  return result.data;
}
// Cursor values are schema-validated ISO dates and UUIDs, never raw filter text.
function cursorFilter(page: Page) {
  if (!page.cursor) return;
  const op = page.descending ? "lt" : "gt";
  return `created_at.${op}.${page.cursor.createdAt},and(created_at.eq.${page.cursor.createdAt},id.${op}.${page.cursor.id})`;
}
export function submissionRepository(client: Client): SubmissionRepository {
  return {
    async contact(input) {
      ensure(
        await client.from("contact_messages").insert({
          name: input.name,
          reply_contact: input.replyContact || null,
          message: input.message,
        }),
      );
    },
    async comment(input) {
      ensure(
        await client.from("comments").insert({
          target_type: input.target.kind,
          target_id:
            input.target.kind === "project" ? input.target.projectId : null,
          author_name: input.displayName,
          content: input.message,
        }),
      );
    },
    async consumeLimit(hash) {
      const allowed = ensure(
        await client.rpc("consume_submission_limit", { p_subject_hash: hash }),
      );
      if (typeof allowed !== "boolean") throw unavailable();
      return allowed;
    },
  };
}
export function publicRepository(client: Client): PublicRepository {
  return {
    async comments(target, page) {
      // RLS enforces approved-only visibility. The anon role cannot select status.
      let query = client
        .from("comments")
        .select("id,target_type,target_id,author_name,content,created_at")
        .eq("target_type", target.kind);
      query =
        target.kind === "project"
          ? query.eq("target_id", target.projectId)
          : query.is("target_id", null);
      const filter = cursorFilter(page);
      if (filter) query = query.or(filter);
      return (
        ensure(
          await query
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .limit(page.limit + 1),
        ) ?? []
      );
    },
  };
}
export function ownerRepository(client: Client): OwnerRepository {
  return {
    async inbox(page, status) {
      let query = client
        .from("contact_messages")
        .select("id,name,reply_contact,message,status,created_at");
      if (status) query = query.eq("status", status);
      const filter = cursorFilter(page);
      if (filter) query = query.or(filter);
      return (
        ensure(
          await query
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(page.limit + 1),
        ) ?? []
      );
    },
    async pending(page) {
      return this.comments(page, "pending");
    },
    async comments(page, status) {
      let query = client
        .from("comments")
        .select(
          "id,target_type,target_id,author_name,content,status,created_at,updated_at",
        )
        .eq("status", status);
      const filter = cursorFilter(page);
      if (filter) query = query.or(filter);
      return (
        ensure(
          await query
            .order("created_at", { ascending: true })
            .order("id", { ascending: true })
            .limit(page.limit + 1),
        ) ?? []
      );
    },
    async overview() {
      const results = await Promise.all([
        client
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "unread"),
        ...(["pending", "approved", "rejected"] as const).map((status) =>
          client
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("status", status),
        ),
      ]);
      for (const result of results)
        if (result.error || result.count === null) throw unavailable();
      const recent =
        ensure(
          await client
            .from("comments")
            .select("id,status,author_name,target_type,target_id,updated_at")
            .neq("status", "pending")
            .order("updated_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(8),
        ) ?? [];
      return {
        unread: results[0].count!,
        pending: results[1].count!,
        approved: results[2].count!,
        rejected: results[3].count!,
        recent,
      };
    },
    async moderate(id, status) {
      const row = ensure(
        await client
          .from("comments")
          .update({ status })
          .eq("id", id)
          .select("id,status,updated_at")
          .maybeSingle(),
      );
      if (!row) throw new ApiError(404, "not_found");
      return row;
    },
    async messageStatus(id, status) {
      const row = ensure(
        await client
          .from("contact_messages")
          .update({ status })
          .eq("id", id)
          .select("id,status")
          .maybeSingle(),
      );
      if (!row) throw new ApiError(404, "not_found");
      return row;
    },
  };
}
