import { withApiAuth } from "@/lib/api-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getAgentMetrics } from "@/app/actions/dashboard";
import { hasRole } from "@/lib/api-rbac";

export const GET = withApiAuth(async (req, user) => {
  if (!hasRole(user, ["admin", "agent"])) {
    return unauthorizedResponse("Agent access required.");
  }
  const metrics = await getAgentMetrics();
  return successResponse(metrics);
});
