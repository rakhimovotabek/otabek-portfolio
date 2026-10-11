import { handlers } from "@/lib/backend/runtime";
export const runtime = "nodejs";
export const POST = handlers.submitComment;
export const GET = handlers.approvedComments;
