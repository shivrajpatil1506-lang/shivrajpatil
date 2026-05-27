import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import HRLayoutClient from "./HRLayoutClient";

export default async function HRLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "hr") {
    redirect("/");
  }

  return <HRLayoutClient>{children}</HRLayoutClient>;
}
