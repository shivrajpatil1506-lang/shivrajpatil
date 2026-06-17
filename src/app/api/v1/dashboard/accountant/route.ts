import { withApiAuth } from "@/lib/api-handler";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";
import { getAccountantMetrics } from "@/app/actions/dashboard";
import { hasRole } from "@/lib/api-rbac";

export const GET = withApiAuth(async (req, user) => {
  if (!hasRole(user, ["admin", "accountant"])) {
    return unauthorizedResponse("Accountant access required.");
  }
  const metrics = await getAccountantMetrics();
  return successResponse(metrics);
});
