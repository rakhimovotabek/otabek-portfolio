import { communityFeatures } from "@/lib/backend/features";
import { jsonResponse } from "@/lib/backend/http";
export const dynamic = "force-dynamic";
export function GET() {
  return jsonResponse(communityFeatures());
}
