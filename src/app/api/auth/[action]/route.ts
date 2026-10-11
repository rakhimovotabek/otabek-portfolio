import { authCookies } from "@/lib/auth/cookies";
import { createAuthHandler } from "@/lib/auth/handlers";
import { performAuth } from "@/lib/auth/gateway";
import { checkOrigin } from "@/lib/backend/protection";
export const runtime = "nodejs";
export async function POST(
  request: Request,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  return createAuthHandler({
    cookies: await authCookies(),
    origin: checkOrigin,
    perform: performAuth,
  })(request, action);
}
