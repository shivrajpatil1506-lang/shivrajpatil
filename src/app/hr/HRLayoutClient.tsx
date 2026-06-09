"use client";

import AppShell from "@/components/layout/AppShell";
import { HR_NAV } from "@/lib/constants";
import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/agents": "Agents",
  "/my-work": "My Work",
  "/salary": "Salary",
};

export default function HRLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const baseRoute = "/" + (pathname.split("/")[2] || "dashboard");
  const title = titleMap[baseRoute] || "HR Portal";

  return <AppShell navItems={HR_NAV} title={title}>{children}</AppShell>;
}
