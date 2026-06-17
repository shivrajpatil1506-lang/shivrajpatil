import { withApiAuth } from "@/lib/api-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getHRMetrics } from "@/app/actions/dashboard";
import { hasRole } from "@/lib/api-rbac";

export const GET = withApiAuth(async (req, user) => {
  if (!hasRole(user, ["admin", "hr"])) {
    return unauthorizedResponse("HR access required.");
  }
  const metrics = await getHRMetrics();
  return successResponse(metrics);
});
