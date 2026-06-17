import { withApiAuth } from "@/lib/api-handler";
import { successResponse } from "@/lib/api-response";

export const POST = withApiAuth(async (req, user) => {
  return successResponse({
    user: {
      uid: user.uid,
      email: user.email,
      role: user.role,
      name: user.name,
      company_id: user.company_id,
      is_main_company: user.is_main_company,
      employee_id: user.employee_id
    }
  });
});
