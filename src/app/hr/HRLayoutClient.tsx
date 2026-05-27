"use client";

import AppShell from "@/components/layout/AppShell";
import { HR_NAV } from "@/lib/constants";

export default function HRLayoutClient({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={HR_NAV} title="HR Portal">{children}</AppShell>;
}
