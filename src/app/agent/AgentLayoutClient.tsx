"use client";

import AppShell from "@/components/layout/AppShell";
import { AGENT_NAV } from "@/lib/constants";
import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/sales": "Sales",
  "/my-work": "My Work",
};

export default function AgentLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const baseRoute = "/" + (pathname.split("/")[2] || "dashboard");
  const title = titleMap[baseRoute] || "Agent Portal";

  return <AppShell navItems={AGENT_NAV} title={title}>{children}</AppShell>;
}
