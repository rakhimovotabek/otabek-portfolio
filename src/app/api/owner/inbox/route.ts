import { ownerRequest } from "@/lib/auth/owner-request";
import { handlers } from "@/lib/backend/runtime";
export const runtime = "nodejs";
export const GET = (request: Request) => ownerRequest(request, handlers.inbox);
