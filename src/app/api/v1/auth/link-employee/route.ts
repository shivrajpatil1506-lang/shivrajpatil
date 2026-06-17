import { withPublicApi } from "@/lib/api-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/lib/db";

export const POST = withPublicApi(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return errorResponse("Missing or invalid token", 401);
  }

  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken, true);
    if (!decodedClaims.email) {
      return errorResponse("Token does not contain email", 400);
    }
    
    // Check if the email exists in our employee database
    const employee = await db.employee.findFirst({
      where: {
        OR: [
          { work_email: { equals: decodedClaims.email, mode: "insensitive" } },
          { personal_email: { equals: decodedClaims.email, mode: "insensitive" } }
        ],
        is_deleted: false,
        status: "active"
      }
    });

    if (!employee) {
      return errorResponse("Your email is not registered as an employee. Please contact HR.", 403);
    }

    // Check if another active user is already linked
    const existingLink = await db.employee.findFirst({
      where: {
        auth_uid: decodedClaims.uid,
        id: { not: employee.id },
        is_deleted: false
      }
    });

    if (existingLink) {
      return errorResponse("This account is already linked to another employee.", 403);
    }

    // Link the account
    await db.employee.update({
      where: { id: employee.id },
      data: { auth_uid: decodedClaims.uid }
    });

    return successResponse({ success: true, message: "Account linked successfully" });

  } catch (error) {
    console.error("Link employee failed:", error);
    return errorResponse("Failed to link account. Invalid token.", 401);
  }
});
