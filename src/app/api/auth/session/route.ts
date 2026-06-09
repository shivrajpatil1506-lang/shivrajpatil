import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Set session expiration to 5 days (in ms)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie using firebase-admin
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set the cookie via next/headers
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // Clear caches so the newly logged-in user gets perfectly fresh data initially
    revalidateTag('companies');
    revalidateTag('sites');
    revalidateTag('customers');
    revalidateTag('employees');
    revalidateTag('transactions');
    revalidateTag('dashboard');

    return NextResponse.json({ status: "success", uid: decodedToken.uid });
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
