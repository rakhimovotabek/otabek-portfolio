import "server-only";
import { ApiError, unavailable } from "./errors";

// Small, testable boundary; production supplies Supabase's network-verified getUser.
export interface IdentityVerifier {
  getUser(
    token: string,
  ): Promise<{
    data: { user: { id: string } | null };
    error: { status?: number } | null;
  }>;
  isOwner(): Promise<{ data: boolean | null; error: unknown }>;
}
export async function authorizeOwner(
  token: string,
  verifier: IdentityVerifier,
) {
  const identity = await verifier.getUser(token);
  if (identity.error) {
    if (
      identity.error.status === 401 ||
      identity.error.status === 403 ||
      identity.error.status === 400
    )
      throw new ApiError(401, "authentication_required");
    throw unavailable();
  }
  if (!identity.data.user) throw new ApiError(401, "authentication_required");
  const owner = await verifier.isOwner();
  if (owner.error) throw unavailable();
  if (owner.data !== true) throw new ApiError(403, "owner_access_required");
}
