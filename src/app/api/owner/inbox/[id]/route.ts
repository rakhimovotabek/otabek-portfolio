import { handlers } from "@/lib/backend/runtime";
export const runtime = "nodejs";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return handlers.updateMessage(request, id);
}
