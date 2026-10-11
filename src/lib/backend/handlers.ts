import "server-only";
import type {
  OwnerRepository,
  PublicRepository,
  SubmissionRepository,
} from "./repository";
import { ApiError } from "./errors";
import {
  bearerToken,
  endpoint,
  jsonResponse,
  pageQuery,
  publicTarget,
  readBody,
} from "./http";
import {
  commentSchema,
  contactSchema,
  encodeCursor,
  idSchema,
  messageStatusSchema,
  moderationSchema,
} from "./validation";

export interface BackendDependencies {
  submissions(): SubmissionRepository;
  publicComments(): PublicRepository;
  owner(token: string): Promise<OwnerRepository>;
  origin(request: Request, required: boolean): void;
  protect(
    request: Request,
    token: string,
    action: "contact" | "comment",
  ): Promise<void>;
}
function pageResponse<T extends { id: string; created_at: string }>(
  rows: T[],
  limit: number,
  map: (row: T) => unknown = (row) => row,
) {
  const visible = rows.slice(0, limit);
  return jsonResponse({
    items: visible.map(map),
    nextCursor:
      rows.length > limit ? encodeCursor(visible[visible.length - 1]) : null,
  });
}
function uuid(id: string) {
  if (!idSchema.safeParse(id).success) throw new ApiError(400, "invalid_input");
  return id;
}
export function createHandlers(deps: BackendDependencies) {
  return {
    submitContact: (request: Request) =>
      endpoint(async () => {
        const input = await readBody(request, contactSchema);
        if (input.website) throw new ApiError(400, "invalid_input");
        deps.origin(request, true);
        await deps.protect(request, input.turnstileToken, "contact");
        await deps.submissions().contact(input);
        return jsonResponse({ status: "received" }, 201);
      }),
    submitComment: (request: Request) =>
      endpoint(async () => {
        const input = await readBody(request, commentSchema);
        if (input.website) throw new ApiError(400, "invalid_input");
        deps.origin(request, true);
        await deps.protect(request, input.turnstileToken, "comment");
        await deps.submissions().comment(input);
        return jsonResponse({ status: "pending" }, 201);
      }),
    approvedComments: (request: Request) =>
      endpoint(async () => {
        const target = publicTarget(request),
          page = pageQuery(request);
        const rows = await deps.publicComments().comments(target, page);
        return pageResponse(rows, page.limit, (row) => ({
          id: row.id,
          displayName: row.author_name,
          message: row.content,
          target,
          createdAt: row.created_at,
        }));
      }),
    inbox: (request: Request) =>
      endpoint(async () => {
        const owner = await deps.owner(bearerToken(request));
        const status = new URL(request.url).searchParams.get("status");
        const result =
          status === null
            ? undefined
            : messageStatusSchema.safeParse({ status });
        if (result && !result.success) throw new ApiError(400, "invalid_input");
        const page = pageQuery(request, true);
        return pageResponse(
          await owner.inbox(page, result?.data?.status),
          page.limit,
        );
      }),
    pendingComments: (request: Request) =>
      endpoint(async () => {
        const owner = await deps.owner(bearerToken(request)),
          page = pageQuery(request);
        return pageResponse(await owner.pending(page), page.limit);
      }),
    moderateComment: (request: Request, id: string) =>
      endpoint(async () => {
        const owner = await deps.owner(bearerToken(request));
        deps.origin(request, false);
        const input = await readBody(request, moderationSchema);
        return jsonResponse(await owner.moderate(uuid(id), input.status));
      }),
    updateMessage: (request: Request, id: string) =>
      endpoint(async () => {
        const owner = await deps.owner(bearerToken(request));
        deps.origin(request, false);
        const input = await readBody(request, messageStatusSchema);
        return jsonResponse(await owner.messageStatus(uuid(id), input.status));
      }),
  };
}
