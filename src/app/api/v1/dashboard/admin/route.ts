import { withApiAuth } from "@/lib/api-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getAdminMetrics } from "@/app/actions/dashboard";
import { hasRole } from "@/lib/api-rbac";

export const GET = withApiAuth(async (req, user) => {
  if (!hasRole(user, ["admin"])) {
    return unauthorizedResponse("Admin access required.");
  }
  const metrics = await getAdminMetrics();
  return successResponse(metrics);
});
