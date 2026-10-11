import "server-only";
import { authCookies } from "./cookies";
import { checkOrigin } from "@/lib/backend/protection";
import { endpoint } from "@/lib/backend/http";
export function ownerRequest(
  request: Request,
  handler: (request: Request) => Promise<Response>,
) {
  return endpoint(async () => {
    if (request.headers.has("authorization")) return handler(request); // Existing verified Bearer/CLI path.
    const session = (await authCookies()).read();
    if (!session) return handler(request); // Existing handler returns 401.
    if (request.method !== "GET") checkOrigin(request, true);
    return handler(requestWithToken(request, session.access_token));
  });
}
export function requestWithToken(request: Request, token: string) {
  const headers = new Headers(request.headers);
  headers.set("authorization", `Bearer ${token}`);
  // Construct from URL: Next's incoming Request can differ from Node's
  // Request class. Preserve streaming bodies and their existing size cap.
  const init: RequestInit & { duplex: "half" } = {
    method: request.method,
    headers,
    body: request.body,
    duplex: "half",
  };
  return new Request(request.url, init);
}
