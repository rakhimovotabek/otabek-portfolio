import "server-only";
import { ApiError } from "@/lib/backend/errors";
import { endpoint, jsonResponse, readBody } from "@/lib/backend/http";
import {
  authActions,
  authSchema,
  type AuthAction,
  type AuthResult,
  type Tokens,
} from "./gateway";
export const ACCESS_COOKIE = "portfolio-access";
export const REFRESH_COOKIE = "portfolio-refresh";
export const cookieOptions = (production: boolean) => ({
  httpOnly: true,
  secure: production,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
});
export interface AuthCookies {
  read(): Tokens | undefined;
  save(tokens: Tokens): void;
  clear(): void;
}
export function createAuthHandler(deps: {
  cookies: AuthCookies;
  origin(request: Request, required: boolean): void;
  perform(
    action: AuthAction,
    input: unknown,
    tokens?: Tokens,
  ): Promise<AuthResult>;
}) {
  return (request: Request, action: string) =>
    endpoint(async () => {
      if (!(authActions as readonly string[]).includes(action))
        throw new ApiError(404, "not_found");
      deps.origin(request, true);
      const name = action as AuthAction;
      const input = await readBody<unknown>(request, authSchema(name));
      try {
        const result = await deps.perform(name, input, deps.cookies.read());
        if (result.session) deps.cookies.save(result.session);
        return jsonResponse(result.body);
      } catch (error) {
        if (name === "logout")
          return jsonResponse({ state: "signed_out", revoked: false });
        if (
          name === "login" ||
          (error instanceof ApiError &&
            (error.status === 401 || error.status === 403))
        )
          deps.cookies.clear();
        throw error;
      } finally {
        if (name === "logout") deps.cookies.clear();
      }
    });
}
