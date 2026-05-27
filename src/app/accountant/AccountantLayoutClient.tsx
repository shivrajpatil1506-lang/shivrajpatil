"use client";

import AppShell from "@/components/layout/AppShell";
import { ACCOUNTANT_NAV } from "@/lib/constants";

export default function AccountantLayoutClient({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={ACCOUNTANT_NAV} title="Accountant Portal">{children}</AppShell>;
}
