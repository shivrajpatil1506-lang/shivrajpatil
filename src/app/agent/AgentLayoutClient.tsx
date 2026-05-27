"use client";

import AppShell from "@/components/layout/AppShell";
import { AGENT_NAV } from "@/lib/constants";

export default function AgentLayoutClient({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={AGENT_NAV} title="Agent Portal">{children}</AppShell>;
}
