"use client";

import AppShell from "@/components/layout/AppShell";
import { ACCOUNTANT_NAV } from "@/lib/constants";
import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/transactions": "Transactions",
  "/my-work": "My Work",
  "/reports": "Reports",
  "/accounting": "Accounting",
};

export default function AccountantLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const baseRoute = "/" + (pathname.split("/")[2] || "dashboard");
  const title = titleMap[baseRoute] || "Accountant Portal";

  return <AppShell navItems={ACCOUNTANT_NAV} title={title}>{children}</AppShell>;
}
