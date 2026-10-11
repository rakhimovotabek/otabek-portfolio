import "server-only";
import { z } from "zod";
import { publicConfig } from "@/lib/backend/config";
import { databaseClient } from "@/lib/backend/repository";
import { ApiError, unavailable } from "@/lib/backend/errors";
import { authorizeOwner } from "@/lib/backend/auth";

export type Tokens = { access_token: string; refresh_token: string };
export type AuthState = {
  state: "owner" | "mfa";
  factorId?: string;
  needsEnrollment?: boolean;
};
export type AuthResult = {
  session?: Tokens;
  body:
    | AuthState
    | { factorId: string; qr: string; secret: string }
    | { state: "signed_out"; revoked: boolean };
};
export const authActions = [
  "login",
  "session",
  "enroll",
  "verify",
  "refresh",
  "logout",
] as const;
export type AuthAction = (typeof authActions)[number];
const schemas = {
  login: z
    .object({ email: z.email().max(254), password: z.string().min(1).max(256) })
    .strict(),
  verify: z
    .object({ factorId: z.uuid(), code: z.string().regex(/^\d{6}$/) })
    .strict(),
  session: z.object({}).strict(),
  enroll: z.object({}).strict(),
  refresh: z.object({}).strict(),
  logout: z.object({}).strict(),
};
export function authSchema(action: AuthAction) {
  return schemas[action];
}
function authError(error: { status?: number } | null, verification = false) {
  if (!error) return;
  if (error.status === 429) throw new ApiError(429, "too_many_attempts");
  if (error.status && error.status < 500)
    throw new ApiError(
      verification ? 400 : 401,
      verification ? "verification_failed" : "authentication_required",
    );
  throw unavailable();
}
export function authConfig() {
  const config = publicConfig();
  let origin: URL;
  try {
    origin = new URL(process.env.SITE_ORIGIN ?? "");
  } catch {
    throw unavailable();
  }
  if (
    origin.origin !== process.env.SITE_ORIGIN ||
    (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
  )
    throw unavailable();
  return config;
}
export async function performAuth(
  action: AuthAction,
  input: unknown,
  tokens?: Tokens,
): Promise<AuthResult> {
  const config = authConfig();
  const client = databaseClient(config.url, config.key);
  let session: Tokens;
  if (action === "login") {
    const body = schemas.login.parse(input);
    const result = await client.auth.signInWithPassword(body);
    authError(result.error);
    if (!result.data.session)
      throw new ApiError(401, "authentication_required");
    session = result.data.session;
  } else {
    if (!tokens) {
      if (action === "logout")
        return { body: { state: "signed_out", revoked: true } };
      throw new ApiError(401, "authentication_required");
    }
    const result =
      action === "refresh"
        ? await client.auth.refreshSession({
            refresh_token: tokens.refresh_token,
          })
        : await client.auth.setSession(tokens);
    if (action === "logout") {
      // Always clear browser cookies in the route, even if remote revocation fails.
      if (result.error)
        return { body: { state: "signed_out", revoked: false } };
      const logout = await client.auth.signOut({ scope: "local" });
      return { body: { state: "signed_out", revoked: !logout.error } };
    }
    authError(result.error);
    if (!result.data.session)
      throw new ApiError(401, "authentication_required");
    session = result.data.session;
  }
  // Network identity + database allowlist, including before MFA enrollment.
  try {
    await authorizeOwner(session.access_token, {
      getUser: (token) => client.auth.getUser(token),
      isOwner: async () => client.rpc("is_portfolio_owner_identity"),
    });
  } catch (error) {
    if (action === "login") await client.auth.signOut({ scope: "local" });
    throw error;
  }
  const factors = await client.auth.mfa.listFactors();
  authError(factors.error);
  if (!factors.data) throw unavailable();
  if (action === "enroll") {
    // Existing verified MFA must be used; never replace it via an AAL1 session.
    if (factors.data.totp.length)
      throw new ApiError(409, "mfa_already_enrolled");
    for (const factor of factors.data.all) {
      if (factor.factor_type === "totp" && factor.status === "unverified") {
        const result = await client.auth.mfa.unenroll({ factorId: factor.id });
        authError(result.error);
      }
    }
    const result = await client.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Portfolio owner",
      issuer: "Portfolio",
    });
    authError(result.error);
    if (!result.data) throw unavailable();
    return {
      session,
      body: {
        factorId: result.data.id,
        qr: result.data.totp.qr_code.replace(
          /^data:image\/svg\+xml;utf-8,/,
          "",
        ),
        secret: result.data.totp.secret,
      },
    };
  }
  if (action === "verify") {
    const body = schemas.verify.parse(input);
    if (
      !factors.data.all.some(
        (f) => f.id === body.factorId && f.factor_type === "totp",
      )
    )
      throw new ApiError(400, "verification_failed");
    const result = await client.auth.mfa.challengeAndVerify(body);
    authError(result.error, true);
    if (!result.data) throw unavailable();
    session = result.data;
    await authorizeOwner(session.access_token, {
      getUser: (token) => client.auth.getUser(token),
      isOwner: async () => client.rpc("is_portfolio_owner"),
    });
    return { session, body: { state: "owner" } };
  }
  const owner = await client.rpc("is_portfolio_owner");
  if (owner.error) throw unavailable();
  return {
    session,
    body:
      owner.data === true
        ? { state: "owner" }
        : {
            state: "mfa",
            factorId: factors.data.totp[0]?.id,
            needsEnrollment: factors.data.totp.length === 0,
          },
  };
}
