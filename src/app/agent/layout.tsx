import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgentLayoutClient from "./AgentLayoutClient";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "agent") {
    redirect("/");
  }

  return <AgentLayoutClient>{children}</AgentLayoutClient>;
}
