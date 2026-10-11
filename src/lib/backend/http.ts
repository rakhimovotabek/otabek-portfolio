import type { z } from "zod";
import { ApiError } from "./errors";
import { decodeCursor, type Cursor, targetSchema } from "./validation";

export const MAX_BODY_BYTES = 24 * 1024;
export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
) {
  // JSON + nosniff, and escaping for safe embedding. Phase 4B must render text,
  // never innerHTML/unsanitized Markdown, even when a comment was approved.
  const body = JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...Object.fromEntries(new Headers(extraHeaders)),
    },
  });
}
export async function endpoint(task: () => Promise<Response>) {
  try {
    return await task();
  } catch (error) {
    const known = error instanceof ApiError;
    return jsonResponse(
      { error: known ? error.code : "temporarily_unavailable" },
      known ? error.status : 503,
      known && error.status === 429 ? { "Retry-After": "3600" } : undefined,
    );
  }
}
export async function readBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new ApiError(415, "json_required");
  const length = request.headers.get("content-length");
  if (
    length !== null &&
    (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)
  )
    throw new ApiError(413, "request_too_large");
  if (!request.body) throw new ApiError(400, "invalid_input");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new ApiError(408, "request_timeout"));
      void reader.cancel().catch(() => {});
    }, 5000);
  });
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), expired]);
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new ApiError(413, "request_too_large");
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    let input: unknown;
    try {
      input = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      throw new ApiError(400, "invalid_input");
    }
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new ApiError(400, "invalid_input");
    return parsed.data;
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}
export function bearerToken(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (header.length > 4096 || !/^Bearer [A-Za-z0-9._-]+$/i.test(header))
    throw new ApiError(401, "authentication_required");
  return header.slice(7);
}
export function pageQuery(
  request: Request,
  descending = false,
): { limit: number; cursor?: Cursor; descending: boolean } {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? 20);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50)
    throw new ApiError(400, "invalid_input");
  try {
    return { limit, cursor: decodeCursor(params.get("cursor")), descending };
  } catch {
    throw new ApiError(400, "invalid_input");
  }
}
export function publicTarget(request: Request) {
  const params = new URL(request.url).searchParams;
  const input =
    params.get("target_type") === "project"
      ? { kind: "project", projectId: params.get("target_id") }
      : { kind: params.get("target_type") };
  const result = targetSchema.safeParse(input);
  if (
    !result.success ||
    (result.data.kind === "guestbook" && params.has("target_id"))
  )
    throw new ApiError(400, "invalid_input");
  return result.data;
}
