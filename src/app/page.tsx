import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Route the user based on their portal role
  if (user.role === "hr") {
    redirect("/hr/dashboard");
  } else if (user.role === "accountant") {
    redirect("/accountant/dashboard");
  } else if (user.role === "agent") {
    redirect("/agent/dashboard");
  }
  
  // Default (Admin) goes here
  redirect("/dashboard");
}
