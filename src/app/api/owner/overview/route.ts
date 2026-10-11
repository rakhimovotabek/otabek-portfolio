import { handlers } from "@/lib/backend/runtime";
import { ownerRequest } from "@/lib/auth/owner-request";
export const runtime = "nodejs";
export const GET = (request: Request) =>
  ownerRequest(request, handlers.overview);
