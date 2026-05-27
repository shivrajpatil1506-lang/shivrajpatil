"use client";

import AppShell from "@/components/layout/AppShell";
import { ADMIN_NAV } from "@/lib/constants";
import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/companies": "Companies",
  "/sites": "Sites",
  "/customers": "Customers",
  "/employees": "Employees",
  "/agents": "Agents",
  "/transactions": "Transactions",
  "/reports": "Reports",
  "/approvals": "Approvals",
  "/my-work": "My Work",
  "/settings": "Settings",
};

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const baseRoute = "/" + (pathname.split("/")[1] || "dashboard");
  const title = titleMap[baseRoute] || "GB Infra";

  return (
    <AppShell navItems={ADMIN_NAV} title={title}>
      {children}
    </AppShell>
  );
}
